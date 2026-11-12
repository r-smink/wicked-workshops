"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState, type FormEvent } from "react";
import { routes, ALL_PLACES } from "@/lib/routes";
import "./contact.css";

/* Contactformulier (#p-contact). Verstuurt via POST /api/forms met form
   "contact" en toont daarna de bevestiging uit het ontwerp. */

const TOPICS = [
  { id: "contact-d-deelnemer", value: "participant", label: "Ik doe mee" },
  { id: "contact-d-gever", value: "provider", label: "Ik geef workshops" },
  { id: "contact-d-ruimte", value: "venue", label: "Een ruimte" },
  { id: "contact-d-zakelijk", value: "business", label: "Zakelijk of teamuitje" },
  { id: "contact-d-anders", value: "other", label: "Iets anders" },
] as const;

type TopicValue = (typeof TOPICS)[number]["value"];

/* Werktekst: foutmeldingen en de bezig-tekst staan niet in het ontwerp. */
const TEXT = {
  name: "Vul je naam in.",
  email: "Vul een geldig e-mailadres in.",
  message: "Schrijf je bericht.",
  failed: "Versturen lukte niet. Probeer het zo nog eens.",
  busy: "Bezig met versturen",
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Partial<Record<"name" | "email" | "message" | "form", string>>;

type Sent = { email: string; topic: string; reference: string };

export function ContactForm() {
  const [topic, setTopic] = useState<TopicValue>("participant");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reference, setReference] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<Sent | null>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (sent) doneRef.current?.focus();
  }, [sent]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const next: Errors = {};
    if (!name.trim()) next.name = TEXT.name;
    if (!EMAIL.test(email.trim())) next.email = TEXT.email;
    if (!message.trim()) next.message = TEXT.message;
    setErrors(next);
    if (Object.keys(next).length) {
      const first = next.name ? "contact-d-naam" : next.email ? "contact-d-mail" : "contact-d-bericht";
      document.getElementById(first)?.focus();
      return;
    }
    setBusy(true);
    const topicLabel = TOPICS.find((t) => t.value === topic)!.label;
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form: "contact",
          page: routes.contact,
          website,
          data: { email: email.trim(), name: name.trim(), topic, topic_label: topicLabel, reference: reference.trim(), message: message.trim() },
        }),
      });
      const data: { ok?: boolean; error?: string } = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setErrors({ form: data.error || TEXT.failed });
        return;
      }
      setSent({ email: email.trim(), topic: topicLabel, reference: reference.trim() });
    } catch {
      setErrors({ form: TEXT.failed });
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="contact-d-bevestig contact-x-bevestig" role="status">
        {" "}
        <span className="contact-d-vink"><svg width="26" height="26" aria-hidden="true"><use href="#i-check" /></svg></span>{" "}
        <div>
          {" "}
          <h2 ref={doneRef} tabIndex={-1}>Je bericht is verstuurd</h2>{" "}
          <p>We antwoorden per mail op <b>{sent.email}</b>.</p>{" "}
          <dl className="contact-d-recap">
            {" "}
            <div><dt>Onderwerp</dt><dd>{sent.topic}</dd></div>{" "}
            {sent.reference ? <div><dt>Workshop of boeking</dt><dd>{sent.reference}</dd></div> : null}{" "}
          </dl>{" "}
          <div className="contact-d-na-knoppen">
            {" "}
            <Link className="btn btn-line btn-sm" href={routes.help}>Bekijk de hulppagina</Link>{" "}
            <Link className="tlink" href={routes.place(ALL_PLACES)}>Bekijk workshops</Link>{" "}
          </div>{" "}
        </div>{" "}
      </div>
    );
  }

  const err = (k: keyof Errors, id: string) =>
    errors[k] ? <span className="contact-x-fout" id={id}>{errors[k]}</span> : null;

  return (
    <form className="bizform contact-d-form" id="contact-d-form" noValidate onSubmit={onSubmit} aria-busy={busy}>
      {" "}
      <fieldset className="hulp-keuze">
        {" "}
        <legend>Waar gaat je bericht over?</legend>{" "}
        <div className="hulp-keuze-rij">
          {TOPICS.map((t) => (
            <Fragment key={t.id}>
              {" "}
              <label>
                <input type="radio" name="contact-d-over" id={t.id} value={t.value} checked={topic === t.value} onChange={() => setTopic(t.value)} />
                {t.label}
              </label>
            </Fragment>
          ))}{" "}
        </div>{" "}
        <p className="contact-d-zaknoot"><b>Zakelijk of teamuitje?</b> Je hoort binnen één werkdag van ons.</p>{" "}
      </fieldset>{" "}
      <div className="tweekolom">
        {" "}
        <label htmlFor="contact-d-naam">
          Je naam
          <input id="contact-d-naam" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={errors.name ? true : undefined} aria-describedby={errors.name ? "contact-d-naam-fout" : undefined} />
          {err("name", "contact-d-naam-fout")}
        </label>{" "}
        <label htmlFor="contact-d-mail">
          Je e-mailadres
          <input id="contact-d-mail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={errors.email ? true : undefined} aria-describedby={errors.email ? "contact-d-mail-fout" : undefined} />
          {err("email", "contact-d-mail-fout")}
        </label>{" "}
      </div>{" "}
      <label htmlFor="contact-d-ref">
        Over welke workshop of boeking gaat het? (niet verplicht)
        <input id="contact-d-ref" type="text" placeholder="Bijvoorbeeld: Luca, za 14 nov" value={reference} onChange={(e) => setReference(e.target.value)} />
      </label>{" "}
      <label htmlFor="contact-d-bericht">
        Je bericht
        <textarea id="contact-d-bericht" value={message} onChange={(e) => setMessage(e.target.value)} aria-invalid={errors.message ? true : undefined} aria-describedby={errors.message ? "contact-d-bericht-fout" : undefined}></textarea>
        {err("message", "contact-d-bericht-fout")}
      </label>{" "}
      <div className="contact-x-hp" aria-hidden="true">
        <label htmlFor="contact-d-website">Website<input id="contact-d-website" type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
      </div>
      {errors.form ? <p className="contact-x-fout" role="alert">{errors.form}</p> : null}
      <button className="btn" type="submit" disabled={busy}>
        {busy ? TEXT.busy : "Verstuur je bericht"} <svg width="18" height="18" aria-hidden="true"><use href="#i-arrow" /></svg>
      </button>{" "}
      <small>We gebruiken je gegevens alleen om je bericht te beantwoorden.</small>{" "}
    </form>
  );
}
