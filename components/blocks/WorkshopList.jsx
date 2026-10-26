"use client";

import Link from "next/link";
import { Rating } from "@/components/ui";
import { Section, SectionHead, BlockImage, StandingPill, SeatDots } from "@/components/blocks/shared";
import { normalizeSession, sessionStanding, formatSessionDay, formatSessionTime } from "@/lib/session-standing";

const DEMO = ["koken2", "keramiek2", "cocktail", "bloemen2", "koken3", "ambacht2"];

/* Workshops als kaarten of op datum. Varianten:
     grid    raster van kaarten met de eerstvolgende datum (standaard)
     rail    dezelfde kaarten in een horizontale rij
     dates   brede rij per workshop met de eerstvolgende datums ernaast
     agenda  per dag gegroepeerd, elk datumvak als kaartje
   data.workshops komt uit lib/page-builder.js (bron: featured, upcoming,
   context, category of handmatig gekozen). */
export default function WorkshopList({ block }) {
  const workshops = block.data?.workshops || [];
  const variant = block.variant || "grid";
  if (!workshops.length) return null;

  return (
    <Section block={block} className={`wb-wl wb-wl--${variant}`} fields="type,variant,title,body,source,item_limit,filter_category,filter_city,workshops,cta_label,cta_to">
      <SectionHead block={block} />
      {variant === "dates" && (
        <div className="wb-wl-rows">
          {workshops.map((w, i) => <DateRow key={w.slug || i} w={w} i={i} />)}
        </div>
      )}
      {variant === "agenda" && <Agenda workshops={workshops} />}
      {(variant === "grid" || variant === "rail") && (
        <div className={variant === "rail" ? "wb-rail" : "wb-wl-grid"}>
          {workshops.map((w, i) => <SessionCard key={w.slug || i} w={w} i={i} />)}
        </div>
      )}
    </Section>
  );
}

function sessionsOf(w) {
  return (w.sessions || []).map((s) => normalizeSession(s, w.min_participants)).filter(Boolean);
}

function Meta({ w }) {
  return (
    <p className="ww-wcard-meta">
      {[w.area ? `${w.city ? `${w.city}, ` : ""}${w.area}` : w.city, w.duration].filter(Boolean).join(" · ")}
    </p>
  );
}

/* De nieuwe workshopkaart uit de export: beeld, titel, plaats, eerstvolgende
   datum met plekkenrij en stand, rating en prijs. */
export function SessionCard({ w, i = 0 }) {
  const sessions = sessionsOf(w);
  const next = sessions[0];
  const more = sessions.length - 1;
  return (
    <article className="ww-wcard wb-card">
      <Link href={`/workshop/${w.slug}`} className="ww-wcard-img" tabIndex={-1} aria-hidden="true">
        <BlockImage src={w.image} alt="" ratio="4/3" demo={DEMO[i % DEMO.length]} icon={w.icon} />
      </Link>
      <div className="ww-wcard-body">
        <h3><Link href={`/workshop/${w.slug}`}>{w.title}</Link></h3>
        <Meta w={w} />
        {next && (
          <div className="wb-card-next">
            <p className="wb-card-date">
              <b>{formatSessionDay(next.startsAt)}, {formatSessionTime(next.startsAt)}</b>
              {more > 0 && <span> +{more} {more === 1 ? "datum" : "datums"}</span>}
            </p>
            <SeatDots capacity={next.capacity} taken={next.taken} min={next.min} />
            <StandingPill session={next} />
          </div>
        )}
        <div className="ww-wcard-foot">
          <Rating value={w.rating} count={w.count} />
          {w.price ? (
            <span className="ww-price"><span>per persoon</span><b>{"€"}{w.price}</b></span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function DateRow({ w, i }) {
  const sessions = sessionsOf(w);
  return (
    <article className="wb-row">
      <Link href={`/workshop/${w.slug}`} className="wb-row-img" tabIndex={-1} aria-hidden="true">
        <BlockImage src={w.image} alt="" ratio="4/3" demo={DEMO[i % DEMO.length]} icon={w.icon} />
      </Link>
      <div className="wb-row-body">
        <h3><Link href={`/workshop/${w.slug}`}>{w.title}</Link></h3>
        <Meta w={w} />
        <div className="wb-row-foot">
          <Rating value={w.rating} count={w.count} />
          {w.price ? <span className="wb-row-price"><b>{"€"}{w.price}</b> per persoon</span> : null}
        </div>
      </div>
      <ul className="wb-row-dates" aria-label={`Datums voor ${w.title}`}>
        {sessions.length ? sessions.map((s) => (
          <li key={s.id}>
            <Link href={`/workshop/${w.slug}?sessie=${s.id}`} className={`wb-datebox wb-datebox--${sessionStanding(s).key}`}>
              <span className="wb-datebox-day">{formatSessionDay(s.startsAt)}</span>
              <span className="wb-datebox-time">{formatSessionTime(s.startsAt)}</span>
              <StandingPill session={s} />
            </Link>
          </li>
        )) : (
          <li className="wb-row-none">Nog geen datums gepland</li>
        )}
      </ul>
    </article>
  );
}

const DAY_HEAD = new Intl.DateTimeFormat("nl-NL", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Amsterdam" });

function Agenda({ workshops }) {
  /* Alle datums van alle workshops, gegroepeerd per dag. */
  const items = workshops.flatMap((w, i) => sessionsOf(w).map((s) => ({ w, s, i })));
  items.sort((a, b) => new Date(a.s.startsAt) - new Date(b.s.startsAt));
  const days = [];
  for (const it of items) {
    const key = DAY_HEAD.format(new Date(it.s.startsAt));
    const last = days[days.length - 1];
    if (last && last.key === key) last.items.push(it);
    else days.push({ key, items: [it] });
  }
  if (!days.length) {
    return <div className="wb-wl-grid">{workshops.map((w, i) => <SessionCard key={w.slug || i} w={w} i={i} />)}</div>;
  }
  return (
    <div className="wb-agenda">
      {days.map((d) => (
        <div key={d.key} className="wb-agenda-day">
          <h3>{d.key.charAt(0).toUpperCase() + d.key.slice(1)}</h3>
          <div className="wb-rail">
            {d.items.map(({ w, s, i }) => (
              <SessionCard key={`${w.slug}-${s.id}`} w={{ ...w, sessions: [w.sessions.find((x) => x.id === s.id)] }} i={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
