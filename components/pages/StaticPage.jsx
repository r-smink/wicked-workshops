"use client";

import { useState } from "react";
import { tokens } from "@/lib/tokens";
import { useGo } from "@/lib/use-go";
import { Icon, Star, Button, Avatar } from "@/components/ui";

/* ===========================================================================
   StaticPage — gedeelde renderer voor statische contentpagina's.

   Bronnen (in volgorde van voorkeur):
     1. `page.blocks`  — Directus O2M `page_blocks` met `type`-discriminator
        (hero, text, text_image, two_columns, steps, ticks, features,
         quotes, cards, cta, image_banner, gallery, faq, video).
     2. `page.sections` — legacy O2M-secties met `layout`.
     3. `page.body`     — vrije HTML/proza.

   Visual Editor:
     - pagina-titel/body zijn bewerkbaar via `page.directus` (pages-collectie)
     - elk blok is bewerkbaar via `data-directus` op de `page_blocks`-collectie
   =========================================================================== */

function normalizeItems(items, type) {
  if (!Array.isArray(items)) return [];
  if (type === "ticks") {
    return items.map((i) => (typeof i === "string" ? i : i?.text || i?.title || "")).filter(Boolean);
  }
  if (type === "steps") {
    return items.map((i) => [i?.title || i?.text || "", i?.description || ""]);
  }
  if (type === "quotes") {
    return items.map((i) => [
      i?.name || i?.title || "",
      i?.context || i?.subtitle || "",
      i?.body || i?.text || "",
    ]);
  }
  if (type === "cards") {
    return items.map((i) => ({
      title: i?.title || "",
      body: i?.body || i?.text || "",
      image: i?.image || null,
      url: i?.url || i?.cta_to || "",
      cta_label: i?.cta_label || "Lees meer",
    }));
  }
  if (type === "features") {
    return items.map((i) => ({
      icon: i?.icon || "check",
      title: i?.title || "",
      body: i?.body || i?.description || i?.text || "",
    }));
  }
  if (type === "faq") {
    return items.map((i) => ({
      question: i?.question || i?.title || "",
      answer: i?.answer || i?.body || "",
    }));
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
      <div className="ww-band-split" style={{ gap: 36, alignItems: "center" }}>
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

function BlockTwoColumns({ block }) {
  return (
    <section className="ww-section" {...blockAttr(block, "type,title,column_left,column_right")}>
      <SectionHead block={block} attr />
      <div className="ww-grid--2">
        {block.column_left && (
          <div className="ww-prose" {...blockAttr(block, "column_left")} dangerouslySetInnerHTML={{ __html: block.column_left }} />
        )}
        {block.column_right && (
          <div className="ww-prose" {...blockAttr(block, "column_right")} dangerouslySetInnerHTML={{ __html: block.column_right }} />
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

function BlockFeatures({ block }) {
  const items = normalizeItems(block.items, "features");
  return (
    <section className="ww-section" {...blockAttr(block, "type,title,items")}>
      <SectionHead block={block} attr />
      <div className="ww-grid">
        {items.map((item, i) => (
          <div className="ww-step" key={i} style={{ textAlign: "center" }}>
            <div style={{ marginBottom: 12, color: tokens.color.brand }}>
              <Icon name={item.icon} size={28} />
            </div>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        ))}
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

function BlockCards({ block }) {
  const go = useGo();
  const items = normalizeItems(block.items, "cards");
  return (
    <section className="ww-section" {...blockAttr(block, "type,title,items")}>
      <SectionHead block={block} attr />
      <div className="ww-grid">
        {items.map((card, i) => (
          <div className="ww-card" key={i}>
            {card.image && (
              <div className="ww-art-hero" style={{ margin: 0, borderRadius: "20px 20px 0 0" }}>
                <img src={card.image} alt={card.title || ""} />
              </div>
            )}
            <div style={{ padding: "22px 24px" }}>
              {card.title && <h3 style={{ marginBottom: 8 }}>{card.title}</h3>}
              {card.body && <p style={{ color: tokens.color.slate, fontSize: 14.5 }}>{card.body}</p>}
              {card.cta_label && card.url && (
                <Button variant="outline" size="sm" onClick={() => go(card.url)} style={{ marginTop: 14 }}>
                  {card.cta_label}
                </Button>
              )}
            </div>
          </div>
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

function BlockImageBanner({ block }) {
  return (
    <section className="ww-section" {...blockAttr(block, "type,title,body,image")}>
      {block.title && (
        <div className="ww-shead">
          <h2 {...blockAttr(block, "title")}>{block.title}</h2>
        </div>
      )}
      {block.image && (
        <div className="ww-art-hero" style={{ margin: 0 }} {...blockAttr(block, "image")}>
          <img src={block.image} alt={block.title || ""} />
        </div>
      )}
      {block.body && (
        <p style={{ marginTop: 18, color: tokens.color.slate }} {...blockAttr(block, "body")}>
          {block.body}
        </p>
      )}
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
      <div className="ww-mediagrid">
        {images.map((src, i) => (
          <div className="ww-mediaslot" data-filled="true" key={i}>
            <img src={src} alt={`${block.title || "Afbeelding"} ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ))}
      </div>
    </section>
  );
}

function BlockFaq({ block }) {
  const items = normalizeItems(block.items, "faq");
  const [open, setOpen] = useState(null);
  return (
    <section className="ww-section" {...blockAttr(block, "type,title,items")}>
      <SectionHead block={block} attr />
      <div>
        {items.map((item, i) => (
          <div className="ww-faq-item" key={i}>
            <button className="ww-faq-q" onClick={() => setOpen(open === i ? null : i)}>
              {item.question}
              <Icon name="down" size={18} style={{ color: tokens.color.slate, flex: "none", transform: open === i ? "rotate(180deg)" : "none" }} />
            </button>
            {open === i && (
              <div className="ww-faq-a" dangerouslySetInnerHTML={{ __html: item.answer }} />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function getVideoEmbed(url) {
  if (!url) return null;
  // YouTube
  const yt = url.match(/(?:youtube\.com\/(?:[^/]+\/)*(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  // Vimeo
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}

function BlockVideo({ block }) {
  const embedUrl = getVideoEmbed(block.video_url);
  return (
    <section className="ww-section" {...blockAttr(block, "type,title,video_url,video_file")}>
      <SectionHead block={block} attr />
      {block.video_file ? (
        <video src={block.video_file} controls style={{ width: "100%", borderRadius: 20 }} />
      ) : embedUrl ? (
        <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 20, overflow: "hidden" }}>
          <iframe
            src={embedUrl}
            title={block.title || "Video"}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : null}
    </section>
  );
}

function renderBlock(block, i) {
  if (!block) return null;
  switch (block.type) {
    case "hero":
      return <BlockHero key={block.id || i} block={block} />;
    case "text":
      return <BlockText key={block.id || i} block={block} />;
    case "text_image":
      return <BlockTextImage key={block.id || i} block={block} />;
    case "two_columns":
      return <BlockTwoColumns key={block.id || i} block={block} />;
    case "steps":
      return <BlockSteps key={block.id || i} block={block} />;
    case "ticks":
      return <BlockTicks key={block.id || i} block={block} />;
    case "features":
      return <BlockFeatures key={block.id || i} block={block} />;
    case "quotes":
      return <BlockQuotes key={block.id || i} block={block} />;
    case "cards":
      return <BlockCards key={block.id || i} block={block} />;
    case "cta":
      return <BlockCta key={block.id || i} block={block} />;
    case "image_banner":
      return <BlockImageBanner key={block.id || i} block={block} />;
    case "gallery":
      return <BlockGallery key={block.id || i} block={block} />;
    case "faq":
      return <BlockFaq key={block.id || i} block={block} />;
    case "video":
      return <BlockVideo key={block.id || i} block={block} />;
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
