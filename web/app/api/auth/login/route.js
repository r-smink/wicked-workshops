import { NextResponse } from "next/server";
import { isAuthConfigured } from "@/lib/auth";
import { allowed, atLeast, clientIp } from "@/lib/account/rate-limit";
import { normalizeEmail } from "@/lib/account/users";
import { LOGIN_ERROR, loginAndRedirect } from "@/lib/account/flows";

export const dynamic = "force-dynamic";

/* POST /api/auth/login
   Body: { email, password, remember?, next? }
   Zet de auth-cookies (lib/auth.js) en geeft de bestemming terug.

   Eén foutmelding voor onbekend adres, fout wachtwoord en een nog niet
   bevestigd account (Directus weigert status "unverified"). De responstijd
   is altijd minstens 500 ms, zodat ook die niets verraadt (docs/04). */
export async function POST(request) {
  if (!isAuthConfigured()) {
    return NextResponse.json({ error: "Directus is niet geconfigureerd" }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  const password = String(body.password || "");
  if (!email || !password) {
    return NextResponse.json({ error: "Vul je e-mailadres en wachtwoord in." }, { status: 400 });
  }

  const ip = clientIp(request.headers);
  if (!allowed([`login:ip:${ip}`, `login:mail:${email}`], { limit: 10, windowMs: 15 * 60 * 1000 })) {
    return NextResponse.json({ error: "Even te vaak geprobeerd. Wacht een kwartier, of kies een nieuw wachtwoord." }, { status: 429 });
  }

  const result = await atLeast(500, loginAndRedirect(email, password, { remember: body.remember !== false, next: body.next }));
  if (!result) {
    return NextResponse.json({ error: LOGIN_ERROR, resend: true }, { status: 401 });
  }
  return NextResponse.json({ ok: true, user: result.user, redirect: result.redirect });
}
