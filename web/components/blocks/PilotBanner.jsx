"use client";

import { Section, SectionHead, Actions } from "@/components/blocks/shared";

/* Pilotmelding: korte band met een titel, uitleg en "nu / daarna".
   items: [{ label, text }] */
export default function PilotBanner({ block }) {
  const items = Array.isArray(block.items) ? block.items : [];
  return (
    <Section block={{ ...block, style: block.style || "cloud" }} className="wb-pilot" fields="type,title,body,items,cta_label,cta_to,style">
      <div className="wb-pilot-in">
        <span className="wb-pilot-badge">Pilot</span>
        <div>
          <SectionHead block={block} link={false} />
          {items.length > 0 && (
            <dl className="wb-pilot-list">
              {items.map((it, i) => (
                <div key={i}><dt>{it.label}</dt><dd>{it.text}</dd></div>
              ))}
            </dl>
          )}
          <Actions block={block} primary="primary" />
        </div>
      </div>
    </Section>
  );
}
