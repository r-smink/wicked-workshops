import "server-only";

import { directusFetch, directusUpdate } from "@/lib/directus";
import type { PlatformSettings } from "@/lib/directus/settings";
import { releaseSeats } from "@/lib/seats";
import { shouldRefundSession, shouldSettleSession } from "@/lib/rules/escrow";
import { closeSessionForBookings, openComplaint, refundOffer } from "./actions";
import { loadBookingById, loadBookings, SESSION_FIELDS, type FullSession } from "./load";
import * as mail from "@/lib/mail/notify";
import { sendMail } from "@/lib/mail/send";
import { workshopChanges, workshopLive } from "@/mail/templates";

/* De stappen van /api/cron/escrow. Elke stap is veilig om vaak te draaien:
   statussen bewaken wat al gedaan is, mail_log bewaakt de mails. */

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const iso = (ms: number) => new Date(ms).toISOString();
const list = <T,>(rows: unknown): T[] => (Array.isArray(rows) ? rows : rows ? [rows as T] : []);

type DecisionSession = FullSession & {
  id: string;
  workshop: {
    id: string; title: string;
    provider: { first_name: string | null; user: { email: string | null; first_name: string | null } | null } | null;
  };
};

const DECISION_FIELDS = [
  ...SESSION_FIELDS.filter((f) => f !== "workshop"),
  "workshop.id", "workshop.title", "workshop.provider.first_name", "workshop.provider.user.email", "workshop.provider.user.first_name",
].join(",");

/* ---------- A. minimum en beslismoment (docs/05 §2) ---------- */

export async function handleDecisions(settings: PlatformSettings, now: number) {
  const result = { confirmed: 0, notHappening: 0, offers: 0, refunds: 0, failed: 0 };
  /* Alle datums die nog verzamelen: "minimum gehaald, op welk moment dan
     ook" betekent dat we niet alleen op het beslismoment kijken. */
  const sessions = list<DecisionSession>(await directusFetch(
    `/items/workshop_sessions?filter[state][_eq]=open&filter[starts_at][_gte]=${iso(now - DAY)}&fields=${DECISION_FIELDS}&limit=500`,
    { noCache: true },
  ));

  for (const session of sessions) {
    const reached = !session.min_participants || (session.seats_taken ?? 0) >= session.min_participants || session.provider_override;
    if (reached) {
      await directusUpdate("workshop_sessions", session.id, { state: "confirmed", goes_ahead: true, confirmed_at: iso(now) });
      result.confirmed += 1;
      if (session.min_participants) {
        for (const b of await loadBookings(`filter[session][_eq]=${session.id}&filter[status][_eq]=confirmed`)) {
          await mail.mailSessionConfirmed(b);
        }
        await mail.mailProviderDecision(session, session.workshop, { goesAhead: true, graceUntil: null });
      }
      continue;
    }

    const decisionMs = session.decision_at ? new Date(session.decision_at).getTime() : null;
    if (decisionMs == null || now < decisionMs) continue;

    /* Beslismoment voorbij, minimum niet gehaald: de workshopgever hoort het
       meteen en kan binnen de grace period nog "gaat toch door" zeggen. */
    await mail.mailProviderDecision(session, session.workshop, {
      goesAhead: false,
      graceUntil: settings.decisionGraceHours > 0 ? iso(decisionMs + settings.decisionGraceHours * HOUR) : null,
    });
    if (!shouldRefundSession(session, settings.decisionGraceHours, now)) continue;

    await directusUpdate("workshop_sessions", session.id, { state: "not_happening", goes_ahead: false, closed_at: iso(now) });
    result.notHappening += 1;
    const r = await closeSessionForBookings(session, { kind: "not_happening", reason: null, settings });
    result.offers += r.offers;
    result.refunds += r.refunds;
    result.failed += r.failed;
  }
  return result;
}

/* ---------- B. afgerond na de escrowdatum ---------- */

/* Een aanmelding is afgehandeld als de workshop voorbij is, de escrowdatum
   verstreken is (het geld is vrij bij OPP) en er geen klacht openstaat. */
