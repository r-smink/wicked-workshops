import Dashboard from "@/components/pages/Dashboard";
import {
  DASH_NAV, DASH_TITLES,
  getProviderProfile, getCategories, getCities, getWorkshopById,
} from "@/lib/directus";

export const metadata = { title: "Workshop bewerken" };
export const revalidate = 60;

export default async function Page({ params }) {
  const { id } = params;
  const [provider, categories, cities, workshop] = await Promise.all([
    getProviderProfile(),
    getCategories(),
    getCities(),
    getWorkshopById(id),
  ]);
  return (
    <Dashboard
      initialView="wizard"
      nav={DASH_NAV}
      titles={DASH_TITLES}
      provider={provider}
      categories={categories}
      cities={cities}
      initialWorkshop={workshop}
    />
  );
}
