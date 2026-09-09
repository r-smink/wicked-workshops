/* ===========================================================================
   Directus-koppeling (klaar voor gebruik, nog niet actief in het prototype).

   Leest DIRECTUS_URL en DIRECTUS_STATIC_TOKEN uit de omgeving. Zodra die
   staan (Vercel > Settings > Environment Variables), bevragen de functies
   hieronder de Directus REST API. Zolang ze ontbreken, vallen ze terug op de
   mock-data uit lib/mock-data.js, zodat het prototype blijft werken.

   De functies zijn server-side bedoeld (geen NEXT_PUBLIC_-vars), en worden
   aangeroepen vanuit de server-component routes onder app/. De resultaten
   geven we als props door aan de client-component pagina's.
   =========================================================================== */

import {
  CATEGORIES, FEATURED, LISTING, SESSIONS, REVIEWS, FAQ,
  MARCO_WORKSHOPS, MARCO_REVIEWS, ARTICLES, ART_SECTIONS, ART_FAQ,
  MARCO_PROFILE, DASH_SESSIONS, DASH_BOOKINGS, DASH_WORKSHOPS,
  DASH_NAV, DASH_TITLES,
} from "@/lib/mock-data";

// Re-exports voor routes die de dashboard-structuur nodig hebben zonder
// Directus-afhankelijk te zijn (zoals de wizard- en profiel-routes).
export { DASH_NAV, DASH_TITLES };

const DIRECTUS_URL = process.env.DIRECTUS_URL || "";
const DIRECTUS_TOKEN = process.env.DIRECTUS_STATIC_TOKEN || "";

export const isDirectusConfigured = Boolean(DIRECTUS_URL && DIRECTUS_TOKEN);

/* Basisfetch naar de Directus REST API. Gooit bij een netwerk- of HTTP-fout
   een Error, zodat de route die kan opvangen. */
async function directusFetch(path) {
  if (!isDirectusConfigured) return null;
  const url = `${DIRECTUS_URL.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, {
    headers: DIRECTUS_TOKEN ? { Authorization: `Bearer ${DIRECTUS_TOKEN}` } : {},
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Directus ${res.status} voor ${path}`);
  const json = await res.json();
  return json.data;
}

/* ---------- Homepage ---------- */
export async function getCategories() {
  const data = await directusFetch("/items/categories?fields=*");
  return data || CATEGORIES;
}

export async function getFeatured() {
  const data = await directusFetch("/items/workshops?filter[featured]=true&limit=4");
  return data || FEATURED;
}

/* ---------- Aanbod / listing ---------- */
export async function getListing() {
  const data = await directusFetch("/items/workshops?limit=24");
  return data || LISTING;
}

export async function getCategory(slug) {
  const data = await directusFetch(`/items/categories?filter[slug]=${slug}&single`);
  return data || CATEGORIES.find((c) => c.slug === slug) || CATEGORIES[0];
}

/* ---------- Workshopdetail ---------- */
export async function getWorkshop(slug) {
  const data = await directusFetch(`/items/workshops?filter[slug]=${slug}&single`);
  if (data) return data;
  return (
    FEATURED.find((w) => w.slug === slug) ||
    LISTING.find((w) => w.slug === slug) ||
    FEATURED[0]
  );
}

export async function getSessions(workshopId) {
  const data = await directusFetch(`/items/workshop_sessions?filter[workshop]=${workshopId}`);
  return data || SESSIONS;
}

export async function getReviews(workshopId) {
  const data = await directusFetch(`/items/reviews?filter[workshop]=${workshopId}&limit=4`);
  return data || REVIEWS;
}

export async function getFaq(workshopId) {
  const data = await directusFetch(`/items/workshop_faq?filter[workshop]=${workshopId}`);
  return data || FAQ;
}

/* ---------- Aanbiederprofiel ---------- */
export async function getProvider(slug) {
  const data = await directusFetch(`/items/providers?filter[slug]=${slug}&single`);
  return data || { slug: slug || "marco-rossi", display_name: "Marco Rossi" };
}

export async function getProviderWorkshops(providerId) {
  const data = await directusFetch(`/items/workshops?filter[provider]=${providerId}`);
  return data || MARCO_WORKSHOPS;
}

export async function getProviderReviews(providerId) {
  const data = await directusFetch(`/items/reviews?filter[provider]=${providerId}&limit=4`);
  return data || MARCO_REVIEWS;
}

/* ---------- Blog ---------- */
export async function getArticles() {
  const data = await directusFetch("/items/articles?limit=20");
  return data || ARTICLES;
}

export async function getArticle(slug) {
  const data = await directusFetch(`/items/articles?filter[slug]=${slug}&single`);
  return data || ARTICLES.find((a) => a.slug === slug) || ARTICLES[0];
}

export async function getArticleSections() {
  return ART_SECTIONS;
}

export async function getArticleFaq() {
  return ART_FAQ;
}

/* ---------- Dashboard ---------- */
export async function getDashboardSessions() {
  const data = await directusFetch("/items/workshop_sessions?limit=20");
  return data || DASH_SESSIONS;
}

export async function getDashboardBookings() {
  const data = await directusFetch("/items/bookings?limit=20");
  return data || DASH_BOOKINGS;
}

export async function getDashboardWorkshops() {
  const data = await directusFetch("/items/workshops?limit=20");
  return data || DASH_WORKSHOPS;
}

export async function getProviderProfile() {
  const data = await directusFetch("/items/providers?single");
  return data || MARCO_PROFILE;
}
