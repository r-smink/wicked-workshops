import { NextResponse, type NextRequest } from "next/server";

/* Vernieuwt het Directus access token stil met het refresh token (docs/04).
   Het access token leeft kort (15 minuten); het refresh token 30 dagen met
   "Ingelogd blijven", anders tot de browser sluit. Zonder refresh token
   doet dit niets.

   Bewust zelfstandig (geen import uit lib/auth.js): middleware draait op de
   edge en mag next/headers niet gebruiken. Cookienamen gelijk houden. */

const DIRECTUS_URL = (process.env.DIRECTUS_URL || "").replace(/\/$/, "");
const TOKEN = "ww_token";
const REFRESH = "ww_refresh";
const EXP = "ww_exp";
const REMEMBER = "ww_remember";
const MARGIN_MS = 60 * 1000;

export async function middleware(request: NextRequest) {
  const refresh = request.cookies.get(REFRESH)?.value;
  if (!refresh || !DIRECTUS_URL) return NextResponse.next();

  const exp = Number(request.cookies.get(EXP)?.value || 0);
  const hasToken = Boolean(request.cookies.get(TOKEN)?.value);
  if (hasToken && exp - Date.now() > MARGIN_MS) return NextResponse.next();

  let data: { access_token?: string; refresh_token?: string; expires?: number } | null = null;
  try {
    const res = await fetch(`${DIRECTUS_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh, mode: "json" }),
      cache: "no-store",
    });
    data = res.ok ? (await res.json()).data ?? null : null;
  } catch {
    /* Directus even niet bereikbaar: laat het verzoek gewoon door. */
    return NextResponse.next();
  }

  const remember = request.cookies.get(REMEMBER)?.value === "1";
  const opts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(remember ? { maxAge: 60 * 60 * 24 * 30 } : {}),
  };

  if (!data?.access_token || !data.refresh_token) {
    /* Refresh token verlopen of ingetrokken: uitloggen. */
    const res = NextResponse.next();
    for (const name of [TOKEN, REFRESH, EXP, REMEMBER, "ww_user"]) res.cookies.delete(name);
    return res;
  }

  const expiresAt = String(Date.now() + Number(data.expires || 900000));
  /* Ook het lopende verzoek krijgt het nieuwe token, zodat server-componenten
     het meteen gebruiken. */
  request.cookies.set(TOKEN, data.access_token);
  request.cookies.set(REFRESH, data.refresh_token);
  request.cookies.set(EXP, expiresAt);
  const res = NextResponse.next({ request });
  res.cookies.set(TOKEN, data.access_token, opts);
  res.cookies.set(REFRESH, data.refresh_token, opts);
  res.cookies.set(EXP, expiresAt, opts);
  return res;
}

export const config = {
  /* Niet voor statische bestanden, webhooks en cron. */
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/webhooks|api/cron|api/team|.*\.(?:png|jpg|jpeg|svg|webp|ico|css|js)$).*)"],
};
