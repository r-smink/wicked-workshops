import "server-only";

import { readItems, readSingleton } from "@directus/sdk";
import { publicClient } from "@/lib/directus/client";
import type { Provider, VenueListing } from "@/lib/directus/types";
import { categoryImage, cityImage, providerImage, workshopImage } from "./images";
import { dayShort, durationLabel, isoDay, standLabel, standOf, time, timeRange, type Stand } from "./format";

/* Data voor de voorkant (wicked-handoff/design), uit het root-schema in
   directus/. Leest als de publieke rol (publicClient): alleen gepubliceerde
   items en publieke velden (directus/seed/fields.mjs). Gecachet met de tag
   "directus"; /api/revalidate maakt die leeg na een wijziging in Directus.

   Lukt een aanvraag niet, dan geven de functies een lege lijst of null, en
   tonen de pagina's hun lege staat. Er wordt hier geen voorbeelddata verzonnen. */

const client = () => publicClient({ revalidate: 300, tags: ["directus"] });

async function safe<T>(label: string, fallback: T, run: () => Promise<T>): Promise<T> {
  if (!process.env.DIRECTUS_URL) return fallback;
  try {
    return await run();
  } catch (err) {
    console.error(`Directus (${label}) mislukt:`, err instanceof Error ? err.message : err);
    return fallback;
  }
}

const num = (v: string | number | null | undefined): number | null => {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export const fileUrl = (id: string | null | undefined): string | null => (id ? `/api/proxy/${id}` : null);

/* ---------------------------------------------------------------- typen */

export type Ref = { name: string; slug: string };

export type SessionView = {
  id: string;
  workshopId: string;
  startsAt: string;
  endsAt: string | null;
  /* "za 14 nov" */
  day: string;
  /* "15:00" */
  start: string;
  /* "15:00 tot 18:00" */
  range: string;
  /* "2026-11-14" */
  isoDay: string;
  capacity: number;
  taken: number;
  free: number;
  min: number | null;
  decisionAt: string | null;
  /* "vr 20 nov, 22:00" */
  decisionLabel: string | null;
  stand: Stand;
  /* "Gaat door", "2 van 4 nodig", "Vol" */
  label: string;
  price: number | null;
};

export type ProviderRef = Ref & { kind: "private" | "business" | null; area: string | null; firstName: string | null };

export type WorkshopCard = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  image: string;
  imageAlt: string;
  category: Ref | null;
  city: Ref | null;
  neighbourhood: string | null;
  provider: ProviderRef | null;
  rating: number | null;
  ratingCount: number;
  durationMinutes: number | null;
  duration: string;
  price: number | null;
  min: number | null;
  max: number | null;
  featured: boolean;
  /* Komende openbare datums, oplopend; zonder "gaat niet door". */
  sessions: SessionView[];
};

export type ReviewView = {
  id: string;
  author: string;
  initials: string;
  rating: number;
  body: string;
  date: string | null;
  workshop: { title: string; slug: string } | null;
};

export type WorkshopDetail = WorkshopCard & {
  intro: string | null;
  description: string | null;
  accessibility: string | null;
  locationName: string | null;
  level: string | null;
  inclusions: string[];
  faq: { question: string; answer: string }[];
  gallery: { src: string; alt: string }[];
  cancellationPolicy: string | null;
  ratingParts: { atmosphere: number | null; explanation: number | null; value: number | null };
  seoTitle: string | null;
  seoDescription: string | null;
  privateBooking: boolean;
  groupQuoteFrom: number | null;
};

