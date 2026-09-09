import PublicLayout from "@/components/PublicLayout";
import ProviderPage from "@/components/pages/ProviderPage";
import { getProvider, getProviderWorkshops, getProviderReviews } from "@/lib/directus";

export const revalidate = 60;

export default async function Page({ params }) {
  const { slug } = await params;
  const [provider, workshops, reviews] = await Promise.all([
    getProvider(slug),
    getProviderWorkshops(slug),
    getProviderReviews(slug),
  ]);
  return (
    <PublicLayout>
      <ProviderPage workshops={workshops} reviews={reviews} />
    </PublicLayout>
  );
}
