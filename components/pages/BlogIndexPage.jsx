"use client";

import { useState } from "react";
import { tokens } from "@/lib/tokens";
import { useGo } from "@/lib/use-go";
import { ARTICLES, ART_CATEGORIES } from "@/lib/mock-data";
import { Icon, Button, Chip, Photo } from "@/components/ui";

export default function BlogIndexPage({ articles = ARTICLES, categories = ART_CATEGORIES }) {
  const go = useGo();
  const [cat, setCat] = useState("Alles");
  const [shown, setShown] = useState(6);
  const [mail, setMail] = useState("");
  const [sent, setSent] = useState(false);

  const filtered = articles.filter((a) => cat === "Alles" || a.cat === cat);
  const lead = cat === "Alles" ? filtered.find((a) => a.lead) : null;
  const rest = filtered.filter((a) => a !== lead);
  const visible = rest.slice(0, shown);

  const pick = (c) => { setCat(c); setShown(6); };

  return (
    <div className="ww-wrap">
      <nav className="ww-crumbs" aria-label="Kruimelpad">
        <a onClick={() => go({ name: "home" })}>Home</a><span>/</span>
        <span style={{ color: tokens.color.ink }}>Inspiratie</span>
      </nav>

      <header className="ww-blog-head">
        <span className="ww-eyebrow">Inspiratie</span>
        <h1>Ideeen voor je volgende uitje</h1>
        <p>
          Verhalen, technieken en tips van de mensen die de workshops geven. Lees je in, en boek
          daarna iets dat je nog niet eerder deed.
        </p>
      </header>

      <div className="ww-blog-filters" role="tablist" aria-label="Filter op onderwerp">
        {categories.map((c) => (
          <Chip key={c} on={cat === c} onClick={() => pick(c)} role="tab" aria-selected={cat === c}>
            {c}
          </Chip>
        ))}
      </div>

      {lead && (
        <button className="ww-lead" onClick={() => go({ name: "article", article: lead })}>
          <Photo icon={lead.icon} tone="coral" size={38} />
          <div className="ww-lead-body">
            <span className="ww-eyebrow">Uitgelicht · {lead.cat}</span>
            <h2>{lead.title}</h2>
            <p>{lead.excerpt}</p>
            <span className="ww-acard-foot" style={{ marginTop: 4, paddingTop: 0 }}>
              <span>{lead.read}</span><span>{lead.date}</span>
            </span>
            <span className="ww-btn ww-btn--ghost" style={{ padding: 0, height: 30, alignSelf: "flex-start" }}>
              Lees het artikel <Icon name="right" size={15} />
            </span>
          </div>
        </button>
      )}

      {visible.length > 0 ? (
        <div className="ww-blog-grid">
          {visible.map((a) => (
            <button className="ww-acard" key={a.title} onClick={() => go({ name: "article", article: a })}>
              <Photo icon={a.icon} />
              <div className="ww-acard-body">
                <span className="ww-eyebrow">{a.cat}</span>
                <h3>{a.title}</h3>
                <p>{a.excerpt}</p>
                <span className="ww-acard-foot">
                  <span>{a.read}</span><span>{a.date}</span>
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="ww-card ww-empty" style={{ marginTop: 26 }}>
          <h3>Nog niets over {cat}</h3>
          <p>We schrijven hier binnenkort over. Kijk ondertussen bij alle artikelen.</p>
          <Button variant="outline" onClick={() => pick("Alles")}>Toon alle artikelen</Button>
        </div>
      )}

      {visible.length < rest.length && (
        <div className="ww-loadmore">
          <Button variant="outline" size="lg" onClick={() => setShown(shown + 3)}>
            Meer artikelen laden
          </Button>
        </div>
      )}

      <section className="ww-section">
        <div className="ww-news">
          <h2 style={{ fontSize: 26 }}>De leukste workshops in je mail</h2>
          <p>Elke maand nieuwe workshops en ideeen voor je volgende uitje. Geen spam, beloofd.</p>
          {sent ? (
            <p style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 700 }}>
              <Icon name="check" size={20} /> Je staat op de lijst. Tot volgende maand.
            </p>
          ) : (
            <div className="ww-news-form">
              <input className="ww-input" type="email" value={mail} onChange={(e) => setMail(e.target.value)}
                placeholder="jouw@email.nl" aria-label="E-mailadres" />
              <Button variant="coral" onClick={() => mail.includes("@") && setSent(true)}>Aanmelden</Button>
            </div>
          )}
        </div>
      </section>

      <section className="ww-section" style={{ paddingTop: 0 }}>
        <div className="ww-band ww-band--cloud ww-band-split">
          <div>
            <h2>Genoeg gelezen?</h2>
            <p>Zoek een workshop bij jou in de buurt en zet het meteen in je agenda.</p>
          </div>
          <Button variant="primary" size="lg" onClick={() => go({ name: "listing" })}>
            Bekijk het aanbod
          </Button>
        </div>
      </section>
    </div>
  );
}
