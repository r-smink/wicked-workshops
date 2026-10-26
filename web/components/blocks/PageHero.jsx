"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";
import { useDemoMode } from "@/components/DemoModeProvider";
import { Section, Actions, BlockImage, SmartLink, blockAttr } from "@/components/blocks/shared";

/* Paginakop. Varianten:
     split     tekst links, beeld rechts (standaard)
     overlay   beeld als donkere achtergrond
     centered  alleen tekst, gecentreerd
     search    donkere hero met zoekveld (homepage)
   items: kerncijfers [{ value, label }]
   settings.breadcrumbs: [{ label, to }] */
export default function PageHero({ block }) {
  const variant = block.variant || "split";
  const crumbs = Array.isArray(block.settings?.breadcrumbs) ? block.settings.breadcrumbs : [];
  if (variant === "search" || variant === "overlay") return <DarkHero block={block} crumbs={crumbs} search={variant === "search"} />;

  return (
    <Section block={block} className={`wb-hero wb-hero--${variant}`} fields="type,variant,eyebrow,title,body,image,image_alt,items,cta_label,cta_to,cta_secondary_label,cta_secondary_to">
      <Crumbs items={crumbs} />
      <div className="wb-hero-grid">
        <div className="wb-hero-txt">
          {block.eyebrow && <p className="ww-eyebrow">{block.eyebrow}</p>}
          <h1 {...blockAttr(block, "title", "popover")}>{block.title}</h1>
          {block.body && <p className="wb-hero-lead" {...blockAttr(block, "body", "popover")}>{block.body}</p>}
          <Actions block={block} primary="primary" center={variant === "centered"} />
          <Stats items={block.items} />
        </div>
        {variant === "split" && (
          <BlockImage src={block.image} alt={block.image_alt} ratio="5/4" demo="samen" className="wb-hero-img" />
        )}
      </div>
    </Section>
  );
}

function DarkHero({ block, crumbs, search }) {
  const { demoMode } = useDemoMode();
  const router = useRouter();
  const [q, setQ] = useState("");
  const bg = block.image || (demoMode ? "/demo/samen.jpg" : null);

  const submit = (e) => {
    e.preventDefault();
    const target = block.cta_to || "/zoeken";
    router.push(q.trim() ? `${target}?q=${encodeURIComponent(q.trim())}` : target);
  };

  return (
    <section id={block.anchor || undefined} className={`ww-hero wb-hero-dark${block.image ? " wb-hero-dark--photo" : ""}`} {...blockAttr(block, "type,variant,title,body,image,cta_label,cta_to")}>
      <div className="ww-hero-bg" aria-hidden="true">{bg ? <img src={bg} alt="" /> : <div />}</div>
      {/* Twee lagen: .ww-hero-in zet padding als shorthand en zou de
          zijmarge van .ww-wrap anders op 0 zetten. */}
      <div className="ww-wrap">
        <div className="ww-hero-in">
          <Crumbs items={crumbs} light />
          {block.eyebrow && <p className="ww-eyebrow">{block.eyebrow}</p>}
          <h1 {...blockAttr(block, "title", "popover")}>{block.title}</h1>
          {block.body && <p {...blockAttr(block, "body", "popover")}>{block.body}</p>}
          {search ? (
            <form className="ww-hero-search" role="search" onSubmit={submit}>
              <Icon name="search" size={20} style={{ color: "var(--ww-brand)", flex: "none" }} />
              <input value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Zoek een plaats, workshop of aanbieder"
                aria-label="Zoek een plaats, workshop of aanbieder" />
              <button className="ww-hero-search-btn" type="submit">{block.cta_label || "Zoeken"}</button>
            </form>
          ) : (
            <Actions block={{ ...block, style: "ink" }} center />
          )}
          <Stats items={block.items} light />
        </div>
      </div>
    </section>
  );
}

function Crumbs({ items, light }) {
  if (!items.length) return null;
  return (
    <nav className={`ww-crumbs wb-crumbs${light ? " wb-crumbs--light" : ""}`} aria-label="Kruimelpad">
      {items.map((c, i) => (
        <span key={i} className="wb-crumb">
          {i > 0 && <span aria-hidden="true">/</span>}
          {c.to ? <SmartLink to={c.to}>{c.label}</SmartLink> : <b aria-current="page">{c.label}</b>}
        </span>
      ))}
    </nav>
  );
}

function Stats({ items, light }) {
  if (!Array.isArray(items) || !items.length) return null;
  return (
    <dl className={`wb-stats${light ? " wb-stats--light" : ""}`}>
      {items.map((s, i) => (
        <div key={i}>
          <dt>{s.value}</dt>
          <dd>{s.label}</dd>
        </div>
      ))}
    </dl>
  );
}
