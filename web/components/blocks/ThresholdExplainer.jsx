"use client";

import { useState } from "react";
import { Section, SectionHead, Actions, StandingPill, SeatDots } from "@/components/blocks/shared";
import { sessionStanding, STANDING_LEGEND } from "@/lib/session-standing";

/* De doorgaan-drempel uitgelegd aan de hand van één voorbeelddatum.
   Varianten:
     timeline     voorbeeld + tijdlijn uit items [{ label, text, status }]
     legend       voorbeeld + de vier standen zoals ze op de site staan
     interactive  voorbeeld waarin je zelf deelnemers aan- en afmeldt
   settings.example: { title, capacity, min, taken, decision }
   settings.note: kleine voetnoot, bijv. "voorbeelddata". */
export default function ThresholdExplainer({ block }) {
  const variant = block.variant || "timeline";
  const ex = { title: "Voorbeeld", capacity: 8, min: 4, taken: 3, decision: "vr 22:00", ...(block.settings?.example || {}) };
  const items = Array.isArray(block.items) ? block.items : [];

  return (
    <Section block={block} className={`wb-drempel wb-drempel--${variant}`} fields="type,variant,title,body,items,settings,cta_label,cta_to">
      <SectionHead block={block} link={false} />
      <div className="wb-drempel-grid">
        {variant === "interactive" ? <Simulator ex={ex} /> : <Example ex={ex} />}
        <div>
          {variant === "timeline" && items.length > 0 && (
            <ol className="wb-tl">
              {items.map((it, i) => (
                <li key={i} data-status={it.status || "none"}>
                  <span className="wb-tl-label">{it.label}</span>
                  <p>{it.text}</p>
                </li>
              ))}
            </ol>
          )}
          {variant !== "timeline" && <Legend />}
          {variant === "interactive" && items.length > 0 && (
            <ul className="wb-drempel-notes">
              {items.map((it, i) => <li key={i}><b>{it.label}</b> {it.text}</li>)}
            </ul>
          )}
        </div>
      </div>
      {block.settings?.note && <p className="wb-footnote">{block.settings.note}</p>}
      <Actions block={block} primary="primary" />
    </Section>
  );
}

function Example({ ex, taken = ex.taken, standing: given }) {
  const standing = given || sessionStanding({ capacity: ex.capacity, taken, min: ex.min });
  const detail = standing.key === "open" ? `beslismoment ${ex.decision}` : standing.detail;
  return (
    <figure className="wb-example">
      <figcaption>
        <b>{ex.title}</b>
        <span>{ex.capacity} plekken{ex.min ? `, minimum ${ex.min}` : ""}{ex.decision ? `, beslismoment ${ex.decision}` : ""}</span>
      </figcaption>
      <SeatDots capacity={ex.capacity} taken={taken} min={ex.min} />
      <StandingPill standing={{ ...standing, detail }} />
    </figure>
  );
}

function Simulator({ ex }) {
  const [taken, setTaken] = useState(ex.taken);
  const [decided, setDecided] = useState(false);
  const [locked, setLocked] = useState(ex.taken >= ex.min);

  const change = (delta) => {
    const next = Math.max(0, Math.min(ex.capacity, taken + delta));
    setTaken(next);
    /* Gaat door blijft door: is het minimum eenmaal gehaald, dan blijft dat zo. */
    if (next >= ex.min && !decided) setLocked(true);
  };
  const standing = sessionStanding({ capacity: ex.capacity, taken, min: ex.min, goesAhead: locked, decisionAt: decided ? new Date(0).toISOString() : null });
  const message = {
    open: `Nog ${ex.min - taken} ${ex.min - taken === 1 ? "aanmelding" : "aanmeldingen"} en je workshop gaat door.`,
    goes_ahead: "Je workshop gaat door, ook als er nu iemand afhaakt.",
    cancelled: "Het minimum is niet gehaald. Je deelnemers krijgen een andere datum aangeboden.",
    full: "Alle plekken zijn bezet.",
  }[standing.key];

  return (
    <div className="wb-sim">
      <Example ex={ex} taken={taken} standing={standing} />
      <div className="wb-sim-btns">
        <button type="button" className="ww-btn ww-btn--outline ww-btn--sm" onClick={() => change(1)} disabled={taken >= ex.capacity}>Iemand meldt zich aan</button>
        <button type="button" className="ww-btn ww-btn--outline ww-btn--sm" onClick={() => change(-1)} disabled={taken === 0}>Iemand haakt af</button>
        <button type="button" className="ww-btn ww-btn--outline ww-btn--sm" onClick={() => setDecided(true)} disabled={decided}>Het is {ex.decision}</button>
        <button type="button" className="ww-btn ww-btn--ghost ww-btn--sm" onClick={() => { setTaken(ex.taken); setDecided(false); setLocked(ex.taken >= ex.min); }}>Opnieuw</button>
      </div>
      <p className="wb-sim-msg" aria-live="polite">{message}</p>
    </div>
  );
}

function Legend() {
  return (
    <dl className="wb-legend">
      {STANDING_LEGEND.map((l) => (
        <div key={l.key}>
          <dt><StandingPill standing={{ key: l.key, label: l.label }} withDetail={false} /></dt>
          <dd>{l.text}</dd>
        </div>
      ))}
    </dl>
  );
}
