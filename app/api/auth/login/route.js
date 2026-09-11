import { NextResponse } from "next/server";
import { directusLogin, directusMe, setAuthCookies, isAuthConfigured } from "@/lib/auth";

export const dynamic = "force-dynamic";

/* POST /api/auth/login
   Body: { email, password }
   Geeft een HTTP-only cookie met het Directus access_token en retourneert
   de gebruikersgegevens. */
export async function POST(request) {
  if (!isAuthConfigured()) {
    return NextResponse.json(
      { error: "Directus is niet geconfigureerd" },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
  }

  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json(
      { error: "E-mailadres en wachtwoord zijn verplicht" },
      { status: 400 }
    );
  }

  const tokens = await directusLogin(email, password);
  if (!tokens || !tokens.accessToken) {
    return NextResponse.json(
      { error: "E-mailadres of wachtwoord is onjuist" },
      { status: 401 }
    );
  }

  /* Haal de gebruikersgegevens op met het access token. */
  const user = await directusMe(tokens.accessToken);
  if (!user) {
    return NextResponse.json(
      { error: "Kon gebruikersgegevens niet ophalen" },
      { status: 500 }
    );
  }

  await setAuthCookies({
    accessToken: tokens.accessToken,
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
    },
  });

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
    },
  });
}
