"use client";

import {
  Fragment,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CHIPS } from "./labels";
import type {
  DayView,
  FilterKey,
  OfferView,
  PeriodKey,
  RowView,
  SlotView,
} from "./types";

const SIZES = "(max-width: 860px) 100vw, 50vw";
const PAGE = 9;

/* Een filterbalk voor tijdlijn en lijst samen (#p-cat, cat.scripts.js):
   verbergt dagregels en workshops die niet passen, toont (0) bij een chip die
   op nul uitkomt, noemt in de leegmelding het filter dat de nul veroorzaakt,
   en klapt de week erna open. */

/* Links van de homepage: ?wanneer=weekend|doordeweeks|volgende-maand en
   ?dag=YYYY-MM-DD. Leest de URL na het laden, zodat de pagina zelf statisch
   blijft (useSearchParams binnen een eigen Suspense-grens). Onbekende waarden
   worden genegeerd. */
function UrlParams({
  onParams,
}: {
  onParams: (wanneer: string | null, dag: string | null) => void;
}) {
  const params = useSearchParams();
  const wanneer = params.get("wanneer");
  const dag = params.get("dag");
  useEffect(() => {
    onParams(wanneer, dag);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wanneer, dag]);
  return null;
}

const PERIODS: PeriodKey[] = ["werkdag", "volgendemaand"];

const fits = (keys: FilterKey[], active: FilterKey[]) =>
  active.every((k) => keys.includes(k));
const rowFits = (r: RowView, active: FilterKey[]) =>
  r.keySets.some((ks) => fits(ks, active));

function Check() {
  return (
    <svg width="15" height="15" aria-hidden="true">
      <use href="#i-check" />
    </svg>
  );
}

function Stand({ slot, cls }: { slot: SlotView; cls: string }) {
  return (
    <span className={cls}>
      <b>
        {slot.stand === "door" ? (
          <>
            <Check />
            {"\n"}
          </>
        ) : null}
        {slot.label}
      </b>
      {slot.sub ? <span>{slot.sub}</span> : null}
    </span>
  );
}

function DayBlock({ day, active }: { day: DayView; active: FilterKey[] }) {
  const visible = day.slots.filter((s) => fits(s.keys, active));
  return (
    <div
      className="cat-d-dag"
      id={`cat-d-d${day.isoDay}`}
      hidden={visible.length === 0}
    >
      {" "}
      <h3 className="cat-d-stub">
        <span>{day.weekday}</span> <b>{day.date}</b> <span>{day.month}</span>
      </h3>{" "}
      <ul className="cat-d-regels">
        {day.slots.map((s) => (
          <li key={s.id} className="cat-d-regel" hidden={!fits(s.keys, active)}>
            <Link className={`cat-d-r cat-d-r--${s.stand}`} href={s.href}>
              {" "}
              <span className="cat-d-tijd">{s.start}</span>{" "}
              <span className="cat-d-wat">
                <b>{s.title}</b>
                {s.where ? <span>{s.where}</span> : null}
              </span>{" "}
              <Stand slot={s} cls="cat-d-stand" />{" "}
              {s.price ? (
                <span className="cat-d-prijs">
                  <b>€{s.price}</b> p.p.
                </span>
              ) : null}{" "}
            </Link>
          </li>
        ))}
      </ul>{" "}
    </div>
  );
}

function WeekGroup({
  label,
  days,
  active,
}: {
  label: string;
  days: DayView[];
  active: FilterKey[];
}) {
  const any = days.some((d) => d.slots.some((s) => fits(s.keys, active)));
  if (!days.length) return null;
  return (
    <>
      <p className="cat-d-week" hidden={!any}>
        {label}
      </p>{" "}
      {days.map((d) => (
        <DayBlock key={d.isoDay} day={d} active={active} />
      ))}
    </>
  );
}

