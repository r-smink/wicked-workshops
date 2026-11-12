// Zet leesrechten voor bezoekers zonder login (publieke rol). Schrijfrechten geeft de publieke rol bewust niet. Veilig opnieuw uit te voeren.
// Gebruik: DIRECTUS_URL=... DIRECTUS_ADMIN_TOKEN=... node apply-permissions.mjs
import { api } from "./lib.mjs";

const pol = await api("GET", "/policies?limit=-1", null, [403, 404]);
let target;
if (pol.status === 200) {
  const p = pol.data.find((x) => x.name === "$t:public_label" || x.icon === "public");
  if (!p) throw new Error("Publieke policy niet gevonden");
  target = { policy: p.id };
} else {
  target = { role: null };
}
const pub = { status: { _eq: "published" } };
const reads = [
  ["categories", pub], ["cities", pub], ["providers", pub], ["spaces", pub], ["workshops", pub], ["reviews", pub],
  ["help_topics", pub], ["faqs", pub], ["sessions", null], ["workshops_files", null], ["directus_files", null],
];
let warn = false;
const existing = (await api("GET", "/permissions?limit=-1")).data;
const has = (c, a) => existing.some((p) => p.collection === c && p.action === a && (target.policy ? p.policy === target.policy : !p.role));
for (const [collection, permissions] of reads) {
  if (has(collection, "read")) { console.log("bestaat al: read", collection); continue; }
  const body = { ...target, collection, action: "read", fields: ["*"], permissions: permissions || {}, validation: {} };
  let r = await api("POST", "/permissions", body, [403]);
  if (r.status === 403 && permissions) {
    // Sommige Directus-edities staan geen eigen filterregels toe. Dan zonder regel, en filtert de frontend op status=published.
    body.permissions = {};
    await api("POST", "/permissions", body);
    warn = true;
    console.log("read (zonder filterregel):", collection);
  } else console.log("read:", collection);
}
if (warn) console.log("LET OP: deze Directus staat geen filterregels toe. Concepten (status draft) zijn dan publiek leesbaar via de API. Zet geen gevoelige tekst in concepten, en filter in de frontend altijd op status=published.");
console.log("Klaar. Bezoekers kunnen alleen content lezen. Formulieren (boeken, contact, ruimte) gaan via de server van de website met een eigen token, zie README.");
