import PublicLayout from "@/components/PublicLayout";
import WorkshopPage from "@/components/pages/WorkshopPage";
import { Templated } from "@/components/BuilderPage";
import { getWorkshop, getSessions, getReviews, getFaq, getListing } from "@/lib/directus";
import { getPlatformSettings } from "@/lib/directus/settings";

export const revalidate = 60;

export default async function Page({ params }) {
  const { slug } = await params;
  const [workshop, sessions, reviews, faq, listing, settings] = await Promise.all([
    getWorkshop(slug),
    getSessions(slug),
    getReviews(slug),
    getFaq(slug),
    getListing(),
    getPlatformSettings(),
  ]);
  return (
    <PublicLayout>
      <Templated
        pageType="detail"
        ctx={{
          workshop,
          category: workshop.categoryId ? { id: workshop.categoryId, name: workshop.categoryName } : null,
          provider: workshop.provider,
        }}
      >
        <WorkshopPage
          workshop={workshop}
          sessions={sessions}
          reviews={reviews}
          faq={faq}
          listing={listing}
          paymentMode={settings.paymentMode}
        />
      </Templated>
    </PublicLayout>
  );
}
