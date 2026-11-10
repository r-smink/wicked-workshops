import { NextResponse } from "next/server";
import { getAccessToken, directusMe, isAuthConfigured, providerRoleId } from "@/lib/auth";
import { isProviderUser } from "@/lib/account/flows";

export const dynamic = "force-dynamic";

/* GET /api/auth/me — retourneert de huidige ingelogde gebruiker of 401.
   Client-componenten gebruiken dit om te weten of iemand ingelogd is. */
export async function GET() {
  if (!isAuthConfigured()) {
    return NextResponse.json(
      { error: "Directus is niet geconfigureerd" },
      { status: 503 }
    );
  }

  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  /* Valideer het token bij Directus. */
  const user = await directusMe(token);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      /* Workshopgever is wie een rij in providers heeft (docs/03); de
         oude Provider-rol telt nog mee voor bestaande accounts. */
      is_provider: user.role === providerRoleId() || (await isProviderUser(user.id)),
    },
  });
}
