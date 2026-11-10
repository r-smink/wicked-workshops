import { NextResponse } from "next/server";
import { directusCreate, isDirectusConfigured } from "@/lib/directus";
import { currentUser, unauthorized } from "@/lib/guard";
import { getPlatformSettings } from "@/lib/directus/settings";

export const dynamic = "force-dynamic";

const KINDS = ["kitchen", "atelier", "hall", "outdoor"];
const isUUID = (s) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(s || ""));

/* POST /api/venues
   Advertentie van een ruimte-eigenaar (Locatie gezocht, docs/11) in
   venue_listings, volgens het datamodel van docs/03: plaats en wijk, geen
   adres, geen prijs en geen contactgegevens. Afspraken en betaling lopen
   buiten het platform; contact gaat via Wicked Workshops
   (venue_contact_requests). Velden als address of price_per_hour uit het
   oude formulier worden genegeerd.

   Alleen als de feature flag venues.enabled aan staat. */
export async function POST(request) {
  if (!isDirectusConfigured) {
    return NextResponse.json({ error: "Directus is niet geconfigureerd" }, { status: 503 });
  }
  const settings = await getPlatformSettings({ fresh: true });
  if (!settings.features.venues) {
    return NextResponse.json({ error: "Locatie gezocht staat nog uit" }, { status: 404 });
  }

  const user = await currentUser();
  if (!user) return unauthorized();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
  }

  const name = String(body.name || "").trim().slice(0, 255);
  if (!name) return NextResponse.json({ error: "Naam is verplicht" }, { status: 400 });

  const place = body.place || body.city;
  const capacity = Number(body.capacity ?? body.max_capacity);
  const created = await directusCreate("venue_listings", {
    owner: user.id,
    status: "draft",
    visible: true,
    name,
    place: isUUID(place) ? place : null,
    neighbourhood: String(body.neighbourhood || "").trim().slice(0, 255) || null,
    kind: KINDS.includes(body.kind) ? body.kind : null,
    capacity: Number.isFinite(capacity) && capacity >= 1 ? Math.round(capacity) : null,
    amenities: Array.isArray(body.amenities) ? body.amenities.map(String).slice(0, 30) : [],
    description: String(body.description || "").trim().slice(0, 4000) || null,
    availability: body.availability && typeof body.availability === "object" ? body.availability : null,
  });

  if (!created) {
    return NextResponse.json({ error: "Kon de ruimte niet opslaan" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: created.id, status: created.status });
}
