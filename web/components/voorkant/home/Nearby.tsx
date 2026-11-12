import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { ALL_CATEGORIES, routes } from "@/lib/routes";
import type { CityView, ReviewView } from "@/lib/voorkant/data";
import { Arrow, SIZES, unoptimized } from "./parts";

/* "Dichtbij is ook gewoon leuk" (plaatsen met aanbod) en "Wat deelnemers
   zeggen" (gepubliceerde reviews). */

const ALT: Record<string, string> = {
  amsterdam: "Grachtenpanden aan het Damrak in Amsterdam",
  utrecht: "De Oudegracht in Utrecht met werfkelders en een brug",
  rotterdam: "De Erasmusbrug over de Nieuwe Maas",
  "den-haag": "Het Binnenhof weerspiegeld in de Hofvijver",
};
const MAX_PLACES = 4;
const workshops = (n: number) => `${n} ${n === 1 ? "workshop" : "workshops"}`;
const places = (n: number) => `${n} ${n === 1 ? "plaats" : "plaatsen"}`;

export function Nearby({ cities }: { cities: (CityView & { count: number })[] }) {
  if (!cities.length) return null;
  const shown = cities.slice(0, MAX_PLACES);
  const rest = cities.length - shown.length;
  const all = routes.category(ALL_CATEGORIES);
  return (
    <div className="van-a">
      {" "}
      <section className="sec">
        {" "}
        <div className="wrap sec-head">
          {" "}
          <div>
            <h2>Dichtbij is ook gewoon leuk</h2>
            <p>Een plaats krijgt pas een eigen pagina zodra er genoeg aanbod staat om er iets te kiezen te hebben.</p>
          </div>{" "}
          <Link className="tlink" href={all}>
            Alle {places(cities.length)} <Arrow />
          </Link>{" "}
        </div>{" "}
        <div className="wrap">
          {" "}
          <div className="home-a-plaats">
            {" "}
            {shown.map((c) => (
              <Fragment key={c.slug}>
                <Link className="home-a-pl" href={routes.place(c.slug)}>
                  {c.image ? (
                    <Image src={c.image} alt={ALT[c.slug] ?? c.name} width={1100} height={733} sizes={SIZES} unoptimized={unoptimized(c.image)} />
                  ) : null}
                  <div className="home-a-pl-t">
                    <h3>{c.name}</h3>
                    <span>{workshops(c.count)}</span>
                  </div>
                </Link>{" "}
              </Fragment>
            ))}
            <Link className="home-a-pl home-a-pl-meer" href={all}>
              {" "}
              <div>
                {" "}
                <svg width="28" height="28" aria-hidden="true" style={{ color: "#fff" }}>
                  <use href="#i-compass" />
                </svg>{" "}
                <h3>De rest van Nederland</h3> <span>{rest > 0 ? places(rest) : "Alle workshops"}</span>{" "}
              </div>{" "}
            </Link>{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
    </div>
  );
}

const stars = (n: number) => "★".repeat(Math.max(1, Math.min(5, Math.round(n))));
const quote = (body: string) => `“${body.trim()}”`;

function Who({ r }: { r: ReviewView }) {
  return (
    <>
      <span className="home-a-av" aria-hidden="true">
        {r.initials}
      </span>
      <span>
        <b>{r.author}</b>
        {r.workshop ? <small>{r.workshop.title}</small> : null}
      </span>
    </>
  );
}

/* Hoogste cijfer eerst, dan de langste tekst: die leest het best als citaat. */
export function pickReviews(reviews: ReviewView[], n = 3): ReviewView[] {
  return [...reviews].sort((a, b) => b.rating - a.rating || b.body.length - a.body.length).slice(0, n);
}

export function Reviews({ reviews }: { reviews: ReviewView[] }) {
  const [big, ...small] = pickReviews(reviews);
  return (
    <div className="van-a">
      {" "}
      <section className="sec" style={{ paddingTop: "0" }}>
        {" "}
        <div className="wrap">
          {" "}
          <div className="sec-head">
            <div>
              <h2>Wat deelnemers zeggen</h2>
              <p className="sec-lead">Een review kan pas nadat de workshop is geweest, dus je leest alleen mensen die er waren.</p>
            </div>
          </div>{" "}
          {big ? (
            <div className="home-a-revs">
              {" "}
              <div className="home-a-rev-groot">
                {" "}
                <div>
                  {" "}
                  <span className="stars" style={{ fontSize: "17px" }} aria-label={`${big.rating} van 5 sterren`} role="img">
                    {stars(big.rating)}
                  </span>{" "}
                  <blockquote>{quote(big.body)}</blockquote>{" "}
                </div>{" "}
                <div className="home-a-rv-wie">
                  {" "}
                  <Who r={big} />{" "}
                </div>{" "}
              </div>{" "}
              {small.length ? (
                <div className="home-a-rev-klein">
                  {" "}
                  {small.map((r) => (
                    <Fragment key={r.id}>
                      <div className="home-a-rv">
                        {" "}
                        <span className="stars" aria-label={`${r.rating} van 5 sterren`} role="img">
                          {stars(r.rating)}
                        </span>{" "}
                        <p>{quote(r.body)}</p>{" "}
                        <div className="home-a-rv-wie">
                          <Who r={r} />
                        </div>{" "}
                      </div>{" "}
                    </Fragment>
                  ))}
                </div>
              ) : null}{" "}
            </div>
          ) : (
            <p className="sec-lead">Zodra deelnemers na hun workshop een review schrijven, lees je die hier.</p>
          )}{" "}
        </div>{" "}
      </section>{" "}
    </div>
  );
}
