"use client";

import { Star, Avatar } from "@/components/ui";
import { Section, SectionHead } from "@/components/blocks/shared";

/* Reviews. Bron 'latest' of 'context' leest gepubliceerde reviews uit
   Directus (alleen van mensen die geboekt hebben); bron 'manual' gebruikt
   items [{ name, context, body, rating }]. Zonder reviews verdwijnt het
   blok: liever geen sectie dan een verzonnen review.
   Varianten: grid (standaard), single (één groot citaat). */
export default function ReviewList({ block }) {
  const reviews = block.source === "manual" ? (block.items || []) : (block.data?.reviews || []);
  if (!reviews.length) return null;
  const single = block.variant === "single";

  return (
    <Section block={block} className="wb-reviews" fields="type,variant,title,body,source,item_limit,items">
      <SectionHead block={block} />
      <div className={single ? "wb-review-single" : "ww-quotes wb-review-grid"}>
        {(single ? reviews.slice(0, 1) : reviews).map((r, i) => (
          <figure className="ww-quote" key={i}>
            {r.rating ? (
              <span className="ww-stars" aria-label={`${r.rating} van 5 sterren`}>
                {Array.from({ length: Math.round(r.rating) }, (_, s) => <Star key={s} size={14} />)}
              </span>
            ) : null}
            <blockquote><p>{r.body}</p></blockquote>
            <figcaption className="ww-who">
              <Avatar name={r.name || "?"} />
              <span>
                <strong>{r.name || "Deelnemer"}</strong>
                {r.context && <span>{r.context}</span>}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
