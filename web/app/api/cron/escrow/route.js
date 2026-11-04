import { NextResponse } from "next/server";
import { isDirectusConfigured, directusFetch, directusUpdate } from "@/lib/directus";
import { getPlatformSettings } from "@/lib/directus/settings";
import { shouldRefundSession, shouldSettleSession } from "@/lib/rules/escrow";
import { refundPayment } from "@/lib/payment";
import { releaseSeats } from "@/lib/seats";

export const dynamic = "force-dynamic";

/* GET of POST /api/cron/escrow, elke 5 tot 10 minuten (zie
   .github/workflows/cron.yml). Alleen met Authorization: Bearer CRON_SECRET;
   zonder ingesteld geheim draait er niets.

   A. Beslismoment: minimum gehaald -> datum gaat door. Niet gehaald (en
      geen "gaat toch door" binnen de grace period) -> datum gaat niet door,
      aanmeldingen vervallen en betalingen worden terugbetaald.
   B. Na de workshop plus wachttijd: aanmeldingen op afgerond. Het geld komt
      vanzelf vrij bij OPP op de escrow_date van de transactie.
   C. Verlopen checkouts: onbetaalde aanmeldingen vervallen, plekken terug. */
export async function GET(request) {
  return run(request);
}

export async function POST(request) {
  return run(request);
}

async function run(request) {
  const secret = process.env.CRON_SECRET || "";
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }
  if (!isDirectusConfigured) {
    return NextResponse.json({ error: "Directus is niet geconfigureerd" }, { status: 503 });
  }

  const settings = await getPlatformSettings({ fresh: true });
  const now = Date.now();

  const results = {
    decided: await handleDecisions(settings, now),
    completed: await handleCompleted(settings, now),
    expired: await handleExpiredCheckouts(now),
  };

  return NextResponse.json({ ok: true, ...results });
}

const iso = (ms) => new Date(ms).toISOString();

/* ---------- A. Beslismoment ---------- */

async function handleDecisions(settings, now) {
  const result = { confirmed: 0, notHappening: 0, refunds: 0 };

  const sessions = await directusFetch(
    `/items/workshop_sessions?filter[state][_eq]=open&filter[decision_at][_lte]=${iso(now)}&fields=id,state,min_participants,seats_taken,decision_at,goes_ahead,provider_override&limit=100`,
    { noCache: true }
  );
  if (!Array.isArray(sessions)) return result;

  for (const session of sessions) {
    const reached = !session.min_participants || (session.seats_taken ?? 0) >= session.min_participants;
    if (reached) {
      await directusUpdate("workshop_sessions", session.id, { state: "confirmed", goes_ahead: true, confirmed_at: iso(now) });
      result.confirmed += 1;
      continue;
    }
    if (!shouldRefundSession(session, settings.decisionGraceHours, now)) continue;

    await directusUpdate("workshop_sessions", session.id, { state: "not_happening", goes_ahead: false, closed_at: iso(now) });
    result.notHappening += 1;

    const bookings = await directusFetch(
      `/items/bookings?filter[session][_eq]=${session.id}&filter[status][_in]=confirmed,awaiting_payment&fields=id,status,payment_status,payment_env,opp_transaction_uid&limit=-1`,
      { noCache: true }
    );
    for (const booking of Array.isArray(bookings) ? bookings : []) {
      const updates = { status: "session_cancelled", cancelled_at: iso(now), cancelled_by: "wicked" };
      if (booking.payment_status === "paid" && booking.opp_transaction_uid && booking.payment_env) {
        const refund = await refundPayment(booking.payment_env, booking.opp_transaction_uid, {
          message: "De workshop gaat niet door: het minimum aantal deelnemers is niet gehaald. Je krijgt het volledige bedrag terug.",
          internalReason: "minimum_not_reached",
          idempotencyKey: `decision-${booking.id}`,
        });
        updates.refund_status = refund ? "pending" : "failed";
        if (refund?.uid) updates.opp_refund_uid = refund.uid;
        result.refunds += 1;
      }
      await directusUpdate("bookings", booking.id, updates);
    }
    /* Mails en session_offers volgen met het mailsysteem (fase 2). */
  }

  return result;
}

/* ---------- B. Afgerond na de workshop ---------- */

async function handleCompleted(settings, now) {
  let count = 0;
  const delayHours = settings.settlementDelayHours ?? 0;
  const cutoff = iso(now - delayHours * 60 * 60 * 1000);

  const sessions = await directusFetch(
    `/items/workshop_sessions?filter[state][_in]=open,confirmed&filter[ends_at][_lte]=${cutoff}&filter[closed_at][_null]=true&fields=id,state,ends_at&limit=100`,
    { noCache: true }
  );
  if (!Array.isArray(sessions)) return count;

  for (const session of sessions) {
    if (!shouldSettleSession({ ...session, state: "confirmed" }, delayHours, now)) continue;
    const bookings = await directusFetch(
      `/items/bookings?filter[session][_eq]=${session.id}&filter[status][_eq]=confirmed&fields=id&limit=-1`,
      { noCache: true }
    );
    for (const booking of Array.isArray(bookings) ? bookings : []) {
      await directusUpdate("bookings", booking.id, { status: "completed" });
      count += 1;
    }
    await directusUpdate("workshop_sessions", session.id, { closed_at: iso(now) });
  }

  return count;
}

/* ---------- C. Verlopen checkouts ---------- */

async function handleExpiredCheckouts(now) {
  let count = 0;
  const bookings = await directusFetch(
    `/items/bookings?filter[status][_eq]=awaiting_payment&filter[hold_expires_at][_lte]=${iso(now)}&fields=id,session,participants&limit=100`,
    { noCache: true }
  );
  if (!Array.isArray(bookings)) return count;

  for (const booking of bookings) {
    await directusUpdate("bookings", booking.id, { status: "expired", payment_status: "expired" });
    await releaseSeats(booking.session, booking.participants || 1);
    count += 1;
  }
  return count;
}
