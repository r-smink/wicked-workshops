"use client";

import { Icon } from "@/components/ui";
import { Section, SectionHead, BlockImage } from "@/components/blocks/shared";

const DEMO = ["koken3", "ambacht", "schilderen2", "hout2"];

/* Ruimtes voor locatie gezocht: wat er is, hoeveel mensen erin passen en
   hoe je de eigenaar bereikt. Bron 'venues' leest gepubliceerde ruimtes;
   bron 'manual' gebruikt items [{ name, city, capacity, kitchen, slots, image, image_alt }].
   settings.empty: tekst als er (nog) niets staat. */
export default function VenueList({ block }) {
  const venues = block.source === "manual" ? (block.items || []) : (block.data?.venues || []);

  return (
    <Section block={block} className="wb-venues" fields="type,title,body,source,item_limit,items,settings">
      <SectionHead block={block} />
      {venues.length ? (
        <div className="wb-venue-grid">
          {venues.map((v, i) => (
            <article key={v.id || v.name || i} className="wb-venue">
              <BlockImage src={v.image} alt={v.image_alt || ""} ratio="16/10" demo={DEMO[i % DEMO.length]} icon="pin" />
              <div className="wb-venue-body">
                {v.city && <p className="wb-venue-city"><Icon name="pin" size={14} />{[v.city, v.neighbourhood].filter(Boolean).join(", ")}</p>}
                <h3>{v.name}</h3>
                <ul className="wb-venue-facts">
                  {v.capacity ? <li><Icon name="users" size={15} />Tot {v.capacity} plekken</li> : null}
                  {(v.amenities || []).slice(0, 3).map((a) => (
                    <li key={typeof a === "string" ? a : a.name}><Icon name="check" size={15} />{typeof a === "string" ? a : a.name}</li>
                  ))}
                </ul>
                {Array.isArray(v.slots) && v.slots.length > 0 && (
                  <dl className="wb-venue-slots">
                    {v.slots.map((s, j) => (
                      <div key={j}><dt>{s.day}</dt><dd>{s.parts}</dd></div>
                    ))}
                  </dl>
                )}
                {v.contact_email && (
                  <a className="ww-btn ww-btn--outline ww-btn--sm" href={`mailto:${v.contact_email}?subject=${encodeURIComponent(`Ruimte via Wicked Workshops: ${v.name}`)}`}>
                    Neem contact op met de eigenaar
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="wb-empty">{block.settings?.empty || "Er staan nog geen ruimtes online."}</p>
      )}
    </Section>
  );
}
