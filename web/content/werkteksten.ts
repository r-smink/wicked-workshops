/* Werkteksten: placeholder-kopij die nog niet in het ontwerp staat of nog
   langs het team en de juristen moet. Vervangen kan hier, zonder de code
   aan te raken (CLAUDE.md). */

export const werkteksten = {
  betalen: {
    /* payment_mode sandbox: de pilot met OPP-testgeld. */
    testmodus: "Testmodus: je betaalt met testgeld. Er wordt niets afgeschreven.",
    testmodusTerug: "Testmodus: dit was een testbetaling. Er is geen echt geld afgeschreven.",
    /* payment_mode off: boeken zonder betaling. */
    uitKnop: "Reserveer je plek",
    uitUitleg: "Je betaalt nu niets. Je plek is meteen vastgelegd.",
  },
} as const;
