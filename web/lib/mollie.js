/* ===========================================================================
   Mollie-koppeling.

   Leest MOLLIE_API_KEY uit de omgeving (test_... of live_...). De Mollie
   REST API is klein genoeg om zonder SDK te bevragen: een POST naar
   /v2/payments maakt een betaalpagina aan, GET op het id leest de status.

   Flow:
     1. /api/checkout maakt een booking + Mollie-payment aan en stuurt de
        bezoeker naar payment._links.checkout.href
     2. Mollie stuurt de bezoeker terug naar redirectUrl (/boeking/terug)
     3. Mollie roept webhookUrl aan (/api/webhooks/mollie) met alleen het
        payment-id; wij halen de status zelf op — dat is tevens de
        verificatie dat de webhook echt is (geen shared secret nodig).
   =========================================================================== */

const MOLLIE_API_KEY = process.env.MOLLIE_API_KEY || "";
const MOLLIE_API = "https://api.mollie.com/v2";

export const isMollieConfigured = Boolean(MOLLIE_API_KEY);

async function mollieRequest(path, options = {}) {
  if (!isMollieConfigured) return null;
  try {
    const res = await fetch(`${MOLLIE_API}${path}`, {
      method: options.method || "GET",
      headers: {
        Authorization: `Bearer ${MOLLIE_API_KEY}`,
        "Content-Type": "application/json",
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`Mollie ${res.status} voor ${path}:`, text);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error("Mollie onbereikbaar:", err.message);
    return null;
  }
}

/* Maak een betaling aan. amount in euro's (number), description is wat de
   klant op zijn afschrift ziet. metadata nemen we mee om de booking terug
   te vinden in de webhook. */
export async function mollieCreatePayment({ amount, description, redirectUrl, webhookUrl, metadata }) {
  return mollieRequest("/payments", {
    method: "POST",
    body: {
      amount: { currency: "EUR", value: Number(amount).toFixed(2) },
      description,
      redirectUrl,
      ...(webhookUrl ? { webhookUrl } : {}),
      metadata,
    },
  });
}

/* Status van een betaling ophalen. De webhook gebruikt dit om te
   verifiëren wat er echt met de betaling is gebeurd. */
export async function mollieGetPayment(id) {
  if (!id) return null;
  return mollieRequest(`/payments/${encodeURIComponent(id)}`);
}

/* De URL van de Mollie-betaalpagina voor deze payment. */
export function mollieCheckoutUrl(payment) {
  return payment?._links?.checkout?.href || null;
}
