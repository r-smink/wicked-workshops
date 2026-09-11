"use client";

import { useState } from "react";
import { tokens } from "@/lib/tokens";
import { useGo } from "@/lib/use-go";
import {
  REQUIRED, EMPTY_PROFILE, PROFILE_LANGS, PROFILE_CITIES,
} from "@/lib/mock-data";
import { Icon, Button, Chip, Avatar, Field, Switch, Optional } from "@/components/ui";

function providerToForm(provider = null, user = null) {
  if (!provider && !user) return EMPTY_PROFILE;
  return {
    ...EMPTY_PROFILE,
    first_name: user?.first_name || provider?.first_name || "",
    last_name: user?.last_name || provider?.last_name || "",
    email: user?.email || provider?.email || "",
    phone: provider?.phone || "",
    birth_date: provider?.birth_date || "",
    street: provider?.street || "",
    house_number: provider?.house_number || "",
    addition: provider?.addition || "",
    postal_code: provider?.postal_code || "",
    residence: provider?.residence || "",
    country: provider?.country || "Nederland",
    company_name: provider?.company_name || "",
    kvk_number: provider?.kvk_number || "",
    vat_number: provider?.vat_number || "",
    vat_liable: provider?.vat_liable ?? true,
    kor: provider?.kor ?? false,
    display_name: provider?.display_name || [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "",
    profession: provider?.profession || "",
    bio_short: provider?.bio_short || "",
    bio_long: provider?.bio_long || "",
    languages: Array.isArray(provider?.languages) ? provider.languages : ["Nederlands"],
    active_since: provider?.active_since || "",
    website: provider?.website || "",
    instagram: provider?.instagram || "",
    city: typeof provider?.city === "string" ? provider.city : provider?.city?.name || "",
    neighbourhood: provider?.neighbourhood || "",
    location_name: provider?.location_name || "",
    location_same: provider?.location_same ?? true,
    location_street: provider?.location_street || "",
    location_postal: provider?.location_postal || "",
    wheelchair: provider?.wheelchair ?? false,
    parking: provider?.parking ?? false,
    transit: provider?.transit ?? false,
    accepts_groups: provider?.accepts_groups ?? true,
    max_group_size: String(provider?.max_group_size || "12"),
    iban: provider?.iban || "",
    account_holder: provider?.account_holder || "",
    terms: provider?.terms ?? false,
  };
}

export default function ProviderProfileForm({
  go,
  mode = "signup",
  required = REQUIRED,
  langs = PROFILE_LANGS,
  cities = PROFILE_CITIES,
  provider = null,
  user = null,
}) {
  const goNav = useGo();
  const nav = go || goNav;
  const initial = providerToForm(provider, user);
  const [f, setF] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setSaved(false); };
  const put = (k, v) => { setF({ ...f, [k]: v }); setSaved(false); };

  const filled = required.filter(([k]) => String(f[k]).trim() !== "");
  const pct = Math.round((filled.length / required.length) * 100);
  const complete = pct === 100 && f.terms;

  const toggleLang = (l) => put("languages",
    f.languages.includes(l) ? f.languages.filter((x) => x !== l) : [...f.languages, l]);

  async function saveProfile() {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/providers/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setSaved(true);
    } catch (err) {
      setSaveError(err.message || "Opslaan mislukt");
    } finally {
      setSaving(false);
    }
  }

  const sections = [
    "Persoonsgegevens", "Adres", "Bedrijfsgegevens", "Je profiel",
    "Waar je lesgeeft", "Groepen", "Uitbetaling",
  ];

  const body = (
    <>
      <div className="ww-form-two">
        <div>
          {/* 1. Persoonsgegevens */}
          <section className="ww-fsec">
            <div className="ww-fsec-head">
              <span className="ww-fsec-n">1</span>
              <div><h2>{sections[0]}</h2>
                <p>Voor de overeenkomst en het contact met ons. Dit staat niet op je openbare profiel.</p></div>
            </div>
            <div className="ww-row ww-row--2">
              <Field label="Voornaam"><input className="ww-input" value={f.first_name} onChange={set("first_name")} placeholder="Marco" autoComplete="given-name" /></Field>
              <Field label="Achternaam"><input className="ww-input" value={f.last_name} onChange={set("last_name")} placeholder="Rossi" autoComplete="family-name" /></Field>
            </div>
            <div className="ww-row ww-row--2">
              <Field label="E-mailadres"><input className="ww-input" type="email" value={f.email} onChange={set("email")} placeholder="marco@kookstudio.nl" autoComplete="email" /></Field>
              <Field label="Telefoonnummer" hint="Zo bereiken wij je bij een vraag over een boeking.">
                <input className="ww-input" value={f.phone} onChange={set("phone")} placeholder="06 12 34 56 78" autoComplete="tel" />
              </Field>
            </div>
            <Field label={<>Geboortedatum <Optional /></>} hint="Alleen voor verificatie, nooit zichtbaar op je profiel.">
              <input className="ww-input" type="date" value={f.birth_date} onChange={set("birth_date")} />
            </Field>
          </section>

          {/* 2. Adres */}
          <section className="ww-fsec">
            <div className="ww-fsec-head">
              <span className="ww-fsec-n">2</span>
              <div><h2>{sections[1]}</h2>
                <p>Je factuuradres. Deelnemers zien dit niet, tenzij je hieronder aangeeft dat je hier lesgeeft.</p></div>
            </div>
            <div className="ww-row ww-row--2">
              <Field label="Straat"><input className="ww-input" value={f.street} onChange={set("street")} placeholder="Poortstraat" autoComplete="address-line1" /></Field>
              <div className="ww-row ww-row--2">
                <Field label="Huisnummer"><input className="ww-input" value={f.house_number} onChange={set("house_number")} placeholder="14" /></Field>
                <Field label={<>Toevoeging <Optional /></>}><input className="ww-input" value={f.addition} onChange={set("addition")} placeholder="bis" /></Field>
              </div>
            </div>
            <div className="ww-row ww-row--2">
              <Field label="Postcode"><input className="ww-input" value={f.postal_code} onChange={set("postal_code")} placeholder="3572 HH" autoComplete="postal-code" /></Field>
              <Field label="Woonplaats"><input className="ww-input" value={f.residence} onChange={set("residence")} placeholder="Utrecht" autoComplete="address-level2" /></Field>
            </div>
            <Field label="Land">
              <select className="ww-select" value={f.country} onChange={set("country")}>
                {["Nederland", "Belgie", "Duitsland"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </section>

          {/* 3. Bedrijfsgegevens */}
          <section className="ww-fsec">
            <div className="ww-fsec-head">
              <span className="ww-fsec-n">3</span>
              <div><h2>{sections[2]}</h2>
                <p>Heb je geen bedrijf? Laat dit leeg. Je kunt ook als particulier workshops geven.</p></div>
            </div>
            <Field label={<>Bedrijfsnaam <Optional /></>}>
              <input className="ww-input" value={f.company_name} onChange={set("company_name")} placeholder="Kookstudio De Pan" />
            </Field>
            <div className="ww-row ww-row--2">
              <Field label={<>KvK-nummer <Optional /></>} hint="Acht cijfers.">
                <input className="ww-input" value={f.kvk_number} onChange={set("kvk_number")} placeholder="62817394" inputMode="numeric" />
              </Field>
              <Field label={<>Btw-identificatienummer <Optional /></>}>
                <input className="ww-input" value={f.vat_number} onChange={set("vat_number")} placeholder="NL003456789B12" />
              </Field>
            </div>
            <Switch on={f.vat_liable} onChange={(v) => put("vat_liable", v)}
              title="Ik breng btw in rekening" note="Zet dit uit als je vrijgesteld bent." />
            <Switch on={f.kor} onChange={(v) => put("kor", v)}
              title="Ik doe mee aan de kleineondernemersregeling"
              note="Dan zetten we geen btw op de facturen die wij namens jou maken." />
            <p className="ww-hint" style={{ marginTop: 12 }}>
              Wij zijn geen belastingadviseur. Twijfel je wat voor jou geldt, vraag het na bij de
              Belastingdienst of je boekhouder voordat je je eerste workshop publiceert.
            </p>
          </section>

          {/* 4. Openbaar profiel */}
          <section className="ww-fsec">
            <div className="ww-fsec-head">
              <span className="ww-fsec-n">4</span>
              <div><h2>{sections[3]}</h2>
                <p>Dit ziet iedereen op je profielpagina. Schrijf zoals je praat.</p></div>
            </div>
            <div className="ww-upload" style={{ marginBottom: 18 }}>
              <Avatar name={f.display_name || "Nieuw profiel"} size={64} />
              <div style={{ flex: 1, minWidth: 180 }}>
                <strong style={{ fontSize: 14.5, display: "block" }}>Profielfoto</strong>
                <span className="ww-meta">Een gezicht werkt beter dan een logo. Minimaal 400 bij 400 pixels.</span>
              </div>
              <Button variant="outline" size="sm">Foto kiezen</Button>
            </div>
            <div className="ww-row ww-row--2">
              <Field label="Naam op je profiel" hint="Meestal je eigen naam.">
                <input className="ww-input" value={f.display_name} onChange={set("display_name")} placeholder="Marco Rossi" />
              </Field>
              <Field label="Vakgebied" hint="Een paar woorden, bijvoorbeeld: Italiaanse kok.">
                <input className="ww-input" value={f.profession} onChange={set("profession")} placeholder="Italiaanse kok" />
              </Field>
            </div>
            <Field label="Korte introductie" hint="Een zin. Deze staat op kaartjes en in Google.">
              <input className="ww-input" value={f.bio_short} onChange={set("bio_short")}
                placeholder="Italiaanse kookworkshops in een echte kookstudio." maxLength={140} />
            </Field>
            <Field label="Over jou" hint="Twee of drie alineas. Waarom doe je dit, en wat maakt jouw workshop anders?">
              <textarea className="ww-textarea" value={f.bio_long} onChange={set("bio_long")} rows={5}
                placeholder="Opgegroeid in de keuken van mijn nonna in Bologna..." />
            </Field>
            <Field label="Talen waarin je lesgeeft">
              <div className="ww-tagpick">
                {langs.map((l) => (
                  <Chip key={l} on={f.languages.includes(l)} onClick={() => toggleLang(l)}>{l}</Chip>
                ))}
              </div>
            </Field>
            <div className="ww-row ww-row--2" style={{ marginTop: 16 }}>
              <Field label={<>Actief sinds <Optional /></>} hint="Voedt: geeft workshops sinds ...">
                <input className="ww-input" value={f.active_since} onChange={set("active_since")} placeholder="2019" inputMode="numeric" />
              </Field>
              <Field label={<>Website <Optional /></>}>
                <input className="ww-input" value={f.website} onChange={set("website")} placeholder="kookstudiodepan.nl" />
              </Field>
            </div>
            <Field label={<>Instagram <Optional /></>} hint="Helpt mensen je te herkennen en versterkt je vindbaarheid.">
              <input className="ww-input" value={f.instagram} onChange={set("instagram")} placeholder="@kookstudiodepan" />
            </Field>
          </section>

          {/* 5. Werklocatie */}
          <section className="ww-fsec">
            <div className="ww-fsec-head">
              <span className="ww-fsec-n">5</span>
              <div><h2>{sections[4]}</h2>
                <p>De plek waar deelnemers naartoe komen. Het exacte adres delen we pas na een boeking.</p></div>
            </div>
            <div className="ww-row ww-row--2">
              <Field label="Stad" hint="Bepaalt in welke stadpagina je aanbod verschijnt.">
                <select className="ww-select" value={f.city} onChange={set("city")}>
                  <option value="">Kies een stad</option>
                  {cities.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label={<>Wijk of buurt <Optional /></>}>
                <input className="ww-input" value={f.neighbourhood} onChange={set("neighbourhood")} placeholder="Wittevrouwen" />
              </Field>
            </div>
            <Field label={<>Naam van de locatie <Optional /></>}>
              <input className="ww-input" value={f.location_name} onChange={set("location_name")} placeholder="Kookstudio De Pan" />
            </Field>
            <Switch on={f.location_same} onChange={(v) => put("location_same", v)}
              title="Ik geef les op mijn eigen adres" note="Zet dit uit als je een aparte studio of locatie gebruikt." />
            {!f.location_same && (
              <div className="ww-row ww-row--2" style={{ marginTop: 14 }}>
                <Field label="Adres van de locatie">
                  <input className="ww-input" value={f.location_street} onChange={set("location_street")} placeholder="Voorstraat 1" />
                </Field>
                <Field label="Postcode">
                  <input className="ww-input" value={f.location_postal} onChange={set("location_postal")} placeholder="3512 AA" />
                </Field>
              </div>
            )}
            <p className="ww-hint" style={{ margin: "16px 0 8px", fontWeight: 700, color: tokens.color.ink }}>
              Voorzieningen
            </p>
            <Switch on={f.wheelchair} onChange={(v) => put("wheelchair", v)} title="Rolstoeltoegankelijk" />
            <Switch on={f.parking} onChange={(v) => put("parking", v)} title="Gratis parkeren in de buurt" />
            <Switch on={f.transit} onChange={(v) => put("transit", v)} title="Goed bereikbaar met het OV" />
          </section>

          {/* 6. Groepen */}
          <section className="ww-fsec">
            <div className="ww-fsec-head">
              <span className="ww-fsec-n">6</span>
              <div><h2>{sections[5]}</h2>
                <p>Teamuitjes leveren de grootste boekingen op. Je kunt dit later altijd aanzetten.</p></div>
            </div>
            <Switch on={f.accepts_groups} onChange={(v) => put("accepts_groups", v)}
              title="Ik neem groepsaanvragen aan" note="Wij sturen je de aanvraag, jij maakt de offerte." />
            {f.accepts_groups && (
              <Field label="Grootste groep die je aankunt" hint="Aantal personen.">
                <input className="ww-input" value={f.max_group_size} onChange={set("max_group_size")} placeholder="12" inputMode="numeric" />
              </Field>
            )}
          </section>

          {/* 7. Uitbetaling */}
          <section className="ww-fsec">
            <div className="ww-fsec-head">
              <span className="ww-fsec-n">7</span>
              <div><h2>{sections[6]}</h2>
                <p>Hierop maken we je omzet over, elke maandag na afloop van de workshop.</p></div>
            </div>
            <Field label="Rekeningnummer">
              <input className="ww-input" value={f.iban} onChange={set("iban")} placeholder="NL91 INGB 0002 4453 21" />
            </Field>
            <Field label="Tenaamstelling" hint="Zoals de naam bij je bank bekend staat.">
              <input className="ww-input" value={f.account_holder} onChange={set("account_holder")} placeholder="M. Rossi" />
            </Field>
            <div className="ww-sidecard" style={{ marginTop: 6, background: tokens.color.cloud, border: 0 }}>
              <h3>Wat je overhoudt</h3>
              <p style={{ color: tokens.color.ink, opacity: .75, marginBottom: 0 }}>
                Wij innen het volledige bedrag bij de deelnemer en houden 15 procent commissie in.
                Bij een workshop van 45 euro per persoon houd jij 38,25 euro per deelnemer over.
              </p>
            </div>
            <label className="ww-check" style={{ marginTop: 18 }}>
              <input type="checkbox" checked={f.terms} onChange={(e) => put("terms", e.target.checked)} />
              Ik ga akkoord met de voorwaarden voor workshopgevers en met 15 procent commissie per boeking.
            </label>
          </section>
        </div>

        <aside className="ww-side-sticky">
          <div className="ww-prog">
            <div className="ww-prog-top">
              <strong style={{ fontSize: 14.5 }}>Profiel compleet</strong>
              <b>{pct}%</b>
            </div>
            <div className="ww-prog-bar"><i style={{ width: `${pct}%` }} /></div>
            <ul className="ww-checklist">
              {required.map(([k, label]) => (
                <li key={k} data-done={String(f[k]).trim() !== "" ? "true" : "false"}>
                  <span className="ww-tick"><Icon name="check" size={13} /></span>{label}
                </li>
              ))}
            </ul>
          </div>

          <div className="ww-preview">
            <strong style={{ fontSize: 13.5 }}>Zo ziet het eruit</strong>
            <div className="ww-preview-card">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar name={f.display_name || "Nieuw profiel"} size={44} />
                <div style={{ minWidth: 0 }}>
                  <strong style={{ fontSize: 15, display: "block" }}>{f.display_name || "Je naam"}</strong>
                  <span className="ww-meta" style={{ fontSize: 12.5 }}>
                    {[f.profession || "Je vakgebied", f.city || "Je stad"].filter(Boolean).join(" · ")}
                  </span>
                </div>
              </div>
              <p className="ww-meta" style={{ marginTop: 12 }}>
                {f.bio_short || "Hier komt je korte introductie te staan."}
              </p>
              {f.kvk_number && <p className="ww-hint" style={{ marginTop: 10 }}>KvK {f.kvk_number}</p>}
            </div>
            <p className="ww-hint" style={{ marginTop: 12 }}>
              Adres, telefoonnummer en rekeningnummer blijven altijd afgeschermd.
            </p>
          </div>
        </aside>
      </div>

      <div className="ww-savebar">
        <div className="ww-savebar-in">
          <Button variant="outline" disabled={saving} onClick={saveProfile}>
            {saving ? "Opslaan..." : "Opslaan als concept"}
          </Button>
          <Button variant="primary" disabled={!complete || saving} onClick={saveProfile}>
            {mode === "edit" ? "Wijzigingen opslaan" : "Profiel indienen"}
          </Button>
          <span className="ww-meta" style={{ marginLeft: "auto" }}>
            {saveError
              ? saveError
              : saved
                ? "Opgeslagen."
                : complete
                  ? "Alles staat erin. We kijken je profiel binnen een werkdag na."
                  : `Nog ${required.length - filled.length} verplichte velden${f.terms ? "" : " en de voorwaarden"} te gaan.`}
          </span>
        </div>
      </div>
    </>
  );

  if (mode === "edit") return body;

  return (
    <div className="ww-wrap">
      <nav className="ww-crumbs" aria-label="Kruimelpad">
        <a onClick={() => nav({ name: "home" })}>Home</a><span>/</span>
        <a onClick={() => nav({ name: "auth", tab: "provider" })}>Word workshopgever</a><span>/</span>
        <span style={{ color: tokens.color.ink }}>Je profiel</span>
      </nav>
      <header className="ww-form-head">
        <span className="ww-eyebrow">Stap 2 van 2</span>
        <h1>Maak je profiel compleet</h1>
        <p>
          Je account staat er al. Vul hieronder je gegevens aan, dan kunnen we je profiel nakijken en
          je eerste workshop online zetten. Tussendoor opslaan kan altijd.
        </p>
      </header>
      {body}
    </div>
  );
}
