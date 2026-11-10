/* Pilotoperatie: klachten, mail-log, auth-tokens, escrowdatum per boeking,
   verborgen groepsdatums, blokkeren van workshopgevers en de instellingen
   die daarbij horen. Zie "Wicked Workshops - code fixes.md", hoofdstuk 7.

   - complaints: klacht van een deelnemer over een boeking. Het team beslist
     in Directus; terugbetalen gaat via een Flow naar /api/team/actions, met
     vier ogen (approved_by is niet executed_by).
   - mail_log: elke verstuurde mail met (kind, ref_key). Maakt versturen
     idempotent voor cron en webhooks.
   - auth_tokens: eenmalige links voor e-mailbevestiging en wachtwoordherstel
     (docs/04, docs/12). Alleen de sha256-hash wordt bewaard.
   - bookings.escrow_until: de escrowdatum zoals die bij OPP staat. Schuift
     mee bij verzetten, een aanbod of een klacht.
   - bookings.access_token: de nonce van de beheerlink uit de mails. Het
     token is een HMAC met BOOKING_LINK_SECRET (web/lib/bookings/access.ts).

   Idempotent. */
import { F, api, ensureCollection, ensureField, ensureRelation, m2oRelation } from "../../scripts/api.mjs";

export const name = "Pilotoperatie";

export async function up() {
  await complaints();
  await mailLog();
  await authTokens();
  await bookings();
  await sessions();
  await providers();
  await settings();
}

async function complaints() {
  await ensureCollection("complaints", {
    icon: "report",
    note: "PRIVE. Klachten van deelnemers. Alleen het team. Terugbetalen via de knop Terugbetalen (vier ogen).",
    display_template: "{{booking.booking_code}} - {{status}}",
    sort_field: null,
  });
  const c = "complaints";
  await ensureField(c, F.m2o("booking", { required: true, template: "{{booking_code}}" }));
  await ensureRelation(m2oRelation(c, "booking", "bookings", { onDelete: "CASCADE" }));
  await ensureField(c, F.choice("status", [
    ["new", "Nieuw"],
    ["in_review", "In behandeling"],
    ["refund_approved", "Terugbetaling goedgekeurd"],
    ["refunded", "Terugbetaald"],
    ["rejected", "Afgewezen"],
    ["resolved", "Opgelost zonder terugbetaling"],
  ], { def: "new", required: true }));
  await ensureField(c, F.choice("kind", [
    ["no_show_provider", "Workshopgever kwam niet"],
    ["quality", "Inhoud of kwaliteit"],
    ["safety", "Veiligheid of gedrag"],
    ["no_show_dispute", "Ik was er wel (no-show betwist)"],
    ["other", "Anders"],
  ], { def: "other" }));
  await ensureField(c, F.text("description", { required: true, note: "Tekst van de deelnemer." }));
  await ensureField(c, F.ts("submitted_at", { readonly: true }));
  await ensureField(c, F.string("refund_amount", { width: "half", max: 16, note: "In euro's, bijvoorbeeld 45.00. Leeg = volledig bedrag." }));
  await ensureField(c, F.text("decision_note", { note: "Intern. Waarom dit besluit." }));
  const users = [
    ["approved_by", "Teamlid dat de terugbetaling goedkeurt. Moet een ander zijn dan wie uitvoert."],
    ["executed_by", "Gezet door de knop Terugbetalen."],
  ];
  for (const [field, note] of users) {
    await ensureField(c, F.m2o(field, { note, template: "{{first_name}} {{last_name}}" }));
    await ensureRelation(m2oRelation(c, field, "directus_users"));
  }
  await ensureField(c, F.ts("approved_at", { readonly: true }));
  await ensureField(c, F.ts("executed_at", { readonly: true }));
  await ensureField(c, F.ts("escrow_extended_until", { readonly: true, note: "Tot wanneer OPP het geld vasthoudt door deze klacht." }));
  await ensureField(c, F.ts("resolved_at", { readonly: true }));
}

