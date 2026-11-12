import Image from "next/image";
import { routes, ALL_CATEGORIES } from "@/lib/routes";
import { dateShort, weekdayShort } from "@/lib/voorkant/format";
import type { CategoryView, CityView } from "@/lib/voorkant/data";
import { HeroFrame } from "./HeroFrame";
import { HeroSearch, type Choice, type SearchItem } from "./HeroSearch";
import { DayStrip, type StripDay } from "./DayStrip";
import { SIZES } from "./parts";

/* Volgorde en keuze van de chips uit het ontwerp; wat Directus heeft, telt. */
const WAT_ORDER = ["koken-en-bakken", "keramiek-en-klei", "ambacht-en-maken", "drinks-en-proeverijen", "actief-en-buiten"];
const WAAR_ORDER = ["amsterdam", "rotterdam", "utrecht", "den-haag", "eindhoven"];

function pick<T extends { slug: string; name: string }>(list: T[], order: string[], max: number): Choice[] {
  const rank = (slug: string) => (order.includes(slug) ? order.indexOf(slug) : order.length);
  return [...list]
    .sort((a, b) => rank(a.slug) - rank(b.slug))
    .slice(0, max)
    .map((x) => ({ k: x.slug, v: x.name }));
}

export function Hero({
  categories,
  cities,
  search,
  stripDays,
  weekendDays,
}: {
  categories: CategoryView[];
  cities: CityView[];
  search: SearchItem[];
  stripDays: { day: string; count: number }[];
  /* isoDay -> anker in "Dit weekend" */
  weekendDays: Record<string, string>;
}) {
  const days: StripDay[] = stripDays.map(({ day, count }) => {
    const iso = `${day}T12:00:00Z`;
    return {
      key: day,
      weekday: weekdayShort(iso),
      date: dateShort(iso).split(" ")[0]!,
      count,
      href: weekendDays[day] ? `#${weekendDays[day]}` : `${routes.category(ALL_CATEGORIES)}?dag=${day}`,
    };
  });
  const wat = pick(categories.filter((c) => WAT_ORDER.includes(c.slug)), WAT_ORDER, 5);
  const waar = pick(cities, WAAR_ORDER, 5);

  return (
    <HeroFrame>
      {" "}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
        <defs>
          <symbol id="home-a-door" viewBox="0 0 22 22">
            <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 2.4l2.2 1.7 2.8-.2.9 2.6 2.3 1.6-.9 2.7.9 2.7-2.3 1.6-.9 2.6-2.8-.2L11 19.6l-2.2-1.7-2.8.2-.9-2.6-2.3-1.6.9-2.7-.9-2.7 2.3-1.6.9-2.6 2.8.2z" />
              <path d="M7.7 11.2l2.2 2.2 4.4-4.5" />
            </g>
          </symbol>
        </defs>
      </svg>{" "}
      <section className="home-a-hero">
        {" "}
        <div className="home-a-hero-img">
          {" "}
          <Image src="/img/ambacht.jpg" alt="Twee makers werken aan sieraden aan een grote werktafel in een licht atelier" width={1800} height={1200} sizes="100vw" priority />{" "}
        </div>{" "}
        <div className="home-a-hero-in">
          {" "}
          <h1>
            Workshops en uitjes om iets <span className="home-a-mark">wicked</span> te doen
          </h1>{" "}
          <p className="home-a-wig">
            Van gevestigde kookstudio&apos;s tot de buurman die de beste zuurdesem van de stad bakt. <b>Bij ons mag allebei</b>, ook zonder
            btw-nummer en ook in een dorp waar verder niets te boeken valt.
          </p>{" "}
          <HeroSearch categories={wat} places={waar} items={search} />{" "}
          <div className="van-b home-d-dagen">
            {" "}
            <p className="home-b-dagen-kop" id="home-b-dagen-kop">
              Of begin bij een dag
            </p>{" "}
            <DayStrip days={days} moreHref={routes.category(ALL_CATEGORIES)} />{" "}
          </div>{" "}
          <p className="home-a-facts home-d-facts">
            {" "}
            <span>
              <svg width="17" height="17" aria-hidden="true">
                <use href="#i-zero" />
              </svg>{" "}
              Boekingskosten €0, altijd
            </span>{" "}
          </p>{" "}
        </div>{" "}
      </section>{" "}
    </HeroFrame>
  );
}

