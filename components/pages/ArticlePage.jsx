"use client";

import { useState } from "react";
import { tokens } from "@/lib/tokens";
import { useGo } from "@/lib/use-go";
import { ARTICLES, ART_SECTIONS, ART_FAQ } from "@/lib/mock-data";
import { Icon, Star, Button, Photo, Avatar } from "@/components/ui";

export default function ArticlePage({
  article = ARTICLES[0],
}) {
  const go = useGo();
  const [openFaq, setOpenFaq] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);

  const sections = article.sections ?? ART_SECTIONS;
  const faq = article.faq ?? ART_FAQ;

  return (
    <div className="ww-wrap">
      <nav className="ww-crumbs" aria-label="Kruimelpad">
        <a onClick={() => go({ name: "home" })}>Home</a><span>/</span>
        <a onClick={() => go({ name: "blog" })}>{article.cat}</a><span>/</span>
        <span style={{ color: tokens.color.ink }}>{article.title}</span>
      </nav>

      <div className="ww-art">
        <article>
          <span className="ww-chip ww-chip--soft" style={{ pointerEvents: "none" }}>{article.cat}</span>
          <h1>{article.title}</h1>
          <div className="ww-byline">
            <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <Avatar name="Lisa Wicked" /> Lisa van Wicked
            </span>
            <span>{article.date}</span>
            <span>{article.read}</span>
            <button className="ww-chip" style={{ marginLeft: "auto" }}><Icon name="share" size={15} /> Delen</button>
          </div>

          {article.hero && (
            <div className="ww-art-hero">
              <img src={article.hero} alt={article.title} />
            </div>
          )}

          {article.short_answer && (
            <section className="ww-answer">
              <h2>Het korte antwoord</h2>
              <p>{article.short_answer}</p>
            </section>
          )}

          {article.body ? (
            <div className="ww-prose" dangerouslySetInnerHTML={{ __html: article.body }} />
          ) : (
            <div className="ww-prose">
              <p>{article.excerpt}</p>
            </div>
          )}

          <div className="ww-author">
            <Avatar name="Lisa Wicked" size={52} />
            <div>
              <strong style={{ fontSize: 16 }}>Lisa van Wicked</strong>
              <p className="ww-meta" style={{ marginTop: 6 }}>
                Schrijft over workshops en uitjes, en probeerde er zelf al meer dan veertig.
                Favoriet tot nu toe: glasblazen.
              </p>
            </div>
          </div>

          <div className="ww-news">
            <h2 style={{ fontSize: 24 }}>De leukste workshops in je mail</h2>
            <p>Elke maand nieuwe workshops en ideeen voor je volgende uitje. Geen spam, beloofd.</p>
            <div className="ww-news-form">
              <input className="ww-input" type="email" placeholder="jouw@email.nl" aria-label="E-mailadres" />
              <Button variant="coral">Aanmelden</Button>
            </div>
          </div>

          <section className="ww-section" style={{ paddingBottom: 0 }}>
            <div className="ww-band ww-band--cloud ww-band-split">
              <div>
                <h2>Zin gekregen?</h2>
                <p>Vind een workshop bij jou in de buurt en sta binnenkort zelf aan de slag.</p>
              </div>
              <Button variant="primary" size="lg" onClick={() => go({ name: "listing" })}>
                Bekijk workshops
              </Button>
            </div>
          </section>
        </article>

        <aside>
          <nav className="ww-toc" aria-label="In dit artikel" data-open={tocOpen ? "true" : "false"}>
            <h3 style={{ marginBottom: 0 }}>
              <button className="ww-toc-toggle" onClick={() => setTocOpen(!tocOpen)} aria-expanded={tocOpen}>
                In dit artikel
                <Icon name="down" size={17} style={{ color: tokens.color.brand,
                  transform: tocOpen ? "rotate(180deg)" : "none", transition: "transform .15s ease" }} />
              </button>
              <span className="ww-sr-desktop">In dit artikel</span>
            </h3>
            <div className="ww-toc-links">
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} onClick={() => setTocOpen(false)}><i>{s.n}</i>{s.h}</a>
              ))}
            </div>
          </nav>

          {article.related && article.related.length > 0 && (
            <div className="ww-sidecard">
              <h3>Liever leren van een chef?</h3>
              {article.related.map(([t, m, p, ic]) => (
                <a className="ww-mini" key={t} onClick={() => go({ name: "listing" })}>
                  <Photo icon={ic} style={{ width: 64, height: 56, borderRadius: 12, flex: "none" }} />
                  <span style={{ flex: 1 }}>
                    <strong>{t}</strong>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}><Star size={12} />{m}</span>
                  </span>
                  <span style={{ textAlign: "right", flex: "none" }}>
                    <b style={{ fontFamily: tokens.font.display, fontSize: 17 }}>{"\u20AC"}{p}</b>
                    <span style={{ display: "block", fontSize: 11.5, color: tokens.color.slate }}>p.p.</span>
                  </span>
                </a>
              ))}
            </div>
          )}

          <div className="ww-sidecard" style={{ background: tokens.color.softCoral, border: 0 }}>
            <h3>Workshop cadeau geven?</h3>
            <p style={{ color: tokens.color.ink, opacity: .72 }}>De ontvanger kiest zelf datum en workshop.</p>
            <Button variant="coral" block icon="gift">Naar de cadeaubon</Button>
          </div>
        </aside>
      </div>

      {faq && faq.length > 0 && (
        <section className="ww-section" style={{ paddingTop: 0 }}>
          <h2 style={{ marginBottom: 18 }}>Veelgestelde vragen</h2>
          <div className="ww-faq-list">
            {faq.map(([q, a], i) => (
              <div className="ww-faq-item" key={q}>
                <button className="ww-faq-q" aria-expanded={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                  {q}
                  <Icon name="down" size={19} style={{ flex: "none", transition: "transform .15s ease", transform: openFaq === i ? "rotate(180deg)" : "none" }} />
                </button>
                {openFaq === i && <p className="ww-faq-a">{a}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="ww-section">
        <div className="ww-shead"><h2>Lees ook</h2>
          <a onClick={() => go({ name: "blog" })}>Alle artikelen <Icon name="right" size={14} /></a></div>
        <div className="ww-snap ww-snap--narrow" style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
          {ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3).map((a) => (
            <article className="ww-card" key={a.title} style={{ overflow: "hidden" }}>
              <Photo icon={a.icon} style={{ aspectRatio: "16/9" }} />
              <div style={{ padding: 16 }}>
                <span className="ww-eyebrow">{a.cat}</span>
                <h3 style={{ fontSize: 17, margin: "8px 0 8px" }}>{a.title}</h3>
                <p className="ww-meta">{a.read}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
