import { notFound } from "next/navigation";
import PublicLayout from "@/components/PublicLayout";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import VisualEditing from "@/components/VisualEditing";
import { loadBuilderPage, loadPageTemplate, builderMetadata } from "@/lib/page-builder";

/* Server-helpers voor routes die met page builder-blokken werken. */

/* Builderpagina met een eigen route (/hulp, /word-workshopgever, ...). */
export default async function BuilderPage({ slug }) {
  const page = await loadBuilderPage(slug);
  if (!page) notFound();
  return (
    <PublicLayout>
      <BlockRenderer blocks={page.blocks} />
      <VisualEditing directusUrl={process.env.DIRECTUS_URL} />
    </PublicLayout>
  );
}

export async function builderPageMetadata(slug) {
  return builderMetadata(await loadBuilderPage(slug));
}

/* Bestaande route met optioneel sjabloon: staat er in Directus een
   gepubliceerde pagina met dit page_type, dan komen de blokken rond het
   vaste scherm (`core`). Anders alleen het vaste scherm, zoals voorheen. */
export async function Templated({ pageType, ctx = {}, children }) {
  const template = await loadPageTemplate(pageType, ctx);
  if (!template) return children;
  return (
    <>
      <BlockRenderer blocks={template.blocks} core={children} />
      <VisualEditing directusUrl={process.env.DIRECTUS_URL} />
    </>
  );
}
