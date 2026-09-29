"use client";

import { useState, useEffect } from "react";
import { useGo } from "@/lib/use-go";
import { CATEGORIES, LISTING, FILTER_GROUPS } from "@/lib/mock-data";
import { Icon, Button, Chip, Star } from "@/components/ui";
import { ReadMore } from "@/components/layout";
import { WorkshopCard } from "@/components/cards";
import Map from "@/components/Map";

function FilterDrawer({ open, onClose, active, setActive, price, setPrice, count }) {
  useEffect(() => {
    if (!open) return;
    const esc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open, onClose]);

  if (!open) return null;

  const toggle = (group, option) => {
    setActive((prev) => {
      const cur = prev[group] || [];
      const next = cur.includes(option) ? cur.filter((o) => o !== option) : [...cur, option];
      const copy = { ...prev };
      if (next.length) copy[group] = next; else delete copy[group];
      return copy;
    });
  };

  return (
    <>
      <div className="ww-overlay" onClick={onClose} />
      <aside className="ww-drawer" role="dialog" aria-label="Alle filters">
        <div className="ww-drawer-head">
          <h3>Alle filters</h3>
          <button className="ww-iconbtn" aria-label="Sluiten" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div className="ww-drawer-body">
          {FILTER_GROUPS.map((g) => (
            <div className="ww-fgroup" key={g.key}>
              <h4>{g.label}</h4>
              {g.type === "range" ? (
                <div className="ww-range">
                  <span>{"\u20AC"}15</span>
                  <input type="range" min="15" max="120" value={price}
                    onChange={(e) => setPrice(Number(e.target.value))} aria-label="Maximale prijs per persoon" />
                  <span>{"\u20AC"}{price}{price >= 120 ? "+" : ""}</span>
                </div>
              ) : (
                <div className="ww-fopts">
                  {g.options.map((o) => (
                    <Chip key={o} on={(active[g.key] || []).includes(o)} onClick={() => toggle(g.key, o)}>
                      {o}
                    </Chip>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="ww-drawer-foot">
          <button className="ww-btn ww-btn--ghost" onClick={() => { setActive({}); setPrice(120); }}>
            Wis alles
          </button>
          <Button variant="primary" block onClick={onClose}>Toon {count} workshops</Button>
        </div>
      </aside>
    </>
  );
}

export default function ListingPage({ category, listing = LISTING, filterGroups = FILTER_GROUPS }) {
  const go = useGo();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState({ snel: ["Kleine groep"] });
  const [price, setPrice] = useState(120);
  const [hover, setHover] = useState(null);
  const [sort, setSort] = useState("Aanbevolen");

  const cat = category || CATEGORIES[0];
  const activeCount = Object.values(active).reduce((a, v) => a + v.length, 0) + (price < 120 ? 1 : 0);
  const results = listing.filter((w) => w.price <= price);
  const markers = results.map((w) => ({
    slug: w.slug, title: w.title, price: w.price,
    lat: w.lat, lng: w.lng, x: w.x, y: w.y,
  }));
  const mapKey = markers.map((m) => m.slug).join(",");

  const quick = [
    { label: "Alle filters", icon: "sliders", all: true },
    { label: "Utrecht", active: true },
    { label: "Dit weekend", active: true },
    { label: "Kleine groep", active: true },
    { label: "Topbeoordeeld" },
    { label: "Gratis annuleren" },
    { label: "Direct boekbaar" },
  ];

  const moreFilters = ["Met vrienden", "Vrijgezellenfeest", "Kinderfeestje", "Teamuitje", "Nooit eerder gedaan", "Vrijdagmiddag vrij", "Onder \u20AC30", "Binnen een uur reizen"];

  return (
    <>
      <section className="ww-lp-header">
        <div className="ww-wrap">
          <nav className="ww-crumbs" aria-label="Kruimelpad" style={{ paddingTop: 0, color: "rgba(255,255,255,.65)" }}>
            <a onClick={() => go({ name: "home" })}>Home</a><span>/</span>
            <a>{cat.name}</a><span>/</span><span>Utrecht</span>
          </nav>
          <h1>{cat.name} in Utrecht</h1>
          <p>
            Van sushi rollen tot Italiaans koken met een chef. In Utrecht staan {results.length} {cat.name.toLowerCase()} online,
            van thuiskoks die net beginnen tot studio's die hier al jaren lesgeven. Je boekt direct en betaalt geen bookingkosten.
          </p>
          <div className="ww-lp-meta">
            <span><Icon name="book" size={14} /> {results.length} workshops</span>
            <span><Icon name="star" size={14} /> gemiddeld 4,7 · 1.204 reviews</span>
            <span><Icon name="check" size={14} /> Bookingkosten {"\u20AC"}0, altijd</span>
          </div>
        </div>
      </section>

      <div className="ww-filterbar">
        <div className="ww-wrap ww-filterbar-in">
          {quick.map((q) => (
            q.all ? (
              <button key={q.label} className="ww-fbtn" onClick={() => setOpen(true)}>
                <Icon name={q.icon} size={18} /> {q.label}
                {activeCount > 0 && <span className="ww-fcount">{activeCount}</span>}
              </button>
            ) : (
              <Chip key={q.label} on={q.active || (active.snel || []).includes(q.label)}
                onClick={() => {
                  if (q.active) return;
                  setActive((p) => {
                    const cur = p.snel || [];
                    const next = cur.includes(q.label) ? cur.filter((x) => x !== q.label) : [...cur, q.label];
                    const copy = { ...p };
                    if (next.length) copy.snel = next; else delete copy.snel;
                    return copy;
                  });
                }}>
                {q.label}
              </Chip>
            )
          ))}

          <span className="ww-viewtoggle" role="group" aria-label="Weergave">
            <button data-on="true">Lijst</button>
            <button data-on="false">Kaart</button>
          </span>

          <select className="ww-chip" style={{ height: 42, paddingRight: 10, marginLeft: "auto" }}
            value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sorteren">
            {["Aanbevolen", "Prijs oplopend", "Prijs aflopend", "Beoordeling", "Afstand", "Nieuw"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="ww-wrap">
        <div className="ww-listing">
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ww-text-primary)" }}>
                {results.length} workshops in Utrecht
              </span>
              {activeCount > 0 && (
                <button className="ww-btn ww-btn--ghost ww-btn--sm" onClick={() => setActive({})}>
                  Filter wissen <Icon name="right" size={14} />
                </button>
              )}
            </div>

            <div className="ww-listing-grid">
              {results.map((w) => (
                <div key={w.slug} onMouseEnter={() => setHover(w.slug)} onMouseLeave={() => setHover(null)}>
                  <WorkshopCard w={w} go={go} showKm />
                </div>
              ))}
            </div>

            {results.length === 0 && (
              <div className="ww-card" style={{ padding: 28, textAlign: "center" }}>
                <h3 style={{ fontSize: 19, marginBottom: 8 }}>Geen workshops binnen dit budget</h3>
                <p className="ww-wcard-meta" style={{ marginBottom: 16 }}>
                  Verhoog je maximumprijs of laat je verrassen met iets anders in Utrecht.
                </p>
                <Button variant="outline" onClick={() => setPrice(120)}>Prijsfilter wissen</Button>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
              <Button variant="outline" size="lg">Meer laden</Button>
            </div>

            <p className="ww-note" style={{ marginTop: 18 }}>
              Aanbod en aantallen zijn voorbeelddata.
            </p>
          </div>

          <aside className="ww-map-side">
            <Map
              key={mapKey}
              markers={markers}
              activeSlug={hover}
              onSelect={(slug) => setHover(slug)}
              className="ww-map"
            />
            <div className="ww-map-cta">
              <Button variant="inverse" size="sm">Open de kaart</Button>
            </div>
            <div className="ww-surprise-card">
              <strong>Verras me</strong>
              <p>Een workshop uit deze {results.length}, door ons gekozen.</p>
            </div>
          </aside>
        </div>

        <section className="ww-section ww-section--ink" style={{ borderRadius: "var(--ww-radius-xl)", marginTop: 40 }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 18 }}>
            <div>
              <h2 style={{ color: "#fff" }}>Waar je het nog niet?</h2>
              <p style={{ color: "rgba(255,255,255,.7)" }}>Kies op gelegenheid in plaats van op categorie.</p>
            </div>
            <Button variant="outline" style={{ borderColor: "rgba(255,255,255,.3)", color: "#fff" }}>Cadeaubon</Button>
          </div>
          <div className="ww-tagpick">
            {moreFilters.map((f) => (
              <Chip key={f} onClick={() => {}} style={{ background: "rgba(255,255,255,.12)", borderColor: "rgba(255,255,255,.15)", color: "#fff" }}>{f}</Chip>
            ))}
          </div>
        </section>

        <section className="ww-seo-text">
          <div className="ww-seo-grid">
            <div>
              <h2>Een {cat.name.toLowerCase()} in Utrecht kiezen</h2>
              <ReadMore>
                <p>
                  Utrecht heeft een bruisende scene, en dat zie je terug in het brede aanbod aan {cat.name.toLowerCase()}.
                  Of je nu voor het eerst meedoet of je techniek wilt aanscherpen, er is voor elk niveau iets te vinden.
                </p>
                <p>
                  Kies een workshop die bij je past en leer van ervaren aanbieders. Veel workshops zijn geschikt als
                  teamuitje of vrijgezellenfeest, en je kunt bij de meeste je eigen datum kiezen.
                </p>
              </ReadMore>
            </div>
            <div>
              <h3 style={{ fontSize: 18, marginBottom: 12 }}>Veelgestelde vragen</h3>
              <div className="ww-faq-list">
                {[
                  ["Kan ik met een dieetwens mee?", "Bijna elke workshop wel. Op de workshop-pagina staat welke wensen de aanbieder kan accommoderen."],
                  ["Tot wanneer kan ik annuleren?", "Dat verschilt per aanbieder. Gemiddeld kun je tot 48 uur van tevoren gratis annuleren."],
                  ["Is een kookworkshop geschikt voor beginners?", "Zeker. De meeste workshops zijn juist opgezet voor mensen zonder ervaring."],
                ].map(([q, a]) => (
                  <details className="ww-faq-item" key={q}>
                    <summary className="ww-faq-q">{q}<Icon name="down" size={18} style={{ flex: "none" }} /></summary>
                    <p className="ww-faq-a">{a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: 17, margin: "30px 0 12px" }}>Ook interessant</h3>
          <div className="ww-links">
            {[`${cat.name} Amsterdam`, "Sushi workshops", "BBQ workshops", `Cocktailworkshops Utrecht`, "Teamuitjes Utrecht", "Workshops in Utrecht"].map((l) => (
              <Chip key={l} soft onClick={() => go({ name: "listing" })}>{l}</Chip>
            ))}
          </div>
        </section>
      </div>

      <FilterDrawer open={open} onClose={() => setOpen(false)} active={active} setActive={setActive}
        price={price} setPrice={setPrice} count={results.length} />
    </>
  );
}
