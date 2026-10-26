import PublicLayout from "@/components/PublicLayout";
import GiftCardPage from "@/components/pages/GiftCardPage";
import { getPage } from "@/lib/directus";

export const revalidate = 60;

export const metadata = {
  title: "Cadeaubon",
  description: "De ontvanger kiest zelf de workshop en de datum. Eén jaar geldig, kosteloos verzetten.",
};

export default async function Page() {
  const page = await getPage("cadeaubon");
  return (
    <PublicLayout>
      <GiftCardPage page={page} />
    </PublicLayout>
  );
}
