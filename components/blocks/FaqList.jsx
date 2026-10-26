"use client";

import { Icon } from "@/components/ui";
import { Section, SectionHead } from "@/components/blocks/shared";

/* Veelgestelde vragen, optioneel gegroepeerd ("Als je meedoet", "Als je
   workshops geeft"). items: [{ group, question, answer }]
   Gebruikt <details>, dus werkt ook zonder JavaScript en is doorzoekbaar. */
export default function FaqList({ block }) {
  const items = Array.isArray(block.items) ? block.items.filter((i) => i?.question) : [];
  if (!items.length) return null;

  const groups = [];
  for (const it of items) {
    const name = it.group || "";
    const last = groups[groups.length - 1];
    if (last && last.name === name) last.items.push(it);
    else groups.push({ name, items: [it] });
  }

  return (
    <Section block={block} className="wb-faq" fields="type,title,body,items,cta_label,cta_to">
      <SectionHead block={block} />
      <div className={groups.length > 1 ? "wb-faq-groups" : ""}>
        {groups.map((g) => (
          <div key={g.name || "faq"}>
            {g.name && <h3 className="wb-faq-group">{g.name}</h3>}
            <div className="ww-faq-list">
              {g.items.map((it, i) => (
                <details key={i} className="ww-faq-item wb-faq-item">
                  <summary className="ww-faq-q">
                    {it.question}
                    <Icon name="down" size={18} />
                  </summary>
                  <div className="ww-faq-a" dangerouslySetInnerHTML={{ __html: it.answer }} />
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
