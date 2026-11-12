"use client";

import Link from "next/link";
import { createContext, Fragment, useContext, useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent, type ReactNode, type RefObject } from "react";
import { answerText, blockById, HELP_BLOCKS, WERKTEKST_LABEL, type AnswerPart, type HelpGroupId } from "./content";

/* Zoeken in de hulponderwerpen, zoals het ontwerpscript (#p-hulp): elke term
   (ingekort tot een stam) moet voorkomen in de vraag, het antwoord of de titel
   van het onderwerp. Onderwerpen en groepen zonder treffer verdwijnen; bij
   hooguit acht treffers klappen ze open. */

function clean(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
const stem = (w: string) => (w.length <= 4 ? w : w.slice(0, Math.max(4, w.length - 3)));

/* Zoektekst per vraag: vraag + antwoord + titel van het onderwerp. */
const INDEX = HELP_BLOCKS.flatMap((b) =>
  b.faq.map((f, i) => ({ key: `${b.id}:${i}`, block: b.id, group: b.group, text: `${clean(`${f.q} ${answerText(f.a, true)}`)} ${clean(b.title)}` })),
);

type SearchState = {
  query: string;
  setQuery: (q: string) => void;
  active: boolean;
  count: number;
  /* Wijzigt bij elke zoekopdracht, zodat vragen opnieuw open- of dichtklappen. */
  run: number;
  hits: Set<string>;
  blocks: Set<string>;
  groups: Set<HelpGroupId>;
  inputRef: RefObject<HTMLInputElement | null>;
  mainRef: RefObject<HTMLDivElement | null>;
};

const Ctx = createContext<SearchState | null>(null);
const useSearch = () => {
  const s = useContext(Ctx);
  if (!s) throw new Error("HelpSearch-onderdeel buiten HelpSearchProvider");
  return s;
};

/* De wrapper .van-c uit het ontwerp, met de zoekstaat. Een klik op een anker
   naar een onderwerp wist een lopende zoekopdracht. */
export function HelpSearchProvider({ children }: { children: ReactNode }) {
  const [query, setQueryState] = useState("");
  const [run, setRun] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  const setQuery = (q: string) => {
    setQueryState(q);
    setRun((n) => n + 1);
  };

  const result = useMemo(() => {
    const q = clean(query);
    const terms = q ? q.split(" ").map(stem) : [];
    const hits = new Set<string>();
    const blocks = new Set<string>();
    const groups = new Set<HelpGroupId>();
    for (const item of INDEX) {
      if (terms.every((t) => item.text.includes(t))) {
        hits.add(item.key);
        blocks.add(item.block);
        groups.add(item.group);
      }
    }
    return { active: terms.length > 0, hits, blocks, groups, count: hits.size };
  }, [query]);

  function onClick(e: MouseEvent<HTMLDivElement>) {
    const a = (e.target as HTMLElement).closest?.('a[href^="#hulp-d-"]');
    if (a && query.trim()) setQuery("");
  }

  return (
    <Ctx.Provider value={{ query, setQuery, run, inputRef, mainRef, ...result }}>
      <div className="van-c" onClick={onClick}>
        {children}
      </div>
    </Ctx.Provider>
  );
}

export function HelpSearchForm() {
  const { query, setQuery, inputRef, mainRef } = useSearch();
  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setQuery(query);
    if (query.trim()) mainRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  return (
    <form className="hulp-c-zoek hulp-d-zoek" role="search" onSubmit={onSubmit}>
      {" "}
      <label htmlFor="hulp-d-q">Zoek in alle vragen</label>{" "}
      <div className="hulp-c-zoek-rij">
        {" "}
        <svg width="20" height="20" aria-hidden="true"><use href="#i-search" /></svg>{" "}
        <input ref={inputRef} id="hulp-d-q" type="search" placeholder="Bijvoorbeeld: annuleren" autoComplete="off" value={query} onChange={(e) => setQuery(e.target.value)} />{" "}
        <button className="btn" type="submit">Zoek</button>{" "}
      </div>{" "}
    </form>
  );
}

/* De onderwerpenindex verdwijnt zolang er gezocht wordt. */
export function HelpIndex({ children }: { children: ReactNode }) {
  const { active } = useSearch();
  return (
    <section className="hulp-d-index" aria-label="Onderwerpen" hidden={active}>
      {children}
    </section>
  );
}

/* .hulp-d-main met de status, de lege staat en de lijst. */
export function HelpMain({ children }: { children: ReactNode }) {
  const { query, setQuery, active, count, inputRef, mainRef } = useSearch();
  return (
    <div className="wrap hulp-d-main" ref={mainRef}>
      {" "}
      <p className="hulp-d-status" role="status" aria-live="polite" hidden={!active || count === 0}>
        {active && count > 0 ? `${count}${count === 1 ? " antwoord" : " antwoorden"} voor "${query.trim()}". Wis je zoekopdracht om alle onderwerpen te zien.` : ""}
      </p>{" "}
      <div className="hulp-d-geen" hidden={!(active && count === 0)}>
        {" "}
        <h2>Geen antwoord gevonden</h2>{" "}
        <p>Probeer een ander woord, of stuur ons een bericht. Dan zoeken we het voor je uit.</p>{" "}
        <div className="hulp-c-knoppen">
          {" "}
          <Link className="btn" href="/contact">
            Stuur ons een bericht <svg width="18" height="18" aria-hidden="true"><use href="#i-arrow" /></svg>
          </Link>{" "}
          <button
            className="hulp-d-wis tlink"
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
          >
            Toon alle vragen
          </button>{" "}
        </div>{" "}
      </div>{" "}
      <div className="hulp-d-lijst">{children}</div>{" "}
    </div>
  );
}

export function HelpGroup({ id, children }: { id: HelpGroupId; children: ReactNode }) {
  const { active, groups } = useSearch();
  return (
    <section className="hulp-d-groep" id={`hulp-d-${id}`} aria-labelledby={`hulp-d-${id}-kop`} hidden={active && !groups.has(id)}>
      {children}
    </section>
  );
}

export function HelpBlock({ id, children }: { id: string; children: ReactNode }) {
  const { active, blocks } = useSearch();
  return (
    <section className="hulp-c-blok hulp-d-blok" id={`hulp-d-${id}`} hidden={active && !blocks.has(id)}>
      {children}
    </section>
  );
}

function Answer({ parts }: { parts: AnswerPart[] }) {
  return (
    <p>
      {parts.map((p, i) => {
        if (typeof p === "string") return p;
        if ("href" in p) {
          return p.href.startsWith("#") ? <a key={i} href={p.href}>{p.text}</a> : <Link key={i} href={p.href}>{p.text}</Link>;
        }
        return (
          <Fragment key={i}>
            {" "}
            <span className="hulp-werktekst">{WERKTEKST_LABEL}</span>
          </Fragment>
        );
      })}
    </p>
  );
}

function Question({ id, q, a, index }: { id: string; q: string; a: AnswerPart[]; index: number }) {
  const { active, hits, count, run } = useSearch();
  const ref = useRef<HTMLDetailsElement>(null);
  const key = `${id}:${index}`;
  const visible = !active || hits.has(key);
  useEffect(() => {
    if (!ref.current || run === 0) return;
    ref.current.open = active ? count <= 8 && visible : false;
  }, [run, active, count, visible]);
  return (
    <details ref={ref} hidden={!visible}>
      <summary><span>{q}</span></summary>
      <Answer parts={a} />
    </details>
  );
}

/* De vragen van een onderwerp als .faq. */
export function HelpFaq({ block }: { block: string }) {
  const b = blockById(block);
  return (
    <div className="faq">
      {b.faq.map((f, i) => (
        <Fragment key={i}>
          {" "}
          <Question id={b.id} index={i} q={f.q} a={f.a} />
        </Fragment>
      ))}{" "}
    </div>
  );
}
