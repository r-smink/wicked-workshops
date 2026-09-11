"use client";

import { useState, useEffect } from "react";
import { tokens } from "@/lib/tokens";
import { useGo } from "@/lib/use-go";
import { FEATURED, SESSIONS, REVIEWS, FAQ, LISTING } from "@/lib/mock-data";
import { Icon, Star, Button, Chip, Badge, Rating, Photo, Avatar } from "@/components/ui";
import { ReadMore } from "@/components/layout";
import { WorkshopCard } from "@/components/cards";
import Map from "@/components/Map";

function formatPrice(n) {
  if (n == null || isNaN(n)) return "0";
  return String(n).replace(".", ",");
}

function formatLangs(langs) {
  if (!langs || !langs.length) return "Nederlands";
  return langs.join(", ");
}

function BookingCard({ workshop, sessions = SESSIONS }) {
  const [session, setSession] = useState(sessions[0]?.id);
  const [people, setPeople] = useState(2);
  const price = workshop.price ?? 0;
  const chosen = sessions.find((s) => s.id === session) || sessions[0];
  const max = Math.min(12, chosen?.seats ?? 12);

  useEffect(() => { if (people > max) setPeople(max); }, [session, max, people]);

  return (
    <div className="ww-booking">
      <div className="ww-book-price">
        <span><b>{"\u20AC"}{formatPrice(price)}</b> <span>per persoon</span></span>
        <Rating value={workshop.rating} count={workshop.count ? `${workshop.count} reviews` : null} />
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
        <span style={{ fontSize: 14, color: tokens.color.slate }}>{"\u20AC"}{formatPrice(price)} per persoon</span>
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="ww-stepper-btn" onClick={() => setPeople(Math.max(1, people - 1))}
            disabled={people <= 1} aria-label="Minder personen">-</button>
          <strong style={{ minWidth: 20, textAlign: "center", fontSize: 16 }}>{people}</strong>
          <button className="ww-stepper-btn" onClick={() => setPeople(Math.min(max, people + 1))}
            disabled={people >= max} aria-label="Meer personen">+</button>
        </span>
      </div>

      <Button variant="primary" size="lg" block>Boek voor {"\u20AC"}{formatPrice(price * people)}</Button>
      <p style={{ fontSize: 12.5, color: tokens.color.slate, textAlign: "center", marginTop: 10 }}>
        Je betaalt nog niets, eerst bevestigen
      </p>

      <ul className="ww-trust">
        {["shield", "check", "chat"].map((i, idx) => (
          <li key={i}><Icon name={i} size={17} />
            {idx === 0 ? (workshop.cancellation?.includes("48") ? "Gratis annuleren tot 48 uur vooraf" : "Gratis annuleren tot 48 uur vooraf")
              : idx === 1 ? "Veilig betalen via Wicked" : `Direct contact met ${workshop.provider?.display_name?.split(" ")[0] || "aanbieder"}`}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function WorkshopPage({ workshop, sessions = SESSIONS, reviews = REVIEWS, faq = FAQ, listing = LISTING }) {
  const go = useGo();
  const w = workshop || FEATURED[0];
  const [openFaq, setOpenFaq] = useState(0);

  const facts = [
    ["clock", w.duration || "Variabel", "Duur"],
    ["users", `${w.min_participants ?? 4} tot ${w.max_participants ?? 12} personen`, "Groepsgrootte"],
    ["gauge", w.level ? (w.level.charAt(0).toUpperCase() + w.level.slice(1)) : "Alle niveaus", "Niveau"],
    ["globe", formatLangs(w.languages), "Taal"],
  ];

  const cityLabel = w.city ? (w.area ? `${w.city}, ${w.area}` : w.city) : "Utrecht";
  const prov = w.provider || {};
  const provLocation = w.location_name || (w.location_inherits_provider ? prov.location_name : null) || w.location_name;
  const provAddress = w.address || (w.location_inherits_provider ? prov.address : null) || w.address;
  const locationTitle = provLocation || w.location_name || `${w.area || ""}, ${w.city || ""}`;

  const hasReviews = Array.isArray(reviews) && reviews.length > 0;
  const hasFaq = Array.isArray(faq) && faq.length > 0;

  return (
    <>
      <div className="ww-wrap">
        <nav className="ww-crumbs" aria-label="Kruimelpad">
          <a onClick={() => go({ name: "home" })}>Home</a><span>/</span>
          <a onClick={() => go({ name: "listing" })}>{w.category}</a><span>/</span>
          <a onClick={() => go({ name: "listing" })}>{w.city}</a><span>/</span>
          <span style={{ color: tokens.color.ink }}>{w.title}</span>
        </nav>

        <header style={{ paddingTop: 18 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 12 }}>
            {w.badge && <Badge kind={w.badge} />}
            <span className="ww-chip ww-chip--soft" style={{ pointerEvents: "none" }}>{w.category}</span>
          </div>
          <h1 style={{ fontSize: "clamp(28px,4.4vw,44px)" }}>{w.title}</h1>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginTop: 14 }}>
            <Rating value={w.rating} count={`${w.count || 0} reviews`} size={16} />
            <span className="ww-meta">{cityLabel}</span>
            <span className="ww-meta">{w.participants_count ? `${w.participants_count} deelnemers gingen je voor` : (prov.participants_count ? `${prov.participants_count} deelnemers gingen je voor` : "Nog geen deelnemers")}</span>
            <span style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <Chip><Icon name="share" size={15} /> Delen</Chip>
              <Chip><Icon name="heart" size={15} /> Bewaren</Chip>
            </span>
          </div>
        </header>

        <div className="ww-gallery">
          {w.media && w.media.length > 0 ? (
            <>
              {w.media.slice(0, 5).map((m, i) => (
                <div className="ww-ph" key={i} style={i === 0 ? { gridArea: "1 / 1 / 3 / 3" } : undefined}>
                  <img src={m.url} alt={m.alt || w.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
              {w.media.length > 5 && (
                <div className="ww-ph" style={{ position: "relative" }}>
                  <img src={w.media[5].url} alt={w.media[5].alt || w.title} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(.55)" }} />
                  <button className="ww-gallery-btn"><Icon name="eye" size={16} /> Alle {w.media.length} foto's</button>
                </div>
              )}
              <span className="ww-gallery-count"><Icon name="camera" size={14} /> 1 / {w.media.length}</span>
            </>
          ) : (
            <>
              <Photo icon={w.icon} tone="coral" />
              <Photo icon="glass" /><Photo icon="fork" />
              <Photo icon="users" />
              <Photo icon="camera">
                <button className="ww-gallery-btn"><Icon name="eye" size={16} /> Alle 12 foto's</button>
              </Photo>
              <span className="ww-gallery-count"><Icon name="camera" size={14} /> 1 / 12</span>
            </>
          )}
        </div>

        <div className="ww-detail">
          <div>
            <div className="ww-facts">
              {facts.map(([i, v, l]) => (
                <div className="ww-fact" key={l}>
                  <span className="ww-fact-ico"><Icon name={i} size={19} /></span>
                  <span><strong>{v}</strong><span>{l}</span></span>
                </div>
              ))}
            </div>

            {w.intro && (
              <p className="ww-meta" style={{ fontSize: 17, marginBottom: 14 }}>{w.intro}</p>
            )}

            <section className="ww-block">
              <h2>Over deze workshop</h2>
              {w.description ? (
                <ReadMore>
                  <div className="ww-prose" dangerouslySetInnerHTML={{ __html: w.description }} />
                </ReadMore>
              ) : (
                <p className="ww-meta">Geen beschrijving beschikbaar.</p>
              )}
              {hasReviews && (
                <blockquote className="ww-pull">
                  <Star size={15} /> {reviews[0].body}{" "}
                  <strong style={{ color: tokens.color.ink }}>{reviews[0].name}, {reviews[0].when}</strong>
                </blockquote>
              )}
            </section>

            {w.inclusions && w.inclusions.length > 0 && (
              <section className="ww-block">
                <h2>Wat is inbegrepen</h2>
                <ul className="ww-inc">
                  {w.inclusions.map((t) => (
                    <li key={t}><span className="ww-inc-ico"><Icon name="check" size={19} /></span>{t}</li>
                  ))}
                </ul>
              </section>
            )}

            <section className="ww-block">
              <h2>Je workshopgever</h2>
              <div className="ww-provider">
                <Avatar name={prov.display_name || "Workshopgever"} size={56} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <strong style={{ fontSize: 17 }}>{prov.display_name || "Workshopgever"}</strong>
                    {prov.verified && <Badge kind="verified" />}
                  </div>
                  <p className="ww-meta" style={{ margin: "6px 0 14px" }}>
                    {prov.profession ? `${prov.profession} · ` : ""}
                    {prov.participants_count ? `${prov.participants_count} deelnemers` : ""}
                    {prov.response_time_minutes ? ` · reageert binnen ${prov.response_time_minutes} min` : ""}
                  </p>
                  <Button variant="outline" onClick={() => prov.slug && go({ name: "provider", slug: prov.slug })}>Bekijk profiel</Button>
                </div>
              </div>
            </section>

            <section className="ww-block">
              <h2>Locatie</h2>
              <p style={{ fontWeight: 700, marginBottom: 4 }}>{locationTitle}</p>
              <p className="ww-meta">
                {provAddress || "Exact adres na boeking"}
                {w.address_visibility === "after_booking" && !provAddress && " · exact adres na boeking"}
              </p>
              {w.lat != null && w.lng != null ? (
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
              ) : (
                <p className="ww-meta" style={{ marginTop: 12 }}>Kaart kon niet geladen worden.</p>
              )}
            </section>

            <section className="ww-block">
              <h2>Beoordelingen</h2>
              {w.rating != null ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                    <span style={{ fontFamily: tokens.font.display, fontSize: 34, fontWeight: 800 }}>{String(w.rating).replace(".", ",")}</span>
                    <span className="ww-meta">op basis van {w.count || 0} reviews</span>
                  </div>
                  {w.rating_atmosphere != null && w.rating_explanation != null && w.rating_value != null && (
                    <div className="ww-scores">
                      {[["Sfeer", w.rating_atmosphere], ["Uitleg", w.rating_explanation], ["Waarde", w.rating_value]].map(([l, v]) => (
                        <div className="ww-score" key={l}>
                          <span>{l}</span>
                          <span className="ww-bar"><i style={{ width: `${(Number(v) / 5) * 100}%` }} /></span>
                          <span>{String(v).replace(".", ",")}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="ww-meta">Nog geen reviews</p>
              )}
              {hasReviews && (
                <div className="ww-reviews ww-snap ww-snap--wide">
                  {reviews.map((r) => (
                    <article className="ww-review" key={r.name + r.when}>
                      <span aria-label="5 sterren">{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={13} />)}</span>
                      <p>{r.body}</p>
                      <div className="ww-who">
                        <Avatar name={r.name} />
                        <span><strong>{r.name}</strong><span>{r.when}</span></span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
              {w.count > 0 && (
                <div style={{ marginTop: 18 }}>
                  <Button variant="outline">Bekijk alle {w.count} reviews</Button>
                </div>
              )}
            </section>

            <section className="ww-block">
              <h2>Praktisch</h2>
              <div className="ww-practical">
                {w.giftcard_eligible && (
                  <div className="ww-prac">
                    <span style={{ color: tokens.color.brand }}><Icon name="gift" size={22} /></span>
                    <strong>Als cadeau te geven</strong>
                    <p>Direct als cadeaubon te versturen, ontvanger kiest zelf de datum</p>
                  </div>
                )}
                {w.cancellation_policy && (
                  <div className="ww-prac">
                    <span style={{ color: tokens.color.brand }}><Icon name="shield" size={22} /></span>
                    <strong>Annuleren</strong>
                    <p>{w.cancellation_policy === "flexible_48h" ? "Gratis tot 48 uur vooraf" : w.cancellation_policy === "moderate_7d" ? "Gratis tot 7 dagen vooraf" : "Geen annulering mogelijk"}</p>
                  </div>
                )}
                {w.instant_bookable !== undefined && (
                  <div className="ww-prac">
                    <span style={{ color: tokens.color.brand }}><Icon name="check" size={22} /></span>
                    <strong>Boeken</strong>
                    <p>{w.instant_bookable ? "Direct boekbaar, geen wachten op goedkeuring" : "Je boeking wordt eerst door de aanbieder bevestigd"}</p>
                  </div>
                )}
              </div>
            </section>

            {hasFaq && (
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
            )}
          </div>

          <aside>
            <BookingCard workshop={w} sessions={sessions} />

            {w.group_quote_from && (
              <div className="ww-sidecard">
                <h3>Met je team komen?</h3>
                <p>Vanaf {w.group_quote_from} personen regelen we een groepsofferte met factuur, voorstel binnen 1 werkdag.</p>
                <Button variant="outline" block>Vraag groepsofferte</Button>
              </div>
            )}

            {w.giftcard_eligible && (
              <div className="ww-sidecard" style={{ background: tokens.color.softCoral, border: 0 }}>
                <h3>Geef deze workshop cadeau</h3>
                <p style={{ color: tokens.color.ink, opacity: .7 }}>Ontvanger kiest zelf de datum.</p>
                <Button variant="coral" block icon="gift">Naar de cadeaubon</Button>
              </div>
            )}
          </aside>
        </div>

        <section className="ww-section">
          <div className="ww-shead">
            <h2>Ook leuk voor jou</h2>
            <a onClick={() => go({ name: "listing" })}>Meer in {w.city} <Icon name="right" size={14} /></a>
          </div>
          <div className="ww-grid ww-grid--4 ww-snap">
            {listing.slice(1, 5).map((x) => <WorkshopCard key={x.slug} w={x} go={go} showKm />)}
          </div>
        </section>
      </div>

      <div className="ww-mobbar">
        <span className="ww-price">
          <b>{"\u20AC"}{formatPrice(w.price)}</b><span>per persoon</span>
        </span>
        <Button variant="primary" style={{ flex: 1 }}>Kies een datum</Button>
      </div>
    </>
  );
}
