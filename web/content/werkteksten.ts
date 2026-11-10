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
  /* Beheerpagina van een aanmelding (/boeking/beheer), voor deelnemers met
     en zonder account. De panelen volgen docs/05 §4-8. */
  beheer: {
    pilotAnnuleren: "Tijdens de pilot krijg je bij annuleren altijd het volledige bedrag terug.",
    annulerenVast: "Na de gratis termijn kost annuleren {procent} procent van het bedrag, tot de start.",
    annulerenGeenKosten: "Ook daarna zijn er geen kosten, tot de start.",
    meldingIntro:
      "Ging er iets mis tijdens de workshop? Probeer het eerst ter plekke met de workshopgever op te lossen. Lukt dat niet, laat het ons dan hier weten. Zolang je melding loopt, gaat het geld nog niet naar de workshopgever.",
    meldingTermijn: "Een melding kan tot {datum}.",
    meldingDank: "Dank je. We hebben je melding ontvangen en kijken ernaar. Binnen 14 dagen hoor je wat we besluiten.",
    noShowUitleg: "De workshopgever heeft gemeld dat je er niet was. Bij niet verschijnen krijg je geen geld terug. Klopt dat niet? Laat het ons hieronder weten.",
    reviewDank: "Dank je! Je review staat online.",
  },
  /* Workshopgever: annuleren van een datum (docs/05 §6). */
  datumAnnuleren: {
    vraag:
      "Kun je echt niet? Annuleer je deze datum, dan krijgen alle {n} deelnemers bericht en een andere datum aangeboden. Doe dit alleen als het niet anders kan.",
    reden: "Reden (gaat mee in de mail aan de deelnemers)",
    noShow: "Niet gekomen",
    noShowVraag: "Was {naam} er niet? De deelnemer krijgt dan bericht en geen geld terug.",
  },
} as const;

/* "{n} deelnemers" -> "3 deelnemers" */
export function vul(tekst: string, waarden: Record<string, string | number>): string {
  return tekst.replace(/\{(\w+)\}/g, (_, key: string) => String(waarden[key] ?? ""));
}
