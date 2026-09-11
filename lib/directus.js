/* ===========================================================================
   Directus-koppeling.

   Leest DIRECTUS_URL en DIRECTUS_STATIC_TOKEN uit de omgeving. Zodra die
   staan (Vercel > Settings > Environment Variables), bevragen de functies
   hieronder de Directus REST API. Zolang ze ontbreken of een aanvraag faalt,
   vallen ze terug op de mock-data uit lib/mock-data.js, zodat het prototype
   altijd blijft werken.

   Directus gebruikt andere veldnamen dan de componenten verwachten
   (price_per_person vs price, duration_minutes vs duration, etc.). De
   map*-functies hieronder normaliseren Directus-records naar de vorm die de
   componenten gebruiken. Zo houden de componenten schoon en hoeven ze niet
   te weten of de data uit Directus of uit mock-data komt.

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

/* Basisfetch naar de Directus REST API. Bij een netwerk- of HTTP-fout
   retourneert null in plaats van te gooien, zodat de aanroeper kan
   terugvallen op mock-data. Een fout loggen is genoeg — een pagina die
   lege data toont is beter dan een pagina die crasht. */
async function directusFetch(path) {
  if (!isDirectusConfigured) return null;
  const url = `${DIRECTUS_URL.replace(/\/$/, "")}${path}`;
  try {
    const res = await fetch(url, {
      headers: DIRECTUS_TOKEN ? { Authorization: `Bearer ${DIRECTUS_TOKEN}` } : {},
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      console.error(`Directus ${res.status} voor ${path}`);
      return null;
    }
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error("Directus onbereikbaar:", err.message);
    return null;
  }
}

export function assetUrl(id) {
  if (!id) return "";
  return `${DIRECTUS_URL.replace(/\/$/, "")}/assets/${id}`;
}

/* Maak een nieuw record in een collectie. Gooit niet bij een fout, maar
   retourneert null, zodat de aanroeper een foutmelding kan tonen. */
export async function directusCreate(collection, body) {
  if (!isDirectusConfigured) return null;
  const url = `${DIRECTUS_URL.replace(/\/$/, "")}/items/${collection}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(DIRECTUS_TOKEN ? { Authorization: `Bearer ${DIRECTUS_TOKEN}` } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error(`Directus ${res.status} bij POST ${collection}`);
      return null;
    }
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error(`Directus POST ${collection} mislukt:`, err.message);
    return null;
  }
}

/* ===========================================================================
   Mapping-helpers: Directus-veldnamen → component-veldnamen
   =========================================================================== */

/* Directus gebruikt Material Icons-namen (restaurant, pottery, etc.), het
   prototype gebruikt eigen, kortere namen (fork, bowl, etc.). */
const ICON_MAP = {
  restaurant: "fork", pottery: "bowl", palette: "palette", local_bar: "glass",
  local_florist: "flower", handyman: "hammer", photo_camera: "camera",
  music_note: "music", spa: "spa", hiking: "hike", auto_awesome: "spark",
  recycling: "recycle",
};
function mapIcon(icon) {
  return ICON_MAP[icon] || icon || "spark";
}

/* 180 min → "3 uur", 150 min → "2,5 uur" */
function formatDuration(minutes) {
  if (!minutes) return "";
  const hours = minutes / 60;
  const str = Number.isInteger(hours) ? String(hours) : hours.toFixed(1).replace(".", ",");
  return `${str} uur`;
}

/* Relaties kunnen als UUID-string of als uitgeklapt object binnenkomen. */
function relName(rel, field = "name") {
  if (!rel) return "";
  if (typeof rel === "string") return rel;
  return rel[field] ?? "";
}

/* Workshop: Directus-record → vorm die componenten verwachten. */
function mapWorkshop(w) {
  if (!w || !w.slug) return w;
  const catIcon = relName(w.category, "icon");
  return {
    ...w,
    slug: w.slug,
    title: w.title,
    subtitle: w.subtitle ?? "",
    intro: w.intro ?? "",
    description: w.description ?? "",
    price: Number(w.price_per_person ?? w.price ?? 0),
    duration: w.duration || formatDuration(w.duration_minutes),
    rating: w.rating ?? (w.rating_avg != null ? Number(w.rating_avg) : null),
    count: w.count ?? w.rating_count ?? 0,
    area: w.area ?? w.neighbourhood ?? "",
    city: relName(w.city) || w.city || "",
    category: relName(w.category) || w.category || "",
    icon: w.icon ?? mapIcon(catIcon),
    badge: w.badge && w.badge !== "none" ? w.badge : undefined,
    lat: w.lat ?? w.provider?.lat ?? null,
    lng: w.lng ?? w.provider?.lng ?? null,
    inclusions: Array.isArray(w.inclusions) ? w.inclusions.map((i) => i.text || i).filter(Boolean) : [],
    media: Array.isArray(w.media)
      ? w.media
          .filter((m) => m && m.file)
          .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
          .map((m) => ({ url: assetUrl(m.file), alt: m.alt || "" }))
      : [],
    provider: w.provider || null,
    location_name: w.location_name || (w.location_inherits_provider ? w.provider?.location_name : null) || null,
    address: w.address || (w.location_inherits_provider ? w.provider?.address : null) || null,
  };
}

/* Category: Directus-record → vorm die componenten verwachten. */
function mapCategory(c) {
  if (!c || !c.slug) return c;
  return {
    ...c,
    name: c.name,
    slug: c.slug,
    icon: mapIcon(c.icon),
    count: c.count ?? (c.workshop_count != null ? `${c.workshop_count}+` : "0+"),
  };
}

/* Session: Directus-record (starts_at/ends_at) → { id, day, time, seats }. */
const DAY_FMT = new Intl.DateTimeFormat("nl-NL", { weekday: "long", day: "numeric", month: "long" });
function fmtTime(dateStr) {
  const d = new Date(dateStr);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function mapSession(s) {
  if (!s || !s.id) return s;
  const day = DAY_FMT.format(new Date(s.starts_at));
  return {
    id: s.id,
    day: day.charAt(0).toUpperCase() + day.slice(1),
    time: `${fmtTime(s.starts_at)} tot ${fmtTime(s.ends_at)}`,
    seats: (s.capacity ?? 0) - (s.seats_taken ?? 0),
  };
}

/* FAQ: Directus { question, answer } → [q, a] tuple. */
function mapFaq(f) {
  if (!f) return f;
  if (Array.isArray(f)) return f;
  return [f.question, f.answer];
}

/* Provider-workshop voor ProviderPage: { title, meta, rating, count, price, next, badge, icon }. */
function mapProviderWorkshop(w) {
  if (!w || !w.slug) return w;
  const mapped = mapWorkshop(w);
  return {
    title: mapped.title,
    meta: `${mapped.duration} · ${mapped.min_participants ?? 4} tot ${mapped.max_participants ?? 12} pers.`,
    rating: mapped.rating,
    count: mapped.count,
    price: mapped.price,
    next: mapped.next ?? "",
    badge: mapped.badge,
    icon: mapped.icon,
  };
}

/* Review: Directus-record → { name, when, body, ws? }. */
function mapReview(r) {
  if (!r) return r;
  const ws = relName(r.workshop, "title");
  return {
    name: r.name ?? "Deelnemer",
    when: r.when ?? (r.date_created ? new Date(r.date_created).toLocaleDateString("nl-NL", { month: "long", year: "numeric" }) : ""),
    body: r.body ?? r.text ?? "",
    ...(ws ? { ws } : {}),
  };
}

/* Provider: Directus-record → vorm die componenten verwachten. */
function mapProvider(p) {
  if (!p || !p.slug) return p;
  return {
    ...p,
    slug: p.slug,
    display_name: p.display_name,
    profession: p.profession ?? "",
    bio_short: p.bio_short ?? "",
    bio_long: p.bio_long ?? "",
    neighbourhood: p.neighbourhood ?? "",
    location_name: p.location_name ?? "",
    lat: p.lat, lng: p.lng,
    city: relName(p.city) || p.city || "",
    rating: p.rating_avg != null ? Number(p.rating_avg) : null,
    count: p.rating_count ?? 0,
  };
}

/* Dashboard sessies: korte dag + tijd, workshop-titel, bezetting/capaciteit. */
function mapDashSession(s) {
  if (!s || !s.id) return s;
  const d = new Date(s.starts_at);
  const date = d.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" });
  return {
    date,
    time: fmtTime(s.starts_at),
    ws: relName(s.workshop, "title") || "Workshop",
    booked: s.seats_taken ?? 0,
    cap: s.capacity ?? 0,
  };
}

/* Dashboard boekingen: code, gast, workshop, datum, aantal, totaal, status. */
function mapDashBooking(b) {
  if (!b) return b;
  const sessionDate = b.session?.starts_at
    ? new Date(b.session.starts_at).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" })
    : "";
  return {
    code: b.booking_code ?? "",
    name: b.guest_name ?? "",
    ws: relName(b.workshop, "title") || "",
    date: sessionDate,
    people: b.participants ?? 0,
    total: Number(b.total ?? 0),
    status: b.status ?? "pending",
  };
}

/* Dashboard workshops: compacte vorm met status badge en aantal sessies. */
function mapDashWorkshop(w) {
  if (!w || !w.slug) return w;
  const mapped = mapWorkshop(w);
  return {
    title: mapped.title,
    status: w.status === "published" ? "live" : w.status === "draft" ? "draft" : "paused",
    rating: mapped.rating,
    count: mapped.count,
    price: mapped.price,
    sessions: Array.isArray(w.sessions) ? w.sessions.length : 0,
    icon: mapped.icon,
  };
}

/* ===========================================================================
   Expliciete veldlijsten per collectie.

   We gebruiken nooit fields=* — dat laat Directus alle velden proberen
   op te halen, inclusief velden die in een display-template gerefereerd
   worden maar niet bestaan (bijv. "title" of "name" op providers, die
   "display_name" heet). Met expliciete velden voorkomen we die 403-fouten.
   =========================================================================== */
const WORKSHOP_FIELDS = [
  "id", "slug", "title", "subtitle", "intro", "description",
  "duration_minutes", "level", "min_participants", "max_participants",
  "format", "price_per_person", "price_from", "group_quote_from",
  "cancellation_policy", "instant_bookable", "giftcard_eligible",
  "location_inherits_provider", "location_name", "address", "postal_code",
  "neighbourhood", "lat", "lng", "address_visibility",
  "rating_avg", "rating_count", "rating_atmosphere", "rating_explanation",
  "rating_value", "participants_count", "badge", "featured", "age_rating",
  "city.name", "city.slug", "category.name", "category.slug", "category.icon",
  "inclusions.text", "inclusions.sort",
  "media.file", "media.alt", "media.sort",
  "provider.display_name", "provider.profession", "provider.slug",
  "provider.response_time_minutes", "provider.participants_count",
  "provider.verified", "provider.rating_avg", "provider.rating_count",
].join(",");

const CATEGORY_FIELDS = [
  "id", "name", "slug", "icon", "sort", "featured_in_menu",
  "workshop_count", "intro", "seo_title", "seo_description",
].join(",");

const PROVIDER_FIELDS = [
  "id", "slug", "display_name", "profession", "bio_short", "bio_long",
  "neighbourhood", "location_name", "address", "postal_code", "lat", "lng",
  "active_since", "verified", "accepts_groups", "max_group_size",
  "response_time_minutes", "rating_avg", "rating_count",
  "participants_count", "workshops_count", "is_top_rated",
  "kvk_number", "vat_number", "city.name",
].join(",");

const SESSION_FIELDS = [
  "id", "starts_at", "ends_at", "capacity", "seats_taken",
  "status", "price_override", "is_private",
].join(",");

const REVIEW_FIELDS = [
  "id", "rating", "text", "date_created",
  "workshop.title", "provider.display_name",
].join(",");

const FAQ_FIELDS = ["id", "question", "answer", "sort"].join(",");

const ARTICLE_FIELDS = [
  "id", "slug", "title", "excerpt", "short_answer", "body", "toc", "reading_time",
  "date_created", "category.name", "category.icon", "category.slug", "hero",
].join(",");

const ARTICLE_FAQ_FIELDS = ["id", "question", "answer", "sort"].join(",");

const DASH_SESSION_FIELDS = [
  "id", "starts_at", "ends_at", "capacity", "seats_taken", "status", "workshop.title",
].join(",");

const DASH_BOOKING_FIELDS = [
  "id", "booking_code", "guest_name", "participants", "total", "status",
  "session.starts_at", "workshop.title",
].join(",");

/* Genereert TOC-ankers uit h2/h3 in HTML-body, zodat "in dit artikel" werkt. */
function processArticleBody(html) {
  if (!html) return { body: html, sections: [] };
  const sections = [];
  let n = 1;
  const body = html.replace(/<(h[23])([^>]*)>([\s\S]*?)<\/\1>/g, (match, tag, attrs, content) => {
    const text = content.replace(/<[^>]+>/g, "").trim();
    const id = `s${n}`;
    sections.push({ id, n, h: text });
    n++;
    return `<${tag}${attrs} id="${id}">${content}</${tag}>`;
  });
  return { body, sections };
}

/* Article: Directus-record → vorm die componenten verwachten. */
function mapArticle(a) {
  if (!a || !a.slug) return a;
  const { body, sections } = processArticleBody(a.body);
  return {
    ...a,
    slug: a.slug.trim(),
    title: a.title,
    excerpt: a.excerpt ?? "",
    short_answer: a.short_answer ?? "",
    cat: relName(a.category) || "",
    date: a.date_created ? new Date(a.date_created).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" }) : "",
    read: a.reading_time ? `${a.reading_time} min lezen` : "",
    lead: a.lead ?? false,
    icon: mapIcon(relName(a.category, "icon")) || "spark",
    hero: a.hero ? assetUrl(a.hero) : null,
    body,
    sections,
  };
}

/* ===========================================================================
   Homepage
   =========================================================================== */
export async function getCategories() {
  const data = await directusFetch(`/items/categories?fields=${CATEGORY_FIELDS}&sort=sort&limit=20`);
  return data ? data.map(mapCategory) : CATEGORIES;
}

export async function getFeatured() {
  const data = await directusFetch(
    `/items/workshops?filter[featured]=true&limit=4&fields=${WORKSHOP_FIELDS}`
  );
  return data ? data.map(mapWorkshop) : FEATURED;
}

/* ---------- Aanbod / listing ---------- */
export async function getListing() {
  const data = await directusFetch(
    `/items/workshops?limit=24&fields=${WORKSHOP_FIELDS}`
  );
  return data ? data.map(mapWorkshop) : LISTING;
}

export async function getCategory(slug) {
  const data = await directusFetch(`/items/categories?filter[slug]=${slug}&fields=${CATEGORY_FIELDS}&single`);
  return data ? mapCategory(data) : CATEGORIES.find((c) => c.slug === slug) || CATEGORIES[0];
}

/* ---------- Workshopdetail ---------- */
export async function getWorkshop(slug) {
  const requested = (slug || "").trim();
  const data = await directusFetch(
    `/items/workshops?filter[slug]=${encodeURIComponent(requested)}&fields=${WORKSHOP_FIELDS}&single`
  );
  if (data) return mapWorkshop(data);
  return (
    FEATURED.find((w) => w.slug === requested) ||
    LISTING.find((w) => w.slug === requested) ||
    FEATURED[0]
  );
}

export async function getSessions(workshopId) {
  const data = await directusFetch(
    `/items/workshop_sessions?filter[workshop][slug]=${workshopId}&fields=${SESSION_FIELDS}&sort=starts_at&limit=20`
  );
  return data ? data.map(mapSession) : SESSIONS;
}

export async function getReviews(workshopId) {
  const data = await directusFetch(
    `/items/reviews?filter[workshop][slug]=${workshopId}&fields=${REVIEW_FIELDS}&limit=4`
  );
  return data ? data.map(mapReview) : REVIEWS;
}

export async function getFaq(workshopId) {
  const data = await directusFetch(
    `/items/workshop_faq?filter[workshop][slug]=${workshopId}&fields=${FAQ_FIELDS}&sort=sort`
  );
  return data ? data.map(mapFaq) : FAQ;
}

/* ---------- Aanbiederprofiel ---------- */
export async function getProvider(slug) {
  const data = await directusFetch(`/items/providers?filter[slug]=${slug}&fields=${PROVIDER_FIELDS}&single`);
  return data ? mapProvider(data) : { slug: slug || "marco-rossi", display_name: "Marco Rossi" };
}

export async function getProviderWorkshops(providerId) {
  const data = await directusFetch(
    `/items/workshops?filter[provider][slug]=${providerId}&fields=${WORKSHOP_FIELDS}`
  );
  return data ? data.map(mapProviderWorkshop) : MARCO_WORKSHOPS;
}

export async function getProviderReviews(providerId) {
  const data = await directusFetch(
    `/items/reviews?filter[provider][slug]=${providerId}&fields=${REVIEW_FIELDS}&limit=4`
  );
  return data ? data.map(mapReview) : MARCO_REVIEWS;
}

/* ---------- Blog ---------- */
export async function getArticles() {
  const data = await directusFetch(`/items/articles?fields=${ARTICLE_FIELDS}&limit=20`);
  return data ? data.map(mapArticle) : ARTICLES;
}

export async function getArticle(slug) {
  // Directus-sommetjes bevatten soms trailing spaces; we matchen trimmed.
  const requested = (slug || "").trim();
  const data = await directusFetch(`/items/articles?fields=${ARTICLE_FIELDS}&limit=100`);
  const article = data?.find((a) => (a.slug || "").trim() === requested);
  if (!article) return ARTICLES.find((a) => a.slug === slug) || ARTICLES[0];

  const mapped = mapArticle(article);
  const faqData = await directusFetch(
    `/items/article_faq?filter[article]=${article.id}&fields=${ARTICLE_FAQ_FIELDS}&sort=sort`
  );
  mapped.faq = faqData?.length ? faqData.map(mapFaq) : [];
  return mapped;
}

export async function getArticleSections() {
  return ART_SECTIONS;
}

export async function getArticleFaq() {
  return ART_FAQ;
}

/* ---------- Dashboard ---------- */
export async function getDashboardSessions() {
  const data = await directusFetch(
    `/items/workshop_sessions?fields=${DASH_SESSION_FIELDS}&sort=starts_at&limit=20`
  );
  return data ? data.map(mapDashSession) : DASH_SESSIONS;
}

export async function getDashboardBookings() {
  const data = await directusFetch(
    `/items/bookings?fields=${DASH_BOOKING_FIELDS}&sort=-date_created&limit=20`
  );
  return data ? data.map(mapDashBooking) : DASH_BOOKINGS;
}

export async function getDashboardWorkshops() {
  const data = await directusFetch(
    `/items/workshops?fields=${WORKSHOP_FIELDS},sessions&limit=20`
  );
  return data ? data.map(mapDashWorkshop) : DASH_WORKSHOPS;
}

export async function getProviderProfile() {
  const data = await directusFetch(`/items/providers?fields=${PROVIDER_FIELDS}&single`);
  return data ? mapProvider(data) : MARCO_PROFILE;
}
