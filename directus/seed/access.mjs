/* Rollen, policies en rechten uit docs/03 (rechtenmatrix), als code.
   Idempotent: de rechten van onze policies worden elke keer opnieuw gezet.

   Rollen
     Member  elke ingelogde gebruiker. Rechten volgen uit eigendom
             ($CURRENT_USER), niet uit extra rollen. Workshopgever is wie een
             rij in providers heeft; ruimte-eigenaar wie venue_listings heeft.
     Team    medewerkers: nakijken, privevelden, beheer (geen Directus-beheer).
     Administrator  bestaat al (techniek).

   Policies
     Public (ingebouwd)  uitgelogd lezen. Hangt ook aan Member, zodat een
                         ingelogde gebruiker minstens ziet wat iedereen ziet.
     Member              eigen gegevens.
     Member aanbieder    aanmeldingen op eigen datums, alleen de kolommen die
                         een workshopgever mag zien. Aparte policy, zodat
                         Directus de velden per rij bepaalt (eigen aanmelding:
                         alles; aanmelding bij jou: alleen deze kolommen).
     Team                volledig, behalve rollen en wachtwoorden van anderen. */
import { api, query } from "../scripts/api.mjs";
import { PUBLIC_FIELDS, assertClassified } from "./fields.mjs";

const ME = "$CURRENT_USER";
const R = (collection, action, { filter = {}, fields = ["*"], validation = null, presets = null } = {}) => ({
  collection, action, permissions: filter, validation, presets, fields,
});

const published = { status: { _eq: "published" } };
const liveWorkshop = (path) => nest(path, { status: { _eq: "published" } });
const ownWorkshop = (path) => nest(path, { provider: { user: { _eq: ME } } });
/* { workshop: { ... } } voor pad "workshop", of rechtstreeks bij een leeg pad. */
function nest(path, inner) {
  return path ? path.split(".").reduceRight((acc, key) => ({ [key]: acc }), inner) : inner;
}

const LOOKUPS = ["occasions", "cities", "cancellation_policies", "age_ratings", "amenities", "languages", "dietary_options", "inclusion_types"];
const WORKSHOP_CHILDREN = ["workshop_media", "workshop_faq", "workshop_inclusions"];
const WORKSHOP_JUNCTIONS = ["workshops_occasions", "workshops_languages", "workshops_amenities", "workshops_categories", "workshops_dietary_options", "workshops_inclusion_types"];

/* ---------- uitgelogd ---------- */

export function publicPermissions() {
  return [
    ...LOOKUPS.map((c) => R(c, "read")),
    R("categories", "read", { filter: published }),
    R("platform_settings", "read", { fields: ["feature_auth_social", "feature_venues", "pilot_no_payments"] }),
    R("workshops", "read", { filter: published, fields: PUBLIC_FIELDS.workshops }),
    ...WORKSHOP_CHILDREN.map((c) => R(c, "read", { filter: liveWorkshop("workshop") })),
    ...WORKSHOP_JUNCTIONS.map((c) => R(c, "read", { filter: liveWorkshop("workshop_id") })),
    R("workshop_sessions", "read", {
      filter: { _and: [liveWorkshop("workshop"), { is_private: { _neq: true } }] },
      fields: PUBLIC_FIELDS.workshop_sessions,
    }),
    R("providers", "read", { filter: published, fields: PUBLIC_FIELDS.providers }),
    R("reviews", "read", { filter: published, fields: PUBLIC_FIELDS.reviews }),
    R("venue_listings", "read", { filter: { _and: [{ visible: { _eq: true } }, published] }, fields: PUBLIC_FIELDS.venue_listings }),
    R("venue_listing_images", "read", { filter: { listing: { _and: [{ visible: { _eq: true } }, published] } } }),
  ];
}

/* ---------- ingelogd: eigen gegevens ---------- */

const WORKSHOP_WRITE = [
  "slug", "title", "subtitle", "intro", "description", "duration_minutes", "level", "format", "price_per_person",
  "cancellation_policy", "location_name", "neighbourhood", "category", "age_rating", "city", "accessibility", "status",
  "media", "inclusions", "faq", "occasions", "languages", "amenities", "dietary_options", "inclusion_types", "secondary_categories",
  /* Zet de hook ww-guards zelf; staat hier omdat Directus de rechten na de hook controleert. */
  "submitted_at",
];
const SESSION_WRITE = ["starts_at", "ends_at", "capacity", "min_participants", "decision_at", "state", "confirmed_at", "closed_at"];
const PROVIDER_WRITE = ["first_name", "display_name", "area_label", "bio_short", "bio_long", "avatar", "kind", "has_location", "city", "neighbourhood", "status"];
const USER_SELF_READ = ["id", "first_name", "email", "avatar", "status", "email_verified_at", "last_context", "notify_reminder_decision", "notify_new_session_followed", "notify_saved_almost_full", "notify_tips"];
const USER_SELF_WRITE = ["first_name", "password", "avatar", "last_context", "notify_reminder_decision", "notify_new_session_followed", "notify_saved_almost_full", "notify_tips"];

