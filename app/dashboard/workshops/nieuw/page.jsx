import Dashboard from "@/components/pages/Dashboard";
import { DASH_NAV, DASH_TITLES } from "@/lib/directus";

export const metadata = { title: "Nieuwe workshop" };

export default function Page() {
  return (
    <Dashboard
      initialView="wizard"
      nav={DASH_NAV}
      titles={DASH_TITLES}
    />
  );
}
