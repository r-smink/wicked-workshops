/* Bouwt het live schema (stand 26 okt 2026) om naar het datamodel van
   docs/03. Idempotent: opnieuw draaien verandert niets.

   Uitgangspunt: wat live al bestaat voor hetzelfde begrip blijft bestaan,
   zodat de publieke site blijft werken. De vertaling tussen de namen in
   docs/03 en de live namen staat in web/lib/directus/model.ts en in
   directus/schema/README.md. Alleen wat ontbreekt komt erbij.

   Dit script verandert alleen schema, geen data. Datamigratie voor
   productie (waarden omzetten, adressen verhuizen) staat in
   002-productie-data.mjs en draait alleen na akkoord. */
import { F, api, ensureCollection, ensureField, ensureRelation, intPk, m2oRelation, stringPk } from "../../scripts/api.mjs";

export const name = "Datamodel docs/03";

export async function up() {
  await repairs();
  await users();
  await referenceData();
  await providers();
  await workshops();
  await sessions();
  await bookings();
  await reviews();
  await follows();
  await venues();
}

/* ---------- herstel van het live schema ---------- */

async function repairs() {
  /* venues.city staat live twee keer in directus_fields (als m2m-alias) naast
     een uuid-kolom zonder relatie. Daardoor faalt `schema apply` op een lege
     database. De tabel is leeg (0 rijen, 26 okt 2026) en de site leest
     city.name, dus: opnieuw aanmaken als echte verwijzing naar cities. */
  const relation = await api("GET", "/relations/venues/city").catch(() => null);
  if (!relation) {
    await api("DELETE", "/fields/venues/city").catch(() => null);
    await ensureField("venues", F.m2o("city", { template: "{{name}}" }));
    await ensureRelation(m2oRelation("venues", "city", "cities"));
  }
}

/* ---------- directus_users ---------- */

async function users() {
  await ensureField("directus_users", F.ts("email_verified_at", { note: "Gezet na klik op de bevestigingslink. Leeg = niet bevestigd.", readonly: true }));
  await ensureField("directus_users", F.choice("last_context", [["participant", "Deelnemer"], ["provider", "Workshopgever"], ["venue", "Ruimte-eigenaar"]], { note: "Bepaalt waar iemand na inloggen landt." }));
  await ensureField("directus_users", F.bool("notify_reminder_decision", true, { label: "Herinnering voor het beslismoment" }));
  await ensureField("directus_users", F.bool("notify_new_session_followed", true, { label: "Nieuwe datum van wie ik volg" }));
  await ensureField("directus_users", F.bool("notify_saved_almost_full", true, { label: "Bewaarde workshop bijna vol" }));
  await ensureField("directus_users", F.bool("notify_tips", false, { label: "Tips en nieuwe workshops" }));
}

/* ---------- referentiedata ---------- */

async function referenceData() {
  /* places = de live collection cities. Alle CBS-woonplaatsen staan erin;
     status "published" betekent: heeft een eigen plaatspagina. */
  await ensureField("cities", F.string("cbs_code", { width: "half", max: 16, unique: true, note: "CBS-woonplaatscode (WPxxxx)." }));
  await ensureField("cities", F.string("municipality", { width: "half", max: 80, note: "Gemeente, voor dubbele plaatsnamen." }));

  await ensureField("categories", F.int("commission_percent", { note: "Intern, 9 tot 20. Nu ongebruikt; niet tonen aan deelnemers.", min: 9, max: 20 }));

  await ensureCollection(
    "cancellation_policies",
    { icon: "event_busy", note: "Annuleerregelingen (docs/05). Soepel en Vast zijn werktekst.", display_template: "{{name}}", sort_field: "sort", group: null },
    { pk: stringPk("key", "basis, soepel of vast"), standard: false },
  );
  await ensureField("cancellation_policies", F.string("name", { required: true, width: "half" }));
  await ensureField("cancellation_policies", F.text("description", { note: "Tekst zoals in het paneel Annuleren. Werktekst voor Soepel en Vast." }));
  await ensureField("cancellation_policies", F.int("free_until_hours_before", { required: true, note: "Gratis annuleren tot zoveel uur voor de start." }));
  await ensureField("cancellation_policies", F.int("penalty_percent_after", { note: "Leeg = geen kosten daarna.", min: 0, max: 100 }));
  await ensureField("cancellation_policies", F.bool("reschedule_free", true, { label: "Verzetten is kosteloos" }));
  await ensureField("cancellation_policies", F.sort());

  await ensureCollection(
    "platform_settings",
    { icon: "tune", note: "Instellingen en feature flags uit docs/12.", singleton: true },
    { pk: intPk(), standard: false, singleton: true },
  );
  const ps = "platform_settings";
  await ensureField(ps, F.int("min_hours_decision_before_start", { def: 48, note: "Drempel tussen beslismoment en start." }));
  await ensureField(ps, F.bool("enforce_min_decision_lead", false, { label: "Drempel afdwingen", note: "Uit = alleen een waarschuwing (docs/12)." }));
  await ensureField(ps, F.json("reminder_hours_before_decision", { def: "[48,10]", note: "Herinneringen, in uren voor het beslismoment." }));
  await ensureField(ps, F.time("decision_default_time", { note: "Optioneel standaardtijdstip voor het beslismoment." }));
  await ensureField(ps, F.bool("pilot_no_payments", true, { label: "Pilot: niets afrekenen" }));
  await ensureField(ps, F.bool("require_iban_in_pilot", false, { label: "IBAN verplicht in de pilot" }));
  await ensureField(ps, F.int("offer_min_hours_ahead", { def: 48, note: "Aangeboden datum ligt minstens zoveel uur vooruit." }));
  await ensureField(ps, F.int("offer_expires_days_before", { def: 7, note: "Aanbod vervalt zoveel dagen voor de aangeboden datum." }));
  await ensureField(ps, F.bool("feature_auth_social", false, { label: "Inloggen met Google of Apple (auth.social)" }));
  await ensureField(ps, F.bool("feature_venues", false, { label: "Locatie gezocht (venues.enabled)" }));
}

