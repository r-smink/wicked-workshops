"use client";

import { Section, SectionHead, Actions } from "@/components/blocks/shared";

/* Rekenvoorbeeld als bon: per groep ("Je deelnemer betaalt", "Jij krijgt")
   een paar regels en een totaal.
   items: [{ group, label, value, total }]
   settings.note: voetnoot, bijv. over de pilot of voorbeelddata. */
export default function PricingExample({ block }) {
  const items = Array.isArray(block.items) ? block.items : [];
  const groups = [];
  for (const it of items) {
    const last = groups[groups.length - 1];
    if (last && last.name === (it.group || "")) last.items.push(it);
    else groups.push({ name: it.group || "", items: [it] });
  }

  return (
    <Section block={block} className="wb-pricing" fields="type,title,body,items,settings,cta_label,cta_to">
      <div className="wb-pricing-grid">
        <div>
          <SectionHead block={block} link={false} />
          <Actions block={block} primary="primary" />
        </div>
        <div className="wb-receipts">
          {groups.map((g) => (
            <div key={g.name} className="wb-receipt">
              {g.name && <h3>{g.name}</h3>}
              <dl>
                {g.items.map((it, i) => (
                  <div key={i} className={it.total ? "wb-receipt-total" : undefined}>
                    <dt>{it.label}</dt>
                    <dd>{it.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
          {block.settings?.note && <p className="wb-footnote">{block.settings.note}</p>}
        </div>
      </div>
    </Section>
  );
}
