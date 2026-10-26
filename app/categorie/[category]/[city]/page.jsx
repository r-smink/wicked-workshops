import PublicLayout from "@/components/PublicLayout";
import ListingPage from "@/components/pages/ListingPage";
import { Templated } from "@/components/BuilderPage";
import { getCategory, getListing, getCities } from "@/lib/directus";

export const revalidate = 60;

export default async function Page({ params }) {
  const { category, city } = await params;
  const [cat, listing, cities] = await Promise.all([
    getCategory(category),
    getListing(),
    getCities(),
  ]);
  const place = cities.find((c) => c.slug === city) || null;
  return (
    <PublicLayout>
      <Templated pageType="cat" ctx={{ category: cat, city: place }}>
        <ListingPage category={cat} listing={listing} />
      </Templated>
    </PublicLayout>
  );
}
