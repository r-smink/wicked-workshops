import { NextResponse } from "next/server";
import { allowed, clientIp } from "@/lib/account/rate-limit";
import { loadBookingByCode } from "@/lib/bookings/load";
import { tokenMatches } from "@/lib/bookings/access";
import { createUser, findUserByEmail, linkGuestBookings, normalizeEmail, passwordError } from "@/lib/account/users";
import { loginAndRedirect } from "@/lib/account/flows";

export const dynamic = "force-dynamic";

/* POST /api/auth/claim   Body: { code, t, password, first_name? }
   "Maak mijn account" vanuit de bevestigingsmail van een aanmelding
   (docs/04, docs/06 scherm 4). De beheerlink bewijst het e-mailadres al,
   dus het account is meteen bevestigd. Daarna hangen alle gastboekingen
   met dit adres eraan en is de gebruiker ingelogd. */
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  if (!allowed([`claim:ip:${clientIp(request.headers)}`], { limit: 10, windowMs: 15 * 60 * 1000 })) {
    return NextResponse.json({ error: "Even te vaak geprobeerd. Wacht een paar minuten." }, { status: 429 });
  }
  const pwError = passwordError(body.password);
  if (pwError) return NextResponse.json({ error: pwError }, { status: 400 });

  const booking = await loadBookingByCode(String(body.code || ""));
  if (!booking || !tokenMatches(booking.id, booking.access_token, String(body.t || ""))) {
    return NextResponse.json({ error: "Deze link werkt niet meer.", expired: true }, { status: 410 });
  }
  const email = normalizeEmail(booking.guest_email);
  if (!email) return NextResponse.json({ error: "Bij deze aanmelding hoort geen e-mailadres." }, { status: 400 });

  /* De aanvrager bewijst met de beheerlink dat dit zijn adres is, dus hier
     mag gezegd worden dat er al een account is. */
  if (await findUserByEmail(email)) {
    return NextResponse.json(
      { error: "Er is al een account met dit e-mailadres. Log in, dan staat je aanmelding erin.", login: true },
      { status: 409 },
    );
  }
  const user = await createUser({
    email,
    password: String(body.password),
    firstName: body.first_name || booking.first_name,
    verified: true,
    context: "participant",
  });
  if (!user?.id) return NextResponse.json({ error: "Je account is niet aangemaakt. Probeer het opnieuw." }, { status: 500 });
  await linkGuestBookings(user.id, email);
  const result = await loginAndRedirect(email, String(body.password), { remember: true });
  return NextResponse.json({ ok: true, redirect: result?.redirect || "/inloggen" });
}
