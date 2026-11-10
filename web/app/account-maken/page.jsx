import AuthPage from "@/components/pages/AuthPage";
import { SIDE_COPY } from "@/lib/mock-data";
import { getCities } from "@/lib/directus";
import { Templated } from "@/components/BuilderPage";

export const metadata = { title: "Maak een account" };

/* Account maken zonder boeking (docs/06 scherm 6). */
export default async function Page({ searchParams }) {
  const { tab, email, next } = await searchParams;
  const cities = await getCities();
  return (
    <Templated pageType="account">
      <AuthPage
        tab={tab === "provider" ? "provider" : "visitor"}
        initialMode="signup"
        sideCopy={SIDE_COPY}
        cities={cities}
        initialEmail={typeof email === "string" ? email.slice(0, 254) : ""}
        next={typeof next === "string" ? next : ""}
      />
    </Templated>
  );
}
