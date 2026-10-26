/* Kleine Directus-client voor de scripts (migratie, seed, rechten). Praat
   met de lokale Directus, of met een andere als DIRECTUS_TARGET_URL en
   DIRECTUS_TARGET_TOKEN gezet zijn. */
import { directusUrl, loadEnv } from "./env.mjs";

const env = loadEnv();
export const BASE = (env.DIRECTUS_TARGET_URL || directusUrl(env)).replace(/\/$/, "");
const TOKEN = env.DIRECTUS_TARGET_TOKEN || env.ADMIN_TOKEN;

export async function api(method, path, body, token = TOKEN) {
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 204) return null;
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.errors?.map((e) => e.message).join("; ") || res.statusText;
    const err = new Error(`${method} ${path}: ${res.status} ${msg}`);
    err.status = res.status;
    throw err;
  }
  return json.data;
}

/* Querystring voor Directus: objecten worden JSON. */
export function query(o) {
  return "?" + new URLSearchParams(Object.entries(o).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)]));
}

/* ---------- schema-helpers, idempotent ---------- */

async function exists(path) {
  try {
    await api("GET", path);
    return true;
  } catch (e) {
    if (e.status === 403 || e.status === 404) return false;
    throw e;
  }
}

export const fieldExists = (collection, field) => exists(`/fields/${collection}/${field}`);
export const collectionExists = (collection) => exists(`/collections/${collection}`);

/* Maakt een collection met primaire sleutel en de standaardvelden van
   docs/03 (date_created, date_updated, user_created, user_updated). */
export async function ensureCollection(collection, meta, { pk = uuidPk(), standard = true, singleton = false } = {}) {
  if (await collectionExists(collection)) {
    await api("PATCH", `/collections/${collection}`, { meta });
    return false;
  }
  const fields = [pk];
  if (standard) fields.push(...standardFields());
  await api("POST", "/collections", { collection, meta: { singleton, ...meta }, schema: {}, fields });
  if (standard) {
    for (const f of ["user_created", "user_updated"]) {
      await ensureRelation({ collection, field: f, related_collection: "directus_users" });
    }
  }
  return true;
}

export function uuidPk() {
  return { field: "id", type: "uuid", meta: { hidden: true, readonly: true, interface: "input", special: ["uuid"] }, schema: { is_primary_key: true, length: 36, has_auto_increment: false } };
}

export function intPk() {
  return { field: "id", type: "integer", meta: { hidden: true, interface: "input", readonly: true }, schema: { is_primary_key: true, has_auto_increment: true } };
}

export function stringPk(field, note) {
  return { field, type: "string", meta: { interface: "input", readonly: false, note, required: true, width: "half" }, schema: { is_primary_key: true, has_auto_increment: false, max_length: 64 } };
}

export function standardFields() {
  const ts = (field, special) => ({ field, type: "timestamp", meta: { special: [special], interface: "datetime", readonly: true, hidden: true, width: "half", display: "datetime", display_options: { relative: true } }, schema: {} });
  const usr = (field, special) => ({ field, type: "uuid", meta: { special: [special], interface: "select-dropdown-m2o", options: { template: "{{avatar}} {{first_name}} {{last_name}}" }, display: "user", readonly: true, hidden: true, width: "half" }, schema: {} });
  return [ts("date_created", "date-created"), ts("date_updated", "date-updated"), usr("user_created", "user-created"), usr("user_updated", "user-updated")];
}

/* Voegt een veld toe, of werkt bij een bestaand veld de meta bij (en het
   schema als patchSchema gezet is). */
export async function ensureField(collection, def) {
  const { patchSchema, ...body } = def;
  if (await fieldExists(collection, def.field)) {
    const patch = { meta: def.meta };
    if (patchSchema && def.schema) patch.schema = def.schema;
    await api("PATCH", `/fields/${collection}/${def.field}`, patch);
    return false;
  }
  await api("POST", `/fields/${collection}`, body);
  return true;
}

export async function ensureRelation(def) {
  /* Bestaande relaties laten we staan: een PATCH op een relatie laat
     Directus 11.17 soms crashen (RelationsService.alterType). */
  if (await exists(`/relations/${def.collection}/${def.field}`)) return false;
  await api("POST", "/relations", def);
  return true;
}

/* ---------- veldsoorten, kort ---------- */

const choiceList = (choices) => choices.map(([value, text]) => ({ value, text }));

export const F = {
  string: (field, { note, required = false, max = 255, width = "full", unique = false, hidden = false, def = null, indexed = false } = {}) => ({
    field, type: "string",
    meta: { interface: "input", note, required, width, hidden, options: { trim: true } },
    schema: { max_length: max, is_unique: unique, is_indexed: indexed, default_value: def },
  }),
  text: (field, { note, required = false } = {}) => ({ field, type: "text", meta: { interface: "input-multiline", note, required }, schema: {} }),
  int: (field, { note, required = false, def = null, min, max, width = "half", hidden = false } = {}) => ({
    field, type: "integer",
    meta: { interface: "input", note, required, width, hidden, options: min !== undefined || max !== undefined ? { min, max } : null },
    schema: { default_value: def },
  }),
  bool: (field, def, { note, width = "half", label } = {}) => ({
    field, type: "boolean",
    meta: { interface: "boolean", special: ["cast-boolean"], note, width, options: label ? { label } : null, display: "boolean" },
    schema: { default_value: def, is_nullable: false },
  }),
  ts: (field, { note, width = "half", readonly = false } = {}) => ({ field, type: "timestamp", meta: { interface: "datetime", note, width, readonly, display: "datetime" }, schema: {} }),
  date: (field, { note, width = "half" } = {}) => ({ field, type: "date", meta: { interface: "datetime", note, width }, schema: {} }),
  time: (field, { note, width = "half" } = {}) => ({ field, type: "time", meta: { interface: "datetime", note, width }, schema: {} }),
  json: (field, { note, def = null } = {}) => ({
    field, type: "json", meta: { interface: "input-code", special: ["cast-json"], note, options: { language: "json" } }, schema: { default_value: def },
  }),
  tags: (field, { note } = {}) => ({ field, type: "json", meta: { interface: "tags", special: ["cast-json"], note }, schema: {} }),
  choice: (field, choices, { def = null, note, required = false, width = "half" } = {}) => ({
    field, type: "string",
    meta: { interface: "select-dropdown", options: { choices: choiceList(choices) }, display: "labels", display_options: { choices: choiceList(choices) }, note, required, width },
    schema: { default_value: def, max_length: 64 },
  }),
  m2o: (field, { note, required = false, template, type = "uuid", width = "half", unique = false } = {}) => ({
    field, type,
    meta: { interface: "select-dropdown-m2o", special: ["m2o"], note, required, width, options: template ? { template } : null, display: template ? "related-values" : null, display_options: template ? { template } : null },
    schema: { is_unique: unique, is_indexed: true },
  }),
  file: (field, { note, width = "half" } = {}) => ({ field, type: "uuid", meta: { interface: "file-image", special: ["file"], note, width, display: "image" }, schema: {} }),
  o2m: (field, { template, note } = {}) => ({ field, type: "alias", meta: { interface: "list-o2m", special: ["o2m"], note, options: template ? { template } : null } }),
  sort: () => ({ field: "sort", type: "integer", meta: { interface: "input", hidden: true }, schema: {} }),
};

export function m2oRelation(collection, field, related_collection, { onDelete = "SET NULL", oneField = null } = {}) {
  return {
    collection, field, related_collection,
    meta: { one_field: oneField, one_deselect_action: "nullify" },
    schema: { on_delete: onDelete },
  };
}
