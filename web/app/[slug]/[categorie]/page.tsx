import "@/styles/voorkant.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageFrame } from "@/components/voorkant/PageFrame";
import { JsonLd } from "@/components/voorkant/JsonLd";
import { CatOffer } from "@/components/voorkant/cat/CatOffer";
import {
  CatEmpty,
  CatFaq,
  CatFurther,
  CatHero,
  CatPilot,
  CatSeo,
  CatSymbols,
  type Crumb,
} from "@/components/voorkant/cat/CatSections";
import {
  buildOffer,
  ratingSummary,
  vegetarianWorkshopIds,
} from "@/components/voorkant/cat/build";
import {
  defaultFaq,
  defaultSeoText,
  giverText,
  nounsFor,
  type Nouns,
} from "@/components/voorkant/cat/labels";
import {
  getCategories,
  getCityBySlug,
  getLocationPage,
  getWorkshopCards,
  type CategoryView,
  type LocationPageView,
  type WorkshopCard,
} from "@/lib/voorkant/data";
import { categoryImage, cityImage } from "@/lib/voorkant/images";
import { abs, breadcrumbLd, faqLd, pageMetadata } from "@/lib/voorkant/seo";
import { ALL_CATEGORIES, ALL_PLACES, routes } from "@/lib/routes";

/* /[plaats]/[categorie]. De map heet [slug] omdat app/[slug] (contentpagina's)
   dezelfde dynamische naam op dit niveau moet hebben. "nederland" is alle
   plaatsen, "alles" alle categorieen. */

export const revalidate = 300;

type Params = { slug: string; categorie: string };

/* Combinaties van plaatsen en categorieen met gepubliceerde workshops. */
export async function generateStaticParams(): Promise<Params[]> {
  const cards = await getWorkshopCards({ limit: 1000 });
  const set = new Set<string>();
  for (const w of cards) {
    const cities = [ALL_PLACES, ...(w.city ? [w.city.slug] : [])];
    const cats = [ALL_CATEGORIES, ...(w.category ? [w.category.slug] : [])];
    for (const c of cities) for (const k of cats) set.add(`${c}/${k}`);
  }
  return [...set].map((s) => {
    const [slug, categorie] = s.split("/") as [string, string];
    return { slug, categorie };
  });
}

/* Hero-beeld uit het ontwerp voor koken; anders dat van categorie of plaats. */
const HERO: Record<string, { src: string; alt: string }> = {
  "koken-en-bakken": {
    src: "/img/cat-ravioli.jpg",
    alt: "Iemand steekt ravioli uit op een met bloem bestoven plank",
  },
};
const SEO_IMAGE: Record<string, { src: string; alt: string }> = {
  "koken-en-bakken": {
    src: "/img/koken.jpg",
    alt: "Twee mensen in schort roeren samen in een pan op het fornuis",
  },
};

/* Lead uit het ontwerp, voor als er geen eigen intro is. */
const DEFAULT_LEAD =
  "Bovenaan zie je per dag wat er de komende twee weken is, daaronder elke workshop met zijn eerstvolgende datums. Bij elke datum staat of hij zeker doorgaat, nog aanmeldingen nodig heeft of vol is.";

type Ctx = {
  place: { slug: string; name: string } | null;
  category: CategoryView | null;
  categories: CategoryView[];
  nouns: Nouns;
  location: LocationPageView | null;
  placeName: string;
  title: string;
};

async function resolve(p: Params): Promise<Ctx | null> {
  const placeSlug = decodeURIComponent(p.slug);
  const catSlug = decodeURIComponent(p.categorie);
  const [city, categories] = await Promise.all([
    placeSlug === ALL_PLACES ? Promise.resolve(null) : getCityBySlug(placeSlug),
    getCategories(),
  ]);
  if (placeSlug !== ALL_PLACES && !city) return null;
  const category =
    catSlug === ALL_CATEGORIES
      ? null
      : (categories.find((c) => c.slug === catSlug) ?? null);
  if (catSlug !== ALL_CATEGORIES && !category) return null;
  const location =
    category && city ? await getLocationPage(category.slug, city.slug) : null;
  const nouns = nounsFor(category);
  const placeName = city ? city.name : "Nederland";
  return {
    place: city ? { slug: city.slug, name: city.name } : null,
    category,
    categories,
    nouns,
    location,
    placeName,
    title: location?.h1 || `${nouns.title} in ${placeName}`,
  };
}

