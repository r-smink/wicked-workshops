/* ===========================================================================
   Online Payment Platform (OPP) koppeling. Alleen op de server.

   Twee gescheiden omgevingen (docs.onlinepaymentplatform.com, "Sandbox vs.
   production environments"). Wat in de ene bestaat, bestaat niet in de
   andere, dus elke functie krijgt de omgeving mee: "sandbox" of "live".

     OPP_SANDBOX_API_KEY        sandbox-sleutel (OPP_API_KEY werkt ook nog)
     OPP_SANDBOX_NOTIFY_SECRET  geheim voor webhook-handtekeningen (sandbox)
     OPP_LIVE_API_KEY           live-sleutel, pas na go-live met OPP
     OPP_LIVE_NOTIFY_SECRET     geheim voor webhook-handtekeningen (live)

   Flow:
     1. /api/checkout maakt een transactie in escrow tot na de workshop en
        stuurt de deelnemer naar redirect_url.
     2. OPP stuurt de deelnemer terug naar return_url (/boeking/terug).
     3. OPP stuurt een gesigneerde notificatie naar /api/webhooks/opp. Wij
        controleren de handtekening en halen de transactie zelf op.
     4. Na escrow_date komt het geld vrij voor de workshopgever. Gaat een
        datum niet door, dan volgt een refund.

   Alle bedragen in centen (integer).
   =========================================================================== */

import { createHash, createHmac, timingSafeEqual } from "crypto";

const ENVIRONMENTS = {
  sandbox: {
    url: "https://api-sandbox.onlinebetaalplatform.nl/v1",
    key: process.env.OPP_SANDBOX_API_KEY || process.env.OPP_API_KEY || "",
    secret: process.env.OPP_SANDBOX_NOTIFY_SECRET || process.env.OPP_WEBHOOK_SECRET || "",
  },
  live: {
    url: "https://api.onlinebetaalplatform.nl/v1",
    key: process.env.OPP_LIVE_API_KEY || "",
    secret: process.env.OPP_LIVE_NOTIFY_SECRET || "",
  },
};

function envConfig(env) {
  const config = ENVIRONMENTS[env];
  if (!config) throw new Error(`Onbekende OPP-omgeving: ${env}`);
  return config;
}

export function isOppConfigured(env) {
  return Boolean(ENVIRONMENTS[env]?.key);
}

/* ---------- basis request ---------- */

/* OPP wil requests na elkaar, niet parallel ("Sequential vs. parallel API
   operations"). Alle aanroepen hieronder worden dus steeds afgewacht. */
