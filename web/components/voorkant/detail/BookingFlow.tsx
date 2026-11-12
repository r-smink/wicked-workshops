"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import type { SessionView } from "@/lib/voorkant/data";
import { euro, plekken } from "@/lib/voorkant/format";
import { routes } from "@/lib/routes";
import { optionLabel, pers, selectable, sessionCut, sessionStart, sessionTitle, sessionsIntro, tileParts } from "./text";

/* Werktekst: de definitieve tekst volgt (juristen). */
const WERKTEKST_PARTICULIER = { lead: "Je boekt bij een particulier.", rest: "Het consumentenrecht geldt dan niet.", link: "Wat betekent dat?" };

type Props = {
  title: string;
  sessions: SessionView[];
  price: number | null;
  host: string;
  /* "Wittevrouwen, Utrecht" */
  place: string;
  /* "Wittevrouwen" */
  area: string;
  privateHost: boolean;
  paymentMode: "off" | "sandbox" | "live";
  words: { atHost: string; doing: string };
};

type Done = { session: SessionView; count: number; name: string; code: string | null };

const Check = () => (
  <svg width="13" height="13" aria-hidden="true">
    <use href="#i-check" />
  </svg>
);
const ShareIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 22 22" aria-hidden="true">
    <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="5" r="2.4" />
      <circle cx="6" cy="11" r="2.4" />
      <circle cx="16" cy="17" r="2.4" />
      <path d="M8.1 9.9 L13.9 6.1" />
      <path d="M8.1 12.1 L13.9 15.9" />
    </g>
  </svg>
);

function TileChip({ s }: { s: SessionView }) {
  if (s.stand === "vol") return <span className="detail-stand detail-stand-vol">Vol</span>;
  if (s.stand === "open") return <span className="detail-stand detail-stand-open">{s.label}</span>;
  return (
    <span className="detail-stand detail-stand-door">
      <Check />
      Gaat door
    </span>
  );
}

const chipClass = (s: SessionView) => (s.stand === "open" ? "detail-stand-open" : s.stand === "vol" ? "detail-stand-vol" : "detail-stand-door");

/* .ics voor "Zet in je agenda". Deterministisch (geen Date.now), zodat server
   en browser hetzelfde renderen. */
