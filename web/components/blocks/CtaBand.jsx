"use client";

import { Section, Actions, blockAttr } from "@/components/blocks/shared";

/* Afsluitende band: titel, korte tekst en twee knoppen. style bepaalt de
   kleur (ink is de donkere band uit de export, cloud en coral licht). */
export default function CtaBand({ block }) {
  const style = block.style && block.style !== "default" ? block.style : "ink";
  return (
    <Section block={{ ...block, style: "default" }} className="wb-ctaband" fields="type,title,body,style,cta_label,cta_to,cta_secondary_label,cta_secondary_to">
      <div className={`ww-band ww-band--${style} wb-ctaband-in`}>
        <div>
          <h2 {...blockAttr(block, "title", "popover")}>{block.title}</h2>
          {block.body && <p {...blockAttr(block, "body", "popover")}>{block.body}</p>}
        </div>
        <Actions block={{ ...block, style }} />
      </div>
    </Section>
  );
}
