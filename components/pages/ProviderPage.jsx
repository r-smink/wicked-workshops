"use client";

import { useState } from "react";
import { tokens } from "@/lib/tokens";
import { useGo } from "@/lib/use-go";
import { MARCO_WORKSHOPS, MARCO_REVIEWS } from "@/lib/mock-data";
import { Icon, Star, Button, Badge, Rating, Photo, Avatar } from "@/components/ui";
import { ReadMore } from "@/components/layout";

export default function ProviderPage({ workshops = MARCO_WORKSHOPS, reviews = MARCO_REVIEWS }) {
  const go = useGo();
  const [following, setFollowing] = useState(false);
  return (
    <div className="ww-wrap">
      <nav className="ww-crumbs" aria-label="Kruimelpad">
        <a>Home</a><span>/</span><a>Aanbieders</a><span>/</span>
        <span style={{ color: tokens.color.ink }}>Marco Rossi</span>
      </nav>

      <header className="ww-phero">
        <Avatar name="Marco Rossi" size={96} />
        <div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
            <Badge kind="verified" /><Badge kind="top_rated" />
          </div>
          <h1>Marco Rossi</h1>
          <p className="ww-phero-sub">Italiaanse kok · Utrecht · geeft workshops sinds 2019</p>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <button className="ww-chip"><Icon name="share" size={15} /> Delen</button>
          <button className="ww-chip" onClick={() => setFollowing(!following)}
            style={following ? { background: tokens.color.brand, borderColor: tokens.color.brand, color: "#fff" } : undefined}>
            <Icon name="heart" size={15} fill={following} /> {following ? "Je volgt Marco" : "Volgen"}
          </button>
        </div>
      </header>

      <div className="ww-pstats">
        {[["4,9", "412 reviews", true], ["540", "deelnemers"], ["3", "workshops"], ["2 uur", "gem. reactietijd"]].map(([v, l, star]) => (
          <div className="ww-pstat" key={l}>
            <b>{star && <Star size={18} />}{v}</b><span>{l}</span>
          </div>
        ))}
      </div>

      <div className="ww-two">
        <div>
          <section className="ww-block">
            <h2>Over Marco</h2>
            <ReadMore>
            <p>
              Opgegroeid in de keuken van zijn nonna in Bologna, verhuisde Marco tien jaar geleden naar
              Utrecht. Wat begon als pastamaken voor vrienden groeide uit tot workshops voor honderden
              deelnemers per jaar.
            </p>
            <p>
              Zijn missie: laten zien dat de echte Italiaanse keuken geen sterrenkeuken is, maar handwerk
              dat iedereen kan leren. Verwacht geen strakke kookschool maar een lange tafel, opgestroopte
              mouwen en muziek uit Bologna.
            </p>
            </ReadMore>
            <ul className="ww-facts-list">
              {[["pin", "Kookstudio De Pan, Wittevrouwen, Utrecht"],
                ["globe", "Spreekt Nederlands, Italiaans en Engels"],
                ["users", "Ook beschikbaar voor teamuitjes tot 12 personen"]].map(([i, t]) => (
                <li key={t}><Icon name={i} size={19} />{t}</li>
              ))}
            </ul>
          </section>

          <section className="ww-block">
            <h2>Sfeerimpressie</h2>
            <div className="ww-strip">
              <Photo icon="fork" tone="coral" /><Photo icon="bowl" /><Photo icon="users" />
              <Photo icon="camera"><span className="ww-strip-more">+14</span></Photo>
            </div>
          </section>

          <section className="ww-block">
            <h2>Workshops van Marco</h2>
            {workshops.map((w) => (
              <article className="ww-wrow" key={w.title}>
                <Photo icon={w.icon} style={{ width: 96, height: 78, borderRadius: 13, flex: "none" }} />
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                    <h3>{w.title}</h3>{w.badge && <Badge kind={w.badge} />}
                  </div>
                  <p className="ww-meta">{w.meta}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
                    <Rating value={w.rating} count={w.count} />
                    <span className="ww-next"><Icon name="calendar" size={13} /> Eerstvolgende: {w.next}</span>
                  </div>
                </div>
                <div className="ww-wrow-price">
                  <span>vanaf</span><b>{"\u20AC"}{w.price}</b>
                  <Button variant="outline" size="sm" style={{ marginTop: 8 }}
                    onClick={() => go({ name: "workshop" })}>Bekijken</Button>
                </div>
              </article>
            ))}
          </section>

          <section className="ww-block">
            <h2>Beoordelingen</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <span style={{ fontFamily: tokens.font.display, fontSize: 32, fontWeight: 800, display: "flex", alignItems: "center", gap: 7 }}>
                <Star size={22} />4,9
              </span>
              <span className="ww-meta">412 reviews over 3 workshops</span>
            </div>
            <div className="ww-reviews ww-snap ww-snap--wide">
              {reviews.map((r) => (
                <article className="ww-review" key={r.name + r.ws}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span aria-label="5 sterren">{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={13} />)}</span>
                    <span className="ww-chip ww-chip--soft" style={{ height: 26, fontSize: 12, pointerEvents: "none" }}>{r.ws}</span>
                  </div>
                  <p>{r.body}</p>
                  <div className="ww-who">
                    <Avatar name={r.name} /><span><strong>{r.name}</strong><span>{r.when}</span></span>
                  </div>
                </article>
              ))}
            </div>
            <div style={{ marginTop: 18 }}><Button variant="outline">Bekijk alle 412 reviews</Button></div>
          </section>

          <section className="ww-block">
            <h2>Ontdek meer</h2>
            <div className="ww-links">
              {["Kookworkshops Utrecht", "Workshops in Utrecht", "Italiaans koken", "Pasta workshops", "Teamuitjes Utrecht"].map((l) => (
                <a className="ww-chip ww-chip--soft" key={l}>{l}</a>
              ))}
            </div>
          </section>
        </div>

        <aside>
          <div className="ww-sidecard">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <Avatar name="Marco Rossi" size={46} />
              <div><h3 style={{ marginBottom: 2 }}>Vraag aan Marco?</h3>
                <p style={{ margin: 0 }}>Reageert gemiddeld binnen 2 uur</p></div>
            </div>
            <Button variant="primary" block icon="chat">Stel een vraag</Button>
            <ul className="ww-trust" style={{ marginTop: 16 }}>
              {[["shield", "Boeken en betalen via Wicked"], ["calendar", "Gratis annuleren tot 48 uur vooraf"],
                ["check", "Alleen reviews van echte deelnemers"]].map(([i, t]) => (
                <li key={t}><Icon name={i} size={17} />{t}</li>
              ))}
            </ul>
          </div>

          <div className="ww-sidecard">
            <h3>Teamuitje bij Marco?</h3>
            <p>Vanaf 10 personen een groepsofferte met factuur, voorstel binnen 1 werkdag.</p>
            <Button variant="outline" block>Vraag groepsofferte</Button>
          </div>
        </aside>
      </div>

      <div className="ww-provbar">
        <span style={{ flex: 1, minWidth: 0 }}>
          <strong style={{ fontSize: 14.5, display: "block" }}>Vraag aan Marco?</strong>
          <span className="ww-meta" style={{ fontSize: 12.5 }}>Reageert binnen 2 uur</span>
        </span>
        <Button variant="primary" icon="chat">Stel een vraag</Button>
      </div>

      <section className="ww-section">
        <div className="ww-band ww-band--cloud ww-band-split">
          <div>
            <h2>Zelf iets te delen, net als Marco?</h2>
            <p>Van thuiskok tot keramist: start je eerste workshop op Wicked, ook zonder ervaring als docent.</p>
          </div>
          <Button variant="primary" size="lg" onClick={() => go({ name: "auth", tab: "provider" })}>
            Word workshopgever
          </Button>
        </div>
      </section>
    </div>
  );
}
