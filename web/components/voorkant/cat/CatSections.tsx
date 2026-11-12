import { Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { routes } from "@/lib/routes";

/* De statische delen van #p-cat rond de filterbalk: hero, pilotband,
   SEO-tekst, FAQ en Verder kijken. Server components. */

const SIZES = "(max-width: 860px) 100vw, 50vw";

function Arrow({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} aria-hidden="true">
      <use href="#i-arrow" />
    </svg>
  );
}

export function CatSymbols() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: "absolute" }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <symbol id="cat-d-door" viewBox="0 0 22 22">
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 2.4l2.2 1.7 2.8-.2.9 2.6 2.3 1.6-.9 2.7.9 2.7-2.3 1.6-.9 2.6-2.8-.2L11 19.6l-2.2-1.7-2.8.2-.9-2.6-2.3-1.6.9-2.7-.9-2.7 2.3-1.6.9-2.6 2.8.2z" />
            <path d="M7.7 11.2l2.2 2.2 4.4-4.5" />
          </g>
        </symbol>
      </defs>
    </svg>
  );
}

export type Crumb = { name: string; href?: string };

export function CatHero(props: {
  image: { src: string; alt: string };
  crumbs: Crumb[];
  h1: string;
  lead: string;
  count: number;
  rating: { avg: string; count: number } | null;
}) {
  const { image, crumbs, h1, lead, count, rating } = props;
  return (
    <div className="van-c">
      {" "}
      <section className="cat-c-hero">
        {" "}
        <Image
          src={image.src}
          className="cat-c-hero-img"
          alt={image.alt}
          width={1400}
          height={933}
          sizes={SIZES}
          priority
        />{" "}
        <div className="wrap cat-c-hero-in">
          {" "}
          <div className="cat-c-plaat">
            {" "}
            <nav className="kruimel" aria-label="Kruimelpad">
              <Link href="/">Home</Link>
              {crumbs.map((c) => (
                <Fragment key={c.name}>
                  <span>/</span>
                  {c.href ? <Link href={c.href}>{c.name}</Link> : c.name}
                </Fragment>
              ))}
            </nav>{" "}
            <h1>{h1}</h1> <p className="cat-c-lead">{lead}</p>{" "}
            <p className="paghero-rij">
              {" "}
              <span>
                <b>{count}</b> {count === 1 ? "workshop" : "workshops"}
              </span>{" "}
              {rating ? (
                <span>
                  <span className="stars" aria-hidden="true">
                    ★
                  </span>{" "}
                  <b>{rating.avg}</b> gemiddeld over{" "}
                  {rating.count.toLocaleString("nl-NL")}{" "}
                  {rating.count === 1 ? "review" : "reviews"}
                </span>
              ) : null}{" "}
              <span>
                <svg width="17" height="17" aria-hidden="true">
                  <use href="#i-zero" />
                </svg>
                {"\n"}Boekingskosten €0, altijd
              </span>{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
    </div>
  );
}

export function CatPilot() {
  return (
    <div className="van-b">
      {" "}
      <div className="cat-b-pilot">
        {" "}
        <div className="wrap cat-b-pilot-in">
          {" "}
          <p>
            <b>Tijdens de pilot betaal je niets.</b> Betalen via de site kan op
            zijn vroegst vanaf januari 2027. Je meldt je aan en je plek staat
            vast.
          </p>{" "}
          <Link className="tlink" href={routes.help}>
            Hoe de pilot werkt <Arrow />
          </Link>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}

/* Leeg: nog geen workshops in deze combinatie. */
export function CatEmpty({
  text,
  link,
}: {
  text: { h2: string; p: string };
  link: { href: string; label: string } | null;
}) {
  return (
    <div className="cat-d-aanbod">
      {" "}
      <div className="wrap">
        {" "}
        <div className="cat-d-leegfilter">
          {" "}
          <h2>{text.h2}</h2> <p>{text.p}</p>{" "}
          {link ? (
            <Link className="btn" href={link.href}>
              {link.label}
            </Link>
          ) : null}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}

function Shield() {
  return (
    <svg width="13" height="13" aria-hidden="true">
      <use href="#i-shield" />
    </svg>
  );
}

export function CatSeo(props: {
  heading: string;
  blocks: { h3?: string; p: string }[];
  werktekst: boolean;
  image: { src: string; alt: string };
}) {
  const { heading, blocks, werktekst, image } = props;
  return (
    <section className="sec cat-d-seo">
      {" "}
      <div className="wrap cat-d-seo-in">
        {" "}
        <div className="cat-d-seo-txt">
          {" "}
          <h2>{heading}</h2>{" "}
          {blocks.map((b, i) => (
            <Fragment key={i}>
              {b.h3 ? (
                <>
                  <h3>{b.h3}</h3>{" "}
                </>
              ) : null}
              <p>{b.p}</p>{" "}
            </Fragment>
          ))}
          {werktekst ? (
            <p className="demo-flag">
              <Shield />
              {"\n"}Werktekst, de definitieve tekst volgt
            </p>
          ) : null}{" "}
        </div>{" "}
        <figure className="cat-d-seo-img">
          <Image
            src={image.src}
            alt={image.alt}
            width={1400}
            height={2100}
            sizes={SIZES}
          />
        </figure>{" "}
      </div>{" "}
    </section>
  );
}

export function CatFaq({
  heading,
  faq,
}: {
  heading: string;
  faq: { question: string; answer: string }[];
}) {
  if (!faq.length) return null;
  return (
    <div className="van-c">
      {" "}
      <section className="sec cat-c-vragen cat-d-vragen">
        {" "}
        <div className="wrap cat-c-vragen-in">
          {" "}
          <h2>{heading}</h2>{" "}
          <div className="faq">
            {" "}
            {faq.map((f, i) => (
              <Fragment key={f.question}>
                <details open={i === 0}>
                  <summary>{f.question}</summary>
                  <p>{f.answer}</p>
                </details>{" "}
              </Fragment>
            ))}
          </div>{" "}
        </div>{" "}
      </section>{" "}
    </div>
  );
}

export function CatFurther({
  links,
  giverHeading,
  giverText,
}: {
  links: { href: string; label: string }[];
  giverHeading: string;
  giverText: string;
}) {
  return (
    <div className="van-c">
      {" "}
      <section className="sec cat-c-verder">
        {" "}
        <div className="wrap cat-d-verder-in">
          {" "}
          <div>
            {" "}
            <h2>Verder kijken</h2>{" "}
            <ul className="cat-c-verder-links">
              {" "}
              {links.map((l) => (
                <Fragment key={l.href}>
                  <li>
                    <Link href={l.href}>{l.label}</Link>
                  </li>{" "}
                </Fragment>
              ))}
            </ul>{" "}
          </div>{" "}
          <div className="cat-c-zijblok cat-c-zij-gever">
            {" "}
            <h2>{giverHeading}</h2> <p>{giverText}</p>{" "}
            <Link className="tlink" href={routes.giver}>
              Word workshopgever <Arrow />
            </Link>{" "}
            <Link className="tlink" href={routes.room}>
              Locatie gezocht <Arrow />
            </Link>{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
    </div>
  );
}
