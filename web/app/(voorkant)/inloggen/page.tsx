import type { Metadata } from "next";
import { PageFrame } from "@/components/voorkant/PageFrame";
import { LoginPage } from "@/components/voorkant/inloggen/LoginPage";
import { safeNext } from "@/lib/account/redirect";
import { pageMetadata } from "@/lib/voorkant/seo";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Inloggen",
    description: "Log in bij Wicked Workshops als deelnemer of als workshopgever, met een link in je mail of met je wachtwoord.",
    path: routes.login,
  }),
  robots: { index: false, follow: true },
};

type Search = { email?: string | string[]; bevestigd?: string | string[]; next?: string | string[]; tab?: string | string[]; rol?: string | string[] };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

/* ?email= (voorgevuld), ?bevestigd=1 (na de bevestigingslink), ?next= (alleen
   een intern pad, lib/account/redirect.ts), ?tab=provider of ?rol=gever
   (workshopgever voorgekozen). */
export default async function Page({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const providerFirst = one(sp.tab) === "provider" || one(sp.rol) === "gever";
  return (
    <PageFrame id="inloggen">
      <LoginPage initialEmail={one(sp.email).slice(0, 254)} confirmed={one(sp.bevestigd) === "1"} next={safeNext(one(sp.next))} providerFirst={providerFirst} />
    </PageFrame>
  );
}
