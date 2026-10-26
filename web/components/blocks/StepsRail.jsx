"use client";

import { Icon } from "@/components/ui";
import { Section, SectionHead, Actions, BlockImage, TextLink } from "@/components/blocks/shared";

const DEMO = ["fotografie", "koken3", "samen", "keramiek3"];

/* Stappen. Varianten:
     numbered  verticale rail met nummers (standaard)
     timeline  rail met een eigen label per stap (tijd, dag), bijv. "15:00"
     cards     kaarten naast elkaar met beeld
   items: [{ label, title, body, note, list: [..], image, image_alt, cta_label, cta_to }] */
export default function StepsRail({ block }) {
  const items = Array.isArray(block.items) ? block.items : [];
  const variant = block.variant || "numbered";
  if (!items.length) return null;

  return (
    <Section block={block} className={`wb-steps wb-steps--${variant}`} fields="type,variant,title,body,image,image_alt,items,cta_label,cta_to,cta_secondary_label,cta_secondary_to">
      <SectionHead block={block} link={false} />
      {variant === "cards" ? (
        <ol className="wb-stepcards">
          {items.map((s, i) => (
            <li key={i}>
              <BlockImage src={s.image} alt={s.image_alt || ""} ratio="4/3" demo={DEMO[i % DEMO.length]} />
              <span className="wb-step-n" aria-hidden="true">{s.label || i + 1}</span>
              <Step s={s} />
            </li>
          ))}
        </ol>
      ) : block.image ? (
        <div className={`wb-steps-split${block.settings?.image_position === "left" ? " wb-steps-split--left" : ""}`}>
          <Rail items={items} variant={variant} />
          <BlockImage src={block.image} alt={block.image_alt} ratio="4/5" className="wb-steps-img" />
        </div>
      ) : (
        <Rail items={items} variant={variant} />
      )}
      <Actions block={block} />
    </Section>
  );
}

/* Verticale rail. Met block.image staat er een foto naast
   (settings.image_position: "left" of standaard rechts). */
function Rail({ items, variant }) {
  return (
    <ol className="wb-rail-steps">
      {items.map((s, i) => (
        <li key={i}>
          <span className="wb-step-n" aria-hidden="true">{variant === "timeline" ? (s.label || i + 1) : i + 1}</span>
          <div>
            <Step s={s} />
          </div>
        </li>
      ))}
    </ol>
  );
}

function Step({ s }) {
  return (
    <>
      <h3>{s.title}</h3>
      {s.body && <p>{s.body}</p>}
      {Array.isArray(s.list) && s.list.length > 0 && (
        <ul className="wb-checks">
          {s.list.map((t, j) => <li key={j}><Icon name="check" size={16} />{t}</li>)}
        </ul>
      )}
      {s.note && <p className="wb-note">{s.note}</p>}
      {s.cta_label && s.cta_to && <TextLink to={s.cta_to}>{s.cta_label}</TextLink>}
    </>
  );
}
