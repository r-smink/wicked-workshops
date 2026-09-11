"use client";

import { useState } from "react";
import { tokens } from "@/lib/tokens";
import { useGo } from "@/lib/use-go";
import {
  DASH_NAV, DASH_TITLES, DASH_SESSIONS, DASH_BOOKINGS, DASH_WORKSHOPS, DASH_VENUES, STATUS_LABEL,
} from "@/lib/mock-data";
import { Icon, Star, Button, Badge, Rating, Photo, Avatar } from "@/components/ui";
import ProviderProfileForm from "@/components/pages/ProviderProfileForm";
import WorkshopWizard from "@/components/pages/WorkshopWizard";
import VenueForm from "@/components/pages/VenueForm";

function Stat({ label, value, sub, accent }) {
  return (
    <div className={`ww-kpi${accent ? " ww-kpi--accent" : ""}`}>
      <span>{label}</span>
      <b>{value}</b>
      {sub && <em>{sub}</em>}
    </div>
  );
}

export default function Dashboard({
  initialView = "overview",
  sessions = DASH_SESSIONS,
  bookings = DASH_BOOKINGS,
  workshops = DASH_WORKSHOPS,
  reviews = [],
  venues = DASH_VENUES,
  nav = DASH_NAV,
  titles = DASH_TITLES,
  provider = null,
  categories = null,
  cities = [],
  initialWorkshop = null,
  kpis = null,
  user = null,
}) {
  const go = useGo();
  const [view, setView] = useState(initialView);
  const [menuOpen, setMenuOpen] = useState(false);

  if (view === "wizard") {
    return <WorkshopWizard go={go} provider={provider} categories={categories} cities={cities} initialWorkshop={initialWorkshop} />;
  }

  const [title, sub] = titles[view] || ["Dashboard", ""];

  return (
    <div className="ww-dash">
      <aside className={`ww-dash-side${menuOpen ? " ww-dash-side--open" : ""}`}>
        <div className="ww-dash-brand">
          <a className="ww-logo" onClick={() => go({ name: "home" })}>
            <Avatar name={provider?.display_name || "Wicked"} size={36} />
          </a>
          <div style={{ minWidth: 0 }}>
            <strong style={{ fontSize: 14, display: "block" }}>{provider?.display_name || "Aanbieder"}</strong>
            <span className="ww-meta" style={{ fontSize: 12.5 }}>{provider?.location_name || provider?.profession || "Wicked Workshops"}</span>
          </div>
          <button className="ww-iconbtn ww-dash-close" aria-label="Menu sluiten" onClick={() => setMenuOpen(false)}>
            <Icon name="close" />
          </button>
        </div>
        <nav className="ww-dash-nav">
          {nav.map((n) => (
            <button key={n.key} className="ww-dnav" data-on={view === n.key ? "true" : "false"}
              onClick={() => { setView(n.key); setMenuOpen(false); }}>
              <Icon name={n.icon} size={19} />{n.label}
              {n.dot && <span className="ww-dnav-dot">{n.dot}</span>}
            </button>
          ))}
        </nav>
        <div className="ww-dash-foot">
          <Button variant="primary" block icon="plus" onClick={() => setView("wizard")}>
            Nieuwe workshop
          </Button>
          <button className="ww-dash-logout" onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/inloggen";
          }}>
            <Icon name="logout" size={17} /> Uitloggen
          </button>
        </div>
      </aside>

      <main className="ww-dash-main">
        <div className="ww-dash-head">
          <button className="ww-iconbtn ww-dash-burger" aria-label="Menu openen" onClick={() => setMenuOpen(true)}>
            <Icon name="menu" />
          </button>
          <div style={{ flex: 1 }}>
            <h1>{title}</h1>
            <p className="ww-meta">{sub}</p>
          </div>
          <button className="ww-btn ww-btn--primary" onClick={() => setView("wizard")}>
            <Icon name="plus" size={17} /> Nieuwe workshop
          </button>
        </div>

        {view === "overview" && (
          <>
            <div className="ww-kpis">
              <Stat label="Deze maand" value={kpis ? `€ ${kpis.monthTotal.toLocaleString("nl-NL")}` : "€ 0"} sub={kpis ? `${kpis.monthBookings} boekingen` : ""} accent />
              <Stat label="Deelnemers" value={kpis ? String(kpis.totalParticipants) : "0"} sub={kpis ? `${kpis.upcomingSessions} komende sessies` : ""} />
              <Stat label="Beoordeling" value={kpis?.avgRating ? String(kpis.avgRating).replace(".", ",") : "—"} sub={kpis ? `${kpis.reviewCount} reviews` : ""} />
              <Stat label="Wachtrij" value={kpis ? String(kpis.pendingBookings) : "0"} sub="wacht op antwoord" />
            </div>
            <section className="ww-panel">
              <div className="ww-panel-head">
                <h2>Komende sessies</h2>
                <button className="ww-chip" onClick={() => setView("agenda")}>Alle datums</button>
              </div>
              <div className="ww-tablewrap">
                <table className="ww-table">
                  <thead>
                    <tr><th>Datum</th><th>Workshop</th><th>Bezetting</th><th style={{width:100}}></th></tr>
                  </thead>
                  <tbody>
                    {sessions.slice(0, 4).map((s, i) => (
                      <tr key={i}>
                        <td><strong>{s.date}</strong><span className="ww-meta" style={{display:"block",fontSize:12.5}}>{s.time}</span></td>
                        <td>{s.ws}</td>
                        <td><span className="ww-cap"><Icon name="users" size={15} /> {s.booked}/{s.cap}</span></td>
                        <td><div className="ww-cap-bar"><i style={{ width: `${s.cap ? (s.booked / s.cap) * 100 : 0}%` }} /></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="ww-panel">
              <div className="ww-panel-head">
                <h2>Recente boekingen</h2>
                <button className="ww-chip" onClick={() => setView("bookings")}>Alle boekingen</button>
              </div>
              <div className="ww-tablewrap">
                <table className="ww-table">
                  <thead>
                    <tr><th>Code</th><th>Naam</th><th>Workshop</th><th>Pers.</th><th>Totaal</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 4).map((b) => {
                      const [cls, label] = STATUS_LABEL[b.status] || ["", b.status];
                      return (
                        <tr key={b.code}>
                          <td><strong>{b.code}</strong></td>
                          <td>{b.name}</td>
                          <td>{b.ws} · {b.date}</td>
                          <td>{b.people}p</td>
                          <td>€ {b.total}</td>
                          <td><span className={`ww-badge ${cls}`}>{label}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {view === "workshops" && (
          <section className="ww-panel">
            <div className="ww-panel-head">
              <h2>Jouw workshops</h2>
              <Button variant="primary" size="sm" icon="plus" onClick={() => setView("wizard")}>Toevoegen</Button>
            </div>
            <div className="ww-panel-body">
              {workshops.length === 0 ? (
                <p className="ww-meta" style={{ padding: 24 }}>Nog geen workshops. Klik op "Toevoegen" om je eerste workshop aan te maken.</p>
              ) : (
                workshops.map((w) => (
                  <article className="ww-dws" key={w.id || w.title}>
                    <Photo icon={w.icon} style={{ width: 80, height: 64, borderRadius: 12, flex: "none" }} />
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <h3>{w.title}</h3><Badge kind={w.status} />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 6, flexWrap: "wrap" }}>
                        {w.rating != null ? <Rating value={w.rating} count={w.count} /> : <span className="ww-meta">Nog geen reviews</span>}
                        <span className="ww-meta">{w.sessions} sessies</span>
                        <span className="ww-meta">€ {w.price} p.p.</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="ww-iconbtn" aria-label="Bewerken" onClick={() => { window.location.href = `/dashboard/workshops/${w.id}/bewerken`; }}>
                        <Icon name="edit" size={17} />
                      </button>
                      <button className="ww-iconbtn" aria-label="Bekijken"><Icon name="eye" size={17} /></button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        )}

        {view === "agenda" && (
          <section className="ww-panel">
            <div className="ww-panel-head">
              <h2>Agenda</h2>
              <Button variant="primary" size="sm" icon="plus">Datum toevoegen</Button>
            </div>
            <div className="ww-tablewrap">
              {sessions.length === 0 ? (
                <p className="ww-meta" style={{ padding: 24 }}>Nog geen sessies. Voeg datums toe aan je workshops zodat mensen kunnen boeken.</p>
              ) : (
                <table className="ww-table">
                  <thead>
                    <tr><th>Datum</th><th>Workshop</th><th>Bezetting</th><th style={{width:100}}></th></tr>
                  </thead>
                  <tbody>
                    {sessions.map((s, i) => (
                      <tr key={i}>
                        <td><strong>{s.date}</strong><span className="ww-meta" style={{display:"block",fontSize:12.5}}>{s.time}</span></td>
                        <td>{s.ws}</td>
                        <td><span className="ww-cap"><Icon name="users" size={15} /> {s.booked}/{s.cap}</span></td>
                        <td><div className="ww-cap-bar"><i style={{ width: `${s.cap ? (s.booked / s.cap) * 100 : 0}%` }} /></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        )}

        {view === "bookings" && (
          <section className="ww-panel">
            <div className="ww-panel-head"><h2>Boekingen</h2></div>
            <div className="ww-tablewrap">
              {bookings.length === 0 ? (
                <p className="ww-meta" style={{ padding: 24 }}>Nog geen boekingen. Zodra iemand een workshop boekt, verschijnt dit hier.</p>
              ) : (
                <table className="ww-table">
                  <thead>
                    <tr><th>Code</th><th>Naam</th><th>Workshop</th><th>Pers.</th><th>Totaal</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => {
                      const [cls, label] = STATUS_LABEL[b.status] || ["", b.status];
                      return (
                        <tr key={b.code || b.id}>
                          <td><strong>{b.code}</strong></td>
                          <td>{b.name}</td>
                          <td>{b.ws} · {b.date}</td>
                          <td>{b.people}p</td>
                          <td>€ {b.total}</td>
                          <td><span className={`ww-badge ${cls}`}>{label}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        )}

        {view === "reviews" && (
          <section className="ww-panel">
            <div className="ww-panel-head"><h2>Reviews</h2></div>
            <div className="ww-panel-body">
              {reviews.length === 0 ? (
                <p className="ww-meta">Nog geen reviews. Zodra deelnemers een workshop hebben gevolgd, verschijnen hun beoordelingen hier.</p>
              ) : (
                <>
                  <p className="ww-meta">
                    Je hebt {reviews.length} review{reviews.length !== 1 ? "s" : ""}.
                    {provider?.rating ? ` Gemiddeld ${String(provider.rating).replace(".", ",")} sterren.` : ""}
                  </p>
                  <div className="ww-dreviews">
                    {reviews.map((r, i) => (
                      <article className="ww-dreview" key={i}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar name={r.name || "Deelnemer"} size={36} />
                          <div><strong>{r.name || "Deelnemer"}</strong><span className="ww-meta"> · {r.when || ""}{r.ws ? ` · ${r.ws}` : ""}</span></div>
                        </div>
                        <p style={{ marginTop: 10 }}>{r.body || ""}</p>
                        <Button variant="outline" size="sm" style={{ marginTop: 10 }}>Reageren</Button>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {view === "locaties" && (
          <section className="ww-panel">
            <div className="ww-panel-head">
              <h2>Locaties</h2>
              <Button variant="primary" size="sm" icon="plus" onClick={() => setView("venue-form")}>Locatie toevoegen</Button>
            </div>
            <div className="ww-panel-body">
              {venues.length === 0 ? (
                <p className="ww-meta">Nog geen locaties. Voeg er een toe om je ruimte te verhuren.</p>
              ) : (
                venues.map((v) => (
                  <article className="ww-dws" key={v.id || v.name}>
                    <Photo icon="place" style={{ width: 80, height: 64, borderRadius: 12, flex: "none" }} />
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <h3>{v.name}</h3><Badge kind={v.status === "published" ? "live" : "draft"} />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 6, flexWrap: "wrap" }}>
                        <span className="ww-meta">{v.city || "Onbekend"}</span>
                        <span className="ww-meta">{v.max_capacity} pers.</span>
                        <span className="ww-meta">€ {v.price_per_hour} / uur</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="ww-iconbtn" aria-label="Bewerken"><Icon name="edit" size={17} /></button>
                      <button className="ww-iconbtn" aria-label="Bekijken"><Icon name="eye" size={17} /></button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        )}

        {view === "payouts" && (
          <section className="ww-panel">
            <div className="ww-panel-head"><h2>Uitbetalingen</h2></div>
            <div className="ww-panel-body">
              <div className="ww-kpis">
                <Stat label="Deze maand" value={kpis ? `€ ${kpis.monthTotal.toLocaleString("nl-NL")}` : "€ 0"} sub={kpis ? `${kpis.monthBookings} boekingen` : ""} accent />
                <Stat label="Totaal dit jaar" value="—" sub="nog niet beschikbaar" />
                <Stat label="Volgende uitbetaling" value="—" sub="automatisch elke maand" />
              </div>
              <p className="ww-meta" style={{ marginTop: 16 }}>
                Uitbetalingen worden automatisch verwerkt aan het einde van elke maand.
                Zorg dat je IBAN en tenaamstelling ingevuld zijn in je profiel.
              </p>
            </div>
          </section>
        )}

        {view === "profile" && (
          <ProviderProfileForm go={go} mode="edit" provider={provider} user={user} cities={cities} />
        )}

        {view === "venue-form" && (
          <VenueForm go={go} cities={cities} />
        )}
      </main>
    </div>
  );
}
