import { NextResponse } from "next/server";
import { isDirectusConfigured, directusFetch, directusUpdate } from "@/lib/directus";
import { getPlatformSettings } from "@/lib/directus/settings";
import { shouldRefundSession, shouldSettleSession } from "@/lib/rules/escrow";
import { refundPayment, createWithdrawal } from "@/lib/payment";

export const dynamic = "force-dynamic";

const CRON_SECRET = process.env.CRON_SECRET || "";

/* POST /api/cron/escrow
   Wordt elke 5 minuten aangeroepen door een externe scheduler.
   Beveiligd met CRON_SECRET.

   Drie taken:
   A. Beslismoment-refunds: sessies waar het minimum niet is gehaald
   B. Uitbetaling na workshop: geld vrijgeven aan workshopgever
   C. Verlopen checkouts opruimen: onbetaalde boekingen annuleren */
export async function POST(request) {
  if (!isDirectusConfigured) {
    return NextResponse.json({ error: "Directus is niet geconfigureerd" }, { status: 503 });
  }

  /* Autorisatie. */
  const auth = request.headers.get("authorization");
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  const settings = await getPlatformSettings();
  const now = Date.now();

  const results = {
    refunded: await handleDecisionRefunds(settings, now),
    settled: await handleSettlements(settings, now),
    expired: await handleExpiredCheckouts(now),
  };

  return NextResponse.json({ ok: true, ...results });
}

/* ---------- A. Beslismoment-refunds ---------- */

async function handleDecisionRefunds(settings, now) {
  let count = 0;

  /* Vind sessies die open zijn, een beslismoment hebben, en een minimum. */
  const sessions = await directusFetch(
    `/items/workshop_sessions?filter[state][_in]=open,not_happening&filter[decision_at][_lte]=${new Date(now).toISOString()}&filter[min_participants][_nnull]=true&filter[provider_override][_eq]=false&fields=id,state,min_participants,seats_taken,decision_at,goes_ahead,provider_override,workshop.provider&limit=100`,
    { noCache: true }
  );

  if (!Array.isArray(sessions)) return count;

  for (const session of sessions) {
    if (!shouldRefundSession(session, settings.decisionGraceHours, now)) continue;

    /* Zet sessie op not_happening. */
    await directusUpdate("workshop_sessions", session.id, {
      state: "not_happening",
      closed_at: new Date(now).toISOString(),
    });

    /* Vind alle betaalde boekingen voor deze sessie. */
    const bookings = await directusFetch(
      `/items/bookings?filter[session]=${session.id}&filter[payment_status]=paid&filter[status][_in]=confirmed,awaiting_payment&fields=id,opp_transaction_uid,payment_id,total,participants,session&limit=100`,
      { noCache: true }
    );

    if (!Array.isArray(bookings)) continue;

    for (const booking of bookings) {
      const txnUid = booking.opp_transaction_uid || booking.payment_id;
      if (!txnUid) continue;

      const refund = await refundPayment(settings.paymentProvider, txnUid, {
        description: `Datum gaat niet door - ${booking.id}`,
        pilotNoPayments: settings.pilotNoPayments,
      });

      const updates = {
        status: "refunded",
        payment_status: "refunded",
        refund_status: settings.pilotNoPayments ? "completed" : "pending",
      };
      if (refund?.uid) updates.opp_refund_uid = refund.uid;
      if (settings.pilotNoPayments) updates.refunded_at = new Date(now).toISOString();

      await directusUpdate("bookings", booking.id, updates);
      count += 1;
    }

    /* TODO: session_offers aanmaken en mails versturen.
       Dit wordt in een latere fase geïmplementeerd samen met de mailsysteem. */
  }

  return count;
}

/* ---------- B. Uitbetaling na workshop ---------- */

async function handleSettlements(settings, now) {
  let count = 0;

  /* Vind bevestigde sessies die voorbij zijn + settlement delay. */
  const delayMs = (settings.settlementDelayHours || 24) * 60 * 60 * 1000;
  const cutoff = new Date(now - delayMs).toISOString();

  const sessions = await directusFetch(
    `/items/workshop_sessions?filter[state]=confirmed&filter[ends_at][_lte]=${cutoff}&fields=id,ends_at,workshop.provider&limit=100`,
    { noCache: true }
  );

  if (!Array.isArray(sessions)) return count;

  for (const session of sessions) {
    if (!shouldSettleSession(session, settings.settlementDelayHours, now)) continue;

    /* Vind betaalde, niet-uitbetaalde boekingen. */
    const bookings = await directusFetch(
      `/items/bookings?filter[session]=${session.id}&filter[payment_status]=paid&filter[status]=confirmed&filter[payout][_null]=true&fields=id,total,opp_transaction_uid,provider&limit=100`,
      { noCache: true }
    );

    if (!Array.isArray(bookings)) continue;

    /* Merchant uid ophalen. */
    const providerId = typeof session.workshop?.provider === "string"
      ? session.workshop.provider
      : session.workshop?.provider?.id;
    if (!providerId) continue;

    const provider = await directusFetch(
      `/items/providers/${providerId}?fields=opp_merchant_uid`,
      { noCache: true }
    );
    const merchantUid = provider?.opp_merchant_uid;

    for (const booking of bookings) {
      if (!settings.pilotNoPayments && !merchantUid) continue;

      const withdrawal = await createWithdrawal(settings.paymentProvider, merchantUid, {
        amountCents: Number(booking.total) || 0,
        description: `Workshop uitbetaling - ${booking.id}`,
        pilotNoPayments: settings.pilotNoPayments,
      });

      if (withdrawal) {
        await directusUpdate("bookings", booking.id, {
          status: "completed",
        });
        count += 1;
      }
    }

    /* Markeer sessie als afgerond. */
    await directusUpdate("workshop_sessions", session.id, {
      state: "confirmed", /* Blijft confirmed; status "completed" zou apart moeten. */
      closed_at: new Date(now).toISOString(),
    });
  }

  return count;
}

/* ---------- C. Verlopen checkouts opruimen ---------- */

async function handleExpiredCheckouts(now) {
  let count = 0;

  const bookings = await directusFetch(
    `/items/bookings?filter[payment_status]=open&filter[hold_expires_at][_lte]=${new Date(now).toISOString()}&filter[status]=awaiting_payment&fields=id,session,participants&limit=100`,
    { noCache: true }
  );

  if (!Array.isArray(bookings)) return count;

  for (const booking of bookings) {
    /* Zet booking op expired. */
    await directusUpdate("bookings", booking.id, {
      status: "expired",
      payment_status: "expired",
    });

    /* Geef stoelen vrij. */
    const sessionId = typeof booking.session === "string" ? booking.session : booking.session?.id;
    if (sessionId) {
      const fresh = await directusFetch(`/items/workshop_sessions/${sessionId}?fields=seats_taken`, { noCache: true });
      const current = fresh?.seats_taken ?? 0;
      await directusUpdate("workshop_sessions", sessionId, {
        seats_taken: Math.max(0, current - (booking.participants || 1)),
      });
    }

    count += 1;
  }

  return count;
}
