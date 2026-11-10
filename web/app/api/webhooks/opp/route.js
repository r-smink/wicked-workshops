import { NextResponse } from "next/server";
import { isDirectusConfigured, directusUpdate, directusFetch } from "@/lib/directus";
import {
  oppVerifyNotification, oppHasNotifySecret, oppGetTransaction, oppGetRefund, oppGetMerchant, oppPaymentStatus,
} from "@/lib/opp";
import { refundPayment } from "@/lib/payment";
import { releaseSeats, reserveSeats } from "@/lib/seats";
import { loadBookingById } from "@/lib/bookings/load";
import { mailBookingConfirmed } from "@/lib/mail/notify";

/* Bevestigingsmail na betaling. mail_log voorkomt dubbel versturen als OPP
   dezelfde notificatie herhaalt. */
async function confirmMail(bookingId, env) {
  const full = await loadBookingById(bookingId);
  if (full) await mailBookingConfirmed(full, { testMode: env === "sandbox" });
}

export const dynamic = "force-dynamic";

/* POST /api/webhooks/opp
   OPP stuurt een notificatie bij elke statuswijziging. We controleren de
   HTTP-handtekening over de ruwe body en halen het object daarna zelf op bij
   OPP: de body bevat alleen een verwijzing, nooit de status zelf.

   Antwoord binnen 10 seconden met 2xx, anders probeert OPP het opnieuw. */
export async function POST(request) {
  if (!isDirectusConfigured) {
    return NextResponse.json({ error: "Directus is niet geconfigureerd" }, { status: 503 });
  }

  const rawBody = await request.text();
  const verifiedEnv = oppVerifyNotification({
    rawBody,
    headers: request.headers,
    method: "POST",
    path: request.nextUrl.pathname + request.nextUrl.search,
  });
  if (!verifiedEnv && oppHasNotifySecret()) {
    console.warn("OPP webhook: ongeldige handtekening");
    return NextResponse.json({ error: "Ongeldige handtekening" }, { status: 401 });
  }
  if (!verifiedEnv) {
    console.warn("OPP webhook: geen OPP_*_NOTIFY_SECRET ingesteld, alleen terugvragen bij OPP");
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
  }

  const type = body.type || "";
  if (type === "transaction.status.changed") return handleTransaction(body.object_uid, verifiedEnv);
  if (type === "refund.status.changed") return handleRefund(body, verifiedEnv);
  if (type === "merchant.status.changed" || type === "merchant.compliance_status.changed") {
    return handleMerchant(body.object_uid, verifiedEnv);
  }

  /* Onbekend type: bevestigen zodat OPP niet blijft herhalen. */
  return NextResponse.json({ ok: true });
}

const ok = () => NextResponse.json({ ok: true });

async function findBooking(transactionUid) {
  const rows = await directusFetch(
    `/items/bookings?filter[opp_transaction_uid][_eq]=${encodeURIComponent(transactionUid)}&fields=id,status,payment_status,payment_env,participants,session,opp_transaction_uid&limit=1`,
    { noCache: true }
  );
  return Array.isArray(rows) ? rows[0] || null : rows || null;
}

/* ---------- transactie ---------- */

