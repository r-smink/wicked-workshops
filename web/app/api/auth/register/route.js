import { NextResponse } from "next/server";
import { isAuthConfigured } from "@/lib/auth";
import { createProviderForUser } from "@/lib/directus";
import { allowed, atLeast, clientIp } from "@/lib/account/rate-limit";
import { createUser, findUserByEmail, normalizeEmail, passwordError, validEmail } from "@/lib/account/users";
import { sendVerifyMail } from "@/lib/account/flows";
import { safeNext } from "@/lib/account/redirect";

export const dynamic = "force-dynamic";

const isUUID = (s) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s || "");

/* POST /api/auth/register
   Body: { email, password, first_name, last_name, role: "visitor"|"provider", next?, ...profiel }

   Eerst bevestigen, dan pas binnen (docs/04): het account wordt aangemaakt
   als "unverified" en krijgt een mail met een eenmalige link. Het antwoord
   is altijd hetzelfde, ook als het adres al bestaat, zodat niemand kan
   afleiden welke adressen bij ons bekend zijn. */
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
  if (!validEmail(email)) return NextResponse.json({ error: "Vul een geldig e-mailadres in." }, { status: 400 });
  const pwError = passwordError(body.password);
  if (pwError) return NextResponse.json({ error: pwError }, { status: 400 });

  const ip = clientIp(request.headers);
  if (!allowed([`register:ip:${ip}`, `register:mail:${email}`], { limit: 8, windowMs: 60 * 60 * 1000 })) {
    return NextResponse.json({ error: "Even te vaak geprobeerd. Wacht een paar minuten." }, { status: 429 });
  }

  const provider = body.role === "provider";
  const intent = provider ? "provider" : "participant";
  const nextPath = safeNext(body.next);

  await atLeast(600, (async () => {
    const existing = await findUserByEmail(email);
    if (existing) {
      /* Bestaat al. Nog niet bevestigd: nieuwe bevestigingslink. Wel
         bevestigd: niets doen (inloggen of wachtwoord vergeten werkt). */
      if (existing.status === "unverified") await sendVerifyMail(existing, intent, nextPath);
      return;
    }
    const created = await createUser({
      email,
      password: String(body.password),
      firstName: body.first_name,
      lastName: body.last_name,
      verified: false,
      context: intent,
    });
    if (!created?.id) return;

    if (provider) {
      await createProviderForUser(created, {
        profession: body.profession || null,
        bio_short: body.bio_short || null,
        city: isUUID(body.city) ? body.city : null,
        /* active_since is een date-veld: jaar ("2024") wordt "2024-01-01". */
        active_since: /^\d{4}$/.test(String(body.active_since || "")) ? `${body.active_since}-01-01` : null,
      });
    }
    await sendVerifyMail(created, intent, nextPath);
  })());

  return NextResponse.json({
    ok: true,
    next: `/account-maken/controleer-mail?e=${encodeURIComponent(email)}${provider ? "&tab=provider" : ""}`,
  });
}
