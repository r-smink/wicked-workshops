import { NextResponse } from "next/server";
import { getAccessToken, directusMe } from "@/lib/auth";
import {
  directusCreate, directusUpdate, isDirectusConfigured,
  getSessionForCheckout,
} from "@/lib/directus";
import { mollieCreatePayment, mollieCheckoutUrl, isMollieConfigured } from "@/lib/mollie";

export const dynamic = "force-dynamic";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function bookingCode() {
  return `WW-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

/* POST /api/checkout
   Body: { session_id, participants, guest_name, guest_email }
   Maakt een booking aan in Directus. Bij een instant_bookable workshop
   wordt meteen een Mollie-betaling aangemaakt en komt de checkout-URL
   terug; anders blijft de boeking "pending" tot de aanbieder bevestigt. */
export async function POST(request) {
  if (!isDirectusConfigured) {
    return NextResponse.json({ error: "Directus is niet geconfigureerd" }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
  }

  const { session_id, guest_name, guest_email } = body;
  const participants = Math.max(1, Math.min(50, Number(body.participants) || 1));

  if (!session_id) {
    return NextResponse.json({ error: "Kies een datum" }, { status: 400 });
  }

  /* Ingelogde gebruiker? Dan koppelen we de booking aan het account. */
  const token = await getAccessToken();
  const user = token ? await directusMe(token) : null;

  const name = user ? [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email : guest_name;
  const email = user ? user.email : guest_email;
  if (!name || !email) {
    return NextResponse.json({ error: "Naam en e-mailadres zijn verplicht" }, { status: 400 });
  }

  /* Sessie + workshop ophalen en plekken controleren. */
  const session = await getSessionForCheckout(session_id);
  if (!session || !session.workshop) {
    return NextResponse.json({ error: "Sessie niet gevonden" }, { status: 404 });
  }
  const seatsLeft = (session.capacity ?? 0) - (session.seats_taken ?? 0);
  if (seatsLeft < participants) {
    return NextResponse.json(
      { error: `Nog maar ${seatsLeft} ${seatsLeft === 1 ? "plek" : "plekken"} beschikbaar` },
      { status: 409 }
    );
  }

  const workshop = session.workshop;
  const unitPrice = Number(session.price_override ?? workshop.price_per_person ?? 0);
  const subtotal = unitPrice * participants;
  const total = subtotal; /* service_fee blijft 0 zolang er geen marge-afspraak is */
  const instant = Boolean(workshop.instant_bookable);

  /* Booking aanmaken. */
  const code = bookingCode();
  const booking = await directusCreate("bookings", {
    status: instant ? "awaiting_payment" : "pending",
    booking_code: code,
    guest_name: name,
    guest_email: email,
    participants,
    unit_price: unitPrice,
    subtotal,
    service_fee: 0,
    discount: 0,
    total,
    session: session.id,
    workshop: workshop.id,
    provider: workshop.provider || null,
    customer: user?.id || null,
    payment_status: instant ? "open" : null,
    hold_expires_at: instant ? new Date(Date.now() + 30 * 60 * 1000).toISOString() : null,
  });

  if (!booking) {
    return NextResponse.json({ error: "Kon boeking niet opslaan" }, { status: 500 });
  }

  /* Niet-instant: aanvraag staat klaar, aanbieder bevestigt via dashboard. */
  if (!instant) {
    return NextResponse.json({ ok: true, requested: true, booking_code: code });
  }

  /* Instant: Mollie-betaling aanmaken. */
  if (!isMollieConfigured) {
    return NextResponse.json({ error: "Betalingen zijn nog niet geconfigureerd" }, { status: 503 });
  }

  const payment = await mollieCreatePayment({
    amount: total,
    description: `${workshop.title} · ${code}`,
    redirectUrl: `${SITE}/boeking/terug?code=${code}`,
    webhookUrl: `${SITE}/api/webhooks/mollie`,
    metadata: { booking_id: booking.id, booking_code: code },
  });

  const checkoutUrl = mollieCheckoutUrl(payment);
  if (!checkoutUrl) {
    return NextResponse.json({ error: "Kon betaling niet aanmaken" }, { status: 502 });
  }

  await directusUpdate("bookings", booking.id, { payment_id: payment.id });

  return NextResponse.json({ ok: true, checkoutUrl, booking_code: code });
}
