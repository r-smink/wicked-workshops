import Dashboard from "@/components/pages/Dashboard";
import { DASH_NAV, DASH_TITLES } from "@/lib/directus";

export const metadata = { title: "Profiel" };

export default function Page() {
  return (
    <Dashboard
      initialView="profile"
      nav={DASH_NAV}
      titles={DASH_TITLES}
    />
  );
}
