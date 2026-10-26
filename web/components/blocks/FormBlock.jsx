"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Section, SectionHead, BlockImage, TextLink } from "@/components/blocks/shared";
import { CATEGORIES } from "@/lib/mock-data";

const DAYS = ["ma", "di", "wo", "do", "vr", "za", "zo"];

/* Velden per formulier. `form` komt uit page_blocks.form. */
const FORMS = {
  contact: [
    { name: "topic", label: "Waar gaat je vraag over?", type: "radio", options: ["Meedoen aan een workshop", "Workshops geven", "Iets anders"] },
    { name: "name", label: "Je naam", type: "text", required: true, autoComplete: "name" },
    { name: "email", label: "Je e-mailadres", type: "email", required: true, autoComplete: "email" },
    { name: "message", label: "Je vraag", type: "textarea", required: true },
  ],
  venue_search: [
    { name: "city", label: "Je woonplaats", type: "text", required: true, autoComplete: "address-level2" },
    { name: "distance", label: "Hoe ver wil je reizen?", type: "select", options: ["Tot 5 km", "Tot 10 km", "Tot 25 km", "Maakt niet uit"] },
    { name: "category", label: "Soort workshop", type: "select", options: CATEGORIES.map((c) => c.name) },
    { name: "participants", label: "Aantal deelnemers", type: "number" },
    { name: "days", label: "Welke dagen kun je?", type: "checks", options: DAYS },
    { name: "parts", label: "Welk dagdeel?", type: "checks", options: ["Ochtend", "Middag", "Avond"] },
    { name: "needs", label: "Wat heeft je workshop nodig?", type: "textarea" },
    { name: "email", label: "Je e-mailadres", type: "email", required: true, autoComplete: "email" },
  ],
  venue_offer: [
    { name: "kind", label: "Wat voor ruimte is het?", type: "select", options: ["Keuken of kookstudio", "Atelier of werkplaats", "Zaal of hal", "Leslokaal", "Café of restaurant", "Iets anders"] },
    { name: "city", label: "Plaats", type: "text", required: true, autoComplete: "address-level2" },
    { name: "capacity", label: "Hoeveel mensen passen erin?", type: "number" },
    { name: "days", label: "Wanneer staat hij vaak leeg?", type: "checks", options: DAYS },
    { name: "amenities", label: "Wat is er?", type: "checks", options: ["Keuken", "Water", "Tafels en stoelen", "Parkeren", "Rolstoeltoegankelijk"] },
    { name: "email", label: "Je e-mailadres", type: "email", required: true, autoComplete: "email" },
  ],
  follow: [
    { name: "email", label: "Je e-mailadres", type: "email", required: true, autoComplete: "email" },
  ],
  business: [
    { name: "company", label: "Bedrijf", type: "text", required: true, autoComplete: "organization" },
    { name: "name", label: "Je naam", type: "text", required: true, autoComplete: "name" },
    { name: "email", label: "Je e-mailadres", type: "email", required: true, autoComplete: "email" },
    { name: "participants", label: "Aantal personen", type: "number" },
    { name: "message", label: "Wat zoeken jullie?", type: "textarea" },
  ],
  maker_signup: [
    { name: "email", label: "Je e-mailadres", type: "email", required: true, autoComplete: "email" },
  ],
};

const PRIVACY = {
  contact: "We gebruiken je naam en e-mailadres alleen om je vraag te beantwoorden.",
  venue_search: "We gebruiken je e-mailadres alleen om je over deze vraag te mailen.",
  venue_offer: "We gebruiken je e-mailadres alleen voor je advertentie.",
  follow: "Je krijgt alleen een mail bij een nieuwe datum of workshop. Opzeggen kan met een klik.",
  business: "Op een zakelijke aanvraag reageren we binnen één werkdag.",
  maker_signup: "We gebruiken je e-mailadres voor je account en berichten over je workshop.",
};

