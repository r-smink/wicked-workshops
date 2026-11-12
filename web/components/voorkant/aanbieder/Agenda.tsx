"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import type { AgendaModel, Dot } from "./view";

type Filter = "alle" | "door" | "open" | "vol";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "alle", label: "Alle" },
  { key: "door", label: "Gaat door" },
  { key: "open", label: "Nog aanmeldingen nodig" },
  { key: "vol", label: "Vol" },
];

export function Dots({ dots, className, label }: { dots: Dot[]; className?: string; label?: string }) {
  return (
    <span className={className ? `aanbieder-stoelen ${className}` : "aanbieder-stoelen"} aria-label={label} aria-hidden={label ? undefined : true}>
      {dots.map((d, i) => (
        <i key={i} className={d || undefined}></i>
      ))}
    </span>
  );
}

export function StandBadge({ kind, label }: { kind: "door" | "open" | "vol"; label: string }) {
  return (
    <span className={`aanbieder-stand aanbieder-stand-${kind}`}>
      {kind === "door" ? (
        <svg width="12" height="12" aria-hidden="true">
          <use href="#i-check" />
        </svg>
      ) : null}
      {kind === "door" ? "\n" : null}
      {label}
    </span>
  );
}

/* Weekraster met alle komende datums (ontwerp aanbieder-d). Het filter op
   stand dimt de andere datums (is-weg) en verbergt op smal scherm lege weken
   (is-nul), zoals het ontwerpscript. */
export function Agenda({ name, model }: { name: string; model: AgendaModel }) {
  const [filter, setFilter] = useState<Filter>("alle");
  const on = (stand: string) => filter === "alle" || stand === filter;
  const visible = filter === "alle" ? model.counts.alle : model.counts[filter];

  return (
    <section
      className="wrap aanbieder-d-agenda"
      id="aanbieder-d-agenda"
      aria-labelledby="aanbieder-d-h"
      style={{ "--weken": model.weeks.length, "--rijen": model.rowCount }}
    >
      {" "}
      <div className="aanbieder-d-kop">
        {" "}
        <div>
          {" "}
          <h2 id="aanbieder-d-h">Alle komende datums van {name}</h2>
          {" "}
          <p>{model.intro}</p>
          {" "}
        </div>
        {" "}
        <div className="aanbieder-d-filter" role="group" aria-label="Filter op stand">
          {FILTERS.map((f) => (
            <Fragment key={f.key}>
              {" "}
              <button type="button" className="fchip" data-eigen="" aria-pressed={filter === f.key} data-stand={f.key} onClick={() => setFilter(f.key)}>
                {f.label} <small>{model.counts[f.key]}</small>
              </button>
            </Fragment>
          ))}{" "}
        </div>
        {" "}
      </div>
      {" "}
      <div className="aanbieder-d-raster">
        {" "}
        <div className="aanbieder-d-rijen">
          {model.rows.map((row) => (
            <Fragment key={row.ws}>
              {" "}
              <p className="aanbieder-d-rijlabel" style={{ "--r": row.r }}>
                <Link href={row.href}>
                  <b>{row.title}</b>
                </Link>
                {row.meta ? <span>{row.meta}</span> : null}
                {row.rating ? (
                  <span>
                    <span className="stars" aria-hidden="true">
                      ★
                    </span>{" "}
                    {row.rating}
                  </span>
                ) : null}
              </p>
            </Fragment>
          ))}{" "}
        </div>
        {" "}
        <div className="aanbieder-d-weken">
          {model.weeks.map((week) => {
            const nul = !week.items.some((it) => on(it.stand));
            return (
              <Fragment key={week.key}>
                {" "}
                <div className={nul ? "aanbieder-d-week is-nul" : "aanbieder-d-week"} style={{ "--c": week.c }}>
                  {" "}
                  <h3>
                    {week.title}
                    {week.current ? <small>deze week</small> : null}
                  </h3>
                  {" "}
                  <ol>
                    {week.items.map((it) => (
                      <li
                        key={it.id}
                        className={on(it.stand) ? `aanbieder-d-ws-${it.ws}` : `aanbieder-d-ws-${it.ws} is-weg`}
                        data-stand={it.stand}
                        data-ws={it.ws}
                        style={{ "--r": it.r, "--c": it.c }}
                      >
                        <Link href={it.href} aria-label={it.aria} tabIndex={on(it.stand) ? undefined : -1}>
                          <span className="aanbieder-d-dagblok">
                            <b>{it.day}</b>
                            <span>{it.range}</span>
                          </span>
                          <span className="aanbieder-d-naam">{it.name}</span>
                          <StandBadge kind={it.badge.kind} label={it.badge.label} />
                          <span className="aanbieder-d-onder">
                            <Dots dots={it.dots} className="aanbieder-d-stoelen" />
                            <small>{it.small}</small>
                          </span>
                        </Link>
                      </li>
                    ))}
                    {week.empties.map((e) => (
                      <li key={`leeg-${e.r}`} className="aanbieder-d-leeg" aria-hidden="true" style={{ "--r": e.r, "--c": e.c }}></li>
                    ))}
                  </ol>
                  {" "}
                </div>
              </Fragment>
            );
          })}{" "}
        </div>
        {" "}
      </div>
      {" "}
      <p className="aanbieder-d-geen" id="aanbieder-d-geen" hidden={visible !== 0}>
        Geen datums met deze stand.
      </p>
      {model.later ? (
        <>
          {" "}
          <p className="aanbieder-d-geen">Latere datums staan bij de workshop zelf.</p>
        </>
      ) : null}{" "}
      <p className="aanbieder-a-legenda">
        <span>
          <i className="v"></i>aangemeld
        </span>
        <span>
          <i className="n"></i>nog nodig voor het minimum
        </span>
        <span>
          <i></i>vrij
        </span>
      </p>
      {" "}
    </section>
  );
}