/* ---------- workshopgevers ---------- */

async function providers() {
  /* Live bestaan al: user (O2O, unique), display_name, bio_short, bio_long,
     avatar, neighbourhood, city, status. Wat docs/03 extra vraagt: */
  await ensureField("providers", F.string("first_name", { note: "Voornaam zoals deelnemers die zien (\"Luca\").", width: "half" }));
  await ensureField("providers", F.string("area_label", { note: "Bijvoorbeeld \"Wittevrouwen, Utrecht\".", width: "half" }));
  await ensureField("providers", F.choice("kind", [["private", "Particulier"], ["business", "Ondernemer"]], { note: "Uit de verklaring; bepaalt het label bij de workshop." }));
  await ensureField("providers", F.choice("has_location", [["own", "Eigen plek"], ["need", "Zoekt een plek"], ["unknown", "Weet nog niet"]], { note: "Antwoord op \"Heb je zelf een plek?\". Bewaard, nergens gebruikt (docs/12)." }));
  await ensureField("providers", F.ts("onboarded_at", { readonly: true }));

  await ensureCollection("provider_declarations", {
    icon: "verified_user",
    note: "PRIVE. Aanbiedersverklaring. Alleen het team en de workshopgever zelf.",
    display_template: "{{first_name}} {{last_name}}",
  });
  const pd = "provider_declarations";
  await ensureField(pd, F.m2o("provider", { required: true, unique: true, template: "{{display_name}}" }));
  await ensureRelation(m2oRelation(pd, "provider", "providers", { onDelete: "CASCADE" }));
  await ensureField(pd, F.string("first_name", { width: "half" }));
  await ensureField(pd, F.string("last_name", { width: "half" }));
  await ensureField(pd, F.date("birth_date"));
  await ensureField(pd, F.text("home_address"));
  await ensureField(pd, F.string("email", { width: "half" }));
  await ensureField(pd, F.string("phone", { width: "half" }));
  await ensureField(pd, F.choice("kind", [["private", "Particulier"], ["business", "Ondernemer"]], { required: true }));
  await ensureField(pd, F.string("kvk_number", { width: "half", max: 16, note: "Verplicht bij ondernemer." }));
  await ensureField(pd, F.string("trade_name", { width: "half", note: "Verplicht bij ondernemer." }));
  await ensureField(pd, F.string("iban", { width: "half", max: 64, note: "Optioneel in de pilot (platform_settings.require_iban_in_pilot)." }));
  for (const [field, label] of [
    ["declared_adult", "18 jaar of ouder"],
    ["declared_info_correct", "Gegevens kloppen"],
    ["declared_risks", "Kent de risico's"],
    ["declared_qualifications", "Heeft de nodige kennis"],
    ["declared_safe", "Zorgt voor een veilige plek"],
    ["declared_reachable", "Is bereikbaar"],
    ["declared_incidents", "Meldt incidenten"],
  ]) {
    await ensureField(pd, F.bool(field, false, { label }));
  }
  await ensureField(pd, F.string("accepted_terms_version", { width: "half", max: 32 }));
  await ensureField(pd, F.ts("signed_at"));
  await ensureField(pd, F.string("ip", { width: "half", max: 64 }));
}