async function mailLog() {
  await ensureCollection("mail_log", {
    icon: "mail",
    note: "PRIVE. Verstuurde mails. (kind, ref_key) is uniek: dezelfde mail gaat nooit twee keer.",
    display_template: "{{kind}} {{recipient}}",
  }, { standard: false });
  const m = "mail_log";
  await ensureField(m, F.string("kind", { required: true, max: 64, width: "half", indexed: true }));
  await ensureField(m, F.string("ref_key", { required: true, max: 191, width: "half", indexed: true }));
  await ensureField(m, F.string("dedupe_key", { required: true, max: 255, unique: true, note: "kind:ref_key" }));
  await ensureField(m, F.string("recipient", { width: "half" }));
  await ensureField(m, F.ts("sent_at", { readonly: true }));
  await ensureField(m, F.text("error"));
}

async function authTokens() {
  await ensureCollection("auth_tokens", {
    icon: "key",
    note: "PRIVE. Eenmalige links voor bevestigen en wachtwoord kiezen (docs/04). Alleen de hash.",
    display_template: "{{purpose}} {{email}}",
  }, { standard: false });
  const t = "auth_tokens";
  await ensureField(t, F.m2o("user", { template: "{{email}}" }));
  await ensureRelation(m2oRelation(t, "user", "directus_users", { onDelete: "CASCADE" }));
  await ensureField(t, F.string("email", { width: "half" }));
  await ensureField(t, F.choice("purpose", [["verify", "E-mail bevestigen"], ["reset", "Wachtwoord kiezen"]], { required: true }));
  await ensureField(t, F.string("token_hash", { required: true, max: 64, unique: true }));
  await ensureField(t, F.choice("intent", [["participant", "Deelnemer"], ["provider", "Workshopgever"], ["venue", "Ruimte-eigenaar"]]));
  await ensureField(t, F.string("next_path", { max: 255, note: "Waar iemand na bevestigen landt." }));
  await ensureField(t, F.ts("expires_at", { readonly: true }));
  await ensureField(t, F.ts("used_at", { readonly: true }));
  await ensureField(t, F.ts("created_at", { readonly: true }));
}

async function bookings() {
  const b = "bookings";
  await ensureField(b, F.ts("escrow_until", { readonly: true, note: "Escrowdatum bij OPP. Daarna komt het geld vrij voor de workshopgever." }));
  await ensureField(b, F.ts("no_show_marked_at", { readonly: true }));
  await ensureField(b, F.ts("review_written_at", { readonly: true }));
  await api("PATCH", "/fields/bookings/access_token", { meta: { hidden: true, readonly: true, note: "Nonce van de beheerlink. Het token zelf is een HMAC met BOOKING_LINK_SECRET en staat alleen in mails." } });
}

async function sessions() {
  await ensureField("workshop_sessions", F.string("private_key", {
    max: 64, width: "half",
    note: "Alleen bij een verborgen datum (is_private) voor een groep. Zit in de boekingslink die het team stuurt.",
  }));
}

async function providers() {
  await ensureField("providers", F.text("blocked_reason", { note: "Intern. Gezet door het team bij blokkeren. Zolang dit gevuld is, kan de workshopgever zelf niet weer publiceren." }));
  await ensureField("providers", F.ts("blocked_at", { readonly: true }));
}

async function settings() {
  const ps = "platform_settings";
  await ensureField(ps, F.bool("pilot_full_refund_on_cancel", true, {
    label: "Pilot: bij annuleren altijd 100% terug",
    note: "Aan: de deelnemer krijgt ook na de gratis termijn alles terug. Het percentage uit de regeling wordt wel bewaard (cancel_fee_percent).",
  }));
  await ensureField(ps, F.int("complaint_hold_days", { def: 14, note: "Zoveel dagen houdt OPP het geld extra vast na een klacht." }));
  await ensureField(ps, F.int("start_reminder_hours", { def: 24, note: "Herinnering met adres, zoveel uur voor de start. 0 = uit." }));
  await ensureField(ps, F.int("review_invite_hours_after", { def: 24, note: "Uitnodiging voor een review, zoveel uur na afloop." }));
  await ensureField(ps, F.string("team_email", { note: "Hier komen klachten en meldingen voor het team binnen." }));
}
