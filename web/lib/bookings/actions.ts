import "server-only";

import { randomBytes } from "crypto";
import { directusCreate, directusFetch, directusUpdate } from "@/lib/directus";
import { refundPayment, updateEscrow } from "@/lib/payment";
import { releaseSeats, reserveSeats } from "@/lib/seats";
import { centsToDecimal } from "@/lib/directus/model";
import type { PlatformSettings } from "@/lib/directus/settings";
import {
  canCancel, canMarkNoShow, canReview, cancellationQuote, complaintWindowOpen, escrowUntilFor, freeUntil, laterOf,
  nextRating, offerExpiresAt, pickOfferSession, rescheduleTargets, resolvePolicy,
} from "@/lib/rules/booking-rules";
import { newAccessNonce } from "./access";
import {
  loadBookingById, loadBookings, loadWorkshopSessions, paidCents, unitPriceOf, type FullBooking, type FullSession,
} from "./load";
import * as mail from "@/lib/mail/notify";

/* ===========================================================================
   Wat er met een aanmelding kan gebeuren na het boeken (docs/05 §4-8).
   Routes en cron roepen deze functies aan; de regels zelf staan puur in
   lib/rules/booking-rules.ts.

   Geld: Wicked raakt het nooit aan. Terugbetalen gaat via een OPP-refund op
   de transactie; vasthouden en vrijgeven via de escrowdatum.
   =========================================================================== */

export type ActionResult<T = object> = ({ ok: true } & T) | { ok: false; status: number; error: string };
const fail = (status: number, error: string) => ({ ok: false as const, status, error });
const nowIso = () => new Date().toISOString();
const HOUR = 60 * 60 * 1000;

export function newBookingCode(): string {
  return `WW-${randomBytes(4).toString("hex").slice(0, 6).toUpperCase()}`;
}

/* ---------- geld ---------- */

/* Betaalt (een deel) terug via OPP. amountCents null = wat er nog over is.
   Geeft de velden terug die op de aanmelding horen. Zonder betaling (pilot
   met payment_mode off) is er niets terug te betalen. */
export async function refundBooking(
  b: FullBooking,
  { amountCents = null, key, message, reason }: { amountCents?: number | null; key: string; message: string; reason: string },
): Promise<{ ok: boolean; refundCents: number; updates: Record<string, unknown> }> {
  const paid = paidCents(b);
  const already = Math.round(Number(b.refund_amount || 0) * 100);
  const left = Math.max(0, paid - already);
  const amount = Math.min(left, amountCents ?? left);
  if (amount <= 0) return { ok: true, refundCents: 0, updates: {} };
  if (!b.opp_transaction_uid || !b.payment_env) return { ok: false, refundCents: 0, updates: { refund_status: "failed" } };

  const refund = await refundPayment(b.payment_env, b.opp_transaction_uid, {
    amountCents: amount >= paid ? null : amount,
    message,
    internalReason: reason,
    idempotencyKey: key,
  });
  return {
    ok: Boolean(refund),
    refundCents: refund ? amount : 0,
    updates: refund
      ? { refund_status: "pending", refund_amount: centsToDecimal(already + amount), ...(refund.uid ? { opp_refund_uid: refund.uid } : {}) }
      : { refund_status: "failed" },
  };
}

/* Zet de escrowdatum bij OPP en op de aanmelding. Zonder transactie (geen
   betaling) alleen op de aanmelding. */
export async function setEscrow(b: FullBooking, until: string): Promise<boolean> {
  if (b.opp_transaction_uid && b.payment_env && b.payment_status === "paid") {
    const ok = await updateEscrow(b.payment_env, b.opp_transaction_uid, new Date(until));
    if (!ok) return false;
  }
  await directusUpdate("bookings", b.id, { escrow_until: until });
  b.escrow_until = until;
  return true;
}

/* ---------- annuleren door de deelnemer (§5) ---------- */

export async function cancelByCustomer(b: FullBooking, settings: PlatformSettings): Promise<ActionResult<{ refundCents: number }>> {
  if (!canCancel(b)) return fail(409, "Deze aanmelding kun je niet meer annuleren.");
  const quote = cancellationQuote({
    policy: resolvePolicy(b.workshop.cancellation_policy),
    startsAt: b.session.starts_at,
    paidCents: paidCents(b),
    pilotFullRefund: settings.pilotFullRefundOnCancel,
  });
  const refund = await refundBooking(b, {
    amountCents: quote.refundCents,
    key: `cancel-${b.id}`,
    message: "Je hebt je aanmelding geannuleerd.",
    reason: "cancelled_by_customer",
  });
  await directusUpdate("bookings", b.id, {
    status: "cancelled_by_customer",
    cancelled_at: nowIso(),
    cancelled_by: "customer",
    cancel_fee_percent: quote.feePercent,
    ...refund.updates,
  });
  await releaseSeats(b.session.id, b.participants);
  await mail.mailBookingCancelled(b, refund.refundCents);
  return { ok: true, refundCents: refund.refundCents };
}

