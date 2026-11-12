import { PageFrame } from "@/components/voorkant/PageFrame";
import { JsonLd } from "@/components/voorkant/JsonLd";
import { organizationLd, pageMetadata } from "@/lib/voorkant/seo";
import { getHomeData } from "@/components/voorkant/home/home-data";
import { Hero } from "@/components/voorkant/home/Hero";
import { Showcase } from "@/components/voorkant/home/Showcase";
import { Categories } from "@/components/voorkant/home/Categories";
import { Weekend, dayAnchor, weekendDays } from "@/components/voorkant/home/Weekend";
import { Nearby, Reviews } from "@/components/voorkant/home/Nearby";
import { BecomeGiver, GiftCard, HowDatesWork, PilotBand, TeamOuting } from "@/components/voorkant/home/StaticSections";

export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Workshops en uitjes om iets wicked te doen",
  description:
    "Van gevestigde kookstudio's tot de buurman die de beste zuurdesem van de stad bakt. Boek workshops en uitjes in heel Nederland, zonder boekingskosten.",
  path: "/",
  image: "/img/ambacht.jpg",
});

export default async function Page() {
  const d = await getHomeData();
  /* Dagen uit de dagstrook die ook in "Dit weekend" staan, scrollen daarheen. */
  const anchors = Object.fromEntries(weekendDays(d.weekendSessions, d.weekend.from).map(({ day }) => [day, dayAnchor(day)]));
  return (
    <PageFrame id="home">
      <JsonLd data={organizationLd()} />
      <Hero categories={d.categories} cities={d.cities} search={d.search} stripDays={d.stripDays} weekendDays={anchors} />{" "}
      <Showcase cards={d.showcase} total={d.total} /> <Categories categories={d.categories} />{" "}
      <Weekend sessions={d.weekendSessions} from={d.weekend.from} to={d.weekend.to} /> <HowDatesWork /> <PilotBand />{" "}
      <Nearby cities={d.cities} /> <Reviews reviews={d.reviews} /> <TeamOuting /> <BecomeGiver /> <GiftCard />
    </PageFrame>
  );
}
