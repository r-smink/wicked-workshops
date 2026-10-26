import PublicLayout from "@/components/PublicLayout";
import HomePage from "@/components/pages/HomePage";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import VisualEditing from "@/components/VisualEditing";
import { getCategories, getFeatured } from "@/lib/directus";
import { loadPageTemplate } from "@/lib/page-builder";

export const revalidate = 60;

/* Is er in Directus een gepubliceerde homepage (page_type "home"), dan
   bestaat de homepage uit die blokken. Anders het vaste HomePage-scherm. */
export default async function Page() {
  const template = await loadPageTemplate("home");
  if (template) {
    return (
      <PublicLayout>
        <BlockRenderer blocks={template.blocks} />
        <VisualEditing directusUrl={process.env.DIRECTUS_URL} />
      </PublicLayout>
    );
  }

  const [categories, featured] = await Promise.all([
    getCategories(),
    getFeatured(),
  ]);
  return (
    <PublicLayout>
      <HomePage categories={categories} featured={featured} />
    </PublicLayout>
  );
}