/* ---------- verzetten (§4) en een aanbod aannemen (§7) ---------- */

const COPY_FIELDS = [
  "guest_name", "guest_email", "guest_phone", "first_name", "last_initial", "participants", "dietary_notes", "question",
  "unit_price", "subtotal", "service_fee", "discount", "total", "workshop", "provider", "customer", "payment_id",
  "payment_status", "payment_env", "opp_transaction_uid", "paid_at",
];

export async function moveBooking(
  b: FullBooking,
  targetId: string,
  settings: PlatformSettings,
  { viaOffer = false }: { viaOffer?: boolean } = {},
): Promise<ActionResult<{ booking: FullBooking }>> {
  const sessions = await loadWorkshopSessions(b.workshop.id);
  const target = sessions.find((s) => s.id === targetId);
  const options = rescheduleTargets(sessions, { currentId: b.session.id, participants: b.participants, unitPrice: unitPriceOf(b) });
  if (!target || !options.some((s) => s.id === targetId)) {
    return fail(409, "Deze datum kun je niet kiezen. Hij is vol, voorbij of heeft een andere prijs.");
  }
  if (!(await reserveSeats(target.id, b.participants))) return fail(409, "Deze datum is net vol geraakt. Kies een andere.");

  const raw = await directusFetch(`/items/bookings/${b.id}?fields=${COPY_FIELDS.join(",")}`, { noCache: true });
  const copy = Object.fromEntries(COPY_FIELDS.map((f) => [f, raw?.[f] ?? null]));
  const policy = resolvePolicy(b.workshop.cancellation_policy);
  const escrowUntil = laterOf(b.escrow_until, escrowUntilFor(target.ends_at, target.starts_at, settings.settlementDelayHours));

  const created = await directusCreate("bookings", {
    ...copy,
    status: "confirmed",
    booking_code: newBookingCode(),
    session: target.id,
    moved_from: b.id,
    access_token: newAccessNonce(),
    cancellation_deadline: freeUntil(policy, target.starts_at),
    escrow_until: escrowUntil,
    refund_status: "none",
  });
  if (!created?.id) {
    await releaseSeats(target.id, b.participants);
    return fail(500, "Verzetten lukte niet. Probeer het opnieuw.");
  }

  const wasActive = b.status === "confirmed";
  await directusUpdate("bookings", b.id, viaOffer ? { status: "moved" } : { status: "moved", cancelled_at: nowIso(), cancelled_by: "customer" });
  if (wasActive) await releaseSeats(b.session.id, b.participants);

  const moved = await loadBookingById(created.id);
  if (moved && escrowUntil && escrowUntil !== b.escrow_until) {
    const ok = await setEscrow(moved, escrowUntil);
    if (!ok) console.error(`Escrow van ${moved.booking_code} niet verschoven; controleer bij OPP.`);
  }
  if (moved) await mail.mailBookingMoved(moved, b.session.starts_at);
  if (!viaOffer) await closeOpenOffers(b.id, "declined");
  return moved ? { ok: true, booking: moved } : fail(500, "Verzet, maar de nieuwe aanmelding is niet te laden.");
}

/* ---------- datum gaat niet door of wordt geannuleerd (§2, §6, §7) ---------- */

type SessionWithWorkshop = FullSession & { id: string };

/* Voor elke aanmelding op een datum die niet doorgaat: een andere datum
   aanbieden als die er is (escrow schuift mee), anders alles terug. */
