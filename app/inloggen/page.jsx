import AuthPage from "@/components/pages/AuthPage";
import { SIDE_COPY } from "@/lib/mock-data";
import { getCities } from "@/lib/directus";

export const metadata = { title: "Inloggen of aanmelden" };

export default async function Page({ searchParams }) {
  const { tab } = await searchParams;
  const cities = await getCities();
  return <AuthPage tab={tab === "provider" ? "provider" : "visitor"} sideCopy={SIDE_COPY} cities={cities} />;
}
