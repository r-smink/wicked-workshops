"use client";

import { tokens } from "@/lib/tokens";
import { useGo } from "@/lib/use-go";
import { Icon, Star, Button, Avatar } from "@/components/ui";

/* ===========================================================================
   StaticPage — gedeelde renderer voor statische contentpagina's.

   Bronnen (in volgorde van voorkeur):
     1. `page.blocks`  — nieuwe Directus O2M `page_blocks` met M2A-achtige
        `type`-discriminator (hero, text, text_image, steps, ticks, quotes, cta,
        gallery).
     2. `page.sections` — legacy O2M-secties met `layout`.
     3. `page.body`     — vrije HTML/proza.

   Visual Editor:
     - pagina-titel/body zijn bewerkbaar via `page.directus` (pages-collectie)
     - elk blok is bewerkbaar via `data-directus` op de `page_blocks`-collectie
   =========================================================================== */

function normalizeItems(items, type) {
  if (!Array.isArray(items)) return [];
  if (type === "ticks") {
    return items
      .map((i) => (typeof i === "string" ? i : i?.text || i?.title || ""))
      .filter(Boolean);
  }
  if (type === "steps") {
    return items.map((i) => [
      i?.title || i?.text || "",
      i?.description || "",
    ]);
  }
  if (type === "quotes") {
    return items.map((i) => [
      i?.name || i?.title || "",
      i?.context || i?.subtitle || "",
      i?.body || i?.text || "",
    ]);
  }
  return items;
}

function blockAttr(block, fields, mode = "drawer") {
  if (!block?.id) return {};
  return {
    "data-directus": `collection:page_blocks;item:${block.id};fields:${fields};mode:${mode}`,
  };
}

function SectionHead({ block, attr }) {
  if (!block.title) return null;
  return (
    <div className="ww-shead">
      <h2 {...(attr ? blockAttr(block, "title") : {})}>{block.title}</h2>
    </div>
  );
}

function BlockHero({ block }) {
  const go = useGo();
  return (
    <section className="ww-hero" {...blockAttr(block, "type,title,body,image,cta_label,cta_to")}>
      <h1 {...blockAttr(block, "title")}>{block.title}</h1>
      {block.body && <p {...blockAttr(block, "body")}>{block.body}</p>}
      {block.image && (
        <div className="ww-art-hero" style={{ marginTop: 24 }}>
          <img src={block.image} alt={block.title || ""} />
        </div>
      )}
      {block.cta_label && (
        <div style={{ marginTop: 22 }}>
          <Button variant="coral" size="lg" onClick={() => go(block.cta_to || { name: "home" })}>
            {block.cta_label}
          </Button>
        </div>
      )}
    </section>
  );
}

function BlockText({ block }) {
  return (
    <section className="ww-section" {...blockAttr(block, "type,title,body")}>
      <SectionHead block={block} attr />
      {block.body && (
        <div className="ww-prose" {...blockAttr(block, "body")} dangerouslySetInnerHTML={{ __html: block.body }} />
      )}
    </section>
  );
}

function BlockTextImage({ block }) {
  const go = useGo();
  return (
    <section className="ww-section" {...blockAttr(block, "type,title,body,image,cta_label,cta_to")}>
      <div
        className="ww-band-split"
        style={{ gap: 36, alignItems: "center" }}
      >
        <div>
          <SectionHead block={block} attr />
          {block.body && (
            <div className="ww-prose" {...blockAttr(block, "body")} dangerouslySetInnerHTML={{ __html: block.body }} />
          )}
          {block.cta_label && (
            <Button variant="coral" size="md" onClick={() => go(block.cta_to || { name: "home" })}>
              {block.cta_label}
            </Button>
          )}
        </div>
        {block.image && (
          <div className="ww-art-hero" {...blockAttr(block, "image")}>
            <img src={block.image} alt={block.title || ""} />
          </div>
        )}
      </div>
    </section>
  );
}