function Row({ row, hidden }: { row: RowView; hidden: boolean }) {
  return (
    <article className="cat-c-s" hidden={hidden}>
      {" "}
      <Link
        className="cat-c-s-img"
        href={row.href}
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image
          src={row.image}
          alt={row.imageAlt}
          width={1400}
          height={933}
          sizes={SIZES}
        />
      </Link>{" "}
      <div className="cat-c-s-info">
        {" "}
        <h3>
          <Link href={row.href}>{row.title}</Link>
        </h3>{" "}
        {row.where ? <p className="cat-c-s-waar">{row.where}</p> : null}{" "}
        <p className="cat-c-s-cijfers">
          <span className="rate">
            {row.rating ? (
              <>
                <span className="stars" aria-hidden="true">
                  ★
                </span>
                {row.rating} <small>({row.ratingCount})</small>
              </>
            ) : (
              <small>Nieuw, nog geen reviews</small>
            )}
          </span>
          {row.price ? (
            <span className="cat-c-s-prijs">
              <b>€{row.price}</b> per persoon
            </span>
          ) : null}
        </p>{" "}
      </div>{" "}
      <div className="cat-c-s-data">
        {" "}
        {row.slots.length ? (
          <ul className="cat-c-s-lijst">
            {row.slots.map((s) => (
              <li key={s.id}>
                <Link
                  className={`cat-c-s-rij cat-c-s--${s.stand}`}
                  href={s.href}
                >
                  {" "}
                  <span className="cat-c-s-wanneer">
                    <b>{s.day}</b> {s.start}
                  </span>{" "}
                  <Stand slot={s} cls="cat-c-s-stand" />{" "}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}{" "}
        {row.more > 0 ? (
          <Link className="cat-c-s-alle" href={row.href}>
            Nog {row.more} {row.more === 1 ? "datum" : "datums"}{" "}
            <svg width="15" height="15" aria-hidden="true">
              <use href="#i-arrow" />
            </svg>
          </Link>
        ) : (
          <span className="cat-c-s-alle cat-c-s-alle-stil">
            {row.slots.length
              ? "Dit zijn alle datums"
              : "Nog geen datums gepland"}
          </span>
        )}{" "}
      </div>{" "}
    </article>
  );
}

export function CatOffer({ offer }: { offer: OfferView }) {
  const [active, setActive] = useState<FilterKey[]>([]);
  const [last, setLast] = useState<FilterKey | null>(null);
  const [laterOpen, setLaterOpen] = useState(false);
  const [shown, setShown] = useState(PAGE);
  const [current, setCurrent] = useState<string | null>(null);
  const scrollTo = useRef<string | null>(null);

  const count = useCallback(
    (keys: FilterKey[]) => offer.rows.filter((r) => rowFits(r, keys)).length,
    [offer.rows],
  );

  const matching = offer.rows.filter((r) => rowFits(r, active));
  const nL = matching.length;
  const inView = offer.days.filter((d) => d.week < 2 || laterOpen);
  const nT = inView.reduce(
    (t, d) => t + d.slots.filter((s) => fits(s.keys, active)).length,
    0,
  );
  const nothing = nL === 0;
  const timelineEmpty = !offer.days.some((d) => d.week < 2);
  const hasLater = offer.days.some((d) => d.week === 2);
  const visibleIds = new Set(matching.slice(0, shown).map((r) => r.id));

  const cal = offer.calendar;
  let blame: FilterKey | null = null;
  if (nothing) {
    const cands = last && active.includes(last) ? [last, ...active] : active;
    blame = cands.find((c) => count(active.filter((k) => k !== c)) > 0) ?? null;
  }
  /* Werktekst: namen van de periodes uit de zoekbalk. */
  const periodLabel = (k: PeriodKey) =>
    k === "werkdag" ? "Doordeweeks" : `In ${cal.nextMonth.toLowerCase()}`;
  const labelOf = (k: FilterKey) =>
    CHIPS.find((c) => c.key === k)?.label ?? periodLabel(k as PeriodKey);
  const blameLabel = blame ? labelOf(blame) : null;
  const periods = PERIODS.filter((k) => active.includes(k));

  const goToDay = (iso: string) => {
    /* Geen datums op die dag (?dag= van de homepage): dan de eerstvolgende dag
       in de tijdlijn, zonder aria-current in de kalender. */
    const day = offer.days.find((d) => d.isoDay >= iso);
    if (!day) return;
    const id = `cat-d-d${day.isoDay}`;
    setCurrent(day.isoDay === iso ? id : null);
    const el = document.getElementById(id);
    if (day.week === 2 && !laterOpen) {
      setLaterOpen(true);
      scrollTo.current = id;
    } else if (el && !el.hidden) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const applyParams = (wanneer: string | null, dag: string | null) => {
    if (wanneer === "weekend")
      setActive((a) => (a.includes("weekend") ? a : [...a, "weekend"]));
    else if (wanneer === "doordeweeks")
      setActive((a) => (a.includes("werkdag") ? a : [...a, "werkdag"]));
    else if (wanneer === "volgende-maand")
      setActive((a) =>
        a.includes("volgendemaand") ? a : [...a, "volgendemaand"],
      );
    if (dag && /^\d{4}-\d{2}-\d{2}$/.test(dag)) goToDay(dag);
  };

  useEffect(() => {
    const id = scrollTo.current;
    if (!id) return;
    scrollTo.current = null;
    const el = document.getElementById(id);
    if (el && !el.hidden)
      el.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  const toggle = (key: FilterKey) => {
    const on = active.includes(key);
    setActive(on ? active.filter((k) => k !== key) : [...active, key]);
    if (!on) setLast(key);
  };
  const clear = () => {
    setActive([]);
    setLast(null);
  };

  const remaining = nL - Math.min(shown, nL);
  const filtered = active.length > 0;
  const showMore = filtered || remaining > 0;

  return (
    <div className="cat-d-aanbod">
      <Suspense fallback={null}>
        <UrlParams onParams={applyParams} />
      </Suspense>{" "}
      <div className="filterbar cat-d-filterbar">
        {" "}
        <div className="fchips" role="group" aria-label="Filters">
          {periods.map((k) => (
            <Fragment key={k}>
              {" "}
              <button
                type="button"
                className="fchip"
                aria-pressed="true"
                data-f={k}
                data-naam={periodLabel(k)}
                title="Filter weghalen"
                onClick={() => toggle(k)}
              >
                {periodLabel(k)}
                <span aria-hidden="true"> ×</span>
              </button>
            </Fragment>
          ))}
          {CHIPS.map((c) => {
            const pressed = active.includes(c.key);
            const zero = !pressed && count([...active, c.key]) === 0;
            return (
              <Fragment key={c.key}>
                {" "}
                <button
                  type="button"
                  className="fchip"
                  aria-pressed={pressed}
                  data-f={c.key}
                  data-naam={c.label}
                  onClick={() => toggle(c.key)}
                >
                  {c.label}
                  <span className="fnul" hidden={!zero}>
                    {" "}
                    (0)
                  </span>
                </button>
              </Fragment>
            );
          })}{" "}
        </div>{" "}
        <p className="fsort">
          <svg width="16" height="16" aria-hidden="true">
            <use href="#i-cal" />
          </svg>
          {"\n"}Op datum
        </p>{" "}
      </div>{" "}
      <div className="wrap">
        {" "}
        <div
          className="cat-d-leegfilter"
          id="cat-d-leegfilter"
          hidden={!nothing}
        >
          {" "}
          <h2>Met deze filters vinden we niets in {offer.placeName}</h2>{" "}
          <p id="cat-d-leegfilter-txt" aria-live="polite">
            {blameLabel
              ? `Met “${blameLabel}” erbij blijft er niets over. Haal dat filter weg, of wis alle filters.`
              : `Geen enkele ${offer.singular} past bij al deze filters tegelijk. Haal er een paar weg, of wis alle filters.`}
          </p>{" "}
          <button type="button" className="btn" id="cat-d-wis" onClick={clear}>
            Wis alle filters
          </button>{" "}
        </div>{" "}
      </div>{" "}
      <div className="van-b">
        {" "}
        <section
          className="wrap cat-d-agenda"
          id="cat-d-agenda"
          aria-labelledby="cat-d-agenda-kop"
          hidden={nothing}
        >
          {" "}
          <div className="cat-d-kop">
            {" "}
            <h2 id="cat-d-agenda-kop">De komende twee weken per dag</h2>{" "}
            <p>
              {offer.range}, op tijd van de dag. Klik een datum aan voor de
              workshop zelf, of kies een dag in de kalender.
            </p>{" "}
          </div>{" "}
          <aside
            className="cat-b-kal cat-d-kal"
            aria-label={`Kalender ${cal.title.toLowerCase()}`}
          >
            {" "}
            <div className="cat-b-kal-kop">
              {" "}
              <b>{cal.title}</b>{" "}
              <a href="#cat-d-lijst" className="cat-b-kal-volgende">
                {cal.nextMonth}{" "}
                <svg width="15" height="15" aria-hidden="true">
                  <use href="#i-arrow" />
                </svg>
              </a>{" "}
            </div>{" "}
            <div className="cat-b-kal-grid">
              {" "}
              {["ma", "di", "wo", "do", "vr", "za", "zo"].map((d) => (
                <span key={d} className="cat-b-wd" aria-hidden="true">
                  {d}
                </span>
              ))}{" "}
              {Array.from({ length: cal.blanks }, (_, i) => (
                <span
                  key={`b${i}`}
                  className="cat-b-blanco"
                  aria-hidden="true"
                ></span>
              ))}
              {cal.days.map((d) => {
                if (d.linked) {
                  const id = `cat-d-d${d.isoDay}`;
                  const n =
                    d.count === 1
                      ? `1 ${offer.singular}`
                      : `${d.count} ${offer.plural}`;
                  return (
                    <a
                      key={d.date}
                      className={`cat-b-d cat-b-d--met${d.kind === "vandaag" ? " cat-b-d--vandaag" : ""}`}
                      href={`#${id}`}
                      aria-label={`${d.date} ${cal.title.split(" ")[0]!.toLowerCase()}, ${n}`}
                      aria-current={current === id ? "date" : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        goToDay(d.isoDay);
                      }}
                    >
                      {d.date}
                    </a>
                  );
                }
                const cls =
                  d.kind === "voorbij"
                    ? "cat-b-d cat-b-d--voorbij"
                    : d.kind === "vandaag"
                      ? "cat-b-d cat-b-d--vandaag"
                      : "cat-b-d";
                return (
                  <span
                    key={d.date}
                    className={cls}
                    title={
                      d.kind === "vandaag"
                        ? `Vandaag, geen ${offer.plural}`
                        : undefined
                    }
                  >
                    {d.date}
                  </span>
                );
              })}{" "}
            </div>{" "}
            <p className="cat-b-kal-noot">
              <span className="cat-b-kal-stip" aria-hidden="true"></span> Er is
              die dag minstens een {offer.singular}
            </p>{" "}
          </aside>{" "}
          <div className="cat-d-dagen">
            {" "}
            <WeekGroup
              label="Deze week"
              days={offer.days.filter((d) => d.week === 0)}
              active={active}
            />
            <WeekGroup
              label="Volgende week"
              days={offer.days.filter((d) => d.week === 1)}
              active={active}
            />
            {hasLater ? (
              <div className="cat-d-later" id="cat-d-later" hidden={!laterOpen}>
                {" "}
                <WeekGroup
                  label={offer.laterLabel}
                  days={offer.days.filter((d) => d.week === 2)}
                  active={active}
                />
              </div>
            ) : null}{" "}
            <p
              className="cat-d-geen"
              id="cat-d-geen"
              hidden={nothing || nT > 0}
            >
              {timelineEmpty && !filtered
                ? "In deze twee weken staat er nog niets. In de lijst hieronder staan de latere datums per workshop."
                : "Met deze filters is er in deze dagen niets. In de lijst hieronder staan workshops die er later wel bij passen."}
            </p>{" "}
            <div className="cat-d-meer" id="cat-d-meer">
              {" "}
              <p id="cat-d-meer-txt">
                {laterOpen
                  ? `${offer.untilLater}. Latere datums staan per workshop hieronder.`
                  : offer.until}
              </p>{" "}
              {hasLater ? (
                <button
                  type="button"
                  className="btn btn-line"
                  id="cat-d-meerknop"
                  hidden={laterOpen}
                  onClick={() => setLaterOpen(true)}
                >
                  Toon de week erna
                </button>
              ) : null}{" "}
            </div>{" "}
          </div>{" "}
          <div className="cat-d-legenda">
            {" "}
            <h3>Zo lees je een datum</h3>{" "}
            <ul>
              {" "}
              <li>
                <span className="cat-d-stand cat-d-r--door">
                  <b>
                    <Check />
                    {"\n"}Gaat door
                  </b>
                </span>
                <span>
                  Het minimum is gehaald, of er is geen minimum. Hij gaat zeker
                  door, ook als er daarna iemand afhaakt.
                </span>
              </li>{" "}
              <li>
                <span className="cat-d-stand cat-d-r--open">
                  <b>3 van 4 nodig</b>
                </span>
                <span>
                  Drie aangemeld, minimum vier. Je kunt je gewoon aanmelden;
                  uiterlijk op het beslismoment hoor je of hij doorgaat.
                </span>
              </li>{" "}
              <li>
                <span className="cat-d-stand cat-d-r--vol">
                  <b>Vol</b>
                </span>
                <span>
                  Alle plekken zijn bezet. De volgende datum staat erbij.
                </span>
              </li>{" "}
            </ul>{" "}
            <p>
              Gaat een datum niet door, dan krijg je een andere datum
              aangeboden.
            </p>{" "}
          </div>{" "}
        </section>{" "}
      </div>{" "}
      <div className="van-c">
        {" "}
        <section
          className="wrap cat-d-lijst"
          id="cat-d-lijst"
          aria-labelledby="cat-d-lijst-kop"
          hidden={nothing}
        >
          {" "}
          <div className="cat-d-kop">
            {" "}
            <h2 id="cat-d-lijst-kop">{offer.listHeading}</h2>{" "}
            <p>
              <b>{offer.rows.length}</b>{" "}
              {offer.rows.length === 1 ? "workshop" : "workshops"}, de
              eerstvolgende datum bovenaan. Per workshop zie je zijn eerste drie
              datums met de stand.
            </p>{" "}
          </div>{" "}
          <div className="cat-c-rijen" id="cat-d-rijen">
            {" "}
            {offer.rows.map((r) => (
              <Row key={r.id} row={r} hidden={!visibleIds.has(r.id)} />
            ))}{" "}
          </div>{" "}
          {showMore ? (
            <div className="cat-c-meer" id="cat-d-lijstmeer">
              {" "}
              <p aria-live="polite">
                {filtered
                  ? `${nL === 1 ? "1 workshop" : `${nL} workshops`} met je filters`
                  : `${Math.min(shown, nL)} van de ${nL} getoond`}
              </p>{" "}
              {remaining > 0 ? (
                <button
                  type="button"
                  className="btn btn-line"
                  onClick={() => setShown(shown + PAGE)}
                >
                  Toon de volgende {Math.min(PAGE, remaining)}
                </button>
              ) : null}{" "}
            </div>
          ) : null}{" "}
        </section>{" "}
      </div>{" "}
    </div>
  );
}
