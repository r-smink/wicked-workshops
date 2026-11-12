import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { ALL_CATEGORIES, routes } from "@/lib/routes";
import type { SessionWithWorkshop } from "@/lib/voorkant/data";
import { dateLong, standAttr } from "@/lib/voorkant/format";
import { Arrow, Check, Price, Rate, SIZES, moreDates, standSub, unoptimized, whereLine } from "./parts";

/* "Dit weekend": datums van vrijdag tot en met zondag, per dag een greep. */

export const PER_DAY = 4;
const NAMES: Record<number, { id: string; name: string }> = {
  5: { id: "home-b-vr", name: "Vrijdag" },
  6: { id: "home-b-za", name: "Zaterdag" },
  0: { id: "home-b-zo", name: "Zondag" },
};
const noon = (day: string) => `${day}T12:00:00Z`;
export const dayAnchor = (day: string) => NAMES[new Date(noon(day)).getUTCDay()]?.id ?? `home-b-${day}`;

/* "vrijdag 13 tot en met zondag 15 november" */
function rangeText(from: string, to: string): string {
  const a = dateLong(noon(from));
  const b = dateLong(noon(to));
  const sameMonth = from.slice(0, 7) === to.slice(0, 7);
  return `vrijdag ${sameMonth ? a.split(" ")[0] : a} tot en met zondag ${b}`;
}

/* Per dag de getoonde datums; dagen zonder datum vallen weg. */
export function weekendDays(sessions: SessionWithWorkshop[], from: string): { day: string; items: SessionWithWorkshop[] }[] {
  return [0, 1, 2]
    .map((i) => {
      const d = new Date(noon(from));
      d.setUTCDate(d.getUTCDate() + i);
      const day = d.toISOString().slice(0, 10);
      return { day, items: sessions.filter((s) => s.isoDay === day).slice(0, PER_DAY) };
    })
    .filter((d) => d.items.length);
}

function Ticket({ s }: { s: SessionWithWorkshop }) {
  const w = s.workshop;
  const attr = standAttr(s.stand);
  const [date, month] = s.day.split(" ").slice(1);
  const more = moreDates(w);
  const sub = standSub(w, s);
  return (
    <Link className={`home-b-t home-b-t--${attr}`} href={routes.workshop(w.slug)}>
      {" "}
      <span className="home-b-t-stub">
        <span>{s.day.split(" ")[0]}</span>
        <b>{date}</b>
        <span>{month}</span>
        <span className="home-b-t-uur">{s.start}</span>
      </span>{" "}
      <span className="home-b-t-img">
        <Image src={w.image} alt={w.imageAlt} width={1400} height={933} sizes={SIZES} unoptimized={unoptimized(w.image)} />
      </span>{" "}
      <span className="home-b-t-body">
        {" "}
        <h3>{w.title}</h3> <span className="home-b-t-waar">{whereLine(w)}</span>{" "}
        <span className="home-b-t-rij">
          <Rate w={w} />
          {more ? <span className="home-b-t-meer">{more}</span> : null}
        </span>{" "}
        <span className="home-b-t-voet">
          {" "}
          <span className="home-b-t-stand">
            <span className="home-b-t-label">
              {attr === "door" ? <Check size={15} /> : null}
              {s.label}
            </span>
            {sub ? <span className="home-b-t-sub">{sub}</span> : null}
          </span>{" "}
          <Price w={w} />{" "}
        </span>{" "}
      </span>{" "}
    </Link>
  );
}

export function Weekend({ sessions, from, to }: { sessions: SessionWithWorkshop[]; from: string; to: string }) {
  const days = weekendDays(sessions, from);
  return (
    <div className="van-b">
      {" "}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
        <defs>
          <symbol id="home-b-door" viewBox="0 0 22 22">
            <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 2.4l2.2 1.7 2.8-.2.9 2.6 2.3 1.6-.9 2.7.9 2.7-2.3 1.6-.9 2.6-2.8-.2L11 19.6l-2.2-1.7-2.8.2-.9-2.6-2.3-1.6.9-2.7-.9-2.7 2.3-1.6.9-2.6 2.8.2z" />
              <path d="M7.7 11.2l2.2 2.2 4.4-4.5" />
            </g>
          </symbol>
        </defs>
      </svg>{" "}
      <section className="sec home-b-agenda" id="home-b-agenda">
        {" "}
        <div className="wrap sec-head">
          {" "}
          <div>
            {" "}
            <h2>Dit weekend</h2>{" "}
            <p>Een greep uit {rangeText(from, to)}. Het datumvak kleurt lichtpaars zodra een datum zeker doorgaat.</p>{" "}
          </div>{" "}
          <Link className="tlink" href={routes.category(ALL_CATEGORIES)}>
            Hele agenda <Arrow />
          </Link>{" "}
        </div>{" "}
        <div className="wrap">
          {" "}
          {days.length ? (
            days.map(({ day, items }) => {
              const name = NAMES[new Date(noon(day)).getUTCDay()]?.name ?? "";
              return (
                <Fragment key={day}>
                  <div className="home-b-dag" id={dayAnchor(day)}>
                    {" "}
                    <h3 className="home-b-dagkop">
                      <span>{name}</span> {dateLong(noon(day))}
                    </h3>{" "}
                    <div className="home-b-dagrij">
                      {" "}
                      {items.map((s) => (
                        <Fragment key={s.id}>
                          <Ticket s={s} />{" "}
                        </Fragment>
                      ))}
                    </div>{" "}
                  </div>{" "}
                </Fragment>
              );
            })
          ) : (
            <p className="sec-lead">Dit weekend staan er nog geen datums online. In de hele agenda vind je de datums daarna.</p>
          )}{" "}
        </div>{" "}
      </section>{" "}
    </div>
  );
}
