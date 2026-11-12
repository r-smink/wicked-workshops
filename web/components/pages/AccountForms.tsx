"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

/* Kleine schermen rond het account (docs/04, docs/06 schermen 2, 4, 8, 9).
   Teksten uit docs/06; uiterlijk met de bestaande kaart- en formulierklassen. */

function Shell({ title, children, side }: { title: string; children: ReactNode; side?: ReactNode }) {
  return (
    <div className="ww-wrap" style={{ maxWidth: side ? 980 : 560, padding: "48px 20px 72px" }}>
      <div style={{ display: "grid", gap: 28, gridTemplateColumns: side ? "repeat(auto-fit, minmax(300px, 1fr))" : "1fr" }}>
        <section className="ww-card" style={{ padding: 28 }}>
          <h1 style={{ fontSize: 26, marginTop: 0 }}>{title}</h1>
          {children}
        </section>
        {side}
      </div>
    </div>
  );
}

function PasswordField({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const [show, setShow] = useState(false);
  return (
    <label className="ww-field">
      <span>{label}</span>
      <div style={{ display: "flex", gap: 8 }}>
        <input className="ww-input" type={show ? "text" : "password"} autoComplete="new-password" minLength={8} required
          value={value} onChange={(e) => onChange(e.target.value)} style={{ flex: 1 }} />
        <button type="button" className="ww-btn ww-btn--quiet ww-btn--sm" aria-pressed={show} onClick={() => setShow((v) => !v)}>
          {show ? "Verberg" : "Toon"}
        </button>
      </div>
    </label>
  );
}

async function post(url: string, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

const Alert = ({ text }: { text: string | null }) =>
  text ? <p role="alert" style={{ color: "var(--ww-coral-deep)", fontWeight: 700 }}>{text}</p> : null;

/* Scherm 2: bevestig je e-mailadres. */
export function CheckMail({ email, provider }: { email: string; provider: boolean }) {
  const [sent, setSent] = useState(false);
  return (
    <Shell title="Bijna klaar: bevestig je e-mailadres">
      <p>
        We hebben een mail gestuurd naar <strong>{email || "je e-mailadres"}</strong>. Klik op de knop in die mail,
        dan staat je account klaar{provider ? " en ga je verder met je aanmelding als workshopgever" : " met je aanmeldingen erin"}.
      </p>
      <p className="ww-meta">
        Geen mail? Kijk in je spam, of{" "}
        <button type="button" className="ww-btn ww-btn--ghost" style={{ padding: 0, height: "auto" }} disabled={sent || !email}
          onClick={async () => { await post("/api/auth/resend", { email }); setSent(true); }}>
          stuur hem opnieuw
        </button>
        . Verkeerd adres?{" "}
        <Link href={`/account-maken?email=${encodeURIComponent(email)}${provider ? "&tab=provider" : ""}`}>Pas het aan</Link>.
      </p>
      {sent && <p role="status">Als dit adres nog bevestigd moet worden, staat er een nieuwe mail klaar.</p>}
    </Shell>
  );
}

/* Scherm 4: alleen een wachtwoord kiezen, vanuit de bevestigingsmail van een aanmelding. */
export function ClaimAccount({ code, token, email, booking }: {
  code: string; token: string; email: string; booking: { when: string; title: string; standing: string | null } | null;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loginHint, setLoginHint] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <Shell
      title="Nog één ding: kies een wachtwoord"
      side={booking ? (
        <aside className="ww-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 17, marginTop: 0 }}>Dit staat straks in je account</h2>
          <p style={{ margin: "0 0 2px", fontWeight: 700 }}>{booking.when}</p>
          <p style={{ margin: 0 }}>{booking.title}</p>
          {booking.standing && <p className="ww-meta" style={{ margin: "4px 0 0" }}>{booking.standing}</p>}
          <p className="ww-meta" style={{ marginTop: 14 }}>Ook latere aanmeldingen met {email} komen er vanzelf bij.</p>
        </aside>
      ) : undefined}
    >
      <form onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true); setError(null);
        const r = await post("/api/auth/claim", { code, t: token, password });
        setBusy(false);
        if (!r.ok) { setError(r.data.error || "Dat lukte niet."); setLoginHint(Boolean(r.data.login)); return; }
        router.push(r.data.redirect || "/");
        router.refresh();
      }}>
        <p>Je e-mailadres <strong>{email}</strong> <span className="ww-chip ww-chip--soft" style={{ height: 24, fontSize: 12 }}>bevestigd</span></p>
        <PasswordField label="Wachtwoord (minimaal 8 tekens)" value={password} onChange={setPassword} />
        <Alert text={error} />
        {loginHint && <p><Link href={`/inloggen?email=${encodeURIComponent(email)}`}>Naar inloggen</Link></p>}
        <button className="ww-btn ww-btn--primary ww-btn--lg ww-btn--block" disabled={busy || password.length < 8}>
          {busy ? "Bezig..." : "Maak mijn account"}
        </button>
        <p className="ww-meta" style={{ fontSize: 13 }}>
          Je gaat akkoord met de <Link href="/voorwaarden">voorwaarden</Link> en het <Link href="/privacy">privacybeleid</Link>.
        </p>
      </form>
    </Shell>
  );
}

