import "./aanbieder.css";

import { Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ProviderDetail, ReviewView, WorkshopCard } from "@/lib/voorkant/data";
import { rating } from "@/lib/voorkant/format";
import { routes } from "@/lib/routes";
import type { ProviderExtras } from "./data";
import { Agenda, Dots, StandBadge } from "./Agenda";
import { CopyLinkButton, FollowForm } from "./Follow";
import { Reviews } from "./Reviews";
import { agendaModel, cap, cardModel, listJoin, reviewsModel, word } from "./view";

const SIZES = "(max-width: 860px) 100vw, 50vw";

/* Werktekst: verklaring bij een particuliere aanbieder. De definitieve tekst
   volgt (juristen). Zonder voornaamwoord, want het geslacht kennen we niet. */
const PRIVATE_TITLE = (name: string) => `${name} geeft workshops als particulier`;
const PRIVATE_BODY = (name: string) =>
  `${name} doet dit naast het eigen werk, niet als bedrijf. Bij een particulier geldt het consumentenrecht niet. Wat er geldt bij annuleren en als een workshop niet doorgaat, staat bij elke workshop en in onze voorwaarden.`;

const Flag = ({ children }: { children: string }) => (
  <span className="demo-flag">
    <svg width="13" height="13" aria-hidden="true">
      <use href="#i-shield" />
    </svg>
    {children}
  </span>
);

export type Crumb = { name: string; href: string };

export type AanbiederData = {
  provider: ProviderDetail;
  extras: ProviderExtras;
  cards: WorkshopCard[];
  reviews: ReviewView[];
  ratings: { rating: number; workshopSlug: string | null }[];
  crumb: Crumb | null;
};