/* ---------- workshops ---------- */

async function workshops() {
  /* Live status: draft, pending_review, published, paused, archived.
     docs/03: draft, in_review, live, hidden. Vertaling in model.ts. */
  /* Een concept wordt in stappen ingevuld en tussendoor bewaard (docs/09,
     autosave). Prijs, categorie, plaats en duur zijn pas bij het insturen
     verplicht; dat controleert de checklist, niet het schema. De eindtijd
     van een datum vult de hook ww-guards zelf uit de duur. */
  for (const field of ["price_per_person", "category", "city", "duration_minutes"]) {
    await api("PATCH", `/fields/workshops/${field}`, { meta: { required: false }, schema: { is_nullable: true } });
  }
  await api("PATCH", "/fields/workshop_sessions/ends_at", { meta: { required: false }, schema: { is_nullable: true } });

  await ensureField("workshops", F.string("accessibility", { note: "Kort: toegankelijkheid van de plek." }));
  await ensureField("workshops", F.ts("submitted_at", { readonly: true, note: "Ingestuurd voor de check." }));
  await ensureField("workshops", F.text("review_note", { note: "Intern, van het team. Gaat per mail naar de workshopgever bij terugzetten." }));
  await ensureField("workshops", F.ts("next_session_at", { readonly: true, note: "Afgeleid, voor snelle lijsten." }));

  /* Locatiesoort: live format krijgt de keuze "zoekt een plek" erbij. */
  await ensureField("workshops", {
    ...F.choice("format", [
      ["on_location", "Op eigen locatie"],
      ["at_home", "Bij de deelnemer thuis"],
      ["at_office", "Bij het bedrijf"],
      ["online", "Online"],
      ["seeking", "Zoekt nog een plek"],
    ], { def: "on_location", note: "docs/03 location_kind. Bij \"zoekt een plek\" blijft de workshop concept." }),
  });

  /* Annuleerregeling wordt een verwijzing naar cancellation_policies. Eerst
     moeten de sleutels bestaan en de oude waarden omgezet zijn, anders
     weigert PostgreSQL de foreign key. */
  await ensureCancellationKeys();
  await ensureField("workshops", {
    ...F.m2o("cancellation_policy", { type: "string", template: "{{name}}" }),
    schema: { default_value: "basis", max_length: 64 },
    patchSchema: true,
  });
  await ensureRelation(m2oRelation("workshops", "cancellation_policy", "cancellation_policies", { onDelete: "SET NULL" }));

  /* Prive: adres alleen voor eigenaar, team en (via de server) geboekte deelnemers. */
  await ensureCollection("workshop_private", {
    icon: "lock",
    note: "PRIVE. Adres van de workshop. Publiek staat alleen de plaats.",
    display_template: "{{workshop.title}}",
  });
  await ensureField("workshop_private", F.m2o("workshop", { required: true, unique: true, template: "{{title}}" }));
  await ensureRelation(m2oRelation("workshop_private", "workshop", "workshops", { onDelete: "CASCADE" }));
  await ensureField("workshop_private", F.string("address", { note: "Straat en huisnummer." }));
  await ensureField("workshop_private", F.string("postal_code", { width: "half", max: 16 }));
}

/* Oude waarden van de publieke site -> sleutels uit docs/05.
   strict_none ("geen kosteloze annulering") heeft geen tegenhanger in
   docs/05; beslissen voordat dit op productie draait. */
export const LEGACY_CANCELLATION = {
  flexible_48h: "basis",
  moderate_7d: "vast",
  strict_none: null,
};

