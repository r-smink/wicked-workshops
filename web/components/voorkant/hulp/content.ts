/* Kopij van de hulppagina (wicked-handoff/design/index.html, #p-hulp). Eén
   bron voor de weergave, de zoekfunctie en de FAQPage-data. Een antwoord is
   een lijst stukken: tekst, een link, of het label "Werktekst" (tekst die nog
   wordt uitgewerkt; juristen vervangen die later). */

export type AnswerPart = string | { href: string; text: string } | { werktekst: true };

export type FaqItem = { q: string; a: AnswerPart[] };

export type HelpGroupId = "meedoen" | "geven";

export type HelpBlock = {
  /* Anker zonder "hulp-d-", bijv. "boeken" -> #hulp-d-boeken */
  id: string;
  group: HelpGroupId;
  title: string;
  faq: FaqItem[];
};

/* Werktekst: label achter teksten die nog worden uitgewerkt. */
export const WERKTEKST_LABEL = "Werktekst, wordt nog uitgewerkt";

const W: AnswerPart = { werktekst: true };

export const HELP_GROUPS: { id: HelpGroupId; title: string; lead: string }[] = [
  { id: "meedoen", title: "Als je meedoet", lead: "Van een workshop vinden tot de review na afloop." },
  { id: "geven", title: "Als je workshops geeft", lead: "Van je account tot je eerste datum." },
];