export async function closeSessionForBookings(
  session: SessionWithWorkshop,
  { kind, reason, settings }: { kind: "provider" | "not_happening"; reason: string | null; settings: PlatformSettings },
): Promise<{ offers: number; refunds: number; failed: number }> {
  const result = { offers: 0, refunds: 0, failed: 0 };
  const bookings = await loadBookings(
    `filter[session][_eq]=${encodeURIComponent(session.id)}&filter[status][_in]=confirmed,awaiting_payment`,
  );
  const workshopId = bookings[0]?.workshop.id;
  const sessions = workshopId ? await loadWorkshopSessions(workshopId) : [];
  const now = Date.now();
  const cancelledBy = kind === "provider" ? "provider" : "wicked";

  for (const b of bookings) {
    const updates: Record<string, unknown> = { status: "session_cancelled", cancelled_at: nowIso(), cancelled_by: cancelledBy };
    if (b.status === "awaiting_payment") {
      /* Komt de betaling later alsnog binnen, dan betaalt de webhook terug. */
      await directusUpdate("bookings", b.id, updates);
      continue;
    }

    let offer: { startsAt: string | null; expiresAt: string } | null = null;
    const pick = pickOfferSession(sessions, {
      currentId: session.id, participants: b.participants, unitPrice: unitPriceOf(b), now, minHoursAhead: settings.offerMinHoursAhead,
    });
    if (pick?.starts_at) {
      const expiresAt = offerExpiresAt(pick.starts_at, { expiresDaysBefore: settings.offerExpiresDaysBefore, now });
      const hold = laterOf(b.escrow_until, escrowUntilFor(pick.ends_at, pick.starts_at, settings.settlementDelayHours));
      /* Zonder langere escrow kan het geld vrijkomen voordat de deelnemer
         kiest. Lukt verlengen niet, dan liever meteen terugbetalen. */
      if (hold && (await setEscrow(b, hold))) {
        const created = await directusCreate("session_offers", {
          booking: b.id, offered_session: pick.id, status: "pending", expires_at: expiresAt,
        });
        if (created?.id) offer = { startsAt: pick.starts_at, expiresAt };
      }
    }

    let refundCents = 0;
    if (offer) {
      result.offers += 1;
    } else {
      const refund = await refundBooking(b, {
        key: `${kind}-${b.id}`,
        message: kind === "provider"
          ? "De workshopgever heeft deze datum geannuleerd. Je krijgt het volledige bedrag terug."
          : "De workshop gaat niet door: het minimum aantal deelnemers is niet gehaald. Je krijgt het volledige bedrag terug.",
        reason: kind === "provider" ? "cancelled_by_provider" : "minimum_not_reached",
      });
      Object.assign(updates, refund.updates);
      refundCents = refund.refundCents;
      if (refund.refundCents > 0) result.refunds += 1;
      if (!refund.ok) result.failed += 1;
    }
    await directusUpdate("bookings", b.id, updates);

    if (kind === "provider") await mail.mailSessionCancelled(b, offer, refundCents, reason);
    else await mail.mailSessionNotHappening(b, offer, refundCents);
  }
  return result;
}

/* ---------- reactie op een aanbod ---------- */

export type OfferRow = { id: string; booking: string; offered_session: string; status: string; expires_at: string | null };

export async function pendingOffer(bookingId: string): Promise<OfferRow | null> {
  const row = await directusFetch(
    `/items/session_offers?filter[booking][_eq]=${encodeURIComponent(bookingId)}&filter[status][_eq]=pending&fields=id,booking,offered_session,status,expires_at&sort=-date_created&limit=1`,
    { noCache: true },
  );
  return row && typeof row === "object" && !Array.isArray(row) ? (row as OfferRow) : null;
}

async function closeOpenOffers(bookingId: string, status: "declined" | "expired" | "accepted") {
  const offer = await pendingOffer(bookingId);
  if (offer) await directusUpdate("session_offers", offer.id, { status, responded_at: nowIso() });
}

export async function acceptOffer(b: FullBooking, targetId: string, settings: PlatformSettings) {
  const offer = await pendingOffer(b.id);
  if (b.status !== "session_cancelled" || !offer) return fail(409, "Er staat geen aanbod meer open.");
  const moved = await moveBooking(b, targetId, settings, { viaOffer: true });
  if (moved.ok) {
    await directusUpdate("session_offers", offer.id, {
      status: targetId === offer.offered_session ? "accepted" : "declined",
      responded_at: nowIso(),
    });
  }
  return moved;
}

/* Geen andere datum: alles terug. Ook gebruikt als het aanbod verloopt. */
export async function refundOffer(b: FullBooking, { expired = false } = {}): Promise<ActionResult<{ refundCents: number }>> {
  const offer = await pendingOffer(b.id);
  if (b.status !== "session_cancelled" || !offer) return fail(409, "Er staat geen aanbod meer open.");
  const refund = await refundBooking(b, {
    key: `offer-${offer.id}`,
    message: "Je koos geen andere datum. Je krijgt het volledige bedrag terug.",
    reason: expired ? "offer_expired" : "offer_declined",
  });
  await directusUpdate("session_offers", offer.id, { status: expired ? "expired" : "declined", responded_at: nowIso() });
  if (Object.keys(refund.updates).length) await directusUpdate("bookings", b.id, refund.updates);
  if (expired) await mail.mailOfferExpired(b, refund.refundCents);
  else await mail.mailBookingCancelled(b, refund.refundCents);
  return { ok: true, refundCents: refund.refundCents };
}