async function ensureCancellationKeys() {
  const existing = new Set((await api("GET", "/items/cancellation_policies?fields=key&limit=-1")).map((r) => r.key));
  const minimal = [["basis", "De basis", 48], ["soepel", "Soepel", 24], ["vast", "Vast", 168]];
  for (const [key, name, hours] of minimal) {
    if (!existing.has(key)) await api("POST", "/items/cancellation_policies", { key, name, free_until_hours_before: hours });
  }
  if (await relationExists("workshops", "cancellation_policy")) return;
  const rows = await api("GET", "/items/workshops?fields=id,cancellation_policy&limit=-1&filter[cancellation_policy][_nnull]=true");
  const unknown = rows.filter((r) => !["basis", "soepel", "vast"].includes(r.cancellation_policy) && !LEGACY_CANCELLATION[r.cancellation_policy]);
  if (unknown.length) {
    const values = [...new Set(unknown.map((r) => r.cancellation_policy))].join(", ");
    throw new Error(`Annuleerregeling zonder vertaling bij ${unknown.length} workshop(s): ${values}. Vul LEGACY_CANCELLATION aan.`);
  }
  for (const [from, to] of Object.entries(LEGACY_CANCELLATION)) {
    const keys = rows.filter((r) => r.cancellation_policy === from).map((r) => r.id);
    if (keys.length && to) await api("PATCH", "/items/workshops", { keys, data: { cancellation_policy: to } });
  }
}

async function relationExists(collection, field) {
  return api("GET", `/relations/${collection}/${field}`).then(() => true, () => false);
}

/* ---------- datums ---------- */

async function sessions() {
  const s = "workshop_sessions";
  await ensureField(s, F.choice("state", [
    ["open", "Verzamelt"],
    ["confirmed", "Gaat door"],
    ["not_happening", "Gaat niet door"],
    ["cancelled_by_provider", "Geannuleerd door aanbieder"],
  ], { def: "open", required: true, note: "docs/05. Gaat een datum door, dan blijft dat zo." }));
  await ensureField(s, F.ts("confirmed_at", { readonly: true }));
  await ensureField(s, F.ts("closed_at", { readonly: true }));
}

/* ---------- aanmeldingen ---------- */

async function bookings() {
  const b = "bookings";
  /* Live status krijgt de twee standen uit docs/03 erbij. */
  await ensureField(b, F.choice("status", [
    ["pending", "In behandeling"],
    ["awaiting_payment", "Wacht op betaling"],
    ["confirmed", "Bevestigd"],
    ["completed", "Afgerond"],
    ["cancelled_by_customer", "Geannuleerd door deelnemer"],
    ["cancelled_by_provider", "Geannuleerd door aanbieder"],
    ["moved", "Verzet"],
    ["session_cancelled", "Datum gaat niet door"],
    ["expired", "Verlopen"],
    ["refunded", "Terugbetaald"],
    ["no_show", "Niet gekomen"],
  ]));
  await ensureField(b, { ...F.string("access_token", { hidden: true, unique: true, max: 64, note: "32 bytes base64url, voor de link zonder account." }), meta: { interface: "input", hidden: true, readonly: true } });
  await ensureField(b, F.m2o("moved_from", { template: "{{booking_code}}", note: "Bij verzetten: de oude aanmelding." }));
  await ensureRelation(m2oRelation(b, "moved_from", "bookings"));
  /* De workshopgever ziet "Femke D." (docs/10) en nooit guest_name of het
     e-mailadres. Daarom voornaam en initiaal als eigen velden. */
  await ensureField(b, F.string("first_name", { width: "half", max: 80 }));
  await ensureField(b, F.string("last_initial", { width: "half", max: 2, note: "Eerste letter van de achternaam, mag leeg." }));
  await ensureField(b, F.int("cancel_fee_percent", { note: "Bevroren op het annuleermoment. Pilot: informatief.", min: 0, max: 100 }));
  await ensureField(b, { ...F.string("guest_email", { indexed: true }), patchSchema: true });

  await ensureCollection("session_offers", {
    icon: "event_repeat",
    note: "Andere datum aangeboden als een datum niet doorgaat (docs/05 punt 7).",
    display_template: "{{booking.booking_code}} -> {{offered_session.starts_at}}",
  });
  const so = "session_offers";
  await ensureField(so, F.m2o("booking", { required: true, template: "{{booking_code}}" }));
  await ensureRelation(m2oRelation(so, "booking", "bookings", { onDelete: "CASCADE" }));
  await ensureField(so, F.m2o("offered_session", { template: "{{starts_at}}" }));
  await ensureRelation(m2oRelation(so, "offered_session", "workshop_sessions"));
  await ensureField(so, F.choice("status", [["pending", "Open"], ["accepted", "Ja"], ["declined", "Nee"], ["expired", "Verlopen"]], { def: "pending", required: true }));
  await ensureField(so, F.ts("expires_at"));
  await ensureField(so, F.ts("responded_at"));
}

/* ---------- reviews ---------- */