async function oppRequest(env, path, { method = "GET", body, idempotencyKey } = {}) {
  const { url, key } = envConfig(env);
  if (!key) return null;
  try {
    const res = await fetch(`${url}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`OPP ${env} ${res.status} voor ${method} ${path}:`, text.slice(0, 500));
      return null;
    }
    if (res.status === 204) return {};
    return res.json();
  } catch (err) {
    console.error(`OPP ${env} onbereikbaar:`, err.message);
    return null;
  }
}

/* ---------- transacties ---------- */

/* escrow_date in het formaat dat OPP wil (YYYY-MM-DD HH:MM:SS), in
   Nederlandse tijd, en minstens 15 minuten in de toekomst. */
export function oppEscrowDate(date, now = Date.now()) {
  const min = now + 20 * 60 * 1000;
  const at = new Date(Math.max(new Date(date).getTime(), min));
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Amsterdam", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
    }).formatToParts(at).map((p) => [p.type, p.value])
  );
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

/* De request body voor "Create transaction". Los van de fetch zodat hij
   getest kan worden. products moeten optellen tot total_price. */
export function oppTransactionBody({
  merchantUid, productName, unitCents, quantity, partnerFeeCents,
  returnUrl, notifyUrl, metadata, escrowUntil,
}) {
  const totalCents = unitCents * quantity;
  return {
    merchant_uid: merchantUid,
    locale: "nl",
    payment_method: "ideal",
    products: [{ name: String(productName).slice(0, 120), price: unitCents, quantity }],
    total_price: totalCents,
    ...(partnerFeeCents > 0 ? { partner_fee: partnerFeeCents } : {}),
    ...(escrowUntil ? { escrow: true, escrow_date: oppEscrowDate(escrowUntil) } : {}),
    return_url: returnUrl,
    notify_url: notifyUrl,
    metadata: metadata || {},
  };
}

export async function oppCreateTransaction(env, params, { idempotencyKey } = {}) {
  return oppRequest(env, "/transactions", {
    method: "POST",
    idempotencyKey,
    body: oppTransactionBody(params),
  });
}

export async function oppGetTransaction(env, uid) {
  if (!uid) return null;
  return oppRequest(env, `/transactions/${encodeURIComponent(uid)}`);
}

/* Escrowdatum van een bestaande transactie wijzigen ("Update transaction",
   POST /transactions/{uid} met escrow_date). Later zetten houdt het geld
   langer vast (verzetten, aanbod, klacht); op nu zetten geeft het vrij.
   OPP accepteert minstens 15 minuten vooruit; oppEscrowDate zorgt daarvoor. */
export function oppEscrowUpdateBody(escrowDate, now = Date.now()) {
  return { escrow_date: oppEscrowDate(escrowDate, now) };
}

export async function oppUpdateTransaction(env, uid, { escrowDate } = {}) {
  if (!uid || !escrowDate) return null;
  return oppRequest(env, `/transactions/${encodeURIComponent(uid)}`, {
    method: "POST",
    body: oppEscrowUpdateBody(escrowDate),
  });
}

/* OPP-status naar payment_status op de boeking. reserved is betaald en
   staat in escrow; dat telt als betaald. */
export function oppPaymentStatus(oppStatus) {
  switch (oppStatus) {
    case "completed":
    case "reserved":
      return "paid";
    case "created":
      return "open";
    case "pending":
    case "planned":
      return "pending";
    case "cancelled":
      return "canceled";
    case "expired":
      return "expired";
    case "failed":
      return "failed";
    case "refunded":
    case "chargeback":
      return "refunded";
    default:
      return null;
  }
}

/* ---------- refunds ---------- */

export async function oppRefundTransaction(env, transactionUid, { amountCents, message, internalReason, idempotencyKey } = {}) {
  if (!transactionUid) return null;
  return oppRequest(env, `/transactions/${encodeURIComponent(transactionUid)}/refunds`, {
    method: "POST",
    idempotencyKey,
    body: {
      ...(amountCents != null ? { amount: amountCents, currency: "EUR" } : {}),
      ...(message ? { message } : {}),
      ...(internalReason ? { internal_reason: internalReason } : {}),
    },
  });
}

export async function oppGetRefund(env, transactionUid, refundUid) {
  if (!transactionUid || !refundUid) return null;
  return oppRequest(env, `/transactions/${encodeURIComponent(transactionUid)}/refunds/${encodeURIComponent(refundUid)}`);
}

/* ---------- merchants ---------- */

/* consumer: particulier (telefoon nodig), business: KvK-nummer nodig. */
export async function oppCreateMerchant(env, { type = "consumer", email, phone, cocNr, notifyUrl, returnUrl, metadata }) {
  return oppRequest(env, "/merchants", {
    method: "POST",
    body: {
      type,
      country: "nld",
      emailaddress: email,
      ...(phone ? { phone } : {}),
      ...(type === "business" && cocNr ? { coc_nr: cocNr } : {}),
      notify_url: notifyUrl,
      ...(returnUrl ? { return_url: returnUrl } : {}),
      metadata: metadata || {},
    },
  });
}

export async function oppGetMerchant(env, uid) {
  if (!uid) return null;
  return oppRequest(env, `/merchants/${encodeURIComponent(uid)}`);
}

/* Alleen sandbox: zet een merchant op een status zonder echte KYC
   ("Simulate a merchant status update"). */
export async function oppSimulateMerchantStatus(uid, status = "live") {
  return oppRequest("sandbox", `/merchants/${encodeURIComponent(uid)}/update-status`, {
    method: "POST",
    body: { status },
  });
}

/* ---------- webhook verificatie ---------- */

/* Controleer een notificatie volgens "How to validate webhook signatures":
   HTTP Signatures (draft-cavage) met hmac-sha256 over (request-target),
   host, date en digest, en een Digest van de ruwe body.

   Geeft de omgeving terug waarvan het geheim klopt ("sandbox" of "live"),
   of null als geen enkel geconfigureerd geheim klopt. */
export function oppVerifyNotification({ rawBody, headers, method = "POST", path }) {
  const get = (name) => headers.get?.(name) ?? headers[name] ?? null;
  const digest = get("digest");
  const signatureHeader = get("signature");
  if (!digest || !signatureHeader) return null;

  const expectedDigest = `SHA-256=${createHash("sha256").update(rawBody, "utf8").digest("base64")}`;
  if (!safeEqual(digest, expectedDigest)) return null;

  const params = parseSignatureHeader(signatureHeader);
  if (!params.signature || (params.algorithm && params.algorithm !== "hmac-sha256")) return null;

  const names = (params.headers || "date").toLowerCase().split(/\s+/).filter(Boolean);
  const lines = [];
  for (const name of names) {
    if (name === "(request-target)") {
      lines.push(`(request-target): ${method.toLowerCase()} ${path}`);
    } else {
      const value = get(name);
      if (value == null) return null;
      lines.push(`${name}: ${value}`);
    }
  }
  const signingString = lines.join("\n");

  for (const env of ["sandbox", "live"]) {
    const { secret } = ENVIRONMENTS[env];
    if (!secret) continue;
    const expected = createHmac("sha256", secret).update(signingString, "utf8").digest("base64");
    if (safeEqual(params.signature, expected)) return env;
  }
  return null;
}

export function oppHasNotifySecret() {
  return Boolean(ENVIRONMENTS.sandbox.secret || ENVIRONMENTS.live.secret);
}

function parseSignatureHeader(header) {
  const out = {};
  for (const match of header.matchAll(/(\w+)="([^"]*)"/g)) out[match[1]] = match[2];
  return out;
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}
