/* Wicked Workshops: regels die Directus-rechten niet kunnen uitdrukken.

   Rechten (policies) regelen wie wat mag lezen en wijzigen op basis van
   bestaande rijen. Wat ze niet kunnen:
   - bij aanmaken controleren dat een verwijzing (workshop, aanbieder,
     ruimte) van de gebruiker zelf is;
   - de oude waarde zien bij een statuswissel;
   - velden vergrendelen op basis van de stand van de rij.
   Dat gebeurt hier. Beheerders en interne aanroepen (zonder gebruiker) gaan
   er vrij doorheen; het team ook, behalve voor de vorm van een datum en
   de vergrendeling (docs/05: afdwingen in Directus). */
import { ForbiddenError, InvalidPayloadError } from "@directus/errors";
import { providerStatusError, sessionDefaults, sessionShapeError, sessionUpdateError, workshopStatusError } from "./rules.mjs";

/* Collections die aan een workshop hangen en dus van dezelfde eigenaar moeten zijn. */
const WORKSHOP_CHILDREN = ["workshop_private", "workshop_media", "workshop_faq", "workshop_inclusions", "workshop_sessions"];
const WORKSHOP_JUNCTIONS = ["workshops_occasions", "workshops_languages", "workshops_amenities", "workshops_categories", "workshops_dietary_options", "workshops_inclusion_types"];

const reject = (reason) => {
  throw new InvalidPayloadError({ reason });
};

