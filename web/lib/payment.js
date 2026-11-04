/* ===========================================================================
   Betalen, los van de provider. Bepaalt aan de hand van platform_settings
   of er betaald wordt en in welke OPP-omgeving:

     payment_mode off      geen betaling (boeking direct bevestigd)
     payment_mode sandbox  OPP-sandbox, testgeld (de pilot)
     payment_mode live     OPP live, echt geld

   payment_provider "mollie" is de oude koppeling en werkt alleen nog voor
   het aanmaken en ophalen van een betaling.

   Alle bedragen in centen (integer).
   =========================================================================== */

import {
  isOppConfigured, oppCreateTransaction, oppGetTransaction, oppRefundTransaction,
  oppCreateMerchant, oppGetMerchant, oppSimulateMerchantStatus,
} from "./opp";
import { isMollieConfigured, mollieCreatePayment, mollieGetPayment, mollieCheckoutUrl } from "./mollie";

/* "sandbox" | "live" | null (geen betaling). */
export function paymentEnv(settings) {
  return settings.paymentMode === "sandbox" || settings.paymentMode === "live" ? settings.paymentMode : null;
}

export function isPaymentConfigured(settings) {
  const env = paymentEnv(settings);
  if (!env) return false;
  if (settings.paymentProvider === "mollie") return isMollieConfigured;
  return isOppConfigured(env);
}

/* ---------- transactie ---------- */

/* Maakt een betaling aan en geeft { uid, checkoutUrl } terug, of null. */
export async function createPayment(settings, {
  merchantUid, productName, unitCents, quantity, partnerFeeCents,
  returnUrl, webhookUrl, metadata, escrowUntil, idempotencyKey,
}) {
  const env = paymentEnv(settings);
  if (!env) return null;

  if (settings.paymentProvider === "mollie") {
    const payment = await mollieCreatePayment({
      amount: (unitCents * quantity) / 100,
      description: productName,
      redirectUrl: returnUrl,
      webhookUrl,
      metadata,
    });
    return payment?.id ? { uid: payment.id, checkoutUrl: mollieCheckoutUrl(payment) } : null;
  }

  const txn = await oppCreateTransaction(env, {
    merchantUid, productName, unitCents, quantity, partnerFeeCents,
    returnUrl, notifyUrl: webhookUrl, metadata, escrowUntil,
  }, { idempotencyKey });
  return txn?.uid ? { uid: txn.uid, checkoutUrl: txn.redirect_url || null } : null;
}

/* env is de omgeving waarin de transactie is gemaakt (bookings.payment_env). */
export async function getPayment(provider, env, uid) {
  if (!uid) return null;
  if (provider === "mollie") return mollieGetPayment(uid);
  return env ? oppGetTransaction(env, uid) : null;
}

export async function refundPayment(env, transactionUid, { amountCents, message, internalReason, idempotencyKey } = {}) {
  if (!env || !transactionUid) return null;
  return oppRefundTransaction(env, transactionUid, { amountCents, message, internalReason, idempotencyKey });
}

/* ---------- merchant van de workshopgever ---------- */

/* Kan deze workshopgever nu betalingen ontvangen in deze omgeving? */
export function merchantReady(provider, env) {
  return Boolean(
    provider?.opp_merchant_uid &&
    provider.opp_merchant_env === env &&
    provider.opp_merchant_status === "live"
  );
}

/* Sandbox: maak een test-merchant aan en zet hem meteen op live, zodat elke
   workshop in de pilot met testgeld te boeken is zonder KYC. OPP vraagt in de
   sandbox om geen echte gegevens, dus we sturen een testadres en -nummer.
   Geeft de velden terug die op de provider moeten worden opgeslagen. */
export async function createSandboxMerchant(providerId, { notifyUrl }) {
  const merchant = await oppCreateMerchant("sandbox", {
    type: "consumer",
    email: `sandbox+${providerId}@wickedworkshops.nl`,
    phone: "0612345678",
    notifyUrl,
    metadata: { provider_id: providerId },
  });
  if (!merchant?.uid) return null;
  const simulated = await oppSimulateMerchantStatus(merchant.uid, "live");
  return {
    opp_merchant_uid: merchant.uid,
    opp_merchant_env: "sandbox",
    opp_merchant_status: simulated ? "live" : "pending",
    opp_compliance_status: merchant.compliance?.status || "unverified",
    ...(simulated ? { opp_onboarded_at: new Date().toISOString() } : {}),
  };
}

/* Live: echte merchant met echte gegevens. De workshopgever rondt de KYC af
   via compliance.overview_url; de webhook zet de status daarna op live. */
export async function createLiveMerchant(providerId, { type, email, phone, cocNr, notifyUrl, returnUrl }) {
  const merchant = await oppCreateMerchant("live", {
    type, email, phone, cocNr, notifyUrl, returnUrl,
    metadata: { provider_id: providerId },
  });
  if (!merchant?.uid) return null;
  return {
    fields: {
      opp_merchant_uid: merchant.uid,
      opp_merchant_env: "live",
      opp_merchant_status: merchant.status || "pending",
      opp_compliance_status: merchant.compliance?.status || "unverified",
    },
    overviewUrl: merchant.compliance?.overview_url || null,
  };
}

export async function getMerchant(env, uid) {
  return env && uid ? oppGetMerchant(env, uid) : null;
}
