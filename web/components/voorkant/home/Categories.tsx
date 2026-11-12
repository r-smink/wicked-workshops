import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { ALL_CATEGORIES, routes } from "@/lib/routes";
import type { CategoryView } from "@/lib/voorkant/data";
import { Arrow, SIZES, unoptimized } from "./parts";

/* "Waar heb je zin in?": de hoofdcategorieen uit Directus, in de volgorde en
   het raster van het ontwerp (vier brede tegels). */

const ORDER = [
  "koken-en-bakken", "drinks-en-proeverijen", "bloemen-en-groen", "fotografie-en-media", "dans-muziek-en-theater", "keramiek-en-klei",
  "ambacht-en-maken", "wellness-en-beauty", "actief-en-buiten", "niche-en-onverwacht", "duurzaam-en-repair", "schilderen-en-kunst",
];
const WIDE = new Set([0, 5, 6, 11]);

/* Alt-tekst bij het terugvalbeeld uit het ontwerp. */
const ALT: Record<string, string> = {
  "koken-en-bakken": "Twee deelnemers roeren saus in een pan tijdens een kookworkshop",
  "drinks-en-proeverijen": "Proefkaart met wijnglazen en een plank kaas",
  "bloemen-en-groen": "Twee mensen in schort houden verse bloemen vast",
  "fotografie-en-media": "Groep volgt een fotografieles in een studio",
  "dans-muziek-en-theater": "Dansers in beweging in een studio",
  "keramiek-en-klei": "Handen rollen een streng klei op een werktafel",
  "ambacht-en-maken": "Iemand werkt met een tang aan een sieraad in een werkplaats",
  "wellness-en-beauty": "Deelnemers staan met de handen samen tijdens een yogales in een lichte studio",
  "actief-en-buiten": "Wandelaars tussen hoge dennenbomen",
  "niche-en-onverwacht": "Twee mensen gieten samen een warme vloeistof over in een ketel",
  "duurzaam-en-repair": "Vrouw werkt aan een werkbank in een houtwerkplaats",
  "schilderen-en-kunst": "Iemand schildert aan een tafel vol blauwe doeken",
};

const countLabel = (n: number) => (n ? `${n} ${n === 1 ? "workshop" : "workshops"}` : "Nog geen workshops");

export function Categories({ categories }: { categories: (CategoryView & { count: number })[] }) {
  if (!categories.length) return null;
  const rank = (slug: string) => (ORDER.includes(slug) ? ORDER.indexOf(slug) : ORDER.length);
  const list = [...categories].sort((a, b) => rank(a.slug) - rank(b.slug));
  return (
    <div className="van-a">
      {" "}
      <section className="sec" style={{ paddingTop: "clamp(18px,2.2cqi,32px)" }}>
        {" "}
        <div className="wrap sec-head">
          {" "}
          <div>
            {" "}
            <h2>Waar heb je zin in?</h2>{" "}
            <p>Van een middag met je handen in de klei tot een boswandeling met een gids, met het aantal workshops erbij.</p>{" "}
          </div>{" "}
          <Link className="tlink" href={routes.category(ALL_CATEGORIES)}>
            Alles bekijken <Arrow />
          </Link>{" "}
        </div>{" "}
        <div className="wrap">
          {" "}
          <div className="home-a-cats">
            {" "}
            {list.map((c, i) => (
              <Fragment key={c.id}>
                <Link className={WIDE.has(i) ? "home-a-kat home-a-breed" : "home-a-kat"} href={routes.category(c.slug)}>
                  {c.image ? (
                    <Image src={c.image} alt={ALT[c.slug] ?? c.name} width={1400} height={933} sizes={SIZES} unoptimized={unoptimized(c.image)} />
                  ) : null}
                  <div className="home-a-kat-txt">
                    <h3>{c.name}</h3>
                    <span>{countLabel(c.count)}</span>
                  </div>
                </Link>{" "}
              </Fragment>
            ))}
          </div>{" "}
        </div>{" "}
      </section>{" "}
    </div>
  );
}
