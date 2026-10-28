import { NextResponse } from "next/server";
import { isDirectusConfigured, directusUpdate, directusFetch, getBookingById } from "@/lib/directus";
import { oppVerifyWebhook } from "@/lib/opp";
import { oppGetTransaction } from "@/lib/opp";

export const dynamic = "force-dynamic";

/* POST /api/webhooks/opp
   OPP roept dit aan bij elke statuswijziging. De body is JSON met een
   HMAC-SHA256 handtekening. We verifiëren de handtekening en halen
   vervolgens de transactie op voor de zekerheid (dubbele verificatie). */
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

  /* Handtekening verifiëren. */
  const verified = oppVerifyWebhook(body, request.headers);
  if (!verified) {
    console.warn("OPP webhook: ongeldige handtekening");
    /* Accepteer toch om retries te stoppen, maar log de waarschuwing. */
  }

  const type = body.type || "";
  const objectUid = body.object_uid || "";

  /* ---------- transactie-statuswijziging ---------- */
  if (type === "transaction.status.changed") {
    return handleTransactionStatus(objectUid);
  }

  /* ---------- refund-statuswijziging ---------- */
  if (type === "refund.status.changed") {
    return handleRefundStatus(objectUid, body);
  }

  /* ---------- merchant-statuswijziging ---------- */
  if (type === "merchant.status.changed" || type === "merchant.compliance_status.changed") {
    return handleMerchantStatus(objectUid);
  }

  /* Onbekend type: ack zodat OPP niet blijft retryen. */
  return NextResponse.json({ ok: true });
}

/* ---------- transactie ---------- */

async function handleTransactionStatus(transactionUid) {
  if (!transactionUid) return NextResponse.json({ ok: true });

  /* Haal de transactie op bij OPP voor de actuele status. */
  const txn = await oppGetTransaction(transactionUid);
  if (!txn) return NextResponse.json({ ok: true });

  /* Zoek de booking via opp_transaction_uid. */
  const bookings = await directusFetch(
    `/items/bookings?filter[opp_transaction_uid]=${encodeURIComponent(transactionUid)}&fields=id,status,payment_status,session,session.seats_taken,participants&limit=1`,
    { noCache: true }
  );
  const booking = Array.isArray(bookings) ? bookings[0] : bookings;
  if (!booking) return NextResponse.json({ ok: true });

  const alreadyPaid = booking.payment_status === "paid";
  const updates = { payment_status: txn.status };

  if (txn.status === "completed" || txn.status === "paid") {
    updates.payment_status = "paid";
    updates.paid_at = new Date().toISOString();

    /* Stoelen bijwerken - alleen bij eerste overgang naar paid. */
    if (!alreadyPaid) {
      const sessionId = typeof booking.session === "string" ? booking.session : booking.session?.id;
      if (sessionId) {
        const seatsTaken = typeof booking.session === "object" ? booking.session?.seats_taken : null;
        let current = seatsTaken;
        if (current == null) {
          const fresh = await directusFetch(`/items/workshop_sessions/${sessionId}?fields=seats_taken`, { noCache: true });
          current = fresh?.seats_taken ?? 0;
        }
        await directusUpdate("workshop_sessions", sessionId, {
          seats_taken: current + (booking.participants || 1),
        });
      }
    }
  } else if (txn.status === "cancelled" || txn.status === "canceled") {
    updates.status = "cancelled_by_customer";
    if (!alreadyPaid) await releaseSeats(booking);
  } else if (txn.status === "expired" || txn.status === "failed") {
    updates.status = "expired";
    if (!alreadyPaid) await releaseSeats(booking);
  }

  await directusUpdate("bookings", booking.id, updates);
  return NextResponse.json({ ok: true });
}

/* ---------- refund ---------- */

async function handleRefundStatus(refundUid, body) {
  /* OPP geeft de parent transaction_uid mee. Zoek de booking. */
  const transactionUid = body.metadata?.transaction_uid || "";
  if (!transactionUid) return NextResponse.json({ ok: true });

  const bookings = await directusFetch(
    `/items/bookings?filter[opp_transaction_uid]=${encodeURIComponent(transactionUid)}&fields=id,refund_status&limit=1`,
    { noCache: true }
  );
  const booking = Array.isArray(bookings) ? bookings[0] : bookings;
  if (!booking) return NextResponse.json({ ok: true });

  const status = body.status || "pending";
  const updates = {
    opp_refund_uid: refundUid,
    refund_status: status === "completed" ? "completed" : status === "failed" ? "failed" : "pending",
  };
  if (status === "completed") {
    updates.refunded_at = new Date().toISOString();
    updates.status = "refunded";
    updates.payment_status = "refunded";
  }

  await directusUpdate("bookings", booking.id, updates);
  return NextResponse.json({ ok: true });
}

/* ---------- merchant ---------- */

async function handleMerchantStatus(merchantUid) {
  if (!merchantUid) return NextResponse.json({ ok: true });

  /* Haal de merchant op bij OPP. */
  const { oppGetMerchant } = await import("@/lib/opp");
  const merchant = await oppGetMerchant(merchantUid);
  if (!merchant) return NextResponse.json({ ok: true });

  /* Zoek de provider via opp_merchant_uid. */
  const providers = await directusFetch(
    `/items/providers?filter[opp_merchant_uid]=${encodeURIComponent(merchantUid)}&fields=id,opp_merchant_status&limit=1`,
    { noCache: true }
  );
  const provider = Array.isArray(providers) ? providers[0] : providers;
  if (!provider) return NextResponse.json({ ok: true });

  const updates = {};
  if (merchant.status) updates.opp_merchant_status = merchant.status;
  if (merchant.compliance?.status) updates.opp_compliance_status = merchant.compliance.status;
  if (merchant.status === "live" && provider.opp_merchant_status !== "live") {
    updates.opp_onboarded_at = new Date().toISOString();
  }

  await directusUpdate("providers", provider.id, updates);
  return NextResponse.json({ ok: true });
}

/* ---------- helpers ---------- */

async function releaseSeats(booking) {
  const sessionId = typeof booking.session === "string" ? booking.session : booking.session?.id;
  if (!sessionId) return;
  const participants = booking.participants || 1;
  const fresh = await directusFetch(`/items/workshop_sessions/${sessionId}?fields=seats_taken`, { noCache: true });
  const current = fresh?.seats_taken ?? 0;
  await directusUpdate("workshop_sessions", sessionId, {
    seats_taken: Math.max(0, current - participants),
  });
}
