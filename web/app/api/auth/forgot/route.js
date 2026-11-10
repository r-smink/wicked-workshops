import { NextResponse } from "next/server";
import { allowed, atLeast, clientIp } from "@/lib/account/rate-limit";
import { findUserByEmail, normalizeEmail, validEmail } from "@/lib/account/users";
import { sendResetMail, sendVerifyMail } from "@/lib/account/flows";

export const dynamic = "force-dynamic";

/* POST /api/auth/forgot   Body: { email }
   Antwoord altijd: "Hoort er een account bij, dan sturen we een link."
   Een nog niet bevestigd account krijgt de bevestigingslink opnieuw. */
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const email = normalizeEmail(body.email);
  if (!validEmail(email)) return NextResponse.json({ error: "Vul een geldig e-mailadres in." }, { status: 400 });
  const ip = clientIp(request.headers);
  if (!allowed([`forgot:ip:${ip}`, `forgot:mail:${email}`], { limit: 5, windowMs: 60 * 60 * 1000 })) {
    return NextResponse.json({ error: "Even te vaak geprobeerd. Wacht een paar minuten." }, { status: 429 });
  }
  await atLeast(500, (async () => {
    const user = await findUserByEmail(email);
    if (!user) return;
    if (user.status === "active") await sendResetMail(user);
    else if (user.status === "unverified") {
      await sendVerifyMail(user, user.last_context === "provider" ? "provider" : "participant");
    }
  })());
  return NextResponse.json({ ok: true, next: "/wachtwoord-vergeten/verstuurd" });
}
