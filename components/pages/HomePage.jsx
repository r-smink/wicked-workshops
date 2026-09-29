"use client";

import { useState } from "react";
import { useGo } from "@/lib/use-go";
import { CATEGORIES, FEATURED } from "@/lib/mock-data";
import { Icon, Star, Button, Chip, Avatar } from "@/components/ui";
import { WorkshopCard } from "@/components/cards";

const HERO_QUICK = ["Koken", "Keramiek", "Cocktails", "Bloemschikken", "Schilderen", "Teamuitje"];

const CITIES = [
  { name: "Amsterdam", count: "412" },
  { name: "Utrecht", count: "198" },
  { name: "Rotterdam", count: "286" },
  { name: "Den Haag", count: "156" },
  { name: "De rest van Nederland", icon: "pin", brand: true },
];

const TIMELINE = [
  { title: "Kies iets leuks", body: "Filter op wat je zoekt: een stad, een gelegenheid of gewoon iets dat je nog nooit deed." },
  { title: "Boek het moment", body: "Kies een datum die past, reserveer direct en ontvang meteen je bevestiging." },
  { title: "Er op uit", body: "Kom langs, maak iets moois en neem herinneringen én vaak zelfs een echt resultaat mee." },
];

const REVIEWS = [
  { name: "Sanne de Vries", context: "Keramiek workshop, Utrecht", body: "Zo leuk om samen iets te maken. We komen echt terug voor de volgende. Aanrader!", rating: 5 },
  { name: "Mark Janssen", context: "Cocktailworkshop, Amsterdam", body: "Perfect teamuitje. Alles was tot in de puntjes geregeld, wij hoefden niets te doen.", rating: 5 },
  { name: "Iris Bakker", context: "BBQ workshop, Rotterdam", body: "Nog nooit zo gelachen met de vriendinnen. Absolute aanrader voor een dagje uit.", rating: 5 },
];

