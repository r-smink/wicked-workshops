import PublicLayout from "@/components/PublicLayout";
import HomePage from "@/components/pages/HomePage";
import { getCategories, getFeatured } from "@/lib/directus";

export const revalidate = 60;

export default async function Page() {
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