function BlockSteps({ block }) {
  const items = normalizeItems(block.items, "steps");
  return (
    <section className="ww-section" {...blockAttr(block, "type,title,items")}>
      <SectionHead block={block} attr />
      <div className="ww-steps">
        {items.map(([title, description], i) => (
          <div className="ww-step" key={i}>
            <span className="ww-step-n">{i + 1}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function BlockTicks({ block }) {
  const items = normalizeItems(block.items, "ticks");
  return (
    <section className="ww-section" {...blockAttr(block, "type,title,items")}>
      <SectionHead block={block} attr />
      <div className="ww-band ww-band--cloud">
        <ul className="ww-ticks">
          {items.map((t, i) => (
            <li key={i}>
              <Icon name="check" size={17} style={{ color: tokens.color.coral }} />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function BlockQuotes({ block }) {
  const items = normalizeItems(block.items, "quotes");
  return (
    <section className="ww-section" {...blockAttr(block, "type,title,items")}>
      <SectionHead block={block} attr />
      <div className="ww-quotes ww-snap ww-snap--wide">
        {items.map(([name, context, body], i) => (
          <figure className="ww-quote" key={i}>
            <span className="ww-stars" aria-label="5 sterren">
              {[0, 1, 2, 3, 4].map((s) => (
                <Star key={s} size={14} />
              ))}
            </span>
            <p>{body}</p>
            <figcaption className="ww-who">
              <Avatar name={name || "?"} />
              <span>
                <strong>{name || "Deelnemer"}</strong>
                <span>{context}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function BlockCta({ block }) {
  const go = useGo();
  const style = block.style || "coral";
  const bandClass = `ww-band ww-band--${style === "coral" ? "coral" : style === "ink" ? "ink" : "cloud"}`;
  return (
    <section className="ww-section" {...blockAttr(block, "type,title,body,cta_label,cta_to,style")}>
      <div className={bandClass}>
        <div className="ww-band-split">
          <div>
            <h2 {...blockAttr(block, "title")}>{block.title}</h2>
            {block.body && <p {...blockAttr(block, "body")}>{block.body}</p>}
          </div>
          <div>
            <Button variant="coral" size="lg" block onClick={() => go(block.cta_to || { name: "home" })}>
              {block.cta_label || "Aan de slag"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function BlockGallery({ block }) {
  const items = Array.isArray(block.items) ? block.items : [];
  const images = items
    .map((i) => (typeof i === "string" ? i : i?.image || i?.url || ""))
    .filter(Boolean);
  if (!images.length && block.image) images.push(block.image);
  return (
    <section className="ww-section" {...blockAttr(block, "type,title,image,items")}>
      <SectionHead block={block} attr />
      <div
        className="ww-quotes"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}
      >
        {images.map((src, i) => (
          <div className="ww-art-hero" key={i} style={{ margin: 0 }}>
            <img src={src} alt={`${block.title || "Afbeelding"} ${i + 1}`} />
          </div>
        ))}
      </div>
    </section>
  );
}

function renderBlock(block, i) {
  if (!block) return null;
  switch (block.type) {
    case "hero":
      return <BlockHero key={block.id || i} block={block} />;
    case "text_image":
      return <BlockTextImage key={block.id || i} block={block} />;
    case "steps":
      return <BlockSteps key={block.id || i} block={block} />;
    case "ticks":
      return <BlockTicks key={block.id || i} block={block} />;
    case "quotes":
      return <BlockQuotes key={block.id || i} block={block} />;
    case "cta":
      return <BlockCta key={block.id || i} block={block} />;
    case "gallery":
      return <BlockGallery key={block.id || i} block={block} />;
    case "text":
    default:
      return <BlockText key={block.id || i} block={block} />;
  }
}

/* Legacy secties uit page.sections (indien aanwezig) */
function SectionSteps({ title, items }) {
  return (
    <section className="ww-section">
      <div className="ww-shead"><h2>{title}</h2></div>
      <div className="ww-steps">
        {(items || []).map(([t, d], i) => (
          <div className="ww-step" key={i}>
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
          {(items || []).map((t, i) => (
            <li key={i}>
              <Icon name="check" size={17} style={{ color: tokens.color.coral }} />
              {t}
            </li>
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
        {(items || []).map(([name, context, body], i) => (
          <figure className="ww-quote" key={i}>
            <span className="ww-stars" aria-label="5 sterren">
              {[0, 1, 2, 3, 4].map((s) => (
                <Star key={s} size={14} />
              ))}
            </span>
            <p>{body}</p>
            <figcaption className="ww-who">
              <Avatar name={name || "?"} />
              <span>
                <strong>{name || "Deelnemer"}</strong>
                <span>{context}</span>
              </span>
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

  /* data-directus attributen voor de Visual Editor — alleen als de page
     uit Directus komt (mapContentPage zet page.directus). */
  const dAttr = (fields, mode) =>
    page.directus
      ? { "data-directus": `collection:${page.directus.collection};item:${page.directus.item};fields:${fields};mode:${mode}` }
      : {};

  return (
    <div className="ww-wrap">
      <nav className="ww-crumbs" aria-label="Kruimelpad">
        <a onClick={() => go({ name: "home" })}>Home</a><span>/</span>
        <span style={{ color: tokens.color.ink }}>{page.title}</span>
      </nav>

      <section className="ww-hero">
        <h1 {...dAttr("title", "popover")}>{page.hero_title || page.title}</h1>
        {page.hero_subtitle && <p {...dAttr("hero_subtitle", "popover")}>{page.hero_subtitle}</p>}
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
          <div className="ww-prose" {...dAttr("body", "drawer")} dangerouslySetInnerHTML={{ __html: page.body }} />
        </section>
      )}

      {(page.blocks || []).map(renderBlock)}

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
