/* Pure helpers voor de workshoppagina (#p-detail). Geen server-only: de
   datumkiezer (client) maakt dezelfde teksten als de server. */
import type { SessionView } from "@/lib/voorkant/data";
import { dateShort, dayLong, time, weekdayShort, plekken } from "@/lib/voorkant/format";

const WORDS = ["nul", "een", "twee", "drie", "vier", "vijf", "zes", "zeven", "acht", "negen", "tien", "elf", "twaalf", "dertien", "veertien", "vijftien", "zestien", "zeventien", "achttien", "negentien", "twintig"];

/* 6 -> "zes", 25 -> "25" */
export const countWord = (n: number): string => WORDS[n] ?? String(n);
export const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const pers = (k: number) => `${k} ${k === 1 ? "persoon" : "personen"}`;

/* Een datum is te kiezen als hij niet vol is. */
export const selectable = (s: SessionView) => s.stand !== "vol" && s.free > 0;

/* "za 21 nov, 15:00 tot 18:00" */
export const sessionTitle = (s: SessionView) => `${s.day}, ${s.range}`;
/* "za 21 nov, 15:00" */
export const sessionStart = (s: SessionView) => `${s.day}, ${s.start}`;
/* Beslismoment, of (zonder vastgelegd beslismoment) de start zelf. */
export const sessionCut = (s: SessionView) => s.decisionLabel ?? sessionStart(s);

/* Teksten op een datumtegel. */
export function tileParts(s: SessionView) {
  const [num = "", month = ""] = dateShort(s.startsAt).split(" ");
  let small: string;
  if (s.stand === "vol") small = `${s.taken} van ${s.capacity}`;
  else if (s.stand === "geenmin") small = `geen minimum, nog ${s.free}`;
  else if (s.stand === "open" && s.decisionAt) small = `beslismoment ${weekdayShort(s.decisionAt)} ${time(s.decisionAt)}`;
  else small = `nog ${plekken(s.free)}`;
  return { weekday: weekdayShort(s.startsAt), num, month: `${month}, ${s.start}`, small };
}

/* Optie in de datumkeuze van het formulier. */
export function optionLabel(s: SessionView): string {
  const stand = s.stand === "vol" ? "vol" : s.stand === "open" ? s.label : "gaat door";
  return `${sessionStart(s)} (${stand})`;
}

/* Vaste dag en tijd als alle datums die delen: { weekday: "zaterdag", start, end }. */
export function commonSlot(sessions: SessionView[]): { weekday: string; start: string; end: string | null } | null {
  const first = sessions[0];
  if (!first) return null;
  const wd = (s: SessionView) => dayLong(s.startsAt).split(" ")[0] ?? "";
  const end = (s: SessionView) => (s.endsAt ? time(s.endsAt) : null);
  const same = sessions.every((s) => wd(s) === wd(first) && s.start === first.start && end(s) === end(first));
  return same ? { weekday: wd(first), start: first.start, end: end(first) } : null;
}

/* Meest voorkomende waarde (voor "bij de meeste datums vanaf vier"). */
function mode(values: number[]): number | null {
  const counts = new Map<number, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best: number | null = null;
  let bestN = 0;
  for (const [v, n] of counts) if (n > bestN) [best, bestN] = [v, n];
  return best;
}

/* Inleiding boven de datumtegels, afgeleid van de datums zelf. */
export function sessionsIntro(sessions: SessionView[]): string {
  const n = sessions.length;
  const slot = commonSlot(sessions);
  const parts: string[] = [];
  const when = slot ? `, steeds op ${slot.weekday} van ${slot.start}${slot.end ? ` tot ${slot.end}` : ""}` : "";
  parts.push(n === 1 ? `De enige komende datum${slot ? ` is op ${slot.weekday} van ${slot.start}${slot.end ? ` tot ${slot.end}` : ""}` : ""}.` : `Alle ${countWord(n)} komende datums${when}.`);

  const mins = sessions.map((s) => s.min).filter((m): m is number => m != null);
  if (mins.length) {
    const m = mode(mins)!;
    const all = mins.length === n && mins.every((x) => x === m);
    parts.push(`Per datum staat wanneer hij doorgaat, ${all ? "" : "bij de meeste datums "}vanaf ${countWord(m)} ${m === 1 ? "aanmelding" : "aanmeldingen"}.`);
  }
  const cap = sessions[0]?.capacity;
  if (cap && sessions.every((s) => s.capacity === cap)) parts.push(`Bij ${countWord(cap)} is hij vol.`);

  const withCut = sessions.filter((s) => s.decisionAt);
  if (withCut.length) {
    const rel = withCut.map((s) => {
      const d = new Date(`${s.isoDay}T12:00:00Z`).getTime() - new Date(`${dayIso(s.decisionAt!)}T12:00:00Z`).getTime();
      return { days: Math.round(d / 86400000), wd: dayLong(s.decisionAt!).split(" ")[0] ?? "", t: time(s.decisionAt!) };
    });
    const f = rel[0]!;
    const same = rel.every((r) => r.days === f.days && r.t === f.t);
    if (same && f.days === 1) {
      const wdSame = rel.every((r) => r.wd === f.wd);
      parts.push(`Uiterlijk op het beslismoment, de ${wdSame ? f.wd : "dag"} ervoor om ${f.t}, weet je of hij doorgaat.`);
    } else {
      parts.push("Uiterlijk op het beslismoment weet je of hij doorgaat.");
    }
  }
  return parts.join(" ");
}

const ISO = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Europe/Amsterdam" });
const dayIso = (iso: string) => ISO.format(new Date(iso));

/* Woorden die afhangen van de categorie: het ontwerp is een kookworkshop. */
export function verbs(categorySlug: string | null | undefined) {
  const cooking = categorySlug === "koken-en-bakken";
  return {
    cooking,
    /* "Je kookt bij Luca" */
    atHost: cooking ? "Je kookt bij" : "Je workshop is bij",
    /* "Koken bij Luca in Wittevrouwen" */
    doing: cooking ? "Koken bij" : "Bij",
    /* "kookte mee" */
    joined: cooking ? "kookte mee" : "deed mee",
    /* "een kookworkshop die past" */
    kind: cooking ? "kookworkshop" : "workshop",
    /* "Met tien of meer collega's koken?" */
    team: cooking ? "koken" : "een workshop doen",
  };
}