export type ProviderDetail = ProviderRef & {
  id: string;
  profession: string | null;
  bioShort: string | null;
  bioLong: string | null;
  image: string | null;
  rating: number | null;
  ratingCount: number;
  participants: number | null;
  activeSince: string | null;
  city: Ref | null;
  maxGroup: number | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type VenueView = {
  id: string;
  name: string;
  kind: "kitchen" | "atelier" | "hall" | "outdoor" | null;
  capacity: number | null;
  place: Ref | null;
  neighbourhood: string | null;
  description: string | null;
  amenities: string[];
  /* { mon: ["morning", "afternoon", "evening"], ... } */
  availability: Record<string, string[]>;
  image: string | null;
};

/* ---------------------------------------------------------------- mappers */

type Rel<T> = string | T | null | undefined;
const obj = <T>(r: Rel<T>): T | null => (r && typeof r === "object" ? r : null);

type RawRef = { name?: string | null; slug?: string | null; display_name?: string | null };
const ref = (r: Rel<RawRef>): Ref | null => {
  const o = obj(r);
  return o && o.slug ? { name: o.name || o.display_name || o.slug, slug: o.slug } : null;
};

type RawProvider = Pick<Provider, "id" | "slug" | "display_name" | "kind" | "area_label" | "neighbourhood" | "first_name">;
const providerRef = (r: Rel<RawProvider>): ProviderRef | null => {
  const p = obj(r);
  if (!p?.slug) return null;
  return { name: p.display_name, slug: p.slug, kind: p.kind ?? null, area: p.area_label || p.neighbourhood || null, firstName: p.first_name ?? null };
};

type RawSession = {
  id: string;
  workshop: string | { id: string } | null;
  starts_at: string;
  ends_at: string | null;
  capacity: number;
  seats_taken: number | null;
  min_participants: number | null;
  decision_at: string | null;
  goes_ahead: boolean | null;
  status: string | null;
  state: string | null;
  price_override: string | null;
};

const SESSION_FIELDS = ["id", "workshop", "starts_at", "ends_at", "capacity", "seats_taken", "min_participants", "decision_at", "goes_ahead", "status", "state", "price_override"];

export function toSession(s: RawSession, workshopMin: number | null, now = Date.now()): SessionView {
  const min = s.min_participants ?? workshopMin ?? null;
  const counts = {
    capacity: s.capacity ?? 0,
    taken: s.seats_taken ?? 0,
    /* Een minimum van 1 is hetzelfde als geen minimum: de eerste aanmelding
       haalt het meteen. Zo verschijnt nooit "0 van 1 nodig". */
    min: min && min > 1 ? min : null,
    goesAhead: Boolean(s.goes_ahead),
    decisionAt: s.decision_at,
    cancelled: s.status === "cancelled" || s.state === "not_happening" || s.state === "cancelled_by_provider",
  };
  const stand = standOf(counts, now);
  return {
    id: s.id,
    workshopId: typeof s.workshop === "string" ? s.workshop : s.workshop?.id ?? "",
    startsAt: s.starts_at,
    endsAt: s.ends_at,
    day: dayShort(s.starts_at),
    start: time(s.starts_at),
    range: timeRange(s.starts_at, s.ends_at),
    isoDay: isoDay(s.starts_at),
    capacity: counts.capacity,
    taken: counts.taken,
    free: Math.max(0, counts.capacity - counts.taken),
    min: counts.min,
    decisionAt: s.decision_at,
    decisionLabel: s.decision_at ? `${dayShort(s.decision_at)}, ${time(s.decision_at)}` : null,
    stand,
    label: standLabel(stand, counts),
    price: num(s.price_override),
  };
}

const upcoming = (sessions: SessionView[], now = Date.now()) =>
  sessions
    .filter((s) => new Date(s.startsAt).getTime() > now && s.stand !== "nietdoor")
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

type RawMedia = { file: string | { id: string } | null; alt: string | null; sort: number | null };
type RawWorkshop = {
  id: string; slug: string; title: string; subtitle: string | null; intro: string | null; description: string | null;
  accessibility: string | null; location_name: string | null; neighbourhood: string | null; level: string | null;
  duration_minutes: number | null; min_participants: number | null; max_participants: number | null;
  price_per_person: string | null; price_from: string | null; rating_avg: string | null; rating_count: number | null;
  rating_atmosphere: string | null; rating_explanation: string | null; rating_value: string | null;
  featured: boolean; private_booking_available: boolean; group_quote_from: number | null;
  seo_title: string | null; seo_description: string | null;
  category: Rel<RawRef>; city: Rel<RawRef>; provider: Rel<RawProvider>;
  media?: Rel<RawMedia>[]; inclusions?: Rel<{ text: string; sort: number | null }>[];
  faq?: Rel<{ question: string; answer: string; sort: number | null }>[];
  sessions?: Rel<RawSession>[];
  cancellation_policy?: Rel<{ name?: string | null; summary?: string | null; description?: string | null }>;
};

const CARD_FIELDS = [
  "id", "slug", "title", "subtitle", "neighbourhood", "duration_minutes", "min_participants", "max_participants",
  "price_per_person", "price_from", "rating_avg", "rating_count", "featured",
  "category.name", "category.slug", "city.name", "city.slug",
  "provider.id", "provider.slug", "provider.display_name", "provider.kind", "provider.area_label", "provider.neighbourhood", "provider.first_name",
  "media.file", "media.alt", "media.sort",
  ...SESSION_FIELDS.map((f) => `sessions.${f}`),
];

function sortedMedia(w: RawWorkshop) {
  return (w.media ?? [])
    .map((m) => obj(m))
    .filter((m): m is RawMedia => Boolean(m?.file))
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
    .map((m) => ({ src: fileUrl(typeof m.file === "string" ? m.file : m.file?.id)!, alt: m.alt || "" }));
}

function toCard(w: RawWorkshop, now = Date.now()): WorkshopCard {
  const category = ref(w.category);
  const media = sortedMedia(w);
  const min = w.min_participants ?? null;
  const sessions = upcoming((w.sessions ?? []).map((s) => obj(s)).filter((s): s is RawSession => Boolean(s)).map((s) => toSession(s, min, now)), now);
  return {
    id: w.id,
    slug: w.slug,
    title: w.title,
    subtitle: w.subtitle,
    image: media[0]?.src ?? workshopImage(w.slug, category?.slug),
    imageAlt: media[0]?.alt || w.title,
    category,
    city: ref(w.city),
    neighbourhood: w.neighbourhood,
    provider: providerRef(w.provider),
    rating: num(w.rating_avg),
    ratingCount: w.rating_count ?? 0,
    durationMinutes: w.duration_minutes,
    duration: durationLabel(w.duration_minutes),
    price: num(w.price_per_person) ?? num(w.price_from),
    min,
    max: w.max_participants,
    featured: Boolean(w.featured),
    sessions,
  };
}

/* ---------------------------------------------------------------- workshops */

export type WorkshopQuery = {
  categorySlug?: string | null;
  citySlug?: string | null;
  providerSlug?: string | null;
  featured?: boolean;
  limit?: number;
};

export async function getWorkshopCards(q: WorkshopQuery = {}): Promise<WorkshopCard[]> {
  return safe("workshops", [], async () => {
    const and: Record<string, unknown>[] = [{ status: { _eq: "published" } }];
    if (q.categorySlug) and.push({ category: { slug: { _eq: q.categorySlug } } });
    if (q.citySlug) and.push({ city: { slug: { _eq: q.citySlug } } });
    if (q.providerSlug) and.push({ provider: { slug: { _eq: q.providerSlug } } });
    if (q.featured) and.push({ featured: { _eq: true } });
    const rows = (await client().request(
      readItems("workshops", {
        fields: CARD_FIELDS,
        filter: { _and: and },
        sort: ["-featured", "-rating_count", "title"],
        limit: q.limit ?? 60,
        deep: { sessions: { _filter: { starts_at: { _gte: "$NOW" } }, _sort: ["starts_at"], _limit: 40 } },
      } as never),
    )) as unknown as RawWorkshop[];
    return rows.map((w) => toCard(w));
  });
}

export async function getWorkshopSlugs(): Promise<string[]> {
  return safe("workshop-slugs", [], async () => {
    const rows = (await client().request(readItems("workshops", { fields: ["slug"], filter: { status: { _eq: "published" } }, limit: -1 } as never))) as unknown as { slug: string }[];
    return rows.map((r) => r.slug);
  });
}

export async function getWorkshop(slug: string): Promise<WorkshopDetail | null> {
  return safe("workshop", null, async () => {
    const rows = (await client().request(
      readItems("workshops", {
        fields: [
          ...CARD_FIELDS, "intro", "description", "accessibility", "location_name", "level",
          "rating_atmosphere", "rating_explanation", "rating_value", "private_booking_available", "group_quote_from",
          "seo_title", "seo_description", "inclusions.text", "inclusions.sort", "faq.question", "faq.answer", "faq.sort",
          "cancellation_policy.*",
        ],
        filter: { _and: [{ status: { _eq: "published" } }, { slug: { _eq: slug } }] },
        limit: 1,
        deep: { sessions: { _filter: { starts_at: { _gte: "$NOW" } }, _sort: ["starts_at"], _limit: 60 } },
      } as never),
    )) as unknown as RawWorkshop[];
    const w = rows[0];
    if (!w) return null;
    const card = toCard(w);
    const bySort = <T extends { sort: number | null }>(a: T, b: T) => (a.sort ?? 0) - (b.sort ?? 0);
    const policy = obj(w.cancellation_policy);
    return {
      ...card,
      intro: w.intro,
      description: w.description,
      accessibility: w.accessibility,
      locationName: w.location_name,
      level: w.level,
      inclusions: (w.inclusions ?? []).map((i) => obj(i)).filter((i): i is { text: string; sort: number | null } => Boolean(i?.text)).sort(bySort).map((i) => i.text),
      faq: (w.faq ?? []).map((f) => obj(f)).filter((f): f is { question: string; answer: string; sort: number | null } => Boolean(f?.question)).sort(bySort).map(({ question, answer }) => ({ question, answer })),
      gallery: sortedMedia(w),
      cancellationPolicy: policy ? policy.summary || policy.description || policy.name || null : null,
      ratingParts: { atmosphere: num(w.rating_atmosphere), explanation: num(w.rating_explanation), value: num(w.rating_value) },
      seoTitle: w.seo_title,
      seoDescription: w.seo_description,
      privateBooking: Boolean(w.private_booking_available),
      groupQuoteFrom: w.group_quote_from,
    };
  });
}

/* Alle komende datums, plat, met de workshopkaart erbij. Voor de tijdlijn per
   dag (categorie), "dit weekend" (home) en het weekraster (aanbieder). */
export type SessionWithWorkshop = SessionView & { workshop: WorkshopCard };

export function flattenSessions(cards: WorkshopCard[], from?: string, to?: string): SessionWithWorkshop[] {
  return cards
    .flatMap((w) => w.sessions.map((s) => ({ ...s, workshop: w })))
    .filter((s) => (!from || s.isoDay >= from) && (!to || s.isoDay <= to))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

/* ---------------------------------------------------------------- aanbieders */

export async function getProvider(slug: string): Promise<ProviderDetail | null> {
  return safe("provider", null, async () => {
    const rows = (await client().request(
      readItems("providers", {
        fields: [
          "id", "slug", "display_name", "first_name", "kind", "area_label", "neighbourhood", "profession", "bio_short", "bio_long",
          "avatar", "cover", "rating_avg", "rating_count", "participants_count", "active_since", "max_group_size",
          "seo_title", "seo_description", "city.name", "city.slug",
        ],
        filter: { _and: [{ status: { _eq: "published" } }, { slug: { _eq: slug } }] },
        limit: 1,
      } as never),
    )) as unknown as (RawProvider & {
      profession: string | null; bio_short: string | null; bio_long: string | null; avatar: string | null; cover: string | null;
      rating_avg: string | null; rating_count: number | null; participants_count: number | null; active_since: string | null;
      max_group_size: number | null; seo_title: string | null; seo_description: string | null; city: Rel<RawRef>;
    })[];
    const p = rows[0];
    if (!p) return null;
    return {
      ...providerRef(p)!,
      id: p.id,
      profession: p.profession,
      bioShort: p.bio_short,
      bioLong: p.bio_long,
      image: fileUrl(p.cover) || fileUrl(p.avatar) || providerImage(p.slug),
      rating: num(p.rating_avg),
      ratingCount: p.rating_count ?? 0,
      participants: p.participants_count,
      activeSince: p.active_since,
      city: ref(p.city),
      maxGroup: p.max_group_size,
      seoTitle: p.seo_title,
      seoDescription: p.seo_description,
    };
  });
}

export async function getProviderSlugs(): Promise<string[]> {
  return safe("provider-slugs", [], async () => {
    const rows = (await client().request(readItems("providers", { fields: ["slug"], filter: { status: { _eq: "published" } }, limit: -1 } as never))) as unknown as { slug: string }[];
    return rows.map((r) => r.slug);
  });
}

/* ---------------------------------------------------------------- reviews */

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "?";

export async function getReviews(q: { workshopSlug?: string; providerSlug?: string; limit?: number } = {}): Promise<ReviewView[]> {
  return safe("reviews", [], async () => {
    const and: Record<string, unknown>[] = [{ status: { _eq: "published" } }];
    if (q.workshopSlug) and.push({ workshop: { slug: { _eq: q.workshopSlug } } });
    if (q.providerSlug) and.push({ provider: { slug: { _eq: q.providerSlug } } });
    const rows = (await client().request(
      readItems("reviews", {
        fields: ["id", "author_display_name", "rating_overall", "body", "published_at", "date_created", "workshop.title", "workshop.slug"],
        filter: { _and: and },
        sort: ["-published_at", "-date_created"],
        limit: q.limit ?? 12,
      } as never),
    )) as unknown as { id: string; author_display_name: string | null; rating_overall: number; body: string | null; published_at: string | null; date_created: string | null; workshop: Rel<{ title: string; slug: string }> }[];
    return rows
      .filter((r) => r.body)
      .map((r) => {
        const author = r.author_display_name || "Deelnemer";
        const ws = obj(r.workshop);
        return { id: r.id, author, initials: initials(author), rating: r.rating_overall, body: r.body!, date: r.published_at || r.date_created, workshop: ws ? { title: ws.title, slug: ws.slug } : null };
      });
  });
}

/* ---------------------------------------------------------------- categorieen, plaatsen */

export type CategoryView = Ref & { id: string; intro: string | null; seoText: string | null; image: string | null; count: number | null; seoTitle: string | null; seoDescription: string | null };
export type CityView = Ref & { id: string; province: string | null; intro: string | null; image: string | null };

export async function getCategories(): Promise<CategoryView[]> {
  return safe("categories", [], async () => {
    const rows = (await client().request(
      readItems("categories", {
        fields: ["id", "name", "slug", "intro", "seo_text", "image", "workshop_count", "seo_title", "seo_description", "sort"],
        filter: { _and: [{ status: { _eq: "published" } }, { parent: { _null: true } }] },
        sort: ["sort", "name"],
        limit: -1,
      } as never),
    )) as unknown as { id: string; name: string; slug: string; intro: string | null; seo_text: string | null; image: string | null; workshop_count: number | null; seo_title: string | null; seo_description: string | null }[];
    return rows.map((c) => ({
      id: c.id, name: c.name, slug: c.slug, intro: c.intro, seoText: c.seo_text,
      image: fileUrl(c.image) || categoryImage(c.slug), count: c.workshop_count,
      seoTitle: c.seo_title, seoDescription: c.seo_description,
    }));
  });
}

export async function getCityBySlug(slug: string): Promise<CityView | null> {
  return safe("city", null, async () => {
    const rows = (await client().request(
      readItems("cities", { fields: ["id", "name", "slug", "province", "intro", "image"], filter: { slug: { _eq: slug } }, limit: 1 } as never),
    )) as unknown as { id: string; name: string; slug: string; province: string | null; intro: string | null; image: string | null }[];
    const c = rows[0];
    return c ? { id: c.id, name: c.name, slug: c.slug, province: c.province, intro: c.intro, image: fileUrl(c.image) || cityImage(c.slug) } : null;
  });
}

/* Plaatsen waar nu gepubliceerde workshops zijn, met het aantal. */
export async function getActiveCities(): Promise<(CityView & { count: number })[]> {
  const cards = await getWorkshopCards({ limit: 500 });
  const map = new Map<string, { name: string; slug: string; count: number }>();
  for (const w of cards) {
    if (!w.city) continue;
    const e = map.get(w.city.slug) ?? { ...w.city, count: 0 };
    e.count += 1;
    map.set(w.city.slug, e);
  }
  return [...map.values()]
    .sort((a, b) => b.count - a.count)
    .map((c) => ({ id: c.slug, name: c.name, slug: c.slug, province: null, intro: null, image: cityImage(c.slug), count: c.count }));
}

/* SEO-inhoud voor een categorie in een plaats (location_pages). */
export type LocationPageView = { h1: string; intro: string | null; seoText: string | null; faq: { question: string; answer: string }[]; seoTitle: string | null; seoDescription: string | null };

export async function getLocationPage(categorySlug: string, citySlug: string): Promise<LocationPageView | null> {
  return safe("location-page", null, async () => {
    const rows = (await client().request(
      readItems("location_pages", {
        fields: ["h1", "intro", "seo_text", "seo_title", "seo_description", "faq.question", "faq.answer", "faq.sort"],
        filter: { _and: [{ status: { _eq: "published" } }, { category: { slug: { _eq: categorySlug } } }, { city: { slug: { _eq: citySlug } } }] },
        limit: 1,
      } as never),
    )) as unknown as { h1: string; intro: string | null; seo_text: string | null; seo_title: string | null; seo_description: string | null; faq: Rel<{ question: string; answer: string; sort: number | null }>[] }[];
    const p = rows[0];
    if (!p) return null;
    return {
      h1: p.h1, intro: p.intro, seoText: p.seo_text, seoTitle: p.seo_title, seoDescription: p.seo_description,
      faq: (p.faq ?? []).map((f) => obj(f)).filter((f): f is { question: string; answer: string; sort: number | null } => Boolean(f)).sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)).map(({ question, answer }) => ({ question, answer })),
    };
  });
}