export default function HomePage({ categories = CATEGORIES, featured = FEATURED }) {
  const go = useGo();
  const [q, setQ] = useState("");

  return (
    <>
      <section className="ww-hero">
        <div className="ww-hero-bg" aria-hidden="true">
          <div />
        </div>
        <div className="ww-wrap ww-hero-in">
          <h1>Workshops en uitjes om iets <em>wicked</em> te doen</h1>
          <p>Ontdek en boek unieke workshops bij jou in de buurt. Van keramiek tot cocktails, voor een date, je vrienden of het hele team.</p>

          <div className="ww-hero-search">
            <Icon name="search" size={20} style={{ color: "var(--ww-brand)", flex: "none" }} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Zoek een stad, workshop of aanbieder"
              aria-label="Zoek een stad, workshop of aanbieder"
            />
            <button className="ww-hero-search-btn" aria-label="Zoeken" onClick={() => go({ name: "listing" })}>
              Zoeken
            </button>
          </div>

          <div className="ww-hero-chips">
            {HERO_QUICK.map((t) => (
              <Chip key={t} onClick={() => go({ name: "listing" })}>{t}</Chip>
            ))}
          </div>
        </div>
      </section>

      <div className="ww-wrap">
        <section className="ww-section">
          <div className="ww-shead">
            <h2>Onze paradeplaatjes</h2>
            <a onClick={() => go({ name: "listing" })}>Bekijk alles <Icon name="right" size={14} /></a>
          </div>
          <div className="ww-grid ww-grid--4 ww-snap">
            {featured.map((w) => <WorkshopCard key={w.slug} w={w} go={go} />)}
          </div>
        </section>
      </div>

      <section className="ww-section ww-section--coral">
        <div className="ww-wrap">
          <div className="ww-shead">
            <h2>Waar heb je zin in?</h2>
            <a onClick={() => go({ name: "listing" })}>Alle categorieen <Icon name="right" size={14} /></a>
          </div>
          <div className="ww-catgrid">
            {categories.slice(0, 12).map((c) => (
              <a key={c.slug} className="ww-catcard" onClick={() => go({ name: "listing", category: c })}>
                <PhotoPlaceholder icon={c.icon} />
                <strong>{c.name}</strong>
                <span>{c.count} workshops</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="ww-wrap">
        <section className="ww-section">
          <div className="ww-shead">
            <h2>Dichtbij is ook gewoon leuk</h2>
            <a onClick={() => go({ name: "listing" })}>Alle steden <Icon name="right" size={14} /></a>
          </div>
          <div className="ww-citygrid">
            {CITIES.map((c) => (
              <a key={c.name} className={`ww-citycard${c.brand ? " ww-citycard--brand" : ""}`} onClick={() => go({ name: "listing" })}>
                {!c.brand && <PhotoPlaceholder />}
                {c.brand && <Icon name={c.icon} size={28} />}
                <strong>{c.name}</strong>
              </a>
            ))}
          </div>
        </section>
      </div>

      <section className="ww-section ww-section--ink">
        <div className="ww-wrap">
          <div className="ww-shead">
            <div>
              <span className="ww-eyebrow">Zo werkt het</span>
              <h2 style={{ marginTop: 8 }}>Van idee naar zaterdagmiddag</h2>
            </div>
          </div>
          <div className="ww-timeline">
            {TIMELINE.map((t, i) => (
              <div className="ww-tl-item" key={t.title}>
                <span className="ww-tl-n">{i + 1}</span>
                <h3>{t.title}</h3>
                <p>{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="ww-wrap">
        <section className="ww-section">
          <div className="ww-business-grid">
            <div>
              <span className="ww-eyebrow">Voor bedrijven</span>
              <h2 style={{ marginTop: 8 }}>Een teamuitje in de buurt van jullie kantoor</h2>
              <p style={{ marginTop: 12, color: "var(--ww-text-secondary)" }}>
                Vertel ons de groepsgrootte, het budget en de plaats. Binnen een werkdag hoor je van ons, met een voorstel dat bij jullie past.
              </p>
              <ul className="ww-ticks">
                {["Groepen van 10 tot 20 personen, grotere groepen in overleg", "In 187 plaatsen, dus ook buiten de Randstad", "Bookingkosten \u20AC0, je betaalt wat de workshopgever vraagt"].map((t) => (
                  <li key={t}><Icon name="check" size={17} />{t}</li>
                ))}
              </ul>
              <p style={{ marginTop: 18, fontSize: 13, color: "var(--ww-text-muted)" }}>
                Facturatie en btw worden nog uitgewerkt met de fiscalist.
              </p>
            </div>
            <div className="ww-business-form">
              <h3>Vraag een voorstel aan</h3>
              <p>Je naam, bedrijf en wensen. Wij regelen de rest.</p>
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                <input className="ww-input" placeholder="Voor- en achternaam" />
                <input className="ww-input" placeholder="Bedrijfsnaam" />
                <input className="ww-input" placeholder="E-mailadres" />
                <input className="ww-input" placeholder="Plaats" />
              </div>
              <select className="ww-input" style={{ marginTop: 12 }}>
                <option>10 tot 20 personen</option>
                <option>20 tot 50 personen</option>
                <option>50+ personen</option>
              </select>
              <select className="ww-input" style={{ marginTop: 12 }}>
                <option>{"\u20AC"}35 tot {"\u20AC"}60 p.p.</option>
                <option>{"\u20AC"}60 tot {"\u20AC"}100 p.p.</option>
                <option>{"\u20AC"}100+ p.p.</option>
              </select>
              <textarea className="ww-textarea" style={{ marginTop: 12, minHeight: 80 }} placeholder="Waar denk jij aan?" />
              <Button variant="primary" block size="lg" style={{ marginTop: 14 }}>Verstuur de aanvraag <Icon name="arrow" size={16} /></Button>
            </div>
          </div>
        </section>
      </div>

      <section className="ww-section ww-section--ink">
        <div className="ww-wrap">
          <div className="ww-shead">
            <h2 style={{ color: "#fff" }}>Wat deelnemers zeggen</h2>
          </div>
          <div className="ww-quotes">
            {REVIEWS.map((r) => (
              <figure className="ww-quote" key={r.name}>
                <span className="ww-stars" aria-label={`${r.rating} sterren`}>
                  {Array.from({ length: r.rating }, (_, i) => <Star key={i} size={14} />)}
                </span>
                <p style={{ fontSize: 16 }}>"{r.body}"</p>
                <figcaption className="ww-who">
                  <Avatar name={r.name} />
                  <span><strong>{r.name}</strong><span>{r.context}</span></span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <div className="ww-wrap">
        <section className="ww-section">
          <div className="ww-band ww-band-split">
            <div>
              <h2>Jij kunt iets wat anderen willen leren</h2>
              <p style={{ marginTop: 10, marginBottom: 18 }}>
                Start je eerste workshop, bepaal je eigen prijs en bereik heel Nederland. Van eerste aanmelding tot eerste boeking.
              </p>
              <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
                <div><strong style={{ fontSize: 24, display: "block" }}>0%</strong><span style={{ fontSize: 13, color: "var(--ww-text-secondary)" }}>opstartkosten</span></div>
                <div><strong style={{ fontSize: 24, display: "block" }}>187</strong><span style={{ fontSize: 13, color: "var(--ww-text-secondary)" }}>plaatsen</span></div>
                <div><strong style={{ fontSize: 24, display: "block" }}>24h</strong><span style={{ fontSize: 13, color: "var(--ww-text-secondary)" }}>tot eerste reactie</span></div>
              </div>
              <Button variant="primary" size="lg" onClick={() => go({ name: "auth", tab: "provider" })}>Word workshopgever</Button>
            </div>
            <div>
              <PhotoPlaceholder ratio="4/3" />
            </div>
          </div>
        </section>

        <section className="ww-section" style={{ paddingTop: 0 }}>
          <div className="ww-band ww-band--coral ww-band-split">
            <div>
              <h2>Een middagje in huis van een ander</h2>
              <p>Geef een workshop cadeau met de Wicked cadeaubon. De ontvanger kiest zelf de workshop en de datum.</p>
            </div>
            <Button variant="coral" size="lg" icon="gift" onClick={() => go({ name: "giftcard" })}>Bekijk de cadeaubon</Button>
          </div>
        </section>

        <section className="ww-section" style={{ paddingTop: 0 }}>
          <div className="ww-band ww-band--ink ww-band-split">
            <div>
              <h2 style={{ color: "#fff" }}>187 plaatsen, van Sluis tot Delfzijl</h2>
              <p style={{ color: "rgba(255,255,255,.78)" }}>Vind een workshop bij jou in de buurt, of ontdek iets nieuws tijdens een dagje weg.</p>
              <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
                <Button variant="inverse" onClick={() => go({ name: "listing" })}>Bekijk alle workshops</Button>
                <Button variant="outline" style={{ borderColor: "rgba(255,255,255,.3)", color: "#fff" }} onClick={() => go({ name: "listing" })}>Zoek op kaart</Button>
              </div>
            </div>
            <div>
              <PhotoPlaceholder ratio="4/3" tone="ink" />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function PhotoPlaceholder({ icon = "spark", ratio, tone }) {
  return (
    <div className="ww-ph" data-tone={tone} style={{ aspectRatio: ratio, height: "100%" }}>
      <span className="ww-ph-i"><Icon name={icon} size={32} /></span>
    </div>
  );
}
