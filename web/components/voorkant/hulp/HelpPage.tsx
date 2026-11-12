import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { standLabel } from "@/lib/voorkant/format";
import { routes } from "@/lib/routes";
import { blockById, HELP_GROUPS, type HelpGroupId } from "./content";
import { HelpBlock, HelpFaq, HelpGroup, HelpIndex, HelpMain, HelpSearchForm, HelpSearchProvider } from "./HelpSearch";
import "./hulp.css";

/* Hulppagina (wicked-handoff/design/index.html, #p-hulp). Statische kopij;
   de zoekfunctie is een client component (HelpSearch). */

const SIZES = "(max-width: 860px) 100vw, 50vw";
const BUSINESS = "/bedrijven";

/* De standen in dezelfde termen als op de datums (lib/voorkant/format.ts). */
const EXAMPLE = { taken: 3, min: 4 };
const LABEL_OPEN = standLabel("open", EXAMPLE);
const LABEL_DOOR = standLabel("door", EXAMPLE);
const LABEL_NIET = standLabel("nietdoor", EXAMPLE);
const LABEL_VOL = standLabel("vol", EXAMPLE);

const Arrow = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} aria-hidden="true"><use href="#i-arrow" /></svg>
);
const Shield = () => (
  <svg width="13" height="13" aria-hidden="true"><use href="#i-shield" /></svg>
);

const INDEX_LINKS: Record<HelpGroupId, { id: string; small: string }[]> = {
  meedoen: [
    { id: "boeken", small: "Je plek, het aantal personen en dieetwensen" },
    { id: "minimum", small: "Wanneer gaat een datum door?" },
    { id: "annuleren", small: "Gratis tot 48 uur vooraf, bij de meeste workshops" },
    { id: "pilot", small: "Wat je nu betaalt en wat later verandert" },
    { id: "account", small: "Boeken kan zonder account" },
    { id: "reviews", small: "Alleen na een echte boeking" },
    { id: "particulier", small: "Wie geeft de workshop, en wat betekent dat voor jou?" },
    { id: "bedrijf", small: "Groepen van tien tot twintig personen" },
  ],
  geven: [
    { id: "aanslag", small: "Een account, zes stappen en een concept" },
    { id: "verklaring", small: "Wat we vragen en wat er gebeurt voor je online gaat" },
    { id: "kosten", small: "Commissie per categorie, geen vaste kosten" },
    { id: "datums", small: "Maximum, minimum en beslismoment per datum" },
    { id: "profiel", small: "Wat er op je profiel staat" },
    { id: "ruimte", small: "Hoe ruimtes werken en wat jij zelf regelt" },
  ],
};

const TILES: Record<HelpGroupId, { src: string; w: number; h: number; small: string }> = {
  meedoen: { src: "/img/bedrijven-samen-koken.jpg", w: 1400, h: 931, small: "Vinden, boeken en wat er daarna gebeurt" },
  geven: { src: "/img/maker-les.jpg", w: 1050, h: 1575, small: "Aanmelden, kosten en je datums" },
};

function IndexRow({ group }: { group: HelpGroupId }) {
  const g = HELP_GROUPS.find((x) => x.id === group)!;
  const t = TILES[group];
  return (
    <div className="hulp-d-index-rij">
      {" "}
      <a className="hulp-c-tegel hulp-c-tegel-foto hulp-d-tegel" href={`#hulp-d-${group}`}>
        {" "}
        <Image src={t.src} alt="" width={t.w} height={t.h} sizes={SIZES} />{" "}
        <span className="hulp-c-tegel-label"><b>{g.title}</b><small>{t.small}</small></span>{" "}
      </a>{" "}
      <ul className="hulp-d-ankers">
        {INDEX_LINKS[group].map((l) => (
          <li key={l.id}>
            <a href={`#hulp-d-${l.id}`}><b>{blockById(l.id).title}</b><small>{l.small}</small><Arrow /></a>
          </li>
        ))}{" "}
      </ul>{" "}
    </div>
  );
}

