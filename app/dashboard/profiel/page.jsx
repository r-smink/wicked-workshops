import { redirect } from "next/navigation";
import Dashboard from "@/components/pages/Dashboard";
import { requireAuth } from "@/lib/auth";
import { getProviderProfile, getCities, createProviderForUser, DASH_NAV, DASH_TITLES } from "@/lib/directus";

export const metadata = { title: "Profiel" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await requireAuth();
  if (!user) redirect("/inloggen?tab=provider");

  let provider = await getProviderProfile(user.id);
  if (!provider) {
    await createProviderForUser(user);
    provider = await getProviderProfile(user.id);
  }

  const cities = await getCities();
  const displayName = provider?.display_name
    || [user.first_name, user.last_name].filter(Boolean).join(" ")
    || user.email
    || "Aanbieder";
  const providerWithFallback = provider
    ? { ...provider, display_name: provider.display_name || displayName }
    : { id: null, display_name: displayName, location_name: "", profession: "" };

  return (
    <Dashboard
      initialView="profile"
      nav={DASH_NAV}
      titles={DASH_TITLES}
      provider={providerWithFallback}
      cities={cities}
      user={{
        id: user.id,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
      }}
    />
  );
}
