// Maakt het schema aan in Directus. Veilig opnieuw uit te voeren: bestaande collecties worden overgeslagen.
// Gebruik: DIRECTUS_URL=... DIRECTUS_ADMIN_TOKEN=... node apply-schema.mjs
import { api } from "./lib.mjs";
import { collections, relations } from "./schema.mjs";

const existing = new Set((await api("GET", "/collections?limit=-1")).data.map((c) => c.collection));

for (const c of collections) {
  if (existing.has(c.collection)) { console.log("bestaat al:", c.collection); continue; }
  const real = c.fields.filter((f) => f.type !== "alias");
  await api("POST", "/collections", {
    collection: c.collection,
    meta: { note: c.note || null, hidden: !!c.hidden, sort_field: c.sort ? "sort" : null, icon: null },
    schema: {},
    fields: real,
  });
  console.log("aangemaakt:", c.collection);
}

// Relaties
const haveRel = (await api("GET", "/relations?limit=-1")).data;
const hasRel = (col, field) => haveRel.some((r) => r.collection === col && r.field === field);
for (const r of relations) {
  if (hasRel(r.collection, r.field)) continue;
  const body = { collection: r.collection, field: r.field, related_collection: r.related, schema: { on_delete: r.on_delete || "SET NULL" }, meta: { one_field: r.one_field || null } };
  if (r.junction_field) body.meta.junction_field = r.junction_field;
  await api("POST", "/relations", body);
  console.log("relatie:", r.collection + "." + r.field, "->", r.related);
}

// Alias-velden (o2m en m2m) die nog ontbreken
for (const c of collections) {
  const have = new Set((await api("GET", "/fields/" + c.collection)).data.map((f) => f.field));
  for (const f of c.fields.filter((x) => x.type === "alias" && !have.has(x.field))) {
    await api("POST", "/fields/" + c.collection, { field: f.field, type: "alias", meta: f.meta, schema: null });
    console.log("alias:", c.collection + "." + f.field);
  }
}
console.log("Klaar. Zet daarna de rechten (zie README).");
