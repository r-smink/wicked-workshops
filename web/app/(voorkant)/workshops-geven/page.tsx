import { PageFrame } from "@/components/voorkant/PageFrame";
import { JsonLd } from "@/components/voorkant/JsonLd";
import { MAKER_FAQ, MakerContent } from "@/components/voorkant/maker/MakerContent";
import { toVenueCards } from "@/components/voorkant/locatie/venues";
import { getPublicSettings, getVenues } from "@/lib/voorkant/data";
import { getPlatformSettings } from "@/lib/directus/settings";
import { breadcrumbLd, faqLd, pageMetadata } from "@/lib/voorkant/seo";
import { routes } from "@/lib/routes";

export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Workshops geven, ook zonder eigen bedrijf",
  description: "Geef je eerste workshop op Wicked Workshops. Geen btw-nummer of vaste kosten nodig: begin met je e-mailadres en zet je workshop klaar in zes stappen.",
  path: routes.giver,
  image: "/img/maker-les.jpg",
});

export default async function Page() {
  const [settings, platform, venues] = await Promise.all([getPublicSettings(), getPlatformSettings(), getVenues(3)]);
  /* Locatie gezocht uit (feature_venues): geen ruimtes tonen, wel de sectie
     met de lege staat en de link naar /ruimte-gezocht. */
  const cards = settings.venuesEnabled ? toVenueCards(venues).slice(0, 3) : [];
  return (
    <PageFrame id="maker">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Home", path: routes.home },
            { name: "Word workshopgever", path: routes.giver },
          ]),
          faqLd(MAKER_FAQ),
        ]}
      />
      <MakerContent venues={cards} social={platform.features.authSocial} />
    </PageFrame>
  );
}
