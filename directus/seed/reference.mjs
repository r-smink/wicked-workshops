/* Referentiedata (docs/03): categorieen, gelegenheden, plaatsen,
   annuleerregelingen en platform_settings. Idempotent: bestaande rijen
   (op slug, key of CBS-code) worden bijgewerkt, niet verdubbeld. Teksten die
   het team in Directus aanpast (namen, beschrijvingen) blijven staan. */
import { readFileSync } from "node:fs";
import path from "node:path";
import { api, query } from "../scripts/api.mjs";
import { ROOT } from "../scripts/env.mjs";

export const CATEGORIES = [
  ["Koken & bakken", "koken-en-bakken"],
  ["Keramiek & klei", "keramiek-en-klei"],
  ["Ambacht & maken", "ambacht-en-maken"],
  ["Schilderen & kunst", "schilderen-en-kunst"],
  ["Drinks & proeverijen", "drinks-en-proeverijen"],
  ["Wellness & beauty", "wellness-en-beauty"],
  ["Bloemen & groen", "bloemen-en-groen"],
  ["Actief & buiten", "actief-en-buiten"],
  ["Dans, muziek & theater", "dans-muziek-en-theater"],
  ["Fotografie & media", "fotografie-en-media"],
  ["Niche & onverwacht", "niche-en-onverwacht"],
  ["Duurzaam & repair", "duurzaam-en-repair"],
];

/* Slugs zijn de live slugs (Nederlands, staan in URL's). Cadeau en Familie
   zijn niet bevestigd: niet seeden (docs/03). */
export const OCCASIONS = [
  ["Date", "date"],
  ["Vrienden", "vrienden"],
  ["Teamuitje", "teamuitje"],
  ["Vrijgezellenfeest", "vrijgezellenfeest"],
  ["Kinderfeestje", "kinderfeestje"],
];

/* Teksten uit wizard-a (docs/09). Soepel en Vast zijn werktekst. */
export const CANCELLATION_POLICIES = [
  { key: "basis", name: "De basis", description: "Gratis annuleren tot 48 uur vooraf, daarna 50 procent. Verzetten is kosteloos.", free_until_hours_before: 48, penalty_percent_after: 50, reschedule_free: true, sort: 1 },
  { key: "soepel", name: "Soepel", description: "Gratis annuleren tot 24 uur vooraf.", free_until_hours_before: 24, penalty_percent_after: null, reschedule_free: true, sort: 2 },
  { key: "vast", name: "Vast", description: "Gratis annuleren tot 7 dagen vooraf, daarna 50 procent.", free_until_hours_before: 168, penalty_percent_after: 50, reschedule_free: true, sort: 3 },
];

/* Plaatsen met een eigen plaatspagina en plek in het megamenu. */
const TOP_PLACES = ["amsterdam", "rotterdam", "utrecht", "den-haag"];
/* CBS-naam tegenover de naam die iedereen gebruikt. */
const PLACE_NAMES = { "s-gravenhage": { name: "Den Haag", slug: "den-haag" } };

async function all(collection, fields) {
  return api("GET", `/items/${collection}${query({ fields, limit: -1 })}`);
}

/* Maakt ontbrekende rijen en werkt gewijzigde bij, in batches. Velden in
   `keep` worden bij bestaande rijen niet overschreven. */
async function upsert(collection, rows, key, { pk = "id", keep = [] } = {}) {
  const fields = [...new Set([pk, key, ...rows.flatMap(Object.keys)])].join(",");
  const existing = new Map((await all(collection, fields)).map((r) => [r[key], r]));
  const create = [];
  const update = [];
  for (const row of rows) {
    const cur = existing.get(row[key]);
    if (!cur) {
      create.push(row);
      continue;
    }
    const patch = Object.fromEntries(Object.entries(row).filter(([k, v]) => !keep.includes(k) && k !== pk && cur[k] !== v));
    if (Object.keys(patch).length) update.push({ [pk]: cur[pk], ...patch });
  }
  for (let i = 0; i < create.length; i += 500) await api("POST", `/items/${collection}`, create.slice(i, i + 500));
  for (let i = 0; i < update.length; i += 500) await api("PATCH", `/items/${collection}`, update.slice(i, i + 500));
  return { created: create.length, updated: update.length };
}

export async function seedReference() {
  const out = {};
  out.categories = await upsert(
    "categories",
    CATEGORIES.map(([name, slug], i) => ({ name, slug, sort: i + 1, status: "published" })),
    "slug",
    { keep: ["name", "status"] },
  );
  out.occasions = await upsert("occasions", OCCASIONS.map(([name, slug], i) => ({ name, slug, sort: i + 1 })), "slug", { keep: ["name"] });
  out.cancellation_policies = await upsert("cancellation_policies", CANCELLATION_POLICIES, "key", { pk: "key", keep: ["name", "description"] });

  /* Singleton: een PATCH maakt hem aan met de standaardwaarden uit het schema. */
  await api("PATCH", "/items/platform_settings", {});

  const { places } = JSON.parse(readFileSync(path.join(ROOT, "seed", "data", "places.json"), "utf8"));
  const bySlug = new Map((await all("cities", "id,slug,cbs_code")).map((c) => [c.slug, c]));
  const rows = places.map((p) => {
    const alias = PLACE_NAMES[p.slug] ?? {};
    const slug = alias.slug ?? p.slug;
    const top = TOP_PLACES.indexOf(slug);
    return {
      cbs_code: p.cbs_code,
      name: alias.name ?? p.name,
      slug,
      province: p.province,
      municipality: p.municipality,
      /* Bestaat de plaats al (live, met plaatspagina), dan blijft de status. */
      ...(bySlug.has(slug) ? {} : { status: top >= 0 ? "published" : "draft", is_top: top >= 0, sort: top >= 0 ? top + 1 : null }),
    };
  });
  /* Live plaatsen hebben nog geen CBS-code: koppel ze eerst op slug. */
  for (const row of rows) {
    const live = bySlug.get(row.slug);
    if (live && !live.cbs_code) await api("PATCH", `/items/cities/${live.id}`, { cbs_code: row.cbs_code, municipality: row.municipality });
  }
  out.places = await upsert("cities", rows, "cbs_code", { keep: ["name", "slug", "status", "is_top", "sort"] });
  return out;
}