async function handleTransaction(transactionUid, verifiedEnv) {
  if (!transactionUid) return ok();
  const booking = await findBooking(transactionUid);
  if (!booking) return ok();

  const env = verifiedEnv || booking.payment_env;
  if (!env || (verifiedEnv && booking.payment_env && verifiedEnv !== booking.payment_env)) return ok();

  const txn = await oppGetTransaction(env, transactionUid);
  /* OPP niet bereikbaar: 503 zodat OPP het later opnieuw probeert. */
  if (!txn) return NextResponse.json({ error: "Transactie niet op te halen" }, { status: 503 });

  const paymentStatus = oppPaymentStatus(txn.status);
  const waiting = booking.status === "awaiting_payment";
  const now = new Date().toISOString();

  if (paymentStatus === "paid") {
    if (booking.payment_status === "paid") return ok();
    if (waiting) {
      await directusUpdate("bookings", booking.id, { status: "confirmed", payment_status: "paid", paid_at: now });
      await confirmMail(booking.id, env);
      return ok();
    }
    /* Betaald nadat de boeking al verlopen was (plekken zijn vrijgegeven).
       Is er nog plek, dan alsnog bevestigen; anders meteen terugbetalen. */
    if (booking.status === "expired" && await reserveSeats(booking.session, booking.participants || 1)) {
      await directusUpdate("bookings", booking.id, { status: "confirmed", payment_status: "paid", paid_at: now });
      await confirmMail(booking.id, env);
      return ok();
    }
    const refund = await refundPayment(env, transactionUid, {
      message: "Je betaling kwam binnen nadat je plek was vrijgegeven. Je krijgt het volledige bedrag terug.",
      internalReason: "late_payment",
      idempotencyKey: `late-${booking.id}`,
    });
    await directusUpdate("bookings", booking.id, {
      payment_status: "paid",
      paid_at: now,
      refund_status: refund ? "pending" : "failed",
      ...(refund?.uid ? { opp_refund_uid: refund.uid } : {}),
    });
    return ok();
  }

  if (paymentStatus === "canceled" || paymentStatus === "expired" || paymentStatus === "failed") {
    if (!waiting) return ok();
    await directusUpdate("bookings", booking.id, {
      status: paymentStatus === "canceled" ? "cancelled_by_customer" : "expired",
      payment_status: paymentStatus,
    });
    await releaseSeats(booking.session, booking.participants || 1);
    return ok();
  }

  if (paymentStatus === "refunded") {
    await directusUpdate("bookings", booking.id, { payment_status: "refunded" });
    return ok();
  }

  if (paymentStatus && paymentStatus !== booking.payment_status && waiting) {
    await directusUpdate("bookings", booking.id, { payment_status: paymentStatus });
  }
  return ok();
}

/* ---------- refund ---------- */

/* De refund hangt onder de transactie: parent_uid is de transactie. */
async function handleRefund(body, verifiedEnv) {
  const transactionUid = body.parent_uid || "";
  const refundUid = body.object_uid || "";
  if (!transactionUid || !refundUid) return ok();
  const booking = await findBooking(transactionUid);
  if (!booking) return ok();

  const env = verifiedEnv || booking.payment_env;
  if (!env) return ok();
  const refund = await oppGetRefund(env, transactionUid, refundUid);
  if (!refund) return NextResponse.json({ error: "Refund niet op te halen" }, { status: 503 });
  const status = refund.status || "";

  const updates = { opp_refund_uid: refundUid };
  if (status === "completed") {
    updates.refund_status = "completed";
    updates.refunded_at = new Date().toISOString();
    updates.payment_status = "refunded";
    if (booking.status === "confirmed" || booking.status === "awaiting_payment" || booking.status === "expired") {
      updates.status = "refunded";
    }
  } else if (status === "failed") {
    updates.refund_status = "failed";
  } else {
    updates.refund_status = "pending";
  }
  await directusUpdate("bookings", booking.id, updates);
  return ok();
}

/* ---------- merchant ---------- */

const MERCHANT_STATUSES = ["pending", "live", "suspended", "terminated", "blocked"];
const COMPLIANCE_STATUSES = ["unverified", "pending", "verified"];

async function handleMerchant(merchantUid, verifiedEnv) {
  if (!merchantUid) return ok();
  const rows = await directusFetch(
    `/items/providers?filter[opp_merchant_uid][_eq]=${encodeURIComponent(merchantUid)}&fields=id,opp_merchant_status,opp_merchant_env&limit=1`,
    { noCache: true }
  );
  const provider = Array.isArray(rows) ? rows[0] || null : rows || null;
  if (!provider) return ok();

  const env = verifiedEnv || provider.opp_merchant_env;
  if (!env) return ok();
  const merchant = await oppGetMerchant(env, merchantUid);
  if (!merchant) return NextResponse.json({ error: "Merchant niet op te halen" }, { status: 503 });

  const updates = {};
  if (MERCHANT_STATUSES.includes(merchant.status)) updates.opp_merchant_status = merchant.status;
  if (COMPLIANCE_STATUSES.includes(merchant.compliance?.status)) updates.opp_compliance_status = merchant.compliance.status;
  if (merchant.status === "live" && provider.opp_merchant_status !== "live") {
    updates.opp_onboarded_at = new Date().toISOString();
  }
  if (Object.keys(updates).length) await directusUpdate("providers", provider.id, updates);
  return ok();
}
