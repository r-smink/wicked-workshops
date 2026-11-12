"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { routes } from "@/lib/routes";
import "./inloggen.css";

/* Inlogformulier (#p-inloggen). Twee wegen:
   - "Stuur me een link": POST /api/auth/forgot. De mail bevat een link om
     meteen een wachtwoord te kiezen, daarna ben je ingelogd. Het antwoord is
     altijd hetzelfde, of het adres nu bestaat of niet.
   - "Log in met je wachtwoord": POST /api/auth/login, daarna naar de
     bestemming uit het antwoord.
   De rolkeuze wisselt de onderste link en de foto zonder script (:has in de
   ontwerp-CSS); de radio's blijven daarom ongecontroleerd. */

/* Werktekst: meldingen die het ontwerp niet uitschrijft. */
const TEXT = {
  confirmed: "Je e-mailadres is bevestigd. Log in met je wachtwoord, dan ben je binnen.",
  emailMissing: "Vul je e-mailadres in.",
  emailInvalid: "Vul een geldig e-mailadres in.",
  passwordMissing: "Vul je wachtwoord in, of vraag hierboven een link.",
  failed: "Dat lukte niet. Probeer het zo nog eens.",
  sending: "Bezig met versturen",
  loggingIn: "Bezig met inloggen",
  sentTitle: "Kijk in je mail",
  sentBody: (email: string) => `Hoort er een account bij ${email}, dan staat er een link voor je klaar. Met die link kies je een wachtwoord en ben je meteen binnen.`,
  sentSmall: "De link werkt één keer. Geen mail gekregen? Kijk ook in je spam.",
  sentAgain: "Een ander e-mailadres gebruiken",
  ssoNote: "Inloggen met Google of Apple kan nog niet.",
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PROVIDER_HOME = "/dashboard";

type Props = { initialEmail: string; confirmed: boolean; next: string | null; providerFirst: boolean };

export function LoginForm({ initialEmail, confirmed, next, providerFirst }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<"link" | "login" | null>(null);
  const [error, setError] = useState<{ text: string; field: "email" | "password" | "form" } | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [refocus, setRefocus] = useState(false);

  /* Terug naar het formulier: focus op het e-mailveld. */
  useEffect(() => {
    if (refocus && !sentTo) {
      emailRef.current?.focus();
      setRefocus(false);
    }
  }, [refocus, sentTo]);

  const isProvider = () => Boolean(formRef.current?.querySelector<HTMLInputElement>("#inloggen-d-gever")?.checked);

  function checkEmail(): string | null {
    const value = email.trim();
    if (!value) return TEXT.emailMissing;
    if (!EMAIL.test(value)) return TEXT.emailInvalid;
    return null;
  }

  async function sendLink() {
    const bad = checkEmail();
    if (bad) {
      setError({ text: bad, field: "email" });
      emailRef.current?.focus();
      return;
    }
    setBusy("link");
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data: { ok?: boolean; error?: string } = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError({ text: data.error || TEXT.failed, field: res.status === 400 ? "email" : "form" });
        return;
      }
      setSentTo(email.trim());
    } catch {
      setError({ text: TEXT.failed, field: "form" });
    } finally {
      setBusy(null);
    }
  }

  async function logIn() {
    const bad = checkEmail();
    if (bad) {
      setError({ text: bad, field: "email" });
      emailRef.current?.focus();
      return;
    }
    if (!password) {
      setError({ text: TEXT.passwordMissing, field: "password" });
      passwordRef.current?.focus();
      return;
    }
    setBusy("login");
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, next: next || (isProvider() ? PROVIDER_HOME : null) }),
      });
      const data: { ok?: boolean; error?: string; redirect?: string } = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError({ text: data.error || TEXT.failed, field: "form" });
        setBusy(null);
        return;
      }
      router.push(data.redirect || (isProvider() ? PROVIDER_HOME : routes.home));
      router.refresh();
    } catch {
      setError({ text: TEXT.failed, field: "form" });
      setBusy(null);
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    if (submitter?.value === "login") void logIn();
    else void sendLink();
  }

  /* Enter in het wachtwoordveld logt in (anders zou de eerste knop, de link,
     het overnemen). */
  function onPasswordKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!busy) void logIn();
    }
  }

  const fieldError = (field: "email" | "password") =>
    error?.field === field ? <span className="inloggen-x-fout" id={`inloggen-d-${field}-fout`}>{error.text}</span> : null;

  return (
    <form ref={formRef} className="inlog inloggen-d-form" aria-label="Inloggen" noValidate onSubmit={onSubmit} aria-busy={busy ? true : undefined}>
      {" "}
      <fieldset className="account-rol">
        {" "}
        <legend>Ik log in als</legend>{" "}
        <div className="account-rol-rij">
          {" "}
          <label className="account-rol-kaart" htmlFor="inloggen-d-deelnemer"><input type="radio" name="inloggen-d-rol" id="inloggen-d-deelnemer" value="participant" defaultChecked={!providerFirst} /><span><b>Ik doe mee</b><small>Deelnemer</small></span></label>{" "}
          <label className="account-rol-kaart" htmlFor="inloggen-d-gever"><input type="radio" name="inloggen-d-rol" id="inloggen-d-gever" value="provider" defaultChecked={providerFirst} /><span><b>Ik geef workshops</b><small>Workshopgever</small></span></label>{" "}
        </div>{" "}
      </fieldset>{" "}
      {confirmed && !sentTo ? <p className="inloggen-x-melding" role="status">{TEXT.confirmed}</p> : null}
      {sentTo ? (
        <div className="inloggen-x-verstuurd" role="status">
          <h2>{TEXT.sentTitle}</h2>
          <p>{TEXT.sentBody(sentTo)}</p>
          <p className="inlog-klein">{TEXT.sentSmall}</p>
          <button
            className="tlink inloggen-x-opnieuw"
            type="button"
            onClick={() => {
              setSentTo(null);
              setRefocus(true);
            }}
          >
            {TEXT.sentAgain}
          </button>
        </div>
      ) : (
        <>
          <label>
            Je e-mailadres
            <input
              ref={emailRef}
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={error?.field === "email" ? true : undefined}
              aria-describedby={error?.field === "email" ? "inloggen-d-email-fout" : undefined}
            />
            {fieldError("email")}
          </label>{" "}
          <button className="btn" type="submit" value="link" disabled={busy !== null}>{busy === "link" ? TEXT.sending : "Stuur me een link"}</button>{" "}
          <p className="inlog-of"><span>of met je wachtwoord</span></p>{" "}
          <label>
            Je wachtwoord
            <input
              ref={passwordRef}
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={onPasswordKey}
              aria-invalid={error?.field === "password" ? true : undefined}
              aria-describedby={error?.field === "password" ? "inloggen-d-password-fout" : undefined}
            />
            <small>Alleen als je er een hebt ingesteld</small>
            {fieldError("password")}
          </label>{" "}
          {error?.field === "form" ? <p className="inloggen-x-fout" role="alert">{error.text}</p> : null}
          <button className="btn btn-line" type="submit" value="login" disabled={busy !== null}>{busy === "login" ? TEXT.loggingIn : "Log in met je wachtwoord"}</button>{" "}
          <p className="inlog-klein">Wachtwoord vergeten? Vraag hierboven een link, dan ben je zo binnen.</p>{" "}
          <p className="inlog-of"><span>of</span></p>{" "}
          <div className="inlog-sso">
            <button className="inlog-sso-knop" type="button" aria-disabled="true" aria-describedby="inloggen-d-sso-noot" onClick={(e) => e.preventDefault()}>Ga verder met Google</button>
            <button className="inlog-sso-knop" type="button" aria-disabled="true" aria-describedby="inloggen-d-sso-noot" onClick={(e) => e.preventDefault()}>Ga verder met Apple</button>
          </div>{" "}
          <p className="demo-flag" id="inloggen-d-sso-noot">
            <svg width="13" height="13" aria-hidden="true"><use href="#i-shield" /></svg>
            Google en Apple zijn een voorbeeld; welke inlogopties er komen, is nog niet gekozen<span className="inloggen-x-sr"> {TEXT.ssoNote}</span>
          </p>
        </>
      )}{" "}
      <p className="account-of inloggen-d-voor-deelnemer">Nog geen account? <Link href="/account-maken">Maak er een</Link></p>{" "}
      <p className="account-of inloggen-d-voor-gever">Nog geen account? <Link href={routes.giver}>Word workshopgever</Link></p>{" "}
    </form>
  );
}
