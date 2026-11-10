import "server-only";

import { createHash, randomBytes } from "crypto";
import { directusCreate, directusFetch, directusUpdate } from "@/lib/directus";

/* Eenmalige links voor e-mail bevestigen en wachtwoord kiezen (docs/04).
   De link bevat 32 willekeurige bytes; in auth_tokens staat alleen de
   sha256. Geldigheid: bevestigen 24 uur, wachtwoord 1 uur (docs/12),
   instelbaar via AUTH_VERIFY_HOURS en AUTH_RESET_HOURS. */

export type Purpose = "verify" | "reset";
export type Intent = "participant" | "provider" | "venue";

const HOURS: Record<Purpose, number> = {
  verify: Number(process.env.AUTH_VERIFY_HOURS) || 24,
  reset: Number(process.env.AUTH_RESET_HOURS) || 1,
};

export const sha256 = (value: string) => createHash("sha256").update(value, "utf8").digest("hex");

export function tokenExpiry(purpose: Purpose, now = Date.now()): string {
  return new Date(now + HOURS[purpose] * 60 * 60 * 1000).toISOString();
}

export async function issueToken({
  userId, email, purpose, intent = "participant", nextPath = null,
}: { userId: string; email: string; purpose: Purpose; intent?: Intent; nextPath?: string | null }): Promise<string | null> {
  const token = randomBytes(32).toString("base64url");
  const now = Date.now();
  /* Een nieuwe link maakt eerdere links met hetzelfde doel ongeldig. */
  const open = await directusFetch(
    `/items/auth_tokens?filter[user][_eq]=${userId}&filter[purpose][_eq]=${purpose}&filter[used_at][_null]=true&fields=id&limit=20`,
    { noCache: true },
  );
  for (const row of Array.isArray(open) ? open : open ? [open] : []) {
    await directusUpdate("auth_tokens", row.id, { used_at: new Date(now).toISOString() });
  }
  const created = await directusCreate("auth_tokens", {
    user: userId,
    email: email.toLowerCase(),
    purpose,
    intent,
    next_path: nextPath,
    token_hash: sha256(token),
    created_at: new Date(now).toISOString(),
    expires_at: tokenExpiry(purpose, now),
  });
  return created?.id ? token : null;
}

export type TokenRow = {
  id: string; user: string; email: string; purpose: Purpose; intent: Intent | null;
  next_path: string | null; expires_at: string; used_at: string | null;
};

/* Geldig = bestaat, juiste doel, niet gebruikt, niet verlopen. */
export function tokenUsable(row: TokenRow | null, purpose: Purpose, now = Date.now()): row is TokenRow {
  return Boolean(row && row.purpose === purpose && !row.used_at && new Date(row.expires_at).getTime() > now);
}

export async function findToken(token: string): Promise<TokenRow | null> {
  if (!token || token.length < 20 || token.length > 100) return null;
  const row = await directusFetch(
    `/items/auth_tokens?filter[token_hash][_eq]=${sha256(token)}&fields=id,user,email,purpose,intent,next_path,expires_at,used_at&limit=1`,
    { noCache: true },
  );
  return row && !Array.isArray(row) ? (row as TokenRow) : null;
}

/* Gebruikt de link: eenmalig. false als hij al gebruikt of verlopen is. */
export async function consumeToken(token: string, purpose: Purpose): Promise<TokenRow | null> {
  const row = await findToken(token);
  if (!tokenUsable(row, purpose)) return null;
  await directusUpdate("auth_tokens", row.id, { used_at: new Date().toISOString() });
  return row;
}
