import { notFound } from "next/navigation";
import PublicLayout from "@/components/PublicLayout";
import StaticPage from "@/components/pages/StaticPage";
import { getSeoPage, getSeoPageSlugs } from "@/lib/directus";

export const revalidate = 60;

/* Pre-render alle bekende SEO-landingspagina's. Zonder Directus valt
   dit terug op de mock-data slug's uit lib/mock-data.js. */
export async function generateStaticParams() {
  const slugs = await getSeoPageSlugs();
  return slugs.map((slug) => ({ slug }));
}

/* SEO-metadata per landingspagina. */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = await getSeoPage(slug);
  if (!page) return {};
  return {
    title: page.seo_title || page.title,
    description: page.seo_description || page.hero_subtitle || "",
    openGraph: {
      title: page.seo_title || page.title,
      description: page.seo_description || page.hero_subtitle || "",
      ...(page.hero_image ? { images: [{ url: page.hero_image }] } : {}),
    },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const page = await getSeoPage(slug);
  if (!page) notFound();
  return (
    <PublicLayout>
      <StaticPage page={page} />
    </PublicLayout>
  );
}
