/* Teksten voor de categoriepagina die van categorie en plaats afhangen.
   Werktekst: de woorden per categorie en de standaard-FAQ en SEO-tekst zijn
   afgeleid van het ontwerp (#p-cat, Kookworkshops in Utrecht) en worden
   vervangen zodra er per combinatie een location_page in Directus staat. */

import type { ChipKey } from "./types";

/* Werktekst: enkelvoud en meervoud per categorie. Zonder eigen woord wordt
   het "workshop" met de categorienaam erachter. */
const NOUNS: Record<string, [string, string]> = {
  "koken-en-bakken": ["kookworkshop", "kookworkshops"],
  "keramiek-en-klei": ["keramiekworkshop", "keramiekworkshops"],
  "schilderen-en-kunst": ["schilderworkshop", "schilderworkshops"],
  "drinks-en-proeverijen": ["proeverij", "proeverijen"],
  "wellness-en-beauty": ["wellnessworkshop", "wellnessworkshops"],
  "bloemen-en-groen": ["bloemenworkshop", "bloemenworkshops"],
  "fotografie-en-media": ["fotografieworkshop", "fotografieworkshops"],
};

export type Nouns = {
  singular: string;
  plural: string;
  /* "Kookworkshops", "Workshops ambacht & maken" */
  title: string;
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function nounsFor(
  category: { slug: string; name: string } | null,
): Nouns {
  if (!category)
    return { singular: "workshop", plural: "workshops", title: "Workshops" };
  const own = NOUNS[category.slug];
  if (own) return { singular: own[0], plural: own[1], title: cap(own[1]) };
  const name = category.name.toLowerCase();
  return {
    singular: `workshop ${name}`,
    plural: `workshops ${name}`,
    title: `Workshops ${name}`,
  };
}

/* De chips uit het ontwerp, in dezelfde volgorde. */
export const CHIPS: { key: ChipKey; label: string }[] = [
  { key: "door", label: "Gaat zeker door" },
  { key: "plek", label: "Nog plek" },
  { key: "avond", label: "'s Avonds" },
  { key: "weekend", label: "In het weekend" },
  { key: "klein", label: "Kleine groep, tot 8" },
  { key: "onder50", label: "Onder €50" },
  { key: "veg", label: "Vegetarisch kan" },
];

/* Grenzen achter de chips. */
export const EVENING_FROM_HOUR = 17;
export const SMALL_GROUP_MAX = 8;
export const CHEAP_BELOW = 50;

/* Werktekst: de FAQ uit het ontwerp, als er geen location_page met FAQ is. */
export function defaultFaq(n: Nouns): { question: string; answer: string }[] {
  return [
    {
      question: "Hoe houd ik bij of mijn datum doorgaat?",
      answer:
        "Je krijgt een herinnering vóór het beslismoment dat bij je datum staat.",
    },
    {
      question: "Tot wanneer kan ik annuleren?",
      answer: `Bij de meeste ${n.plural} tot 48 uur vooraf gratis. Verzetten naar een andere datum kan kosteloos, zolang er plek is.`,
    },
    {
      question: "Wat als de workshopgever annuleert?",
      answer:
        "Bij de meeste workshops krijg je dan alles terug wat je betaald hebt en bieden we je een andere datum of workshop aan.",
    },
    {
      question: "Kan ik een allergie of dieetwens doorgeven?",
      answer:
        "Ja, bij het aanmelden is daar een veld voor. Of een workshop vegetarisch kan, zie je met het filter Vegetarisch kan.",
    },
    {
      question: "Kan ik met mijn team of een grote groep komen?",
      answer:
        "Voor groepen van tien tot twintig personen plannen we de datum met jullie samen, dus daar speelt geen minimum. Vraag een voorstel aan via Voor bedrijven; binnen één werkdag hoor je van ons.",
    },
  ];
}

/* Werktekst: de SEO-tekst uit het ontwerp, met wijken, aantallen en prijzen
   uit de echte data in plaats van de voorbeelden. */
export function defaultSeoText(
  n: Nouns,
  place: string | null,
  facts: {
    neighbourhoods: string[];
    minPrice: number | null;
    maxPrice: number | null;
  },
): { heading: string; blocks: { h3?: string; p: string }[] } {
  const where = place ? `in ${place}` : "in Nederland";
  const spots = facts.neighbourhoods.slice(0, 4);
  const range =
    spots.length > 1
      ? `${spots.slice(0, -1).join(", ")} en ${spots[spots.length - 1]}`
      : spots[0];
  const first = place
    ? `Bij Wicked Workshops volg je ${n.plural === "workshops" ? "een workshop" : `een ${n.singular}`} ${where} bij een workshopgever in de stad zelf.`
    : `Bij Wicked Workshops volg je ${n.plural === "workshops" ? "een workshop" : `een ${n.singular}`} bij een workshopgever bij jou in de buurt.`;
  const p1 = `${first}${range ? ` Het aanbod zit onder meer in ${range}.` : ""} Bij elke workshop staat wat je maakt, hoe lang het duurt en met hoeveel mensen je bent.`;
  const price =
    facts.minPrice != null && facts.maxPrice != null
      ? facts.minPrice === facts.maxPrice
        ? `De workshops op deze pagina kosten €${facts.minPrice} per persoon, zonder boekingskosten.`
        : `De workshops op deze pagina kosten tussen €${facts.minPrice} en €${facts.maxPrice} per persoon, zonder boekingskosten.`
      : "Je betaalt geen boekingskosten.";
  return {
    heading: `Een ${n.singular} ${where} kiezen`,
    blocks: [
      { p: p1 },
      {
        h3: "Op een doordeweekse avond of op zaterdag",
        p: "Doordeweeks beginnen de meeste workshops in de vroege avond en duren ze twee tot drie uur. In het weekend kan het ook overdag. Met het filter 's Avonds of In het weekend zie je alleen die datums.",
      },
      {
        h3: "Wat het kost en hoe aanmelden werkt",
        p: `${price} Je meldt je aan voor een datum en je plek staat vast. Staat er bij die datum “nodig”, dan gaat hij door zodra het minimum gehaald is. Uiterlijk op het beslismoment weet je het.`,
      },
    ],
  };
}

/* Werktekst: zijblok voor workshopgevers. */
export function giverText(categorySlug: string | null): string {
  const kitchen = categorySlug === "koken-en-bakken";
  return kitchen
    ? "Ook zonder bedrijf: we kijken je workshop na voordat hij live gaat. Geen eigen keuken? Bekijk keukens die leeg staan en spreek het rechtstreeks met de eigenaar af."
    : "Ook zonder bedrijf: we kijken je workshop na voordat hij live gaat. Geen eigen ruimte? Bekijk ruimtes die leeg staan en spreek het rechtstreeks met de eigenaar af.";
}
