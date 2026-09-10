"use client";

import { useState } from "react";
import { tokens } from "@/lib/tokens";
import { useGo } from "@/lib/use-go";
import {
  WIZ_STEPS, WIZ_CATEGORIES, WIZ_OCCASIONS, WIZ_DIET, WIZ_INCLUSION_TYPES,
  EMPTY_WORKSHOP, WIZ_REQUIRED,
} from "@/lib/mock-data";
import { Icon, Button, Chip, Photo, Field, Switch } from "@/components/ui";

export default function WorkshopWizard({
  go,
  steps = WIZ_STEPS,
  categories = WIZ_CATEGORIES,
  occasions = WIZ_OCCASIONS,
  diet = WIZ_DIET,
  inclusionTypes = WIZ_INCLUSION_TYPES,
  emptyWorkshop = EMPTY_WORKSHOP,
  required = WIZ_REQUIRED,
}) {
  const goNav = useGo();
  const nav = go || goNav;
  const [step, setStep] = useState(0);
  const [w, setW] = useState(emptyWorkshop);
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setW({ ...w, [k]: e.target.value });
  const put = (k, v) => setW({ ...w, [k]: v });

  const toggleArr = (k, v) => put(k, w[k].includes(v) ? w[k].filter((x) => x !== v) : [...w[k], v]);

  const filled = required.filter(([k]) => String(w[k]).trim() !== "");
  const pct = Math.round((filled.length / required.length) * 100);

  const [h, d] = steps[step];

  return (
    <div className="ww-wrap">
      <nav className="ww-crumbs" aria-label="Kruimelpad">
        <a onClick={() => nav({ name: "dashboard" })}>Dashboard</a><span>/</span>
        <span style={{ color: tokens.color.ink }}>Nieuwe workshop</span>
      </nav>

      <header className="ww-form-head">
        <span className="ww-eyebrow">Stap {step + 1} van {steps.length}</span>
        <h1>{h}</h1>
        <p>{d}</p>
      </header>

      <div className="ww-wizgrid">
        <div>
          <div className="ww-wizrail">
            {steps.map(([t], i) => (
              <button key={t} className="ww-wizrail-item"
                data-on={i === step ? "true" : "false"}
                data-done={i < step ? "true" : "false"}
                onClick={() => setStep(i)}>
                <span className="ww-rail-n">{i < step ? <Icon name="check" size={14} /> : i + 1}</span>
                <span>{t}</span>
              </button>
            ))}
          </div>

          {done ? (
            <div className="ww-done">
              <span className="ww-done-ico"><Icon name="check" size={34} /></span>
              <h1 style={{ fontSize: 26, marginBottom: 10 }}>Je workshop staat klaar</h1>
              <p className="ww-meta" style={{ marginBottom: 24, maxWidth: 460 }}>
                We kijken je workshop na en zetten hem binnen een werkdag online. Ondertijd kun je
                datums toevoegen in je agenda. Wil je nog wat aanpassen? Dat kan altijd.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Button variant="primary" size="lg" onClick={() => nav({ name: "dashboard" })}>Naar mijn workshops</Button>
                <Button variant="outline" size="lg" onClick={() => { setDone(false); setStep(0); }}>Nog een workshop</Button>
              </div>
            </div>
          ) : (
            <>
              {step === 0 && (
                <>
                  <Field label="Titel" hint="Zeg wat mensen gaan doen, niet wat het is.">
                    <input className="ww-input" value={w.title} onChange={set("title")} placeholder="Italiaans koken met Marco" />
                  </Field>
                  <Field label="Categorie">
                    <select className="ww-select" value={w.category} onChange={set("category")}>
                      <option value="">Kies een categorie</option>
                      {categories.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Geschikt voor" hint="Meerdere kiezen is goed.">
                    <div className="ww-tagpick">
                      {occasions.map((o) => (
                        <Chip key={o} on={w.occasions.includes(o)} onClick={() => toggleArr("occasions", o)}>{o}</Chip>
                      ))}
                    </div>
                  </Field>
                  <Field label="Korte omschrijving" hint="Een zin. Staat op kaartjes en in Google.">
                    <input className="ww-input" value={w.intro} onChange={set("intro")}
                      placeholder="Leer in drie uur de basis van de Italiaanse keuken." maxLength={140} />
                  </Field>
                </>
              )}

              {step === 1 && (
                <>
                  <Field label="Beschrijving" hint="Twee of drie alineas. Wat ga je doen, en wat neem je mee naar huis?">
                    <textarea className="ww-textarea" rows={5} value={w.description} onChange={set("description")}
                      placeholder="Je maakt verse pasta vanaf nul, een klassieke ragu en tiramisu..." />
                  </Field>
                  <Field label="Wat is inbegrepen" hint="Per regel een item.">
                    <div>
                      {w.inclusions.map((inc, i) => (
                        <div className="ww-listrow" key={i}>
                          <input className="ww-input" value={inc}
                            onChange={(e) => put("inclusions", w.inclusions.map((x, j) => j === i ? e.target.value : x))}
                            placeholder="Alle ingredienten en materialen" />
                          <button className="ww-listrow-del" aria-label="Verwijderen"
                            onClick={() => put("inclusions", w.inclusions.filter((_, j) => j !== i))}>
                            <Icon name="close" size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button className="ww-btn ww-btn--ghost" style={{ padding: 0, height: 34 }}
                      onClick={() => put("inclusions", [...w.inclusions, ""])}>+ Toevoegen</button>
                  </Field>
                  <Field label="Type inbegrepen" hint="Helpt bij het filteren.">
                    <div className="ww-tagpick">
                      {inclusionTypes.map((t) => (
                        <Chip key={t} on={w.inclusion_types.includes(t)} onClick={() => toggleArr("inclusion_types", t)}>{t}</Chip>
                      ))}
                    </div>
                  </Field>
                  <Field label="Veelgestelde vragen" hint="Per vraag een paar zinnen. Optioneel.">
                    <div>
                      {w.faq.map((item, i) => (
                        <div className="ww-listrow" key={i} style={{ alignItems: "flex-start" }}>
                          <input className="ww-input" value={item.q}
                            onChange={(e) => put("faq", w.faq.map((x, j) => j === i ? { ...x, q: e.target.value } : x))}
                            placeholder="Wat als ik moet annuleren?" />
                          <textarea className="ww-textarea" rows={2} value={item.a}
                            onChange={(e) => put("faq", w.faq.map((x, j) => j === i ? { ...x, a: e.target.value } : x))}
                            placeholder="Je kunt tot 48 uur van tevoren gratis annuleren." />
                          <button className="ww-listrow-del" aria-label="Verwijderen"
                            onClick={() => put("faq", w.faq.filter((_, j) => j !== i))}>
                            <Icon name="close" size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button className="ww-btn ww-btn--ghost" style={{ padding: 0, height: 34 }}
                      onClick={() => put("faq", [...w.faq, { q: "", a: "" }])}>+ Vraag toevoegen</button>
                  </Field>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="ww-row ww-row--2">
                    <Field label="Duur" hint="Bijv. 3 uur of hele dag.">
                      <input className="ww-input" value={w.duration} onChange={set("duration")} placeholder="3 uur" />
                    </Field>
                    <Field label="Niveau">
                      <select className="ww-select" value={w.level} onChange={set("level")}>
                        {["beginner", "gevorderd", "alle niveaus"].map((l) => <option key={l}>{l}</option>)}
                      </select>
                    </Field>
                  </div>
                  <div className="ww-row ww-row--2">
                    <Field label="Minimaal aantal deelnemers">
                      <input className="ww-input" value={w.min_participants} onChange={set("min_participants")} inputMode="numeric" />
                    </Field>
                    <Field label="Maximaal aantal deelnemers">
                      <input className="ww-input" value={w.max_participants} onChange={set("max_participants")} inputMode="numeric" />
                    </Field>
                  </div>
                  <Field label="Waar geef je de workshop?">
                    <div className="ww-tagpick">
                      {[["on_location", "Op mijn locatie"], ["at_home", "Bij de deelnemer thuis"],
                        ["at_office", "Op kantoor"], ["online", "Online"]].map(([v, l]) => (
                        <Chip key={v} on={w.format === v} onClick={() => put("format", v)}>{l}</Chip>
                      ))}
                    </div>
                  </Field>
                  <Field label="Taal">
                    <div className="ww-tagpick">
                      {["Nederlands", "Engels", "Duits"].map((l) => (
                        <Chip key={l} on={w.languages.includes(l)} onClick={() => toggleArr("languages", l)}>{l}</Chip>
                      ))}
                    </div>
                  </Field>
                  <Field label="Dieetwensen mogelijk" hint="Geef aan wat je kunt aanbieden.">
                    <div className="ww-tagpick">
                      {diet.map((d) => (
                        <Chip key={d} on={w.diet.includes(d)} onClick={() => toggleArr("diet", d)}>{d}</Chip>
                      ))}
                    </div>
                  </Field>
                  <Field label="Geschikt voor leeftijd">
                    <select className="ww-select" value={w.age_rating} onChange={set("age_rating")}>
                      {["Alle leeftijden", "Kindvriendelijk", "16+", "18+"].map((a) => <option key={a}>{a}</option>)}
                    </select>
                  </Field>
                  <p className="ww-hint" style={{ fontWeight: 700, color: tokens.color.ink, margin: "16px 0 8px" }}>Voorzieningen</p>
                  <Switch on={w.wheelchair} onChange={(v) => put("wheelchair", v)} title="Rolstoeltoegankelijk" />
                  <Switch on={w.parking} onChange={(v) => put("parking", v)} title="Gratis parkeren" />
                  <Switch on={w.transit} onChange={(v) => put("transit", v)} title="Goed bereikbaar met OV" />
                </>
              )}

              {step === 3 && (
                <>
                  <Field label="Foto's" hint="Minimaal een, maximaal zes. Eerste foto wordt de omslag.">
                    <div className="ww-mediagrid">
                      {w.media.map((m, i) => (
                        <button className="ww-mediaslot" key={i} data-filled={m ? "true" : "false"}
                          onClick={() => put("media", w.media.map((x, j) => j === i ? !x : x))}>
                          {m ? <Photo icon="camera" /> : <span><Icon name="plus" size={22} /> Toevoegen</span>}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <p className="ww-hint">
                    Een sfeerfoto met mensen erin werkt beter dan een lege ruimte. Liggend formaat,
                    minimaal 1200 bij 800 pixels.
                  </p>
                </>
              )}

              {step === 4 && (
                <>
                  <Field label="Prijs per persoon" hint="In euro, inclusief btw.">
                    <input className="ww-input" value={w.price} onChange={set("price")} inputMode="numeric" placeholder="45" />
                  </Field>
                  <Field label="Annuleren">
                    <div className="ww-tagpick">
                      {[["flexible_48h", "Tot 48 uur vooraf (flexibel)"],
                        ["moderate_7d", "Tot 7 dagen vooraf"],
                        ["strict_none", "Geen annulering mogelijk"]].map(([v, l]) => (
                        <Chip key={v} on={w.cancellation === v} onClick={() => put("cancellation", v)}>{l}</Chip>
                      ))}
                    </div>
                  </Field>
                  <Switch on={w.instant} onChange={(v) => put("instant", v)}
                    title="Direct boekbaar" note="Anders moet je elke boeking handmatig goedkeuren." />
                  <Switch on={w.giftcard} onChange={(v) => put("giftcard", v)}
                    title="Als cadeaubon te geven" note="De ontvanger kiest zelf de datum." />
                  <Switch on={w.group_quote} onChange={(v) => put("group_quote", v)}
                    title="Groepsoffertes aannemen" note="Wij sturen je de aanvraag, jij maakt de offerte." />
                  {w.group_quote && (
                    <Field label="Vanaf dit aantal personen" hint="Daarboven geldt een groepsofferte.">
                      <input className="ww-input" value={w.group_from} onChange={set("group_from")} inputMode="numeric" placeholder="10" />
                    </Field>
                  )}
                </>
              )}

              {step === 5 && (
                <>
                  <Field label="Datums toevoegen" hint="Voeg de eerste datums toe. Je kunt er later altijd meer zetten.">
                    <div>
                      {w.sessions.map((s, i) => (
                        <div className="ww-sesrow" key={i}>
                          <input className="ww-input" type="date" value={s.date}
                            onChange={(e) => put("sessions", w.sessions.map((x, j) => j === i ? { ...x, date: e.target.value } : x))} />
                          <input className="ww-input" type="time" value={s.time}
                            onChange={(e) => put("sessions", w.sessions.map((x, j) => j === i ? { ...x, time: e.target.value } : x))} />
                          <input className="ww-input" value={s.capacity} inputMode="numeric"
                            onChange={(e) => put("sessions", w.sessions.map((x, j) => j === i ? { ...x, capacity: e.target.value } : x))}
                            placeholder="Capaciteit" />
                          <button className="ww-listrow-del" aria-label="Verwijderen"
                            onClick={() => put("sessions", w.sessions.filter((_, j) => j !== i))}>
                            <Icon name="close" size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button className="ww-btn ww-btn--ghost" style={{ padding: 0, height: 34 }}
                      onClick={() => put("sessions", [...w.sessions, { date: "", time: "14:00", capacity: "12" }])}>
                      + Datum toevoegen
                    </button>
                  </Field>
                </>
              )}

              <div className="ww-savebar">
                <div className="ww-savebar-in">
                  {step > 0 && <Button variant="outline" icon="left" onClick={() => setStep(step - 1)}>Terug</Button>}
                  <Button variant="primary" block
                    onClick={() => (step < steps.length - 1 ? setStep(step + 1) : setDone(true))}>
                    {step < steps.length - 1 ? "Verder" : "Workshop publiceren"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        <aside className="ww-side-sticky">
          <div className="ww-prog">
            <div className="ww-prog-top">
              <strong style={{ fontSize: 13.5 }}>Klaar om te publiceren</strong>
              <b>{pct}%</b>
            </div>
            <div className="ww-prog-bar"><i style={{ width: `${pct}%` }} /></div>
            <ul className="ww-checklist">
              {required.map(([k, label]) => (
                <li key={k} data-done={String(w[k]).trim() !== "" ? "true" : "false"}>
                  <span className="ww-tick"><Icon name="check" size={13} /></span>{label}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
