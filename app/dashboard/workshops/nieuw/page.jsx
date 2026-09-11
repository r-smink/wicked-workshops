import Dashboard from "@/components/pages/Dashboard";
import {
  DASH_NAV, DASH_TITLES,
  getProviderProfile, getCategories,
} from "@/lib/directus";

export const metadata = { title: "Nieuwe workshop" };
export const revalidate = 60;

export default async function Page() {
  const [provider, categories] = await Promise.all([
    getProviderProfile(),
    getCategories(),
  ]);
  return (
    <Dashboard
      initialView="wizard"
      nav={DASH_NAV}
      titles={DASH_TITLES}
      provider={provider}
      categories={categories}
    />
  );
}
