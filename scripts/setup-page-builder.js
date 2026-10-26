/*
 * Breidt het Directus-schema uit voor de visual page builder uit
 * wicked-workshops-export.json, bovenop wat setup-page-blocks.js al maakte.
 *
 *   - pages.page_type
 *   - page_blocks: layoutvelden, tweede CTA, databronnen, settings en een
 *     M2M naar workshops; de keuzelijst van `type` krijgt de nieuwe blokken
 *   - workshop_sessions: min_participants, decision_at, goes_ahead
 *     (de doorgaan-drempel per datum)
 *   - settings: link en vet deel van de aankondigingsbalk
 *   - form_submissions: inzendingen van de formulierblokken
 *   - zet de sjablonen uit lib/page-templates.json als concept-pagina's neer
 *
 * Idempotent: wat al bestaat wordt overgeslagen, bestaande pagina's worden
 * nooit overschreven. Foto's uit public/pages/ die een blok als `image`
 * gebruikt, gaan eenmalig naar de bestandsbibliotheek van Directus.
 *
 * Run met:
 *   node scripts/setup-page-builder.js
 *   node scripts/setup-page-builder.js --no-seed       (alleen schema)
 *   node scripts/setup-page-builder.js --sync-drafts   (pagina's die nog
 *     concept zijn opnieuw opbouwen uit de sjablonen; wat in Directus aan
 *     die concepten is veranderd gaat verloren. Gepubliceerde pagina's
 *     blijven altijd staan.)
 *
 * Leest DIRECTUS_URL en DIRECTUS_STATIC_TOKEN uit .env.local.
 */

const fs = require("fs");
const path = require("path");
const BLOCK_TYPES = require("../lib/block-types.json");
const { templates: TEMPLATES } = require("../lib/page-templates.json");

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  const lines = fs.readFileSync(envPath, "utf-8").split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const env = loadEnv();
const BASE_URL = (env.DIRECTUS_URL || "").replace(/\/$/, "");
const TOKEN = env.DIRECTUS_STATIC_TOKEN || "";
const SEED = !process.argv.includes("--no-seed");
const SYNC_DRAFTS = process.argv.includes("--sync-drafts");

if (!BASE_URL || !TOKEN) {
  console.error("DIRECTUS_URL en/of DIRECTUS_STATIC_TOKEN ontbreken in .env.local");
  process.exit(1);
}

async function api(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await res.text().catch(() => "");
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { ok: res.ok, status: res.status, data: json };
}

function fail(what, status, data) {
  console.error(`Fout bij ${what}:`, status, JSON.stringify(data));
  process.exit(1);
}

async function createCollection(name, meta, fields = []) {
  const existing = await api(`/collections/${name}`);
  if (existing.ok) {
    console.log(`Collectie ${name} bestaat al`);
    return;
  }
  const { ok, status, data } = await api("/collections", {
    method: "POST",
    body: JSON.stringify({ collection: name, meta, schema: { name }, fields }),
  });
  if (!ok) fail(`aanmaken collectie ${name}`, status, data);
  console.log(`Collectie ${name} aangemaakt`);
}

