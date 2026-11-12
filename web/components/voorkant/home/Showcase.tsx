import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { ALL_CATEGORIES, routes } from "@/lib/routes";
import type { SessionView, WorkshopCard } from "@/lib/voorkant/data";
import { standAttr } from "@/lib/voorkant/format";
import { Arrow, Check, Price, Rate, SIZES, moreDates, standSub, thousands, unoptimized, whereLine } from "./parts";

/* "Onze paradepaardjes": uitgelichte workshops (featured), anders de best
   beoordeelde. De plekkenrij toont aangemeld, nog nodig en vrij. */

const MAX_DOTS = 12;

function Dots({ s }: { s: SessionView }) {
  const total = Math.min(s.capacity, MAX_DOTS);
  if (total <= 0) return <span className="home-a-dots" aria-hidden="true" />;
  const scale = total / s.capacity;
  const on = Math.min(total, Math.round(s.taken * scale));
  const needed = s.stand === "open" && s.min ? Math.max(0, s.min - s.taken) : 0;
  const need = Math.min(total - on, needed ? Math.max(1, Math.round(needed * scale)) : 0);
  return (
    <span className="home-a-dots" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <i key={i} className={i < on ? "aan" : i < on + need ? "n" : undefined}></i>
      ))}
    </span>
  );
}

function Card({ w }: { w: WorkshopCard }) {
  const s = w.sessions[0];
  const attr = s ? standAttr(s.stand) : null;
  const more = moreDates(w);
  const sub = s ? standSub(w, s) : null;
  return (
    <Link className="home-a-k" href={routes.workshop(w.slug)}>
      {" "}
      <div className="home-a-k-img">
        <Image src={w.image} alt={w.imageAlt} width={1100} height={1650} sizes={SIZES} unoptimized={unoptimized(w.image)} />{" "}
        <span className="wk-heart">
          <svg width="18" height="18" aria-hidden="true">
            <use href="#i-heart" />
          </svg>
        </span>
      </div>{" "}
      <div className="home-a-k-body">
        {" "}
        <h3>{w.title}</h3>{" "}
        <p className="home-a-k-r">
          <svg width="15" height="15" aria-hidden="true">
            <use href="#i-pin" />
          </svg>
          <span>{whereLine(w)}</span>
        </p>{" "}
        {s ? (
          <>
            <p className="home-a-k-r home-a-k-wanneer">
              <svg width="15" height="15" aria-hidden="true">
                <use href="#i-cal" />
              </svg>
              <span>
                <b>
                  {s.day}, {s.start}
                </b>
                {more ? (
                  <>
                    {" "}
                    <span className="home-a-k-meer">{more}</span>
                  </>
                ) : null}
              </span>
            </p>{" "}
          </>
        ) : null}
        <div className="home-a-k-voet">
          <Rate w={w} />
          <Price w={w} />
        </div>{" "}
      </div>{" "}
      {s && attr && attr !== "nietdoor" ? (
        <>
          <div className={`home-a-k-stand on-tint home-a-k--${attr}`}>
            {" "}
            <Dots s={s} />{" "}
            <span className="home-a-k-standtxt">
              <b>
                {attr === "door" ? <Check size={16} /> : null}
                {s.label}
              </b>
              {sub ? <span>{sub}</span> : null}
            </span>{" "}
          </div>{" "}
        </>
      ) : null}
    </Link>
  );
}

export function Showcase({ cards, total }: { cards: WorkshopCard[]; total: number }) {
  const rest = total - cards.length;
  const all = routes.category(ALL_CATEGORIES);
  return (
    <div className="van-a">
      {" "}
      <section className="sec" style={{ paddingBottom: "clamp(30px,3.6cqi,52px)" }}>
        {" "}
        <div className="wrap sec-head">
          {" "}
          <div>
            {" "}
            <h2>Onze paradepaardjes</h2>{" "}
            <p>
              Vijf workshops die onze redactie zelf heeft uitgekozen. Bij elke workshop zie je de eerstvolgende datum en hoeveel mensen zich al
              hebben aangemeld.
            </p>{" "}
          </div>{" "}
          {total > 0 ? (
            <Link className="tlink" href={all}>
              Alle {thousands(total)} <Arrow />
            </Link>
          ) : null}{" "}
        </div>{" "}
        {cards.length ? (
          <>
            <div className="rail home-a-rail">
              {" "}
              {cards.map((w) => (
                <Fragment key={w.id}>
                  <Card w={w} />{" "}
                </Fragment>
              ))}
              {rest > 0 ? (
                <Link className="home-a-rail-cta" href={all}>
                  {" "}
                  <h3>Nog {thousands(rest)} andere</h3>{" "}
                  <p>Filter op plek, datum, groepsgrootte en budget, en zie per datum of hij doorgaat.</p>{" "}
                  <span className="btn btn-on-band btn-sm">
                    Naar het aanbod <Arrow size={17} />
                  </span>{" "}
                </Link>
              ) : null}{" "}
            </div>{" "}
            <div className="wrap home-a-legenda" aria-label="Zo lees je de plekkenrij">
              {" "}
              <span className="home-a-lg">
                <span className="home-a-dots" aria-hidden="true">
                  <i className="aan"></i>
                </span>{" "}
                aangemeld
              </span>{" "}
              <span className="home-a-lg">
                <span className="home-a-dots" aria-hidden="true">
                  <i className="n"></i>
                </span>{" "}
                nog nodig voor het minimum
              </span>{" "}
              <span className="home-a-lg">
                <span className="home-a-dots" aria-hidden="true">
                  <i></i>
                </span>{" "}
                vrij
              </span>{" "}
              <span className="home-a-lg">
                <svg width="17" height="17" aria-hidden="true" style={{ color: "var(--purple)" }}>
                  <use href="#i-check" />
                </svg>{" "}
                Gaat zeker door, ook als er iemand afhaakt
              </span>{" "}
            </div>{" "}
          </>
        ) : (
          <div className="wrap">
            <p className="sec-lead">Er staan nog geen workshops online. Kijk binnenkort weer.</p>
          </div>
        )}
      </section>{" "}
    </div>
  );
}
