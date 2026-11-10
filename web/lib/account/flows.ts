import "server-only";

import { directusFetch } from "@/lib/directus";
import { directusLogin, setAuthCookies } from "@/lib/auth";
import { sendMail } from "@/lib/mail/send";
import { SITE } from "@/lib/mail/notify";
import { accountVerify, passwordReset } from "@/mail/templates";
import { issueToken, type Intent } from "./tokens";
import { findUserById, type AccountUser } from "./users";
import { landingFor } from "./redirect";

/* Gedeelde stappen van de auth-routes. */

export const LOGIN_ERROR =
  "Dit e-mailadres en dit wachtwoord horen niet bij elkaar. Probeer het nog eens, of kies een nieuw wachtwoord.";

export async function sendVerifyMail(user: AccountUser, intent: Intent, nextPath: string | null = null) {
  const token = await issueToken({ userId: user.id, email: user.email, purpose: "verify", intent, nextPath });
  if (!token) return false;
  const url = `${SITE}/account-maken/bevestigen?token=${encodeURIComponent(token)}`;
  /* Elke nieuwe link is een nieuwe mail; de token-hash is de sleutel. */
  const result = await sendMail("account_verify", `${user.id}:${token.slice(0, 12)}`, user.email, accountVerify({ firstName: user.first_name, url, intent }));
  return result === "sent" || result === "skipped";
}

export async function sendResetMail(user: AccountUser) {
  const token = await issueToken({ userId: user.id, email: user.email, purpose: "reset" });
  if (!token) return false;
  const url = `${SITE}/wachtwoord-kiezen?token=${encodeURIComponent(token)}`;
  const result = await sendMail("password_reset", `${user.id}:${token.slice(0, 12)}`, user.email, passwordReset({ firstName: user.first_name, url }));
  return result === "sent" || result === "skipped";
}

export async function isProviderUser(userId: string): Promise<boolean> {
  const row = await directusFetch(`/items/providers?filter[user][_eq]=${encodeURIComponent(userId)}&fields=id&limit=1`, { noCache: true });
  return Boolean(row && !Array.isArray(row));
}

/* Inloggen met e-mail en wachtwoord en de cookies zetten. Geeft de
   bestemming terug, of null als het niet lukte. */
export async function loginAndRedirect(
  email: string, password: string, { remember = true, next = null }: { remember?: boolean; next?: string | null } = {},
): Promise<{ redirect: string; user: { id: string; email: string; first_name: string } } | null> {
  const tokens = await directusLogin(email, password);
  if (!tokens?.accessToken) return null;
  const me = await fetchMe(tokens.accessToken);
  if (!me?.id) return null;
  const account = await findUserById(me.id);
  const context = account?.last_context || ((await isProviderUser(me.id)) ? "provider" : "participant");
  const user = { id: me.id, email: me.email, first_name: me.first_name || "" };
  await setAuthCookies({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, expires: tokens.expires, remember, user });
  return { redirect: landingFor({ next, context }), user };
}

async function fetchMe(accessToken: string): Promise<{ id: string; email: string; first_name?: string } | null> {
  const base = (process.env.DIRECTUS_URL || "").replace(/\/$/, "");
  try {
    const res = await fetch(`${base}/users/me?fields=id,email,first_name`, { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" });
    return res.ok ? (await res.json()).data : null;
  } catch {
    return null;
  }
}