async function createField(collection, field, type, meta = {}, schema = {}) {
  const existing = await api(`/fields/${collection}/${field}`);
  if (existing.ok) {
    console.log(`Veld ${collection}.${field} bestaat al`);
    return;
  }
  const body = { field, type, meta };
  if (schema !== null) body.schema = schema;
  const { ok, status, data } = await api(`/fields/${collection}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!ok) fail(`aanmaken veld ${collection}.${field}`, status, data);
  console.log(`Veld ${collection}.${field} aangemaakt`);
}

/* Werkt alleen de keuzelijst van een bestaand dropdownveld bij. */
async function setChoices(collection, field, choices, extra = {}) {
  const { ok, status, data } = await api(`/fields/${collection}/${field}`, {
    method: "PATCH",
    body: JSON.stringify({ meta: { options: { choices, ...extra } } }),
  });
  if (!ok) fail(`bijwerken keuzes ${collection}.${field}`, status, data);
  console.log(`Keuzes ${collection}.${field} bijgewerkt (${choices.length})`);
}

async function createRelation(body) {
  const existing = await api(`/relations/${body.collection}/${body.field}`);
  if (existing.ok) {
    console.log(`Relatie ${body.collection}.${body.field} bestaat al`);
    return;
  }
  const { ok, status, data } = await api("/relations", { method: "POST", body: JSON.stringify(body) });
  if (!ok) fail(`aanmaken relatie ${body.collection}.${body.field}`, status, data);
  console.log(`Relatie ${body.collection}.${body.field} → ${body.related_collection} aangemaakt`);
}

const dropdown = (choices, note, extra = {}) => ({
  interface: "select-dropdown",
  options: { choices, ...extra },
  display: "labels",
  note,
});

async function setupPages() {
  await createField("pages", "page_type", "string",
    { ...dropdown(BLOCK_TYPES.page_types, "Sjablonen (categorie, workshop, aanbieder, inloggen) leggen blokken rond het vaste scherm; zet daarin een blok 'Pagina-inhoud'."), width: "half" },
    { default_value: "content", is_nullable: true, max_length: 32 });
}

async function setupPageBlocks() {
  const types = [...BLOCK_TYPES.legacy, ...BLOCK_TYPES.builder].map(({ value, text }) => ({ value, text }));
  await setChoices("page_blocks", "type", types);

  await setChoices("page_blocks", "style", [
    { text: "Standaard", value: "default" },
    { text: "Cloud (licht paars)", value: "cloud" },
    { text: "Ink (donker)", value: "ink" },
    { text: "Coral", value: "coral" },
  ]);

  const str = (max = 255) => ({ is_nullable: true, max_length: max });

  await createField("page_blocks", "eyebrow", "string",
    { interface: "input", width: "half", note: "Klein label boven de titel" }, str());
  await createField("page_blocks", "variant", "string",
    { ...dropdown([
      { text: "Hero: beeld rechts", value: "split" },
      { text: "Hero: beeld als achtergrond", value: "overlay" },
      { text: "Hero: gecentreerd", value: "centered" },
      { text: "Hero: met zoekveld", value: "search" },
      { text: "Workshops: raster", value: "grid" },
      { text: "Workshops: carrousel", value: "rail" },
      { text: "Workshops: met datums", value: "dates" },
      { text: "Workshops: agenda per dag", value: "agenda" },
      { text: "Categorieën: tegels", value: "tiles" },
      { text: "Categorieën: lijst", value: "list" },
      { text: "Stappen: genummerd", value: "numbered" },
      { text: "Stappen: tijdlijn", value: "timeline" },
      { text: "Stappen: kaarten", value: "cards" },
      { text: "Drempel: interactief", value: "interactive" },
      { text: "Drempel: legenda", value: "legend" },
      { text: "Beeld rechts", value: "image-right" },
      { text: "Beeld links", value: "image-left" },
      { text: "Reviews: één groot citaat", value: "single" },
    ], "Weergave. Welke waarden passen, hangt af van het bloktype.", { allowOther: true }), width: "half" },
    str(32));
  await createField("page_blocks", "image_alt", "string",
    { interface: "input", note: "Beschrijf wat er op de foto te zien is" }, str());
  await createField("page_blocks", "cta_secondary_label", "string",
    { interface: "input", width: "half", note: "Tweede knop of link" }, str());
  await createField("page_blocks", "cta_secondary_to", "string",
    { interface: "input", width: "half", note: "URL, interne route of #anker" }, str());
  await createField("page_blocks", "source", "string",
    { ...dropdown(BLOCK_TYPES.sources, "Waar de workshops, reviews of ruimtes vandaan komen"), width: "half" }, str(32));
  await createField("page_blocks", "item_limit", "integer",
    { interface: "input", width: "half", note: "Maximaal aantal items (leeg = standaard)" }, { is_nullable: true });
  await createField("page_blocks", "filter_category", "uuid",
    { interface: "select-dropdown-m2o", special: ["m2o"], width: "half", note: "Bij bron 'Gekozen categorie'", options: { template: "{{name}}" } },
    { is_nullable: true });
  await createRelation({
    collection: "page_blocks", field: "filter_category", related_collection: "categories",
    schema: { on_delete: "SET NULL" },
  });
  await createField("page_blocks", "filter_city", "uuid",
    { interface: "select-dropdown-m2o", special: ["m2o"], width: "half", note: "Bij bron 'Gekozen categorie': beperk tot een plaats", options: { template: "{{name}}" } },
    { is_nullable: true });
  await createRelation({
    collection: "page_blocks", field: "filter_city", related_collection: "cities",
    schema: { on_delete: "SET NULL" },
  });
  await createField("page_blocks", "form", "string",
    { ...dropdown(BLOCK_TYPES.forms, "Welk formulier dit blok toont"), width: "half" }, str(32));
  await createField("page_blocks", "anchor", "string",
    { interface: "input", width: "half", note: "Anker voor links binnen de pagina, zonder #" }, str(64));
  await createField("page_blocks", "padding_top", "string",
    { ...dropdown(["none", "sm", "md", "lg"].map((v) => ({ text: v, value: v })), "Ruimte boven het blok"), width: "half" }, str(8));
  await createField("page_blocks", "padding_bottom", "string",
    { ...dropdown(["none", "sm", "md", "lg"].map((v) => ({ text: v, value: v })), "Ruimte onder het blok"), width: "half" }, str(8));
  await createField("page_blocks", "hidden", "boolean",
    { interface: "boolean", width: "half", note: "Tijdelijk verbergen zonder te verwijderen" }, { default_value: false });
  await createField("page_blocks", "settings", "json",
    { interface: "input-code", options: { language: "json" }, note: "Extra instellingen per bloktype, bijv. {\"example\":{\"capacity\":8,\"min\":4,\"taken\":3}} of {\"breadcrumbs\":[...]}" },
    { is_nullable: true });

  /* M2M page_blocks ↔ workshops voor bron 'Handmatig gekozen'. */
  await createCollection("page_blocks_workshops", { hidden: true, icon: "import_export" }, [
    { field: "id", type: "integer", meta: { hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } },
  ]);
  await createField("page_blocks_workshops", "page_blocks_id", "integer", { hidden: true }, { is_nullable: true });
  await createField("page_blocks_workshops", "workshops_id", "uuid", { hidden: true }, { is_nullable: true });
  await createField("page_blocks_workshops", "sort", "integer", { hidden: true }, { is_nullable: true });
  await createField("page_blocks", "workshops", "alias", {
    interface: "list-m2m", special: ["m2m"],
    options: { template: "{{workshops_id.title}}" },
    note: "Bij bron 'Handmatig gekozen'",
  }, null);
  await createRelation({
    collection: "page_blocks_workshops", field: "page_blocks_id", related_collection: "page_blocks",
    meta: { one_field: "workshops", junction_field: "workshops_id", sort_field: "sort" },
    schema: { on_delete: "CASCADE" },
  });
  await createRelation({
    collection: "page_blocks_workshops", field: "workshops_id", related_collection: "workshops",
    meta: { one_field: null, junction_field: "page_blocks_id" },
    schema: { on_delete: "CASCADE" },
  });
}

async function setupSessions() {
  await createField("workshop_sessions", "min_participants", "integer",
    { interface: "input", width: "half", note: "Minimum voor deze datum. Leeg = minimum van de workshop; 0 = gaat altijd door." },
    { is_nullable: true });
  await createField("workshop_sessions", "decision_at", "timestamp",
    { interface: "datetime", width: "half", note: "Beslismoment: tot wanneer het minimum gehaald moet zijn" },
    { is_nullable: true });
  await createField("workshop_sessions", "goes_ahead", "boolean",
    { interface: "boolean", width: "half", note: "Wordt aangezet zodra het minimum gehaald is en blijft dan staan, ook als iemand afhaakt" },
    { default_value: false });
}

async function setupSettings() {
  await createField("settings", "announcement_highlight", "string",
    { interface: "input", width: "half", note: "Vetgedrukt begin van de aankondigingsbalk" }, { is_nullable: true, max_length: 255 });
  await createField("settings", "announcement_link", "string",
    { interface: "input", width: "half", note: "Waar de aankondigingsbalk naartoe linkt (optioneel)" }, { is_nullable: true, max_length: 255 });
}

async function setupForms() {
  await createCollection("form_submissions", { icon: "inbox", note: "Inzendingen van de formulierblokken", archive_field: "status", archive_value: "archived" }, [
    { field: "id", type: "uuid", meta: { hidden: true, readonly: true, special: ["uuid"] }, schema: { is_primary_key: true } },
  ]);
  await createField("form_submissions", "date_created", "timestamp",
    { special: ["date-created"], interface: "datetime", readonly: true, width: "half" }, { is_nullable: true });
  await createField("form_submissions", "status", "string",
    { ...dropdown([
      { text: "Nieuw", value: "new" },
      { text: "Afgehandeld", value: "done" },
      { text: "Gearchiveerd", value: "archived" },
    ]), width: "half" }, { default_value: "new", is_nullable: false, max_length: 16 });
  await createField("form_submissions", "form", "string",
    { ...dropdown(BLOCK_TYPES.forms), width: "half" }, { is_nullable: true, max_length: 32 });
  await createField("form_submissions", "email", "string",
    { interface: "input", width: "half" }, { is_nullable: true, max_length: 255 });
  await createField("form_submissions", "name", "string",
    { interface: "input", width: "half" }, { is_nullable: true, max_length: 255 });
  await createField("form_submissions", "source_page", "string",
    { interface: "input", width: "half", readonly: true }, { is_nullable: true, max_length: 255 });
  await createField("form_submissions", "data", "json",
    { interface: "input-code", options: { language: "json" }, readonly: true }, { is_nullable: true });
}

/* Een sjabloonfoto ("/pages/x.jpg") eenmalig uploaden en daarna op titel
   hergebruiken. Geeft het bestand-id terug. */
const uploaded = new Map();
async function uploadImage(publicPath) {
  if (uploaded.has(publicPath)) return uploaded.get(publicPath);
  const name = path.basename(publicPath);
  const title = `Page builder: ${name}`;
  const found = await api(`/files?filter[title][_eq]=${encodeURIComponent(title)}&fields=id&limit=1`);
  let id = found.ok ? found.data.data?.[0]?.id : null;
  if (!id) {
    const file = fs.readFileSync(path.join(__dirname, "..", "public", publicPath));
    const form = new FormData();
    form.append("title", title);
    form.append("file", new Blob([file], { type: "image/jpeg" }), name);
    const res = await fetch(`${BASE_URL}/files`, { method: "POST", headers: { Authorization: `Bearer ${TOKEN}` }, body: form });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) fail(`uploaden ${name}`, res.status, json);
    id = json.data.id;
    console.log(`  foto ${name} geüpload`);
  }
  uploaded.set(publicPath, id);
  return id;
}

/* `image` is in Directus een bestandsveld. Foto's in items en settings
   blijven een pad, want dat is JSON. */
async function toDirectusBlocks(blocks) {
  const out = [];
  for (const [i, b] of blocks.entries()) {
    const block = { ...b, sort: i + 1 };
    if (typeof block.image === "string" && block.image.startsWith("/")) block.image = await uploadImage(block.image);
    out.push(block);
  }
  return out;
}

async function seedTemplates() {
  for (const t of TEMPLATES) {
    const existing = await api(`/items/pages?filter[slug][_eq]=${encodeURIComponent(t.slug)}&fields=id,status,blocks&limit=1`);
    const page = existing.ok ? existing.data.data?.[0] : null;
    if (page && SYNC_DRAFTS && page.status === "draft") {
      if (page.blocks?.length) {
        const del = await api("/items/page_blocks", { method: "DELETE", body: JSON.stringify(page.blocks) });
        if (!del.ok) fail(`verwijderen blokken ${t.slug}`, del.status, del.data);
      }
      const blocks = await toDirectusBlocks(t.blocks);
      const upd = await api(`/items/pages/${page.id}`, {
        method: "PATCH",
        body: JSON.stringify({ title: t.title, page_type: t.page_type, blocks }),
      });
      if (!upd.ok) fail(`bijwerken concept ${t.slug}`, upd.status, upd.data);
      console.log(`Concept ${t.slug} opnieuw opgebouwd (${blocks.length} blokken)`);
      continue;
    }
    if (page) {
      console.log(`Pagina ${t.slug} bestaat al (${page.status}), niet aangeraakt`);
      continue;
    }
    const blocks = await toDirectusBlocks(t.blocks);
    const { ok, status, data } = await api("/items/pages", {
      method: "POST",
      body: JSON.stringify({
        status: "draft",
        slug: t.slug,
        title: t.title,
        page_type: t.page_type,
        seo_title: t.seo_title || null,
        seo_description: t.seo_description || null,
        blocks,
      }),
    });
    if (!ok) fail(`aanmaken pagina ${t.slug}`, status, data);
    console.log(`Pagina ${t.slug} aangemaakt als concept (${blocks.length} blokken)`);
  }
}

async function main() {
  console.log(`Directus: ${BASE_URL}\n`);
  await setupPages();
  await setupPageBlocks();
  await setupSessions();
  await setupSettings();
  await setupForms();
  if (SEED) {
    console.log("");
    await seedTemplates();
  }
  console.log("\nKlaar. De sjablonen staan als concept: de site toont ze pas na publiceren.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
