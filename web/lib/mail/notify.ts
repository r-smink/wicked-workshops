import "server-only";

import * as T from "@/mail/templates";
import { sendMail } from "./send";
import { bookingToken } from "@/lib/bookings/access";
import {
  customerEmail, customerFirstName, locationOf, paidCents, providerName, type FullBooking, type FullSession,
} from "@/lib/bookings/load";
import { formatDecision, formatSessionDay, formatSessionTime } from "@/lib/session-standing";
import { cancellationQuote, resolvePolicy } from "@/lib/rules/booking-rules";

/* Mails per gebeurtenis. Elke functie bouwt de gegevens uit een geladen
   aanmelding en verstuurt idempotent via mail_log. De ref_key bepaalt wat
   "dezelfde mail" is; zie de aanroepen. */

export const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

/* "za 21 nov, 15:00" */
export const when = (iso: string | null | undefined) => (iso ? `${formatSessionDay(iso)}, ${formatSessionTime(iso)}` : "");

export function manageUrl(b: { id: string; booking_code: string; access_token?: string | null }, extra = ""): string {
  const token = bookingToken(b.id, b.access_token);
  const t = token ? `&t=${encodeURIComponent(token)}` : "";
  return `${SITE}/boeking/beheer?code=${encodeURIComponent(b.booking_code)}${t}${extra}`;
}

function standingText(s: FullSession): string | null {
  if (!s.min_participants || s.state === "confirmed" || s.goes_ahead) return null;
  const decision = s.decision_at ? `, beslismoment ${formatDecision(s.decision_at)}` : "";
  return `${s.seats_taken ?? 0} van ${s.min_participants} nodig${decision}`;
}

const base = (b: FullBooking) => ({ firstName: customerFirstName(b), workshopTitle: b.workshop.title });

export async function mailBookingConfirmed(b: FullBooking, { testMode = false } = {}) {
  const policy = resolvePolicy(b.workshop.cancellation_policy);
  const quote = cancellationQuote({ policy, startsAt: b.session.starts_at, paidCents: 0 });
  const cancelText = quote.freeUntil
    ? `Annuleren of verzetten kan via de knop hieronder. Annuleren is kosteloos tot ${when(quote.freeUntil)}.`
    : "Annuleren of verzetten kan via de knop hieronder.";
  const isGuest = !b.customer;
  return sendMail("booking_confirmed", b.id, customerEmail(b), T.bookingConfirmed({
    ...base(b),
    providerName: providerName(b),
    when: when(b.session.starts_at),
    day: formatSessionDay(b.session.starts_at),
    participants: b.participants,
    totalCents: paidCents(b) || Math.round(Number(b.total || 0) * 100),
    location: locationOf(b),
    standing: standingText(b.session),
    cancelText,
    manageUrl: manageUrl(b),
    accountUrl: isGuest ? `${SITE}/account-maken/wachtwoord?code=${encodeURIComponent(b.booking_code)}&t=${encodeURIComponent(bookingToken(b.id, b.access_token) || "")}` : null,
    testMode,
    bookingCode: b.booking_code,
  }));
}

export async function mailBookingCancelled(b: FullBooking, refundCents: number) {
  return sendMail("booking_cancelled", b.id, customerEmail(b), T.bookingCancelled({
    ...base(b), when: when(b.session.starts_at), refundCents, manageUrl: null,
  }));
}

export async function mailBookingMoved(newBooking: FullBooking, fromStartsAt: string | null) {
  return sendMail("booking_moved", newBooking.id, customerEmail(newBooking), T.bookingMoved({
    ...base(newBooking), fromWhen: when(fromStartsAt), toWhen: when(newBooking.session.starts_at), manageUrl: manageUrl(newBooking),
  }));
}

export async function mailSessionConfirmed(b: FullBooking) {
  return sendMail("session_confirmed", b.id, customerEmail(b), T.sessionConfirmed({
    ...base(b), day: formatSessionDay(b.session.starts_at), when: when(b.session.starts_at), manageUrl: manageUrl(b),
  }));
}

type OfferInfo = { startsAt: string | null; expiresAt: string } | null;
const offerOf = (o: OfferInfo) => (o ? { when: when(o.startsAt), expires: when(o.expiresAt) } : null);

