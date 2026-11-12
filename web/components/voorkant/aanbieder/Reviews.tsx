"use client";

import { Fragment, useState } from "react";
import type { ReviewsModel } from "./view";

const PER_FILTER = 6;

/* Reviews met verdeling en filter per workshop (ontwerp aanbieder-a). */
export function Reviews({ model, heading }: { model: ReviewsModel; heading: string }) {
  const [ws, setWs] = useState("alle");
  const shown = new Set(
    model.items
      .filter((r) => ws === "alle" || r.ws === ws)
      .slice(0, PER_FILTER)
      .map((r) => r.id),
  );

  return (
    <section className="aanbieder-a-reviews" aria-labelledby="aanbieder-a-rev-h">
      {" "}
      <div className="wrap">
        {" "}
        <div className="aanbieder-a-rev-grid">
          {" "}
          <div className="aanbieder-a-rev-samen">
            {" "}
            <h2 id="aanbieder-a-rev-h">{heading}</h2>
            {" "}
            <p className="aanbieder-a-rev-cijfer">
              <b>{model.average}</b>
              <span className="stars" aria-hidden="true">
                {model.stars}
              </span>
            </p>
            {" "}
            <ul className="aanbieder-a-verdeling" aria-label={`Verdeling van de ${model.total} reviews`}>
              {model.distribution.map((d) => (
                <Fragment key={d.stars}>
                  {" "}
                  <li>
                    <span>{d.stars} ★</span>
                    <i style={{ "--w": d.width }}></i>
                    <b>{d.count}</b>
                  </li>
                </Fragment>
              ))}{" "}
            </ul>
            {" "}
            <p className="aanbieder-a-klein">Alleen wie via Wicked heeft geboekt en heeft meegedaan, kan een review schrijven.</p>
            {" "}
          </div>
          {" "}
          <div>
            {" "}
            {model.chips.length > 2 ? (
              <div className="aanbieder-a-filter" role="group" aria-label="Filter op workshop">
                {model.chips.map((c) => (
                  <Fragment key={c.ws}>
                    {" "}
                    <button
                      type="button"
                      className={ws === c.ws ? "fchip is-on" : "fchip"}
                      data-eigen=""
                      aria-pressed={ws === c.ws}
                      data-ws={c.ws}
                      onClick={() => setWs(c.ws)}
                    >
                      {c.label} <small>{c.count}</small>
                    </button>
                  </Fragment>
                ))}{" "}
              </div>
            ) : null}{" "}
            <div className="aanbieder-a-revs">
              {model.items.map((r) => (
                <Fragment key={r.id}>
                  {" "}
                  <article data-ws={r.ws} hidden={!shown.has(r.id)}>
                    <span className="stars" aria-hidden="true">
                      {r.stars}
                    </span>
                    <p>{r.body}</p>
                    <footer>
                      <span className="aanbieder-av">{r.initials}</span>
                      <span>
                        <b>{r.author}</b>
                        {r.meta}
                      </span>
                    </footer>
                  </article>
                </Fragment>
              ))}{" "}
            </div>
            {shown.size === 0 ? <p className="aanbieder-a-klein">Over deze workshop staan nog geen reviews met tekst.</p> : null}{" "}
          </div>
          {" "}
        </div>
        {" "}
      </div>
      {" "}
    </section>
  );
}
