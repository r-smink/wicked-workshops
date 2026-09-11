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
    getProviderProfile(user.id),
    getCategories(),
    getCities(),
  ]);
  const displayName = provider?.display_name || [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email || "Aanbieder";
  const providerWithFallback = provider
    ? { ...provider, display_name: provider.display_name || displayName }
    : { id: null, display_name: displayName, location_name: "", profession: "" };
  return (
    <Dashboard
      initialView="wizard"
      nav={DASH_NAV}
      titles={DASH_TITLES}
      provider={providerWithFallback}
      categories={categories}
      cities={cities}
    />
  );
}
