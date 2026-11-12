import "server-only";

import { readItems } from "@directus/sdk";
import { publicClient } from "@/lib/directus/client";
import {
  flattenSessions,
  type SessionView,
  type WorkshopCard,
} from "@/lib/voorkant/data";
import {
  dateLong,
  dayLong,
  euro,
  isoDay,
  plekken,
  rating,
  standAttr,
  time,
  weekdayShort,
  weekStart,
} from "@/lib/voorkant/format";
import { routes } from "@/lib/routes";
import {
  CHEAP_BELOW,
  EVENING_FROM_HOUR,
  SMALL_GROUP_MAX,
  type Nouns,
} from "./labels";
import type {
  CalendarView,
  DayView,
  FilterKey,
  OfferView,
  RowView,
  SlotView,
} from "./types";

/* Bouwt de gegevens voor de filterbalk, tijdlijn en lijst van #p-cat uit
   getWorkshopCards. Alles hier is serialiseerbaar voor de client. */

/* Workshops waarbij een vegetarische dieetoptie hoort (dietary_options, een
   publiek veld van workshops). Lukt het niet, dan een lege set: de chip
   "Vegetarisch kan" toont dan (0). */
export async function vegetarianWorkshopIds(
  ids: string[],
): Promise<Set<string>> {
  if (!ids.length || !process.env.DIRECTUS_URL) return new Set();
  try {
    const rows = (await publicClient({
      revalidate: 300,
      tags: ["directus"],
    }).request(
      readItems("workshops", {
        fields: ["id", "dietary_options.dietary_option_id.slug"],
        filter: { id: { _in: ids } },
        limit: -1,
      } as never),
    )) as unknown as {
      id: string;
      dietary_options:
        | (
            | { dietary_option_id: { slug: string | null } | string | null }
            | number
            | null
          )[]
        | null;
    }[];
    const veg = new Set<string>();
    for (const w of rows) {
      const slugs = (w.dietary_options ?? []).map((d) =>
        d &&
        typeof d === "object" &&
        d.dietary_option_id &&
        typeof d.dietary_option_id === "object"
          ? (d.dietary_option_id.slug ?? "")
          : "",
      );
      if (slugs.some((s) => /vegetar|vegan|plantaardig/i.test(s)))
        veg.add(w.id);
    }
    return veg;
  } catch (err) {
    console.error(
      "Directus (dieetopties) mislukt:",
      err instanceof Error ? err.message : err,
    );
    return new Set();
  }
}

const DAY_MS = 86_400_000;
const addDays = (iso: string, n: number) =>
  new Date(Date.parse(`${iso}T12:00:00Z`) + n * DAY_MS)
    .toISOString()
    .slice(0, 10);
