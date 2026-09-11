import { redirect } from "next/navigation";
import Dashboard from "@/components/pages/Dashboard";
import { requireAuth } from "@/lib/auth";
import { DASH_NAV, DASH_TITLES } from "@/lib/directus";

export const metadata = { title: "Profiel" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await requireAuth();
  if (!user) redirect("/inloggen?tab=provider");

  return (
    <Dashboard
      initialView="profile"
      nav={DASH_NAV}
      titles={DASH_TITLES}
    />
  );
}
