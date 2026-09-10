import { NextResponse } from "next/server";
import { geocode, backfillCoordinates } from "@/lib/geocode";

/**
 * Geocoding-endpoint voor Directus.
 *
 * Dit is de plek waar lib/geocode.js aan het systeem hangt. Een Directus flow
 * roept dit aan zodra een workshop of aanbieder wordt opgeslagen, waarna de
 * coordinaten teruggeschreven worden naar het record. Daarna staat de pin op
 * de kaart en doet het afstandsfilter zijn werk.
 *
 * Instellen in Directus:
 *   Settings > Flows > Create Flow
 *   Trigger:  Event Hook, non-blocking (action)
 *   Scope:    items.create, items.update
 *   Collecties: workshops, providers
 *   Actie:    Webhook / Request URL
 *     Method: POST
 *     URL:    https://<jouw-domein>/api/geocode?secret=<REVALIDATE_SECRET>
 *     Body:   {
 *               "collection": "{{$trigger.collection}}",
 *               "id": "{{$trigger.key}}",
 *               "address": "{{$trigger.payload.address}} {{$trigger.payload.postal_code}}"
 *             }
 *
 * Kies bewust "non-blocking": mislukt de geocoding, dan wil je niet dat het
 * opslaan van een workshop faalt. Een ontbrekende pin is vervelend, een
 * aanbieder die zijn werk kwijtraakt is erger.
 */
export async function POST(request) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, message: "Ongeldig secret" }, { status: 401 });
  }

  if (!process.env.GOOGLE_GEOCODING_KEY) {
    return NextResponse.json(
      { ok: false, message: "GOOGLE_GEOCODING_KEY ontbreekt" },
      { status: 501 }
    );
  }

  let body = {};
  try { body = await request.json(); } catch { /* leeg body is prima */ }

  const { collection, id, address } = body;

  if (!address || address.trim().length < 6) {
    return NextResponse.json(
      { ok: false, message: "Geen bruikbaar adres meegestuurd" },
      { status: 400 }
    );
  }

  // Zonder collection en id alleen opzoeken, met allebei ook terugschrijven
  const point = collection && id
    ? await backfillCoordinates(collection, id, address)
    : await geocode(address);

  if (!point) {
    return NextResponse.json(
      { ok: false, message: "Adres niet gevonden" },
      { status: 422 }
    );
  }

  return NextResponse.json({ ok: true, ...point });
}
