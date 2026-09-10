"use client";

import { useState, useEffect } from "react";
import { tokens } from "@/lib/tokens";
import { useGo } from "@/lib/use-go";
import { CATEGORIES, LISTING, FILTER_GROUPS } from "@/lib/mock-data";
import { Icon, Button, Chip, Star, Photo } from "@/components/ui";
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
  const [mapView, setMapView] = useState(false);
  const [active, setActive] = useState({});
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

  const quick = ["Vandaag", "Kleine groep", "Topbeoordeeld", "Gratis annuleren", "Direct boekbaar"];

  return (
    <>
      <div className="ww-wrap">
        <nav className="ww-crumbs" aria-label="Kruimelpad">
          <a onClick={() => go({ name: "home" })}>Home</a><span>/</span>
          <a>{cat.name}</a><span>/</span><span>Utrecht</span>
        </nav>
      </div>

      <div className="ww-filterbar">
        <div className="ww-wrap ww-filterbar-in">
          <button className="ww-fbtn" onClick={() => setOpen(true)}>
            <Icon name="sliders" size={18} /> Alle filters
            {activeCount > 0 && <span className="ww-fcount">{activeCount}</span>}
          </button>
          <span className="ww-viewtoggle" role="group" aria-label="Weergave">
            <button data-on={!mapView ? "true" : "false"} onClick={() => setMapView(false)}>Lijst</button>
            <button data-on={mapView ? "true" : "false"} onClick={() => setMapView(true)}>Kaart</button>
          </span>
          {quick.map((q) => (
            <Chip key={q} on={(active.snel || []).includes(q)}
              onClick={() => setActive((p) => {
                const cur = p.snel || [];
                const next = cur.includes(q) ? cur.filter((x) => x !== q) : [...cur, q];
                const copy = { ...p };
                if (next.length) copy.snel = next; else delete copy.snel;
                return copy;
              })}>
              {q}
            </Chip>
          ))}
        </div>
      </div>

      <div className="ww-wrap">
        <div className="ww-results-head">
          <div>
            <h1>Kookworkshops in Utrecht</h1>
            <p>
              Van sushi rollen tot Italiaans koken met een chef. Boek een kookworkshop in Utrecht
              voor een date, met vrienden of als teamuitje, en bepaal zelf je datum.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="ww-meta" style={{ fontWeight: 700, color: tokens.color.ink }}>
              {results.length} resultaten
            </span>
            <select className="ww-chip" style={{ height: 42, paddingRight: 10 }}
              value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sorteren">
              {["Aanbevolen", "Prijs oplopend", "Prijs aflopend", "Beoordeling", "Afstand", "Nieuw"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="ww-listing">
          <div>
            <div className="ww-grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>
              {results.map((w) => (
                <div key={w.slug} onMouseEnter={() => setHover(w.slug)} onMouseLeave={() => setHover(null)}>
                  <WorkshopCard w={w} go={go} showKm />
                </div>
              ))}
            </div>
            {results.length === 0 && (
              <div className="ww-card" style={{ padding: 28, textAlign: "center" }}>
                <h3 style={{ fontSize: 19, marginBottom: 8 }}>Geen workshops binnen dit budget</h3>
                <p className="ww-meta" style={{ marginBottom: 16 }}>
                  Verhoog je maximumprijs of laat je verrassen met iets anders in Utrecht.
                </p>
                <Button variant="outline" onClick={() => setPrice(120)}>Prijsfilter wissen</Button>
              </div>
            )}
          </div>

          <Map
            key={mapKey}
            markers={markers}
            activeSlug={hover}
            onSelect={(slug) => setHover(slug)}
            className="ww-map"
          />
        </div>

        <section className="ww-seo-text">
          <h2>Over kookworkshops in Utrecht</h2>
          <ReadMore>
          <p>
            Utrecht heeft een bruisende foodscene, en dat zie je terug in het brede aanbod aan
            kookworkshops. Of je nu voor het eerst achter het fornuis staat of je techniek wilt
            aanscherpen, er is voor elk niveau iets te vinden.
          </p>
          <p>
            Kies een keuken die bij je past, van Italiaans en Frans tot Thais en Japans, en leer koken
            van ervaren chefs en enthousiaste thuiskoks. Veel workshops zijn geschikt als teamuitje of
            vrijgezellenfeest, en je kunt bij de meeste je eigen datum kiezen.
          </p>
          </ReadMore>
          <div className="ww-band ww-band--ink ww-band-split" style={{ margin: "24px 0 8px" }}>
            <div>
              <h2 style={{ fontSize: 24 }}>Kan je niet kiezen?</h2>
              <p>Laat je verrassen met een kookworkshop die bij je past.</p>
            </div>
            <Button variant="coral" onClick={() => go({ name: "workshop" })}>Verras me</Button>
          </div>

          <h3 style={{ fontSize: 17, margin: "22px 0 10px" }}>Ook interessant</h3>
          <div className="ww-links">
            {["Kookworkshops Amsterdam", "Sushi workshops", "BBQ workshops", "Cocktailworkshops Utrecht", "Teamuitjes Utrecht", "Workshops in Utrecht"].map((l) => (
              <Chip key={l} soft onClick={() => go({ name: "listing" })}>{l}</Chip>
            ))}
          </div>
        </section>
      </div>

      {mapView && (
        <div className="ww-mapfs" role="dialog" aria-label="Kaartweergave">
          <div className="ww-mapfs-top">
            <button className="ww-iconbtn" aria-label="Terug naar de lijst" onClick={() => setMapView(false)}>
              <Icon name="left" />
            </button>
            <strong style={{ fontSize: 15 }}>{results.length} workshops in Utrecht</strong>
            <Button variant="primary" size="sm" style={{ marginLeft: "auto" }} onClick={() => setMapView(false)}>
              Lijst
            </Button>
          </div>
          <Map
            key={mapKey}
            markers={markers}
            activeSlug={hover}
            onSelect={(slug) => setHover(slug)}
            style={{ position: "absolute", inset: 0 }}
          />
          <div className="ww-mapfs-cards">
            {results.map((w) => (
              <button className="ww-mcard" key={w.slug} onClick={() => go({ name: "workshop", workshop: w })}>
                <Photo icon={w.icon} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ fontSize: 14.5, display: "block", lineHeight: 1.3 }}>{w.title}</strong>
                  <span className="ww-meta" style={{ fontSize: 12.5, display: "flex", alignItems: "center", gap: 4 }}>
                    <Star size={12} />{String(w.rating).replace(".", ",")} ({w.count}) · {w.duration}
                  </span>
                </span>
                <span style={{ textAlign: "right", flex: "none" }}>
                  <b style={{ fontFamily: tokens.font.display, fontSize: 17 }}>{"\u20AC"}{w.price}</b>
                  <span style={{ display: "block", fontSize: 11, color: tokens.color.slate }}>p.p.</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <FilterDrawer open={open} onClose={() => setOpen(false)} active={active} setActive={setActive}
        price={price} setPrice={setPrice} count={results.length} />
    </>
  );
}
