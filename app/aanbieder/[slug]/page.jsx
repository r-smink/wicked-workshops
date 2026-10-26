import PublicLayout from "@/components/PublicLayout";
import ProviderPage from "@/components/pages/ProviderPage";
import { Templated } from "@/components/BuilderPage";
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
      <Templated pageType="aanbieder" ctx={{ provider }}>
        <ProviderPage workshops={workshops} reviews={reviews} />
      </Templated>
    </PublicLayout>
  );
}