/* Scherm 8, stap 1: wachtwoord vergeten. */
export function ForgotPassword({ initialEmail = "" }: { initialEmail?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <Shell title="Wachtwoord vergeten">
      <form onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true); setError(null);
        const r = await post("/api/auth/forgot", { email });
        setBusy(false);
        if (!r.ok) { setError(r.data.error || "Dat lukte niet."); return; }
        router.push(`/wachtwoord-vergeten/verstuurd?e=${encodeURIComponent(email)}`);
      }}>
        <p>Vul je e-mailadres in. Hoort er een account bij, dan sturen we een link om een nieuw wachtwoord te kiezen.</p>
        <label className="ww-field">
          <span>Je e-mailadres</span>
          <input className="ww-input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <Alert text={error} />
        <button className="ww-btn ww-btn--primary ww-btn--lg ww-btn--block" disabled={busy || !email}>{busy ? "Bezig..." : "Stuur me een link"}</button>
        <p style={{ marginTop: 16 }}><Link href="/inloggen">Terug naar inloggen</Link></p>
      </form>
    </Shell>
  );
}

export function ForgotSent({ email }: { email: string }) {
  return (
    <Shell title="Kijk in je mail">
      <p>Hoort er een account bij {email ? <strong>{email}</strong> : "dit adres"}, dan sturen we een link om een nieuw wachtwoord te kiezen.</p>
      <p className="ww-meta">De link werkt één keer. Niet zelf aangevraagd? Dan hoef je niets te doen; je oude wachtwoord blijft werken.</p>
      <p><Link href="/inloggen">Terug naar inloggen</Link></p>
    </Shell>
  );
}

/* Scherm 8, stap 3: nieuw wachtwoord kiezen. */
export function ChoosePassword({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <Shell title="Kies een nieuw wachtwoord">
      <form onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true); setError(null);
        const r = await post("/api/auth/reset", { token, password });
        setBusy(false);
        if (r.data.expired) { router.push("/link-werkt-niet-meer?type=wachtwoord"); return; }
        if (!r.ok) { setError(r.data.error || "Dat lukte niet."); return; }
        router.push(r.data.redirect || "/");
        router.refresh();
      }}>
        <PasswordField label="Nieuw wachtwoord (minimaal 8 tekens)" value={password} onChange={setPassword} />
        <Alert text={error} />
        <button className="ww-btn ww-btn--primary ww-btn--lg ww-btn--block" disabled={busy || password.length < 8}>
          {busy ? "Bezig..." : "Opslaan en inloggen"}
        </button>
        <p className="ww-meta" style={{ marginTop: 12 }}>Daarna ben je ingelogd.</p>
      </form>
    </Shell>
  );
}

/* Scherm 9: de link werkt niet meer. */
export function LinkExpired({ type, initialEmail = "" }: { type: "bevestigen" | "wachtwoord"; initialEmail?: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <Shell
      title="Deze link werkt niet meer"
      side={
        <aside className="ww-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 17, marginTop: 0 }}>Wat er daarna gebeurt</h2>
          <ol style={{ paddingLeft: 18, margin: 0, display: "grid", gap: 10 }}>
            <li><strong>Nieuwe link aangevraagd</strong><br /><span className="ww-meta">De oude link doet niets meer.</span></li>
            <li><strong>Mail met een nieuwe link</strong><br /><span className="ww-meta">Dezelfde mail als eerst.</span></li>
            <li><strong>Klaar</strong><br /><span className="ww-meta">Je e-mailadres is bevestigd of je kiest je nieuwe wachtwoord, en je bent binnen.</span></li>
          </ol>
        </aside>
      }
    >
      <p>Een link uit onze mail werkt één keer en niet onbeperkt lang. Vraag een nieuwe aan, dan staat hij zo in je mail.</p>
      <form onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        await post(type === "bevestigen" ? "/api/auth/resend" : "/api/auth/forgot", { email });
        setBusy(false);
        setSent(true);
      }}>
        <label className="ww-field">
          <span>Je e-mailadres</span>
          <input className="ww-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <button className="ww-btn ww-btn--primary ww-btn--lg ww-btn--block" disabled={busy || !email || sent}>Stuur een nieuwe link</button>
      </form>
      {sent && <p role="status" style={{ marginTop: 12 }}>Hoort er een account bij, dan staat er een nieuwe link in je mail.</p>}
      <p className="ww-meta" style={{ marginTop: 16 }}>Weet je je wachtwoord nog? <Link href="/inloggen">Log dan gewoon in.</Link></p>
    </Shell>
  );
}
