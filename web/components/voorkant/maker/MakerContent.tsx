import Link from "next/link";
import Image from "next/image";
import { routes } from "@/lib/routes";
import { WeekTable } from "../locatie/WeekTable";
import { venueAnchor, type VenueCard } from "../locatie/venues";
import { Simulation } from "./Simulation";
import { StartForm } from "./StartForm";
import "./maker.css";

const SIZES = "(max-width: 860px) 100vw, 50vw";

/* Werktekst: label bij een workshop van een particulier. */
const LABEL_PARTICULIER = "Deze workshop wordt aangeboden door een particulier. Het consumentenrecht geldt niet.";

/* Vragen onderaan de pagina, ook voor de FAQPage-JSON-LD. */
export const MAKER_FAQ = [
  { question: "Heb ik een btw-nummer of eigen bedrijf nodig?", answer: "Nee. Je kunt ook als particulier workshops geven. Deelnemers zien bij je workshop dat je particulier bent. Of je particulier of ondernemer bent, geef je pas op in je aanbiedersverklaring, als je workshop klaarstaat." },
  { question: "Wat gebeurt er als ik zelf moet annuleren?", answer: "Bij de meeste workshops krijgen je deelnemers dan alles terug, plus een andere datum. Tijdens de pilot betalen deelnemers niets, dus er hoeft niets terug." },
  { question: "Kan ik mijn workshop eerst als concept opslaan?", answer: "Ja. Ons team kijkt pas mee als je hem indient voor de check, niet eerder." },
];

/* /workshops-geven, ontwerp #p-maker. Statische kopij uit het ontwerp; de
   ruimtes komen uit venue_listings (leeg = lege staat), de simulatie en het
   startformulier zijn client components. */
