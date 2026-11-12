import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageFrame } from "@/components/voorkant/PageFrame";
import { JsonLd } from "@/components/voorkant/JsonLd";
import { DetailPage, deriveDescription } from "@/components/voorkant/detail/DetailPage";
import { getDetailExtra } from "@/components/voorkant/detail/server";
import { getProvider, getPublicSettings, getReviews, getWorkshop, getWorkshopCards, getWorkshopSlugs } from "@/lib/voorkant/data";
import { breadcrumbLd, faqLd, pageMetadata, workshopLd } from "@/lib/voorkant/seo";
import { ALL_PLACES, routes } from "@/lib/routes";

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getWorkshopSlugs();
  return slugs.map((slug) => ({ slug }));
}

/* Workshop zonder verborgen groepsdatums (alleen te boeken met de link van het team). */
async function load(slug: string) {
  const [w, extra] = await Promise.all([getWorkshop(slug), getDetailExtra(slug)]);
  if (!w) return null;
  const hidden = new Set(extra.privateSessionIds);
  return { w: { ...w, sessions: w.sessions.filter((s) => !hidden.has(s.id)) }, policy: extra.policy };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const w = await getWorkshop(slug);
  if (!w) return { title: "Workshop niet gevonden" };
  return pageMetadata({
    title: w.seoTitle || (w.city ? `${w.title} in ${w.city.name}` : w.title),
    description: w.seoDescription || deriveDescription(w),
    path: routes.workshop(w.slug),
    image: w.gallery[0]?.src ?? w.image,
  });
}

export default async function Page({ params }: Params) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) notFound();
  const { w, policy } = data;
  const [provider, reviews, settings, providerCards] = await Promise.all([
    w.provider ? getProvider(w.provider.slug) : Promise.resolve(null),
    getReviews({ workshopSlug: w.slug, limit: 6 }),
    getPublicSettings(),
    w.provider ? getWorkshopCards({ providerSlug: w.provider.slug }) : Promise.resolve([]),
  ]);

  const path = routes.workshop(w.slug);
  const crumbs = [
    { name: "Home", path: "/" },
    ...(w.category ? [{ name: w.category.name, path: routes.category(w.category.slug, ALL_PLACES) }] : []),
    ...(w.category && w.city ? [{ name: `${w.category.name} in ${w.city.name}`, path: routes.category(w.category.slug, w.city.slug) }] : []),
    { name: w.title, path },
  ];

  return (
    <PageFrame id="detail">
      <JsonLd data={[...workshopLd(w, path, reviews), breadcrumbLd(crumbs), faqLd(w.faq)]} />
      <DetailPage
        w={w}
        provider={provider}
        providerWorkshops={providerCards.length}
        reviews={reviews}
        policy={policy}
        paymentMode={settings.paymentMode}
      />
    </PageFrame>
  );
}