export async function handleCompleted(settings: PlatformSettings, now: number) {
  let count = 0;
  const due = list<{ id: string }>(await directusFetch(
    `/items/bookings?filter[status][_eq]=confirmed&filter[escrow_until][_lte]=${iso(now)}&fields=id&limit=200`,
    { noCache: true },
  ));
  for (const b of due) {
    if (await openComplaint(b.id)) continue;
    await directusUpdate("bookings", b.id, { status: "completed" });
    count += 1;
  }

  /* Oudere aanmeldingen zonder escrow_until: per datum, zoals voorheen. */
  const delayHours = settings.settlementDelayHours ?? 0;
  const sessions = list<{ id: string; state: string; ends_at: string }>(await directusFetch(
    `/items/workshop_sessions?filter[state][_in]=open,confirmed&filter[ends_at][_lte]=${iso(now - delayHours * HOUR)}&filter[closed_at][_null]=true&fields=id,state,ends_at&limit=100`,
    { noCache: true },
  ));
  for (const session of sessions) {
    if (!shouldSettleSession({ ...session, state: "confirmed" }, delayHours, now)) continue;
    const legacy = list<{ id: string }>(await directusFetch(
      `/items/bookings?filter[session][_eq]=${session.id}&filter[status][_eq]=confirmed&filter[escrow_until][_null]=true&fields=id&limit=-1`,
      { noCache: true },
    ));
    for (const b of legacy) {
      if (await openComplaint(b.id)) continue;
      await directusUpdate("bookings", b.id, { status: "completed" });
      count += 1;
    }
    await directusUpdate("workshop_sessions", session.id, { closed_at: iso(now) });
  }
  return count;
}

/* ---------- C. verlopen checkouts ---------- */

export async function handleExpiredCheckouts(now: number) {
  let count = 0;
  const bookings = list<{ id: string; session: string; participants: number }>(await directusFetch(
    `/items/bookings?filter[status][_eq]=awaiting_payment&filter[hold_expires_at][_lte]=${iso(now)}&fields=id,session,participants&limit=100`,
    { noCache: true },
  ));
  for (const booking of bookings) {
    await directusUpdate("bookings", booking.id, { status: "expired", payment_status: "expired" });
    await releaseSeats(booking.session, booking.participants || 1);
    count += 1;
  }
  return count;
}

/* ---------- D. verlopen aanbiedingen (docs/05 §7) ---------- */

export async function handleExpiredOffers(now: number) {
  let count = 0;
  const offers = list<{ id: string; booking: string }>(await directusFetch(
    `/items/session_offers?filter[status][_eq]=pending&filter[expires_at][_lte]=${iso(now)}&fields=id,booking&limit=100`,
    { noCache: true },
  ));
  for (const offer of offers) {
    const b = await loadBookingById(offer.booking);
    if (!b) continue;
    const r = await refundOffer(b, { expired: true });
    if (r.ok) count += 1;
    else await directusUpdate("session_offers", offer.id, { status: "expired" });
  }
  return count;
}

/* ---------- E. herinneringen ---------- */

const REMINDER_WINDOW = 3 * HOUR;

export async function handleReminders(settings: PlatformSettings, now: number) {
  const result = { decision: 0, start: 0 };

  /* Voor het beslismoment, aan iedereen op een datum die nog verzamelt.
     Alleen binnen een venster na het moment zelf, zodat een datum die pas
     later is aangemaakt geen achterhaalde herinnering krijgt. */
  const maxHours = Math.max(0, ...settings.reminderHoursBeforeDecision);
  if (maxHours > 0) {
    const bookings = await loadBookings(
      `filter[status][_eq]=confirmed&filter[session][state][_eq]=open&filter[session][decision_at][_gt]=${iso(now)}&filter[session][decision_at][_lte]=${iso(now + maxHours * HOUR)}`,
      300,
    );
    for (const b of bookings) {
      if (b.customer?.notify_reminder_decision === false) continue;
      const decision = new Date(b.session.decision_at || 0).getTime();
      for (const hours of settings.reminderHoursBeforeDecision) {
        const due = decision - hours * HOUR;
        if (now >= due && now < due + REMINDER_WINDOW) {
          if ((await mail.mailReminderDecision(b, hours)) === "sent") result.decision += 1;
        }
      }
    }
  }

  /* Voor de start, met adres. Niet aan wie net heeft geboekt. */
  const startHours = settings.startReminderHours;
  if (startHours > 0) {
    const bookings = await loadBookings(
      `filter[status][_eq]=confirmed&filter[session][starts_at][_gt]=${iso(now)}&filter[session][starts_at][_lte]=${iso(now + startHours * HOUR)}`,
      300,
    );
    for (const b of bookings) {
      const goesAhead = b.session.state === "confirmed" || b.session.goes_ahead || !b.session.min_participants;
      const fresh = b.date_created && now - new Date(b.date_created).getTime() < 2 * HOUR;
      if (!goesAhead || fresh) continue;
      if ((await mail.mailReminderStart(b)) === "sent") result.start += 1;
    }
  }
  return result;
}

