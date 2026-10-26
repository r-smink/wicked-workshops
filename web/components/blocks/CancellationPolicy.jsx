"use client";

import { Icon } from "@/components/ui";
import { Section, SectionHead } from "@/components/blocks/shared";
import { CANCELLATION_POLICIES } from "@/lib/cancellation";

/* Annuleren en verzetten. Toont de annuleringsvormen uit lib/cancellation.js
   (dezelfde bron als de checkout) en een paar regels uit items [{ text }].
   Geen vaste "gratis annuleren"-belofte: het beleid verschilt per workshop.
   Op een workshoppagina toont het vaste scherm het beleid van die workshop. */
export default function CancellationPolicy({ block }) {
  const items = Array.isArray(block.items) ? block.items : [];

  return (
    <Section block={block} className="wb-cancel" fields="type,title,body,items">
      <SectionHead block={block} link={false} />
      <ul className="wb-cancel-policies">
        {Object.entries(CANCELLATION_POLICIES).map(([key, p]) => (
          <li key={key}>
            <Icon name={p.hoursBefore ? "calendar" : "close"} size={18} />
            <span>{p.short}</span>
          </li>
        ))}
      </ul>
      {items.length > 0 && (
        <ul className="wb-checks">
          {items.map((it, i) => <li key={i}><Icon name="check" size={16} />{it.text || it}</li>)}
        </ul>
      )}
    </Section>
  );
}
