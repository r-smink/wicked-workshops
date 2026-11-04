/* OPP (Online Payment Platform) betaalintegratie.

   Voegt velden toe voor:
   - OPP merchant-koppeling op providers
   - OPP transactie- en refund-tracking op bookings
   - Provider override ("gaat toch door") op workshop_sessions
   - Betaalinstellingen op platform_settings
   - Feature flag voor betaalprovider (mollie of opp)

   Idempotent: opnieuw draaien verandert niets. */
import { F, ensureField } from "../../scripts/api.mjs";

export const name = "OPP betaalmodel";

export async function up() {
  await providerOpp();
  await bookingOpp();
  await sessionOverride();
  await paymentSettings();
}

/* ---------- providers: OPP merchant-koppeling ---------- */

async function providerOpp() {
  const c = "providers";
  await ensureField(c, F.string("opp_merchant_uid", { note: "OPP merchant identifier. Gezet na onboarding.", max: 64, width: "half" }));
  await ensureField(c, F.choice("opp_merchant_status", [
    ["none", "Niet aangemeld"],
    ["pending", "In behandeling"],
    ["live", "Actief"],
    ["suspended", "Geblokkeerd"],
  ], { def: "none", note: "OPP merchant status. Moet 'live' zijn voor uitbetaling." }));
  await ensureField(c, F.choice("opp_compliance_status", [
    ["unverified", "Niet geverifieerd"],
    ["pending", "In behandeling"],
    ["verified", "Geverifieerd"],
  ], { def: "unverified", note: "OPP KYC/compliance status." }));
  await ensureField(c, F.ts("opp_onboarded_at", { note: "Wanneer de merchant live ging bij OPP." }));
}

/* ---------- bookings: OPP transactie- en refund-tracking ---------- */

async function bookingOpp() {
  const b = "bookings";
  /* payment_id bestaat al (Mollie). We voegen een apart OPP-veld toe zodat
     beide providers naast elkaar kunnen bestaan achter een feature flag. */
  await ensureField(b, F.string("opp_transaction_uid", { note: "OPP transactie-ID. Leeg bij Mollie-boekingen.", max: 64, width: "half" }));
  await ensureField(b, F.string("opp_refund_uid", { note: "OPP refund-ID, als er een refund is aangemaakt.", max: 64, width: "half" }));
  await ensureField(b, F.choice("refund_status", [
    ["none", "Geen"],
    ["pending", "In behandeling"],
    ["completed", "Afgerond"],
    ["failed", "Mislukt"],
  ], { def: "none", note: "Status van een eventuele terugbetaling." }));
  await ensureField(b, F.ts("refunded_at", { note: "Tijdstip van de voltooide refund." }));
}

/* ---------- workshop_sessions: provider override ---------- */

async function sessionOverride() {
  const s = "workshop_sessions";
  await ensureField(s, F.bool("provider_override", false, {
    label: "Gaat toch door",
    note: "Workshopgever zegt na het beslismoment: gaat toch door, ondanks dat het minimum niet is gehaald.",
  }));
  await ensureField(s, F.ts("provider_override_at", { note: "Wanneer de workshopgever de override inzette." }));
}

/* ---------- platform_settings: betaalinstellingen ---------- */

async function paymentSettings() {
  const ps = "platform_settings";
  await ensureField(ps, F.choice("payment_provider", [
    ["opp", "Online Payment Platform"],
    ["mollie", "Mollie"],
  ], { def: "opp", note: "Actieve betaalprovider. Feature flag voor de overgang." }));
  await ensureField(ps, F.int("payment_hold_minutes", { def: 30, note: "Hoe lang een checkout-URL geldig is voordat de boeking vervalt." }));
  await ensureField(ps, F.int("settlement_delay_hours", { def: 168, note: "Wachttijd na sessie-einde voordat uitbetaling aan de workshopgever wordt getriggerd (168 = 7 dagen)." }));
  await ensureField(ps, F.int("decision_grace_hours", { def: 12, note: "Uren na het beslismoment waarin de workshopgever nog kan zeggen \"gaat toch door\", voordat automatische refunds starten." }));
}
