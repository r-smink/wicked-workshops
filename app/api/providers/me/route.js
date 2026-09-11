import { NextResponse } from "next/server";
import { getAccessToken, directusMe } from "@/lib/auth";
import { directusFetch, directusUpdate } from "@/lib/directus";

export const dynamic = "force-dynamic";

/* Map het form-state naar Directus provider veldnamen. We houden het
   conservatief: alleen velden waarvan we zeker zijn dat ze in de
   providers-collectie bestaan. Persoonsgegevens gaan naar directus_users. */
function formToProvider(body, existingProvider) {
  const details = {
    ...(existingProvider?.details || {}),
    phone: body.phone || null,
    birth_date: body.birth_date || null,
    company_name: body.company_name || null,
    vat_liable: body.vat_liable ?? null,
    kor: body.kor ?? null,
    website: body.website || null,
    instagram: body.instagram || null,
    iban: body.iban || null,
    account_holder: body.account_holder || null,
    terms: body.terms ?? null,
    billing_street: body.street || null,
    billing_house_number: body.house_number || null,
    billing_addition: body.addition || null,
    billing_postal_code: body.postal_code || null,
    billing_residence: body.residence || null,
    billing_country: body.country || null,
    location_same: body.location_same ?? true,
    location_street: body.location_street || null,
    location_postal: body.location_postal || null,
    wheelchair: body.wheelchair ?? false,
    parking: body.parking ?? false,
    transit: body.transit ?? false,
    languages: Array.isArray(body.languages) ? body.languages : [],
  };

  const locationStreet = body.location_same ? body.street : (body.location_street || body.street);
  const locationPostal = body.location_same ? body.postal_code : (body.location_postal || body.postal_code);
  const locationHouse = body.location_same ? body.house_number : null;
  const locationAddition = body.location_same ? body.addition : null;
  const fullAddress = [locationStreet, locationHouse, locationAddition].filter(Boolean).join(" ") || existingProvider?.address || null;

  /* City moet een UUID zijn of null — geen lege string of stadsnaam */
  const isUUID = (s) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
  const cityValue = body.city && isUUID(body.city) ? body.city : null;

  const result = {
    display_name: body.display_name || null,
    profession: body.profession || null,
    bio_short: body.bio_short || null,
    bio_long: body.bio_long || null,
    neighbourhood: body.neighbourhood || null,
    location_name: body.location_name || null,
    address: fullAddress,
    postal_code: locationPostal || existingProvider?.postal_code || null,
    kvk_number: body.kvk_number || null,
    vat_number: body.vat_number || null,
    active_since: body.active_since ? Number(body.active_since) : null,
    accepts_groups: body.accepts_groups ?? true,
    max_group_size: body.max_group_size ? Number(body.max_group_size) : null,
    payout_iban_last4: body.iban ? body.iban.slice(-4) : null,
    details,
  };
  /* Alleen city meesturen als het een geldige UUID is */
  if (cityValue) result.city = cityValue;
  return result;
}

function formToUser(body) {
  return {
    first_name: body.first_name || null,
    last_name: body.last_name || null,
    email: body.email || null,
  };
}

export async function GET() {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }
  const user = await directusMe(token);
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const provider = await directusFetch(
    `/items/providers?filter[user]=${user.id}&fields=id,slug,display_name,profession,bio_short,bio_long,neighbourhood,location_name,address,postal_code,lat,lng,active_since,verified,accepts_groups,max_group_size,response_time_minutes,rating_avg,rating_count,participants_count,workshops_count,is_top_rated,kvk_number,vat_number,city.name,city.slug&single`,
    { noCache: true }
  );

  return NextResponse.json({ user, provider });
}

export async function PATCH(request) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }
  const user = await directusMe(token);
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  /* Eerst de Directus user bijwerken. Niet-blokkerend: als dit mislukt
     gaan we toch door met de provider-update. */
  await directusUpdate("directus_users", user.id, formToUser(body));

  const existingProvider = await directusFetch(
    `/items/providers?filter[user]=${user.id}&fields=id,slug,display_name,profession,bio_short,bio_long,neighbourhood,location_name,address,postal_code,lat,lng,active_since,verified,accepts_groups,max_group_size,response_time_minutes,rating_avg,rating_count,participants_count,workshops_count,is_top_rated,kvk_number,vat_number,city.name,city.slug,details&single`,
    { noCache: true }
  );
  if (!existingProvider?.id) {
    return NextResponse.json({ error: "Geen provider gevonden voor dit account" }, { status: 404 });
  }

  const updated = await directusUpdate("providers", existingProvider.id, formToProvider(body, existingProvider));
  if (!updated) {
    return NextResponse.json({ error: "Provider kon niet worden bijgewerkt" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, provider: updated });
}
