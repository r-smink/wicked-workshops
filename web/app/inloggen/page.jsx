import AuthPage from "@/components/pages/AuthPage";
import { SIDE_COPY } from "@/lib/mock-data";
import { getCities } from "@/lib/directus";
import { Templated } from "@/components/BuilderPage";

export const metadata = { title: "Inloggen of aanmelden" };

/* ?tab=provider, ?email= (voorgevuld), ?bevestigd=1 (na de bevestigingslink),
   ?next= (intern pad om na inloggen naartoe te gaan, docs/04). */
export default async function Page({ searchParams }) {
  const { tab, email, bevestigd, next } = await searchParams;
  const cities = await getCities();
  return (
    <Templated pageType="account">
      <AuthPage
        tab={tab === "provider" ? "provider" : "visitor"}
        sideCopy={SIDE_COPY}
        cities={cities}
        initialEmail={typeof email === "string" ? email.slice(0, 254) : ""}
        confirmed={bevestigd === "1"}
        next={typeof next === "string" ? next : ""}
      />
    </Templated>
  );
}