/* ---------- klacht ---------- */

const OPEN_COMPLAINT = "new,in_review,refund_approved";
export const COMPLAINT_KINDS = ["no_show_provider", "quality", "safety", "no_show_dispute", "other"] as const;

export async function openComplaint(bookingId: string) {
  return directusFetch(
    `/items/complaints?filter[booking][_eq]=${encodeURIComponent(bookingId)}&filter[status][_in]=${OPEN_COMPLAINT}&fields=id,status&limit=1`,
    { noCache: true },
  );
}

export async function fileComplaint(
  b: FullBooking,
  { kind, description }: { kind: string; description: string },
  settings: PlatformSettings,
): Promise<ActionResult<{ id: string }>> {
  if (!complaintWindowOpen(b, { delayHours: settings.settlementDelayHours })) {
    return fail(409, "Een melding kan vanaf de start tot het geld naar de workshopgever gaat. Die termijn is voorbij.");
  }
  if (await openComplaint(b.id)) return fail(409, "Je hebt al een melding lopen voor deze aanmelding.");
  const text = description.trim().slice(0, 4000);
  if (text.length < 10) return fail(400, "Vertel in een paar zinnen wat er misging.");
  const safeKind = (COMPLAINT_KINDS as readonly string[]).includes(kind) ? kind : "other";

  const hold = new Date(Date.now() + settings.complaintHoldDays * 24 * HOUR).toISOString();
  const until = laterOf(b.escrow_until, hold)!;
  const held = await setEscrow(b, until);

  const created = await directusCreate("complaints", {
    booking: b.id,
    status: "new",
    kind: safeKind,
    description: text,
    submitted_at: nowIso(),
    escrow_extended_until: held ? until : null,
  });
  if (!created?.id) return fail(500, "Je melding is niet opgeslagen. Probeer het opnieuw of mail ons.");
  if (!held) console.error(`Klacht ${created.id}: escrow niet verlengd bij OPP. Handmatig controleren.`);
  await mail.mailComplaint(b, { id: created.id, kind: safeKind, description: text }, settings.teamEmail);
  return { ok: true, id: created.id };
}

/* ---------- no-show (workshopgever) ---------- */

export async function markNoShow(b: FullBooking, settings: PlatformSettings): Promise<ActionResult> {
  if (!canMarkNoShow(b, { delayHours: settings.settlementDelayHours })) {
    return fail(409, "Dit kan alleen na de start en voordat het geld vrijkomt.");
  }
  await directusUpdate("bookings", b.id, { status: "no_show", no_show_marked_at: nowIso() });
  await mail.mailNoShowMarked(b);
  return { ok: true };
}

/* ---------- review (§8) ---------- */

export async function writeReview(
  b: FullBooking,
  { rating, body }: { rating: number; body: string },
): Promise<ActionResult> {
  if (!canReview(b)) return fail(409, "Voor deze aanmelding kun je (nog) geen review schrijven.");
  const stars = Math.round(Number(rating));
  if (!(stars >= 1 && stars <= 5)) return fail(400, "Kies 1 tot 5 sterren.");
  const text = String(body || "").trim().slice(0, 2000);
  const name = b.first_name || b.customer?.first_name || (b.guest_name || "").split(/\s+/)[0] || "Deelnemer";
  const now = nowIso();

  const created = await directusCreate("reviews", {
    status: "published",
    author_display_name: name,
    rating_overall: stars,
    body: text || null,
    published_at: now,
    booking: b.id,
    workshop: b.workshop.id,
    provider: b.workshop.provider?.id ?? null,
    user: b.customer?.id ?? null,
  });
  if (!created?.id) return fail(500, "Je review is niet opgeslagen. Probeer het opnieuw.");
  await directusUpdate("bookings", b.id, { review_written_at: now });

  const w = nextRating(b.workshop.rating_avg, b.workshop.rating_count, stars);
  await directusUpdate("workshops", b.workshop.id, { rating_avg: w.avg.toFixed(2), rating_count: w.count });
  const p = b.workshop.provider;
  if (p) {
    const r = nextRating(p.rating_avg, p.rating_count, stars);
    await directusUpdate("providers", p.id, { rating_avg: r.avg.toFixed(2), rating_count: r.count });
  }
  return { ok: true };
}
