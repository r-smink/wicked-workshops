import { createHmac, randomBytes, timingSafeEqual } from "crypto";

/* Beheerlink van een aanmelding: /boeking/beheer?code=WW-XXXX&t=<token>.

   Het token is een HMAC over het boekings-id en een willekeurige nonce per
   aanmelding (bookings.access_token), met het servergeheim
   BOOKING_LINK_SECRET (of FIELD_ENCRYPTION_KEY). Zo kan elke latere mail
   (herinnering, annulering, aanbod) dezelfde link opnieuw maken, en is de
   nonce in Directus zonder het geheim waardeloos. Een nieuwe nonce maakt
   oude links ongeldig. Ook een gast zonder account kan zo annuleren,
   verzetten, klagen of een review schrijven. */

function secret(): string {
  const value = process.env.BOOKING_LINK_SECRET || process.env.FIELD_ENCRYPTION_KEY || "";
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error("BOOKING_LINK_SECRET ontbreekt");
  }
  return value || "dev-only-booking-link-secret";
}

export function newAccessNonce(): string {
  return randomBytes(16).toString("hex");
}

export function bookingToken(bookingId: string, nonce: string | null | undefined): string | null {
  if (!bookingId || !nonce) return null;
  return createHmac("sha256", secret()).update(`booking:${bookingId}:${nonce}`, "utf8").digest("base64url");
}

/* Vergelijkt in constante tijd. */
export function tokenMatches(bookingId: string, nonce: string | null | undefined, token: string | null | undefined): boolean {
  const expected = bookingToken(bookingId, nonce);
  if (!expected || !token) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(String(token));
  return a.length === b.length && timingSafeEqual(a, b);
}

/* Mag deze bezoeker deze aanmelding beheren? Met het token uit de mail, of
   ingelogd als de klant aan wie de aanmelding hangt. */
export function canAccessBooking(
  booking: { id: string; access_token?: string | null; customer?: string | { id: string } | null } | null,
  { token, userId }: { token?: string | null; userId?: string | null },
): boolean {
  if (!booking) return false;
  if (tokenMatches(booking.id, booking.access_token, token)) return true;
  const customerId = typeof booking.customer === "string" ? booking.customer : booking.customer?.id;
  return Boolean(userId && customerId && userId === customerId);
}
