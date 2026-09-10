"use client";

import { useState, useEffect } from "react";
import { tokens } from "@/lib/tokens";
import { useGo } from "@/lib/use-go";
import { FEATURED, SESSIONS, REVIEWS, FAQ, LISTING } from "@/lib/mock-data";
import { Icon, Star, Button, Chip, Badge, Rating, Photo, Avatar } from "@/components/ui";
import { ReadMore } from "@/components/layout";
import { WorkshopCard } from "@/components/cards";
import Map from "@/components/Map";

function BookingCard({ workshop, sessions = SESSIONS }) {
  const [session, setSession] = useState(sessions[0].id);
  const [people, setPeople] = useState(2);
  const price = workshop.price;
  const chosen = sessions.find((s) => s.id === session);
  const max = Math.min(12, chosen.seats);

  useEffect(() => { if (people > max) setPeople(max); }, [session, max, people]);

  return (
    <div className="ww-booking">
      <div className="ww-book-price">
        <span><b>{"\u20AC"}{price}</b> <span>per persoon</span></span>
        <Rating value={workshop.rating} count={workshop.count} />
      </div>

      <h3 style={{ fontSize: 16, margin: "18px 0 11px" }}>Kies een datum</h3>
      <div className="ww-slots">
      {sessions.map((s) => (
        <button key={s.id} className="ww-slot" data-on={session === s.id ? "true" : "false"}
          onClick={() => setSession(s.id)} aria-pressed={session === s.id}>
          <span><strong>{s.day}</strong><span>{s.time}</span></span>
          <span className="ww-seats" data-low={s.seats <= 4 ? "true" : "false"}>
            {s.seats <= 4 ? `Nog ${s.seats} plekken` : `${s.seats} plekken`}
          </span>
        </button>
      ))}
      </div>
      <button className="ww-btn ww-btn--ghost" style={{ padding: 0, height: 34 }}>
        Bekijk alle datums <Icon name="right" size={15} />
      </button>

      <h3 style={{ fontSize: 16, margin: "18px 0 4px" }}>Aantal personen</h3>
      <div className="ww-stepper">
        <span style={{ fontSize: 14, color: tokens.color.slate }}>{"\u20AC"}{price} per persoon</span>
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="ww-stepper-btn" onClick={() => setPeople(Math.max(1, people - 1))}
            disabled={people <= 1} aria-label="Minder personen">-</button>
          <strong style={{ minWidth: 20, textAlign: "center", fontSize: 16 }}>{people}</strong>
          <button className="ww-stepper-btn" onClick={() => setPeople(Math.min(max, people + 1))}
            disabled={people >= max} aria-label="Meer personen">+</button>
        </span>
      </div>

      <Button variant="primary" size="lg" block>Boek voor {"\u20AC"}{price * people}</Button>
      <p style={{ fontSize: 12.5, color: tokens.color.slate, textAlign: "center", marginTop: 10 }}>
        Je betaalt nog niets, eerst bevestigen
      </p>

      <ul className="ww-trust">
        {[["shield", "Gratis annuleren tot 48 uur vooraf"], ["check", "Veilig betalen via Wicked"], ["chat", "Direct contact met Marco"]].map(([i, t]) => (
          <li key={t}><Icon name={i} size={17} />{t}</li>
        ))}
      </ul>
    </div>
  );
}

