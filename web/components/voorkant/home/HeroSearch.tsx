"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ALL_CATEGORIES, ALL_PLACES, routes } from "@/lib/routes";
import { euro } from "@/lib/voorkant/format";

/* De zoekbalk in de hero: wat, waar en wanneer. Een segment klapt zijn rij
   chips open (aria-expanded); een chip kiest (aria-pressed). De teller telt
   echte workshops uit Directus; zoeken gaat naar /<plaats>/<categorie>. */

export type SearchItem = { c: string; p: string; price: number | null; weekend: boolean; week: boolean; maand: boolean };
export type Choice = { k: string; v: string };

type Field = "wat" | "waar" | "wanneer";
type When = "altijd" | "weekend" | "week" | "maand";

const WHEN: { k: When; v: string; q: string | null }[] = [
  { k: "altijd", v: "Maakt niet uit", q: null },
  { k: "weekend", v: "Dit weekend", q: "weekend" },
  { k: "week", v: "Doordeweeks", q: "doordeweeks" },
  { k: "maand", v: "Volgende maand", q: "volgende-maand" },
];

const thousands = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export function HeroSearch({ categories, places, items }: { categories: Choice[]; places: Choice[]; items: SearchItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState<Field | null>(null);
  const [wat, setWat] = useState<Choice>({ k: ALL_CATEGORIES, v: "Alles" });
  const [waar, setWaar] = useState<Choice>({ k: ALL_PLACES, v: "Heel Nederland" });
  const [wanneer, setWanneer] = useState<When>("altijd");

  const when = WHEN.find((w) => w.k === wanneer)!;
  const href = routes.category(wat.k, waar.k) + (when.q ? `?wanneer=${when.q}` : "");

  const { n, price } = useMemo(() => {
    const hits = items.filter(
      (it) =>
        (wat.k === ALL_CATEGORIES || it.c === wat.k) &&
        (waar.k === ALL_PLACES || it.p === waar.k) &&
        (wanneer === "altijd" || it[wanneer]),
    );
    const prices = hits.map((h) => h.price).filter((p): p is number => p != null);
    return { n: hits.length, price: prices.length ? Math.min(...prices) : null };
  }, [items, wat.k, waar.k, wanneer]);

  const seg = (field: Field, label: string, value: string) => (
    <button
      type="button"
      className="home-a-zoek-seg"
      data-veld={field}
      aria-expanded={open === field}
      onClick={() => setOpen(open === field ? null : field)}
    >
      <small>{label}</small>
      <b data-uit={field}>{value}</b>
    </button>
  );

  const chip = (g: Field, c: Choice, pressed: boolean, pick: () => void) => (
    <button key={c.k} type="button" className="home-a-zchip" data-g={g} data-k={c.k} data-v={c.v} aria-pressed={pressed} onClick={pick}>
      {c.v}
    </button>
  );

  return (
    <div className="home-a-zoek" data-zoek="">
      {" "}
      <div className="home-a-zoek-bar">
        {" "}
        {seg("wat", "Wat wil je doen", wat.v)} {seg("waar", "Waar", waar.v)} {seg("wanneer", "Wanneer", when.v)}{" "}
        <button type="button" className="home-a-zoek-go" aria-label="Zoeken" onClick={() => router.push(href)}>
          <svg width="21" height="21" aria-hidden="true">
            <use href="#i-search" />
          </svg>
        </button>{" "}
      </div>{" "}
      <div className="home-a-zoek-chips" data-chips="wat" hidden={open !== "wat"}>
        {" "}
        {[{ k: ALL_CATEGORIES, v: "Alles" }, ...categories].map((c) => (
          <Fragment key={c.k}>
            {chip("wat", c, wat.k === c.k, () => setWat(c))}{" "}
          </Fragment>
        ))}
      </div>{" "}
      <div className="home-a-zoek-chips" data-chips="waar" hidden={open !== "waar"}>
        {" "}
        {[{ k: ALL_PLACES, v: "Heel Nederland" }, ...places].map((c) => (
          <Fragment key={c.k}>
            {chip("waar", c, waar.k === c.k, () => setWaar(c))}{" "}
          </Fragment>
        ))}
      </div>{" "}
      <div className="home-a-zoek-chips" data-chips="wanneer" hidden={open !== "wanneer"}>
        {" "}
        {WHEN.map((w) => (
          <Fragment key={w.k}>
            {chip("wanneer", w, wanneer === w.k, () => setWanneer(w.k))}{" "}
          </Fragment>
        ))}
      </div>{" "}
      <p className="home-a-zoek-uit">
        {" "}
        <span>
          <b data-n="">{thousands(n)}</b> {n === 1 ? "workshop" : "workshops"} gevonden
          {price != null ? (
            <>
              {" "}
              vanaf{" "}
              <b>
                €<span data-p="">{euro(price)}</span>
              </b>
            </>
          ) : null}
          , zonder boekingskosten
        </span>{" "}
        <Link className="tlink" href={href}>
          Bekijk ze{" "}
          <svg width="17" height="17" aria-hidden="true">
            <use href="#i-arrow" />
          </svg>
        </Link>{" "}
      </p>{" "}
    </div>
  );
}
