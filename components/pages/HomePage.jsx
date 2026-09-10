"use client";

import { useState } from "react";
import { tokens } from "@/lib/tokens";
import { useGo } from "@/lib/use-go";
import { CATEGORIES, FEATURED } from "@/lib/mock-data";
import { Icon, Star, Button, Chip, Avatar } from "@/components/ui";
import { WorkshopCard } from "@/components/cards";

export default function HomePage({ categories = CATEGORIES, featured = FEATURED }) {
  const go = useGo();
  const [q, setQ] = useState("");
  return (
    <>
      <div className="ww-wrap">
        <section className="ww-hero">
          <span className="ww-sticker ww-st1"><Icon name="fork" size={24} /></span>
          <span className="ww-sticker ww-st2"><Icon name="palette" size={24} /></span>
          <span className="ww-sticker ww-st3"><Icon name="glass" size={24} /></span>
          <span className="ww-ratepill"><Star size={14} /> 4,9 gemiddeld</span>

          <h1>
            Vind iets <span className="ww-hl">wicked
              <svg viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true">
                <path d="M3 9c34-6 74-8 124-6 26 1 48 3 70 6" stroke="currentColor" strokeWidth="5"
                  fill="none" strokeLinecap="round" />
              </svg>
            </span> om te doen
          </h1>
          <p>Ontdek en boek unieke workshops en uitjes bij jou in de buurt.</p>

          <div className="ww-search">
            <Icon name="search" size={22} style={{ color: tokens.color.brand, flex: "none" }} />
            <input value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Waar heb je zin in?" aria-label="Zoek een workshop" />
            <button className="ww-search-go" aria-label="Zoeken" onClick={() => go({ name: "listing" })}>
              <Icon name="arrow" size={20} />
            </button>
          </div>

          <div className="ww-quick">
            <Chip soft onClick={() => go({ name: "listing" })}><Icon name="pin" size={15} /> Overal</Chip>
            {["Koken", "Keramiek", "Cocktails", "Bloemschikken", "Teamuitje"].map((t) => (
              <Chip key={t} soft onClick={() => go({ name: "listing" })}>{t}</Chip>
            ))}
          </div>
        </section>

        <section className="ww-section">
          <div className="ww-shead">
            <h2>Waar heb je zin in?</h2>
            <a onClick={() => go({ name: "listing" })}>Alles bekijken <Icon name="right" size={14} /></a>
          </div>
          <div className="ww-grid ww-grid--cats">
            {categories.slice(0, 12).map((c) => (
              <a key={c.slug} className="ww-cat" onClick={() => go({ name: "listing", category: c })}>
                <span className="ww-cat-ico"><Icon name={c.icon} size={20} /></span>
                <strong>{c.name}</strong>
                <span>{c.count} workshops</span>
              </a>
            ))}
          </div>
        </section>

        <section className="ww-section">
          <div className="ww-shead"><h2>Zo werkt het</h2></div>
          <div className="ww-steps">
            {[
              ["Kies", "Vind een workshop die bij je past. Filter op plek, datum en budget."],
              ["Boek", "Reserveer direct online. Veilig betalen en meteen bevestigd."],
              ["Beleef", "Kom langs, maak iets moois en neem het mee naar huis."],
            ].map(([t, d], i) => (
              <div className="ww-step" key={t}>
                <span className="ww-step-n">{i + 1}</span>
                <h3>{t}</h3><p>{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="ww-section">
          <div className="ww-shead">
            <h2>Deze week populair</h2>
            <a onClick={() => go({ name: "listing" })}>Bekijk alles <Icon name="right" size={14} /></a>
          </div>
          <div className="ww-grid ww-grid--4 ww-snap">
            {featured.map((w) => <WorkshopCard key={w.slug} w={w} go={go} />)}
          </div>
        </section>

        <section className="ww-section">
          <div className="ww-band ww-band--ink">
            <div className="ww-band-split">
              <div>
                <h2>Iets te vieren met je team?</h2>
                <p>Van teamuitje tot personeelsfeest. Wij regelen de workshop, de facturatie en alles ertussenin.</p>
                <ul className="ww-ticks">
                  {["Voorstel binnen 1 werkdag", "Factuur met btw", "Van 5 tot 500 personen"].map((t) => (
                    <li key={t}><Icon name="check" size={17} style={{ color: tokens.color.coral }} />{t}</li>
                  ))}
                </ul>
              </div>
              <div><Button variant="coral" size="lg" block>Vraag een teamuitje aan</Button></div>
            </div>
          </div>
        </section>

        <section className="ww-section">
          <div className="ww-shead"><h2>Wat deelnemers zeggen</h2></div>
          <div className="ww-quotes ww-snap ww-snap--wide">
            {[
              ["Sanne de Vries", "Keramiek workshop, Utrecht", "Zo leuk om samen iets te maken. We komen echt terug voor de volgende."],
              ["Mark Janssen", "Cocktailworkshop, Amsterdam", "Perfect teamuitje. Alles was tot in de puntjes geregeld, wij hoefden niets te doen."],
              ["Iris Bakker", "BBQ workshop, Rotterdam", "Nog nooit zo gelachen met de vriendinnen. Absolute aanrader voor een dagje uit."],
            ].map(([name, ctx, body]) => (
              <figure className="ww-quote" key={name}>
                <span className="ww-stars" aria-label="5 sterren">{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={14} />)}</span>
                <p>{body}</p>
                <figcaption className="ww-who">
                  <Avatar name={name} />
                  <span><strong>{name}</strong><span>{ctx}</span></span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="ww-section">
          <div className="ww-grid--2" style={{ gridTemplateColumns: "2fr", gap: 18 }}>
            <div className="ww-band ww-band--cloud ww-band-split">
              <div>
                <h2>Heb jij een talent om te delen?</h2>
                <p>Start je eerste workshop, bepaal je eigen prijs en bereik heel Nederland.</p>
              </div>
              <Button variant="primary" size="lg">Word workshopgever</Button>
            </div>
            <div className="ww-band ww-band--coral ww-band-split">
              <div>
                <h2>Geef een workshop cadeau</h2>
                <p>Een beleving die ze niet vergeten, met de Wicked cadeaubon. De ontvanger kiest zelf de datum.</p>
              </div>
              <Button variant="coral" size="lg" icon="gift">Bekijk de cadeaubon</Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
