/* Gedeelde, serialiseerbare typen voor de categoriepagina (#p-cat). De server
   bouwt ze (build.ts), de filterbalk (CatOffer, client) toont ze. */

export type ChipKey =
  "door" | "plek" | "avond" | "weekend" | "klein" | "onder50" | "veg";
/* Periodes uit de zoekbalk van de homepage (?wanneer=doordeweeks|volgende-maand):
   geen chip in het ontwerp, wel een verwijderbare chip zolang ze aan staan. */
export type PeriodKey = "werkdag" | "volgendemaand";
export type FilterKey = ChipKey | PeriodKey;

/* Een datum in de tijdlijn of in een rij van de lijst. */
export type SlotView = {
  id: string;
  href: string;
  /* "2026-11-14" */
  isoDay: string;
  /* "za 14 nov" */
  day: string;
  /* "15:00" */
  start: string;
  title: string;
  /* "Oost · 3 uur" */
  where: string;
  stand: "door" | "open" | "vol";
  /* "Gaat door", "1 van 4 nodig", "Vol" */
  label: string;
  /* "nog 2 plekken", "beslismoment zo 15 nov, 18:30", "volgende: di 17 nov" */
  sub: string | null;
  /* "45" of null */
  price: string | null;
  keys: FilterKey[];
};

export type DayView = {
  isoDay: string;
  /* "di", "10", "nov" */
  weekday: string;
  date: string;
  month: string;
  /* 0 = deze week, 1 = volgende week, 2 = de week erna (eerst verborgen) */
  week: 0 | 1 | 2;
  slots: SlotView[];
};

export type RowView = {
  id: string;
  href: string;
  title: string;
  image: string;
  imageAlt: string;
  /* "Utrecht, Oost · 3 uur" */
  where: string;
  rating: string | null;
  ratingCount: number;
  price: string | null;
  /* De eerste drie datums. */
  slots: SlotView[];
  /* Aantal datums na de eerste drie. */
  more: number;
  /* Filtersleutels per datum (alle datums); zonder datums alleen die van de workshop. */
  keySets: FilterKey[][];
};

export type CalendarDay = {
  date: number;
  kind: "voorbij" | "vandaag" | "met" | "leeg";
  /* Ook vandaag kan datums hebben. */
  count: number;
  isoDay: string;
  /* Alleen als de dag in de tijdlijn staat. */
  linked: boolean;
  later: boolean;
};

export type CalendarView = {
  /* "November 2026" */
  title: string;
  nextMonth: string;
  blanks: number;
  days: CalendarDay[];
};

export type OfferView = {
  placeName: string;
  singular: string;
  plural: string;
  /* "Alle kookworkshops in Utrecht" */
  listHeading: string;
  /* "Van donderdag 12 tot en met zondag 22 november" */
  range: string;
  /* "Tot en met zondag 22 november" */
  until: string;
  /* "Tot en met zondag 29 november" */
  untilLater: string;
  /* "Week van 23 november" */
  laterLabel: string;
  calendar: CalendarView;
  days: DayView[];
  rows: RowView[];
};
