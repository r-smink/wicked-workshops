"use client";

import { tokens } from "@/lib/tokens";
import { useGo } from "@/lib/use-go";
import { Icon, Star, Button, Avatar } from "@/components/ui";

/* ===========================================================================
   StaticPage — gedeelde renderer voor de statische pagina's (bedrijven,
   cadeaubon). Bouwt een homepage-achtige lay-up op uit een `page`-object:
   een hero, een optionele intro en een lijst secties. Elke sectie kiest
   zijn opmaak aan de hand van `layout`:

     - "steps"  : 3-staps "zo werkt het" blok (ww-steps)
     - "ticks"  : lijst met vinkjes (ww-ticks)
     - "quote"  : testimonials in een grid (ww-quotes)
     - "cta"    : afsluitende call-to-action band (ww-band)
     - "text"   : vrije HTML/proza (fallback)

   De component is client-side omdat de knoppen via useGo() navigeren.
   =========================================================================== */

function SectionSteps({ title, items }) {
  return (
    <section className="ww-section">
      <div className="ww-shead"><h2>{title}</h2></div>
      <div className="ww-steps">
        {(items || []).map(([t, d], i) => (
          <div className="ww-step" key={t}>
            <span className="ww-step-n">{i + 1}</span>
            <h3>{t}</h3>
            <p>{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionTicks({ title, items }) {
  return (
    <section className="ww-section">
      <div className="ww-shead"><h2>{title}</h2></div>
      <div className="ww-band ww-band--cloud">
        <ul className="ww-ticks">
          {(items || []).map((t) => (
            <li key={t}><Icon name="check" size={17} style={{ color: tokens.color.coral }} />{t}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SectionQuote({ title, items }) {
  return (
    <section className="ww-section">
      <div className="ww-shead"><h2>{title}</h2></div>
      <div className="ww-quotes ww-snap ww-snap--wide">
        {(items || []).map(([name, ctx, body]) => (
          <figure className="ww-quote" key={name}>
            <span className="ww-stars" aria-label="5 sterren">{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={14} />)}</span>
            <p>{body}</p>
            <figcaption className="ww-who">
              <Avatar name={name} />
              <span><strong>{name}</strong><span>{ctx}</span></span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function SectionCta({ title, body, cta_label, cta_to }) {
  const go = useGo();
  return (
    <section className="ww-section">
      <div className="ww-band ww-band--ink">
        <div className="ww-band-split">
          <div>
            <h2>{title}</h2>
            {body && <p>{body}</p>}
          </div>
          <div>
            <Button variant="coral" size="lg" block onClick={() => go(cta_to || { name: "home" })}>
              {cta_label || "Aan de slag"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionText({ title, body }) {
  return (
    <section className="ww-section">
      <div className="ww-shead"><h2>{title}</h2></div>
      {body && <div className="ww-prose" dangerouslySetInnerHTML={{ __html: body }} />}
    </section>
  );
}

export default function StaticPage({ page }) {
  const go = useGo();
  if (!page) return null;

  return (
    <div className="ww-wrap">
      <nav className="ww-crumbs" aria-label="Kruimelpad">
        <a onClick={() => go({ name: "home" })}>Home</a><span>/</span>
        <span style={{ color: tokens.color.ink }}>{page.title}</span>
      </nav>

      <section className="ww-hero">
        <h1>{page.hero_title || page.title}</h1>
        {page.hero_subtitle && <p>{page.hero_subtitle}</p>}
        {page.hero_image && (
          <div className="ww-art-hero" style={{ marginTop: 24 }}>
            <img src={page.hero_image} alt={page.title} />
          </div>
        )}
      </section>

      {page.intro && (
        <section className="ww-section" style={{ paddingTop: 0 }}>
          <p style={{ fontSize: 17, maxWidth: 640, color: tokens.color.ink, opacity: 0.85 }}>
            {page.intro}
          </p>
        </section>
      )}

      {page.body && (
        <section className="ww-section" style={{ paddingTop: 0 }}>
          <div className="ww-prose" dangerouslySetInnerHTML={{ __html: page.body }} />
        </section>
      )}

      {(page.sections || []).map((s, i) => {
        switch (s.layout) {
          case "steps": return <SectionSteps key={i} {...s} />;
          case "ticks": return <SectionTicks key={i} {...s} />;
          case "quote": return <SectionQuote key={i} {...s} />;
          case "cta": return <SectionCta key={i} {...s} />;
          default: return <SectionText key={i} {...s} />;
        }
      })}
    </div>
  );
}
