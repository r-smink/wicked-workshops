/* Betaalmodus: uit, OPP-sandbox of live.

   - platform_settings.payment_mode vervangt pilot_no_payments als schakelaar.
     pilot_no_payments blijft bestaan zodat oudere code niet breekt.
   - providers.opp_merchant_env en bookings.payment_env leggen vast in welke
     OPP-omgeving een merchant of transactie bestaat. Sandbox en live zijn
     bij OPP gescheiden: een sandbox-merchant werkt niet live.

   Idempotent. Zet een bestaande rij alleen op "off" als het veld nieuw is. */
import { F, api, ensureField } from "../../scripts/api.mjs";

export const name = "Betaalmodus";

const ENVS = [["sandbox", "Sandbox (testgeld)"], ["live", "Live"]];

export async function up() {
  const created = await ensureField("platform_settings", F.choice("payment_mode", [
    ["off", "Uit: geen betaling, boeking direct bevestigd"],
    ["sandbox", "OPP sandbox: testbetalingen"],
    ["live", "Live: echte betalingen"],
  ], { def: "off", required: true, width: "full", note: "Pilot: sandbox. Live op zijn vroegst januari 2027 en alleen met OPP_LIVE_API_KEY." }));
  if (created) await api("PATCH", "/items/platform_settings", { payment_mode: "off" });

  await ensureField("providers", F.choice("opp_merchant_env", ENVS, { note: "OPP-omgeving van opp_merchant_uid." }));
  await ensureField("bookings", F.choice("payment_env", ENVS, { note: "OPP-omgeving van opp_transaction_uid." }));

  /* Statussen zoals OPP ze kent, plus "reserved" (betaald, in escrow). */
  await ensureField("providers", F.choice("opp_merchant_status", [
    ["none", "Niet aangemeld"],
    ["pending", "In behandeling"],
    ["live", "Actief"],
    ["suspended", "Geblokkeerd"],
    ["terminated", "Beeindigd"],
    ["blocked", "Geblokkeerd door OPP"],
  ], { def: "none", note: "OPP merchant status. Moet 'live' zijn om betalingen te ontvangen." }));
}
