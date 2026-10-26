import PublicLayout from "@/components/PublicLayout";
import WorkshopPage from "@/components/pages/WorkshopPage";
import { Templated } from "@/components/BuilderPage";
import { getWorkshop, getSessions, getReviews, getFaq, getListing } from "@/lib/directus";

export const revalidate = 60;

export default async function Page({ params }) {
  const { slug } = await params;
  const [workshop, sessions, reviews, faq, listing] = await Promise.all([
    getWorkshop(slug),
    getSessions(slug),
    getReviews(slug),
    getFaq(slug),
    getListing(),
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
        />
      </Templated>
    </PublicLayout>
  );
}
