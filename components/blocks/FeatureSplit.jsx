"use client";

import { Section, SectionHead, Actions, BlockImage } from "@/components/blocks/shared";

/* Tekst naast een beeld, met optioneel kerncijfers en twee knoppen.
   Dekt teamuitje, word workshopgever, cadeaubon, "je kookt bij ..." en
   het atelier. Varianten: image-right (standaard), image-left.
   items: kerncijfers [{ value, label }] */
export default function FeatureSplit({ block }) {
  const items = Array.isArray(block.items) ? block.items : [];
  const left = block.variant === "image-left";
  const demo = block.style === "ink" ? "hout2" : left ? "groep" : "kaarsen2";

  return (
    <Section block={block} className={`wb-split${left ? " wb-split--left" : ""}`} fields="type,variant,style,eyebrow,title,body,image,image_alt,items,cta_label,cta_to,cta_secondary_label,cta_secondary_to">
      <div className="wb-split-grid">
        <div className="wb-split-txt">
          <SectionHead block={block} link={false} />
          {items.length > 0 && (
            <dl className="wb-stats">
              {items.map((s, i) => (
                <div key={i}><dt>{s.value}</dt><dd>{s.label}</dd></div>
              ))}
            </dl>
          )}
          <Actions block={block} />
        </div>
        <BlockImage src={block.image} alt={block.image_alt} ratio="4/3" demo={demo} className="wb-split-img" />
      </div>
    </Section>
  );
}