function icsHref(s: SessionView, title: string, place: string): string {
  const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (t: string) => t.replace(/([,;\\])/g, "\\$1");
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Wicked Workshops//NL", "BEGIN:VEVENT",
    `UID:${s.id}@wickedworkshops.nl`, `DTSTAMP:${stamp(s.startsAt)}`, `DTSTART:${stamp(s.startsAt)}`,
    ...(s.endsAt ? [`DTEND:${stamp(s.endsAt)}`] : []),
    `SUMMARY:${esc(title)}`, `LOCATION:${esc(place)}`, "END:VEVENT", "END:VCALENDAR",
  ];
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join("\r\n"))}`;
}

export function BookingFlow({ title, sessions, price, host, place, area, privateHost, paymentMode, words }: Props) {
  const first = sessions.find(selectable) ?? sessions[0]!;
  const [id, setId] = useState(first.id);
  const [wanted, setWanted] = useState(2);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [diet, setDiet] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);
  const [copied, setCopied] = useState(false);
  const bevRef = useRef<HTMLDivElement>(null);
  const tilesRef = useRef<HTMLDivElement>(null);

  const cur = sessions.find((s) => s.id === id) ?? first;
  const curOk = selectable(cur);
  const count = Math.max(1, Math.min(wanted, cur.free || 1));

  /* ?sessie=<id> kiest die datum voor (links vanaf kaarten en tijdlijnen). */
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("sessie");
    const s = q ? sessions.find((x) => x.id === q) : null;
    if (s && selectable(s)) {
      setId(s.id);
      tilesRef.current?.querySelector<HTMLElement>(`[data-id="${s.id}"]`)?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }, [sessions]);

  function choose(s: SessionView) {
    if (!selectable(s) || done) return;
    setId(s.id);
    setError(null);
  }

  /* Pijltjestoetsen in de radiogroep, zoals een gewone radioknop. */
  function onTileKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    for (let j = i + step; j >= 0 && j < sessions.length; j += step) {
      const s = sessions[j]!;
      if (selectable(s)) {
        choose(s);
        tilesRef.current?.querySelector<HTMLElement>(`[data-id="${s.id}"]`)?.focus();
        return;
      }
    }
  }

  const shareUrl = () => `${window.location.origin}${window.location.pathname}?sessie=${cur.id}`;
  async function shareDate() {
    const url = shareUrl();
    if (navigator.share) {
      try {
        await navigator.share({ title: `${title}, ${sessionStart(cur)}`, url });
        return;
      } catch {
        return;
      }
    }
    await copyLink();
  }
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      /* Klembord niet beschikbaar: niets te doen. */
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || done) return;
    if (!curOk) return setError("Deze datum is vol. Kies een andere datum.");
    if (!name.trim()) return setError("Vul je naam in.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Vul een geldig e-mailadres in.");
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: cur.id, participants: count, guest_name: name.trim(), guest_email: email.trim(), dietary_notes: diet.trim() || undefined }),
      });
      let data: { ok?: boolean; error?: string; checkoutUrl?: string; booking_code?: string } = {};
      try {
        data = await res.json();
      } catch {
        /* geen JSON */
      }
      if (!res.ok || !data.ok) {
        setError(data.error || "Aanmelden lukte niet. Probeer het zo nog eens.");
        return;
      }
      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
        return;
      }
      setDone({ session: cur, count, name: name.trim(), code: data.booking_code ?? null });
      window.requestAnimationFrame(() => {
        bevRef.current?.scrollIntoView({ block: "nearest" });
        bevRef.current?.focus();
      });
    } catch {
      setError("Er ging iets mis met de verbinding. Probeer het opnieuw.");
    } finally {
      setBusy(false);
    }
  }

  /* ---- paneel bij de gekozen datum (script: kies) */
  const n = cur.taken;
  const mn = cur.min ?? 0;
  const mx = cur.capacity;
  const vrij = cur.free;
  const balk = Array.from({ length: mx }, (_, k) => {
    const i = k + 1;
    let c = i <= n ? "v" : i <= mn ? "n" : "";
    if (i === mn && mn > 0) c += " m";
    return c.trim();
  });
  let telling: ReactNode;
  if (cur.stand === "open") telling = (<><b>{n} aangemeld.</b> Het minimum voor deze datum is {mn}, er zijn {mx} plekken.</>);
  else if (cur.stand === "geenmin") telling = (<><b>{n} aangemeld.</b> Geen minimum: deze datum gaat altijd door. Nog {plekken(vrij)}.</>);
  else if (cur.stand === "vol") telling = (<><b>Vol.</b> Alle {mx} plekken zijn bezet.</>);
  else telling = (<><b>{n} aangemeld.</b> Het minimum van {mn} is gehaald. Nog {plekken(vrij)}.</>);
  const noMin = cur.stand === "geenmin" || (cur.stand === "vol" && !cur.min);
  const l2k = cur.stand === "open" ? sessionCut(cur) : noMin ? "Geen beslismoment" : "Gaat door";
  const l2 = cur.stand === "open"
    ? `Beslismoment. Zijn er dan ${mn} of meer, dan gaat de workshop door. Zo niet, dan gaat hij niet door en krijg je een andere datum aangeboden.`
    : noMin ? `${host} heeft voor deze datum geen minimum gezet.` : "Het minimum is gehaald, de workshop gaat door.";

  /* ---- bevestiging (script: bevestiging); na aanmelden vastgezet */
  const b = done?.session ?? cur;
  const a = done?.count ?? count;
  const bn = b.taken, bmn = b.min ?? 0, bmx = b.capacity, tot = bn + a;
  const nm = (done?.name ?? name).replace(/^\s+/, "").split(" ")[0];
  let bevChip: ReactNode;
  let bevTekst: string;
  if (!bmn) {
    bevChip = <span className="detail-stand detail-stand-door"><Check />Gaat door</span>;
    bevTekst = `Deze datum heeft geen minimum en gaat door. Met jullie erbij zijn er ${tot} aangemeld.`;
  } else if (bn >= bmn) {
    bevChip = <span className="detail-stand detail-stand-door"><Check />Gaat door</span>;
    bevTekst = `Met jullie erbij staat de teller op ${tot}. Het minimum van ${bmn} was al gehaald, dus deze workshop gaat door.`;
  } else if (tot >= bmn) {
    bevChip = <span className="detail-stand detail-stand-door"><Check />Gaat door</span>;
    bevTekst = `Met jullie erbij staat de teller op ${tot}. Het minimum van ${bmn} is gehaald, dus deze workshop gaat door en dat blijft zo.`;
  } else {
    bevChip = <span className="detail-stand detail-stand-open">{tot} van {bmn} nodig</span>;
    bevTekst = `Met jullie erbij staat de teller op ${tot}. Het minimum is ${bmn}. Is dat er uiterlijk ${sessionCut(b)}, dan gaat de workshop door.`;
  }
  const nodig = bmn - tot, bvrij = bmx - tot;
  const deelLink = (<>{" "}<a href="#detail-b-sessies">Deel de datum</a></>);
  const bevDeel = nodig > 0
    ? (<>Nog {nodig} {nodig === 1 ? "aanmelding" : "aanmeldingen"} nodig.{deelLink}</>)
    : bvrij > 0 ? (<>Nog {plekken(bvrij)} vrij. Wie wil er nog mee?{deelLink}</>) : "Met jullie erbij is deze datum vol.";

  const paying = paymentMode !== "off" && (price ?? 0) > 0;
  const total = (price ?? 0) * count;
  const maxOpt = Math.max(1, Math.min(cur.capacity, 50));

  return (
    <>
      <div className="van-b">
        {" "}
        <section className="detail-b-sessies" id="detail-b-sessies" aria-labelledby="detail-b-sessies-h">
          {" "}
          <div className="wrap">
            {" "}
            <div className="detail-b-kop">
              {" "}
              <h2 id="detail-b-sessies-h">Kies je datum</h2>
              {" "}
              <p>{sessionsIntro(sessions)}</p>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
          <div className="detail-b-tegels" role="radiogroup" aria-label="Datums" ref={tilesRef}>
            {sessions.map((s, i) => {
              const t = tileParts(s);
              const checked = s.id === cur.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  className="detail-b-tegel"
                  role="radio"
                  aria-checked={checked}
                  aria-disabled={selectable(s) ? undefined : true}
                  tabIndex={checked ? 0 : -1}
                  data-stand={s.stand}
                  data-id={s.id}
                  onClick={() => choose(s)}
                  onKeyDown={(e) => onTileKey(e, i)}
                >
                  {" "}
                  <span className="detail-b-t-dag">{t.weekday}</span>
                  <b>{t.num}</b>
                  <span className="detail-b-t-mnd">{t.month}</span>{" "}
                  <TileChip s={s} />{" "}
                  <small>{t.small}</small>{" "}
                </button>
              );
            })}
          </div>
          {" "}
          <div className="wrap">
            {" "}
            <div className="detail-b-paneel" aria-live="polite">
              {" "}
              <div className="detail-b-p-links">
                {" "}
                <p className="detail-b-p-titel">
                  <b id="detail-b-titel">{sessionTitle(cur)}</b>
                  <span id="detail-b-chip" className={`detail-stand ${chipClass(cur)}`}>{cur.label}</span>
                </p>
                {" "}
                <div className="detail-b-teller">
                  {" "}
                  <div className="detail-b-balk" id="detail-b-balk" aria-hidden="true">
                    {balk.map((c, i) => <i key={i} className={c} />)}
                  </div>
                  {" "}
                  <p id="detail-b-telling">{telling}</p>
                  {" "}
                </div>
                {" "}
                <ol className="detail-b-lijn" id="detail-b-lijn">
                  {" "}
                  <li className="is-af"><b>Nu</b><span id="detail-b-l1">{n === 1 ? "1 persoon heeft" : `${n} mensen hebben`} zich aangemeld</span></li>
                  {" "}
                  <li><b id="detail-b-l2k">{l2k}</b><span id="detail-b-l2">{l2}</span></li>
                  {" "}
                  <li><b id="detail-b-l3k">{sessionStart(cur)}</b><span>{words.atHost} {host} in {area}.</span></li>
                  {" "}
                </ol>
                {" "}
              </div>
              {" "}
              <div className="detail-b-p-rechts">
                {" "}
                <h3 id="detail-b-deelkop">{cur.stand === "open" ? "Help deze datum op gang" : "Neem iemand mee"}</h3>
                {" "}
                <p>Deel hem met wie je mee wilt nemen. Elke aanmelding telt mee voor het minimum, en je krijgt een herinnering vóór het beslismoment.</p>
                {" "}
                <div className="detail-b-deel">
                  {" "}
                  <button className="btn btn-line btn-sm" type="button" onClick={shareDate}>
                    <ShareIcon size={17} />
                    Deel deze datum
                  </button>{" "}
                  <button className="btn btn-line btn-sm" type="button" onClick={copyLink} aria-live="polite">
                    {copied ? "Link gekopieerd" : "Kopieer de link"}
                  </button>{" "}
                </div>
                {" "}
                <p className="detail-b-stand-uitleg">
                  <span className="detail-stand detail-stand-door"><Check />Gaat door</span> blijft staan, ook als er daarna iemand afzegt.
                </p>
                {" "}
              </div>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
        </section>
        {" "}
      </div>
      {" "}
      <div className="van-b">
        {" "}
        <section className="wrap detail-b-aanvraag" id="detail-b-boek" aria-labelledby="detail-b-aanvraag-h">
          {" "}
          <h2 id="detail-b-aanvraag-h">Boek je plek</h2>
          {" "}
          <ol className="detail-b-stappen">
            {" "}
            <li className="is-af"><span className="detail-b-st-bol"><Check /></span><span><b>Datum</b><small id="detail-b-stap1">{sessionStart(b)}</small></span></li>
            {" "}
            <li className={done ? "is-af" : "is-nu"}><span className="detail-b-st-bol">{done ? <Check /> : "2"}</span><span><b>Jouw gegevens</b><small>aantal, naam, e-mail</small></span></li>
            {" "}
            <li className="is-overslaan"><span className="detail-b-st-bol">3</span><span><b>Betalen</b><small>overgeslagen in de pilot</small></span></li>
            {" "}
            <li className={done ? "is-nu" : undefined}><span className="detail-b-st-bol">4</span><span><b>Bevestiging</b><small>je plek staat vast</small></span></li>
            {" "}
          </ol>
          {" "}
          <div className="detail-b-flow">
            {" "}
            <form className="detail-b-form" id="detail-b-form" onSubmit={onSubmit} aria-busy={busy}>
              {" "}
              <h3>Jouw gegevens</h3>
              {" "}
              <label>
                Datum{" "}
                <select id="detail-b-datum" value={cur.id} disabled={Boolean(done)} onChange={(e) => { const s = sessions.find((x) => x.id === e.target.value); if (s) choose(s); }}>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id} disabled={!selectable(s)}>{optionLabel(s)}</option>
                  ))}
                </select>{" "}
              </label>{" "}
              <label>
                Aantal personen{" "}
                <select id="detail-b-aantal" value={count} disabled={Boolean(done)} onChange={(e) => setWanted(Number(e.target.value))}>
                  {Array.from({ length: maxOpt }, (_, k) => k + 1).map((v) => (
                    <option key={v} value={v} disabled={v > vrij}>{v}</option>
                  ))}
                </select>{" "}
              </label>{" "}
              <label>Je naam<input type="text" id="detail-b-naam" autoComplete="name" required value={name} readOnly={Boolean(done)} onChange={(e) => setName(e.target.value)} /></label>{" "}
              <label>Je e-mailadres<input type="email" autoComplete="email" required value={email} readOnly={Boolean(done)} onChange={(e) => setEmail(e.target.value)} /></label>{" "}
              <label><span>Allergie of dieetwens{" "}<small>(mag leeg)</small></span><input type="text" placeholder="Bijvoorbeeld: notenallergie" value={diet} readOnly={Boolean(done)} onChange={(e) => setDiet(e.target.value)} /></label>{" "}
              {price != null && (
                <div className="detail-b-som">
                  <p><span id="detail-b-som">{count} x €{euro(price)}</span><span id="detail-b-totaal">€{euro(total)}</span></p>
                  <p className="detail-b-som-nu"><span>Nu te betalen</span><b>€{paying ? euro(total) : 0}</b></p>
                  <p className="detail-b-som-klein">Boekingskosten €0, altijd</p>
                </div>
              )}
              {" "}
              {error && <p className="detail-b-fout" role="alert">{error}</p>}
              <button className="btn" type="submit" id="detail-b-knop" disabled={busy || Boolean(done) || !curOk}>
                {busy ? "Bezig met aanmelden..." : done ? `${pers(done.count)} aangemeld` : `Meld ${pers(count)} aan`}
              </button>{" "}
              {privateHost && (
                <p className="detail-b-klein">
                  <b>{WERKTEKST_PARTICULIER.lead}</b> {WERKTEKST_PARTICULIER.rest} <a href="#detail-a-gever">{WERKTEKST_PARTICULIER.link}</a>{" "}
                  <span className="demo-flag"><svg width="13" height="13" aria-hidden="true"><use href="#i-shield" /></svg>
                    Werktekst, de definitieve tekst volgt</span>
                </p>
              )}
              {" "}
              <p className="detail-b-klein">Je plek staat vast zodra je je aanmeldt. Je krijgt een mail met een link om je aanmelding terug te zien, ook zonder account. We gebruiken je gegevens alleen voor deze workshop.</p>
              {" "}
            </form>
            {" "}
            <div className="detail-b-vervolg">
              {" "}
              <div className="detail-b-betaal" aria-label="Stap 3, betalen">
                {" "}
                <p className="detail-b-v-kop"><span className="detail-b-st-bol">3</span><b>Betalen</b><small>overgeslagen</small></p>
                {" "}
                <p><b>Tijdens de pilot betaal je niets.</b> Betalen via de site kan op zijn vroegst vanaf januari 2027.</p>
                {" "}
              </div>
              {" "}
              <div className="detail-b-bev" id="detail-b-bev" tabIndex={-1} aria-label="Stap 4, bevestiging" ref={bevRef} aria-live={done ? "polite" : undefined}>
                {" "}
                <p className="detail-b-v-kop">
                  <span className="detail-b-st-bol"><Check /></span>
                  <b>Bevestiging</b>
                  {!done && <small className="detail-b-bev-label">voorbeeld na aanmelden</small>}
                </p>
                {" "}
                <h3 id="detail-b-bev-kop">Je plek staat vast, {nm || "Daan"}</h3>
                {" "}
                <p className="detail-b-bev-dag" id="detail-b-bev-dag">{sessionTitle(b)}<br />Bij {host}, {place}<br />{pers(a)}</p>
                {" "}
                <div className="detail-b-bev-teller">
                  {" "}
                  <span id="detail-b-bev-chip">{bevChip}</span>{" "}
                  <p id="detail-b-bev-tekst">{bevTekst}</p>
                  {" "}
                </div>
                {" "}
                <ul className="detail-b-bev-lijst">
                  {" "}
                  <li><b>Nu</b>De bevestiging in je mail, met de link naar je aanmelding</li>
                  {" "}
                  <li><b id="detail-b-bev-l2k">{sessionStart(b)}</b>{words.doing} {host} in {area}, het adres staat in je mail</li>
                  {" "}
                </ul>
                {" "}
                <p className="detail-b-bev-deel" id="detail-b-bev-deel">{bevDeel}</p>
                {" "}
                <p className="detail-b-bev-links">
                  <a href={icsHref(b, title, place)} download={`${title.replace(/[^\w-]+/g, "-").toLowerCase()}.ics`}>Zet in je agenda</a>
                  <Link href={routes.login}>Wijzigen of annuleren</Link>
                </p>
                {" "}
              </div>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
        </section>
        {" "}
      </div>
    </>
  );
}
