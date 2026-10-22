/* ===========================================================================
   Versleuteling van losse gevoelige velden (zoals het IBAN van een
   workshopgever) voordat ze in Directus worden opgeslagen.

   AES-256-GCM met een sleutel uit FIELD_ENCRYPTION_KEY (32 bytes, base64).
   Genereren: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   Gebruik lokaal en op Vercel dezelfde sleutel: beide schrijven naar
   dezelfde Directus. Raak je de sleutel kwijt, dan zijn de opgeslagen
   waarden niet meer te lezen.

   Versleutelde waarden beginnen met "enc:v1:". Oude, onversleutelde waarden
   worden bij het lezen ongewijzigd teruggegeven en bij de volgende opslag
   alsnog versleuteld. Alleen server-side gebruiken.
   =========================================================================== */

import crypto from "node:crypto";

const PREFIX = "enc:v1:";

function getKey() {
  const raw = process.env.FIELD_ENCRYPTION_KEY || "";
  if (!raw) return null;
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    console.error("FIELD_ENCRYPTION_KEY moet 32 bytes (base64) zijn");
    return null;
  }
  return key;
}

export function encryptField(value) {
  if (value == null || value === "") return value ?? null;
  const str = String(value);
  if (str.startsWith(PREFIX)) return str;
  const key = getKey();
  if (!key) {
    console.warn("FIELD_ENCRYPTION_KEY ontbreekt: gevoelig veld wordt onversleuteld opgeslagen");
    return str;
  }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([cipher.update(str, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return PREFIX + [iv, tag, data].map((b) => b.toString("base64")).join(":");
}

export function decryptField(value) {
  if (value == null || value === "") return value ?? null;
  const str = String(value);
  if (!str.startsWith(PREFIX)) return str;
  const key = getKey();
  if (!key) return null;
  try {
    const [iv, tag, data] = str.slice(PREFIX.length).split(":").map((p) => Buffer.from(p, "base64"));
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch (err) {
    console.error("Kon versleuteld veld niet lezen:", err.message);
    return null;
  }
}
