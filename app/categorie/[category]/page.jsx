import PublicLayout from "@/components/PublicLayout";
import ListingPage from "@/components/pages/ListingPage";
import { Templated } from "@/components/BuilderPage";
import { getCategory, getListing } from "@/lib/directus";

export const revalidate = 60;

export default async function Page({ params }) {
  const { category } = await params;
  const [cat, listing] = await Promise.all([
    getCategory(category),
    getListing(),
  ]);
  return (
    <PublicLayout>
      <Templated pageType="cat" ctx={{ category: cat }}>
        <ListingPage category={cat} listing={listing} />
      </Templated>
    </PublicLayout>
  );
}
