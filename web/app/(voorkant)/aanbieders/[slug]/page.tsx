import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageFrame } from "@/components/voorkant/PageFrame";
import { JsonLd } from "@/components/voorkant/JsonLd";
import { AanbiederPage, heading, type Crumb } from "@/components/voorkant/aanbieder/AanbiederPage";
import { getProviderExtras, getProviderRatings } from "@/components/voorkant/aanbieder/data";
import { getProvider, getProviderSlugs, getReviews, getWorkshopCards, type ProviderDetail, type WorkshopCard } from "@/lib/voorkant/data";
import { breadcrumbLd, pageMetadata, providerLd } from "@/lib/voorkant/seo";
import { ALL_PLACES, routes } from "@/lib/routes";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getProviderSlugs();
  return slugs.map((slug) => ({ slug }));
}

/* Kruimel: de categorie waarin de aanbieder de meeste workshops heeft, in
   de eigen plaats (zoals "Koken & bakken" in Utrecht in het ontwerp). */
function crumbOf(p: ProviderDetail, cards: WorkshopCard[]): Crumb | null {
  const count = new Map<string, { name: string; slug: string; n: number }>();
  for (const w of cards) {
    if (!w.category) continue;
    const e = count.get(w.category.slug) ?? { ...w.category, n: 0 };
    e.n += 1;
    count.set(w.category.slug, e);
  }
  const top = [...count.values()].sort((a, b) => b.n - a.n)[0];
  if (!top) return null;
  const place = p.city?.slug ?? cards.find((w) => w.city)?.city?.slug ?? ALL_PLACES;
  return { name: top.name, href: routes.category(top.slug, place) };
}

function describe(p: ProviderDetail, cards: WorkshopCard[]): string {
  if (p.seoDescription) return p.seoDescription;
  if (p.bioShort) return p.bioShort;
  const where = p.city?.name ? ` in ${p.city.name}` : "";
  const titles = cards.slice(0, 3).map((w) => w.title).join(", ");
  const text = cards.length
    ? `${p.name} geeft ${cards.length === 1 ? "een workshop" : `${cards.length} workshops`}${where}: ${titles}. Bekijk alle datums, wie er al meedoet en de reviews.`
    : `Het profiel van ${p.name}${where} op Wicked Workshops. Volg ${p.name} en krijg een mail bij een nieuwe datum.`;
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}...` : text;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [p, cards] = await Promise.all([getProvider(slug), getWorkshopCards({ providerSlug: slug })]);
  if (!p) return { title: "Aanbieder niet gevonden", robots: { index: false } };
  const title = p.seoTitle || `${heading(p, p.city?.name ?? null)}`;
  return pageMetadata({ title, description: describe(p, cards), path: routes.provider(slug), image: p.image });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const provider = await getProvider(slug);
  if (!provider) notFound();
  const [cards, reviews, ratings, extras] = await Promise.all([
    getWorkshopCards({ providerSlug: slug }),
    getReviews({ providerSlug: slug, limit: 40 }),
    getProviderRatings(slug),
    getProviderExtras(slug),
  ]);
  const crumb = crumbOf(provider, cards);
  const path = routes.provider(slug);

  return (
    <PageFrame id="aanbieder">
      <JsonLd
        data={[
          providerLd(provider, path),
          breadcrumbLd([
            { name: "Home", path: "/" },
            ...(crumb ? [{ name: crumb.name, path: crumb.href }] : []),
            { name: provider.name, path },
          ]),
        ]}
      />
      <AanbiederPage provider={provider} extras={extras} cards={cards} reviews={reviews} ratings={ratings} crumb={crumb} />
    </PageFrame>
  );
}
