/* ===========================================================================
   Escrow-regels: wanneer refunden, wanneer uitbetalen.

   Puur en zonder afhankelijkheden. Wordt gebruikt door de cron-route
   /api/cron/escrow en door tests.
   =========================================================================== */

/* Moet deze sessie gerefund worden?
   Ja als: beslismoment + grace period voorbij, minimum niet gehaald,
   geen provider override, en sessie is open of not_happening.

   session: { state, min_participants, seats_taken, decision_at,
              goes_ahead, provider_override }
   graceHours: uit platform_settings.decision_grace_hours
   now: timestamp in ms */
export function shouldRefundSession(session, graceHours = 0, now = Date.now()) {
  if (!session) return false;

  /* Geen minimum of al doorgegaan: nooit refunden via deze weg. */
  if (!session.min_participants || session.goes_ahead) return false;

  /* Provider heeft override gezet: geen refund. */
  if (session.provider_override) return false;

  /* Beslismoment moet verstreken zijn. */
  if (!session.decision_at) return false;
  const decisionMs = new Date(session.decision_at).getTime();
  const graceMs = graceHours * 60 * 60 * 1000;
  if (now < decisionMs + graceMs) return false;

  /* Minimum niet gehaald. */
  const taken = session.seats_taken ?? 0;
  if (taken >= session.min_participants) return false;

  /* Sessie mag niet al afgehandeld zijn (cancelled_by_provider of completed). */
  const refundableStates = ["open", "not_happening"];
  if (!refundableStates.includes(session.state)) return false;

  return true;
}

/* Moet deze sessie uitbetaald worden aan de workshopgever?
   Ja als: sessie is confirmed, ends_at + delay voorbij,
   en er zijn betaalde bookings.

   session: { state, ends_at }
   settlementDelayHours: uit platform_settings.settlement_delay_hours
   now: timestamp in ms */
export function shouldSettleSession(session, settlementDelayHours = 24, now = Date.now()) {
  if (!session) return false;
  if (session.state !== "confirmed") return false;
  if (!session.ends_at) return false;

  const endsMs = new Date(session.ends_at).getTime();
  const delayMs = settlementDelayHours * 60 * 60 * 1000;
  return now >= endsMs + delayMs;
}

/* Is een provider override nog mogelijk?
   Ja als: beslismoment voorbij, grace period nog niet voorbij,
   minimum niet gehaald, geen eerdere override.

   session: { decision_at, min_participants, seats_taken, goes_ahead,
              provider_override, state }
   graceHours: uit platform_settings.decision_grace_hours
   now: timestamp in ms */
export function canProviderOverride(session, graceHours = 0, now = Date.now()) {
  if (!session) return false;
  if (!session.decision_at) return false;
  if (session.provider_override) return false;
  if (session.goes_ahead) return false;

  const decisionMs = new Date(session.decision_at).getTime();
  /* Beslismoment moet voorbij zijn. */
  if (now < decisionMs) return false;

  /* Grace period mag niet voorbij zijn. */
  const graceMs = graceHours * 60 * 60 * 1000;
  if (graceHours > 0 && now >= decisionMs + graceMs) return false;

  /* Minimum mag niet al gehaald zijn (dan is override niet nodig). */
  const taken = session.seats_taken ?? 0;
  if (session.min_participants && taken >= session.min_participants) return false;

  return true;
}
