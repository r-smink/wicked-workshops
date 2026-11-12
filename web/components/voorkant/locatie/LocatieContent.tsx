import Link from "next/link";
import Image from "next/image";
import { routes } from "@/lib/routes";
import { VenueFilter } from "./VenueFilter";
import { VenueForms } from "./VenueForms";
import type { VenueCard } from "./venues";

const SIZES = "(max-width: 860px) 100vw, 50vw";

/* Vragen onderaan de pagina, ook voor de FAQPage-JSON-LD. */
export const LOCATIE_FAQ = [
  { question: "Wat kost een ruimte?", answer: "Vraag het de eigenaar als je contact opneemt." },
  { question: "Wie is aansprakelijk als er iets kapotgaat?", answer: "Spreek dat met de eigenaar af voordat de eerste workshop plaatsvindt." },
  { question: "En als een workshop niet doorgaat?", answer: "Spreek vooraf met de eigenaar af wat er dan met de huur gebeurt." },
  /* Werktekst, wordt nog uitgewerkt */
  { question: "Wat kost een advertentie voor mijn ruimte?", answer: "Als eigenaar betaal je straks een vaste fee om je ruimte te laten zien. Hoe hoog die is, en of hij tijdens de pilot geldt, staat nog niet vast. Je hoort het voordat je iets betaalt." },
  { question: "Heb ik als eigenaar een account nodig?", answer: "Je meldt je ruimte aan met je e-mailadres. Of eigenaren daarna een account krijgen, staat nog niet vast." },
];
const WERKTEKST_FAQ = 3;

/* /ruimte-gezocht, ontwerp #p-locatie. venues leeg = lege staat (geen
   ruimtes, of Locatie gezocht staat uit via platform_settings.feature_venues). */
