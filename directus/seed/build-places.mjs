/* Maakt seed/data/places.json uit de CBS-tabel "Woonplaatsen in Nederland"
   (open data). Draai opnieuw als er een nieuwe jaargang is:
     node seed/build-places.mjs 86312NED */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { ROOT } from "../scripts/env.mjs";

const TABLE = process.argv[2] || "86312NED";
const BASE = `https://opendata.cbs.nl/ODataApi/odata/${TABLE}`;

async function all(url) {
  const out = [];
  let next = url;
  while (next) {
    const res = await fetch(next);
    if (!res.ok) throw new Error(`${res.status} ${next}`);
    const json = await res.json();
    out.push(...json.value);
    next = json["odata.nextLink"] || null;
  }
  return out;
}

export const slugify = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const names = new Map((await all(`${BASE}/Woonplaatsen?$format=json`)).map((w) => [w.Key.trim(), w.Title.trim()]));
const rows = await all(`${BASE}/TypedDataSet?$format=json`);

const places = rows.map((r) => ({
  cbs_code: r.Woonplaatsen.trim(),
  name: names.get(r.Woonplaatsen.trim()),
  municipality: r.Naam_2.trim(),
  province: r.Naam_4.trim(),
}));

/* Dubbele namen (Hengelo, Beek, ...) krijgen de provincie in de slug, en
   als dat niet genoeg is de gemeente. */
const tally = (key) => places.reduce((m, p) => m.set(key(p), (m.get(key(p)) || 0) + 1), new Map());
const byName = tally((p) => p.name);
const byProvince = tally((p) => p.name + "|" + p.province);
for (const p of places) {
  if (byName.get(p.name) === 1) p.slug = slugify(p.name);
  else if (byProvince.get(p.name + "|" + p.province) === 1) p.slug = `${slugify(p.name)}-${slugify(p.province)}`;
  else p.slug = `${slugify(p.name)}-${slugify(p.municipality)}`;
}
/* Kapel Avezaath en Kapel-Avezaath: zelfde slug, andere gemeente. */
const bySlug = tally((p) => p.slug);
for (const p of places) if (bySlug.get(p.slug) > 1) p.slug = `${p.slug}-${slugify(p.municipality)}`;

places.sort((a, b) => a.name.localeCompare(b.name, "nl") || a.province.localeCompare(b.province, "nl"));
const file = path.join(ROOT, "seed", "data", "places.json");
writeFileSync(file, JSON.stringify({ source: `CBS ${TABLE}`, places }, null, 0).replace(/},{/g, "},\n{") + "\n");
console.log(`${places.length} woonplaatsen naar ${path.relative(ROOT, file)}`);