export function MakerContent({ venues, social }: { venues: VenueCard[]; social: boolean }) {
  return (
    <>
<div className="van-a">{" "}<nav className="kruimel wrap" aria-label="Kruimelpad"><Link href={routes.home}>Home</Link><span>/</span><span aria-current="page">Word workshopgever</span></nav>
{" "}</div>
{" "}{" "}<div className="van-a">{" "}<section className="maker-a-hero">{" "}<div className="maker-a-hero-txt">{" "}<h1>Geef je eerste workshop, ook zonder eigen bedrijf</h1>
{" "}<p className="maker-a-lead">Je hebt geen btw-nummer nodig om te beginnen. Je maakt een account met alleen je e-mailadres en zet je workshop klaar in zes stappen.</p>
{" "}<div className="maker-a-knoppen">{" "}<a className="btn" href="#maker-a-start">Begin met je e-mailadres{" "}<svg width="18" height="18" aria-hidden="true"><use href="#i-arrow" /></svg>
</a>{" "}<a className="tlink" href="#maker-a-pad">Eerst lezen hoe het werkt{" "}<svg width="16" height="16" aria-hidden="true"><use href="#i-chev" /></svg>
</a>{" "}</div>
{" "}<ul className="maker-a-feiten">{" "}<li><svg width="18" height="18" aria-hidden="true"><use href="#i-zero" /></svg>
Geen vaste kosten</li>
{" "}<li><svg width="18" height="18" aria-hidden="true"><use href="#i-hand" /></svg>
Ook als particulier</li>
{" "}<li><svg width="18" height="18" aria-hidden="true"><use href="#i-shield" /></svg>
Check door ons team vóór livegang</li>
{" "}</ul>
{" "}</div>
{" "}<figure className="maker-a-hero-beeld">{" "}<Image priority src="/img/maker-les.jpg" alt="Een workshopgever legt met een deegroller in de hand iets uit aan een tafel met klei en gereedschap" width={1050} height={1575} sizes={SIZES} />{" "}</figure>
{" "}</section>
{" "}</div>
{" "}{" "}<div className="van-a">{" "}<section className="sec">{" "}<div className="wrap maker-a-wie">{" "}<figure className="maker-a-wie-beeld"><Image src="/img/maker-glas.jpg" alt="Een maker werkt aan glas in lood aan een volle werktafel" width={1400} height={934} sizes={SIZES} /></figure>
{" "}<div className="maker-a-wie-txt">{" "}<h2>Workshops geven met of zonder bedrijf</h2>
{" "}<p>Geef je op zaterdag les aan je keukentafel, dan meld je je op dezelfde manier aan als iemand met een eigen studio. Het verschil zit in wat deelnemers bij je workshop lezen en wat je in je aanbiedersverklaring invult.</p>
{" "}<div className="maker-a-vergelijk">{" "}<div>{" "}<h3>Je hebt een bedrijf</h3>
{" "}<p>Bij je workshop staat dat je als{" "}<b>ondernemer</b>{" "}aanbiedt. In je aanbiedersverklaring vul je je KvK-nummer en handelsnaam in.</p>
{" "}</div>
{" "}<div>{" "}<h3>Je hebt geen bedrijf</h3>
{" "}<p>Bij je workshop staat dat je als{" "}<b>particulier</b>{" "}aanbiedt, met de melding dat het consumentenrecht dan niet geldt. KvK-gegevens heb je niet nodig.</p>
{" "}</div>
{" "}</div>
{" "}<div className="maker-a-label" aria-label="Zo ziet het label eruit op je workshoppagina">{" "}<span className="maker-a-label-av">S</span>{" "}<div><b>Sanne, particulier</b><small>{LABEL_PARTICULIER}</small></div>
{" "}<span className="maker-a-label-noot">Werktekst</span>{" "}</div>
{" "}<p className="maker-a-klein">Met of zonder bedrijf: je workshop gaat langs dezelfde check.</p>
{" "}</div>
{" "}</div>
{" "}</section>
{" "}</div>
{" "}{" "}<div className="van-a">{" "}<section className="sec on-tint maker-a-padsec" id="maker-a-pad">{" "}<div className="wrap">{" "}<div className="sec-head"><div><h2>Van idee tot je eerste datum</h2>
<p>Zes stappen in de wizard, en de gevoelige gegevens pas als je workshop klaarstaat.</p>
</div>
</div>
{" "}<div className="maker-a-padgrid">{" "}<ol className="maker-a-rail">{" "}<li className="is-eerst">{" "}<h3>Maak een account met je e-mailadres</h3>
{" "}<p>Meer hebben we in het begin niet nodig. Inloggen met een social account kan ook.</p>
{" "}</li>
{" "}<li>{" "}<h3>Stel je workshop op in zes stappen</h3>
{" "}<p>Je kunt tussendoor stoppen en je workshop als concept opslaan.</p>
{" "}<ul className="maker-a-stappen" aria-label="De zes stappen van de wizard">{" "}<li><b>Basis</b>titel, categorie, plaats</li>
{" "}<li><b>Inhoud</b>wat je doet en wat erbij zit</li>
{" "}<li><b>Praktisch</b>duur, plek en taal</li>
{" "}<li><b>Beeld</b>één tot zes foto's</li>
{" "}<li><b>Prijs</b>en je annuleervoorwaarden</li>
{" "}<li><b>Datums</b>plekken, minimum, beslismoment</li>
{" "}</ul>
{" "}</li>
{" "}<li>{" "}<h3>Heb je zelf een locatie, of heb je er een nodig?</h3>
{" "}<p>Die vraag stellen we in de wizard. Geen eigen ruimte? Een eindje verderop op deze pagina staan een paar ruimtes die vaak leeg staan, en je neemt zelf contact op met de eigenaar.</p>
{" "}<a className="tlink" href="#maker-d-ruimtes">Bekijk de ruimtes{" "}<svg width="16" height="16" aria-hidden="true"><use href="#i-chev" /></svg>
</a>{" "}</li>
{" "}<li>{" "}<h3>Pas daarna je aanbiedersverklaring</h3>
{" "}<p>Staat je workshop klaar, dan vragen we wie je bent en waar je voor tekent. Niet eerder.</p>
{" "}<ul className="maker-a-verklaring">{" "}<li>Je naam, geboortedatum, adres, telefoonnummer en e-mailadres</li>
{" "}<li>Of je particulier bent of ondernemer, en als ondernemer je KvK-nummer en handelsnaam</li>
{" "}<li>Dat je 18 jaar of ouder bent</li>
{" "}<li>Dat je zorgt voor een veilige workshop, met je kwalificaties als die ertoe doen</li>
{" "}<li>Je rekeningnummer (IBAN)</li>
{" "}<li>Dat je incidenten aan ons meldt</li>
{" "}</ul>
{" "}</li>
{" "}<li>{" "}<h3>Ons team kijkt mee</h3>
{" "}<p>Ons team bekijkt elke workshop voordat hij online gaat. Hoe die check precies loopt, werken we nog uit.</p>
{" "}</li>
{" "}<li className="is-laatst">{" "}<h3>Je workshop staat online</h3>
{" "}<p>Deelnemers zien je datums, en jij ziet wie zich aanmeldt.</p>
{" "}</li>
{" "}</ol>
{" "}<figure className="maker-a-padbeeld"><Image src="/img/maker-draaischijf.jpg" alt="Een oudere pottenbakker begeleidt een jonge vrouw aan de draaischijf in zijn atelier" width={1400} height={788} sizes={SIZES} /></figure>
{" "}</div>
{" "}</div>
{" "}</section>
{" "}</div>
{" "}{" "}<div className="van-a">{" "}<section className="sec">{" "}<div className="wrap maker-a-kost">{" "}<div className="maker-a-kost-txt">{" "}<h2>Je betaalt alleen als er geboekt wordt</h2>
{" "}<p>Geen abonnement en geen vaste kosten. Over wat je verkoopt, betaal je commissie. Die verschilt per categorie, tussen negen en twintig procent. Hoe meer concurrentie er in een categorie is op de hele markt, en hoe meer het promoten ervan kost, hoe hoger hij ligt.</p>
{" "}<ul className="maker-a-vink">{" "}<li><svg width="18" height="18" aria-hidden="true"><use href="#i-check" /></svg>
Deelnemers betalen €0 boekingskosten, altijd</li>
{" "}<li><svg width="18" height="18" aria-hidden="true"><use href="#i-check" /></svg>
Je geld krijg je na afloop van de workshop, zodra betalen via de site start</li>
{" "}</ul>
{" "}<div className="maker-a-pilot">{" "}<h3>Wat kost het nu?</h3>
{" "}<p>Tijdens de pilot betaal je niets. Betalen via de site kan op zijn vroegst vanaf januari 2027. Deelnemers doen gratis mee, dus er is ook niets om uit te betalen.</p>
{" "}</div>
{" "}</div>
{" "}<div className="maker-a-som">{" "}<h3>Rekenvoorbeeld: wie betaalt wat</h3>
{" "}<p className="maker-a-som-in">Een workshop van{" "}<b>€45</b>{" "}per persoon, met{" "}<b>acht</b>{" "}deelnemers</p>
{" "}<dl className="maker-d-deeln">{" "}<div><dt>Elke deelnemer betaalt</dt><dd>€45</dd></div>
{" "}<div><dt>Boekingskosten voor de deelnemer</dt><dd>€0</dd></div>
{" "}</dl>
{" "}<p className="maker-a-som-totaal"><span>Samen betalen de deelnemers</span><b>€360</b></p>
{" "}<div className="maker-a-balk" aria-hidden="true">{" "}<span className="maker-a-balk-jij"></span><span className="maker-a-balk-band"></span><span className="maker-a-balk-rest"></span>{" "}</div>
{" "}<dl className="maker-a-som-rij">{" "}<div><dt>Jij houdt over</dt><dd>€288 tot €327,60</dd></div>
{" "}<div><dt>Commissie, 9 tot 20 procent</dt><dd>€32,40 tot €72</dd></div>
{" "}<div><dt>Vaste kosten</dt><dd>€0</dd></div>
{" "}</dl>
{" "}<p className="demo-flag"><svg width="13" height="13" aria-hidden="true"><use href="#i-shield" /></svg>
{" "}Rekenvoorbeeld, prijs en aantal zijn voorbeelddata</p>
{" "}</div>
{" "}</div>
{" "}</section>
{" "}</div>
{" "}{" "}<div className="van-a">{" "}<section className="sec on-tint maker-d-drempelsec">{" "}<div className="wrap">{" "}<div className="sec-head"><div><h2>Jij bepaalt wanneer je workshop doorgaat</h2>
<p>Per datum zet je een maximum, en als je wilt een minimum en een beslismoment. Probeer het zelf: meld deelnemers aan of af en kijk wat je deelnemers op de kaart zien.</p>
</div>
</div>
{" "}<div className="van-b">{" "}<Simulation />
{" "}</div>
{" "}<p className="maker-d-bijna"><b>Bijna?</b>{" "}Je krijgt een herinnering vóór het beslismoment, en deelnemers kunnen de sessie delen om zelf mensen mee te nemen.</p>
{" "}<p className="demo-flag"><svg width="13" height="13" aria-hidden="true"><use href="#i-shield" /></svg>
{" "}Workshop, datums en aanmeldingen zijn voorbeelddata</p>
{" "}</div>
{" "}</section>
{" "}</div>
{" "}{" "}<section className="sec maker-d-ruimtesec" id="maker-d-ruimtes">{" "}<div className="wrap">{" "}<div className="sec-head">{" "}<div>{" "}<h2>Geen eigen ruimte? Dit zijn ruimtes die vaak leeg staan</h2>
{" "}<p>Eigenaren van keukens, ateliers en zalen zetten hun ruimte op locatie gezocht. Je ziet wat er is en wanneer hij vrij is, en neemt zelf contact op met de eigenaar. In het schema is paars een dagdeel waarop de ruimte vaak vrij is.</p>
{" "}</div>
{" "}<Link className="btn btn-line" href={routes.room}>Bekijk alle ruimtes{" "}<svg width="18" height="18" aria-hidden="true"><use href="#i-arrow" /></svg>
</Link>{" "}</div>
{" "}{venues.length ? <div className="maker-d-raster">{" "}{venues.map((v) => (
<article key={v.id} className="maker-d-ruimte">{" "}<figure><Image src={v.image.src} alt={v.image.alt} width={v.image.width} height={v.image.height} sizes={SIZES} /></figure>
{" "}<div className="maker-d-ruimte-in">{" "}<p className="maker-d-plaats"><svg width="14" height="14" aria-hidden="true"><use href="#i-pin" /></svg>
{v.placeLabel}</p>
{" "}<h3>{v.name}</h3>
{" "}<ul className="maker-d-feit">{v.capacity ? <li><svg width="14" height="14" aria-hidden="true"><use href="#i-people" /></svg>
Tot {v.capacity} plekken</li> : null}
{v.hasKitchen ? <li className="is-ja">Met keuken</li> : <li className="is-nee">Geen keuken</li>}
</ul>
{" "}{v.amenities.length ? <ul className="maker-d-voorz">{v.amenities.map((a) => <li key={a}>{a}</li>)}</ul> : null}
{" "}<div className="maker-d-voet">{" "}<WeekTable free={v.free} prefix="maker-d" />
{" "}<Link className="btn btn-sm btn-line" href={`${routes.room}#${venueAnchor(v.id)}`}>Bekijk deze ruimte</Link>{" "}</div>
{" "}</div>
{" "}</article>
))}{" "}</div> : <p className="maker-d-leeg">Er staan op dit moment nog geen ruimtes op de site.</p>}
{" "}<div className="maker-d-ruimte-voet">{" "}<p>Huur, betaling, sleutel en schoonmaak regel je rechtstreeks met de eigenaar; Wicked Workshops is daar geen partij in. Past er niets, dan kan ons team helpen zoeken, maar een ruimte beloven we niet.{" "}<Link className="maker-a-link" href={`${routes.room}#locatie-a-zoek`}>Laat ons team meezoeken</Link></p>
{" "}</div>
{" "}</div>
{" "}</section>
{" "}{" "}<div className="van-a">{" "}<section className="sec on-tint" style={{ background: "var(--surface-2)" }}>{" "}<div className="wrap maker-a-faq">{" "}<div className="sec-head"><div><h2>Vragen die je misschien hebt</h2>
<p>Staat je vraag er niet bij? Kijk op de{" "}<Link className="maker-a-link" href={routes.help}>hulppagina</Link>{" "}of{" "}<Link className="maker-a-link" href={routes.contact}>stuur ons een bericht</Link>.</p>
</div>
</div>
{" "}<div className="faq">{" "}{MAKER_FAQ.map((f) => (
<details key={f.question}><summary>{f.question}</summary><p>{f.answer}</p>
</details>
))}{" "}</div>
{" "}</div>
{" "}</section>
{" "}</div>
{" "}{" "}<div className="van-a">{" "}<section className="sec" id="maker-a-start">{" "}<div className="wrap maker-a-start">{" "}<div className="maker-a-start-txt">{" "}<h2>Begin met alleen je e-mailadres</h2>
{" "}<p>Daarna start de wizard. Je hoeft niets in één keer af te maken.</p>
{" "}<figure><Image src="/img/maker-atelier.jpg" alt="Een man in schort staat achter zijn werkbank in een keramiekatelier" width={1050} height={1573} sizes={SIZES} /></figure>
{" "}</div>
{" "}<StartForm social={social} />
{" "}</div>
{" "}</section>
{" "}</div>

    </>
  );
}