async function reviews() {
  await ensureField("reviews", F.m2o("user", { template: "{{first_name}}" }));
  await ensureRelation(m2oRelation("reviews", "user", "directus_users"));
  /* docs/12: de aanbieder kan niet reageren. Veld blijft voor oude data. */
  await ensureField("reviews", { ...F.text("provider_reply"), meta: { interface: "input-multiline", hidden: true, readonly: true, note: "Niet in gebruik: de aanbieder reageert niet (docs/12)." } });
}

/* ---------- volgen ---------- */

async function follows() {
  await ensureCollection("follows", { icon: "person_add", note: "Deelnemer volgt een workshopgever. Uniek per paar.", display_template: "{{user.first_name}} -> {{provider.display_name}}" });
  await ensureField("follows", F.m2o("user", { required: true, template: "{{first_name}}" }));
  await ensureRelation(m2oRelation("follows", "user", "directus_users", { onDelete: "CASCADE" }));
  await ensureField("follows", F.m2o("provider", { required: true, template: "{{display_name}}" }));
  await ensureRelation(m2oRelation("follows", "provider", "providers", { onDelete: "CASCADE" }));
}

/* ---------- Locatie gezocht (achter feature_venues) ---------- */

async function venues() {
  const v = "venue_listings";
  await ensureCollection(v, { icon: "storefront", note: "Ruimte van een eigenaar (Locatie gezocht). Geen adres, geen prijs.", display_template: "{{name}}" });
  await ensureField(v, F.m2o("owner", { required: true, template: "{{first_name}} {{email}}" }));
  await ensureRelation(m2oRelation(v, "owner", "directus_users", { onDelete: "CASCADE" }));
  await ensureField(v, F.bool("visible", true, { label: "Te vinden", note: "Uit = verborgen maar bewaard." }));
  await ensureField(v, F.choice("status", [["draft", "Concept"], ["published", "Gepubliceerd"]], { def: "draft", required: true }));
  await ensureField(v, F.string("name", { required: true, note: "Zeg wat het is, niet hoe het heet." }));
  await ensureField(v, F.m2o("place", { template: "{{name}}" }));
  await ensureRelation(m2oRelation(v, "place", "cities"));
  await ensureField(v, F.string("neighbourhood", { width: "half" }));
  await ensureField(v, F.choice("kind", [["kitchen", "Keuken"], ["atelier", "Atelier"], ["hall", "Zaal"], ["outdoor", "Buiten"]]));
  await ensureField(v, F.int("capacity", { min: 1 }));
  await ensureField(v, F.tags("amenities", { note: "Groot eiland, Twee ovens, Water, Vaatwasser, Lange tafel, Rolstoeltoegankelijk, ..." }));
  await ensureField(v, F.text("description"));
  await ensureField(v, F.json("availability", { note: "Meestal vrij: {\"mon\":[\"afternoon\",\"evening\"], ...}. Dagdelen: morning, afternoon, evening." }));

  const vi = "venue_listing_images";
  await ensureCollection(vi, { icon: "image", hidden: true, sort_field: "sort", note: "Maximaal 6, de eerste is de omslag." }, { standard: false });
  await ensureField(vi, F.m2o("listing", { required: true }));
  await ensureField(vi, F.file("file"));
  await ensureRelation(m2oRelation(vi, "file", "directus_files", { onDelete: "CASCADE" }));
  await ensureField(vi, F.string("alt"));
  await ensureField(vi, F.sort());
  await ensureField(v, F.o2m("images", { template: "{{file}}" }));
  await ensureRelation({ ...m2oRelation(vi, "listing", v, { onDelete: "CASCADE", oneField: "images" }), meta: { one_field: "images", sort_field: "sort", one_deselect_action: "delete" } });

  const vc = "venue_contact_requests";
  await ensureCollection(vc, { icon: "mail", note: "\"Neem contact op met de eigenaar\". Loopt via Wicked Workshops (docs/11).", display_template: "{{listing.name}}" });
  await ensureField(vc, F.m2o("listing", { required: true, template: "{{name}}" }));
  await ensureRelation(m2oRelation(vc, "listing", v, { onDelete: "CASCADE" }));
  await ensureField(vc, F.m2o("from_user", { required: true, template: "{{first_name}} {{email}}" }));
  await ensureRelation(m2oRelation(vc, "from_user", "directus_users", { onDelete: "CASCADE" }));
  await ensureField(vc, F.text("message"));
  await ensureField(vc, F.bool("share_email", false, { label: "Eigenaar mag direct antwoorden (reply-to)" }));
  await ensureField(vc, F.choice("status", [["new", "Nieuw"], ["forwarded", "Doorgestuurd"], ["closed", "Afgehandeld"]], { def: "new", required: true }));
}
