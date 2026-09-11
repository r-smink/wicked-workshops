"use client";

import { useState, useEffect } from "react";
import { tokens } from "@/lib/tokens";
import { useGo } from "@/lib/use-go";
import { useRouter } from "next/navigation";
import { SIDE_COPY } from "@/lib/mock-data";
import { Icon, Logo, Wordmark, Button, Field } from "@/components/ui";

export default function AuthPage({ tab: initialTab, sideCopy = SIDE_COPY }) {
  const go = useGo();
  const router = useRouter();
  const [tab, setTab] = useState(initialTab || "visitor");
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const copy = sideCopy[tab];

  /* Form state */
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", password: "",
    terms: false,
  });
  const setField = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setCheck = (k) => (e) => setForm({ ...form, [k]: e.target.checked });

  useEffect(() => { setMode("login"); setStep(1); setDone(false); setError(""); }, [tab]);

  const isProviderSignup = tab === "provider" && mode === "signup";

  /* Login: POST naar /api/auth/login */
  async function handleLogin() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Inloggen mislukt");
      /* Succes — redirect op basis van tab */
      router.push(tab === "provider" ? "/dashboard" : "/");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /* Register: POST naar /api/auth/register */
  async function handleRegister() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          first_name: form.first_name,
          last_name: form.last_name,
          role: tab === "provider" ? "provider" : "visitor",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Account aanmaken mislukt");
      if (data.needsLogin) {
        /* Account aangemaakt maar niet ingelogd — stuur naar login. */
        setMode("login");
        setError(data.message || "Account aangemaakt. Log in om verder te gaan.");
      } else {
        /* Ingelogd — toon succes of redirect. */
        setDone(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /* Provider signup: registreer na stap 1, daarna naar dashboard. */
  async function handleProviderSignup() {
    if (step < 3) { setStep(step + 1); return; }
    await handleRegister();
  }

  return (
    <div className="ww-auth">
      <div className="ww-auth-side">
        <span className="ww-auth-blob" style={{ width: 320, height: 320, background: "rgba(255,92,110,.5)", top: -80, right: -60 }} />
        <span className="ww-auth-blob" style={{ width: 220, height: 220, background: "rgba(255,255,255,.12)", bottom: 40, left: -70 }} />
        <a className="ww-logo" style={{ position: "relative", zIndex: 2 }} onClick={() => go({ name: "home" })}>
          <Logo size={34} mono /><Wordmark light />
        </a>
        <div>
          <h2>{copy.h}</h2>
          <p>{copy.p}</p>
          <ul className="ww-auth-quotes" style={{ marginTop: 26 }}>
            {copy.list.map((t) => (
              <li key={t}><Icon name="check" size={20} style={{ flex: "none", marginTop: 2 }} />{t}</li>
            ))}
          </ul>
        </div>
        <p style={{ fontSize: 13.5, opacity: .6, position: "relative", zIndex: 2 }}>
          Iets buitengewoons, dichtbij.
        </p>
      </div>

      <div className="ww-auth-main">
        <div className="ww-auth-box">
          <a className="ww-logo" style={{ marginBottom: 26 }} onClick={() => go({ name: "home" })}>
            <Logo size={30} /><Wordmark />
          </a>

          <div className="ww-tabs" role="tablist">
            <button role="tab" data-on={tab === "visitor" ? "true" : "false"} onClick={() => setTab("visitor")}>
              Ik wil boeken
            </button>
            <button role="tab" data-on={tab === "provider" ? "true" : "false"} onClick={() => setTab("provider")}>
              Ik geef workshops
            </button>
          </div>

          {error && (
            <div className="ww-alert" style={{ marginBottom: 20 }}>
              <Icon name="alert" size={18} style={{ color: tokens.color.coral, flex: "none" }} />
              <p style={{ fontSize: 14, color: tokens.color.coral }}>{error}</p>
            </div>
          )}

          {done ? (
            <div className="ww-done">
              <span className="ww-done-ico"><Icon name="check" size={34} /></span>
              <h1 style={{ fontSize: 26, marginBottom: 10 }}>Je account staat klaar</h1>
              <p className="ww-meta" style={{ marginBottom: 24 }}>
                {tab === "provider"
                  ? "We kijken je profiel na en zetten je workshop binnen een werkdag online. Ondertussen kun je alvast datums toevoegen."
                  : "Je kunt nu boeken, favorieten bewaren en je boekingen terugvinden."}
              </p>
              <Button variant="primary" size="lg" block
                onClick={() => go({ name: tab === "provider" ? "dashboard" : "home" })}>
                {tab === "provider" ? "Naar mijn dashboard" : "Verder zoeken"}
              </Button>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: 28, marginBottom: 8 }}>
                {mode === "login"
                  ? (tab === "provider" ? "Inloggen als workshopgever" : "Welkom terug")
                  : (tab === "provider" ? "Word workshopgever" : "Maak een account")}
              </h1>
              <p className="ww-meta" style={{ marginBottom: 24 }}>
                {mode === "login"
                  ? "Log in om verder te gaan waar je gebleven was."
                  : (tab === "provider"
                    ? "Drie korte stappen en je eerste workshop staat klaar."
                    : "Even iets invullen en je kunt boeken.")}
              </p>

              {isProviderSignup && (
                <div className="ww-steps-bar" aria-label={`Stap ${step} van 3`}>
                  {[1, 2, 3].map((i) => <i key={i} data-on={i <= step ? "true" : "false"} />)}
                </div>
              )}

              {mode === "login" && (
                <>
                  <Field label="E-mailadres">
                    <input className="ww-input" type="email" placeholder="jouw@email.nl"
                      autoComplete="email" value={form.email} onChange={setField("email")} />
                  </Field>
                  <Field label="Wachtwoord">
                    <input className="ww-input" type="password" placeholder="Je wachtwoord"
                      autoComplete="current-password" value={form.password} onChange={setField("password")}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
                  </Field>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, margin: "4px 0 22px" }}>
                    <label className="ww-check"><input type="checkbox" defaultChecked /> Ingelogd blijven</label>
                    <a style={{ fontSize: 13.5, fontWeight: 700, color: tokens.color.brand, cursor: "pointer" }}>
                      Wachtwoord vergeten?
                    </a>
                  </div>
                  <Button variant="primary" size="lg" block disabled={loading}
                    onClick={handleLogin}>
                    {loading ? "Inloggen..." : "Inloggen"}
                  </Button>
                  <p className="ww-meta" style={{ textAlign: "center", marginTop: 18 }}>
                    Nog geen account?{" "}
                    <a style={{ color: tokens.color.brand, fontWeight: 700, cursor: "pointer" }}
                      onClick={() => setMode("signup")}>
                      {tab === "provider" ? "Word workshopgever" : "Maak er een aan"}
                    </a>
                  </p>
                </>
              )}

              {mode === "signup" && tab === "visitor" && (
                <>
                  <div className="ww-row ww-row--2">
                    <Field label="Voornaam">
                      <input className="ww-input" placeholder="Sanne" value={form.first_name} onChange={setField("first_name")} />
                    </Field>
                    <Field label="Achternaam">
                      <input className="ww-input" placeholder="de Vries" value={form.last_name} onChange={setField("last_name")} />
                    </Field>
                  </div>
                  <Field label="E-mailadres">
                    <input className="ww-input" type="email" placeholder="jouw@email.nl"
                      value={form.email} onChange={setField("email")} />
                  </Field>
                  <Field label="Wachtwoord" hint="Minimaal 8 tekens, gebruik iets dat je onthoudt.">
                    <input className="ww-input" type="password" placeholder="Kies een wachtwoord"
                      autoComplete="new-password" value={form.password} onChange={setField("password")} />
                  </Field>
                  <label className="ww-check" style={{ margin: "4px 0 22px" }}>
                    <input type="checkbox" checked={form.terms} onChange={setCheck("terms")} />
                    Stuur me elke maand de leukste workshops. Geen spam, beloofd.
                  </label>
                  <Button variant="primary" size="lg" block disabled={loading || !form.email || !form.password}
                    onClick={handleRegister}>
                    {loading ? "Account aanmaken..." : "Account aanmaken"}
                  </Button>
                  <p className="ww-meta" style={{ textAlign: "center", marginTop: 18 }}>
                    Al een account?{" "}
                    <a style={{ color: tokens.color.brand, fontWeight: 700, cursor: "pointer" }}
                      onClick={() => setMode("login")}>Inloggen</a>
                  </p>
                </>
              )}

              {isProviderSignup && (
                <>
                  {step === 1 && (
                    <>
                      <div className="ww-row ww-row--2">
                        <Field label="Voornaam">
                          <input className="ww-input" placeholder="Marco" value={form.first_name} onChange={setField("first_name")} />
                        </Field>
                        <Field label="Achternaam">
                          <input className="ww-input" placeholder="Rossi" value={form.last_name} onChange={setField("last_name")} />
                        </Field>
                      </div>
                      <Field label="E-mailadres">
                        <input className="ww-input" type="email" placeholder="marco@kookstudio.nl"
                          value={form.email} onChange={setField("email")} />
                      </Field>
                      <Field label="Wachtwoord" hint="Minimaal 8 tekens.">
                        <input className="ww-input" type="password" placeholder="Kies een wachtwoord"
                          autoComplete="new-password" value={form.password} onChange={setField("password")} />
                      </Field>
                      <label className="ww-check" style={{ margin: "4px 0 22px" }}>
                        <input type="checkbox" checked={form.terms} onChange={setCheck("terms")} />
                        Ik ga akkoord met de voorwaarden voor workshopgevers.
                      </label>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <Field label="Wat geef je voor workshops?" hint="Een zin is genoeg, dit staat straks op je profiel.">
                        <input className="ww-input" placeholder="Italiaanse kookworkshops in een echte kookstudio" />
                      </Field>
                      <div className="ww-row ww-row--2">
                        <Field label="Stad">
                          <select className="ww-select">
                            {["Utrecht", "Amsterdam", "Rotterdam", "Den Haag", "Eindhoven", "Groningen"].map((c) => <option key={c}>{c}</option>)}
                          </select>
                        </Field>
                        <Field label="Actief sinds">
                          <select className="ww-select">
                            {["2026", "2025", "2024", "2023", "2022", "Eerder"].map((c) => <option key={c}>{c}</option>)}
                          </select>
                        </Field>
                      </div>
                      <Field label="Vertel kort over jezelf" hint="Waarom doe je dit, en wat maakt jouw workshop anders?">
                        <textarea className="ww-textarea" placeholder="Opgegroeid in de keuken van mijn nonna in Bologna..." />
                      </Field>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <Field label="Titel van je eerste workshop" hint="Zeg wat mensen gaan doen, niet wat het is.">
                        <input className="ww-input" placeholder="Italiaans koken met Marco" />
                      </Field>
                      <Field label="Categorie">
                        <select className="ww-select">
                          {["Koken & bakken", "Keramiek & klei", "Schilderen & kunst", "Drinks & proeverijen",
                            "Bloemen & groen", "Ambacht & maken"].map((c) => <option key={c}>{c}</option>)}
                        </select>
                      </Field>
                      <div className="ww-row ww-row--2">
                        <Field label="Prijs per persoon"><input className="ww-input" placeholder="45" inputMode="numeric" /></Field>
                        <Field label="Duur in minuten"><input className="ww-input" placeholder="180" inputMode="numeric" /></Field>
                      </div>
                      <div className="ww-row ww-row--2">
                        <Field label="Minimaal aantal"><input className="ww-input" placeholder="4" inputMode="numeric" /></Field>
                        <Field label="Maximaal aantal"><input className="ww-input" placeholder="12" inputMode="numeric" /></Field>
                      </div>
                      <p className="ww-hint" style={{ marginBottom: 22 }}>
                        Je kunt dit later allemaal nog aanpassen. Datums voeg je toe in je agenda.
                      </p>
                    </>
                  )}

                  <div style={{ display: "flex", gap: 12 }}>
                    {step > 1 && <Button variant="outline" size="lg" icon="left" onClick={() => setStep(step - 1)}>Terug</Button>}
                    <Button variant="primary" size="lg" block disabled={loading || (step === 1 && (!form.email || !form.password))}
                      onClick={handleProviderSignup}>
                      {loading ? "Opslaan..." : step < 3 ? "Verder" : "Account aanmaken"}
                    </Button>
                  </div>
                  <p className="ww-meta" style={{ textAlign: "center", marginTop: 18 }}>
                    Al een account?{" "}
                    <a style={{ color: tokens.color.brand, fontWeight: 700, cursor: "pointer" }}
                      onClick={() => setMode("login")}>Inloggen</a>
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