export const HELP_BLOCKS: HelpBlock[] = [
  {
    id: "boeken",
    group: "meedoen",
    title: "Boeken en je aanmelding",
    faq: [
      { q: "Staat mijn plek meteen vast?", a: ["Ja, nu wel. Je krijgt een bevestiging per mail, met een link waarmee je je aanmelding beheert. Wat er verandert zodra er via de site betaald wordt, lees je bij ", { href: "#hulp-d-pilot", text: "De pilot en betalen" }, "."] },
      { q: "Wat vul ik in als ik boek?", a: ["Een datum, het aantal personen, je naam en je e-mailadres. Een account is niet nodig."] },
      { q: "Kan ik een dieetwens doorgeven?", a: ["Ja. In het boekformulier staat een veld voor dieetwensen."] },
      { q: "Komen er boekingskosten bij de prijs?", a: ["Nee. Boekingskosten zijn €0, altijd. Je betaalt alleen de prijs van de workshop."] },
      { q: "Hoe kies ik tussen datums?", a: ["Overzichten staan op datum, de eerstvolgende sessie staat bovenaan. Op elke kaart zie je de datum, de plaats, de prijs, de beoordeling en hoe het met die sessie staat."] },
      { q: "Wat betekent “Vol”?", a: ["Alle plekken van die datum zijn bezet. Kijk bij de andere datums van dezelfde workshop."] },
    ],
  },
  {
    id: "minimum",
    group: "meedoen",
    title: "Het minimum en het beslismoment",
    faq: [
      { q: "Wat betekent “3 van 4 nodig”?", a: ["Er hebben zich drie mensen aangemeld en het minimum is vier. Is het minimum gehaald op het beslismoment, dan gaat de datum door."] },
      { q: "Hoe weet ik of mijn workshop doorgaat?", a: ["Bij elke datum staat de stand, en je ziet tot wanneer het minimum gehaald moet zijn. Je krijgt een herinnering voor het beslismoment. Uiterlijk op het beslismoment hoor je of de datum doorgaat."] },
      { q: "Wie beslist of een datum doorgaat?", a: ["Niemand. Het gaat vanzelf: is het minimum gehaald, dan gaat de datum door. Wordt het niet gehaald, dan gaat hij niet door."] },
      { q: "Kan “Gaat door” nog veranderen?", a: ["Alleen als de workshopgever zelf annuleert. Dan krijg je bij de meeste workshops alles terug, plus een alternatief."] },
      { q: "Wat als het minimum niet gehaald wordt?", a: ["Dan gaat die datum niet door en krijg je een andere datum aangeboden."] },
    ],
  },
  {
    id: "annuleren",
    group: "meedoen",
    title: "Annuleren en verzetten",
    faq: [
      { q: "Wat als ik binnen 48 uur annuleer?", a: ["Dan betaal je bij de meeste workshops 50 procent van de workshopprijs."] },
      { q: "Wat als ik nu annuleer?", a: ["De kosten bij annuleren gelden pas zodra er via de site betaald wordt. Hoe het nu zit, lees je bij ", { href: "#hulp-d-pilot", text: "De pilot en betalen" }, ".", W] },
    ],
  },
  {
    id: "pilot",
    group: "meedoen",
    title: "De pilot en betalen",
    faq: [
      { q: "Moet ik betaalgegevens invullen?", a: ["Nee. Er is nu geen betaalstap: je aanmelding wordt bevestigd zonder betaling."] },
      { q: "Wat is een pilot?", a: ["Eerst testen we het platform met een kleine groep deelnemers en workshopgevers. Zo zien we wat goed gaat en wat beter kan, voordat er via Wicked Workshops betaald wordt."] },
      { q: "Wat betaal ik later voor een workshop?", a: ["De prijs die bij de workshop staat, zonder boekingskosten. Die prijs zie je nu al op elke workshop."] },
    ],
  },
  {
    id: "account",
    group: "meedoen",
    title: "Je account",
    faq: [
      { q: "Heb ik een account nodig om te boeken?", a: ["Nee. Je boekt met je naam en je e-mailadres."] },
      { q: "Wat heb ik aan een account?", a: ["Je ziet al je aanmeldingen en hun stand op één plek."] },
      { q: "Welke gegevens vraagt Wicked Workshops voor een account?", a: ["Alleen je e-mailadres. Geen geboortedatum, adres of telefoonnummer. Bij een aanmelding vragen we je naam."] },
      { q: "Lukt inloggen niet?", a: ["Op de ", { href: "/inloggen", text: "inlogpagina" }, " staat wat je dan kunt doen. Kom je er niet uit, ", { href: "/contact", text: "stuur ons dan een bericht" }, ".", W] },
    ],
  },
  {
    id: "reviews",
    group: "meedoen",
    title: "Reviews",
    faq: [
      { q: "Wie kan een review schrijven?", a: ["Alleen mensen die via Wicked Workshops hebben geboekt. Je schrijft je review na afloop van de workshop."] },
      { q: "Waarom staat bij een workshopgever een ander aantal reviews dan bij één workshop?", a: ["Op het profiel van een workshopgever tellen de reviews over al zijn workshops samen. Bij een workshop staan alleen de reviews van die workshop."] },
      { q: "Staan er sterren zonder reviews?", a: ["Nee. Een beoordeling staat er altijd met het aantal reviews waarop hij is gebaseerd."] },
    ],
  },
  {
    id: "particulier",
    group: "meedoen",
    title: "Ondernemer of particulier",
    faq: [
      { q: "Waar zie ik of een workshopgever een particulier is?", a: ["Op de pagina van de workshop en op het profiel van de workshopgever."] },
      { q: "Wat betekent “particulier” bij een workshopgever?", a: ["Een particulier geeft workshops zonder bedrijf. Daarom geldt bij een particulier het consumentenrecht niet. Wat dat precies voor jou betekent, wordt nog uitgewerkt.", W] },
    ],
  },
  {
    id: "bedrijf",
    group: "meedoen",
    title: "Met je bedrijf of team",
    faq: [
      { q: "Kan ik met mijn bedrijf een workshop boeken?", a: ["Ja, voor groepen van tien tot twintig personen. Stuur via Voor bedrijven een aanvraag."] },
      { q: "Hoe snel krijg ik antwoord op een zakelijke aanvraag?", a: ["Binnen één werkdag."] },
      { q: "Geldt het minimum ook voor een bedrijfsuitje?", a: ["Nee. De regel met een minimum en een beslismoment geldt niet voor bedrijfsuitjes."] },
      { q: "Hoe zit het met btw en facturatie voor bedrijven?", a: ["Dat is nog niet uitgewerkt.", W] },
    ],
  },
  {
    id: "aanslag",
    group: "geven",
    title: "Aan de slag als workshopgever",
    faq: [
      { q: "Heb ik een bedrijf of een btw-nummer nodig?", a: ["Nee. Je kunt ook als particulier workshops geven. Wel kijken we je workshop na voordat hij online gaat."] },
      { q: "Mag iedereen workshops geven?", a: ["Niet automatisch. Elke workshop gaat langs een check voordat hij online komt."] },
      { q: "Wat heb ik nodig om te beginnen?", a: ["Alleen een e-mailadres voor je account. Gevoelige gegevens, zoals je IBAN, vul je pas in als je workshop klaar is."] },
      { q: "Kan ik mijn workshop tussendoor opslaan?", a: ["Ja. Je bewaart hem als concept en gaat later verder."] },
      { q: "Welke zes stappen zijn er?", a: ["Basis, inhoud, praktisch, beeld, prijs en datums."] },
    ],
  },
  {
    id: "verklaring",
    group: "geven",
    title: "De aanbiedersverklaring en de check",
    faq: [
      { q: "Wanneer vul ik de aanbiedersverklaring in?", a: ["Pas als je workshop klaar is. Bij het maken van je account vragen we alleen je e-mailadres."] },
      { q: "Welke afspraken maak ik in de verklaring?", a: ["Je verklaart onder meer dat je 18 jaar of ouder bent, dat je zorgt voor een veilige uitvoering van je workshop en dat je incidenten meldt."] },
      { q: "Ik ben particulier. Kan ik toch een workshop geven?", a: ["Ja. In de verklaring kies je of je particulier of ondernemer bent. Bij een ondernemer vragen we ook je KvK-nummer en je handelsnaam. Bij je workshop staat welke van de twee je bent."] },
      { q: "Wat kijken jullie na, en hoe lang duurt dat?", a: ["Wij kijken je workshop na voordat hij online gaat. Hoe die check precies werkt en hoe lang hij duurt, is nog niet vastgelegd.", W] },
    ],
  },
  {
    id: "kosten",
    group: "geven",
    title: "Kosten en uitbetaling",
    faq: [
      { q: "Hoeveel commissie betaal ik?", a: ["Een percentage van de workshopprijs, dat per categorie verschilt: tussen 9 en 20 procent. Welk percentage bij jouw categorie hoort, wordt nog bepaald.", W] },
      { q: "Wanneer krijg ik mijn geld?", a: ["Zodra er via de site betaald wordt, krijg je je geld na afloop van de workshop."] },
      { q: "Moet ik btw rekenen?", a: ["Je hebt geen btw-nummer nodig om te beginnen. Hoe btw en facturatie precies werken, wordt nog uitgewerkt.", W] },
    ],
  },
  {
    id: "datums",
    group: "geven",
    title: "Je datums en het minimum",
    faq: [
      { q: "Moet ik een minimum instellen?", a: ["Nee, dat kies je zelf per datum. Zonder minimum gaat de datum altijd door."] },
      { q: "Wat is het beslismoment?", a: ["Het tijdstip waarop het minimum gehaald moet zijn. Een voorbeeld: een workshop op zaterdag om 15:00 met acht plekken, die doorgaat bij vier deelnemers, met als beslismoment vrijdag 22:00."] },
      { q: "Wat als het minimum niet gehaald wordt?", a: ["Dan gaat die datum niet door. Wie zich had aangemeld, krijgt een andere datum aangeboden."] },
      { q: "Kan een datum die doorgaat nog afvallen?", a: ["Niet door te weinig aanmeldingen. Staat een datum op “Gaat door”, dan blijft hij doorgaan, ook als iemand daarna afzegt. Moet je zelf annuleren, dan krijgen je deelnemers bij de meeste workshops alles terug, plus een alternatief."] },
      { q: "Kunnen deelnemers helpen om het minimum te halen?", a: ["Ja. Deelnemers kunnen een datum delen om zelf mensen te werven."] },
      { q: "Zie ik hoeveel mensen zich hebben aangemeld?", a: ["Ja, per datum."] },
    ],
  },
  {
    id: "profiel",
    group: "geven",
    title: "Je profiel en je reviews",
    faq: [
      { q: "Mag ik mijn eigen website of telefoonnummer op mijn profiel zetten?", a: ["Nee. Op het profiel staan geen eigen website, telefoonnummer of socials."] },
      { q: "Waar komen mijn reviews vandaan?", a: ["Alleen van mensen die via Wicked Workshops bij je hebben geboekt."] },
      { q: "Hoe zien deelnemers of ik particulier of ondernemer ben?", a: ["Dat staat op je profiel en bij je workshop, op basis van wat je in de aanbiedersverklaring hebt gekozen."] },
    ],
  },
  {
    id: "ruimte",
    group: "geven",
    title: "Een ruimte zoeken of aanbieden",
    faq: [
      { q: "Hoe vind ik een ruimte?", a: ["Op Locatie gezocht zie je per ruimte wat er is: of er een keuken is, de voorzieningen, het aantal plekken, de plaats en wanneer hij vaak vrij is. Met “Neem contact op met de eigenaar” leg je zelf contact."] },
      { q: "Wie regelt de huur, de betaling en de sleutel?", a: ["Jij en de eigenaar, rechtstreeks met elkaar. Dat geldt ook voor schoonmaak, annuleren en aansprakelijkheid. Wicked Workshops is daar geen partij in en koppelt niet."] },
      { q: "Er past geen ruimte bij mij. Wat nu?", a: ["Vul het formulier op Locatie gezocht in. Ons team helpt je zoeken, maar we beloven geen match."] },
      { q: "Wat kost het om mijn ruimte te laten zien?", a: ["Als eigenaar betaal je straks een vaste fee om je ruimte te laten zien. Hoe hoog die is, en of hij tijdens de pilot geldt, staat nog niet vast. Je hoort het voordat je iets betaalt.", W] },
    ],
  },
];

export const blockById = (id: string): HelpBlock => {
  const b = HELP_BLOCKS.find((x) => x.id === id);
  if (!b) throw new Error(`Onbekend hulponderwerp: ${id}`);
  return b;
};

/* Platte tekst van een antwoord. Met label: zoals textContent in het ontwerp
   (de zoekfunctie). Zonder label: voor de FAQPage-data. */
export function answerText(parts: AnswerPart[], withLabel = false): string {
  return parts
    .map((p) => (typeof p === "string" ? p : "href" in p ? p.text : withLabel ? ` ${WERKTEKST_LABEL}` : ""))
    .join("")
    .trim();
}
