"use client";

import Link from "next/link";
import { Icon, Photo } from "@/components/ui";
import { useDemoMode } from "@/components/DemoModeProvider";
import { DEMO_IMAGES } from "@/lib/demo-data";
import { Section, SectionHead } from "@/components/blocks/shared";

/* Plaatsen met het aantal workshops, gevolgd door een tegel voor de rest
   van Nederland. Data: cities (eerst is_top), via lib/page-builder.js. */
export default function CityGrid({ block }) {
  const { demoMode } = useDemoMode();
  const cities = block.data?.cities || [];
  if (!cities.length) return null;

  return (
    <Section block={block} className="wb-cities" fields="type,title,body,item_limit,cta_label,cta_to">
      <SectionHead block={block} />
      <div className="ww-citygrid">
        {cities.map((c) => (
          <Link key={c.slug} href={`/zoeken?plaats=${c.slug}`} className="ww-citycard">
            <Photo src={c.image || (demoMode ? DEMO_IMAGES.cities[c.name] : null)} icon="pin" />
            <strong>
              {c.name}
              {c.count ? <span className="wb-city-count">{c.count} workshops</span> : null}
            </strong>
          </Link>
        ))}
        <Link href={block.cta_to || "/zoeken"} className="ww-citycard ww-citycard--brand">
          <strong>
            <Icon name="pin" size={20} />
            De rest van Nederland
          </strong>
        </Link>
      </div>
    </Section>
  );
}
