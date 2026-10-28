/* ===========================================================================
   Payment facade: delegeert naar OPP of Mollie op basis van de feature
   flag platform_settings.payment_provider.

   Alle functies verwachten bedragen in centen (integer).
   =========================================================================== */

import {
  isOppConfigured,
  oppCreateTransaction, oppGetTransaction, oppCheckoutUrl,
  oppRefundTransaction, oppCreateMerchant, oppGetMerchant,
  oppCreateWithdrawal, oppVerifyWebhook,
  oppMockTransaction, oppMockRefund, oppMockMerchant, oppMockWithdrawal,
} from "./opp";
import {
  isMollieConfigured,
  mollieCreatePayment, mollieGetPayment, mollieCheckoutUrl,
} from "./mollie";

/* ---------- provider check ---------- */

export function isPaymentConfigured(provider) {
  if (provider === "mollie") return isMollieConfigured;
  return isOppConfigured;
}

/* ---------- transactie aanmaken ---------- */

/* Maakt een betaling aan en retourneert { uid, checkoutUrl }.
   Bij pilot-modus (pilotNoPayments=true) retourneert dit een mock. */
export async function createPayment(provider, {
  merchantUid, amountCents, description, returnUrl, webhookUrl, metadata, pilotNoPayments,
}) {
  /* Pilot: geen echte API-calls. */
  if (pilotNoPayments) {
    const mock = oppMockTransaction({ amountCents, metadata });
    return { uid: mock.uid, checkoutUrl: null };
  }

  if (provider === "mollie") {
    const payment = await mollieCreatePayment({
      amount: amountCents / 100,
      description,
      redirectUrl: returnUrl,
      webhookUrl,
      metadata,
    });
    return {
      uid: payment?.id || null,
      checkoutUrl: mollieCheckoutUrl(payment),
    };
  }

  /* OPP (standaard). */
  const txn = await oppCreateTransaction({
    merchantUid,
    amountCents,
    description,
    returnUrl,
    notifyUrl: webhookUrl,
    metadata,
    idempotencyKey: metadata?.booking_code,
  });
  return {
    uid: txn?.uid || null,
    checkoutUrl: oppCheckoutUrl(txn),
  };
}

/* ---------- transactie ophalen ---------- */

export async function getPayment(provider, uid) {
  if (!uid) return null;
  if (provider === "mollie") return mollieGetPayment(uid);
  return oppGetTransaction(uid);
}

/* ---------- refund ---------- */

export async function refundPayment(provider, transactionUid, { amountCents, description, pilotNoPayments } = {}) {
  if (pilotNoPayments) {
    return oppMockRefund(transactionUid);
  }
  if (provider === "mollie") {
    /* Mollie refund API is anders; voor nu niet geïmplementeerd.
       Mollie wordt alleen als fallback bewaard, refunds gaan via OPP. */
    console.warn("Mollie refunds zijn niet geïmplementeerd in de facade.");
    return null;
  }
  return oppRefundTransaction(transactionUid, { amountCents, description });
}

/* ---------- withdrawal (uitbetaling) ---------- */

export async function createWithdrawal(provider, merchantUid, { amountCents, description, pilotNoPayments } = {}) {
  if (pilotNoPayments) {
    return oppMockWithdrawal(merchantUid);
  }
  if (provider === "mollie") {
    console.warn("Mollie withdrawals zijn niet geïmplementeerd in de facade.");
    return null;
  }
  return oppCreateWithdrawal(merchantUid, { amountCents, description });
}

/* ---------- merchant ---------- */

export async function createMerchant(provider, { email, notifyUrl, pilotNoPayments, metadata }) {
  if (pilotNoPayments) {
    return oppMockMerchant({ email });
  }
  if (provider === "mollie") {
    console.warn("Mollie merchant onboarding is niet geïmplementeerd in de facade.");
    return null;
  }
  return oppCreateMerchant({ email, notifyUrl, metadata });
}

export async function getMerchant(provider, uid) {
  if (!uid) return null;
  if (provider === "mollie") return null;
  return oppGetMerchant(uid);
}

/* ---------- webhook verificatie ---------- */

export function verifyWebhook(provider, body, headers) {
  if (provider === "mollie") return true; /* Mollie verificeert via fetch-back. */
  return oppVerifyWebhook(body, headers);
}
