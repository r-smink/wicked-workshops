/* ===========================================================================
   Fee-berekening: platformfee en uitsplitsing.

   Puur en zonder afhankelijkheden.
   =========================================================================== */

/* Bereken de kosten voor een boeking.
   priceCents: prijs per persoon in centen
   participants: aantal deelnemers
   commissionPercent: commissie van het platform (9-20)

   Retourneert: { subtotal, platformFee, providerAmount, total }
   Alle bedragen in centen (integer). */
export function calculateBookingFees({ priceCents, participants, commissionPercent = 0 }) {
  const subtotal = Math.round(priceCents * participants);
  const platformFee = Math.round(subtotal * (commissionPercent / 100));
  const providerAmount = subtotal - platformFee;

  return {
    subtotal,
    platformFee,
    providerAmount,
    /* Deelnemer betaalt het volle bedrag. Boekingskosten zijn EUR 0. */
    total: subtotal,
  };
}
