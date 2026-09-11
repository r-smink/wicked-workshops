import { NextResponse } from "next/server";
import { directusRegister, directusLogin, directusMe, setAuthCookies, isAuthConfigured } from "@/lib/auth";

export const dynamic = "force-dynamic";

/* POST /api/auth/register
   Body: { email, password, first_name, last_name }
   Maakt een Directus-gebruiker aan en logt direct in. */
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

  const { email, password, first_name, last_name, role } = body;
  if (!email || !password) {
    return NextResponse.json(
      { error: "E-mailadres en wachtwoord zijn verplicht" },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Wachtwoord moet minimaal 8 tekens zijn" },
      { status: 400 }
    );
  }

  /* Maak de gebruiker aan. */
  const created = await directusRegister({ email, password, first_name, last_name });
  if (!created) {
    return NextResponse.json(
      { error: "Kon account niet aanmaken. Misschien bestaat dit e-mailadres al." },
      { status: 400 }
    );
  }

  /* Als dit een provider-registratie is, maak direct een provider-record aan. */
  if (role === "provider") {
    const { createProviderForUser } = await import("@/lib/directus");
    await createProviderForUser(created);
  }

  /* Log direct in zodat de gebruiker meteen door kan. */
  const tokens = await directusLogin(email, password);
  if (!tokens || !tokens.accessToken) {
    /* Account is aangemaakt maar inloggen mislukt — stuur naar login-pagina. */
    return NextResponse.json({
      ok: true,
      needsLogin: true,
      message: "Account aangemaakt. Log in om verder te gaan.",
    });
  }

  const user = await directusMe(tokens.accessToken);
  await setAuthCookies({
    accessToken: tokens.accessToken,
    user: user ? {
      id: user.id,
      email: user.email,
      first_name: user.first_name || first_name || "",
      last_name: user.last_name || last_name || "",
    } : { email, first_name: first_name || "", last_name: last_name || "" },
  });

  return NextResponse.json({
    ok: true,
    user: user ? {
      id: user.id,
      email: user.email,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
    } : { email, first_name: first_name || "", last_name: last_name || "" },
  });
}