export async function mailSessionNotHappening(b: FullBooking, offer: OfferInfo, refundCents: number) {
  return sendMail("session_not_happening", b.id, customerEmail(b), T.sessionNotHappening({
    ...base(b), when: when(b.session.starts_at), offer: offerOf(offer), manageUrl: manageUrl(b), refundCents,
  }));
}

export async function mailSessionCancelled(b: FullBooking, offer: OfferInfo, refundCents: number, reason: string | null) {
  return sendMail("session_cancelled", b.id, customerEmail(b), T.sessionCancelled({
    ...base(b), when: when(b.session.starts_at), providerName: providerName(b), reason, offer: offerOf(offer),
    manageUrl: manageUrl(b), refundCents,
  }));
}

export async function mailOfferExpired(b: FullBooking, refundCents: number) {
  return sendMail("offer_expired", b.id, customerEmail(b), T.offerExpired({ ...base(b), when: when(b.session.starts_at), refundCents }));
}

export async function mailReminderDecision(b: FullBooking, hours: number) {
  const s = b.session;
  return sendMail("reminder_decision", `${b.id}:${hours}`, customerEmail(b), T.reminderDecision({
    ...base(b),
    when: when(s.starts_at),
    standing: `${s.seats_taken ?? 0} van ${s.min_participants ?? 0} nodig`,
    decisionWhen: when(s.decision_at),
    workshopUrl: b.workshop.slug ? `${SITE}/workshop/${b.workshop.slug}` : SITE,
    manageUrl: manageUrl(b),
  }));
}

export async function mailReminderStart(b: FullBooking) {
  return sendMail("reminder_start", b.id, customerEmail(b), T.reminderStart({
    ...base(b), when: when(b.session.starts_at), location: locationOf(b), manageUrl: manageUrl(b),
  }));
}

export async function mailReviewInvite(b: FullBooking) {
  return sendMail("review_invite", b.id, customerEmail(b), T.reviewInvite({
    ...base(b), providerName: providerName(b), reviewUrl: manageUrl(b, "#review"),
  }));
}

export async function mailNoShowMarked(b: FullBooking) {
  return sendMail("no_show_marked", b.id, customerEmail(b), T.noShowMarked({
    ...base(b), when: when(b.session.starts_at), manageUrl: manageUrl(b, "#melding"),
  }));
}

export async function mailComplaint(b: FullBooking, complaint: { id: string; kind: string; description: string }, teamEmail: string | null) {
  await sendMail("complaint_received", complaint.id, customerEmail(b), T.complaintReceived({ ...base(b), bookingCode: b.booking_code }));
  const admin = (process.env.DIRECTUS_PUBLIC_URL || process.env.DIRECTUS_URL || "").replace(/\/$/, "");
  await sendMail("complaint_team", complaint.id, teamEmail, T.complaintTeam({
    workshopTitle: b.workshop.title,
    bookingCode: b.booking_code,
    kind: complaint.kind,
    description: complaint.description,
    when: when(b.session.starts_at),
    adminUrl: `${admin}/admin/content/complaints/${complaint.id}`,
  }));
}

export async function mailRefundDone(b: FullBooking, refundCents: number, refKey: string) {
  return sendMail("refund_done", refKey, customerEmail(b), T.refundDone({ ...base(b), refundCents }));
}

/* Aan de workshopgever bij het beslismoment (docs/05 §3). */
export async function mailProviderDecision(
  session: FullSession & { id: string },
  workshop: { title: string; provider?: { first_name?: string | null; user?: { email?: string | null; first_name?: string | null } | null } | null },
  { goesAhead, graceUntil }: { goesAhead: boolean; graceUntil: string | null },
) {
  const provider = workshop.provider;
  return sendMail(goesAhead ? "provider_session_confirmed" : "provider_session_min_missed", session.id, provider?.user?.email, T.providerDecision({
    firstName: provider?.first_name || provider?.user?.first_name,
    workshopTitle: workshop.title,
    when: when(session.starts_at),
    goesAhead,
    taken: session.seats_taken ?? 0,
    min: session.min_participants ?? 0,
    graceUntil: graceUntil ? when(graceUntil) : null,
    dashboardUrl: `${SITE}/dashboard`,
  }));
}
