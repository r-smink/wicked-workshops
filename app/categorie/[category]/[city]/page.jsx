import PublicLayout from "@/components/PublicLayout";
import ListingPage from "@/components/pages/ListingPage";
import { getCategory, getListing } from "@/lib/directus";

export const revalidate = 60;

export default async function Page({ params }) {
  const { category, city } = await params;
  const [cat, listing] = await Promise.all([
    getCategory(category),
    getListing(),
  ]);
  return (
    <PublicLayout>
      <ListingPage category={cat} listing={listing} />
    </PublicLayout>
  );
}
