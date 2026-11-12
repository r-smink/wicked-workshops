/* Opmaak en standen voor de voorkant. Puur (geen server-only), zodat
   client-componenten dezelfde teksten maken als de server. */

const TZ = "Europe/Amsterdam";
const DAY_SHORT = new Intl.DateTimeFormat("nl-NL", { weekday: "short", day: "numeric", month: "short", timeZone: TZ });
const DAY_LONG = new Intl.DateTimeFormat("nl-NL", { weekday: "long", day: "numeric", month: "long", timeZone: TZ });
const WEEKDAY_SHORT = new Intl.DateTimeFormat("nl-NL", { weekday: "short", timeZone: TZ });
const DATE_SHORT = new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short", timeZone: TZ });
const DATE_LONG = new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", timeZone: TZ });
const TIME = new Intl.DateTimeFormat("nl-NL", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
const ISO_DAY = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: TZ });

const strip = (s: string) => s.replace(/\./g, "");

/* "za 14 nov" */
export const dayShort = (iso: string) => strip(DAY_SHORT.format(new Date(iso)));
/* "zaterdag 14 november" */
export const dayLong = (iso: string) => DAY_LONG.format(new Date(iso));
/* "za" */
export const weekdayShort = (iso: string) => strip(WEEKDAY_SHORT.format(new Date(iso)));
/* "14 nov" */
export const dateShort = (iso: string) => strip(DATE_SHORT.format(new Date(iso)));
/* "14 november" */
export const dateLong = (iso: string) => DATE_LONG.format(new Date(iso));
/* "15:00" */
export const time = (iso: string) => TIME.format(new Date(iso));
/* "2026-11-14" in Amsterdamse tijd, om op dag te groeperen. */
export const isoDay = (iso: string) => ISO_DAY.format(new Date(iso));

/* "15:00 tot 18:00" */
export function timeRange(start: string, end: string | null): string {
  return end ? `${time(start)} tot ${time(end)}` : time(start);
}

/* 180 -> "3 uur", 150 -> "2,5 uur" */
export function durationLabel(minutes: number | null | undefined): string {
  if (!minutes) return "";
  const h = minutes / 60;
  return `${Number.isInteger(h) ? h : h.toFixed(1).replace(".", ",")} uur`;
}

/* 45 -> "45", 42.5 -> "42,50" */
export function euro(amount: number | null | undefined): string {
  if (amount == null || !Number.isFinite(amount)) return "";
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2).replace(".", ",");
}

/* 4.86 -> "4,9" */
export const rating = (n: number | null | undefined): string => (n == null ? "" : n.toFixed(1).replace(".", ","));

/* Maandag van de week van een datum (Amsterdam), als "2026-11-09". */
export function weekStart(iso: string): string {
  const d = new Date(`${isoDay(iso)}T12:00:00Z`);
  const dow = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dow);
  return d.toISOString().slice(0, 10);
}

/* ---------------------------------------------------------------------------
   De vier standen van een datum (wicked-handoff/PROMPT-BOUW.md). In de
   ontwerp-HTML staan ze als data-stand: open, door, vol, en "geenmin" voor
   door zonder minimum. "nietdoor" tonen we niet publiek als datum (er komt een
   andere datum voor in de plaats), maar wel in de legenda.
   --------------------------------------------------------------------------- */

export type Stand = "open" | "door" | "geenmin" | "vol" | "nietdoor";

export type SessionCounts = {
  capacity: number;
  taken: number;
  min: number | null;
  goesAhead: boolean;
  decisionAt: string | null;
  cancelled: boolean;
};

export function standOf(s: SessionCounts, now = Date.now()): Stand {
  const reached = !s.min || s.taken >= s.min || s.goesAhead;
  const decided = s.decisionAt ? new Date(s.decisionAt).getTime() <= now : false;
  if (s.cancelled || (decided && !reached)) return "nietdoor";
  if (s.capacity > 0 && s.taken >= s.capacity) return "vol";
  if (!s.min) return "geenmin";
  return reached ? "door" : "open";
}

/* Het kleine label op de datum: "Gaat door", "2 van 4 nodig", "Vol". */
export function standLabel(stand: Stand, s: Pick<SessionCounts, "taken" | "min">): string {
  switch (stand) {
    case "open": return `${s.taken} van ${s.min} nodig`;
    case "vol": return "Vol";
    case "nietdoor": return "Gaat niet door";
    default: return "Gaat door";
  }
}

/* Waarde voor data-stand in de ontwerp-CSS: geenmin valt onder door. */
export const standAttr = (stand: Stand): "open" | "door" | "vol" | "nietdoor" => (stand === "geenmin" ? "door" : stand);

export const plekken = (n: number) => `${n} ${n === 1 ? "plek" : "plekken"}`;
