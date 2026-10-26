/* ===========================================================================
   Auth-helpers voor Directus.

   Directus heeft een ingebouwd auth-systeem via /auth/login en /users.
   We slaan het access_token op in een HTTP-only cookie, zodat het nooit
   in de client-side JavaScript zit. Deze helpers worden server-side
   gebruikt in API-routes en server-componenten.

   Cookie-naam: "ww_token" — HTTP-only, SameSite=Lax, 7 dagen geldig.
   =========================================================================== */

import { cookies } from "next/headers";

const DIRECTUS_URL = process.env.DIRECTUS_URL || "";
const TOKEN_COOKIE = "ww_token";
const USER_COOKIE = "ww_user";
const MAX_AGE = 60 * 60 * 24 * 7; /* 7 dagen */

export function isAuthConfigured() {
  return Boolean(DIRECTUS_URL);
}

/* Login bij Directus: POST /auth/login met email + password.
   Retourneert { accessToken, refreshToken, user } of null. */
export async function directusLogin(email, password) {
  if (!isAuthConfigured()) return null;
  try {
    const res = await fetch(`${DIRECTUS_URL.replace(/\/$/, "")}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return {
      accessToken: json.data?.access_token || null,
      refreshToken: json.data?.refresh_token || null,
      expires: json.data?.expires || null,
    };
  } catch {
    return null;
  }
}

/* Haal de huidige gebruiker op via /users/me met een access token. */
export async function directusMe(accessToken) {
  if (!isAuthConfigured() || !accessToken) return null;
  try {
    const res = await fetch(`${DIRECTUS_URL.replace(/\/$/, "")}/users/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

/* Rol-UUID's in Directus. Via env overschrijfbaar voor als de
   Directus-instantie opnieuw wordt opgezet. */
const ROLE_IDS = {
  visitor: process.env.DIRECTUS_ROLE_CUSTOMER || "8750bbdb-b2b6-44ce-927e-08c73d12355b",
  provider: process.env.DIRECTUS_ROLE_PROVIDER || "fe8c4ce9-dd08-4aca-aa51-98c04b45df93",
};

export function providerRoleId() {
  return ROLE_IDS.provider;
}

/* Maak een nieuwe Directus-gebruiker aan. Gebruikt de static token
   (admin-niveau) omdat /users POST admin-rechten vereist. `role` is
   "visitor" of "provider" en wordt vertaald naar de Directus-rol. */
export async function directusRegister({ email, password, first_name, last_name, role }) {
  if (!isAuthConfigured()) return null;
  const staticToken = process.env.DIRECTUS_STATIC_TOKEN || "";
  try {
    const res = await fetch(`${DIRECTUS_URL.replace(/\/$/, "")}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${staticToken}`,
      },
      body: JSON.stringify({
        email,
        password,
        first_name: first_name || null,
        last_name: last_name || null,
        role: ROLE_IDS[role] || ROLE_IDS.visitor,
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("Directus register:", res.status, text);
      return null;
    }
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.error("Directus register fout:", err.message);
    return null;
  }
}

/* Cookie-helpers — werken alleen in server-components / route-handlers.
   Next.js 15 vereist await voor cookies(). */
export async function setAuthCookies(data) {
  const store = await cookies();
  store.set(TOKEN_COOKIE, data.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  /* Sla een minimale user-summary op voor snelle client-side checks. */
  if (data.user) {
    store.set(USER_COOKIE, JSON.stringify(data.user), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: MAX_AGE,
    });
  }
}

export async function clearAuthCookies() {
  const store = await cookies();
  store.delete(TOKEN_COOKIE);
  store.delete(USER_COOKIE);
}

export async function getAccessToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE)?.value || null;
}

export async function getUserFromCookie() {
  const store = await cookies();
  const raw = store.get(USER_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/* Controleer of de huidige bezoeker is ingelogd. Geeft het user-object
   terug of null. Wordt gebruikt in server-componenten om routes te
   beschermen (bijv. het dashboard). */
export async function requireAuth() {
  const token = await getAccessToken();
  if (!token) return null;
  const user = await directusMe(token);
  return user;
}
