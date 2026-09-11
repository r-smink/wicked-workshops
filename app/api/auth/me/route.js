import { NextResponse } from "next/server";
import { getAccessToken, directusMe, getUserFromCookie, isAuthConfigured } from "@/lib/auth";

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
    },
  });
}
