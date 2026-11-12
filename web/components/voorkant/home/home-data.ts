import "server-only";

import {
  flattenSessions,
  getActiveCities,
  getCategories,
  getReviews,
  getWorkshopCards,
  type SessionWithWorkshop,
  type WorkshopCard,
} from "@/lib/voorkant/data";
import { isoDay } from "@/lib/voorkant/format";
import type { SearchItem } from "./HeroSearch";

/* Alles wat de homepage uit Directus nodig heeft, in een keer. */

/* "2026-11-12" + n dagen */
export function addDays(day: string, n: number): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/* 0 = zondag ... 6 = zaterdag */
export const dow = (day: string) => new Date(`${day}T12:00:00Z`).getUTCDay();

/* Vrijdag tot en met zondag van het komende (of lopende) weekend. */
export function weekendRange(today: string): { from: string; to: string } {
  const d = dow(today);
  const offset = d === 0 ? -2 : d === 6 ? -1 : 5 - d;
  const from = addDays(today, offset);
  return { from, to: addDays(from, 2) };
}

/* Uitgelicht eerst; anders best beoordeeld. Workshops met een komende datum
   gaan voor, want de kaart laat de eerstvolgende datum zien. */
function showcase(cards: WorkshopCard[], n: number): WorkshopCard[] {
  const featured = cards.filter((c) => c.featured);
  const pool = featured.length ? featured : cards;
  return [...pool]
    .sort(
      (a, b) =>
        Number(b.sessions.length > 0) - Number(a.sessions.length > 0) ||
        (b.rating ?? 0) - (a.rating ?? 0) ||
        b.ratingCount - a.ratingCount ||
        a.title.localeCompare(b.title, "nl"),
    )
    .slice(0, n);
}

export async function getHomeData() {
  const [cards, categories, cities, reviews] = await Promise.all([
    getWorkshopCards({ limit: 500 }),
    getCategories(),
    getActiveCities(),
    getReviews({ limit: 12 }),
  ]);

  const today = isoDay(new Date().toISOString());
  const weekend = weekendRange(today);
  const stripTo = addDays(today, 5);

  const nextMonth = (() => {
    const d = new Date(`${today.slice(0, 7)}-01T12:00:00Z`);
    d.setUTCMonth(d.getUTCMonth() + 1);
    return d.toISOString().slice(0, 7);
  })();

  /* Compacte lijst voor de teller in de zoekbalk (client). */
  const search: SearchItem[] = cards.map((c) => {
    const days = c.sessions.map((s) => s.isoDay);
    return {
      c: c.category?.slug ?? "",
      p: c.city?.slug ?? "",
      price: c.price,
      weekend: days.some((d) => d >= weekend.from && d <= weekend.to),
      week: days.some((d) => dow(d) >= 1 && dow(d) <= 5),
      maand: days.some((d) => d.startsWith(nextMonth)),
    };
  });

  const weekendSessions: SessionWithWorkshop[] = flattenSessions(cards, today, weekend.to).filter((s) => s.isoDay >= weekend.from);
  const stripSessions = flattenSessions(cards, today, stripTo);

  const countByCategory = new Map<string, number>();
  for (const c of cards) {
    if (c.category) countByCategory.set(c.category.slug, (countByCategory.get(c.category.slug) ?? 0) + 1);
  }

  return {
    cards,
    total: cards.length,
    showcase: showcase(cards, 5),
    categories: categories.map((c) => ({ ...c, count: c.count ?? countByCategory.get(c.slug) ?? 0 })),
    cities,
    reviews,
    today,
    weekend,
    weekendSessions,
    stripDays: Array.from({ length: 6 }, (_, i) => {
      const day = addDays(today, i);
      return { day, count: stripSessions.filter((s) => s.isoDay === day).length };
    }),
    search,
  };
}

export type HomeData = Awaited<ReturnType<typeof getHomeData>>;
