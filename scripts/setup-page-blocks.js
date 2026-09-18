/*
 * Maakt de `page_blocks` collectie + velden + relaties in Directus.
 * Idempotent: als iets al bestaat, wordt het overgeslagen.
 *
 * Run met:
 *   node scripts/setup-page-blocks.js
 *
 * Leest DIRECTUS_URL en DIRECTUS_STATIC_TOKEN uit .env.local.
 */

const fs = require("fs");
const path = require("path");

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

if (!BASE_URL || !TOKEN) {
  console.error("DIRECTUS_URL en/of DIRECTUS_STATIC_TOKEN ontbreken in .env.local");
  process.exit(1);
}

async function api(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
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

async function getCollection(name) {
  const { ok, data } = await api(`/collections/${name}`);
  return ok ? data.data : null;
}

async function getField(collection, field) {
  const { ok, data } = await api(`/fields/${collection}/${field}`);
  return ok ? data.data : null;
}

async function getRelation(collection, field) {
  const { ok, data } = await api(`/relations/${collection}/${field}`);
  return ok ? data.data : null;
}

async function createCollection(name, note) {
  if (await getCollection(name)) {
    console.log(`Collectie ${name} bestaat al`);
    return;
  }
  const { ok, status, data } = await api("/collections", {
    method: "POST",
    body: JSON.stringify({
      collection: name,
      meta: { icon: "view_list", note },
      schema: { name },
    }),
  });
  if (!ok) {
    console.error(`Fout bij aanmaken collectie ${name}:`, status, data);
    process.exit(1);
  }
  console.log(`Collectie ${name} aangemaakt`);
}

async function createField(collection, field, type, meta = {}, schema = {}) {
  if (await getField(collection, field)) {
    console.log(`Veld ${collection}.${field} bestaat al`);
    return;
  }
  const { ok, status, data } = await api(`/fields/${collection}`, {
    method: "POST",
    body: JSON.stringify({
      field,
      type,
      meta,
      schema,
    }),
  });
  if (!ok) {
    console.error(`Fout bij aanmaken veld ${collection}.${field}:`, status, data);
    process.exit(1);
  }
  console.log(`Veld ${collection}.${field} aangemaakt`);
}

async function createRelation(collection, field, relatedCollection, oneField, schemaExtras = {}) {
  if (await getRelation(collection, field)) {
    console.log(`Relatie ${collection}.${field} bestaat al`);
    return;
  }
  const { ok, status, data } = await api("/relations", {
    method: "POST",
    body: JSON.stringify({
      collection,
      field,
      related_collection: relatedCollection,
      meta: { one_field: oneField || null },
      schema: {
        table: collection,
        column: field,
        foreign_key_table: relatedCollection,
        foreign_key_column: "id",
        constraint_name: `${collection}_${field}_foreign`,
        on_update: "NO ACTION",
        on_delete: "SET NULL",
        ...schemaExtras,
      },
    }),
  });
  if (!ok) {
    console.error(`Fout bij aanmaken relatie ${collection}.${field}:`, status, data);
    process.exit(1);
  }
  console.log(`Relatie ${collection}.${field} → ${relatedCollection} aangemaakt${oneField ? ` (one_field: ${oneField})` : ""}`);
}

async function main() {
  console.log(`Directus: ${BASE_URL}`);

  await createCollection("page_blocks", "Blokken voor contentpagina's");

  await createField("page_blocks", "type", "string", {
    interface: "select-dropdown",
    options: {
      choices: [
        { text: "Hero", value: "hero" },
        { text: "Tekst", value: "text" },
        { text: "Tekst + afbeelding", value: "text_image" },
        { text: "Stappen", value: "steps" },
        { text: "Vinkjes", value: "ticks" },
        { text: "Quotes", value: "quotes" },
        { text: "Call-to-action", value: "cta" },
        { text: "Galerij", value: "gallery" },
      ],
    },
    note: "Welk bloktype wil je tonen?",
  });

  await createField("page_blocks", "sort", "integer", {
    interface: "input",
    note: "Sorteervolgorde op de pagina",
  });

  await createField("page_blocks", "title", "string", {
    interface: "input",
    width: "full",
  }, { max_length: 255, is_nullable: true });

  await createField("page_blocks", "body", "text", {
    interface: "input-rich-text-html",
    note: "Tekst / HTML van het blok",
  });

  await createField("page_blocks", "items", "json", {
    interface: "input-code",
    options: { language: "json", template: "[]" },
    note: "JSON-array met stappen, vinkjes of quotes. Voorbeeld stappen: [{\"title\":\"Stap 1\",\"description\":\"...\"}]",
  });

  await createField("page_blocks", "cta_label", "string", {
    interface: "input",
    note: "Tekst op de knop",
  }, { max_length: 255, is_nullable: true });

  await createField("page_blocks", "cta_to", "string", {
    interface: "input",
    note: "URL of interne route, bijv. /workshops of https://...",
  }, { max_length: 255, is_nullable: true });

  await createField("page_blocks", "style", "string", {
    interface: "select-dropdown",
    options: {
      choices: [
        { text: "Coral", value: "coral" },
        { text: "Ink (donker)", value: "ink" },
        { text: "Cloud (licht)", value: "cloud" },
      ],
    },
    note: "Achtergrondstijl voor CTA-bladen",
  });

  await createField("page_blocks", "page", "uuid", {
    interface: "m2o",
    special: ["m2o"],
    note: "Hoort bij pagina",
  }, { is_nullable: true });

  await createRelation("page_blocks", "page", "pages", "blocks");

  await createField("page_blocks", "image", "uuid", {
    interface: "file-image",
    special: ["file"],
    note: "Afbeelding voor hero, tekst+afbeelding of galerij",
  }, { is_nullable: true });

  await createRelation("page_blocks", "image", "directus_files", null);

  /* Alias veld op pages waarmee je blokken kunt toevoegen/bewerken in Directus. */
  await createField("pages", "blocks", "alias", {
    interface: "list-o2m",
    special: ["o2m"],
    note: "Blokken die op de pagina verschijnen",
  }, {});

  console.log("\nKlaar. Vergeet niet om in Directus de permissies voor page_blocks te controleren als je publieke reads doet via een andere rol dan admin.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
