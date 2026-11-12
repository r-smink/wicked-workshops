// Voorbeelddata uit het ontwerp (alles verzonnen). Draait pas na apply-schema.mjs.
// Gebruik: DIRECTUS_URL=... DIRECTUS_ADMIN_TOKEN=... node seed.mjs
import { api } from "./lib.mjs";

async function upsert(collection, key, row) {
  const f = await api("GET", "/items/" + collection + "?limit=1&filter[" + key + "][_eq]=" + encodeURIComponent(row[key]));
  if (f.data && f.data.length) return f.data[0];
  return (await api("POST", "/items/" + collection, row)).data;
}

const cats = [
  ["Kookworkshops", "kookworkshops", "Koken met anderen, van verse pasta tot sushi."],
  ["Keramiek", "keramiek", "Met je handen aan de slag aan de draaischijf."],
  ["Bloemen", "bloemen", "Bloemschikken en kransen binden."],
  ["Schilderen", "schilderen", "Schilderen op doek, ook zonder ervaring."],
  ["Cocktails en wijn", "cocktails-en-wijn", "Proeven, mixen en leren."],
  ["Ambacht", "ambacht", "Hout, glas, sieraden en reparatie."],
];
const catId = {};
for (const [name, slug, intro] of cats) catId[slug] = (await upsert("categories", "slug", { name, slug, intro, status: "published" })).id;

const cities = [["Utrecht", "utrecht", "Utrecht"], ["Amsterdam", "amsterdam", "Noord-Holland"], ["Rotterdam", "rotterdam", "Zuid-Holland"], ["Den Haag", "den-haag", "Zuid-Holland"]];
const cityId = {};
for (const [name, slug, region] of cities) cityId[slug] = (await upsert("cities", "slug", { name, slug, region, status: "published" })).id;

const luca = await upsert("providers", "slug", { name: "Luca (voorbeeld)", slug: "luca", type: "particulier", tagline: "Italiaans koken aan een grote tafel in zijn eigen keuken", story: "Voorbeeldtekst. Luca kookt Italiaans, aan een grote tafel in zijn eigen keuken.", city: cityId["utrecht"], status: "published" });

const space = await upsert("spaces", "slug", { name: "Keuken van Luca (voorbeeld)", slug: "keuken-luca", kind: "keuken", city: cityId["utrecht"], capacity: 8, free_slots: { za: ["middag"] }, status: "published" });

const ws = await upsert("workshops", "slug", {
  title: "Italiaans koken met Luca: verse pasta in Utrecht", slug: "italiaans-koken-met-luca", status: "published",
  summary: "Voorbeeldworkshop. Verse pasta maken en samen opeten.",
  what_you_do: "Voorbeeldtekst: deeg maken, uitrollen, snijden en saus koken.", included: "Voorbeeldtekst: ingredienten, schort, en samen eten.", practical: "Voorbeeldtekst: ons adres krijg je na je aanmelding.",
  cancellation_rules: "Voorbeeldtekst: bij de meeste workshops krijg je alles terug als je op tijd afzegt.",
  price_per_person: 45, duration_minutes: 180, min_participants: 4, max_participants: 8, business_possible: true,
  category: catId["kookworkshops"], provider: luca.id, city: cityId["utrecht"], space: space.id,
});

// Datums uit het ontwerp (zaterdagen, 15:00). Beslismoment: vrijdag 22:00 ervoor.
const dates = [["2026-11-14", "2026-11-13", "door", 5], ["2026-11-21", "2026-11-20", "open", 1], ["2026-11-28", "2026-11-27", "vol", 8], ["2026-12-05", "2026-12-04", "open", 3], ["2026-12-12", "2026-12-11", "open", 3], ["2026-12-19", "2026-12-18", "open", 0]];
const have = (await api("GET", "/items/sessions?limit=1&filter[workshop][_eq]=" + ws.id)).data.length;
if (!have) for (const [d, b, status, booked] of dates) {
  await api("POST", "/items/sessions", { workshop: ws.id, starts_at: d + "T15:00:00+01:00", ends_at: d + "T18:00:00+01:00", decision_at: b + "T22:00:00+01:00", status, booked });
}

const hasRev = (await api("GET", "/items/reviews?limit=1&filter[workshop][_eq]=" + ws.id)).data.length;
if (!hasRev) await api("POST", "/items/reviews", { workshop: ws.id, author: "Voorbeeld deelnemer", score: 5, text: "Voorbeeldreview. Gezellig en leerzaam.", status: "published", reviewed_at: "2026-10-20T12:00:00+01:00" });

const topics = [
  ["meedoen", "Het minimum en het beslismoment", "het-minimum-en-het-beslismoment", "Per datum staat wanneer hij doorgaat. Is het minimum op het beslismoment gehaald, dan gaat de datum vanzelf door."],
  ["meedoen", "Annuleren en verzetten", "annuleren-en-verzetten", "Wat bij jouw workshop geldt, staat op de pagina van die workshop."],
  ["workshop_geven", "Je eerste workshop geven", "je-eerste-workshop-geven", "Begin met alleen je e-mailadres. Jij bepaalt wanneer je workshop doorgaat."],
];
for (const [group, title, slug, body] of topics) await upsert("help_topics", "slug", { group, title, slug, body, status: "published" });

console.log("Voorbeelddata klaar.");
