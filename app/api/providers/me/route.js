import { NextResponse } from "next/server";
import { getAccessToken, directusMe } from "@/lib/auth";
import { directusFetch, directusUpdate } from "@/lib/directus";

export const dynamic = "force-dynamic";

/* Map het form-state naar Directus provider veldnamen. We houden het
   conservatief: alleen velden waarvan we zeker zijn dat ze in de
   providers-collectie bestaan. Persoonsgegevens gaan naar directus_users. */
function formToProvider(body) {
  return {
    display_name: body.display_name || null,
    profession: body.profession || null,
    bio_short: body.bio_short || null,
    bio_long: body.bio_long || null,
    city: body.city || null,
    neighbourhood: body.neighbourhood || null,
    location_name: body.location_name || null,
    address: body.location_same ? body.street : (body.location_street || body.street) || null,
    postal_code: body.location_same ? body.postal_code : (body.location_postal || body.postal_code) || null,
    kvk_number: body.kvk_number || null,
    vat_number: body.vat_number || null,
    active_since: body.active_since ? Number(body.active_since) : null,
    accepts_groups: body.accepts_groups ?? true,
    max_group_size: body.max_group_size ? Number(body.max_group_size) : null,
  };
}

function formToUser(body) {
  return {
    first_name: body.first_name || null,
    last_name: body.last_name || null,
    email: body.email || null,
  };
}

export async function GET() {
  const token = getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }
  const user = await directusMe(token);
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const provider = await directusFetch(
    `/items/providers?filter[user_created]=${user.id}&fields=id,slug,display_name,profession,bio_short,bio_long,neighbourhood,location_name,address,postal_code,lat,lng,active_since,verified,accepts_groups,max_group_size,response_time_minutes,rating_avg,rating_count,participants_count,workshops_count,is_top_rated,kvk_number,vat_number,city.name,city.slug&single`
  );

  return NextResponse.json({ user, provider });
}

export async function PATCH(request) {
  const token = getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }
  const user = await directusMe(token);
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  /* Eerst de Directus user bijwerken. */
  const userUpdate = await directusUpdate("directus_users", user.id, formToUser(body));
  if (!userUpdate) {
    return NextResponse.json({ error: "Gebruiker kon niet worden bijgewerkt" }, { status: 500 });
  }

  /* Dan de provider opzoeken en bijwerken. */
  const provider = await directusFetch(
    `/items/providers?filter[user_created]=${user.id}&fields=id&single`
  );
  if (!provider?.id) {
    return NextResponse.json({ error: "Geen provider gevonden voor dit account" }, { status: 404 });
  }

  const updated = await directusUpdate("providers", provider.id, formToProvider(body));
  if (!updated) {
    return NextResponse.json({ error: "Provider kon niet worden bijgewerkt" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, provider: updated, user: userUpdate });
}
