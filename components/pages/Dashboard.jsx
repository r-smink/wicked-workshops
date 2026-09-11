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
  venues = DASH_VENUES,
  nav = DASH_NAV,
  titles = DASH_TITLES,
  provider = null,
  categories = null,
  cities = [],
  initialWorkshop = null,
}) {
  const go = useGo();
  const [view, setView] = useState(initialView);
  const [menuOpen, setMenuOpen] = useState(false);

  if (view === "wizard") {
    return <WorkshopWizard go={go} provider={provider} categories={categories} cities={cities} initialWorkshop={initialWorkshop} />;
  }
  if (view === "profile") {
    return <ProviderProfileForm go={go} mode="edit" />;
  }
  if (view === "venue-form") {
    return <VenueForm go={go} cities={cities} />;
  }

  const [title, sub] = titles[view] || ["Dashboard", ""];

  return (
    <div className="ww-dash">
      <aside className={`ww-dash-side${menuOpen ? " ww-dash-side--open" : ""}`}>
        <div className="ww-dash-brand">
          <a className="ww-logo" onClick={() => go({ name: "home" })}>
            <Avatar name="Marco Rossi" size={36} />
          </a>
          <div style={{ minWidth: 0 }}>
            <strong style={{ fontSize: 14, display: "block" }}>Marco Rossi</strong>
            <span className="ww-meta" style={{ fontSize: 12.5 }}>Kookstudio De Pan</span>
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
              <Stat label="Deze maand" value="€ 1.245" sub="8 boekingen" accent />
              <Stat label="Deelnemers" value="34" sub="6 komende sessies" />
              <Stat label="Beoordeling" value="4,9" sub="412 reviews" />
              <Stat label="Wachtrij" value="2" sub="wacht op antwoord" />
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
              {workshops.map((w) => (
                <article className="ww-dws" key={w.title}>
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
              ))}
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
            </div>
          </section>
        )}

        {view === "bookings" && (
          <section className="ww-panel">
            <div className="ww-panel-head"><h2>Boekingen</h2></div>
            <div className="ww-tablewrap">
              <table className="ww-table">
                <thead>
                  <tr><th>Code</th><th>Naam</th><th>Workshop</th><th>Pers.</th><th>Totaal</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {bookings.map((b) => {
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
        )}

        {view === "reviews" && (
          <section className="ww-panel">
            <div className="ww-panel-head"><h2>Reviews</h2></div>
            <div className="ww-panel-body">
              <p className="ww-meta">Je hebt 412 reviews over 3 workshops. Gemiddeld 4,9 sterren.</p>
              <div className="ww-dreviews">
                {[
                  ["Sanne", "juli 2026", "Italiaans koken", "Marco maakt er echt een feestje van."],
                  ["Thomas", "juni 2026", "Pasta masterclass", "Dacht dat ik pasta kon maken. Bleek van niet."],
                  ["Iris", "mei 2026", "Tiramisu & dolci", "Gezellige avond met vriendinnen."],
                ].map(([n, w, ws, body]) => (
                  <article className="ww-dreview" key={n}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={n} size={36} />
                      <div><strong>{n}</strong><span className="ww-meta"> · {w} · {ws}</span></div>
                      <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
                        <Star size={14} />5,0
                      </span>
                    </div>
                    <p style={{ marginTop: 10 }}>{body}</p>
                    <Button variant="outline" size="sm" style={{ marginTop: 10 }}>Reageren</Button>
                  </article>
                ))}
              </div>
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
                <Stat label="Deze maand" value="€ 1.245" sub="wordt 18 aug uitbetaald" accent />
                <Stat label="Vorige maand" value="€ 980" sub="uitbetaald 21 jul" />
                <Stat label="Tot nu toe" value="€ 12.480" sub="sinds januari 2026" />
              </div>
              <div className="ww-tablewrap">
                <table className="ww-table">
                  <tbody>
                    {[
                      ["21 jul 2026", "€ 980", "juni 2026", "uitbetaald"],
                      ["21 jun 2026", "€ 1.120", "mei 2026", "uitbetaald"],
                      ["21 mei 2026", "€ 845", "april 2026", "uitbetaald"],
                    ].map(([d, a, p, s]) => (
                      <tr key={d}>
                        <td><strong>{d}</strong></td>
                        <td>{p}</td>
                        <td>{a}</td>
                        <td><span className="ww-badge ww-badge--draft">{s}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
