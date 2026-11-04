import { NextResponse } from "next/server";
import { getAccessToken, directusMe } from "@/lib/auth";
import {
  directusCreate, directusUpdate, isDirectusConfigured,
  getSessionForCheckout, directusFetch,
} from "@/lib/directus";
import {
  createPayment, isPaymentConfigured, paymentEnv, merchantReady, createSandboxMerchant,
} from "@/lib/payment";
import { cancellationDeadline } from "@/lib/cancellation";
import { calculateBookingFees } from "@/lib/rules/fees";
import { getPlatformSettings } from "@/lib/directus/settings";
import { priceCents, centsToDecimal } from "@/lib/directus/model";

export const dynamic = "force-dynamic";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

function bookingCode() {
  return `WW-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

/* "Femke de Vries" -> { first_name: "Femke", last_initial: "V" }. De
   workshopgever ziet alleen deze twee velden (docs/03, CLAUDE.md). */
function nameParts(fullName) {
  const words = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  const last = words.length > 1 ? words[words.length - 1] : "";
  return { first_name: words[0] || null, last_initial: last ? last[0].toUpperCase() : null };
}

/* POST /api/checkout
   Body: { session_id, participants, guest_name, guest_email }
   Boeken is direct (docs/05): geen goedkeuring van de aanbieder nodig.
   Met betalen aan (payment_mode sandbox of live) gaat het geld naar escrow
   tot na de workshop; anders is de boeking meteen bevestigd. */
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

  const name = user ? [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email : String(guest_name || "").trim();
  const email = user ? user.email : String(guest_email || "").trim();
  if (!name || !email) {
    return NextResponse.json({ error: "Naam en e-mailadres zijn verplicht" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Vul een geldig e-mailadres in" }, { status: 400 });
  }

  /* Sessie + workshop ophalen en plekken controleren. */
  const session = await getSessionForCheckout(session_id);
  if (!session || !session.workshop) {
    return NextResponse.json({ error: "Sessie niet gevonden" }, { status: 404 });
  }
  if (!session.starts_at || new Date(session.starts_at).getTime() <= Date.now()) {
    return NextResponse.json({ error: "Deze datum is al voorbij" }, { status: 409 });
  }
  const seatsLeft = (session.capacity ?? 0) - (session.seats_taken ?? 0);
  if (seatsLeft < participants) {
    return NextResponse.json(
      { error: `Nog maar ${seatsLeft} ${seatsLeft === 1 ? "plek" : "plekken"} beschikbaar` },
      { status: 409 }
    );
  }

  const workshop = session.workshop;
  const settings = await getPlatformSettings({ fresh: true });
  const env = paymentEnv(settings);

  /* Prijzen staan in euro's in Directus; rekenen doen we in centen. */
  const unitCents = priceCents(session.price_override ?? workshop.price_per_person) ?? 0;

  /* Commissie van de categorie. */
  let commissionPercent = 0;
  const categoryId = typeof workshop.category === "string" ? workshop.category : workshop.category?.id;
  if (categoryId) {
    const cat = await directusFetch(`/items/categories/${categoryId}?fields=commission_percent`, { noCache: true });
    commissionPercent = cat?.commission_percent ?? 0;
  }
  const fees = calculateBookingFees({ priceCents: unitCents, participants, commissionPercent });

  const providerId = typeof workshop.provider === "string" ? workshop.provider : workshop.provider?.id;

  /* Met betalen aan: eerst zeker weten dat de workshopgever kan ontvangen,
     voordat we een boeking of plekken vastleggen. */
  let merchantUid = null;
  if (env && unitCents > 0) {
    if (!isPaymentConfigured(settings)) {
      return NextResponse.json({ error: "Betalen is tijdelijk niet mogelijk. Probeer het later opnieuw." }, { status: 503 });
    }
    if (settings.paymentProvider === "opp") {
      const provider = providerId
        ? await directusFetch(`/items/providers/${providerId}?fields=id,opp_merchant_uid,opp_merchant_status,opp_merchant_env`, { noCache: true })
        : null;
      if (!provider) {
        return NextResponse.json({ error: "Deze workshop kan nu niet geboekt worden" }, { status: 409 });
      }
      if (!merchantReady(provider, env)) {
        if (env !== "sandbox") {
          return NextResponse.json({ error: "De workshopgever kan nog geen betalingen ontvangen" }, { status: 409 });
        }
        const fields = await createSandboxMerchant(provider.id, { notifyUrl: `${SITE}/api/webhooks/opp` });
        if (!fields) {
          return NextResponse.json({ error: "Betalen is tijdelijk niet mogelijk. Probeer het later opnieuw." }, { status: 502 });
        }
        await directusUpdate("providers", provider.id, fields);
        if (fields.opp_merchant_status !== "live") {
          return NextResponse.json({ error: "De workshopgever kan nog geen betalingen ontvangen" }, { status: 409 });
        }
        provider.opp_merchant_uid = fields.opp_merchant_uid;
      }
      merchantUid = provider.opp_merchant_uid;
    }
  }

  const paid = Boolean(env && unitCents > 0);
  const code = bookingCode();
  const holdMinutes = settings.paymentHoldMinutes || 30;

  const booking = await directusCreate("bookings", {
    status: paid ? "awaiting_payment" : "confirmed",
    booking_code: code,
    guest_name: name,
    guest_email: email,
    ...nameParts(name),
    participants,
    unit_price: centsToDecimal(unitCents),
    subtotal: centsToDecimal(fees.subtotal),
    service_fee: "0.00",
    discount: "0.00",
    total: centsToDecimal(fees.total),
    session: session.id,
    workshop: workshop.id,
    provider: providerId || null,
    customer: user?.id || null,
    payment_status: paid ? "open" : null,
    payment_env: paid && settings.paymentProvider === "opp" ? env : null,
    hold_expires_at: paid ? new Date(Date.now() + holdMinutes * 60 * 1000).toISOString() : null,
    cancellation_deadline: cancellationDeadline(workshop.cancellation_policy, session.starts_at),
  });

  if (!booking) {
    return NextResponse.json({ error: "Kon boeking niet opslaan" }, { status: 500 });
  }

  /* Stoelen direct reserveren (voorkomt overselling). */
  await directusUpdate("workshop_sessions", session.id, {
    seats_taken: (session.seats_taken ?? 0) + participants,
  });

  if (!paid) {
    return NextResponse.json({ ok: true, booking_code: code });
  }

  /* Escrow tot na de workshop plus de wachttijd uit de instellingen. */
  const endsAt = new Date(session.ends_at || session.starts_at).getTime();
  const escrowUntil = new Date(endsAt + (settings.settlementDelayHours || 0) * 60 * 60 * 1000);
  const webhookPath = settings.paymentProvider === "mollie" ? "/api/webhooks/mollie" : "/api/webhooks/opp";

  const result = await createPayment(settings, {
    merchantUid,
    productName: workshop.title,
    unitCents,
    quantity: participants,
    partnerFeeCents: fees.platformFee,
    returnUrl: `${SITE}/boeking/terug?code=${code}`,
    webhookUrl: `${SITE}${webhookPath}`,
    metadata: { booking_id: booking.id, booking_code: code, session_id: session.id },
    escrowUntil,
    idempotencyKey: code,
  });

  if (!result?.uid) {
    /* Geen betaling: boeking vervalt en de plekken komen terug. */
    await directusUpdate("bookings", booking.id, { status: "expired", payment_status: "failed" });
    const fresh = await directusFetch(`/items/workshop_sessions/${session.id}?fields=seats_taken`, { noCache: true });
    await directusUpdate("workshop_sessions", session.id, {
      seats_taken: Math.max(0, (fresh?.seats_taken ?? participants) - participants),
    });
    return NextResponse.json({ error: "Kon de betaling niet starten. Probeer het opnieuw." }, { status: 502 });
  }

  await directusUpdate("bookings", booking.id, {
    payment_id: result.uid,
    ...(settings.paymentProvider === "opp" ? { opp_transaction_uid: result.uid } : {}),
  });

  return NextResponse.json({ ok: true, checkoutUrl: result.checkoutUrl, booking_code: code });
}
