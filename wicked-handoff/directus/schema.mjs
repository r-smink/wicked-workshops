// Datamodel Wicked Workshops voor Directus. Alleen ASCII.
// Helpers
const pk = { field: "id", type: "integer", meta: { hidden: true, readonly: true, interface: "input" }, schema: { is_primary_key: true, has_auto_increment: true } };
const str = (field, o = {}) => ({ field, type: o.text ? "text" : "string", meta: { interface: o.text ? "input-multiline" : "input", required: !!o.required, note: o.note || null, width: o.width || "full" }, schema: { is_nullable: !o.required, is_unique: !!o.unique, default_value: o.def ?? null } });
const num = (field, o = {}) => ({ field, type: o.float ? "float" : "integer", meta: { interface: "input", required: !!o.required, note: o.note || null, width: "half" }, schema: { is_nullable: !o.required, default_value: o.def ?? null } });
const bool = (field, def = false, note = null) => ({ field, type: "boolean", meta: { interface: "boolean", note, width: "half" }, schema: { default_value: def } });
const dt = (field, o = {}) => ({ field, type: "timestamp", meta: { interface: "datetime", required: !!o.required, note: o.note || null, width: "half" }, schema: { is_nullable: !o.required } });
const json = (field, note = null) => ({ field, type: "json", meta: { interface: "input-code", options: { language: "json" }, note }, schema: { is_nullable: true } });
const dropdown = (field, choices, o = {}) => ({ field, type: "string", meta: { interface: "select-dropdown", required: !!o.required, width: "half", note: o.note || null, options: { choices: choices.map((c) => (Array.isArray(c) ? { text: c[1], value: c[0] } : { text: c, value: c })) } }, schema: { is_nullable: !o.required, default_value: o.def ?? null } });
const m2o = (field, o = {}) => ({ field, type: "integer", meta: { interface: "select-dropdown-m2o", special: ["m2o"], required: !!o.required, width: "half", options: o.template ? { template: o.template } : undefined }, schema: { is_nullable: !o.required } });
const file = (field, note = null) => ({ field, type: "uuid", meta: { interface: "file-image", special: ["file"], note, width: "half" }, schema: { is_nullable: true } });
const o2m = (field, note = null) => ({ field, type: "alias", meta: { interface: "list-o2m", special: ["o2m"], note }, schema: undefined });
const m2m = (field, note = null) => ({ field, type: "alias", meta: { interface: "list-m2m", special: ["m2m"], note }, schema: undefined });
const status = (def = "draft") => dropdown("status", [["published", "Gepubliceerd"], ["draft", "Concept"]], { def });
const sort = () => ({ field: "sort", type: "integer", meta: { interface: "input", hidden: true }, schema: { is_nullable: true } });
const created = () => ({ field: "date_created", type: "timestamp", meta: { special: ["date-created"], interface: "datetime", readonly: true, hidden: true, width: "half" }, schema: {} });

export const STANDEN = [["open", "Open: minimum nog niet gehaald"], ["door", "Gaat door"], ["niet_door", "Gaat niet door"], ["vol", "Vol"]];

