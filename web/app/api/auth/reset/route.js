import { NextResponse } from "next/server";
import { allowed, clientIp } from "@/lib/account/rate-limit";
import { consumeToken, findToken, tokenUsable } from "@/lib/account/tokens";
import { findUserById, passwordError, setPassword } from "@/lib/account/users";
import { loginAndRedirect } from "@/lib/account/flows";

export const dynamic = "force-dynamic";

/* POST /api/auth/reset   Body: { token, password }
   "Opslaan en inloggen" (docs/04, wachtwoord vergeten stap 3). */
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  if (!allowed([`reset:ip:${clientIp(request.headers)}`], { limit: 10, windowMs: 15 * 60 * 1000 })) {
    return NextResponse.json({ error: "Even te vaak geprobeerd. Wacht een paar minuten." }, { status: 429 });
  }
  const pwError = passwordError(body.password);
  if (pwError) return NextResponse.json({ error: pwError }, { status: 400 });

  const token = String(body.token || "");
  if (!tokenUsable(await findToken(token), "reset")) {
    return NextResponse.json({ error: "Deze link werkt niet meer.", expired: true }, { status: 410 });
  }
  const row = await consumeToken(token, "reset");
  const user = row ? await findUserById(row.user) : null;
  if (!user || user.status !== "active") {
    return NextResponse.json({ error: "Deze link werkt niet meer.", expired: true }, { status: 410 });
  }
  if (!(await setPassword(user.id, String(body.password)))) {
    return NextResponse.json({ error: "Opslaan lukte niet. Probeer het opnieuw." }, { status: 500 });
  }
  const result = await loginAndRedirect(user.email, String(body.password), { remember: true });
  return NextResponse.json({ ok: true, redirect: result?.redirect || "/inloggen" });
}
