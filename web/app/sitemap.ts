import type { MetadataRoute } from "next";
import { getCategories, getProviderSlugs, getWorkshopCards } from "@/lib/voorkant/data";
import { routes } from "@/lib/routes";
import { abs } from "@/lib/voorkant/seo";

export const revalidate = 3600;

/* Vaste pagina's, workshops, aanbieders en de combinaties plaats/categorie
   waar echt workshops zijn. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cards, categories, providers] = await Promise.all([getWorkshopCards({ limit: 1000 }), getCategories(), getProviderSlugs()]);
  const now = new Date();
  const fixed = [routes.home, routes.giver, routes.room, routes.help, routes.contact].map((path) => ({
    url: abs(path),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === routes.home ? 1 : 0.6,
  }));
  const combos = new Set<string>();
  for (const w of cards) {
    if (!w.category) continue;
    combos.add(routes.category(w.category.slug));
    if (w.city) combos.add(routes.category(w.category.slug, w.city.slug));
  }
  const known = new Set(categories.map((c) => c.slug));
  return [
    ...fixed,
    ...[...combos].filter((p) => known.has(p.split("/")[2] ?? "")).map((path) => ({ url: abs(path), changeFrequency: "daily" as const, priority: 0.8 })),
    ...cards.map((w) => ({ url: abs(routes.workshop(w.slug)), changeFrequency: "daily" as const, priority: 0.9 })),
    ...providers.map((slug) => ({ url: abs(routes.provider(slug)), changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
