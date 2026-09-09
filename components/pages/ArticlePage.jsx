"use client";

import { useState } from "react";
import { tokens } from "@/lib/tokens";
import { useGo } from "@/lib/use-go";
import { ART_SECTIONS, ART_FAQ } from "@/lib/mock-data";
import { Icon, Star, Button, Photo, Avatar } from "@/components/ui";

export default function ArticlePage({ sections = ART_SECTIONS, faq = ART_FAQ }) {
  const go = useGo();
  const [openFaq, setOpenFaq] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const [mail, setMail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="ww-wrap">
      <nav className="ww-crumbs" aria-label="Kruimelpad">
        <a>Home</a><span>/</span><a onClick={() => go({ name: "blog" })}>Inspiratie</a><span>/</span><a onClick={() => go({ name: "blog" })}>Koken & bakken</a><span>/</span>
        <span style={{ color: tokens.color.ink }}>Zelf sushi rollen</span>
      </nav>

      <div className="ww-art">
        <article>
          <span className="ww-chip ww-chip--soft" style={{ pointerEvents: "none" }}>Koken & bakken</span>
          <h1>Zelf sushi rollen: de technieken uit een workshop</h1>
          <div className="ww-byline">
            <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <Avatar name="Lisa Wicked" /> Lisa van Wicked
            </span>
            <span>Bijgewerkt 3 augustus 2026</span>
            <span>5 min lezen</span>
            <button className="ww-chip" style={{ marginLeft: "auto" }}><Icon name="share" size={15} /> Delen</button>
          </div>

          <section className="ww-answer">
            <h2>Het korte antwoord</h2>
            <p>
              Zelf sushi rollen leer je in drie stappen: gebruik echte sushirijst op smaak met
              rijstazijn, vul dun met maximaal twee ingredienten, en rol strak op met een bamboematje.
              Na een workshop van 2,5 uur rol je zelfstandig maki.
            </p>
          </section>

          <div className="ww-prose">
            <p>
              Sushi maken lijkt moeilijker dan het is. Met de juiste rijst, een beetje techniek en wat
              oefening rol je thuis binnen een uur je eerste maki. In dit artikel delen we de technieken
              die je in een <a onClick={() => go({ name: "listing" })}>sushi workshop</a> leert, zodat je
              weet wat je te wachten staat.
            </p>

            <h2 id="rijst">1. De rijst is het halve werk</h2>
            <p>
              Goede sushi begint bij de rijst. Gebruik echte sushirijst (kortkorrelig), spoel hem tot het
              water helder is en breng hem na het koken op smaak met rijstazijn, suiker en zout. De
              verhouding luistert nauw, en precies dat is wat je in een workshop onder begeleiding leert
              aanvoelen.
            </p>
            <p className="ww-tip">
              <strong>Tip uit de workshop:</strong> laat de rijst afkoelen tot lichaamstemperatuur voor je
              gaat rollen. Te warme rijst maakt het zeewier slap.
            </p>

            <h2 id="rollen">2. Rollen zonder knoeien</h2>
            <p>
              Leg het norivel met de ruwe kant naar boven op je matje, verdeel de rijst dun en laat
              bovenaan een strook vrij. Minder vulling is meer: twee ingredienten per rol is genoeg.
            </p>
            <p>
              Rol met het matje strak op, druk zachtjes aan en snijd met een nat mes. In een workshop zie
              je dit een chef voordoen, en dat scheelt maanden zelf uitproberen.
            </p>

            <h2 id="thuis">3. Dit heb je thuis nodig</h2>
            <ul>
              {["Rolmatje van bamboe (paar euro bij de toko)", "Sushirijst, rijstazijn en norivellen",
                "Scherp mes en een kom water", "Verse vulling: zalm, komkommer of avocado"].map((t) => (
                <li key={t}><Icon name="check" size={19} />{t}</li>
              ))}
            </ul>
            <p>
              Meer keukens ontdekken? Bekijk ook onze <a onClick={() => go({ name: "listing" })}>kookworkshops
              in Utrecht</a> of een <a onClick={() => go({ name: "listing" })}>Thaise kookworkshop</a> voor
              een heel ander smakenpalet.
            </p>

            <h2 id="vragen">4. Veelgestelde vragen</h2>
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

          <div className="ww-author">
            <Avatar name="Lisa Wicked" size={52} />
            <div>
              <strong style={{ fontSize: 16 }}>Lisa van Wicked</strong>
              <p className="ww-meta" style={{ marginTop: 6 }}>
                Schrijft over workshops en uitjes, en probeerde er zelf al meer dan veertig.
                Favoriet tot nu toe: glasblazen.
              </p>
            </div>
          </div>

          <div className="ww-news">
            <h2 style={{ fontSize: 24 }}>De leukste workshops in je mail</h2>
            <p>Elke maand nieuwe workshops en ideeen voor je volgende uitje. Geen spam, beloofd.</p>
            {sent ? (
              <p style={{ display: "flex", alignItems: "center", gap: 9, opacity: 1, fontWeight: 700 }}>
                <Icon name="check" size={20} /> Je staat op de lijst. Tot volgende maand.
              </p>
            ) : (
              <div className="ww-news-form">
                <input className="ww-input" value={mail} onChange={(e) => setMail(e.target.value)}
                  placeholder="jouw@email.nl" aria-label="E-mailadres" type="email" />
                <Button variant="coral" onClick={() => mail.includes("@") && setSent(true)}>Aanmelden</Button>
              </div>
            )}
          </div>

          <section className="ww-section" style={{ paddingBottom: 0 }}>
            <div className="ww-band ww-band--cloud ww-band-split">
              <div>
                <h2>Zin gekregen?</h2>
                <p>Vind een sushi workshop bij jou in de buurt en sta binnenkort zelf te rollen.</p>
              </div>
              <Button variant="primary" size="lg" onClick={() => go({ name: "listing" })}>
                Bekijk sushi workshops
              </Button>
            </div>
          </section>
        </article>

        <aside>
          <nav className="ww-toc" aria-label="In dit artikel" data-open={tocOpen ? "true" : "false"}>
            <h3 style={{ marginBottom: 0 }}>
              <button className="ww-toc-toggle" onClick={() => setTocOpen(!tocOpen)} aria-expanded={tocOpen}>
                In dit artikel
                <Icon name="down" size={17} style={{ color: tokens.color.brand,
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
            <h3>Liever leren van een chef?</h3>
            {[["Sushi workshop voor beginners", "4,8 (207) · Utrecht", 49, "bowl"],
              ["Sushi masterclass met chef Ken", "4,9 (98) · Amsterdam", 65, "fork"]].map(([t, m, p, ic]) => (
              <a className="ww-mini" key={t} onClick={() => go({ name: "listing" })}>
                <Photo icon={ic} style={{ width: 64, height: 56, borderRadius: 12, flex: "none" }} />
                <span style={{ flex: 1 }}>
                  <strong>{t}</strong>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}><Star size={12} />{m}</span>
                </span>
                <span style={{ textAlign: "right", flex: "none" }}>
                  <b style={{ fontFamily: tokens.font.display, fontSize: 17 }}>{"\u20AC"}{p}</b>
                  <span style={{ display: "block", fontSize: 11.5, color: tokens.color.slate }}>p.p.</span>
                </span>
              </a>
            ))}
            <Button variant="outline" block style={{ marginTop: 12 }} onClick={() => go({ name: "listing" })}>
              Bekijk alle sushi workshops
            </Button>
          </div>

          <div className="ww-sidecard" style={{ background: tokens.color.softCoral, border: 0 }}>
            <h3>Workshop cadeau geven?</h3>
            <p style={{ color: tokens.color.ink, opacity: .72 }}>De ontvanger kiest zelf datum en workshop.</p>
            <Button variant="coral" block icon="gift">Naar de cadeaubon</Button>
          </div>
        </aside>
      </div>

      <section className="ww-section">
        <div className="ww-shead"><h2>Lees ook</h2>
          <a onClick={() => go({ name: "blog" })}>Alle artikelen <Icon name="right" size={14} /></a></div>
        <div className="ww-snap ww-snap--narrow" style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
          {[["Koken", "Thuis ramen maken zoals in Japan", "6 min lezen", "bowl"],
            ["Inspiratie", "Origineel date-idee: samen koken", "4 min lezen", "heart"],
            ["Cadeau", "Een workshop cadeau geven: zo werkt het", "3 min lezen", "gift"]].map(([cat, t, r, ic]) => (
            <article className="ww-card" key={t} style={{ overflow: "hidden" }}>
              <Photo icon={ic} style={{ aspectRatio: "16/9" }} />
              <div style={{ padding: 16 }}>
                <span className="ww-eyebrow">{cat}</span>
                <h3 style={{ fontSize: 17, margin: "8px 0 8px" }}>{t}</h3>
                <p className="ww-meta">{r}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