function paragraphs(text: string | null): string[] {
  return (text ?? "")
    .replace(/<\/p>|<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function heading(p: ProviderDetail, cityName: string | null): string {
  if (p.profession) return `${p.name}, ${p.profession}`;
  return cityName ? `Workshops van ${p.name} in ${cityName}` : `Workshops van ${p.name}`;
}

export function AanbiederPage({ provider: p, extras, cards, reviews, ratings, crumb }: AanbiederData) {
  const name = p.name;
  const cityName = p.city?.name ?? cards.find((w) => w.city)?.city?.name ?? null;
  const area = p.area || [extras.locationName, cityName].filter(Boolean).join(", ") || null;
  const cardModels = cards.map(cardModel);
  const agenda = agendaModel(cards);
  const revModel = reviewsModel(ratings, reviews, cards);

  const mins = cards.map((w) => w.min).filter((n): n is number => n != null && n > 0);
  const maxs = cards.map((w) => w.max).filter((n): n is number => n != null && n > 0);
  const groupMax = p.maxGroup ?? (maxs.length ? Math.max(...maxs) : null);
  const groupMin = mins.length ? Math.min(...mins) : null;
  const group = groupMax ? (groupMin && groupMin < groupMax ? `${groupMin} tot ${groupMax}` : `tot ${groupMax}`) : null;

  const story = paragraphs(p.bioLong);
  const storyImages = (extras.gallery.length ? extras.gallery : cards.map((w) => ({ src: w.image, alt: w.imageAlt })))
    .filter((img, i, all) => all.findIndex((x) => x.src === img.src) === i)
    .slice(0, 2);
  const portrait = p.image ?? cards[0]?.image ?? null;
  const cooks = cards.length > 0 && cards.every((w) => w.category?.slug === "koken-en-bakken");

  return (
    <>
      <div className="van-a">
        {" "}
        <div className="wrap">
          <nav className="kruimel" aria-label="Kruimelpad">
            {" "}
            <Link href="/">Home</Link>
            <span>/</span>
            {crumb ? (
              <>
                <Link href={crumb.href}>{crumb.name}</Link>
                <span>/</span>
              </>
            ) : null}
            {name}
          </nav>
        </div>
        {" "}
      </div>{" "}
      <div className="van-a">
        {" "}
        <section className="wrap aanbieder-a-hero" aria-labelledby="aanbieder-a-h1">
          {" "}
          {portrait ? (
            <figure className="aanbieder-a-portret">
              <Image src={portrait} alt={`Foto van ${name}`} width={1100} height={1650} sizes={SIZES} priority />
            </figure>
          ) : null}{" "}
          <div className="aanbieder-a-intro">
            {" "}
            <p className="aanbieder-a-wie">
              {p.kind ? <span className="aanbieder-label">{p.kind === "business" ? "Ondernemer" : "Particulier"}</span> : null}
              {area ? (
                <span>
                  <svg width="16" height="16" aria-hidden="true">
                    <use href="#i-pin" />
                  </svg>
                  {area}
                </span>
              ) : null}
            </p>{" "}
            <h1 id="aanbieder-a-h1">{heading(p, cityName)}</h1>{" "}
            {p.bioShort ? (
              <>
                <p className="aanbieder-a-lead">{p.bioShort}</p>{" "}
              </>
            ) : null}
            <dl className="aanbieder-a-cijfers">
              {" "}
              <div>
                <dt>Workshops</dt>
                <dd>{cards.length}</dd>
              </div>{" "}
              {p.rating != null && p.ratingCount > 0 ? (
                <>
                  <div>
                    <dt>Reviews</dt>
                    <dd>
                      <span className="stars" aria-hidden="true">
                        ★
                      </span>
                      {rating(p.rating)} <small>uit {p.ratingCount}</small>
                    </dd>
                  </div>{" "}
                </>
              ) : null}
              {group ? (
                <>
                  <div>
                    <dt>Groep</dt>
                    <dd>{group}</dd>
                  </div>{" "}
                </>
              ) : null}
            </dl>{" "}
            <FollowForm name={name} slug={p.slug} />{" "}
          </div>{" "}
        </section>{" "}
      </div>{" "}
      {p.kind === "private" ? (
        <>
          <div className="van-a">
            {" "}
            <section className="aanbieder-a-pp">
              {" "}
              <div className="wrap aanbieder-a-pp-in">
                {" "}
                <h2>{PRIVATE_TITLE(name)}</h2> <p>{PRIVATE_BODY(name)}</p> <Flag>Werktekst, de definitieve tekst volgt</Flag>{" "}
              </div>{" "}
            </section>{" "}
          </div>{" "}
        </>
      ) : null}
      <div className="van-a">
        {" "}
        <section className="wrap aanbieder-a-ws" aria-labelledby="aanbieder-a-ws-h">
          {" "}
          <div className="aanbieder-a-kop">
            {" "}
            <h2 id="aanbieder-a-ws-h">De workshops van {name}</h2>{" "}
            <p>
              {cards.length
                ? `Per kaart zie je de eerstvolgende datum, hoeveel mensen zich daarvoor al hebben aangemeld en of hij doorgaat. ${
                    agenda ? `Alle datums van ${cards.length === 1 ? "de workshop" : `de ${word(cards.length)} workshops`} staan in de agenda hieronder.` : ""
                  }`.trim()
                : `${name} heeft nu geen workshops online. Volg ${name} en je krijgt een mail als er een workshop bij komt.`}
            </p>{" "}
          </div>{" "}
          {cards.length ? (
            <div className="aanbieder-a-kaarten">
              {cardModels.map((c) => (
                <Fragment key={c.id}>
                  {" "}
                  <article className="aanbieder-a-kaart">
                    {" "}
                    <Link className="aanbieder-a-kaart-beeld" href={c.href}>
                      <Image src={c.image} alt={c.imageAlt} width={1400} height={933} sizes={SIZES} />
                    </Link>{" "}
                    <div className="aanbieder-a-kaart-tekst">
                      {" "}
                      <h3>
                        <Link href={c.href}>{c.title}</Link>
                      </h3>{" "}
                      <p className="aanbieder-a-meta">
                        {c.rating ? (
                          <span className="rate">
                            <span className="stars" aria-hidden="true">
                              ★
                            </span>
                            {c.rating} <small>({c.ratingCount})</small>
                          </span>
                        ) : null}
                        {c.duration ? <span>{c.duration}</span> : null}
                        {c.price ? <span>{c.price}</span> : null}
                      </p>{" "}
                      <div className="aanbieder-a-volgende">
                        {" "}
                        {c.next ? (
                          <>
                            <p>
                              <b>{c.next.when}</b>
                              <StandBadge kind={c.next.badge.kind} label={c.next.badge.label} />
                            </p>{" "}
                            <Dots dots={c.next.dots} label={c.next.dotsLabel} /> <small>{c.next.note}</small>{" "}
                          </>
                        ) : (
                          <>
                            <p>
                              <b>Nog geen nieuwe datum</b>
                            </p>{" "}
                            <small>Volg {name} en je krijgt een mail als er een datum bij komt.</small>{" "}
                          </>
                        )}
                      </div>{" "}
                      <Link className="tlink" href={c.href}>
                        Bekijk de workshop
                      </Link>{" "}
                    </div>{" "}
                  </article>
                </Fragment>
              ))}{" "}
            </div>
          ) : null}{" "}
        </section>{" "}
      </div>{" "}
      {agenda ? (
        <>
          <div className="van-d">
            {" "}
            <Agenda name={name} model={agenda} />{" "}
          </div>{" "}
        </>
      ) : null}
      {story.length || extras.languages.length || area ? (
        <>
          <div className="van-a">
            {" "}
            <section className="wrap aanbieder-a-verhaal" aria-labelledby="aanbieder-a-verhaal-h">
              {" "}
              {storyImages.length ? (
                <div className="aanbieder-a-verhaal-beeld">
                  {" "}
                  {storyImages.map((img, i) => (
                    <Fragment key={img.src}>
                      <Image
                        src={img.src}
                        className={i === 0 ? "aanbieder-a-vb1" : "aanbieder-a-vb2"}
                        alt={img.alt}
                        width={i === 0 ? 1120 : 1400}
                        height={i === 0 ? 1400 : 933}
                        sizes={SIZES}
                      />{" "}
                    </Fragment>
                  ))}
                </div>
              ) : null}{" "}
              <div className="aanbieder-a-verhaal-tekst">
                {" "}
                <h2 id="aanbieder-a-verhaal-h">{story.length ? `Waarom ${name} dit doet` : `Over ${name}`}</h2>{" "}
                {story.map((para, i) => (
                  <Fragment key={i}>
                    <p>{i === 0 ? `“${para}”` : para}</p>{" "}
                  </Fragment>
                ))}
                <dl className="aanbieder-a-plek">
                  {" "}
                  {area ? (
                    <>
                      <div>
                        <dt>Waar</dt>
                        <dd>{`${extras.locationName ? `${extras.locationName}, ${area}` : area}. Het adres staat in je bevestiging.`}</dd>
                      </div>{" "}
                    </>
                  ) : null}
                  {extras.languages.length ? (
                    <>
                      <div>
                        <dt>Taal</dt>
                        <dd>{listJoin(extras.languages, "of")}</dd>
                      </div>{" "}
                    </>
                  ) : null}
                </dl>{" "}
              </div>{" "}
            </section>{" "}
          </div>{" "}
        </>
      ) : null}
      <div className="van-a">
        {" "}
        {revModel ? (
          <Reviews model={revModel} heading={`${revModel.total} ${revModel.total === 1 ? "review" : "reviews"} over ${cards.length > 1 ? "alle workshops" : "de workshop"}`} />
        ) : (
          <section className="aanbieder-a-reviews" aria-labelledby="aanbieder-a-rev-h">
            {" "}
            <div className="wrap">
              {" "}
              <h2 id="aanbieder-a-rev-h">Nog geen reviews</h2>{" "}
              <p className="aanbieder-a-klein">Alleen wie via Wicked heeft geboekt en heeft meegedaan, kan een review schrijven.</p>{" "}
            </div>{" "}
          </section>
        )}{" "}
      </div>{" "}
      <div className="van-a">
        {" "}
        <section className="wrap aanbieder-a-slot">
          {" "}
          <h2>Een nieuwe datum van {name} niet missen?</h2>{" "}
          <p>
            {cap(`volg ${name} met je e-mailadres, of stuur dit profiel door naar ${cooks ? "wie ook graag kookt" : "wie er ook zin in heeft"}.`)}
          </p>{" "}
          <div>
            {" "}
            <a className="btn" href="#aanbieder-a-mail">
              Volg {name}
            </a>{" "}
            <CopyLinkButton name={name} />{" "}
          </div>{" "}
        </section>{" "}
      </div>
    </>
  );
}
