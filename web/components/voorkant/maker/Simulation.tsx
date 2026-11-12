"use client";

import Image from "next/image";
import { useState } from "react";

const SIZES = "(max-width: 860px) 100vw, 50vw";
const MAX = 8;
const MIN = 4;
const START = 3;
const BESLIS = "beslismoment vr 11 dec, 22:00";

type Sim = { n: number; door: boolean; voorbij: boolean; regel: string };
const INIT: Sim = { n: START, door: false, voorbij: false, regel: "" };

function view({ n, door, voorbij, regel }: Sim): { tekst: string; klasse: string; uitleg: string } {
  if (voorbij && !door) {
    return { tekst: "Gaat niet door", klasse: "maker-stand-niet", uitleg: "Het minimum is niet gehaald vóór het beslismoment. Je deelnemers krijgen een andere datum aangeboden." };
  }
  if (n >= MAX) return { tekst: "Vol", klasse: "maker-stand-vol", uitleg: "Alle acht plekken zijn bezet." };
  if (door) {
    const rest = MAX - n;
    return { tekst: `Gaat door, nog ${rest}${rest === 1 ? " plek" : " plekken"}`, klasse: "maker-stand-door", uitleg: regel || "Het minimum is gehaald. Iedereen krijgt bericht dat het doorgaat." };
  }
  const nodig = MIN - n;
  return {
    tekst: `${n} van ${MIN} nodig, ${BESLIS}`,
    klasse: "maker-stand-open",
    uitleg: voorbij ? "" : `Nog ${nodig === 1 ? "één aanmelding" : `${nodig} aanmeldingen`} en je workshop gaat door. Deelnemers kunnen de sessie delen.`,
  };
}

/* Klikbare sessie met de vier standen (ontwerpscript #p-maker): plekken
   aanmelden of afmelden, beslismoment laten verlopen. "Gaat door" blijft
   staan zodra het minimum een keer is gehaald. Alles is voorbeelddata. */
export function Simulation() {
  const [sim, setSim] = useState<Sim>(INIT);
  const step = (next: (s: Sim) => Sim) =>
    setSim((s) => {
      const r = next(s);
      return { ...r, door: r.door || r.n >= MIN };
    });
  const { tekst, klasse, uitleg } = view(sim);
  const locked = sim.voorbij && !sim.door;

  return (
    <div className="maker-b-sim maker-d-sim">{" "}<div className="maker-b-sim-paneel">{" "}<h3>Zo heb je deze datum ingesteld</h3>
{" "}<dl className="maker-b-sim-instel">{" "}<div><dt>Maximum</dt><dd>8 plekken</dd></div>
{" "}<div><dt>Minimum</dt><dd>door bij 4</dd></div>
{" "}<div><dt>Beslismoment</dt><dd>vr 11 dec, 22:00</dd></div>
{" "}</dl>
{" "}<div className="maker-b-sim-knoppen">{" "}<button className="btn btn-sm" type="button" disabled={sim.n >= MAX || locked} onClick={() => step((s) => (s.n < MAX ? { ...s, n: s.n + 1, regel: "" } : s))}>Iemand meldt zich aan</button>{" "}<button className="btn btn-sm btn-line" type="button" disabled={sim.n <= 0 || locked} onClick={() => step((s) => (s.n > 0 ? { ...s, n: s.n - 1, regel: s.door ? "Gaat door blijft door, ook nu er iemand afhaakt." : "" } : s))}>Iemand haakt af</button>{" "}<button className="btn btn-sm btn-line" type="button" disabled={sim.voorbij} onClick={() => step((s) => ({ ...s, voorbij: true, regel: s.door ? "Het beslismoment is voorbij en het minimum was gehaald: je workshop gaat door." : "" }))}>Het beslismoment is voorbij</button>{" "}<button className="maker-b-reset" type="button" onClick={() => setSim(INIT)}>Opnieuw</button>{" "}</div>
{" "}<p className="maker-b-sim-uitleg" aria-live="polite">{uitleg}</p>
{" "}</div>
{" "}<div className="maker-b-sim-kaart">{" "}<div className="wk">{" "}<div className="wk-img"><Image src="/img/cat-pasta.jpg" alt="Verse pasta komt in lange slierten uit een pastamachine" width={1400} height={933} sizes={SIZES} /></div>
{" "}<div className="wk-body">{" "}<p className="maker-b-sim-datum">za 12 dec, 15:00 · Utrecht, Wittevrouwen</p>
{" "}<h3>Italiaans koken met Luca: verse pasta</h3>
{" "}<div className="maker-b-plekken" aria-hidden="true">{" "}{Array.from({ length: MAX }, (_, i) => <i key={i} className={i < sim.n ? "is-bezet" : i < MIN ? "is-n" : undefined}></i>)}{" "}</div>
{" "}<p className="maker-b-plekken-noot"><span className="maker-b-teller">{sim.n}</span>{" "}van 8 plekken bezet, minimum 4</p>
{" "}<div className="wk-foot">{" "}<span className={`maker-b-status ${klasse}`}>{tekst}</span>{" "}<div className="wk-price"><small>per persoon</small><b>€45</b></div>
{" "}</div>
{" "}</div>
{" "}</div>
{" "}</div>
{" "}<dl className="maker-b-standen">{" "}<div><dt><span className="maker-b-pil maker-stand-open">3 van 4 nodig</span></dt><dd>Het minimum is nog niet gehaald. Deelnemers zien hoeveel er nog nodig zijn en tot wanneer.</dd></div>
{" "}<div><dt><span className="maker-b-pil maker-stand-door">Gaat door</span></dt><dd>Minimum gehaald, of geen minimum ingesteld. Dit blijft zo, ook als iemand afhaakt.</dd></div>
{" "}<div><dt><span className="maker-b-pil maker-stand-niet">Gaat niet door</span></dt><dd>Minimum niet gehaald voor het beslismoment. Je deelnemers krijgen een andere datum aangeboden.</dd></div>
{" "}<div><dt><span className="maker-b-pil maker-stand-vol">Vol</span></dt><dd>Alle plekken zijn bezet.</dd></div>
{" "}</dl>
{" "}</div>
  );
}
