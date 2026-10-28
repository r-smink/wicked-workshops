import { NextResponse } from "next/server";
import { getAccessToken, directusMe } from "@/lib/auth";
import { isDirectusConfigured, directusFetch, directusUpdate } from "@/lib/directus";
import { getPlatformSettings } from "@/lib/directus/settings";
import { createMerchant } from "@/lib/payment";

export const dynamic = "force-dynamic";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/* POST /api/providers/opp-onboarding
   Start OPP merchant onboarding voor de ingelogde workshopgever.
   Wordt aangeroepen nadat de aanbiedersverklaring is voltooid. */
export async function POST(request) {
  if (!isDirectusConfigured) {
    return NextResponse.json({ error: "Directus is niet geconfigureerd" }, { status: 503 });
  }

  const token = await getAccessToken();
  const user = token ? await directusMe(token) : null;
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  /* Vind de provider bij deze user. */
  const providers = await directusFetch(
    `/items/providers?filter[user]=${user.id}&fields=id,opp_merchant_uid,opp_merchant_status&limit=1`,
    { noCache: true }
  );
  const provider = Array.isArray(providers) ? providers[0] : providers;

  if (!provider) {
    return NextResponse.json({ error: "Geen workshopgeversprofiel gevonden" }, { status: 404 });
  }

  /* Al aangemeld? */
  if (provider.opp_merchant_uid) {
    return NextResponse.json({
      ok: true,
      already_registered: true,
      status: provider.opp_merchant_status,
    });
  }

  const settings = await getPlatformSettings();

  /* Haal verklaringsgegevens op voor de merchant-aanmaak. */
  const declarations = await directusFetch(
    `/items/provider_declarations?filter[provider]=${provider.id}&fields=email,kind,kvk_number,trade_name&limit=1`,
    { noCache: true }
  );
  const declaration = Array.isArray(declarations) ? declarations[0] : declarations;

  const merchantEmail = declaration?.email || user.email;
  const merchantType = declaration?.kind === "business" ? "business" : "consumer";

  const merchant = await createMerchant(settings.paymentProvider, {
    email: merchantEmail,
    notifyUrl: `${SITE}/api/webhooks/opp`,
    pilotNoPayments: settings.pilotNoPayments,
    metadata: { provider_id: provider.id },
  });

  if (!merchant?.uid) {
    return NextResponse.json({ error: "Kon merchant niet aanmaken bij OPP" }, { status: 502 });
  }

  /* Sla de merchant-ID op bij de provider. */
  await directusUpdate("providers", provider.id, {
    opp_merchant_uid: merchant.uid,
    opp_merchant_status: settings.pilotNoPayments ? "live" : "pending",
    opp_compliance_status: settings.pilotNoPayments ? "verified" : "unverified",
    ...(settings.pilotNoPayments ? { opp_onboarded_at: new Date().toISOString() } : {}),
  });

  return NextResponse.json({
    ok: true,
    merchant_uid: merchant.uid,
    status: settings.pilotNoPayments ? "live" : "pending",
  });
}