function pathOf(ctx: Ctx) {
  return ctx.category
    ? routes.category(ctx.category.slug, ctx.place?.slug)
    : routes.place(ctx.place?.slug ?? ALL_PLACES);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const ctx = await resolve(await params);
  if (!ctx) return {};
  const description =
    ctx.location?.seoDescription ||
    (!ctx.place && ctx.category?.seoDescription) ||
    `${ctx.title}: bekijk per dag wat er de komende twee weken is en zie bij elke datum of hij zeker doorgaat, nog aanmeldingen nodig heeft of vol is. Boekingskosten €0, altijd.`;
  return pageMetadata({
    title:
      ctx.location?.seoTitle ||
      (!ctx.place && ctx.category?.seoTitle) ||
      ctx.title,
    description,
    path: pathOf(ctx),
    image:
      HERO[ctx.category?.slug ?? ""]?.src ??
      ctx.category?.image ??
      cityImage(ctx.place?.slug),
  });
}

/* Teksten uit Directus kunnen HTML of witregels bevatten; hier als platte alinea's. */
const paragraphs = (t: string) =>
  t
    .replace(/<\/(p|h[1-6]|li)>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);

function furtherLinks(
  ctx: Ctx,
  all: WorkshopCard[],
): { href: string; label: string }[] {
  const links: { href: string; label: string }[] = [];
  const catSlug = ctx.category?.slug ?? null;
  const placeSlug = ctx.place?.slug ?? null;
  /* Dezelfde categorie in andere plaatsen. */
  const cityCounts = new Map<string, { name: string; n: number }>();
  for (const w of all) {
    if (!w.city || w.city.slug === placeSlug) continue;
    if (catSlug && w.category?.slug !== catSlug) continue;
    const e = cityCounts.get(w.city.slug) ?? { name: w.city.name, n: 0 };
    e.n += 1;
    cityCounts.set(w.city.slug, e);
  }
  const cities = [...cityCounts.entries()]
    .sort((a, b) => b[1].n - a[1].n)
    .slice(0, placeSlug ? 2 : 3);
  for (const [slug, c] of cities)
    links.push({
      href: catSlug ? routes.category(catSlug, slug) : routes.place(slug),
      label: `${ctx.nouns.title} in ${c.name}`,
    });
  /* Andere categorieen in deze plaats. */
  const catCounts = new Map<string, number>();
  for (const w of all) {
    if (!w.category || w.category.slug === catSlug) continue;
    if (placeSlug && w.city?.slug !== placeSlug) continue;
    catCounts.set(w.category.slug, (catCounts.get(w.category.slug) ?? 0) + 1);
  }
  const cats = [...catCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  for (const [slug] of cats) {
    const cat = ctx.categories.find((c) => c.slug === slug);
    if (cat)
      links.push({
        href: routes.category(slug, placeSlug ?? ALL_PLACES),
        label: `${nounsFor(cat).title} in ${ctx.placeName}`,
      });
  }
  if (catSlug)
    links.push({
      href: routes.place(placeSlug ?? ALL_PLACES),
      label: `Alle workshops in ${ctx.placeName}`,
    });
  else if (placeSlug)
    links.push({
      href: routes.place(ALL_PLACES),
      label: "Alle workshops in Nederland",
    });
  return links;
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const ctx = await resolve(await params);
  if (!ctx) notFound();
  const { place, category, nouns, location, placeName, title } = ctx;

  const all = await getWorkshopCards({ limit: 1000 });
  const cards = all.filter(
    (w) =>
      (!category || w.category?.slug === category.slug) &&
      (!place || w.city?.slug === place.slug),
  );
  const veg = await vegetarianWorkshopIds(cards.map((w) => w.id));
  const path = pathOf(ctx);

  const crumbs: Crumb[] = [];
  if (category)
    crumbs.push(
      place
        ? { name: category.name, href: routes.category(category.slug) }
        : { name: category.name },
    );
  if (place) crumbs.push({ name: place.name });
  if (!category && !place) crumbs.push({ name: "Alle workshops" });

  const heroImage = HERO[category?.slug ?? ""] ?? {
    src: category?.image || cityImage(place?.slug) || "/img/cat-ravioli.jpg",
    alt: "",
  };
  const seoImage = SEO_IMAGE[category?.slug ?? ""] ?? {
    src:
      categoryImage(category?.slug) ||
      cityImage(place?.slug) ||
      "/img/koken.jpg",
    alt: "",
  };
  const lead = location?.intro || (!place && category?.intro) || DEFAULT_LEAD;

  /* SEO-tekst: location_page, dan categorie (alleen landelijk), anders werktekst. */
  const ownSeo =
    location?.seoText || (!place ? category?.seoText : null) || null;
  const prices = cards
    .map((w) => w.price)
    .filter((p): p is number => p != null);
  const neighbourhoods = [
    ...new Set(
      cards
        .map((w) => (place ? w.neighbourhood : w.city?.name))
        .filter((n): n is string => Boolean(n)),
    ),
  ];
  const fallbackSeo = defaultSeoText(nouns, place?.name ?? null, {
    neighbourhoods,
    minPrice: prices.length ? Math.min(...prices) : null,
    maxPrice: prices.length ? Math.max(...prices) : null,
  });
  const seo = ownSeo
    ? {
        heading: fallbackSeo.heading,
        blocks: paragraphs(ownSeo).map((p) => ({ p })),
      }
    : fallbackSeo;
  const faq = location?.faq.length ? location.faq : defaultFaq(nouns);

  const offer = buildOffer(cards, {
    placeName,
    isNational: !place,
    nouns,
    listHeading: `Alle ${nouns.plural} in ${placeName}`,
    veg,
  });

  const ld = [
    breadcrumbLd([
      { name: "Home", path: "/" },
      ...(category
        ? [{ name: category.name, path: routes.category(category.slug) }]
        : []),
      ...(place ? [{ name: place.name, path }] : []),
      ...(!category && !place ? [{ name: "Alle workshops", path }] : []),
    ]),
    faqLd(faq),
    offer.rows.length
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: title,
          url: abs(path),
          numberOfItems: offer.rows.length,
          itemListElement: offer.rows.map((r, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: abs(r.href),
            name: r.title,
          })),
        }
      : null,
  ];

  return (
    <PageFrame id="cat">
      <CatSymbols />{" "}
      <CatHero
        image={heroImage}
        crumbs={crumbs}
        h1={title}
        lead={lead}
        count={cards.length}
        rating={ratingSummary(cards)}
      />{" "}
      <CatPilot />{" "}
      {cards.length ? (
        <CatOffer offer={offer} />
      ) : (
        <CatEmpty
          text={{
            h2: `Nog geen ${nouns.plural} in ${placeName}`,
            p: place
              ? `Er staan hier nog geen ${nouns.plural} met een datum. Kijk in heel Nederland, of kom later terug.`
              : `Er staan nog geen ${nouns.plural} met een datum. Kom later terug.`,
          }}
          link={
            place && category
              ? {
                  href: routes.category(category.slug),
                  label: `${nouns.title} in heel Nederland`,
                }
              : null
          }
        />
      )}{" "}
      <CatSeo
        heading={seo.heading}
        blocks={seo.blocks}
        werktekst={!ownSeo}
        image={seoImage}
      />{" "}
      <CatFaq
        heading={`Veelgestelde vragen over ${nouns.plural} in ${placeName}`}
        faq={faq}
      />{" "}
      <CatFurther
        links={furtherLinks(ctx, all)}
        giverHeading={
          place
            ? `Geef jij ${nouns.plural} in ${placeName}?`
            : `Geef jij ${nouns.plural}?`
        }
        giverText={giverText(category?.slug ?? null)}
      />
      <JsonLd data={ld} />
    </PageFrame>
  );
}
