"use client";

import { useState } from "react";
import { useGo } from "@/lib/use-go";
import { ARTICLES, ART_CATEGORIES } from "@/lib/mock-data";
import { Icon, Button, Chip } from "@/components/ui";
import { ArticleCard } from "@/components/cards";

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
    <>
      <section className="ww-lp-header">
        <div className="ww-wrap">
          <nav className="ww-crumbs" aria-label="Kruimelpad" style={{ paddingTop: 0, color: "rgba(255,255,255,.65)" }}>
            <a onClick={() => go({ name: "home" })}>Home</a><span>/</span><span>Inspiratie</span>
          </nav>
          <div style={{ maxWidth: 720 }}>
            <span className="ww-eyebrow" style={{ color: "var(--ww-brand-light)" }}>Inspiratie</span>
            <h1 style={{ marginTop: 10 }}>Ideeën voor je volgende uitje</h1>
            <p style={{ marginTop: 12 }}>
              Verhalen, technieken en tips van de mensen die de workshops geven. Lees je in, en boek daarna iets dat je nog niet eerder deed.
            </p>
          </div>
        </div>
      </section>

      <div className="ww-wrap">
        {lead && (
          <button className="ww-lead" onClick={() => go({ name: "article", article: lead })}>
            <div className="ww-lead-body">
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span className="ww-eyebrow">{lead.cat}</span>
                <span style={{ fontSize: 13, color: "var(--ww-text-secondary)" }}>{lead.date} · {lead.read}</span>
              </div>
              <h2>{lead.title}</h2>
              <p>{lead.excerpt}</p>
              <span className="ww-btn ww-btn--ghost" style={{ padding: 0, height: 30, alignSelf: "flex-start", marginTop: 4 }}>
                Lees het artikel <Icon name="right" size={15} />
              </span>
            </div>
            <div className="ww-lead-img">
              <PhotoPlaceholder icon={lead.icon} />
            </div>
          </button>
        )}

        <div className="ww-blog-filters" role="tablist" aria-label="Filter op onderwerp">
          {categories.map((c) => (
            <Chip key={c} on={cat === c} onClick={() => pick(c)} role="tab" aria-selected={cat === c}>
              {c}
            </Chip>
          ))}
        </div>

        {visible.length > 0 ? (
          <div className="ww-blog-grid">
            {visible.map((a) => (
              <ArticleCard key={a.slug} article={a} go={go} />
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
          <div style={{ display: "flex", marginTop: 28 }}>
            <Button variant="outline" size="lg" iconRight="right" onClick={() => setShown(shown + 3)}>
              Meer artikelen
            </Button>
          </div>
        )}
      </div>

      <section className="ww-section ww-section--ink" style={{ marginTop: 40 }}>
        <div className="ww-wrap">
          <div className="ww-business-grid">
            <div>
              <h2 style={{ color: "#fff" }}>Liefst meteen boeken?</h2>
              <p style={{ color: "rgba(255,255,255,.78)", marginTop: 10, marginBottom: 18 }}>
                Kom uit het lezen door naar workshops die je vandaag nog kunt reserveren. Sla het lezen over en ga direct het avontuur aan.
              </p>
              <Button variant="inverse" iconRight="arrow" onClick={() => go({ name: "listing" })}>Bekijk alle workshops</Button>
            </div>
            <div>
              <h3 style={{ color: "#fff", fontSize: 20, marginBottom: 8 }}>Elke maandag een nieuwe keuze</h3>
              <p style={{ color: "rgba(255,255,255,.78)", marginBottom: 18 }}>
                Twaalf workshops die eruit springen, uitgezocht door de redactie. Geen algoritme.
              </p>
              {sent ? (
                <p style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 700, color: "#fff" }}>
                  <Icon name="check" size={20} /> Je staat op de lijst. Tot volgende maand.
                </p>
              ) : (
                <div className="ww-news-form">
                  <input
                    className="ww-input"
                    type="email"
                    value={mail}
                    onChange={(e) => setMail(e.target.value)}
                    placeholder="jouw@email.nl"
                    aria-label="E-mailadres"
                    style={{ border: 0 }}
                  />
                  <Button variant="coral" onClick={() => mail.includes("@") && setSent(true)}>Aanmelden</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function PhotoPlaceholder({ icon = "spark", tone }) {
  return (
    <div className="ww-ph" data-tone={tone} style={{ height: "100%" }}>
      <span className="ww-ph-i"><Icon name={icon} size={38} /></span>
    </div>
  );
}
