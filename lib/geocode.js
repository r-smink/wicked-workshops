/**
 * Geocoding
 *
 * Zet een adres om naar coordinaten. Nodig omdat een workshop zonder lat en
 * lng nergens op de kaart staat en ook buiten het afstandsfilter valt.
 *
 * Draait alleen op de server en gebruikt een eigen sleutel, los van de
 * browsersleutel voor de kaart. Die twee horen niet dezelfde te zijn: de
 * browsersleutel is per definitie zichtbaar en wordt beperkt op domein, deze
 * blijft geheim en wordt beperkt op API.
 *
 * Roep dit aan bij het opslaan van een workshop of aanbieder, niet bij het
 * tonen van een pagina. Google rekent per aanvraag af, en een adres verandert
 * zelden.
 */
import "server-only";

const KEY = process.env.GOOGLE_GEOCODING_KEY;

/**
 * @param {string} address  bijvoorbeeld "Poortstraat 14, 3572 HH Utrecht"
 * @returns {Promise<{lat:number, lng:number, formatted:string}|null>}
 */
export async function geocode(address) {
  if (!KEY || !address) return null;

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", address);
  url.searchParams.set("region", "nl");
  url.searchParams.set("language", "nl");
  url.searchParams.set("key", KEY);

  try {
    // Een adres verandert zelden, dus een dag cache scheelt aanvragen en geld
    const res = await fetch(url, { next: { revalidate: 86400 } });
    const json = await res.json();

    if (json.status !== "OK" || !json.results?.length) {
      console.error("Geocoding mislukt:", json.status, json.error_message || "");
      return null;
    }

    const hit = json.results[0];
    return {
      lat: hit.geometry.location.lat,
      lng: hit.geometry.location.lng,
      formatted: hit.formatted_address,
    };
  } catch (err) {
    console.error("Geocoding onbereikbaar:", err.message);
    return null;
  }
}

/**
 * Vult lat en lng op een workshop of aanbieder die ze nog niet heeft, en
 * schrijft ze terug naar Directus zodat het maar een keer hoeft.
 *
 * Gebruik dit vanuit een server action of een Directus flow, niet vanuit een
 * pagina die bij elke bezoeker draait.
 */
export async function backfillCoordinates(collection, id, address) {
  const point = await geocode(address);
  if (!point) return null;

  const base = process.env.DIRECTUS_URL;
  const token = process.env.DIRECTUS_STATIC_TOKEN;
  if (!base || !token) return point;

  try {
    await fetch(`${base}/items/${collection}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ lat: point.lat, lng: point.lng }),
    });
  } catch (err) {
    console.error("Coordinaten opslaan mislukt:", err.message);
  }

  return point;
}
