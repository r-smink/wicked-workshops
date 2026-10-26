"use client";

import { Section, SectionHead, BlockImage, TextLink } from "@/components/blocks/shared";

const DEMO = ["ambacht2", "groep", "keramiek", "koken"];

/* Ingangen: twee of drie kaarten met beeld, korte tekst en een link.
   items: [{ eyebrow, title, body, note, image, image_alt, cta_label, cta_to }] */
export default function LinkCards({ block }) {
  const items = Array.isArray(block.items) ? block.items : [];
  if (!items.length) return null;

  return (
    <Section block={block} className="wb-linkcards" fields="type,title,body,items">
      <SectionHead block={block} />
      <div className={`wb-linkcards-grid wb-linkcards-grid--${Math.min(items.length, 3)}`}>
        {items.map((c, i) => (
          <article key={i} className="wb-linkcard">
            <BlockImage src={c.image} alt={c.image_alt || ""} ratio="16/10" demo={DEMO[i % DEMO.length]} />
            <div className="wb-linkcard-body">
              {c.eyebrow && <p className="ww-eyebrow">{c.eyebrow}</p>}
              <h3>{c.title}</h3>
              {c.body && <p>{c.body}</p>}
              {c.note && <p className="wb-note">{c.note}</p>}
              {c.cta_label && c.cta_to && <TextLink to={c.cta_to}>{c.cta_label}</TextLink>}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
