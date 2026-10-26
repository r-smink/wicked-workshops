"use client";

import { Section, SectionHead, SmartLink } from "@/components/blocks/shared";

/* "Verder kijken": kolommen met interne links, goed voor de interne
   linkstructuur van categorie- en plaatspagina's.
   items: [{ title, links: [{ label, to }] }] */
export default function LinkColumns({ block }) {
  const cols = Array.isArray(block.items) ? block.items.filter((c) => Array.isArray(c?.links) && c.links.length) : [];
  if (!cols.length) return null;

  return (
    <Section block={block} className="wb-linkcols" fields="type,title,items">
      <SectionHead block={block} link={false} />
      <div className="wb-linkcols-grid">
        {cols.map((c, i) => (
          <nav key={i} aria-label={c.title || block.title || "Links"}>
            {c.title && <h3>{c.title}</h3>}
            <ul>
              {c.links.map((l, j) => <li key={j}><SmartLink to={l.to}>{l.label}</SmartLink></li>)}
            </ul>
          </nav>
        ))}
      </div>
    </Section>
  );
}
