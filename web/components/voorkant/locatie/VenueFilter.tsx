"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useState } from "react";
import { routes } from "@/lib/routes";
import { WeekTable } from "./WeekTable";
import { venueAnchor, type VenueCard } from "./venues";

const SIZES = "(max-width: 860px) 100vw, 50vw";

type Soort = "alles" | "keuken" | "atelier" | "zaal";
type Dag = "alles" | "week" | "weekend";
type State = { soort: Soort; dag: Dag };

const SOORT: { value: Soort; label: string }[] = [
  { value: "alles", label: "Alle ruimtes" },
  { value: "keuken", label: "Met keuken" },
  { value: "atelier", label: "Atelier" },
  { value: "zaal", label: "Zaal, café of lokaal" },
];
const DAG: { value: Dag; label: string }[] = [
  { value: "alles", label: "Alle dagen" },
  { value: "week", label: "Doordeweeks vrij" },
  { value: "weekend", label: "In het weekend vrij" },
];

function fits(v: VenueCard, soort: Soort, dag: Dag): boolean {
  if (soort === "keuken" && !v.hasKitchen) return false;
  if (soort !== "keuken" && soort !== "alles" && v.sort !== soort) return false;
  if (dag === "week") return v.week;
  if (dag === "weekend") return v.weekend;
  return true;
}

/* Filter op soort ruimte en dag (ontwerpscript #p-locatie): elke chip toont
   hoeveel ruimtes er overblijven in combinatie met het andere filter; een
   combinatie zonder resultaat is uitgegrijsd en niet te kiezen. */
export function VenueFilter({ venues }: { venues: VenueCard[] }) {
  const [state, setState] = useState<State>({ soort: "alles", dag: "alles" });
  const count = (soort: Soort, dag: Dag) => venues.filter((v) => fits(v, soort, dag)).length;
  const n = count(state.soort, state.dag);
  const active = state.soort !== "alles" || state.dag !== "alles";
  const wis = () => setState({ soort: "alles", dag: "alles" });

  const chip = <G extends keyof State>(groep: G, value: State[G], label: string) => {
    const on = state[groep] === value;
    const aantal = groep === "soort" ? count(value as Soort, state.dag) : count(state.soort, value as Dag);
    const nul = aantal === 0 && !on;
    return (
      <button
        type="button"
        className={nul ? "fchip is-nul" : "fchip"}
        aria-pressed={on}
        aria-disabled={nul}
        onClick={() => {
          if (nul) return;
          setState((s) => ({ ...s, [groep]: value }));
        }}
      >
        {label} ({aantal})
      </button>
    );
  };

  return (
    <>
      <div className="locatie-d-filter" role="group" aria-label="Filter de ruimtes">{" "}<div className="locatie-d-groep" role="group" aria-label="Soort ruimte">{" "}<span className="locatie-d-groepnaam">Soort ruimte</span>{" "}<div className="locatie-chips">{" "}{SOORT.map((s) => <Fragment key={s.value}>{chip("soort", s.value, s.label)}{" "}</Fragment>)}</div>
{" "}</div>
{" "}<div className="locatie-d-groep" role="group" aria-label="Dag">{" "}<span className="locatie-d-groepnaam">Dag</span>{" "}<div className="locatie-chips">{" "}{DAG.map((d) => <Fragment key={d.value}>{chip("dag", d.value, d.label)}{" "}</Fragment>)}</div>
{" "}</div>
{" "}<p className="locatie-d-teller" aria-live="polite"><b>{n}</b>{" "}van {venues.length} {venues.length === 1 ? "ruimte" : "ruimtes"}{" "}<button type="button" className="locatie-d-wis" hidden={!active} onClick={wis}>Wis filters</button></p>
{" "}</div>
{" "}<div className="locatie-a-raster">{" "}{venues.map((v) => (
        <article key={v.id} id={venueAnchor(v.id)} className="locatie-a-ruimte" hidden={!fits(v, state.soort, state.dag)}>{" "}<figure><Image src={v.image.src} alt={v.image.alt} width={v.image.width} height={v.image.height} sizes={SIZES} /></figure>
{" "}<div className="locatie-a-ruimte-in">{" "}<p className="locatie-a-plaats"><svg width="14" height="14" aria-hidden="true"><use href="#i-pin" /></svg>
{v.placeLabel}</p>
{" "}<h3>{v.name}</h3>
{" "}<ul className="locatie-feit">{v.capacity ? <li><svg width="14" height="14" aria-hidden="true"><use href="#i-people" /></svg>
Tot {v.capacity} plekken</li> : null}
{v.hasKitchen ? <li className="is-ja">Met keuken</li> : <li className="is-nee">Geen keuken</li>}
</ul>
{" "}{v.amenities.length ? <ul className="locatie-d-voorz">{v.amenities.map((a) => <li key={a}>{a}</li>)}</ul> : null}
{" "}<div className="locatie-d-voet">{" "}<WeekTable free={v.free} prefix="locatie-d" />
{" "}<Link className="btn btn-sm btn-line" href={routes.contact}>Neem contact op met de eigenaar</Link>{" "}</div>
{" "}</div>
{" "}</article>
      ))}</div>
{" "}<p className="locatie-d-leeg" hidden={n > 0}>Geen ruimte met deze combinatie.{" "}<button type="button" className="locatie-d-wis" onClick={wis}>Wis alle filters</button>{" "}of{" "}<a href="#locatie-a-zoek">laat ons team meezoeken</a>.</p>
    </>
  );
}