/* Kop van een onderwerp: titel, lead en eventueel iets ernaast. */
function BlockHead({ id, wide, lead, aside, after }: { id: string; wide?: boolean; lead: ReactNode; aside?: ReactNode; after?: ReactNode }) {
  return (
    <div className={wide ? "hulp-c-blok-kop hulp-c-blok-kop-breed" : "hulp-c-blok-kop"}>
      {" "}
      <div>
        {" "}
        <h3>{blockById(id).title}</h3>{" "}
        <p>{lead}</p>
        {after}{" "}
      </div>
      {aside}{" "}
    </div>
  );
}

function Block({ id, children }: { id: string; children: ReactNode }) {
  return (
    <HelpBlock id={id}>
      {" "}
      {children}{" "}
      <HelpFaq block={id} />
    </HelpBlock>
  );
}

function GroupHead({ group }: { group: HelpGroupId }) {
  const g = HELP_GROUPS.find((x) => x.id === group)!;
  return (
    <div className="hulp-d-groep-kop">
      {" "}
      <h2 id={`hulp-d-${group}-kop`}>{g.title}</h2>{" "}
      <p>{g.lead}</p>{" "}
    </div>
  );
}

export function HelpPage() {
  return (
    <HelpSearchProvider>
      {" "}
      <div className="wrap"><nav className="kruimel" aria-label="Kruimelpad"><Link href={routes.home}>Home</Link><span>/</span>Hulp</nav></div>{" "}
      <section className="hulp-c-hero">
        <div className="wrap hulp-c-hero-in">
          {" "}
          <div className="hulp-c-hero-tekst">
            {" "}
            <h1>Hulp voor deelnemers en workshopgevers</h1>{" "}
            <p className="hulp-c-hero-lead">Antwoorden over boeken, het minimum, annuleren, betalen en workshop geven. Zoek op een woord of kies een onderwerp. Staat je vraag er niet bij, dan stuur je ons een bericht.</p>{" "}
            <HelpSearchForm />{" "}
            <div className="hulp-c-vaak">
              {" "}
              <span>Snel naar:</span> <a className="fchip" href="#hulp-d-minimum">Gaat mijn workshop door?</a>{" "}
              <a className="fchip" href="#hulp-d-annuleren">Annuleren</a> <a className="fchip" href="#hulp-d-pilot">Wat kost het?</a>{" "}
              <a className="fchip" href="#hulp-d-geven">Workshop geven</a>{" "}
            </div>{" "}
          </div>{" "}
          <figure className="hulp-c-hero-beeld"><Image src="/img/samen.jpg" alt="Twee vrouwen lachen samen aan een blauwe tafel tijdens een creatieve workshop" width={1100} height={733} sizes={SIZES} priority /></figure>{" "}
        </div>
      </section>{" "}
      <HelpIndex>
        <div className="wrap">
          {" "}
          <IndexRow group="meedoen" /> <IndexRow group="geven" />{" "}
        </div>
      </HelpIndex>{" "}
      <HelpMain>
        {" "}
        <HelpGroup id="meedoen">
          {" "}
          <GroupHead group="meedoen" />{" "}
          <Block id="boeken">
            <BlockHead
              id="boeken"
              lead="Je kiest een datum, geeft aan met hoeveel je komt en vult je naam en e-mailadres in. Je plek staat nu direct vast. Er is geen aanvraag die de workshopgever nog moet goedkeuren."
              aside={
                <div className="hulp-c-bon" aria-label="Voorbeeld van een boeking">
                  {" "}
                  <p className="hulp-c-bon-kop">Je boeking</p>{" "}
                  <dl>
                    {" "}
                    <div><dt>Workshop</dt><dd>Italiaans koken met Luca: verse pasta</dd></div>{" "}
                    <div><dt>Datum</dt><dd>za 14 nov, 15:00</dd></div>{" "}
                    <div><dt>Plekken</dt><dd>2 x €45</dd></div>{" "}
                    <div><dt>Boekingskosten</dt><dd>€0</dd></div>{" "}
                  </dl>{" "}
                  <p className="hulp-c-bon-totaal"><span>Totaal</span><b>€90</b></p>{" "}
                  <a className="hulp-c-bon-noot" href="#hulp-d-pilot">Hoe betalen nu werkt</a>{" "}
                  <p className="demo-flag"><Shield /> Workshop en prijs zijn voorbeelddata</p>{" "}
                </div>
              }
            />
          </Block>{" "}
          <Block id="minimum">
            <BlockHead
              id="minimum"
              lead="Per datum staat wanneer hij doorgaat. Soms is dat bij een minimum aantal aanmeldingen, soms is er geen minimum. Is het minimum op het beslismoment gehaald, dan gaat de datum vanzelf door. Niemand hoeft daarover te beslissen."
              aside={
                <div className="hulp-c-teller" aria-label="Voorbeeld: 3 van 8 plekken bezet, minimum 4">
                  {" "}
                  <div className="hulp-c-teller-balk"><i className="v"></i><i className="v"></i><i className="v"></i><i className="m"></i><i></i><i></i><i></i><i></i></div>{" "}
                  <div className="hulp-c-teller-as"><span>3 van 8 plekken bezet</span><span>minimum 4</span></div>{" "}
                  <p className="hulp-c-teller-stand"><span className="hulp-stand hulp-stand-open">{LABEL_OPEN}</span> Beslismoment vr 11 dec, 22:00</p>{" "}
                  <p className="demo-flag"><Shield /> Workshop en aantallen zijn voorbeelddata</p>{" "}
                </div>
              }
            />{" "}
            <div className="hulp-d-standen">
              {" "}
              <dl>
                {" "}
                <div><dt><span className="hulp-stand hulp-stand-open">{LABEL_OPEN}</span></dt><dd>Het minimum is nog niet gehaald. Aanmelden kan gewoon.</dd></div>{" "}
                <div><dt><span className="hulp-stand hulp-stand-door"><svg width="14" height="14" aria-hidden="true"><use href="#i-check" /></svg>{LABEL_DOOR}</span></dt><dd>Het minimum is gehaald, of er is geen minimum. Dat verandert niet meer, ook niet als iemand daarna afzegt.</dd></div>{" "}
                <div><dt><span className="hulp-stand hulp-stand-niet">{LABEL_NIET}</span></dt><dd>Het minimum is niet gehaald op het beslismoment. Je krijgt een andere datum aangeboden.</dd></div>{" "}
                <div><dt><span className="hulp-stand hulp-stand-vol">{LABEL_VOL}</span></dt><dd>Alle plekken zijn bezet. Kijk bij de andere datums van deze workshop.</dd></div>{" "}
              </dl>{" "}
              <figure className="hulp-d-deel">
                {" "}
                <Image src="/img/hulp-delen.jpg" alt="Twee vriendinnen kijken samen op een telefoon" width={1100} height={733} sizes={SIZES} />{" "}
                <figcaption><b>Help je datum zelf vooruit</b>Deel de workshop met vrienden, familie of collega’s om zelf mensen te werven.</figcaption>{" "}
              </figure>{" "}
            </div>
          </Block>{" "}
          <Block id="annuleren">
            <BlockHead
              id="annuleren"
              lead="Bij de meeste workshops gelden deze regels. Wat bij jouw workshop geldt, staat op de pagina van die workshop."
              aside={
                <div className="hulp-c-tabel-wrap">
                  <p className="hulp-c-tabel-kop">Bij de meeste workshops</p>{" "}
                  <table className="hulp-c-tabel">
                    <tbody>
                      <tr><th scope="row">Tot 48 uur vooraf</th><td>Gratis annuleren</td></tr>
                      <tr><th scope="row">Binnen 48 uur</th><td>Je betaalt 50 procent</td></tr>
                      <tr><th scope="row">Verzetten</th><td>Naar een andere datum, kosteloos, zolang er plek is</td></tr>
                      <tr><th scope="row">Workshopgever annuleert</th><td>Alles terug, plus een alternatief</td></tr>
                    </tbody>
                  </table>{" "}
                </div>
              }
            />
          </Block>{" "}
          <Block id="pilot">
            <BlockHead
              id="pilot"
              lead="Wicked Workshops draait nu als pilot. Tijdens de pilot betaal je niets. Betalen via de site kan op zijn vroegst vanaf januari 2027."
              aside={
                <div className="hulp-c-kal" aria-label="Betalen nu en later">
                  {" "}
                  <div className="hulp-c-kal-vlak hulp-c-kal-nu"><b>Nu</b><span>Je plek staat vast zodra je je aanmeldt.</span></div>{" "}
                  <div className="hulp-c-kal-vlak hulp-c-kal-straks"><b>Later</b><span>Je plek staat vast na een geslaagde betaling.</span></div>{" "}
                </div>
              }
            />
          </Block>{" "}
          <Block id="account">
            <BlockHead id="account" wide lead="Je hebt geen account nodig om te boeken. Je beheert je aanmelding via de link in je mail, en een account maak je daarna met één klik." />
          </Block>{" "}
          <Block id="reviews">
            <BlockHead id="reviews" wide lead="Een review hoort bij een echte boeking. Zo weet je dat de mensen die schrijven, echt hebben meegedaan." />
          </Block>{" "}
          <Block id="particulier">
            <BlockHead
              id="particulier"
              wide
              lead={
                <>
                  Bij elke workshopgever staat of het een ondernemer of een particulier is. Boek je bij een particulier, dan geldt het consumentenrecht niet.{" "}
                  <span className="hulp-werktekst">Werktekst, wordt nog uitgewerkt</span>
                </>
              }
            />
          </Block>{" "}
          <Block id="bedrijf">
            <BlockHead
              id="bedrijf"
              lead="Een workshop met je team regel je via Voor bedrijven. Dat is een aanvraag, en je hoort binnen één werkdag van ons."
              after={
                <>
                  {" "}
                  <Link className="tlink" href={BUSINESS}>Naar Voor bedrijven <Arrow /></Link>
                </>
              }
              aside={
                <dl className="hulp-c-feiten">
                  {" "}
                  <div><dt>Groepen van tien tot twintig personen</dt><dd>Zakelijke aanvragen lopen via Voor bedrijven</dd></div>{" "}
                  <div><dt>Reactie binnen één werkdag</dt><dd>Nadat je je aanvraag hebt gestuurd</dd></div>{" "}
                  <div><dt>Geen minimum aantal deelnemers</dt><dd>Een bedrijfsuitje hangt niet af van losse aanmeldingen</dd></div>{" "}
                </dl>
              }
            />
          </Block>{" "}
        </HelpGroup>{" "}
        <HelpGroup id="geven">
          {" "}
          <GroupHead group="geven" />{" "}
          <HelpBlock id="aanslag">
            {" "}
            <BlockHead
              id="aanslag"
              wide
              lead="Je hebt geen bedrijf en geen btw-nummer nodig om te beginnen. Je maakt een account met je e-mailadres en zet je workshop in zes stappen in elkaar. Tussendoor bewaar je hem als concept."
              aside={
                <ol className="hulp-c-stappen" aria-label="De zes stappen">
                  {" "}
                  <li>Basis</li>
                  <li>Inhoud</li>
                  <li>Praktisch</li>
                  <li>Beeld</li>
                  <li>Prijs</li>
                  <li>Datums</li>{" "}
                </ol>
              }
            />{" "}
            <HelpFaq block="aanslag" />{" "}
            <div className="hulp-c-knoppen">
              {" "}
              <Link className="btn" href={routes.giver}>Lees hoe workshop geven werkt <Arrow size={18} /></Link>{" "}
            </div>{" "}
          </HelpBlock>{" "}
          <Block id="verklaring">
            <BlockHead
              id="verklaring"
              lead="Is je workshop klaar, dan vul je de aanbiedersverklaring in. Daarna kijken wij je workshop na. Pas na die check gaat hij online."
              aside={
                <dl className="hulp-c-feiten">
                  {" "}
                  <div><dt>Over jou</dt><dd>Naam, geboortedatum, adres, telefoonnummer en e-mailadres</dd></div>{" "}
                  <div><dt>Particulier of ondernemer</dt><dd>Ondernemer? Dan ook je KvK-nummer en je handelsnaam</dd></div>{" "}
                  <div><dt>18 jaar of ouder</dt><dd>Je bevestigt je leeftijd</dd></div>{" "}
                  <div><dt>Veiligheid</dt><dd>Een veiligheidsverklaring, en kwalificaties waar die bij je workshop horen</dd></div>{" "}
                  <div><dt>Uitbetaling</dt><dd>Je IBAN</dd></div>{" "}
                </dl>
              }
            />
          </Block>{" "}
          <Block id="kosten">
            <BlockHead id="kosten" wide lead="Geen vaste kosten. Je betaalt een commissie over de workshopprijs. Tijdens de pilot betaal je niets. Betalen via de site kan op zijn vroegst vanaf januari 2027." />
          </Block>{" "}
          <Block id="datums">
            <BlockHead id="datums" wide lead="Per datum kies je het maximum aantal deelnemers, eventueel een minimum, en het beslismoment. Zonder minimum gaat de datum altijd door." />
          </Block>{" "}
          <Block id="profiel">
            <BlockHead id="profiel" wide lead="Op je profiel staan wie je bent, je workshops met de eerstvolgende datum en de reviews over al je workshops samen." />
          </Block>{" "}
          <Block id="ruimte">
            <BlockHead
              id="ruimte"
              lead="Heb je geen eigen ruimte, dan zoek je er een op Locatie gezocht. Staat jouw ruimte regelmatig leeg, dan laat je hem daar zien. Wicked Workshops is geen partij in de afspraken tussen jou en de eigenaar."
              after={
                <>
                  {" "}
                  <div className="hulp-c-knoppen">
                    {" "}
                    <Link className="btn" href={routes.room}>Bekijk ruimtes <Arrow size={18} /></Link>{" "}
                  </div>
                </>
              }
              aside={
                <figure className="hulp-d-ruimtebeeld"><Image src="/img/locatie-keuken.jpg" alt="Een lichte keuken met een houten werktafel en witte barkrukken" width={1050} height={1575} sizes={SIZES} /></figure>
              }
            />
          </Block>{" "}
        </HelpGroup>{" "}
      </HelpMain>{" "}
      <section className="hulp-d-slot on-tint" aria-labelledby="hulp-d-slot-kop">
        <div className="wrap">
          {" "}
          <div className="hulp-d-slot-in">
            {" "}
            <div>
              {" "}
              <h2 id="hulp-d-slot-kop">Staat je vraag er niet bij?</h2>{" "}
              <p>Stuur ons een bericht. Zakelijke aanvragen beantwoorden we binnen één werkdag.</p>{" "}
            </div>{" "}
            <div className="hulp-d-slot-knoppen">
              {" "}
              <Link className="btn" href={routes.contact}>Naar de contactpagina <Arrow size={18} /></Link>{" "}
              <p>Liever mailen? <span className="hulp-plaatshouder">[e-mailadres volgt]</span></p>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      </section>{" "}
    </HelpSearchProvider>
  );
}