export function LocatieContent({ venues }: { venues: VenueCard[] }) {
  return (
    <>
<div className="van-a">{" "}<nav className="kruimel wrap" aria-label="Kruimelpad"><Link href={routes.home}>Home</Link><span>/</span><Link href={routes.giver}>Word workshopgever</Link><span>/</span><span aria-current="page">Locatie gezocht</span></nav>
{" "}</div>
{" "}{" "}<div className="van-a">{" "}<section className="locatie-a-hero">{" "}<div className="locatie-a-kop">{" "}<h1>Ruimte zoeken of ruimte bieden</h1>
{" "}<p>Eigenaren zetten hier hun keuken, atelier of zaal neer als die vaak leeg staat. Workshopgevers zien wat er is en wanneer, en nemen zelf contact op met de eigenaar.</p>
{" "}</div>
{" "}<div className="locatie-a-deuren">{" "}<a className="locatie-a-deur locatie-a-deur-zoek" href="#locatie-a-ruimtes">{" "}<figure><Image priority src="/img/locatie-keuken.jpg" alt="Een houten keuken met kookeiland en witte krukken" width={1050} height={1575} sizes={SIZES} /></figure>
{" "}<div className="locatie-a-deur-txt">{" "}<h2>Je zoekt een ruimte</h2>
{" "}<p>Je hebt een workshop, maar geen keuken, atelier of zaal. Kijk welke ruimtes vaak leeg staan en neem contact op met de eigenaar.</p>
{" "}<span className="locatie-a-deur-link">Bekijk de ruimtes{" "}<svg width="18" height="18" aria-hidden="true"><use href="#i-arrow" /></svg>
</span>{" "}</div>
{" "}</a>{" "}<a className="locatie-a-deur locatie-a-deur-bied" href="#locatie-a-bied">{" "}<figure><Image priority src="/img/locatie-hal.jpg" alt="Een lege hal met lange houten tafels en banken" width={994} height={933} sizes={SIZES} /></figure>
{" "}<div className="locatie-a-deur-txt">{" "}<h2>Je hebt een ruimte die leeg staat</h2>
{" "}<p>Een keuken die maandag dicht is, een atelier dat 's avonds leeg is. Zet hem erbij, dan zien workshopgevers hem en nemen ze zelf contact met je op.</p>
{" "}<span className="locatie-a-deur-link">Meld je ruimte aan{" "}<svg width="18" height="18" aria-hidden="true"><use href="#i-arrow" /></svg>
</span>{" "}</div>
{" "}</a>{" "}</div>
{" "}</section>
{" "}</div>
{" "}{" "}<div className="van-a">{" "}<section className="sec locatie-a-rolsec">{" "}<div className="wrap locatie-a-rol">{" "}<div className="locatie-a-rol-txt">{" "}<h2>Wat je op de site ziet en wat je met de eigenaar regelt</h2>
{" "}<p>Wicked Workshops is een plek om ruimtes te vinden. Huur, betaling, sleutel, schoonmaak, annuleren en aansprakelijkheid regel je rechtstreeks met de eigenaar; Wicked Workshops is daar geen partij in.</p>
{" "}</div>
{" "}<div className="locatie-a-rol-tabel">{" "}<div>{" "}<h3>Op de site</h3>
{" "}<ul>{" "}<li>Foto's van de ruimte en wat er is</li>
{" "}<li>Hoeveel mensen erin passen</li>
{" "}<li>Op welke dagdelen hij vaak vrij is</li>
{" "}<li>Een knop om contact op te nemen met de eigenaar</li>
{" "}</ul>
{" "}</div>
{" "}<div>{" "}<h3>Tussen jou en de eigenaar</h3>
{" "}<ul>{" "}<li>Huur en betaling</li>
{" "}<li>De sleutel en de schoonmaak</li>
{" "}<li>Wat er gebeurt als je annuleert</li>
{" "}<li>Wie aansprakelijk is als er iets kapotgaat</li>
{" "}</ul>
{" "}</div>
{" "}</div>
{" "}</div>
{" "}</section>
{" "}</div>
{" "}{" "}<div className="van-a">{" "}<section className="sec on-tint locatie-a-ruimtesec" id="locatie-a-ruimtes">{" "}<div className="wrap">{" "}<div className="sec-head">{" "}<div>{" "}<h2>Ruimtes die vaak leeg staan</h2>
{" "}<p>Filter op soort ruimte en op dag. In het schema van elke ruimte is paars een dagdeel waarop hij vaak vrij is.</p>
{" "}</div>
{" "}</div>
{" "}{venues.length ? <VenueFilter venues={venues} /> : <p className="locatie-d-leeg">Er staan op dit moment nog geen ruimtes op de site.{" "}<a href="#locatie-a-zoek">Laat ons team meezoeken</a>{" "}of{" "}<a href="#locatie-a-bied">meld je eigen ruimte aan</a>.</p>}
{" "}</div>
{" "}</section>
{" "}</div>
{" "}{" "}<div className="van-a">{" "}<section className="sec locatie-a-formsec">{" "}<div className="wrap">{" "}<div className="sec-head">{" "}<div>{" "}<h2>Niets dat past, of heb je zelf een ruimte?</h2>
{" "}</div>
{" "}</div>
{" "}<VenueForms />
{" "}</div>
{" "}</section>
{" "}</div>
{" "}{" "}<div className="van-a">{" "}<section className="sec on-tint locatie-a-faqsec">{" "}<div className="wrap locatie-a-faq">{" "}<div>{" "}<h2>Vragen over huur en aansprakelijkheid</h2>
{" "}<p>Staat je vraag er niet bij? Kijk op de{" "}<Link href={routes.help}>hulppagina</Link>{" "}of{" "}<Link href={routes.contact}>stuur ons een bericht</Link>.</p>
{" "}</div>
{" "}<div className="faq">{" "}{LOCATIE_FAQ.map((f, i) => (
<details key={f.question}><summary>{f.question}</summary><p>{f.answer}{i === WERKTEKST_FAQ ? <>{" "}<span className="demo-flag"><svg width="13" height="13" aria-hidden="true"><use href="#i-shield" /></svg>
Werktekst, wordt nog uitgewerkt</span></> : null}</p>
</details>
))}{" "}</div>
{" "}</div>
{" "}</section>
{" "}</div>

    </>
  );
}
