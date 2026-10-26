import PublicLayout from "@/components/PublicLayout";
import ListingPage from "@/components/pages/ListingPage";
import { getListing } from "@/lib/directus";

export const revalidate = 60;

export default async function Page() {
  const listing = await getListing();
  return (
    <PublicLayout>
      <ListingPage listing={listing} />
    </PublicLayout>
  );
}