const own = (field) => ({ [field]: { _eq: ME } });
/* Lezen, maken, wijzigen en verwijderen van eigen rijen. De verwijzing naar
   de eigenaar (lockOnUpdate) mag na het maken niet meer veranderen. Bij
   fields "*" kan dat niet in de rechten; dan bewaakt de hook ww-guards het. */
const ownCrud = (collection, filter, { fields = ["*"], writeFields = fields, createExtra = {} } = {}) => {
  const { lockOnUpdate = [], ...create } = createExtra;
  const updateFields = writeFields[0] === "*" ? ["*"] : writeFields.filter((f) => !lockOnUpdate.includes(f));
  return [
    R(collection, "read", { filter, fields }),
    R(collection, "create", { fields: writeFields, ...create }),
    R(collection, "update", { filter, fields: updateFields }),
    R(collection, "delete", { filter }),
  ];
};
/* Aanmaken met de eigenaar vast op de ingelogde gebruiker. */
const ownedBy = (field) => ({ presets: { [field]: ME }, validation: { [field]: { _eq: ME } }, lockOnUpdate: [field] });

export function memberPermissions() {
  return [
    R("directus_users", "read", { filter: { id: { _eq: ME } }, fields: USER_SELF_READ }),
    R("directus_users", "update", { filter: { id: { _eq: ME } }, fields: USER_SELF_WRITE }),

    R("directus_files", "read", { filter: own("uploaded_by") }),
    R("directus_files", "create", { fields: ["*"] }),
    R("directus_files", "update", { filter: own("uploaded_by"), fields: ["title", "description", "tags"] }),
    R("directus_files", "delete", { filter: own("uploaded_by") }),

    /* Workshopgever: profiel, verklaring, workshops, datums. */
    R("providers", "read", { filter: own("user") }),
    R("providers", "create", { fields: ["user", ...PROVIDER_WRITE], presets: { user: ME }, validation: own("user") }),
    R("providers", "update", { filter: own("user"), fields: PROVIDER_WRITE }),

    R("provider_declarations", "read", { filter: { provider: own("user") } }),
    R("provider_declarations", "create", { fields: ["*"] }),
    R("provider_declarations", "update", { filter: { provider: own("user") }, fields: ["*"] }),

    R("workshops", "read", { filter: ownWorkshop("") }),
    R("workshops", "create", { fields: ["provider", ...WORKSHOP_WRITE] }),
    R("workshops", "update", { filter: ownWorkshop(""), fields: WORKSHOP_WRITE }),
    R("workshops", "delete", { filter: { _and: [ownWorkshop(""), { status: { _eq: "draft" } }] } }),

    ...ownCrud("workshop_private", ownWorkshop("workshop"), { writeFields: ["workshop", "address", "postal_code"], createExtra: { lockOnUpdate: ["workshop"] } }),
    ...WORKSHOP_CHILDREN.flatMap((c) => ownCrud(c, ownWorkshop("workshop"), { createExtra: { lockOnUpdate: ["workshop"] } })),
    ...WORKSHOP_JUNCTIONS.flatMap((c) => ownCrud(c, ownWorkshop("workshop_id"), { createExtra: { lockOnUpdate: ["workshop_id"] } })),

    R("workshop_sessions", "read", { filter: ownWorkshop("workshop") }),
    R("workshop_sessions", "create", { fields: ["workshop", ...SESSION_WRITE] }),
    R("workshop_sessions", "update", { filter: ownWorkshop("workshop"), fields: SESSION_WRITE }),
    R("workshop_sessions", "delete", { filter: ownWorkshop("workshop") }),

    /* Deelnemer: eigen aanmeldingen, aanbiedingen, bewaard, volgen. Aanmelden,
       annuleren en verzetten lopen via de server (docs/05), niet direct. */
    R("bookings", "read", { filter: own("customer"), fields: PUBLIC_FIELDS.bookings_own }),
    R("session_offers", "read", { filter: { booking: own("customer") } }),
    R("reviews", "read", { filter: own("user"), fields: PUBLIC_FIELDS.reviews_own }),

    ...ownCrud("favorites", own("user"), { fields: ["id", "user", "workshop", "date_created"], writeFields: ["user", "workshop"], createExtra: ownedBy("user") }).filter((p) => p.action !== "update"),
    ...ownCrud("follows", own("user"), { fields: ["id", "user", "provider", "date_created"], writeFields: ["user", "provider"], createExtra: ownedBy("user") }).filter((p) => p.action !== "update"),

    /* Ruimte-eigenaar (Locatie gezocht). */
    ...ownCrud("venue_listings", own("owner"), {
      writeFields: ["owner", "visible", "status", "name", "place", "neighbourhood", "kind", "capacity", "amenities", "description", "availability", "images"],
      createExtra: ownedBy("owner"),
    }),
    ...ownCrud("venue_listing_images", { listing: own("owner") }, { createExtra: { lockOnUpdate: ["listing"] } }),
    R("venue_contact_requests", "create", { fields: ["listing", "from_user", "message", "share_email"], presets: { from_user: ME }, validation: own("from_user") }),
    R("venue_contact_requests", "read", { filter: { _or: [own("from_user"), { listing: own("owner") }] } }),
  ];
}

