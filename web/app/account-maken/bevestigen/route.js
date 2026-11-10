import { NextResponse } from "next/server";
import { consumeToken } from "@/lib/account/tokens";
import { findUserById, linkGuestBookings, markVerified } from "@/lib/account/users";
import { allowed, clientIp } from "@/lib/account/rate-limit";

export const dynamic = "force-dynamic";

/* GET /account-maken/bevestigen?token=
   Bevestigt het e-mailadres (eenmalige link, 24 uur), koppelt gastboekingen
   met hetzelfde adres en stuurt door naar inloggen met het adres al
   ingevuld. Directus kan geen sessie maken zonder wachtwoord, dus
   automatisch inloggen kan hier niet (docs/12, "Auth-implementatie"). */
export async function GET(request) {
  const url = new URL(request.url);
  const to = (path) => NextResponse.redirect(new URL(path, url.origin));
  if (!allowed([`verify:ip:${clientIp(request.headers)}`], { limit: 20, windowMs: 15 * 60 * 1000 })) {
    return to("/link-werkt-niet-meer?type=bevestigen");
  }

  const row = await consumeToken(url.searchParams.get("token") || "", "verify");
  if (!row) return to("/link-werkt-niet-meer?type=bevestigen");
  const user = await findUserById(row.user);
  if (!user) return to("/link-werkt-niet-meer?type=bevestigen");

  if (user.status === "unverified" || !user.email_verified_at) await markVerified(user.id);
  await linkGuestBookings(user.id, user.email);

  const params = new URLSearchParams({ bevestigd: "1", email: user.email });
  if (row.intent === "provider") params.set("tab", "provider");
  if (row.next_path) params.set("next", row.next_path);
  return to(`/inloggen?${params.toString()}`);
}
