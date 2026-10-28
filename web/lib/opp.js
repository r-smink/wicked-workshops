/* ===========================================================================
   Online Payment Platform (OPP) koppeling.

   Leest OPP_API_KEY en OPP_API_URL uit de omgeving. OPP_API_URL valt
   standaard terug op de sandbox. Alle bedragen in centen (integer).

   Flow:
     1. Deelnemer boekt en betaalt direct: /api/checkout maakt een OPP-
        transactie aan en stuurt de deelnemer naar de checkout-URL.
     2. OPP stuurt de deelnemer terug naar returnUrl (/boeking/terug).
     3. OPP roept notifyUrl aan (/api/webhooks/opp) met een gesigneerde
        POST. Wij verifiëren de HMAC-SHA256 handtekening.
     4. Geld blijft in escrow tot wij een withdrawal aanmaken na de
        workshop, of een refund als de datum niet doorgaat.
   =========================================================================== */

import { createHmac } from "crypto";

const OPP_API_KEY = process.env.OPP_API_KEY || "";
const OPP_API_URL = (process.env.OPP_API_URL || "https://api-sandbox.onlinebetaalplatform.nl/v1").replace(/\/$/, "");
const OPP_WEBHOOK_SECRET = process.env.OPP_WEBHOOK_SECRET || "";

export const isOppConfigured = Boolean(OPP_API_KEY);

/* ---------- basis request ---------- */

async function oppRequest(path, options = {}) {
  if (!isOppConfigured) return null;
  try {
    const res = await fetch(`${OPP_API_URL}${path}`, {
      method: options.method || "GET",
      headers: {
        Authorization: `Bearer ${OPP_API_KEY}`,
        "Content-Type": "application/json",
        ...(options.idempotencyKey ? { "Idempotency-Key": options.idempotencyKey } : {}),
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`OPP ${res.status} voor ${path}:`, text);
      return null;
    }
    if (res.status === 204) return {};
    return res.json();
  } catch (err) {
    console.error("OPP onbereikbaar:", err.message);
    return null;
  }
}

/* ---------- transacties ---------- */

/* Maak een transactie aan. Geld gaat naar escrow tot withdrawal of refund.
   amountCents is een integer in centen. */
export async function oppCreateTransaction({
  merchantUid, amountCents, description, returnUrl, notifyUrl, metadata,
  paymentMethod = "ideal", idempotencyKey,
}) {
  return oppRequest("/transactions", {
    method: "POST",
    idempotencyKey,
    body: {
      merchant_uid: merchantUid,
      amount: amountCents,
      currency: "EUR",
      payment_method: paymentMethod,
      notify_url: notifyUrl,
      return_url: returnUrl,
      metadata: metadata || {},
      order: {
        price: amountCents,
        shipping: 0,
        discount: 0,
      },
    },
  });
}

/* Haal een transactie op. */
export async function oppGetTransaction(uid) {
  if (!uid) return null;
  return oppRequest(`/transactions/${encodeURIComponent(uid)}`);
}

/* De checkout-URL uit de transactie-response. */
export function oppCheckoutUrl(transaction) {
  return transaction?.redirect_url || transaction?.payment_url || null;
}

/* ---------- refunds ---------- */

/* Maak een volledige of gedeeltelijke refund aan.
   amountCents is optioneel; leeg = volledige refund. */
export async function oppRefundTransaction(transactionUid, { amountCents, description, idempotencyKey } = {}) {
  if (!transactionUid) return null;
  const body = {};
  if (amountCents != null) body.amount = amountCents;
  if (description) body.description = description;
  return oppRequest(`/transactions/${encodeURIComponent(transactionUid)}/refunds`, {
    method: "POST",
    idempotencyKey,
    body,
  });
}

/* ---------- merchants ---------- */

/* Maak een merchant aan (onboarding workshopgever). */
export async function oppCreateMerchant({ type = "consumer", country = "nld", email, notifyUrl, metadata }) {
  return oppRequest("/merchants", {
    method: "POST",
    body: {
      type,
      country,
      emailaddress: email,
      notify_url: notifyUrl,
      metadata: metadata || {},
    },
  });
}

/* Haal merchant-gegevens op. */
export async function oppGetMerchant(uid) {
  if (!uid) return null;
  return oppRequest(`/merchants/${encodeURIComponent(uid)}`);
}

/* ---------- withdrawals (uitbetaling aan workshopgever) ---------- */

/* Maak een withdrawal aan om escrowed fondsen vrij te geven. */
export async function oppCreateWithdrawal(merchantUid, { amountCents, description } = {}) {
  if (!merchantUid) return null;
  const body = {};
  if (amountCents != null) body.amount = amountCents;
  if (description) body.description = description;
  return oppRequest(`/merchants/${encodeURIComponent(merchantUid)}/withdrawals`, {
    method: "POST",
    body,
  });
}

/* ---------- webhook verificatie ---------- */

/* Verifieer de HMAC-SHA256 handtekening van een OPP webhook.
   OPP stuurt Signature, Digest en Date headers mee.
   Retourneert true als de handtekening klopt. */
export function oppVerifyWebhook(body, headers) {
  if (!OPP_WEBHOOK_SECRET) return false;

  const digest = headers.get?.("digest") || headers["digest"];
  const signature = headers.get?.("signature") || headers["signature"];
  if (!digest || !signature) return false;

  /* Controleer de body digest. */
  const bodyHash = createHmac("sha256", OPP_WEBHOOK_SECRET)
    .update(typeof body === "string" ? body : JSON.stringify(body))
    .digest("base64");

  const expectedDigest = `SHA-256=${bodyHash}`;
  if (digest !== expectedDigest) return false;

  return true;
}

/* ---------- mock-responses voor pilot-modus ---------- */

let mockCounter = 0;

export function oppMockTransaction({ amountCents, metadata }) {
  mockCounter += 1;
  return {
    uid: `mock_txn_${mockCounter}_${Date.now()}`,
    status: "completed",
    amount: amountCents,
    currency: "EUR",
    metadata,
    redirect_url: null,
  };
}

export function oppMockRefund(transactionUid) {
  mockCounter += 1;
  return {
    uid: `mock_ref_${mockCounter}_${Date.now()}`,
    status: "completed",
    transaction_uid: transactionUid,
  };
}

export function oppMockMerchant({ email }) {
  mockCounter += 1;
  return {
    uid: `mock_mer_${mockCounter}_${Date.now()}`,
    status: "live",
    emailaddress: email,
    compliance: { status: "verified" },
  };
}

export function oppMockWithdrawal(merchantUid) {
  mockCounter += 1;
  return {
    uid: `mock_wdr_${mockCounter}_${Date.now()}`,
    status: "completed",
    merchant_uid: merchantUid,
  };
}