export const collections = [
  { collection: "categories", note: "Categorieen zoals kookworkshops, keramiek, bloemen", sort: true, fields: [pk, status("published"), sort(), str("name", { required: true }), str("slug", { required: true, unique: true }), str("intro", { text: true }), str("seo_text", { text: true, note: "SEO-tekst onderaan de categoriepagina (HTML of markdown)" }), file("image")] },
  { collection: "cities", note: "Plaatsen waar workshops zijn", fields: [pk, status("published"), str("name", { required: true }), str("slug", { required: true, unique: true }), str("region"), file("image")] },
  { collection: "providers", note: "Aanbieders (workshopgevers)", fields: [pk, status(), str("name", { required: true }), str("slug", { required: true, unique: true }), dropdown("type", [["particulier", "Particulier"], ["bedrijf", "Bedrijf"]], { def: "particulier", required: true }), file("photo"), str("tagline"), str("story", { text: true }), m2o("city", { template: "{{name}}" }), o2m("workshops")] },
  { collection: "spaces", note: "Ruimtes die vaak leeg staan", fields: [pk, status(), str("name", { required: true }), str("slug", { unique: true }), dropdown("kind", [["keuken", "Keuken"], ["atelier", "Atelier"], ["zaal", "Zaal"]], { required: true }), m2o("city", { template: "{{name}}" }), num("capacity"), json("free_slots", "Vrije dagdelen per weekdag, bijvoorbeeld {\"za\":[\"ochtend\"]}"), str("description", { text: true }), file("photo")] },
  { collection: "workshops", note: "Workshops", fields: [pk, status(), str("title", { required: true }), str("slug", { required: true, unique: true }), str("summary", { text: true }), str("what_you_do", { text: true }), str("included", { text: true }), str("practical", { text: true }), str("cancellation_rules", { text: true }), num("price_per_person", { float: true, required: true, note: "In euro's" }), num("duration_minutes"), num("min_participants", { note: "Leeg = geen minimum" }), num("max_participants", { required: true }), bool("business_possible", false, "Ook te boeken als teamuitje"), m2o("category", { required: true, template: "{{name}}" }), m2o("provider", { required: true, template: "{{name}}" }), m2o("city", { required: true, template: "{{name}}" }), m2o("space", { template: "{{name}}" }), file("hero_image"), m2m("gallery", "Extra foto's"), json("seo", "Optioneel: title en description overschrijven"), o2m("sessions"), o2m("reviews"), created()] },
  { collection: "sessions", note: "Datums van een workshop. Status wordt op het beslismoment bijgewerkt.", fields: [pk, m2o("workshop", { required: true, template: "{{title}}" }), dt("starts_at", { required: true }), dt("ends_at"), dt("decision_at", { note: "Beslismoment: dan moet het minimum gehaald zijn" }), dropdown("status", STANDEN, { def: "open", required: true }), num("booked", { def: 0, note: "Aantal aangemelde personen (bijgehouden door flow of API)" }), o2m("bookings")] },
  { collection: "bookings", note: "Aanmeldingen. Tijdens de pilot betaalt niemand vooraf.", fields: [pk, m2o("session", { required: true, template: "{{starts_at}}" }), str("name", { required: true }), str("email", { required: true }), num("people", { required: true, def: 1 }), dropdown("status", [["aangemeld", "Aangemeld"], ["bevestigd", "Bevestigd"], ["geannuleerd", "Geannuleerd"]], { def: "aangemeld" }), str("note", { text: true }), created()] },
  { collection: "reviews", note: "Reviews van deelnemers", fields: [pk, status(), m2o("workshop", { required: true, template: "{{title}}" }), str("author", { required: true }), num("score", { required: true, note: "1 tot en met 5" }), str("text", { text: true }), dt("reviewed_at")] },
  { collection: "help_topics", note: "Onderwerpen op de hulppagina", sort: true, fields: [pk, status("published"), sort(), dropdown("group", [["meedoen", "Als je meedoet"], ["workshop_geven", "Als je workshops geeft"]], { required: true }), str("title", { required: true }), str("slug", { required: true, unique: true }), str("body", { text: true }), o2m("faqs")] },
  { collection: "faqs", note: "Veelgestelde vragen, optioneel gekoppeld aan een hulponderwerp of categorie", sort: true, fields: [pk, status("published"), sort(), str("question", { required: true }), str("answer", { text: true, required: true }), m2o("topic", { template: "{{title}}" }), m2o("category", { template: "{{name}}" })] },
  { collection: "messages", note: "Berichten via het contactformulier", fields: [pk, dropdown("subject", [["boeking", "Een boeking"], ["workshop", "Een workshop"], ["geven", "Workshops geven"], ["ruimte", "Een ruimte"], ["zakelijk", "Zakelijk"], ["anders", "Anders"]], { required: true }), str("name", { required: true }), str("email", { required: true }), str("reference", { note: "Workshop of boeking, optioneel" }), str("message", { text: true, required: true }), bool("business", false), dropdown("handled", [["nieuw", "Nieuw"], ["opgepakt", "Opgepakt"], ["klaar", "Klaar"]], { def: "nieuw" }), created()] },
  { collection: "room_requests", note: "Aanvragen via Locatie gezocht: ruimte zoeken of bieden", fields: [pk, dropdown("direction", [["zoeken", "Ik zoek een ruimte"], ["bieden", "Ik heb een ruimte"]], { required: true }), str("name", { required: true }), str("email", { required: true }), str("city_text"), dropdown("kind", [["keuken", "Keuken"], ["atelier", "Atelier"], ["zaal", "Zaal"], ["anders", "Anders"]]), num("capacity"), str("needs", { text: true }), dropdown("handled", [["nieuw", "Nieuw"], ["opgepakt", "Opgepakt"], ["klaar", "Klaar"]], { def: "nieuw" }), created()] },
  { collection: "workshops_files", note: "Koppeltabel galerij", hidden: true, fields: [pk, { field: "workshops_id", type: "integer", meta: { hidden: true }, schema: {} }, { field: "directus_files_id", type: "uuid", meta: { hidden: true }, schema: {} }] },
];

// Relaties: collection.field -> related_collection (one_field = alias aan de andere kant)
export const relations = [
  { collection: "providers", field: "city", related: "cities", on_delete: "SET NULL" },
  { collection: "providers", field: "photo", related: "directus_files", on_delete: "SET NULL" },
  { collection: "spaces", field: "city", related: "cities", on_delete: "SET NULL" },
  { collection: "spaces", field: "photo", related: "directus_files", on_delete: "SET NULL" },
  { collection: "categories", field: "image", related: "directus_files", on_delete: "SET NULL" },
  { collection: "cities", field: "image", related: "directus_files", on_delete: "SET NULL" },
  { collection: "workshops", field: "category", related: "categories", on_delete: "SET NULL" },
  { collection: "workshops", field: "provider", related: "providers", one_field: "workshops", on_delete: "SET NULL" },
  { collection: "workshops", field: "city", related: "cities", on_delete: "SET NULL" },
  { collection: "workshops", field: "space", related: "spaces", on_delete: "SET NULL" },
  { collection: "workshops", field: "hero_image", related: "directus_files", on_delete: "SET NULL" },
  { collection: "sessions", field: "workshop", related: "workshops", one_field: "sessions", on_delete: "CASCADE" },
  { collection: "bookings", field: "session", related: "sessions", one_field: "bookings", on_delete: "CASCADE" },
  { collection: "reviews", field: "workshop", related: "workshops", one_field: "reviews", on_delete: "CASCADE" },
  { collection: "faqs", field: "topic", related: "help_topics", one_field: "faqs", on_delete: "SET NULL" },
  { collection: "faqs", field: "category", related: "categories", on_delete: "SET NULL" },
  { collection: "workshops_files", field: "directus_files_id", related: "directus_files", one_field: null, junction_field: "workshops_id", on_delete: "CASCADE" },
  { collection: "workshops_files", field: "workshops_id", related: "workshops", one_field: "gallery", junction_field: "directus_files_id", on_delete: "CASCADE" },
];
