import "server-only";

import { BOOKING_LOCATION_FIELDS, bookingLocation, directusFetch } from "@/lib/directus";
import type { PolicyRow, SessionLike } from "@/lib/rules/booking-rules";

/* Een aanmelding met alles wat annuleren, verzetten, mails en de
   beheerpagina nodig hebben. Leest met het servertoken en zonder cache. */

export type FullSession = SessionLike & {
  min_participants: number | null;
  decision_at: string | null;
  workshop?: string | { id: string } | null;
};

export type FullBooking = {
  id: string;
  booking_code: string;
  status: string;
  guest_name: string | null;
  guest_email: string | null;
  first_name: string | null;
  participants: number;
  unit_price: string | null;
  total: string | null;
  payment_status: string | null;
  payment_env: "sandbox" | "live" | null;
  opp_transaction_uid: string | null;
  refund_status: string | null;
  refund_amount: string | null;
  cancel_fee_percent: number | null;
  cancellation_deadline: string | null;
  escrow_until: string | null;
  access_token: string | null;
  review_written_at: string | null;
  review_requested_at: string | null;
  moved_from: string | null;
  date_created: string | null;
  customer: { id: string; email: string | null; first_name: string | null; notify_reminder_decision?: boolean | null } | null;
  session: FullSession;
  workshop: {
    id: string;
    title: string;
    slug: string | null;
    price_per_person: string | null;
    rating_avg: string | null;
    rating_count: number | null;
    cancellation_policy: PolicyRow | null;
    provider: {
      id: string;
      display_name: string | null;
      first_name: string | null;
      rating_avg: string | null;
      rating_count: number | null;
      user: { id: string; email: string | null; first_name: string | null } | null;
    } | null;
    [key: string]: unknown;
  };
};

export const SESSION_FIELDS = [
  "id", "starts_at", "ends_at", "state", "status", "capacity", "seats_taken", "goes_ahead", "provider_override",
  "is_private", "price_override", "min_participants", "decision_at", "workshop",
];

const FIELDS = [
  "id", "booking_code", "status", "guest_name", "guest_email", "first_name", "participants", "unit_price", "total",
  "payment_status", "payment_env", "opp_transaction_uid", "refund_status", "refund_amount", "cancel_fee_percent",
  "cancellation_deadline", "escrow_until", "access_token", "review_written_at", "moved_from", "date_created",
  "customer.id", "customer.email", "customer.first_name", "customer.notify_reminder_decision", "review_requested_at",
  ...SESSION_FIELDS.map((f) => `session.${f}`),
  "workshop.id", "workshop.title", "workshop.slug", "workshop.price_per_person", "workshop.rating_avg", "workshop.rating_count",
  "workshop.cancellation_policy.key", "workshop.cancellation_policy.name",
  "workshop.cancellation_policy.free_until_hours_before", "workshop.cancellation_policy.penalty_percent_after",
  "workshop.cancellation_policy.reschedule_free",
  "workshop.provider.id", "workshop.provider.display_name", "workshop.provider.first_name",
  "workshop.provider.rating_avg", "workshop.provider.rating_count",
  "workshop.provider.user.id", "workshop.provider.user.email", "workshop.provider.user.first_name",
  BOOKING_LOCATION_FIELDS,
].join(",");

function normalize(row: unknown): FullBooking | null {
  if (!row || typeof row !== "object") return null;
  const b = row as FullBooking;
  if (!b.session || typeof b.session !== "object" || !b.workshop || typeof b.workshop !== "object") return null;
  /* Een M2O zonder uitgevouwen velden komt terug als string. */
  if (typeof b.workshop.cancellation_policy === "string") {
    b.workshop.cancellation_policy = { key: b.workshop.cancellation_policy, free_until_hours_before: null, penalty_percent_after: null };
  }
  return b;
}

export async function loadBookingByCode(code: string): Promise<FullBooking | null> {
  if (!code || !/^[A-Za-z0-9-]{3,32}$/.test(code)) return null;
  const row = await directusFetch(
    `/items/bookings?filter[booking_code][_eq]=${encodeURIComponent(code)}&fields=${FIELDS}&limit=1`,
    { noCache: true },
  );
  return normalize(row);
}

export async function loadBookingById(id: string): Promise<FullBooking | null> {
  if (!id) return null;
  return normalize(await directusFetch(`/items/bookings/${encodeURIComponent(id)}?fields=${FIELDS}`, { noCache: true }));
}

export async function loadBookings(filter: string, limit = 200): Promise<FullBooking[]> {
  const rows = await directusFetch(`/items/bookings?${filter}&fields=${FIELDS}&limit=${limit}`, { noCache: true });
  const list = Array.isArray(rows) ? rows : rows ? [rows] : [];
  return list.map(normalize).filter((b): b is FullBooking => Boolean(b));
}

/* Alle datums van een workshop, voor verzetten en een aanbod. */
export async function loadWorkshopSessions(workshopId: string): Promise<FullSession[]> {
  const rows = await directusFetch(
    `/items/workshop_sessions?filter[workshop][_eq]=${encodeURIComponent(workshopId)}&fields=${SESSION_FIELDS.join(",")}&sort=starts_at&limit=200`,
    { noCache: true },
  );
  return Array.isArray(rows) ? rows : rows ? [rows] : [];
}

export const locationOf = (b: FullBooking) => bookingLocation(b);

export const customerEmail = (b: FullBooking) => b.customer?.email || b.guest_email || null;
export const customerFirstName = (b: FullBooking) =>
  b.first_name || b.customer?.first_name || (b.guest_name || "").trim().split(/\s+/)[0] || null;
export const providerName = (b: FullBooking) =>
  b.workshop.provider?.first_name || b.workshop.provider?.display_name || "de workshopgever";

/* Wat de deelnemer betaalde, in centen. 0 bij boeken zonder betaling. */
export function paidCents(b: FullBooking): number {
  if (b.payment_status !== "paid") return 0;
  return Math.round(Number(b.total || 0) * 100);
}

export function unitPriceOf(b: FullBooking): number | null {
  const v = b.unit_price ?? b.workshop.price_per_person;
  return v == null ? null : Number(v);
}
