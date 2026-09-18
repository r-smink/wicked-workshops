/*
 * Voegt menu-velden toe aan de `pages`-collectie zodat je pagina's kunt
 * onderverdelen in header/footer-menu's.
 *
 * Run met:
 *   node scripts/setup-menus.js
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

async function getField(collection, field) {
  const { ok, data } = await api(`/fields/${collection}/${field}`);
  return ok ? data.data : null;
}

async function createField(collection, field, type, meta = {}, schema = {}) {
  if (await getField(collection, field)) {
    console.log(`Veld ${collection}.${field} bestaat al`);
    return;
  }
  const { ok, status, data } = await api(`/fields/${collection}`, {
    method: "POST",
    body: JSON.stringify({ field, type, meta, schema }),
  });
  if (!ok) {
    console.error(`Fout bij aanmaken veld ${collection}.${field}:`, status, data);
    process.exit(1);
  }
  console.log(`Veld ${collection}.${field} aangemaakt`);
}

async function main() {
  console.log(`Directus: ${BASE_URL}`);

  await createField("pages", "menu_label", "string", {
    interface: "input",
    note: "Alternatieve label in het menu (laat leeg om de pagina-titel te gebruiken)",
  }, { max_length: 255, is_nullable: true });

  await createField("pages", "menu_location", "string", {
    interface: "select-dropdown",
    options: {
      choices: [
        { text: "Niet in menu", value: "" },
        { text: "Header", value: "header" },
        { text: "Footer", value: "footer" },
        { text: "Beide", value: "both" },
      ],
    },
    note: "Waar moet de pagina in het menu verschijnen?",
  });

  await createField("pages", "menu_order", "integer", {
    interface: "input",
    note: "Sorteervolgorde binnen het menu",
  });

  console.log("\nKlaar. Pas je pagina's aan in Directus en kies een menu-locatie.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
