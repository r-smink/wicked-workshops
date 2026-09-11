import { NextResponse } from "next/server";
import { directusCreate, isDirectusConfigured } from "@/lib/directus";

export const dynamic = "force-dynamic";

/* Maakt een nieuwe locatie aan in Directus met status "draft".
   Body: JSON met de venue-velden uit het VenueForm. */
export async function POST(request) {
  if (!isDirectusConfigured) {
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

  if (!body.name) {
    return NextResponse.json({ error: "Naam is verplicht" }, { status: 400 });
  }

  const slug = body.slug
    || body.name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

  const created = await directusCreate("venues", {
    status: "draft",
    slug,
    name: body.name,
    description: body.description || null,
    city: body.city || null,
    address: body.address || null,
    postal_code: body.postal_code || null,
    neighbourhood: body.neighbourhood || null,
    lat: body.lat ? Number(body.lat) : null,
    lng: body.lng ? Number(body.lng) : null,
    max_capacity: body.max_capacity ? Number(body.max_capacity) : null,
    price_per_hour: body.price_per_hour ? Number(body.price_per_hour) : null,
    surface_m2: body.surface_m2 ? Number(body.surface_m2) : null,
    contact_name: body.contact_name || null,
    contact_email: body.contact_email || null,
    contact_phone: body.contact_phone || null,
    amenities: Array.isArray(body.amenities) ? body.amenities : [],
  });

  if (!created) {
    return NextResponse.json(
      { error: "Kon locatie niet opslaan in Directus" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    id: created.id,
    slug: created.slug,
    status: created.status,
  });
}