/* ---------------------------------------------------------------- ruimtes */

export async function getVenues(limit = 24): Promise<VenueView[]> {
  return safe("venues", [], async () => {
    const rows = (await client().request(
      readItems("venue_listings", {
        fields: ["id", "name", "kind", "capacity", "neighbourhood", "description", "amenities", "availability", "place.name", "place.slug", "images.file", "images.sort"],
        filter: { _and: [{ status: { _eq: "published" } }, { visible: { _eq: true } }] },
        sort: ["-date_created"],
        limit,
      } as never),
    )) as unknown as (Pick<VenueListing, "id" | "name" | "kind" | "capacity" | "neighbourhood" | "description" | "amenities" | "availability"> & { place: Rel<RawRef>; images: Rel<{ file: string | null; sort: number | null }>[] })[];
    return rows.map((v) => {
      const img = (v.images ?? []).map((i) => obj(i)).filter((i): i is { file: string | null; sort: number | null } => Boolean(i?.file)).sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))[0];
      return {
        id: v.id,
        name: v.name || "Ruimte",
        kind: v.kind,
        capacity: v.capacity,
        place: ref(v.place),
        neighbourhood: v.neighbourhood,
        description: v.description,
        amenities: Array.isArray(v.amenities) ? v.amenities.filter((a): a is string => typeof a === "string") : [],
        availability: v.availability && typeof v.availability === "object" ? (v.availability as Record<string, string[]>) : {},
        image: fileUrl(img?.file),
      };
    });
  });
}

/* ---------------------------------------------------------------- instellingen */

export type PublicSettings = { pilotNoPayments: boolean; paymentMode: "off" | "sandbox" | "live"; venuesEnabled: boolean };

export async function getPublicSettings(): Promise<PublicSettings> {
  return safe("platform_settings", { pilotNoPayments: true, paymentMode: "off", venuesEnabled: true }, async () => {
    const s = (await client().request(readSingleton("platform_settings", { fields: ["pilot_no_payments", "payment_mode", "feature_venues"] } as never))) as unknown as { pilot_no_payments: boolean | null; payment_mode: "off" | "sandbox" | "live" | null; feature_venues: boolean | null };
    return { pilotNoPayments: s.pilot_no_payments !== false, paymentMode: s.payment_mode ?? "off", venuesEnabled: s.feature_venues !== false };
  });
}
