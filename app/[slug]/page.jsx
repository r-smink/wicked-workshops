import { notFound } from "next/navigation";
import PublicLayout from "@/components/PublicLayout";
import StaticPage from "@/components/pages/StaticPage";
import VisualEditing from "@/components/VisualEditing";
import { getContentPage, getContentPageSlugs, getSeoPage, getSeoPageSlugs } from "@/lib/directus";

export const revalidate = 60;

/* Pre-render de bekende pagina's: content-pagina's uit de `pages`-collectie
   plus de mock SEO-landingspagina's. Nieuwe pagina's verschijnen via ISR
   binnen ~60 seconden na publiceren. */
export async function generateStaticParams() {
  const [pageSlugs, seoSlugs] = await Promise.all([getContentPageSlugs(), getSeoPageSlugs()]);
  return [...new Set([...pageSlugs, ...seoSlugs])].map((slug) => ({ slug }));
}

/* SEO-metadata per pagina. */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = (await getContentPage(slug)) || (await getSeoPage(slug));
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
  const page = (await getContentPage(slug)) || (await getSeoPage(slug));
  if (!page) notFound();
  return (
    <PublicLayout>
      <StaticPage page={page} />
      <VisualEditing directusUrl={process.env.DIRECTUS_URL} />
    </PublicLayout>
  );
}
