import { redirect } from "next/navigation";
import Dashboard from "@/components/pages/Dashboard";
import { requireAuth } from "@/lib/auth";
import {
  DASH_NAV, DASH_TITLES,
  getProviderProfile, getCategories, getCities, getWorkshopById,
} from "@/lib/directus";

export const metadata = { title: "Workshop bewerken" };
export const dynamic = "force-dynamic";

export default async function Page({ params }) {
  const user = await requireAuth();
  if (!user) redirect("/inloggen?tab=provider");

  const { id } = await params;
  const [provider, categories, cities, workshop] = await Promise.all([
    getProviderProfile(user.id),
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