/* Aanbieder ziet aanmeldingen op eigen datums: alleen deze kolommen (docs/03, docs/10). */
export function providerViewPermissions() {
  return [R("bookings", "read", { filter: { session: ownWorkshop("workshop") }, fields: PUBLIC_FIELDS.bookings_provider })];
}

/* ---------- team ---------- */

async function teamPermissions() {
  const collections = (await api("GET", "/collections?limit=-1"))
    .map((c) => c.collection)
    .filter((c) => !c.startsWith("directus_"));
  const readOnly = new Set(["favorites", "follows"]);
  const list = [];
  for (const c of collections) {
    for (const action of readOnly.has(c) ? ["read"] : ["create", "read", "update", "delete"]) list.push(R(c, action));
  }
  list.push(
    R("directus_users", "read", { fields: ["*"] }),
    R("directus_users", "update", { fields: ["first_name", "last_name", "status", "email_verified_at", "last_context"] }),
    R("directus_files", "create"), R("directus_files", "read"), R("directus_files", "update"), R("directus_files", "delete"),
    R("directus_folders", "read"),
  );
  return list;
}

/* ---------- toepassen ---------- */

async function findOne(collection, filter) {
  const rows = await api("GET", `/${collection}${query({ filter, limit: 1 })}`);
  return rows[0] ?? null;
}

async function ensurePolicy(name, props) {
  const found = await findOne("policies", { name: { _eq: name } });
  if (found) {
    await api("PATCH", `/policies/${found.id}`, props);
    return found.id;
  }
  return (await api("POST", "/policies", { name, ...props })).id;
}

async function ensureRole(name, props) {
  const found = await findOne("roles", { name: { _eq: name } });
  if (found) return found.id;
  return (await api("POST", "/roles", { name, ...props })).id;
}

async function ensureAccess(role, policy) {
  const found = await findOne("access", { _and: [{ role: { _eq: role } }, { policy: { _eq: policy } }] });
  if (!found) await api("POST", "/access", { role, policy });
}

async function setPermissions(policy, list) {
  const existing = await api("GET", `/permissions${query({ filter: { policy: { _eq: policy } }, fields: "id", limit: -1 })}`);
  if (existing.length) await api("DELETE", "/permissions", existing.map((p) => p.id));
  if (list.length) await api("POST", "/permissions", list.map((p) => ({ ...p, policy })));
}

export async function seedAccess() {
  await assertClassified();

  const publicPolicy = await findOne("policies", { name: { _eq: "$t:public_label" } });
  if (!publicPolicy) throw new Error("Ingebouwde public policy niet gevonden.");

  const member = await ensurePolicy("Member", { icon: "person", description: "Eigen gegevens (docs/03).", admin_access: false, app_access: false });
  const memberProvider = await ensurePolicy("Member aanbieder", { icon: "storefront", description: "Aanmeldingen op eigen datums, beperkte kolommen.", admin_access: false, app_access: false });
  const team = await ensurePolicy("Team", { icon: "groups", description: "Nakijken, privevelden, beheer.", admin_access: false, app_access: true });

  const memberRole = await ensureRole("Member", { icon: "person", description: "Elke ingelogde gebruiker." });
  const teamRole = await ensureRole("Team", { icon: "groups", description: "Medewerkers van Wicked Workshops." });

  await ensureAccess(memberRole, publicPolicy.id);
  await ensureAccess(memberRole, member);
  await ensureAccess(memberRole, memberProvider);
  await ensureAccess(teamRole, team);

  await setPermissions(publicPolicy.id, publicPermissions());
  await setPermissions(member, memberPermissions());
  await setPermissions(memberProvider, providerViewPermissions());
  await setPermissions(team, await teamPermissions());

  return { memberRole, teamRole };
}