/* Formulierblok. Inzendingen gaan naar /api/forms (form_submissions in
   Directus, of business_requests / newsletter_subscribers). Aanmelden als
   workshopgever gaat niet via een inzending maar door naar de registratie.
   settings.button: tekst op de knop. */
export default function FormBlock({ block }) {
  const router = useRouter();
  const pathname = usePathname();
  const form = FORMS[block.form] ? block.form : "contact";
  const fields = FORMS[form];
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (form === "maker_signup") {
      router.push(`/inloggen?tab=provider&email=${encodeURIComponent(fd.get("email") || "")}`);
      return;
    }
    const data = {};
    for (const f of fields) data[f.name] = f.type === "checks" ? fd.getAll(f.name) : fd.get(f.name);
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form, data, page: pathname, website: fd.get("website") }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Versturen lukte niet");
      setState("sent");
    } catch (err) {
      setError(err.message);
      setState("idle");
    }
  };

  const compact = fields.length === 1;

  return (
    <Section block={block} className={`wb-form${block.image || form === "maker_signup" ? " wb-form--image" : ""}`} fields="type,form,title,body,image,image_alt,settings,cta_secondary_label,cta_secondary_to">
      <div className="wb-form-grid">
        <div>
          <SectionHead block={block} link={false} />
          {state === "sent" ? (
            <p className="wb-form-done" role="status">Dank je, we hebben het ontvangen. Je hoort van ons via de mail.</p>
          ) : (
            <form className={compact ? "wb-form-inline" : "wb-form-fields"} onSubmit={onSubmit} noValidate={false}>
              {/* Honeypot: mensen zien dit veld niet, bots vullen het in. */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="wb-hp" aria-hidden="true" />
              {fields.map((f) => <Field key={f.name} f={f} id={`${block.id || form}-${f.name}`} hideLabel={compact} />)}
              <button className="ww-btn ww-btn--primary ww-btn--lg" type="submit" disabled={state === "sending"}>
                {state === "sending" ? "Bezig..." : block.settings?.button || "Versturen"}
              </button>
              {error && <p className="wb-form-error" role="alert">{error}</p>}
              <p className="wb-footnote">{PRIVACY[form]}</p>
            </form>
          )}
          {block.cta_secondary_label && block.cta_secondary_to && (
            <p className="wb-form-more"><TextLink to={block.cta_secondary_to}>{block.cta_secondary_label}</TextLink></p>
          )}
        </div>
        {(block.image || form === "maker_signup") && (
          <BlockImage src={block.image} alt={block.image_alt} ratio="4/5" demo="keramiek" className="wb-form-img" />
        )}
      </div>
    </Section>
  );
}

function Field({ f, id, hideLabel }) {
  const label = <span className={hideLabel ? "ww-sr" : undefined}>{f.label}</span>;
  if (f.type === "radio" || f.type === "checks") {
    return (
      <fieldset className="wb-choices">
        <legend>{f.label}</legend>
        {f.options.map((o) => (
          <label key={o} className="wb-choice">
            <input type={f.type === "radio" ? "radio" : "checkbox"} name={f.name} value={o} />
            <span>{o}</span>
          </label>
        ))}
      </fieldset>
    );
  }
  if (f.type === "select") {
    return (
      <label className="ww-field" htmlFor={id}>{label}
        <select id={id} name={f.name} className="ww-select" defaultValue="">
          <option value="" disabled>Kies</option>
          {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </label>
    );
  }
  if (f.type === "textarea") {
    return <label className="ww-field" htmlFor={id}>{label}<textarea id={id} name={f.name} className="ww-textarea" required={f.required} /></label>;
  }
  return (
    <label className="ww-field" htmlFor={id}>{label}
      <input id={id} name={f.name} type={f.type} className="ww-input" required={f.required}
        autoComplete={f.autoComplete} min={f.type === "number" ? 1 : undefined} />
    </label>
  );
}
