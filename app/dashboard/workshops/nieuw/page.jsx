import { redirect } from "next/navigation";
import Dashboard from "@/components/pages/Dashboard";
import { requireAuth } from "@/lib/auth";
import {
  DASH_NAV, DASH_TITLES,
  getProviderProfile, getCategories, getCities,
} from "@/lib/directus";

export const metadata = { title: "Nieuwe workshop" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await requireAuth();
  if (!user) redirect("/inloggen?tab=provider");

  const [provider, categories, cities] = await Promise.all([
    getProviderProfile(),
    getCategories(),
    getCities(),
  ]);
  return (
    <Dashboard
      initialView="wizard"
      nav={DASH_NAV}
      titles={DASH_TITLES}
      provider={provider}
      categories={categories}
      cities={cities}
    />
  );
}