/* ---------- F. uitnodiging voor een review (docs/05 §8) ---------- */

export async function handleReviewInvites(settings: PlatformSettings, now: number) {
  let count = 0;
  const after = settings.reviewInviteHoursAfter * HOUR;
  const bookings = await loadBookings(
    `filter[status][_in]=confirmed,completed&filter[review_requested_at][_null]=true&filter[review_written_at][_null]=true` +
      `&filter[session][ends_at][_lte]=${iso(now - after)}&filter[session][ends_at][_gte]=${iso(now - after - 7 * DAY)}`,
    200,
  );
  for (const b of bookings) {
    await mail.mailReviewInvite(b);
    await directusUpdate("bookings", b.id, { review_requested_at: iso(now) });
    count += 1;
  }
  return count;
}

/* ---------- G. check door het team (docs/05 §9) ---------- */

type ReviewedWorkshop = {
  id: string; title: string; slug: string | null; review_note: string | null; date_updated: string | null;
  provider: { first_name: string | null; user: { email: string | null; first_name: string | null } | null } | null;
};

export async function handleWorkshopChecks(now: number) {
  const result = { live: 0, changes: 0 };
  const SITE = mail.SITE;
  const fields = "id,title,slug,review_note,date_updated,provider.first_name,provider.user.email,provider.user.first_name";

  /* Pas gepubliceerd: "Je workshop staat online". Alleen recente, zodat de
     eerste keer draaien geen oude workshops mailt. */
  const live = list<ReviewedWorkshop>(await directusFetch(
    `/items/workshops?filter[status][_eq]=published&filter[published_at][_gte]=${iso(now - 3 * DAY)}&fields=${fields}&limit=100`,
    { noCache: true },
  ));
  for (const w of live) {
    const r = await sendMail("workshop_live", w.id, w.provider?.user?.email, workshopLive({
      firstName: w.provider?.first_name || w.provider?.user?.first_name,
      workshopTitle: w.title,
      url: w.slug ? `${SITE}/workshop/${w.slug}` : `${SITE}/dashboard`,
    }));
    if (r === "sent") result.live += 1;
  }

  /* Teruggezet naar concept met een opmerking van het team. */
  const back = list<ReviewedWorkshop>(await directusFetch(
    `/items/workshops?filter[status][_eq]=draft&filter[review_note][_nnull]=true&filter[date_updated][_gte]=${iso(now - 3 * DAY)}&fields=${fields}&limit=100`,
    { noCache: true },
  ));
  for (const w of back) {
    if (!w.review_note?.trim()) continue;
    const r = await sendMail("workshop_changes", `${w.id}:${hashNote(w.review_note)}`, w.provider?.user?.email, workshopChanges({
      firstName: w.provider?.first_name || w.provider?.user?.first_name,
      workshopTitle: w.title,
      note: w.review_note,
      url: `${SITE}/dashboard/workshops/${w.id}/bewerken`,
    }));
    if (r === "sent") result.changes += 1;
  }
  return result;
}

/* Korte, stabiele hash: een nieuwe opmerking is een nieuwe mail. */
function hashNote(note: string): string {
  let h = 0;
  for (let i = 0; i < note.length; i++) h = (h * 31 + note.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
