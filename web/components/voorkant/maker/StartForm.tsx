"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { routes } from "@/lib/routes";
import "./maker.css";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/* Na bevestigen van het account start de wizard. */
const AFTER_SIGNUP = "/dashboard/workshops/nieuw";
/* Werktekst: foutmelding, staat niet in het ontwerp. */
const ERROR_EMAIL = "Vul een geldig e-mailadres in.";

export const signupHref = (email = "") =>
  `/account-maken?tab=provider${email ? `&email=${encodeURIComponent(email)}` : ""}&next=${encodeURIComponent(AFTER_SIGNUP)}`;

/* "Begin met alleen je e-mailadres": geen eigen inzending, maar door naar de
   bestaande registratie voor workshopgevers (/account-maken, tab provider) met
   het e-mailadres voorgevuld. Daar kiest iemand een wachtwoord en volgt de
   bevestigingsmail; /api/auth/register vraagt namelijk ook een wachtwoord. */
export function StartForm({ social }: { social: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem("email") as HTMLInputElement;
    const email = input.value.trim();
    if (!EMAIL.test(email)) {
      setError(ERROR_EMAIL);
      input.focus();
      return;
    }
    setError("");
    setBusy(true);
    router.push(signupHref(email));
  };

  return (
<form className="maker-a-form" onSubmit={onSubmit} noValidate aria-busy={busy}>{" "}<label htmlFor="maker-a-mail">Je e-mailadres<input id="maker-a-mail" name="email" type="email" placeholder="jij@voorbeeld.nl" autoComplete="email" required aria-invalid={error ? true : undefined} aria-describedby={error ? "maker-a-mail-fout" : undefined} onChange={() => error && setError("")} />{error ? <span className="maker-fout" id="maker-a-mail-fout">{error}</span> : null}</label>{" "}<button className="btn" type="submit" disabled={busy}>Maak je account{" "}<svg width="18" height="18" aria-hidden="true"><use href="#i-arrow" /></svg>
</button>{" "}{social ? <><div className="maker-a-of"><span>of</span></div>
{" "}<Link className="btn btn-line" href={signupHref()}>Verder met een social account</Link>{" "}</> : null}<p className="maker-a-privacy">We gebruiken je e-mailadres voor je account en berichten over je workshop. Meer in onze privacyverklaring.</p>
{" "}<p className="maker-a-al">Heb je al een account?{" "}<Link href={`${routes.login}?tab=provider`}>Log in</Link></p>
{" "}</form>
  );
}
