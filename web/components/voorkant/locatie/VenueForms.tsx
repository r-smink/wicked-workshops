"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { routes } from "@/lib/routes";
import "./locatie.css";

const DAYS = ["ma", "di", "wo", "do", "vr", "za", "zo"];
const PARTS = ["Ochtend", "Middag", "Avond"];
const AMENITIES = ["Keuken", "Water", "Tafels en stoelen", "Parkeren", "Rolstoeltoegankelijk"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Werktekst: bedank- en foutteksten van de formulieren, staan niet in het ontwerp. */
const TEXT = {
  busy: "Bezig met versturen...",
  email: "Vul een geldig e-mailadres in.",
  city: "Vul je woonplaats in.",
  place: "Vul de plaats van je ruimte in.",
  failed: "Versturen lukte niet. Probeer het later opnieuw.",
  thanksSearch: { title: "Dank je, we zoeken met je mee", body: "We mailen je zodra we een ruimte zien die past. Beloven kunnen we niets, maar we kijken goed." },
  thanksOffer: { title: "Dank je, je ruimte is aangemeld", body: "We mailen je wat we nodig hebben voor je advertentie. Je hoeft nu nog niets vast te leggen." },
};

type Status = "idle" | "busy" | "done";
type FieldError = { field: string; message: string } | null;

function useToggles() {
  const [on, setOn] = useState<string[]>([]);
  const toggle = (v: string) => setOn((list) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]));
  return [on, toggle] as const;
}

function Chips({ options, on, toggle, days }: { options: string[]; on: string[]; toggle: (v: string) => void; days?: boolean }) {
  return (
    <div className={days ? "locatie-chips locatie-chips-dagen" : "locatie-chips"}>
      {options.map((o) => (
        <button key={o} type="button" className="fchip" aria-pressed={on.includes(o)} onClick={() => toggle(o)}>{o}</button>
      ))}
    </div>
  );
}

async function send(form: "venue_search" | "venue_offer", data: Record<string, string | string[]>, website: string): Promise<string | null> {
  try {
    const res = await fetch("/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ form, data, page: routes.room, website }),
    });
    if (res.ok) return null;
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    return json.error || TEXT.failed;
  } catch {
    return TEXT.failed;
  }
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

function Honeypot() {
  /* Honeypot: mensen zien dit veld niet, bots vullen het in. */
  return <input type="text" name="website" tabIndex={-1} autoComplete="off" className="locatie-hp" aria-hidden="true" />;
}

function useSubmit(form: "venue_search" | "venue_offer", required: { field: string; message: string }, collect: (fd: FormData) => Record<string, string | string[]>) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<FieldError>(null);
  const [failed, setFailed] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "busy") return;
    const el = e.currentTarget;
    const fd = new FormData(el);
    const data = collect(fd);
    setFailed("");
    let err: FieldError = null;
    if (!String(data[required.field] ?? "")) err = required;
    else if (!EMAIL.test(String(data.email ?? ""))) err = { field: "email", message: TEXT.email };
    setError(err);
    if (err) {
      (el.elements.namedItem(err.field) as HTMLElement | null)?.focus();
      return;
    }
    setStatus("busy");
    const problem = await send(form, data, str(fd, "website"));
    if (problem) {
      setFailed(problem);
      setStatus("idle");
      return;
    }
    setStatus("done");
  };

  const invalid = (field: string) =>
    error?.field === field ? { "aria-invalid": true as const, "aria-describedby": `${form}-${field}-fout` } : {};
  const fieldError = (field: string) =>
    error?.field === field ? <span className="locatie-fout" id={`${form}-${field}-fout`}>{error.message}</span> : null;

  return { status, failed, onSubmit, invalid, fieldError };
}

