import { NextResponse } from "next/server";
import { getAccessToken, directusMe } from "@/lib/auth";
import { isDirectusConfigured, directusFetch, directusUpdate } from "@/lib/directus";
import { getPlatformSettings } from "@/lib/directus/settings";
import { canProviderOverride } from "@/lib/rules/escrow";

export const dynamic = "force-dynamic";

/* POST /api/sessions/override
   Body: { session_id }
   De workshopgever zegt "gaat toch door" na het beslismoment, ondanks
   dat het minimum niet is gehaald. Alleen mogelijk binnen de grace period. */
export async function POST(request) {
  if (!isDirectusConfigured) {
    return NextResponse.json({ error: "Directus is niet geconfigureerd" }, { status: 503 });
  }

  const token = await getAccessToken();
  const user = token ? await directusMe(token) : null;
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
  }

  const { session_id } = body;
  if (!session_id) {
    return NextResponse.json({ error: "Sessie-ID ontbreekt" }, { status: 400 });
  }

  /* Sessie ophalen met workshop en provider. */
  const session = await directusFetch(
    `/items/workshop_sessions/${session_id}?fields=id,state,min_participants,seats_taken,decision_at,goes_ahead,provider_override,workshop.provider.id,workshop.provider.user`,
    { noCache: true }
  );

  if (!session) {
    return NextResponse.json({ error: "Sessie niet gevonden" }, { status: 404 });
  }

  /* Controleer eigenaarschap: de provider van de workshop moet bij deze user horen. */
  const providerUser = session.workshop?.provider?.user;
  const providerUserId = typeof providerUser === "string" ? providerUser : providerUser?.id;
  if (providerUserId !== user.id) {
    return NextResponse.json({ error: "Geen toegang tot deze sessie" }, { status: 403 });
  }

  /* Controleer of override mogelijk is. */
  const settings = await getPlatformSettings();
  const now = Date.now();

  if (!canProviderOverride(session, settings.decisionGraceHours, now)) {
    return NextResponse.json(
      { error: "Override is niet meer mogelijk. Het beslismoment en de grace period zijn voorbij, of de sessie gaat al door." },
      { status: 409 }
    );
  }

  /* Override uitvoeren. */
  await directusUpdate("workshop_sessions", session.id, {
    provider_override: true,
    provider_override_at: new Date(now).toISOString(),
    state: "confirmed",
    goes_ahead: true,
    confirmed_at: new Date(now).toISOString(),
  });

  /* TODO: Stuur session_confirmed mail aan alle deelnemers.
     Wordt geïmplementeerd samen met het mailsysteem. */

  return NextResponse.json({ ok: true });
}
