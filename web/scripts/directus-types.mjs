/* `npm run directus:types`: schrijft lib/directus/types.ts uit
   directus/schema/snapshot.yaml (de bron van waarheid voor het schema).
   Draai na elke schemawijziging en commit het resultaat.

   - m2o-velden: id of het opgehaalde object (afhankelijk van `fields`).
   - o2m- en m2m-velden: lijst van ids of objecten.
   - keuzelijsten: union van de toegestane waarden.
   - decimal komt uit Directus als string; zo staat het ook in het type. */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SNAPSHOT = path.resolve(WEB, "..", "directus", "schema", "snapshot.yaml");
const OUT = path.join(WEB, "lib", "directus", "types.ts");

const snap = YAML.parse(readFileSync(SNAPSHOT, "utf8"));

const pascal = (s) => s.replace(/^directus_/, "directus-").split(/[_-]/).filter(Boolean).map((p) => p[0].toUpperCase() + p.slice(1)).join("");
/* Enkelvoud: het type beschrijft 1 rij (workshops -> Workshop, categories -> Category). */
const singular = (s) => (s.endsWith("ies") ? s.slice(0, -3) + "y" : s.endsWith("s") && !s.endsWith("ss") ? s.slice(0, -1) : s);
const typeName = (c) => singular(pascal(c));

const SYSTEM = { directus_users: "DirectusUser", directus_files: "DirectusFile", directus_roles: "DirectusRole", directus_folders: "DirectusFolder" };
const tsName = (c) => SYSTEM[c] ?? typeName(c);

const collections = snap.collections.filter((c) => c.schema).map((c) => c.collection);
const singletons = new Set(snap.collections.filter((c) => c.meta?.singleton).map((c) => c.collection));
const known = new Set([...collections, ...Object.keys(SYSTEM)]);

const pkType = new Map();
for (const f of snap.fields) if (f.schema?.is_primary_key) pkType.set(f.collection, f.type === "integer" ? "number" : "string");
pkType.set("directus_users", "string");
pkType.set("directus_files", "string");
pkType.set("directus_roles", "string");
pkType.set("directus_folders", "string");

const m2o = new Map(); /* "collection.field" -> related */
const o2m = new Map(); /* "related.one_field" -> many collection */
for (const r of snap.relations) {
  if (r.related_collection) m2o.set(`${r.collection}.${r.field}`, r.related_collection);
  if (r.meta?.one_field && r.related_collection) o2m.set(`${r.related_collection}.${r.meta.one_field}`, r.collection);
}

const ref = (c) => (known.has(c) ? `${pkType.get(c) ?? "string"} | ${tsName(c)}` : "string");

function scalar(f) {
  const choices = f.meta?.options?.choices;
  if (Array.isArray(choices) && choices.length && ["string", "integer"].includes(f.type) && f.meta?.interface?.startsWith("select-")) {
    return choices.map((c) => JSON.stringify(c.value)).join(" | ");
  }
  switch (f.type) {
    case "integer":
    case "bigInteger":
    case "float":
      return "number";
    case "boolean":
      return "boolean";
    case "json":
      return "unknown";
    case "csv":
      return "string[]";
    default:
      return "string"; /* string, text, uuid, hash, decimal, timestamp, dateTime, date, time */
  }
}

function fieldType(f) {
  const key = `${f.collection}.${f.field}`;
  if (f.type === "alias") {
    const many = o2m.get(key);
    if (many) return `Array<${ref(many)}>`;
    return null; /* presentatie-velden (dividers, notices) */
  }
  const related = m2o.get(key);
  let t = related ? ref(related) : scalar(f);
  const nullable = f.schema ? f.schema.is_nullable !== false && !f.schema.is_primary_key : true;
  if (nullable) t += " | null";
  return t;
}

const byCollection = new Map();
for (const f of snap.fields) {
  if (!known.has(f.collection)) continue;
  if (!byCollection.has(f.collection)) byCollection.set(f.collection, []);
  byCollection.get(f.collection).push(f);
}

let out = `/* Gegenereerd door scripts/directus-types.mjs uit directus/schema/snapshot.yaml.
   Niet met de hand wijzigen: draai \`npm run directus:types\`. */

`;
const ordered = [...collections].sort();
for (const c of [...ordered, ...Object.keys(SYSTEM).filter((s) => byCollection.has(s))]) {
  const fields = byCollection.get(c) ?? [];
  const system = c in SYSTEM;
  out += system
    ? `/** Eigen velden op ${c}; de standaardvelden komen uit @directus/sdk. */\nexport interface ${tsName(c)} {\n`
    : `export interface ${tsName(c)} {\n`;
  for (const f of fields) {
    const t = fieldType(f);
    if (t === null) continue;
    const prop = /^[a-z_][a-z0-9_]*$/i.test(f.field) ? f.field : JSON.stringify(f.field);
    out += `  ${prop}${system ? "?" : ""}: ${t};\n`;
  }
  out += `}\n\n`;
}

/* Systeemcollections zonder eigen velden: het type uit de SDK. */
const SDK_TYPES = { directus_files: "DirectusFile", directus_roles: "DirectusRole", directus_folders: "DirectusFolder" };
const fromSdk = Object.keys(SDK_TYPES).filter((c) => !byCollection.has(c));
if (fromSdk.length) {
  const names = fromSdk.map((c) => `${SDK_TYPES[c]} as Sdk${SDK_TYPES[c]}`).join(", ");
  out = out.replace("*/\n\n", `*/\n\nimport type { ${names} } from "@directus/sdk";\n\n`);
  for (const c of fromSdk) out += `export type ${SDK_TYPES[c]} = Sdk${SDK_TYPES[c]}<Schema>;\n`;
  out += "\n";
}

out += `export interface Schema {\n`;
for (const c of ordered) out += `  ${c}: ${tsName(c)}${singletons.has(c) ? "" : "[]"};\n`;
for (const c of Object.keys(SYSTEM)) if (byCollection.has(c)) out += `  ${c}: ${tsName(c)}[];\n`;
out += `}\n`;

writeFileSync(OUT, out);
console.log(`${path.relative(WEB, OUT)}: ${ordered.length} collections`);
