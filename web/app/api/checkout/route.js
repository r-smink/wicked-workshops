import { NextResponse } from "next/server";
import { getAccessToken, directusMe } from "@/lib/auth";
import {
  directusCreate, directusUpdate, isDirectusConfigured,
  getSessionForCheckout, directusFetch,
} from "@/lib/directus";
import { createPayment, isPaymentConfigured } from "@/lib/payment";
import { cancellationDeadline } from "@/lib/cancellation";
import { calculateBookingFees } from "@/lib/rules/fees";
import { getPlatformSettings } from "@/lib/directus/settings";

export const dynamic = "force-dynamic";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function bookingCode() {
  return `WW-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

/* POST /api/checkout
   Body: { session_id, participants, guest_name, guest_email }
   Boeken is direct (docs/05): geen goedkeuring van de aanbieder nodig.
   Bij OPP gaat het geld naar escrow tot de workshop voorbij is. */
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
  const settings = await getPlatformSettings();

  /* Commissie ophalen van de categorie. */
  let commissionPercent = 0;
  if (workshop.category) {
    const categoryId = typeof workshop.category === "string" ? workshop.category : workshop.category?.id;
    if (categoryId) {
      const cat = await directusFetch(`/items/categories/${categoryId}?fields=commission_percent`, { noCache: true });
      commissionPercent = cat?.commission_percent ?? 0;
    }
  }

  const unitPrice = Number(session.price_override ?? workshop.price_per_person ?? 0);
  const fees = calculateBookingFees({ priceCents: unitPrice, participants, commissionPercent });

  /* Provider ophalen voor OPP merchant check. */
  const providerId = typeof workshop.provider === "string" ? workshop.provider : workshop.provider?.id;
  let merchantUid = null;
  if (providerId && settings.paymentProvider === "opp" && !settings.pilotNoPayments) {
    const provider = await directusFetch(`/items/providers/${providerId}?fields=opp_merchant_uid,opp_merchant_status`, { noCache: true });
    if (!provider?.opp_merchant_uid || provider.opp_merchant_status !== "live") {
      return NextResponse.json({ error: "De workshopgever kan nog geen betalingen ontvangen" }, { status: 409 });
    }
    merchantUid = provider.opp_merchant_uid;
  }

  /* Booking aanmaken. Stoelen worden direct gereserveerd. */
  const code = bookingCode();
  const holdMinutes = settings.paymentHoldMinutes || 30;

  const booking = await directusCreate("bookings", {
    status: settings.pilotNoPayments ? "confirmed" : "awaiting_payment",
    booking_code: code,
    guest_name: name,
    guest_email: email,
    participants,
    unit_price: unitPrice,
    subtotal: fees.subtotal,
    service_fee: 0,
    discount: 0,
    total: fees.total,
    session: session.id,
    workshop: workshop.id,
    provider: providerId || null,
    customer: user?.id || null,
    payment_status: settings.pilotNoPayments ? null : "open",
    hold_expires_at: settings.pilotNoPayments ? null : new Date(Date.now() + holdMinutes * 60 * 1000).toISOString(),
    cancellation_deadline: cancellationDeadline(workshop.cancellation_policy, session.starts_at),
  });

  if (!booking) {
    return NextResponse.json({ error: "Kon boeking niet opslaan" }, { status: 500 });
  }

  /* Stoelen direct reserveren (voorkomt overselling). */
  await directusUpdate("workshop_sessions", session.id, {
    seats_taken: (session.seats_taken ?? 0) + participants,
  });

  /* Pilot: geen betaling nodig, booking is meteen bevestigd. */
  if (settings.pilotNoPayments) {
    return NextResponse.json({ ok: true, booking_code: code });
  }

  /* Betaling aanmaken via de actieve provider. */
  const provider = settings.paymentProvider;
  if (!isPaymentConfigured(provider)) {
    return NextResponse.json({ error: "Betalingen zijn nog niet geconfigureerd" }, { status: 503 });
  }

  const webhookPath = provider === "mollie" ? "/api/webhooks/mollie" : "/api/webhooks/opp";
  const result = await createPayment(provider, {
    merchantUid,
    amountCents: fees.total,
    description: `${workshop.title} · ${code}`,
    returnUrl: `${SITE}/boeking/terug?code=${code}`,
    webhookUrl: `${SITE}${webhookPath}`,
    metadata: { booking_id: booking.id, booking_code: code, session_id: session.id },
    pilotNoPayments: false,
  });

  if (!result?.uid) {
    return NextResponse.json({ error: "Kon betaling niet aanmaken" }, { status: 502 });
  }

  /* Transactie-ID opslaan op de booking. */
  const paymentUpdate = { payment_id: result.uid };
  if (provider === "opp") {
    paymentUpdate.opp_transaction_uid = result.uid;
  }
  await directusUpdate("bookings", booking.id, paymentUpdate);

  return NextResponse.json({ ok: true, checkoutUrl: result.checkoutUrl, booking_code: code });
}
