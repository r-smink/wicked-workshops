import { NextResponse } from "next/server";
import { isDirectusConfigured, directusFetch, directusUpdate } from "@/lib/directus";
import { getPlatformSettings } from "@/lib/directus/settings";
import { paymentEnv, isPaymentConfigured, merchantReady, createSandboxMerchant, createLiveMerchant } from "@/lib/payment";
import { currentProvider, unauthorized } from "@/lib/guard";

export const dynamic = "force-dynamic";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

/* POST /api/providers/opp-onboarding
   Zorgt dat de ingelogde workshopgever betalingen kan ontvangen in de
   huidige betaalmodus.
     sandbox  test-merchant, meteen live (checkout doet dit ook vanzelf)
     live     echte merchant; geeft overview_url terug voor de KYC bij OPP */
export async function POST() {
  if (!isDirectusConfigured) {
    return NextResponse.json({ error: "Directus is niet geconfigureerd" }, { status: 503 });
  }

  const { user, provider } = await currentProvider();
  if (!user) return unauthorized();
  if (!provider) {
    return NextResponse.json({ error: "Geen workshopgeversprofiel gevonden" }, { status: 404 });
  }

  const settings = await getPlatformSettings({ fresh: true });
  const env = paymentEnv(settings);
  if (!env) {
    return NextResponse.json({ ok: true, payments: "off" });
  }
  if (!isPaymentConfigured(settings)) {
    return NextResponse.json({ error: "Betalingen zijn nog niet geconfigureerd" }, { status: 503 });
  }

  if (merchantReady(provider, env)) {
    return NextResponse.json({ ok: true, already_registered: true, status: "live" });
  }
  /* Al aangemeld in deze omgeving, maar nog niet live: wachten op KYC. */
  if (provider.opp_merchant_uid && provider.opp_merchant_env === env && env === "live") {
    return NextResponse.json({ ok: true, already_registered: true, status: provider.opp_merchant_status });
  }

  const notifyUrl = `${SITE}/api/webhooks/opp`;

  if (env === "sandbox") {
    const fields = await createSandboxMerchant(provider.id, { notifyUrl });
    if (!fields) return NextResponse.json({ error: "Kon geen test-merchant aanmaken bij OPP" }, { status: 502 });
    await directusUpdate("providers", provider.id, fields);
    return NextResponse.json({ ok: true, merchant_uid: fields.opp_merchant_uid, status: fields.opp_merchant_status });
  }

  /* Live: gegevens uit de aanbiedersverklaring (alleen het team ziet die). */
  const rows = await directusFetch(
    `/items/provider_declarations?filter[provider][_eq]=${provider.id}&fields=email,phone,kind,kvk_number&limit=1`,
    { noCache: true }
  );
  const declaration = Array.isArray(rows) ? rows[0] : rows;
  const created = await createLiveMerchant(provider.id, {
    type: declaration?.kind === "business" ? "business" : "consumer",
    email: declaration?.email || user.email,
    phone: declaration?.phone || null,
    cocNr: declaration?.kvk_number || null,
    notifyUrl,
    returnUrl: `${SITE}/dashboard`,
  });
  if (!created) return NextResponse.json({ error: "Kon merchant niet aanmaken bij OPP" }, { status: 502 });

  await directusUpdate("providers", provider.id, created.fields);
  return NextResponse.json({
    ok: true,
    merchant_uid: created.fields.opp_merchant_uid,
    status: created.fields.opp_merchant_status,
    overview_url: created.overviewUrl,
  });
}
