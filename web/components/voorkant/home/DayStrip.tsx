"use client";

import { Fragment, type MouseEvent } from "react";
import Link from "next/link";

/* "Of begin bij een dag": de komende zes dagen. Een dag uit "Dit weekend"
   scrolt naar die dag op de pagina; de andere gaan naar het aanbod. */

export type StripDay = { key: string; weekday: string; date: string; count: number; href: string };

function scrollTo(e: MouseEvent<HTMLAnchorElement>) {
  const id = e.currentTarget.getAttribute("href")?.slice(1);
  const target = id ? document.getElementById(id) : null;
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}

export function DayStrip({ days, moreHref }: { days: StripDay[]; moreHref: string }) {
  return (
    <ul className="home-b-dagen" aria-labelledby="home-b-dagen-kop">
      {" "}
      {days.map((d) => {
        const body = (
          <>
            <span>{d.weekday}</span>
            <b>{d.date}</b>
            <small>
              {d.count} {d.count === 1 ? "workshop" : "workshops"}
            </small>
          </>
        );
        return (
          <Fragment key={d.key}>
            <li>
              {d.href.startsWith("#") ? (
                <a href={d.href} onClick={scrollTo}>
                  {body}
                </a>
              ) : (
                <Link href={d.href}>{body}</Link>
              )}
            </li>{" "}
          </Fragment>
        );
      })}
      <li className="home-b-dag-meer">
        <Link href={moreHref}>
          <svg width="20" height="20" aria-hidden="true">
            <use href="#i-cal" />
          </svg>
          <small>Andere datum</small>
        </Link>
      </li>{" "}
    </ul>
  );
}