const daysBetween = (a: string, b: string) =>
  Math.round(
    (Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / DAY_MS,
  );
const noon = (iso: string) => `${iso}T12:00:00Z`;
const MONTH = new Intl.DateTimeFormat("nl-NL", {
  month: "long",
  timeZone: "UTC",
});
const MONTH_SHORT = new Intl.DateTimeFormat("nl-NL", {
  month: "short",
  timeZone: "UTC",
});
const capFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function sessionKeys(
  s: SessionView,
  w: WorkshopCard,
  veg: boolean,
  nextMonth: string,
): FilterKey[] {
  const keys: FilterKey[] = [];
  const price = s.price ?? w.price;
  const group = s.capacity || w.max || null;
  if (s.stand === "door" || s.stand === "geenmin") keys.push("door");
  if (s.free > 0 && s.stand !== "vol") keys.push("plek");
  if (Number(time(s.startsAt).slice(0, 2)) >= EVENING_FROM_HOUR)
    keys.push("avond");
  if (["za", "zo"].includes(weekdayShort(s.startsAt))) keys.push("weekend");
  else keys.push("werkdag");
  if (s.isoDay.startsWith(nextMonth)) keys.push("volgendemaand");
  if (group != null && group <= SMALL_GROUP_MAX) keys.push("klein");
  if (price != null && price < CHEAP_BELOW) keys.push("onder50");
  if (veg) keys.push("veg");
  return keys;
}

function workshopKeys(w: WorkshopCard, veg: boolean): FilterKey[] {
  const keys: FilterKey[] = [];
  if (w.max != null && w.max <= SMALL_GROUP_MAX) keys.push("klein");
  if (w.price != null && w.price < CHEAP_BELOW) keys.push("onder50");
  if (veg) keys.push("veg");
  return keys;
}

function slotOf(
  s: SessionView,
  w: WorkshopCard,
  all: SessionView[],
  where: string,
  veg: boolean,
  nextMonth: string,
): SlotView {
  const stand = standAttr(s.stand);
  let sub: string | null = null;
  if (s.stand === "vol") {
    const next = all.find((o) => o.startsAt > s.startsAt && o.stand !== "vol");
    sub = next ? `volgende: ${next.day}` : null;
  } else if (s.stand === "open") {
    sub = s.decisionLabel ? `beslismoment ${s.decisionLabel}` : null;
  } else if (s.stand === "geenmin") {
    sub = s.free > 0 ? `nog ${plekken(s.free)}` : "geen minimum";
  } else {
    sub = `nog ${plekken(s.free)}`;
  }
  const price = s.price ?? w.price;
  return {
    id: s.id,
    href: routes.workshop(w.slug),
    isoDay: s.isoDay,
    day: s.day,
    start: s.start,
    title: w.title,
    where,
    stand: stand === "nietdoor" ? "open" : stand,
    label: s.label,
    sub,
    price: price != null ? euro(price) : null,
    keys: sessionKeys(s, w, veg, nextMonth),
  };
}

export function buildOffer(
  cards: WorkshopCard[],
  opts: {
    placeName: string;
    isNational: boolean;
    nouns: Nouns;
    listHeading: string;
    veg: Set<string>;
  },
  now = new Date(),
): OfferView {
  const today = isoDay(now.toISOString());
  const monday = weekStart(now.toISOString());
  const end1 = addDays(monday, 13);
  const end2 = addDays(monday, 20);
  /* "2026-12": de volgende kalendermaand. */
  const t = new Date(noon(today));
  const nextKey = new Date(
    Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 1, 12),
  )
    .toISOString()
    .slice(0, 7);

  const whereShort = (w: WorkshopCard) => {
    const spot = opts.isNational
      ? [w.city?.name, w.neighbourhood].filter(Boolean).join(", ")
      : w.neighbourhood || w.city?.name || "";
    return [spot, w.duration].filter(Boolean).join(" · ");
  };

  /* Tijdlijn: vandaag tot en met zondag van de week erna (week 0, 1 en 2). */
  const byDay = new Map<string, SlotView[]>();
  for (const s of flattenSessions(cards, today, end2)) {
    const slot = slotOf(
      s,
      s.workshop,
      s.workshop.sessions,
      whereShort(s.workshop),
      opts.veg.has(s.workshop.id),
      nextKey,
    );
    const list = byDay.get(s.isoDay) ?? [];
    list.push(slot);
    byDay.set(s.isoDay, list);
  }
  const days: DayView[] = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([d, slots]) => ({
      isoDay: d,
      weekday: weekdayShort(noon(d)),
      date: String(Number(d.slice(8, 10))),
      month: MONTH_SHORT.format(new Date(noon(d))).replace(/\./g, ""),
      week: Math.min(2, Math.floor(daysBetween(monday, d) / 7)) as 0 | 1 | 2,
      slots,
    }));

  /* Lijst: elke workshop, de eerstvolgende datum bovenaan. */
  const rows: RowView[] = [...cards]
    .sort((a, b) => {
      const x = a.sessions[0]?.startsAt;
      const y = b.sessions[0]?.startsAt;
      if (x && y) return x.localeCompare(y);
      if (x) return -1;
      if (y) return 1;
      return a.title.localeCompare(b.title, "nl");
    })
    .map((w) => {
      const veg = opts.veg.has(w.id);
      const where = [
        [w.city?.name, w.neighbourhood].filter(Boolean).join(", "),
        w.duration,
      ]
        .filter(Boolean)
        .join(" · ");
      return {
        id: w.id,
        href: routes.workshop(w.slug),
        title: w.title,
        image: w.image,
        imageAlt: w.imageAlt,
        where,
        rating: w.rating != null && w.ratingCount > 0 ? rating(w.rating) : null,
        ratingCount: w.ratingCount,
        price: w.price != null ? euro(w.price) : null,
        slots: w.sessions
          .slice(0, 3)
          .map((s) => slotOf(s, w, w.sessions, "", veg, nextKey)),
        more: Math.max(0, w.sessions.length - 3),
        keySets: w.sessions.length
          ? w.sessions.map((s) => sessionKeys(s, w, veg, nextKey))
          : [workshopKeys(w, veg)],
      };
    });

  /* Kalender van de huidige maand. */
  const first = `${today.slice(0, 8)}01`;
  const firstDate = new Date(noon(first));
  const daysInMonth = new Date(
    Date.UTC(firstDate.getUTCFullYear(), firstDate.getUTCMonth() + 1, 0),
  ).getUTCDate();
  const nextMonth = new Date(
    Date.UTC(firstDate.getUTCFullYear(), firstDate.getUTCMonth() + 1, 1, 12),
  );
  const calendar: CalendarView = {
    title: `${capFirst(MONTH.format(firstDate))} ${firstDate.getUTCFullYear()}`,
    nextMonth: capFirst(MONTH.format(nextMonth)),
    blanks: (firstDate.getUTCDay() + 6) % 7,
    days: Array.from({ length: daysInMonth }, (_, i) => {
      const d = addDays(first, i);
      const count = byDay.get(d)?.length ?? 0;
      const kind =
        d < today
          ? "voorbij"
          : d === today
            ? "vandaag"
            : count
              ? "met"
              : "leeg";
      return {
        date: i + 1,
        kind,
        count,
        isoDay: d,
        linked: d >= today && count > 0,
        later: d > end1,
      };
    }),
  };

  const startLabel = dayLong(noon(today));
  const endLabel = dayLong(noon(end1));
  const sameMonth = today.slice(0, 7) === end1.slice(0, 7);
  return {
    placeName: opts.placeName,
    singular: opts.nouns.singular,
    plural: opts.nouns.plural,
    listHeading: opts.listHeading,
    range: `Van ${sameMonth ? startLabel.replace(/\s+\S+$/, "") : startLabel} tot en met ${endLabel}`,
    until: `Tot en met ${endLabel}`,
    untilLater: `Tot en met ${dayLong(noon(end2))}`,
    laterLabel: `Week van ${dateLong(noon(addDays(monday, 14)))}`,
    calendar,
    days,
    rows,
  };
}

/* Gemiddelde beoordeling over alle reviews, gewogen naar aantal. */
export function ratingSummary(
  cards: WorkshopCard[],
): { avg: string; count: number } | null {
  let sum = 0;
  let count = 0;
  for (const w of cards) {
    if (w.rating == null || !w.ratingCount) continue;
    sum += w.rating * w.ratingCount;
    count += w.ratingCount;
  }
  return count ? { avg: rating(sum / count), count } : null;
}
