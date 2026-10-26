"use client";

import { useState } from "react";
import Link from "next/link";
import { tokens } from "@/lib/tokens";
import { useGo } from "@/lib/use-go";
import { WIZ_VENUE_STEPS, EMPTY_VENUE, VENUE_AMENITIES } from "@/lib/mock-data";
import { Icon, Button, Chip, Field } from "@/components/ui";

export default function VenueForm({
  go,
  steps = WIZ_VENUE_STEPS,
  emptyVenue = EMPTY_VENUE,
  amenities = VENUE_AMENITIES,
  cities = [],
}) {
  const goNav = useGo();
  const nav = go || goNav;
  const [step, setStep] = useState(0);
  const [v, setV] = useState(emptyVenue);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  const put = (k, val) => setV({ ...v, [k]: val });

  const toggleAmenity = (a) =>
    put("amenities", v.amenities.includes(a) ? v.amenities.filter((x) => x !== a) : [...v.amenities, a]);

  async function submitVenue() {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
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
        <span style={{ color: tokens.color.ink }}>Locatie toevoegen</span>
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
              <h1 style={{ fontSize: 26, marginBottom: 10 }}>Je locatie staat klaar</h1>
              <p className="ww-meta" style={{ marginBottom: 24, maxWidth: 460 }}>
                We kijken je locatie na en zetten hem binnen een werkdag online. Wil je nog wat
                aanpassen? Dat kan altijd.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link href="/dashboard" className="ww-btn ww-btn--primary ww-btn--lg" style={{ textDecoration: "none" }}>
                  Naar mijn locaties
                </Link>
                <Button variant="outline" size="lg" onClick={() => { setDone(false); setStep(0); setV(emptyVenue); }}>
                  Nog een locatie
                </Button>
              </div>
            </div>
          ) : (
            <>
              {step === 0 && (
                <>
                  <Field label="Naam" hint="Hoe heet je ruimte?">
                    <input className="ww-input" value={v.name} onChange={set("name")} placeholder="Kookstudio De Pan" />
                  </Field>
                  <Field label="Stad">
                    <select className="ww-select" value={v.city} onChange={set("city")}>
                      <option value="">Kies een stad</option>
                      {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Wijk of buurt">
                    <input className="ww-input" value={v.neighbourhood} onChange={set("neighbourhood")} placeholder="Wittevrouwen" />
                  </Field>
                  <Field label="Beschrijving" hint="Vertel wat de ruimte bijzonder maakt.">
                    <textarea className="ww-textarea" rows={5} value={v.description} onChange={set("description")}
                      placeholder="Een lichte kookstudio voor maximaal 12 personen, met professionele keuken..." />
                  </Field>
                </>
              )}

              {step === 1 && (
                <>
                  <Field label="Maximale capaciteit" hint="Aantal personen.">
                    <input className="ww-input" value={v.max_capacity} onChange={set("max_capacity")} inputMode="numeric" placeholder="12" />
                  </Field>
                  <Field label="Oppervlak (m²)">
                    <input className="ww-input" value={v.surface_m2} onChange={set("surface_m2")} inputMode="numeric" placeholder="60" />
                  </Field>
                  <Field label="Prijs per uur" hint="In euro, inclusief btw.">
                    <input className="ww-input" value={v.price_per_hour} onChange={set("price_per_hour")} inputMode="numeric" placeholder="45" />
                  </Field>
                </>
              )}

              {step === 2 && (
                <Field label="Voorzieningen" hint="Vink aan wat aanwezig is.">
                  <div className="ww-tagpick">
                    {amenities.map((a) => (
                      <Chip key={a} on={v.amenities.includes(a)} onClick={() => toggleAmenity(a)}>{a}</Chip>
                    ))}
                  </div>
                </Field>
              )}

              {step === 3 && (
                <>
                  <Field label="Contactnaam">
                    <input className="ww-input" value={v.contact_name} onChange={set("contact_name")} placeholder="Marco Rossi" />
                  </Field>
                  <Field label="E-mailadres">
                    <input className="ww-input" type="email" value={v.contact_email} onChange={set("contact_email")} placeholder="marco@kookstudio.nl" />
                  </Field>
                  <Field label="Telefoonnummer">
                    <input className="ww-input" value={v.contact_phone} onChange={set("contact_phone")} placeholder="06 12 34 56 78" />
                  </Field>
                </>
              )}

              <div className="ww-savebar">
                <div className="ww-savebar-in">
                  {step > 0 && <Button variant="outline" icon="left" onClick={() => setStep(step - 1)}>Terug</Button>}
                  <Button variant="primary" block disabled={saving}
                    onClick={() => (step < steps.length - 1 ? setStep(step + 1) : submitVenue())}>
                    {saving ? "Opslaan..." : step < steps.length - 1 ? "Verder" : "Locatie opslaan"}
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
              <strong style={{ fontSize: 13.5 }}>Voortgang</strong>
              <b>{Math.round(((step + 1) / steps.length) * 100)}%</b>
            </div>
            <div className="ww-prog-bar"><i style={{ width: `${Math.round(((step + 1) / steps.length) * 100)}%` }} /></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
