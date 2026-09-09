import PublicLayout from "@/components/PublicLayout";
import WorkshopPage from "@/components/pages/WorkshopPage";
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
      <WorkshopPage
        workshop={workshop}
        sessions={sessions}
        reviews={reviews}
        faq={faq}
        listing={listing}
      />
    </PublicLayout>
  );
}
