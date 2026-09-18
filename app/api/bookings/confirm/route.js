import { NextResponse } from "next/server";
import { getAccessToken, directusMe } from "@/lib/auth";
import {
  directusFetch, directusUpdate, isDirectusConfigured, getBookingById,
} from "@/lib/directus";
import { mollieCreatePayment, mollieCheckoutUrl, isMollieConfigured } from "@/lib/mollie";

export const dynamic = "force-dynamic";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/* POST /api/bookings/confirm
   Body: { booking_id }
   Provider bevestigt een aanvraag (status "pending"): er wordt een
   Mollie-betaling aangemaakt en de booking gaat naar "awaiting_payment".
   De checkout-URL komt terug zodat de aanbieder hem naar de gast kan
   sturen (e-mailverzending volgt later). */
export async function POST(request) {
  if (!isDirectusConfigured) {
    return NextResponse.json({ error: "Directus is niet geconfigureerd" }, { status: 503 });
  }
  if (!isMollieConfigured) {
    return NextResponse.json({ error: "Betalingen zijn nog niet geconfigureerd" }, { status: 503 });
  }

  const token = await getAccessToken();
  const user = token ? await directusMe(token) : null;
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
  }

  const booking = await getBookingById(body.booking_id);
  if (!booking) {
    return NextResponse.json({ error: "Boeking niet gevonden" }, { status: 404 });
  }
  if (booking.status !== "pending") {
    return NextResponse.json({ error: "Deze boeking is al verwerkt" }, { status: 409 });
  }

  /* Check dat de boeking bij de provider van deze user hoort. */
  const provider = await directusFetch(
    `/items/providers?filter[user]=${user.id}&fields=id&single`,
    { noCache: true }
  );
  const bookingProvider = typeof booking.provider === "string" ? booking.provider : booking.provider?.id;
  if (!provider?.id || provider.id !== bookingProvider) {
    return NextResponse.json({ error: "Geen toegang tot deze boeking" }, { status: 403 });
  }

  const workshop = typeof booking.workshop === "object" ? booking.workshop : null;
  const description = `${workshop?.title || "Workshop"} · ${booking.booking_code}`;

  const payment = await mollieCreatePayment({
    amount: Number(booking.total) || 0,
    description,
    redirectUrl: `${SITE}/boeking/terug?code=${booking.booking_code}`,
    webhookUrl: `${SITE}/api/webhooks/mollie`,
    metadata: { booking_id: booking.id, booking_code: booking.booking_code },
  });

  const checkoutUrl = mollieCheckoutUrl(payment);
  if (!checkoutUrl) {
    return NextResponse.json({ error: "Kon betaling niet aanmaken" }, { status: 502 });
  }

  await directusUpdate("bookings", booking.id, {
    status: "awaiting_payment",
    payment_id: payment.id,
    payment_status: "open",
    hold_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });

  return NextResponse.json({ ok: true, checkoutUrl });
}