export default ({ filter }, { database, logger }) => {
  let teamRoleId;
  async function isTeam(accountability) {
    if (teamRoleId === undefined) {
      const row = await database("directus_roles").where({ name: "Team" }).first("id");
      teamRoleId = row?.id ?? null;
    }
    const roles = accountability.roles ?? (accountability.role ? [accountability.role] : []);
    return Boolean(teamRoleId && roles.includes(teamRoleId));
  }

  /* "member": een ingelogde gebruiker die geen beheerder of teamlid is. */
  async function who(context) {
    const acc = context?.accountability;
    if (!acc || acc.admin) return { system: true, member: false };
    if (!acc.user) return { system: false, member: false, user: null };
    if (await isTeam(acc)) return { system: false, team: true, member: false, user: acc.user };
    return { system: false, member: true, user: acc.user };
  }

  const db = (context) => context?.database ?? database;

  async function ownsProvider(trx, providerId, user) {
    if (!providerId) return false;
    const row = await trx("providers").where({ id: providerId }).first("user");
    return row?.user === user;
  }

  async function ownsWorkshop(trx, workshopId, user) {
    if (!workshopId) return false;
    const row = await trx("workshops").join("providers", "providers.id", "workshops.provider").where("workshops.id", workshopId).first("providers.user as user");
    return row?.user === user;
  }

  async function ownsListing(trx, listingId, user) {
    if (!listingId) return false;
    const row = await trx("venue_listings").where({ id: listingId }).first("owner");
    return row?.owner === user;
  }

  const idOf = (v) => (v && typeof v === "object" ? v.id : v);

  /* ---------- aanmaken: verwijzing moet van jezelf zijn ---------- */

  filter("workshops.items.create", async (payload, meta, context) => {
    const w = await who(context);
    if (!w.member) return payload;
    if (!(await ownsProvider(db(context), idOf(payload.provider), w.user))) throw new ForbiddenError();
    if (payload.status && payload.status !== "draft") reject("Een nieuwe workshop begint als concept.");
    return payload;
  });

  /* Bij aanmaken moet de verwijzing van jezelf zijn; bij wijzigen ook, als
     de verwijzing in de wijziging zit (anders verhuis je een rij naar
     andermans workshop). */
  function guardRef(collection, field, owns) {
    filter(`${collection}.items.create`, async (payload, meta, context) => {
      const w = await who(context);
      if (w.member && !(await owns(db(context), idOf(payload[field]), w.user))) throw new ForbiddenError();
      return payload;
    });
    filter(`${collection}.items.update`, async (payload, meta, context) => {
      const w = await who(context);
      if (w.member && field in payload && !(await owns(db(context), idOf(payload[field]), w.user))) throw new ForbiddenError();
      return payload;
    });
  }

  for (const collection of WORKSHOP_CHILDREN) guardRef(collection, "workshop", ownsWorkshop);
  for (const collection of WORKSHOP_JUNCTIONS) guardRef(collection, "workshop_id", ownsWorkshop);
  guardRef("provider_declarations", "provider", ownsProvider);
  guardRef("venue_listing_images", "listing", ownsListing);

  filter("providers.items.create", async (payload, meta, context) => {
    const w = await who(context);
    if (!w.member) return payload;
    /* user = $CURRENT_USER staat ook als preset en validatie in de rechten. */
    if (idOf(payload.user) !== w.user) throw new ForbiddenError();
    if (payload.status && payload.status !== "draft") reject("Een nieuw profiel begint als concept.");
    return payload;
  });

  /* Volgen en bewaren: 1 keer per paar. */
  for (const [collection, a, b] of [["follows", "user", "provider"], ["favorites", "user", "workshop"]]) {
    filter(`${collection}.items.create`, async (payload, meta, context) => {
      /* De preset (user = $CURRENT_USER) komt pas na deze filter. */
      const user = idOf(payload[a]) ?? context?.accountability?.user;
      if (!user || !payload[b]) return payload;
      const found = await db(context)(collection).where({ [a]: user, [b]: idOf(payload[b]) }).first("id");
      if (found) reject("Staat er al.");
      return payload;
    });
  }

  /* ---------- statusovergangen ---------- */

  /* Afgeleide velden zet alleen deze hook. Directus controleert de rechten
     na de filter, dus ze staan in de schrijfrechten van Member; wat de
     client zelf meestuurt gooien we hier weg. */
  const strip = (payload, fields) => Object.fromEntries(Object.entries(payload).filter(([k]) => !fields.includes(k)));

  filter("workshops.items.update", async (input, meta, context) => {
    const w = await who(context);
    if (!w.member) return input;
    const payload = strip(input, ["submitted_at"]);
    if (!("status" in payload)) return payload;
    const rows = await db(context)("workshops").whereIn("id", meta.keys).select("id", "status");
    for (const row of rows) {
      const err = workshopStatusError(row.status, payload.status);
      if (err) reject(err);
    }
    if (payload.status === "pending_review") return { ...payload, submitted_at: new Date().toISOString() };
    return payload;
  });

  filter("providers.items.update", async (payload, meta, context) => {
    const w = await who(context);
    if (!w.member || !("status" in payload)) return payload;
    const rows = await db(context)("providers").whereIn("id", meta.keys).select("status");
    for (const row of rows) {
      const err = providerStatusError(row.status, payload.status);
      if (err) reject(err);
    }
    return payload;
  });

  /* ---------- datums ---------- */

  const SESSION_DERIVED = ["confirmed_at", "closed_at"];

  filter("workshop_sessions.items.create", async (input, meta, context) => {
    const w = await who(context);
    if (w.system) return input;
    const payload = w.member ? strip(input, [...SESSION_DERIVED, "state"]) : input;
    const workshop = await db(context)("workshops").where({ id: idOf(payload.workshop) }).first("duration_minutes");
    const next = { ...payload, ...sessionDefaults(payload, workshop?.duration_minutes) };
    const err = sessionShapeError(next);
    if (err) reject(err);
    return next;
  });

  filter("workshop_sessions.items.update", async (input, meta, context) => {
    const w = await who(context);
    if (w.system) return input;
    const payload = w.member ? strip(input, SESSION_DERIVED) : input;
    const rows = await db(context)("workshop_sessions").whereIn("id", meta.keys).select("*");
    for (const row of rows) {
      const err = sessionUpdateError(row, payload, { member: w.member });
      if (err) reject(err);
    }
    if (payload.state === "cancelled_by_provider") return { ...payload, closed_at: new Date().toISOString() };
    return payload;
  });

  /* "Datum verwijderen" kan alleen zonder aanmeldingen (docs/05 punt 6). */
  filter("workshop_sessions.items.delete", async (keys, meta, context) => {
    const w = await who(context);
    if (!w.member) return keys;
    const booked = await db(context)("bookings").whereIn("session", keys).first("id");
    if (booked) reject("Deze datum heeft aanmeldingen. Annuleer hem in plaats van verwijderen.");
    return keys;
  });

  logger.info("ww-guards geladen");
};
