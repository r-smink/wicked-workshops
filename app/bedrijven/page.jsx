import PublicLayout from "@/components/PublicLayout";
import BusinessPage from "@/components/pages/BusinessPage";
import { getPage } from "@/lib/directus";

export const revalidate = 60;

export const metadata = {
  title: "Voor bedrijven",
  description: "Van 5 tot 500 personen. Eén contactpunt, één factuur met btw. Voorstel binnen 1 werkdag.",
};

export default async function Page() {
  const page = await getPage("bedrijven");
  return (
    <PublicLayout>
      <BusinessPage page={page} />
    </PublicLayout>
  );
}
