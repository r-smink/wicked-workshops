import type { VenueView } from "@/lib/voorkant/data";

/* Ruimtes uit venue_listings omgezet naar wat de kaarten op /ruimte-gezocht
   en /workshops-geven tonen. Puur en serialiseerbaar, zodat het ook naar het
   filter (client component) kan. */

export type VenueKind = NonNullable<VenueView["kind"]>;
/* Waarden van de filterchips "Soort ruimte" uit het ontwerp. */
export type VenueSort = "keuken" | "atelier" | "zaal" | "buiten" | "anders";

export type VenueCard = {
  id: string;
  name: string;
  placeLabel: string;
  capacity: number | null;
  hasKitchen: boolean;
  sort: VenueSort;
  amenities: string[];
  /* [dagdeel][dag]: ochtend, middag, avond x ma..zo */
  free: boolean[][];
  week: boolean;
  weekend: boolean;
  image: { src: string; alt: string; width: number; height: number };
};

export const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export const DAY_LABELS = ["ma", "di", "wo", "do", "vr", "za", "zo"] as const;
export const PARTS = ["morning", "afternoon", "evening"] as const;
export const PART_LABELS = ["Ochtend", "Middag", "Avond"] as const;

const KIND_LABEL: Record<VenueKind, string> = { kitchen: "Keuken", atelier: "Atelier", hall: "Zaal", outdoor: "Buiten" };
const KIND_SORT: Record<VenueKind, VenueSort> = { kitchen: "keuken", atelier: "atelier", hall: "zaal", outdoor: "buiten" };

/* Terugvalbeeld uit het ontwerp per soort ruimte, zolang de eigenaar nog geen
   eigen foto heeft. Bij meer ruimtes van dezelfde soort wisselt het beeld. */
type Img = VenueCard["image"];
const FALLBACK: Record<VenueKind | "other", Img[]> = {
  kitchen: [
    { src: "/img/locatie-keuken2.jpg", alt: "Een lichte keuken met groot eiland en kruiden", width: 1400, height: 933 },
    { src: "/img/locatie-keuken3.jpg", alt: "Een keuken met open planken, pannen en een witte tegelwand", width: 1050, height: 1867 },
    { src: "/img/locatie-keuken.jpg", alt: "Een houten keuken met kookeiland en witte krukken", width: 1050, height: 1575 },
  ],
  atelier: [
    { src: "/img/locatie-atelier.jpg", alt: "Een zonnig atelier met grote werktafels en hoge ramen", width: 1050, height: 1575 },
    { src: "/img/locatie-schilderzaal.jpg", alt: "Een lichte schilderzaal vol ezels met schorten", width: 1400, height: 908 },
  ],
  hall: [
    { src: "/img/locatie-lokaal.jpg", alt: "Een lege, lichte ruimte met witte tafels en zwarte krukjes", width: 1400, height: 1041 },
    { src: "/img/locatie-cafe.jpg", alt: "Een leeg café met roze stoelen en tafels", width: 1400, height: 935 },
    { src: "/img/locatie-hal.jpg", alt: "Een lege hal met lange houten tafels en banken", width: 994, height: 933 },
  ],
  outdoor: [{ src: "/img/buiten2.jpg", alt: "Wandelaars tussen hoge dennenbomen", width: 1100, height: 1632 }],
  other: [{ src: "/img/locatie-hal.jpg", alt: "Een lege hal met lange houten tafels en banken", width: 994, height: 933 }],
};

export function toVenueCards(venues: VenueView[]): VenueCard[] {
  const seen: Record<string, number> = {};
  return venues.map((v) => {
    const key = v.kind ?? "other";
    const n = seen[key] ?? 0;
    seen[key] = n + 1;
    const list = FALLBACK[key];
    const image: Img = v.image ? { src: v.image, alt: v.name, width: 1400, height: 933 } : list[n % list.length]!;
    const free = PARTS.map((part) => DAYS.map((day) => Array.isArray(v.availability[day]) && v.availability[day]!.includes(part)));
    const dayFree = (i: number) => free.some((row) => row[i]);
    const place = [v.place?.name, v.neighbourhood].filter(Boolean).join(", ");
    const kind = v.kind ? KIND_LABEL[v.kind] : null;
    return {
      id: v.id,
      name: v.name,
      placeLabel: [place, kind].filter(Boolean).join(" · "),
      capacity: v.capacity,
      hasKitchen: v.kind === "kitchen" || v.amenities.some((a) => /keuken/i.test(a)),
      sort: v.kind ? KIND_SORT[v.kind] : "anders",
      amenities: v.amenities,
      free,
      week: [0, 1, 2, 3, 4].some(dayFree),
      weekend: [5, 6].some(dayFree),
      image,
    };
  });
}

export const venueAnchor = (id: string) => `ruimte-${id}`;
