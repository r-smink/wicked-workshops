"use client";

import { useState } from "react";
import { useGo } from "@/lib/use-go";
import { ARTICLES, ART_SECTIONS, ART_FAQ } from "@/lib/mock-data";
import { Icon, Star, Button, Photo, Avatar } from "@/components/ui";
import { WorkshopCard } from "@/components/cards";
import { useDemoMode } from "@/components/DemoModeProvider";
import { DEMO_ARTICLES, DEMO_IMAGES } from "@/lib/demo-data";

const RELATED_WORKSHOPS = [
  { slug: "kaarsen-gieten-met-droogbloemen", title: "Kaarsen gieten met droogbloemen", city: "Rotterdam", duration: "2 uur", rating: 4.9, count: 42, price: 32, badge: "top_rated", icon: "flower" },
  { slug: "geuren-mengen-en-zelf-gieten", title: "Geuren mengen en zelf gieten", city: "Utrecht", duration: "2,5 uur", rating: 4.8, count: 18, price: 38, icon: "spa" },
  { slug: "kaars-en-houder-allebei-zelf", title: "Kaars en houder, allebei zelf", city: "Groningen", duration: "3 uur", rating: 4.7, count: 29, price: 49, badge: "new", icon: "hammer" },
  { slug: "kaarsen-maken-met-vriendinnen", title: "Kaarsen maken met vriendinnen", city: "Rotterdam", duration: "2 uur", rating: 4.9, count: 65, price: 34, icon: "heart" },
];

export default function ArticlePage({ article: sourceArticle = ARTICLES[0] }) {
  const go = useGo();
  const { demoMode } = useDemoMode();
  const article = demoMode
    ? DEMO_ARTICLES.find((item) => item.slug === sourceArticle?.slug) || DEMO_ARTICLES[0]
    : sourceArticle;
  const [openFaq, setOpenFaq] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);

  const sections = article.sections ?? ART_SECTIONS;
  const faq = article.faq ?? ART_FAQ;

  return (
    <div className="ww-wrap">
      <nav className="ww-crumbs" aria-label="Kruimelpad">
        <a onClick={() => go({ name: "home" })}>Home</a><span>/</span>
        <a onClick={() => go({ name: "blog" })}>Inspiratie</a><span>/</span>
        <a onClick={() => go({ name: "blog" })}>{article.cat}</a><span>/</span>
        <span style={{ color: "var(--ww-text-primary)" }}>{article.title}</span>
      </nav>

      <div className="ww-art">
        <article>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span className="ww-chip ww-chip--soft" style={{ pointerEvents: "none" }}>{article.cat}</span>
            <span style={{ fontSize: 13, color: "var(--ww-text-secondary)" }}>{article.date} · {article.read}</span>
          </div>
          <h1>{article.title}</h1>

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
              <h2 id="benodigd">Wat je nodig hebt</h2>
              <ul>
                <li>Sojawas of paraffine, afhankelijk van het resultaat dat je wilt.</li>
                <li>Een geschikte pot en een thermometer, want temperatuur bepaalt alles.</li>
                <li>Lont met houder, het hart van elke kaars.</li>
                <li>Een beetje geduld en een goed werkblad, want knoeien hoort erbij.</li>
              </ul>
              <div className="ww-quote-block">
                "Het mengen van de geur duurt langer dan het gieten, en dat is precies de bedoeling."
              </div>
              <h2 id="thuis">Zelf doen of een workshop?</h2>
              <p>
                Materialen voor thuis kosten al gauw meer dan een workshop. Je deelt de kosten van de instructie en de
                materialen met de groep, en je krijgt er tips bij die je thuis niet snel ontdekt. Bovendien is het een
                stuk gezelliger.
              </p>
            </div>
          )}

          {article.hero && (
            <div className="ww-art-hero">
              <img src={article.hero} alt={article.title} />
            </div>
          )}

          <div className="ww-author">
            <Avatar name="Lisa Wicked" size={52} />
            <div>
              <strong style={{ fontSize: 16 }}>Lisa van Wicked</strong>
              <p style={{ marginTop: 6, fontSize: 14, color: "var(--ww-text-secondary)" }}>
                Schrijft over workshops en uitjes, en probeerde er zelf al meer dan veertig.
                Favoriet tot nu toe: glasblazen.
              </p>
            </div>
          </div>
        </article>

        <aside>
          <nav className="ww-toc" aria-label="In dit artikel" data-open={tocOpen ? "true" : "false"}>
            <h3 style={{ marginBottom: 0 }}>
              <button className="ww-toc-toggle" onClick={() => setTocOpen(!tocOpen)} aria-expanded={tocOpen}>
                In dit artikel
                <Icon name="down" size={17} style={{ color: "var(--ww-brand)",
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

          <div className="ww-sidecard">
            <h3>Geschreven door</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <Avatar name="Lisa Wicked" size={48} />
              <div>
                <strong>Lisa van Wicked</strong>
                <p style={{ fontSize: 12.5, color: "var(--ww-text-secondary)", margin: 0 }}>Redactie</p>
              </div>
            </div>
            <p style={{ fontSize: 13.5, color: "var(--ww-text-secondary)", marginBottom: 12 }}>
              Schrijft over workshops en uitjes, en probeerde er zelf al meer dan veertig.
            </p>
          </div>

          <div className="ww-sidecard ww-sidecard--coral">
            <h3>Liever meteen doen?</h3>
            <p>Zoek kaarsenworkshops bij jou in de buurt en boek direct.</p>
            <Button variant="primary" block icon="search" onClick={() => go({ name: "listing" })}>Kaarsenworkshops bekijken</Button>
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
        <div className="ww-shead">
          <h2>Workshops bij dit artikel</h2>
          <a onClick={() => go({ name: "listing" })}>Alle 74 <Icon name="right" size={14} /></a>
        </div>
        <div className="ww-grid ww-grid--4 ww-snap">
          {RELATED_WORKSHOPS.map((w, index) => (
            <WorkshopCard key={w.slug} w={demoMode ? { ...w, image: [DEMO_IMAGES.gift, "/demo/kaarsen2.jpg", "/demo/ambacht2.jpg", DEMO_IMAGES.business][index], imageAlt: `${w.title}, tijdelijk conceptbeeld` } : w} go={go} />
          ))}
        </div>
      </section>
    </div>
  );
}
