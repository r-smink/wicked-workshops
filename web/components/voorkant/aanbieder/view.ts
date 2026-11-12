import type { ReviewView, SessionView, WorkshopCard } from "@/lib/voorkant/data";
import { dateShort, dayLong, dayShort, euro, plekken, rating, standAttr, weekStart } from "@/lib/voorkant/format";
import { routes } from "@/lib/routes";

/* Bouwt de getoonde teksten van de aanbiederpagina op de server, zodat de
   client-componenten (agenda, reviews) alleen nog filteren en server en
   browser precies dezelfde tekst tonen (geen tijdzoneverschil). */

const WORDS = ["nul", "één", "twee", "drie", "vier", "vijf", "zes", "zeven", "acht", "negen", "tien", "elf", "twaalf", "dertien", "veertien", "vijftien", "zestien", "zeventien", "achttien", "negentien", "twintig"];
export const word = (n: number) => WORDS[n] ?? String(n);
export const cap = (s: string) => (s ? s[0]!.toUpperCase() + s.slice(1) : s);

/* "a, b en c" / "a, b of c" */
export function listJoin(items: string[], last = "en"): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} ${last} ${items[items.length - 1]}`;
}

/* Stippen per plek: v = aangemeld, n = nog nodig voor het minimum, leeg = vrij. */
export type Dot = "v" | "n" | "";
export function seatDots(s: Pick<SessionView, "capacity" | "taken" | "min" | "stand">): Dot[] {
  const cap = Math.max(s.capacity, s.taken);
  /* Alleen bij "open" zijn er plekken die nog nodig zijn voor het minimum. */
  const needed = s.stand === "open" && s.min ? Math.max(0, s.min - s.taken) : 0;
  return Array.from({ length: cap }, (_, i) => (i < s.taken ? "v" : i < s.taken + needed ? "n" : ""));
}

export type Badge = { kind: "door" | "open" | "vol"; label: string };
export function badgeOf(s: SessionView): Badge {
  const kind = standAttr(s.stand);
  return { kind: kind === "nietdoor" ? "open" : kind, label: s.label };
}

const pp = (price: number | null) => (price != null ? `€${euro(price)} p.p.` : null);

/* ------------------------------------------------------------ kaarten */

export type CardModel = {
  id: string;
  href: string;
  title: string;
  image: string;
  imageAlt: string;
  rating: string | null;
  ratingCount: number;
  duration: string;
  price: string | null;
  next: null | { when: string; badge: Badge; dots: Dot[]; dotsLabel: string; note: string };
};

const andere = (n: number) => (n === 0 ? "" : ` Nog ${n} andere ${n === 1 ? "datum" : "datums"}.`);

export function cardModel(w: WorkshopCard): CardModel {
  const s = w.sessions[0];
  let next: CardModel["next"] = null;
  if (s) {
    const rest = w.sessions.length - 1;
    const dotsLabel =
      s.stand === "open"
        ? `${s.taken} aangemeld, ${(s.min ?? 0) - s.taken} nodig voor het minimum, ${plekken(s.capacity)}`
        : s.stand === "door" && s.min && s.taken >= s.min
          ? `${s.taken} aangemeld, minimum gehaald, ${plekken(s.capacity)}`
          : `${s.taken} aangemeld, ${plekken(s.capacity)}`;
    const first =
      s.stand === "open" && s.decisionLabel
        ? `Beslismoment ${s.decisionLabel}.`
        : s.stand === "vol"
          ? "Deze datum is vol."
          : `Nog ${plekken(s.free)}.`;
    next = { when: `${s.day}, ${s.start}`, badge: badgeOf(s), dots: seatDots(s), dotsLabel, note: `${first}${andere(rest)}` };
  }
  return {
    id: w.id,
    href: routes.workshop(w.slug),
    title: w.title,
    image: w.image,
    imageAlt: w.imageAlt,
    rating: w.rating != null && w.ratingCount > 0 ? rating(w.rating) : null,
    ratingCount: w.ratingCount,
    duration: w.duration,
    price: pp(w.price),
    next,
  };
}

/* ------------------------------------------------------------ agenda */

export type AgendaItem = {
  id: string;
  ws: string;
  stand: "open" | "door" | "vol";
  r: string;
  c: string;
  href: string;
  aria: string;
  day: string;
  range: string;
  name: string;
  badge: Badge;
  dots: Dot[];
  small: string;
};

export type AgendaWeek = {
  key: string;
  c: string;
  title: string;
  current: boolean;
  items: AgendaItem[];
  empties: { r: string; c: string }[];
};

export type AgendaRow = { ws: string; r: string; href: string; title: string; meta: string; rating: string | null };

export type AgendaModel = {
  intro: string;
  weeks: AgendaWeek[];
  rows: AgendaRow[];
  rowCount: number;
  counts: { alle: number; door: number; open: number; vol: number };
  later: boolean;
};

const MAX_WEEKS = 6;

const addDays = (isoDate: string, days: number) => {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

function itemTexts(s: SessionView, name: string) {
  const free = `${s.taken} aangemeld, ${s.free} plekken vrij.`;
  const decision = s.decisionLabel ? ` Beslismoment ${s.decisionLabel}.` : "";
  const base = `${name}, ${dayLong(s.startsAt)}, ${s.range}.`;
  switch (s.stand) {
    case "open":
      return {
        aria: `${base} Gaat door bij ${s.min} aanmeldingen, nu ${s.taken} van ${s.min}. ${free}${decision}`,
        small: s.decisionLabel ? `Beslismoment ${s.decisionLabel}` : `${s.taken} aangemeld, nog ${plekken(s.free)}`,
      };
    case "vol":
      return { aria: `${base} Vol. ${free}`, small: `${s.taken} van ${plekken(s.capacity)} bezet` };
    case "geenmin":
      return { aria: `${base} Gaat door, geen minimum. ${free}`, small: `Geen minimum, nog ${plekken(s.free)}` };
    default:
      return { aria: `${base} Gaat door. ${free}`, small: `${s.taken} aangemeld, nog ${plekken(s.free)}` };
  }
}

export function agendaModel(cards: WorkshopCard[], now = new Date().toISOString()): AgendaModel | null {
  const all = cards.flatMap((w) => w.sessions.map((s) => ({ s, w }))).sort((a, b) => a.s.startsAt.localeCompare(b.s.startsAt));
  if (!all.length) return null;

  const firstWeek = weekStart(all[0]!.s.startsAt);
  const windowEnd = addDays(firstWeek, MAX_WEEKS * 7);
  const inWindow = all.filter(({ s }) => s.isoDay < windowEnd);
  const later = inWindow.length < all.length;
  const lastWeek = weekStart(inWindow[inWindow.length - 1]!.s.startsAt);
  const weekKeys: string[] = [];
  for (let k = firstWeek; k <= lastWeek; k = addDays(k, 7)) weekKeys.push(k);
  const thisWeek = weekStart(now);

  /* Per workshop zoveel subrijen als datums in de drukste week. */
  const perCell = new Map<string, number>();
  for (const { s, w } of inWindow) {
    const key = `${w.id}|${weekStart(s.startsAt)}`;
    perCell.set(key, (perCell.get(key) ?? 0) + 1);
  }
  const used = cards.filter((w) => inWindow.some((x) => x.w.id === w.id));
  let nextRow = 2;
  const rowOf = new Map<string, { start: number; span: number }>();
  for (const w of used) {
    const span = Math.max(1, ...weekKeys.map((k) => perCell.get(`${w.id}|${k}`) ?? 0));
    rowOf.set(w.id, { start: nextRow, span });
    nextRow += span;
  }
  const gridRow = (start: number, span: number) => (span > 1 ? `${start} / span ${span}` : String(start));

  const rows: AgendaRow[] = used.map((w) => {
    const pos = rowOf.get(w.id)!;
    return {
      ws: w.slug,
      r: gridRow(pos.start, pos.span),
      href: routes.workshop(w.slug),
      title: w.title,
      meta: [w.duration, pp(w.price)].filter(Boolean).join(", "),
      rating: w.rating != null && w.ratingCount > 0 ? `${rating(w.rating)} uit ${w.ratingCount}` : null,
    };
  });

  const weeks: AgendaWeek[] = weekKeys.map((key, i) => {
    const c = String(i + 2);
    const filled = new Map<string, number>();
    const items: AgendaItem[] = inWindow
      .filter(({ s }) => weekStart(s.startsAt) === key)
      .map(({ s, w }) => {
        const pos = rowOf.get(w.id)!;
        const n = filled.get(w.id) ?? 0;
        filled.set(w.id, n + 1);
        const t = itemTexts(s, w.title);
        const badge = badgeOf(s);
        return {
          id: s.id,
          ws: w.slug,
          stand: badge.kind,
          r: String(pos.start + n),
          c,
          href: routes.workshop(w.slug),
          aria: t.aria,
          day: s.day,
          range: s.range,
          name: w.title,
          badge,
          dots: seatDots(s),
          small: t.small,
        };
      });
    const empties = used.flatMap((w) => {
      const pos = rowOf.get(w.id)!;
      const n = filled.get(w.id) ?? 0;
      return n >= pos.span ? [] : [{ r: gridRow(pos.start + n, pos.span - n), c }];
    });
    return { key, c, title: `Week van ${dateShort(`${key}T12:00:00Z`)}`, current: key === thisWeek, items, empties };
  });

  const items = weeks.flatMap((w) => w.items);
  const counts = {
    alle: items.length,
    door: items.filter((x) => x.stand === "door").length,
    open: items.filter((x) => x.stand === "open").length,
    vol: items.filter((x) => x.stand === "vol").length,
  };

  /* "Elf datums in zes weken, van za 14 nov tot za 19 dec. Drie gaan door, ..." */
  const total = counts.alle;
  const firstDay = inWindow[0]!.s.day;
  const lastDay = inWindow[inWindow.length - 1]!.s.day;
  const s1 =
    total === 1
      ? `Eén datum, op ${firstDay}.`
      : `${cap(word(total))} datums in ${word(weekKeys.length)} ${weekKeys.length === 1 ? "week" : "weken"}, van ${firstDay} tot ${lastDay}.`;
  const parts = [
    counts.door ? `${word(counts.door)} ${counts.door === 1 ? "gaat" : "gaan"} door` : "",
    counts.open ? `${word(counts.open)} ${counts.open === 1 ? "heeft" : "hebben"} nog aanmeldingen nodig` : "",
    counts.vol ? `${word(counts.vol)} ${counts.vol === 1 ? "is" : "zijn"} vol` : "",
  ].filter(Boolean);
  const s2 = parts.length ? ` ${cap(listJoin(parts))}.` : "";
  const mins = inWindow.map(({ s }) => s.min).filter((m): m is number => Boolean(m));
  let s3 = " Per datum staat wanneer hij doorgaat.";
  if (mins.length) {
    const freq = new Map<number, number>();
    for (const m of mins) freq.set(m, (freq.get(m) ?? 0) + 1);
    const [mode, modeCount] = [...freq.entries()].sort((a, b) => b[1] - a[1])[0]!;
    const unit = mode === 1 ? "aanmelding" : "aanmeldingen";
    if (modeCount === total) s3 = ` Per datum staat wanneer hij doorgaat, bij elke datum vanaf ${word(mode)} ${unit}.`;
    else if (modeCount * 2 > total) s3 = ` Per datum staat wanneer hij doorgaat, bij de meeste datums vanaf ${word(mode)} ${unit}.`;
  }

  return { intro: `${s1}${s2}${s3}`, weeks, rows, rowCount: nextRow - 2, counts, later };
}

/* ------------------------------------------------------------ reviews */

export type ReviewItem = { id: string; ws: string; stars: string; body: string; initials: string; author: string; meta: string };
export type ReviewChip = { ws: string; label: string; count: number };
export type ReviewsModel = {
  total: number;
  average: string;
  stars: string;
  distribution: { stars: number; count: number; width: string }[];
  chips: ReviewChip[];
  items: ReviewItem[];
};

const starString = (n: number) => "★".repeat(Math.max(0, Math.min(5, Math.round(n))));

export function reviewsModel(
  ratings: { rating: number; workshopSlug: string | null }[],
  reviews: ReviewView[],
  cards: WorkshopCard[],
): ReviewsModel | null {
  const total = ratings.length;
  if (!total) return null;
  const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / total;
  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = ratings.filter((r) => Math.round(r.rating) === stars).length;
    const pct = (count / total) * 100;
    return { stars, count, width: `${Number(pct.toFixed(1))}%` };
  });
  const perWs = new Map<string, number>();
  for (const r of ratings) if (r.workshopSlug) perWs.set(r.workshopSlug, (perWs.get(r.workshopSlug) ?? 0) + 1);
  const titles = new Map(cards.map((w) => [w.slug, w.title]));
  for (const r of reviews) if (r.workshop && !titles.has(r.workshop.slug)) titles.set(r.workshop.slug, r.workshop.title);
  const order = [...cards.map((w) => w.slug), ...[...perWs.keys()].filter((k) => !cards.some((w) => w.slug === k))];
  const chips: ReviewChip[] = [
    { ws: "alle", label: "Alle", count: total },
    ...order.filter((k) => perWs.get(k)).map((k) => ({ ws: k, label: titles.get(k) ?? k, count: perWs.get(k)! })),
  ];
  const items: ReviewItem[] = reviews.map((r) => ({
    id: r.id,
    ws: r.workshop?.slug ?? "",
    stars: starString(r.rating),
    body: `“${r.body.trim()}”`,
    initials: r.initials,
    author: r.author,
    meta: [r.workshop?.title, r.date ? dayShort(r.date) : null].filter(Boolean).join(", "),
  }));
  return { total, average: rating(avg), stars: starString(avg), distribution, chips, items };
}
