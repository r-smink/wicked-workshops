"use client";

import { useState } from "react";
import { useGo } from "@/lib/use-go";
import { Icon, Button, Chip } from "@/components/ui";
import { WorkshopCard } from "@/components/cards";

const TEAM_CHOICES = [
  { slug: "samen-koken-en-daarna-eten", title: "Samen koken en daarna eten", city: "Utrecht", duration: "3 uur", rating: 4.9, count: 42, price: 52, badge: "top_rated", icon: "fork", groupSize: 10 },
  { slug: "iets-maken-en-meenemen", title: "Iets maken en meenemen", city: "Amsterdam", duration: "2,5 uur", rating: 4.8, count: 23, price: 45, icon: "bowl", groupSize: 8 },
  { slug: "naar-buiten-weg-van-kantoor", title: "Naar buiten, weg van kantoor", city: "Rotterdam", duration: "4 uur", rating: 4.8, count: 18, price: 38, badge: "new", icon: "hike", groupSize: 12 },
];

const FAQ = [
  ["Wat als een deel van het team niet mee kan of wil?", "Dat is normaal, dan zoeken we iets waar iedereen aan kan deelnemen. De meeste workshops zijn flexibel in groepsgrootte."],
  ["Kunnen we op kantoor in plaats van op locatie?", "Jazeker. Veel aanbieders komen naar je toe, of je huurt een locatie via ons mee."],
  ["Hoe zit het met de factuur en de btw?", "Je ontvangt een factuur op naam van je bedrijf. De btw-verwerking regelen we samen met de aanbieder."],
  ["En als het op de dag zelf misgaat?", "We hebben een noodnummer en een back-upplan. Dat hoort bij ons werk."],
  ["Kunnen we eerst zelf rondkijken?", "Tuurlijk. Boek een vrijblijvend intakegesprek of vraag een offerte aan."],
];

export default function BusinessPage() {
  const go = useGo();
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <>
      <section className="ww-business-hero">
        <div className="ww-wrap">
          <div className="ww-business-grid">
            <div>
              <h1>Een teamuitje in de buurt van jullie kantoor</h1>
              <p>
                Vertel ons de groepsgrootte, het budget en de plaats. Binnen een werkdag hoor je van ons,
                met een voorstel dat bij jullie past.
              </p>
              <ul className="ww-ticks" style={{ marginTop: 24 }}>
                {["Groepen van 10 tot 20 personen, grotere groepen in overleg", "In 187 plaatsen, dus ook buiten de Randstad", "Bookingkosten \u20AC0, je betaalt wat de workshopgever vraagt"].map((t) => (
                  <li key={t}><Icon name="check" size={17} />{t}</li>
                ))}
              </ul>
              <p style={{ marginTop: 18, fontSize: 13, color: "rgba(255,255,255,.65)" }}>
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
        </div>
      </section>

      <div className="ww-wrap">
        <section className="ww-section">
          <div className="ww-shead">
            <div>
              <span className="ww-eyebrow">Zo gaat het</span>
              <h2 style={{ marginTop: 8 }}>Drie stappen, en wij doen het zoekwerk.</h2>
            </div>
          </div>
          <div className="ww-timeline">
            {[
              { title: "Aanvraag", body: "Je vertelt wat je zoekt: groepsgrootte, budget, plaats en wanneer je ongeveer aan denkt." },
              { title: "Voorstel", body: "Binnen een werkdag hoor je van ons, met een aanbod dat past bij de groep en de plaats." },
              { title: "Beleven", body: "Jullie kiezen, wij leggen de datum vast bij de workshopgever en regelen de rest." },
            ].map((s, i) => (
              <div className="ww-tl-item" key={s.title}>
                <span className="ww-tl-n">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="ww-section" style={{ paddingTop: 0 }}>
          <div className="ww-shead">
            <h2>Wat teams vaak kiezen</h2>
            <a onClick={() => go({ name: "listing" })}>Bekijk alles <Icon name="right" size={14} /></a>
          </div>
          <div className="ww-grid ww-grid--3 ww-snap">
            {TEAM_CHOICES.map((w) => (
              <WorkshopCard key={w.slug} w={w} go={go} />
            ))}
          </div>
          <p className="ww-note" style={{ marginTop: 16 }}>Prijzen en aantallen zijn voorbeelddata.</p>
        </section>

        <section className="ww-section" style={{ paddingTop: 0 }}>
          <h2 style={{ marginBottom: 18 }}>De vragen die je echt hebt</h2>
          <p style={{ color: "var(--ww-text-secondary)", marginBottom: 24 }}>Ook de ongemakkelijke.</p>
          <div className="ww-faq-list">
            {FAQ.map(([q, a], i) => (
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
      </div>
    </>
  );
}
