import { PageFrame } from "@/components/voorkant/PageFrame";
import { JsonLd } from "@/components/voorkant/JsonLd";
import { LOCATIE_FAQ, LocatieContent } from "@/components/voorkant/locatie/LocatieContent";
import { toVenueCards } from "@/components/voorkant/locatie/venues";
import { getPublicSettings, getVenues } from "@/lib/voorkant/data";
import { breadcrumbLd, faqLd, pageMetadata } from "@/lib/voorkant/seo";
import { routes } from "@/lib/routes";

export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Ruimte gezocht: keuken, atelier of zaal voor je workshop",
  description: "Zoek je een ruimte voor je workshop, of staat jouw keuken, atelier of zaal vaak leeg? Bekijk ruimtes en vrije dagdelen, of meld je ruimte aan.",
  path: routes.room,
  image: "/img/locatie-keuken.jpg",
});

export default async function Page() {
  const [settings, venues] = await Promise.all([getPublicSettings(), getVenues()]);
  /* Locatie gezocht staat uit (feature_venues): de pagina en formulieren
     blijven werken, alleen de ruimtelijst wordt niet getoond. */
  const cards = settings.venuesEnabled ? toVenueCards(venues) : [];
  return (
    <PageFrame id="locatie">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Home", path: routes.home },
            { name: "Word workshopgever", path: routes.giver },
            { name: "Locatie gezocht", path: routes.room },
          ]),
          faqLd(LOCATIE_FAQ),
        ]}
      />
      <LocatieContent venues={cards} />
    </PageFrame>
  );
}
