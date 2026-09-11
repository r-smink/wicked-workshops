"use client";

import { useState } from "react";
import Link from "next/link";
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
  provider = null,
  cities = [],
  initialWorkshop = null,
}) {
  const goNav = useGo();
  const nav = go || goNav;
  const [step, setStep] = useState(0);
  const [w, setW] = useState(() => {
    if (!initialWorkshop) return emptyWorkshop;
    const mins = initialWorkshop.duration_minutes;
    const durationStr = mins
      ? (() => {
          const hours = mins / 60;
          const str = Number.isInteger(hours) ? String(hours) : hours.toFixed(1).replace(".", ",");
          return `${str} uur`;
        })()
      : initialWorkshop.duration || "";
    return {
      ...emptyWorkshop,
      title: initialWorkshop.title || "",
      category: typeof initialWorkshop.category === "object" ? initialWorkshop.category?.id || "" : initialWorkshop.category || "",
      city: typeof initialWorkshop.city === "object" ? initialWorkshop.city?.id || "" : initialWorkshop.city || "",
      occasions: Array.isArray(initialWorkshop.occasions) ? initialWorkshop.occasions : [],
      intro: initialWorkshop.intro || "",
      description: initialWorkshop.description || "",
      inclusions: Array.isArray(initialWorkshop.inclusions) && initialWorkshop.inclusions.length ? initialWorkshop.inclusions : [""],
      inclusion_types: Array.isArray(initialWorkshop.inclusion_types) ? initialWorkshop.inclusion_types : [],
      faq: Array.isArray(initialWorkshop.faq) && initialWorkshop.faq.length
        ? initialWorkshop.faq.map((f) => Array.isArray(f) ? { q: f[0], a: f[1] } : { q: f.q || "", a: f.a || "" })
        : [{ q: "", a: "" }],
      duration: durationStr,
      level: initialWorkshop.level || "beginner",
      languages: Array.isArray(initialWorkshop.languages) ? initialWorkshop.languages : ["Nederlands"],
      min_participants: initialWorkshop.min_participants ? String(initialWorkshop.min_participants) : "4",
      max_participants: initialWorkshop.max_participants ? String(initialWorkshop.max_participants) : "12",
      format: initialWorkshop.format || "on_location",
      diet: Array.isArray(initialWorkshop.diet) ? initialWorkshop.diet : [],
      age_rating: initialWorkshop.age_rating || "Alle leeftijden",
      wheelchair: initialWorkshop.wheelchair ?? false,
      parking: initialWorkshop.parking ?? false,
      transit: initialWorkshop.transit ?? false,
      media: Array.isArray(initialWorkshop.media) && initialWorkshop.media.length ? initialWorkshop.media : [null, null, null, null, null, null],
      price: initialWorkshop.price_per_person ? String(initialWorkshop.price_per_person) : initialWorkshop.price ? String(initialWorkshop.price) : "",
      cancellation: initialWorkshop.cancellation_policy || "flexible_48h",
      instant: initialWorkshop.instant_bookable ?? true,
      giftcard: initialWorkshop.giftcard_eligible ?? true,
      group_quote: initialWorkshop.group_quote_from != null ? true : true,
      group_from: initialWorkshop.group_quote_from ? String(initialWorkshop.group_quote_from) : "10",
      sessions: Array.isArray(initialWorkshop.sessions) && initialWorkshop.sessions.length
        ? initialWorkshop.sessions.map((s) => ({
            date: s.starts_at ? s.starts_at.slice(0, 10) : s.date || "",
            time: s.starts_at ? s.starts_at.slice(11, 16) : s.time || "14:00",
            capacity: s.capacity ? String(s.capacity) : s.capacity || "12",
          }))
        : [{ date: "", time: "14:00", capacity: "12" }],
    };
  });
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const set = (k) => (e) => setW({ ...w, [k]: e.target.value });
  const put = (k, v) => setW({ ...w, [k]: v });

  const toggleArr = (k, v) => put(k, w[k].includes(v) ? w[k].filter((x) => x !== v) : [...w[k], v]);

  const filled = required.filter(([k]) => String(w[k]).trim() !== "");
  const pct = Math.round((filled.length / required.length) * 100);

  /* Converteer wizard-state naar Directus-veldnamen en POST naar de API */
  async function publishWorkshop() {
    setSaving(true);
    setSaveError("");
    try {
      const slug = w.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      const durationMinutes = w.duration
        ? (() => {
            const hours = parseFloat(w.duration.replace(",", "."));
            return isNaN(hours) ? null : Math.round(hours * 60);
          })()
        : null;

      const workshop = {
        slug,
        title: w.title,
        intro: w.intro || null,
        description: w.description || null,
        duration_minutes: durationMinutes,
        level: w.level || null,
        min_participants: w.min_participants ? Number(w.min_participants) : null,
        max_participants: w.max_participants ? Number(w.max_participants) : null,
        format: w.format || null,
        price_per_person: w.price ? String(w.price) : null,
        group_quote_from: w.group_quote ? Number(w.group_from) : null,
        cancellation_policy: w.cancellation || null,
        instant_bookable: w.instant ?? false,
        giftcard_eligible: w.giftcard ?? false,
        location_inherits_provider: true,
        age_rating: w.age_rating || null,
        category: w.category || null,
        city: w.city || null,
        provider: provider?.id || null,
      };

      const isEdit = Boolean(initialWorkshop?.id);
      const url = isEdit ? `/api/workshops?id=${initialWorkshop.id}` : "/api/workshops";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshop,
          inclusions: w.inclusions,
          faq: w.faq,
          sessions: w.sessions,
          media: w.media.filter((m) => m?.fileId),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      setDone(true);
    } catch (err) {
      setSaveError(err.message || "Opslaan mislukt");
    } finally {
      setSaving(false);
    }
  }

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
                <Link href="/dashboard" className="ww-btn ww-btn--primary ww-btn--lg" style={{ textDecoration: "none" }}>
                  Naar mijn workshops
                </Link>
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
                      {categories.map((c) => <option key={c.id || c} value={c.id || c}>{c.name || c}</option>)}
                    </select>
                  </Field>
                  <Field label="Stad">
                    <select className="ww-select" value={w.city} onChange={set("city")}>
                      <option value="">Kies een stad</option>
                      {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                        <div className="ww-mediaslot" key={i} data-filled={m?.fileId ? "true" : "false"}>
                          {m?.fileId ? (
                            <>
                              <img src={`/api/proxy/${m.fileId}`} alt={m.alt || ""} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 14 }} />
                              <button className="ww-listrow-del" style={{ position: "absolute", top: 6, right: 6, width: 32, height: 32 }}
                                onClick={() => put("media", w.media.map((x, j) => j === i ? null : x))}>
                                <Icon name="close" size={16} />
                              </button>
                            </>
                          ) : (
                            <label className="ww-mediaslot-label" style={{ width: "100%", height: "100%", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                              <Icon name="plus" size={22} />
                              <span>Toevoegen</span>
                              <input type="file" accept="image/*" style={{ display: "none" }}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const fd = new FormData();
                                  fd.append("file", file);
                                  try {
                                    const res = await fetch("/api/upload", { method: "POST", body: fd });
                                    if (!res.ok) throw new Error("Upload mislukt");
                                    const data = await res.json();
                                    put("media", w.media.map((x, j) => j === i ? { fileId: data.id, alt: file.name } : x));
                                  } catch (err) {
                                    setSaveError(err.message);
                                  }
                                }} />
                            </label>
                          )}
                        </div>
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
                  <Button variant="primary" block disabled={saving}
                    onClick={() => (step < steps.length - 1 ? setStep(step + 1) : publishWorkshop())}>
                    {saving ? "Opslaan..." : step < steps.length - 1 ? "Verder" : "Workshop publiceren"}
                  </Button>
                </div>
                {saveError && <p style={{ color: tokens.color.coral, fontSize: 13, marginTop: 8 }}>{saveError}</p>}
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
