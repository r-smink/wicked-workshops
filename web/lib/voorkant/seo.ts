import type { Metadata } from "next";
import type { ProviderDetail, ReviewView, WorkshopCard, WorkshopDetail } from "./data";

/* SEO en gestructureerde data voor de voorkant (PROMPT-BOUW stap 8). */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.wickedworkshops.nl").replace(/\/$/, "");
export const abs = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`);

/* Unieke title, description, canonical en Open Graph per pagina. */
export function pageMetadata({ title, description, path, image }: { title: string; description: string; path: string; image?: string | null }): Metadata {
  const img = image ? [{ url: abs(image) }] : undefined;
  return {
    title,
    description,
    alternates: { canonical: abs(path) },
    openGraph: { type: "website", locale: "nl_NL", siteName: "Wicked Workshops", title, description, url: abs(path), images: img },
    twitter: { card: img ? "summary_large_image" : "summary", title, description },
  };
}

type Json = Record<string, unknown>;

export const organizationLd = (): Json => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Wicked Workshops",
  url: SITE_URL,
  logo: abs("/icon.svg"),
  description: "De Nederlandse marktplaats voor workshops en unieke uitjes. Ook voor wie net begint met lesgeven.",
});

export const breadcrumbLd = (items: { name: string; path: string }[]): Json => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
});

export const faqLd = (faq: { question: string; answer: string }[]): Json | null =>
  faq.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
      }
    : null;

const aggregate = (rating: number | null, count: number) =>
  rating != null && count > 0 ? { "@type": "AggregateRating", ratingValue: rating, reviewCount: count, bestRating: 5, worstRating: 1 } : undefined;

/* Een workshop als Course met een CourseInstance per datum; elke datum ook
   als Event, zodat zoekmachines de datums tonen. */
export function workshopLd(w: WorkshopDetail | WorkshopCard, path: string, reviews: ReviewView[] = []): Json[] {
  const place = w.city ? { "@type": "Place", name: [w.neighbourhood, w.city.name].filter(Boolean).join(", "), address: { "@type": "PostalAddress", addressLocality: w.city.name, addressCountry: "NL" } } : undefined;
  const offer = (start: string) => (w.price != null ? { "@type": "Offer", price: w.price, priceCurrency: "EUR", availability: "https://schema.org/InStock", url: abs(path), validFrom: start } : undefined);
  const organizer = w.provider ? { "@type": w.provider.kind === "business" ? "Organization" : "Person", name: w.provider.name, url: abs(`/aanbieders/${w.provider.slug}`) } : undefined;
  const course: Json = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: w.title,
    description: ("intro" in w && w.intro) || w.subtitle || w.title,
    url: abs(path),
    image: abs(w.image),
    provider: organizer,
    aggregateRating: aggregate(w.rating, w.ratingCount),
    review: reviews.slice(0, 5).map((r) => ({ "@type": "Review", author: { "@type": "Person", name: r.author }, reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 }, reviewBody: r.body })),
    hasCourseInstance: w.sessions.slice(0, 20).map((s) => ({
      "@type": "CourseInstance",
      courseMode: "onsite",
      startDate: s.startsAt,
      endDate: s.endsAt ?? undefined,
      location: place,
      offers: offer(s.startsAt),
    })),
  };
  const events: Json[] = w.sessions.slice(0, 10).map((s) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: w.title,
    startDate: s.startsAt,
    endDate: s.endsAt ?? undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: place,
    image: abs(w.image),
    organizer,
    offers: offer(s.startsAt),
    url: abs(path),
  }));
  return [course, ...events];
}

export function providerLd(p: ProviderDetail, path: string): Json {
  return {
    "@context": "https://schema.org",
    "@type": p.kind === "business" ? "Organization" : "Person",
    name: p.name,
    url: abs(path),
    image: p.image ? abs(p.image) : undefined,
    description: p.bioShort || p.bioLong || undefined,
    address: p.city ? { "@type": "PostalAddress", addressLocality: p.city.name, addressCountry: "NL" } : undefined,
    aggregateRating: aggregate(p.rating, p.ratingCount),
  };
}

/* Strip undefined en zet om naar een veilige <script>-inhoud. */
export function ldJson(data: Json | Json[] | null): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