export function VenueForms() {
  const [days1, toggleDay1] = useToggles();
  const [parts, togglePart] = useToggles();
  const [days2, toggleDay2] = useToggles();
  const [amen, toggleAmen] = useToggles();

  const search = useSubmit("venue_search", { field: "city", message: TEXT.city }, (fd) => ({
    city: str(fd, "city"),
    distance: str(fd, "distance"),
    category: str(fd, "category"),
    participants: str(fd, "participants"),
    days: days1,
    parts,
    needs: str(fd, "needs"),
    email: str(fd, "email"),
  }));
  const offer = useSubmit("venue_offer", { field: "city", message: TEXT.place }, (fd) => ({
    kind: str(fd, "kind"),
    city: str(fd, "city"),
    capacity: str(fd, "capacity"),
    days: days2,
    amenities: amen,
    email: str(fd, "email"),
  }));

  return (
    <div className="locatie-a-formen">{" "}
      {search.status === "done" ? (
        <div className="bizform locatie-a-form locatie-bedankt" id="locatie-a-zoek" ref={(el) => el?.focus()} tabIndex={-1} role="status">
          <h2>{TEXT.thanksSearch.title}</h2>
          <p>{TEXT.thanksSearch.body}</p>
        </div>
      ) : (
<form className="bizform locatie-a-form" id="locatie-a-zoek" onSubmit={search.onSubmit} noValidate aria-busy={search.status === "busy"}>{" "}<h2>Laat ons team meezoeken</h2>
<Honeypot />
{" "}<div className="tweekolom">{" "}<label htmlFor="locatie-a-woon">Je woonplaats<input id="locatie-a-woon" name="city" type="text" placeholder="Bijvoorbeeld Utrecht" autoComplete="address-level2" required {...search.invalid("city")} />{search.fieldError("city")}</label>{" "}<label htmlFor="locatie-a-reis">Hoe ver wil je reizen?<select id="locatie-a-reis" name="distance"><option value="">Kies een afstand</option><option>Tot 5 km</option><option>Tot 10 km</option><option>Tot 25 km</option><option>Maakt niet uit</option></select></label>{" "}</div>
{" "}<div className="tweekolom">{" "}<label htmlFor="locatie-a-cat">Soort workshop<select id="locatie-a-cat" name="category"><option value="">Kies een soort</option><option>Koken en bakken</option><option>Keramiek en klei</option><option>Schilderen en kunst</option><option>Drinks en proeverijen</option><option>Bloemen en groen</option><option>Ambacht en maken</option><option>Fotografie en media</option><option>Dans, muziek en theater</option><option>Wellness en beauty</option><option>Actief en buiten</option><option>Niche en onverwacht</option><option>Duurzaam en repair</option></select></label>{" "}<label htmlFor="locatie-a-plek">Aantal deelnemers<input id="locatie-a-plek" name="participants" type="number" min="1" placeholder="Bijvoorbeeld 8" /></label>{" "}</div>
{" "}<fieldset className="locatie-veld">{" "}<legend>Welke dagen kun je?</legend>{" "}<Chips options={DAYS} on={days1} toggle={toggleDay1} days />
{" "}</fieldset>
{" "}<fieldset className="locatie-veld">{" "}<legend>Welk dagdeel?</legend>{" "}<Chips options={PARTS} on={parts} toggle={togglePart} />
{" "}</fieldset>
{" "}<label htmlFor="locatie-a-nodig">Wat heeft je workshop nodig?<input id="locatie-a-nodig" name="needs" type="text" placeholder="Bijvoorbeeld een keuken, water of veel tafelruimte" /></label>{" "}<label htmlFor="locatie-a-mail1">Je e-mailadres<input id="locatie-a-mail1" name="email" type="email" placeholder="jij@voorbeeld.nl" autoComplete="email" required {...search.invalid("email")} />{search.fieldError("email")}</label>{" "}<button className="btn" type="submit" disabled={search.status === "busy"}>{search.status === "busy" ? TEXT.busy : <>Vraag ons team om mee te zoeken{" "}<svg width="18" height="18" aria-hidden="true"><use href="#i-arrow" /></svg></>}
</button>{" "}{search.failed ? <p className="locatie-fout locatie-fout-blok" role="alert">{search.failed}</p> : null}<small>We gebruiken je e-mailadres alleen om je over deze vraag te mailen. We zoeken mee, maar kunnen niet beloven dat er een ruimte past. Nog geen workshop op Wicked?{" "}<Link href={routes.giver}>Zo word je workshopgever</Link></small>{" "}</form>
      )}
{" "}
      {offer.status === "done" ? (
        <div className="bizform locatie-a-form locatie-a-form-bied locatie-bedankt" id="locatie-a-bied" ref={(el) => el?.focus()} tabIndex={-1} role="status">
          <h2>{TEXT.thanksOffer.title}</h2>
          <p>{TEXT.thanksOffer.body}</p>
        </div>
      ) : (
<form className="bizform locatie-a-form locatie-a-form-bied" id="locatie-a-bied" onSubmit={offer.onSubmit} noValidate aria-busy={offer.status === "busy"}>{" "}<h2>Ik heb een ruimte</h2>
<Honeypot />
{" "}<label htmlFor="locatie-a-soort">Wat voor ruimte is het?<select id="locatie-a-soort" name="kind"><option value="">Kies een soort ruimte</option><option>Keuken of kookstudio</option><option>Atelier of werkplaats</option><option>Zaal of hal</option><option>Leslokaal</option><option>Café of restaurant</option><option>Iets anders</option></select></label>{" "}<div className="tweekolom">{" "}<label htmlFor="locatie-a-plaats">Plaats<input id="locatie-a-plaats" name="city" type="text" placeholder="Bijvoorbeeld Zwolle" autoComplete="address-level2" required {...offer.invalid("city")} />{offer.fieldError("city")}</label>{" "}<label htmlFor="locatie-a-max">Hoeveel mensen passen erin?<input id="locatie-a-max" name="capacity" type="number" min="1" placeholder="Bijvoorbeeld 12" /></label>{" "}</div>
{" "}<fieldset className="locatie-veld">{" "}<legend>Wanneer staat hij vaak leeg?</legend>{" "}<Chips options={DAYS} on={days2} toggle={toggleDay2} days />
{" "}</fieldset>
{" "}<fieldset className="locatie-veld">{" "}<legend>Wat is er?</legend>{" "}<Chips options={AMENITIES} on={amen} toggle={toggleAmen} />
{" "}</fieldset>
{" "}<label htmlFor="locatie-a-mail2">Je e-mailadres<input id="locatie-a-mail2" name="email" type="email" placeholder="jij@voorbeeld.nl" autoComplete="email" required {...offer.invalid("email")} />{offer.fieldError("email")}</label>{" "}<button className="btn btn-on-band" type="submit" disabled={offer.status === "busy"}>{offer.status === "busy" ? TEXT.busy : <>Meld je ruimte aan{" "}<svg width="18" height="18" aria-hidden="true"><use href="#i-arrow" /></svg></>}
</button>{" "}{offer.failed ? <p className="locatie-fout locatie-fout-blok" role="alert">{offer.failed}</p> : null}<small>Je hoeft nu nog niets vast te leggen. We mailen je wat we nodig hebben voor je advertentie, en gebruiken je e-mailadres alleen daarvoor.</small>{" "}</form>
      )}
{" "}</div>
  );
}