export default function WorkshopPage({ workshop, sessions = SESSIONS, reviews = REVIEWS, faq = FAQ, listing = LISTING }) {
  const go = useGo();
  const w = workshop || FEATURED[0];
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <>
      <div className="ww-wrap">
        <nav className="ww-crumbs" aria-label="Kruimelpad">
          <a onClick={() => go({ name: "home" })}>Home</a><span>/</span>
          <a onClick={() => go({ name: "listing" })}>Koken & bakken</a><span>/</span>
          <a onClick={() => go({ name: "listing" })}>Utrecht</a><span>/</span>
          <span style={{ color: tokens.color.ink }}>{w.title}</span>
        </nav>

        <header style={{ paddingTop: 18 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Badge kind="top_rated" />
            <span className="ww-chip ww-chip--soft" style={{ pointerEvents: "none" }}>Koken & bakken</span>
          </div>
          <h1 style={{ fontSize: "clamp(28px,4.4vw,44px)" }}>{w.title}</h1>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginTop: 14 }}>
            <Rating value={w.rating} count={`${w.count} reviews`} size={16} />
            <span className="ww-meta">Utrecht, Wittevrouwen</span>
            <span className="ww-meta">540 deelnemers gingen je voor</span>
            <span style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <Chip><Icon name="share" size={15} /> Delen</Chip>
              <Chip><Icon name="heart" size={15} /> Bewaren</Chip>
            </span>
          </div>
        </header>

        <div className="ww-gallery">
          <Photo icon={w.icon} tone="coral" />
          <Photo icon="glass" /><Photo icon="fork" />
          <Photo icon="users" />
          <Photo icon="camera">
            <button className="ww-gallery-btn"><Icon name="eye" size={16} /> Alle 12 foto's</button>
          </Photo>
          <span className="ww-gallery-count"><Icon name="camera" size={14} /> 1 / 12</span>
        </div>

        <div className="ww-detail">
          <div>
            <div className="ww-facts">
              {[["clock", "3 uur", "Duur"], ["users", "4 tot 12 personen", "Groepsgrootte"],
                ["gauge", "Beginner", "Niveau"], ["globe", "Nederlands", "Taal"]].map(([i, v, l]) => (
                <div className="ww-fact" key={l}>
                  <span className="ww-fact-ico"><Icon name={i} size={19} /></span>
                  <span><strong>{v}</strong><span>{l}</span></span>
                </div>
              ))}
            </div>

            <section className="ww-block">
              <h2>Over deze workshop</h2>
              <ReadMore>
              <p>
                Leer in drie uur de basis van de Italiaanse keuken. Je maakt verse pasta vanaf nul,
                een klassieke ragu en tiramisu zoals de nonna van Marco die maakt.
              </p>
              <p>
                Je werkt in tweetallen, alle ingredienten zijn inbegrepen en na afloop eet je samen aan
                de lange tafel. Ideaal als date, met vrienden of als teamuitje tot twaalf personen.
              </p>
              </ReadMore>
              <blockquote className="ww-pull">
                <Star size={15} /> De pasta was heerlijk en Marco maakt er echt een feestje van.
                Perfect voor een date. <strong style={{ color: tokens.color.ink }}>Sanne, juli 2026</strong>
              </blockquote>
            </section>

            <section className="ww-block">
              <h2>Wat is inbegrepen</h2>
              <ul className="ww-inc">
                {["Alle ingredienten en materialen", "Welkomstdrankje en hapjes",
                  "Samen eten na afloop", "Recepten mee naar huis"].map((t) => (
                  <li key={t}><span className="ww-inc-ico"><Icon name="check" size={19} /></span>{t}</li>
                ))}
              </ul>
            </section>

            <section className="ww-block">
              <h2>Je workshopgever</h2>
              <div className="ww-provider">
                <Avatar name="Marco Rossi" size={56} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <strong style={{ fontSize: 17 }}>Marco Rossi</strong>
                    <Badge kind="verified" />
                  </div>
                  <p className="ww-meta" style={{ margin: "6px 0 14px" }}>
                    Geeft workshops sinds 2019 · 540 deelnemers · reageert binnen 2 uur
                  </p>
                  <Button variant="outline" onClick={() => go({ name: "provider" })}>Bekijk profiel</Button>
                </div>
              </div>
            </section>

            <section className="ww-block">
              <h2>Locatie</h2>
              <p style={{ fontWeight: 700, marginBottom: 4 }}>Kookstudio De Pan, Wittevrouwen, Utrecht</p>
              <p className="ww-meta">
                Exact adres na boeking · 5 min lopen van Utrecht CS · gratis fietsenstalling
              </p>
              <Map
                markers={[{
                  slug: w.slug, title: w.title, price: w.price,
                  lat: w.lat, lng: w.lng,
                }]}
                style={{
                  marginTop: 16, height: 200, borderRadius: 18,
                  border: `1px solid ${tokens.color.line}`, position: "relative",
                  background: "repeating-linear-gradient(0deg,#fff,#fff 30px,#F4F1FA 30px,#F4F1FA 31px), repeating-linear-gradient(90deg,#fff,#fff 30px,#F4F1FA 30px,#F4F1FA 31px)",
                }}
              />
            </section>

            <section className="ww-block">
              <h2>Beoordelingen</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                <span style={{ fontFamily: tokens.font.display, fontSize: 34, fontWeight: 800 }}>4,9</span>
                <span className="ww-meta">op basis van 312 reviews</span>
              </div>
              <div className="ww-scores">
                {[["Sfeer", 4.9], ["Uitleg", 4.8], ["Waarde", 4.7]].map(([l, v]) => (
                  <div className="ww-score" key={l}>
                    <span>{l}</span>
                    <span className="ww-bar"><i style={{ width: `${(v / 5) * 100}%` }} /></span>
                    <span>{String(v).replace(".", ",")}</span>
                  </div>
                ))}
              </div>
              <div className="ww-reviews ww-snap ww-snap--wide">
                {reviews.map((r) => (
                  <article className="ww-review" key={r.name}>
                    <span aria-label="5 sterren">{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={13} />)}</span>
                    <p>{r.body}</p>
                    <div className="ww-who">
                      <Avatar name={r.name} />
                      <span><strong>{r.name}</strong><span>{r.when}</span></span>
                    </div>
                  </article>
                ))}
              </div>
              <div style={{ marginTop: 18 }}>
                <Button variant="outline">Bekijk alle 312 reviews</Button>
              </div>
            </section>

            <section className="ww-block">
              <h2>Praktisch</h2>
              <div className="ww-practical">
                {[["gift", "Als cadeau te geven", "Direct als cadeaubon te versturen, ontvanger kiest zelf de datum"],
                  ["fork", "Dieetwensen", "Vegetarisch mogelijk, geef het door bij je boeking"],
                  ["users", "Toegankelijkheid", "Studio is rolstoeltoegankelijk"]].map(([i, t, d]) => (
                  <div className="ww-prac" key={t}>
                    <span style={{ color: tokens.color.brand }}><Icon name={i} size={22} /></span>
                    <strong>{t}</strong><p>{d}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="ww-block" style={{ borderBottom: 0 }}>
              <h2>Veelgestelde vragen</h2>
              {faq.map(([q, a], i) => (
                <div className="ww-faq-item" key={q}>
                  <button className="ww-faq-q" aria-expanded={openFaq === i}
                    onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                    {q}
                    <Icon name="down" size={19} style={{ transform: openFaq === i ? "rotate(180deg)" : "none", transition: "transform .15s ease", flex: "none" }} />
                  </button>
                  {openFaq === i && <p className="ww-faq-a">{a}</p>}
                </div>
              ))}
            </section>
          </div>

          <aside>
            <BookingCard workshop={w} sessions={sessions} />

            <div className="ww-sidecard">
              <h3>Met je team komen?</h3>
              <p>Vanaf 10 personen regelen we een groepsofferte met factuur, voorstel binnen 1 werkdag.</p>
              <Button variant="outline" block>Vraag groepsofferte</Button>
            </div>

            <div className="ww-sidecard" style={{ background: tokens.color.softCoral, border: 0 }}>
              <h3>Geef deze workshop cadeau</h3>
              <p style={{ color: tokens.color.ink, opacity: .7 }}>Ontvanger kiest zelf de datum.</p>
              <Button variant="coral" block icon="gift">Naar de cadeaubon</Button>
            </div>
          </aside>
        </div>

        <section className="ww-section">
          <div className="ww-shead">
            <h2>Ook leuk voor jou</h2>
            <a onClick={() => go({ name: "listing" })}>Meer in Utrecht <Icon name="right" size={14} /></a>
          </div>
          <div className="ww-grid ww-grid--4 ww-snap">
            {listing.slice(1, 5).map((x) => <WorkshopCard key={x.slug} w={x} go={go} showKm />)}
          </div>
        </section>
      </div>

      <div className="ww-mobbar">
        <span className="ww-price">
          <b>{"\u20AC"}{w.price}</b><span>per persoon</span>
        </span>
        <Button variant="primary" style={{ flex: 1 }}>Kies een datum</Button>
      </div>
    </>
  );
}
