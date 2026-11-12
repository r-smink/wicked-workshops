import Image from "next/image";
import Link from "next/link";
import { routes } from "@/lib/routes";
import { Arrow, SIZES } from "./parts";

/* Vaste kopij uit het ontwerp: hoe een datum doorgaat, de pilotband, het
   teamuitje, workshop geven en de cadeaubon. Het voorbeeld bij "Wanneer
   gaat een datum door?" en de cadeaubon houden hun voorbeeldvlag. */

function Flag({ children }: { children: string }) {
  return (
    <p className="demo-flag">
      <svg width="13" height="13" aria-hidden="true">
        <use href="#i-shield" />
      </svg>{" "}
      {children}
    </p>
  );
}

export function HowDatesWork() {
  return (
    <div className="van-b">
      {" "}
      <section className="sec home-b-door on-tint">
        {" "}
        <div className="wrap home-b-door-in">
          {" "}
          <div className="home-b-door-txt">
            {" "}
            <h2>Wanneer gaat een datum door?</h2>{" "}
            <p>
              Sommige workshops hebben een minimum aantal deelnemers nodig. De workshopgever kiest dat aantal zelf, en ook het moment waarop de
              stand telt. Tot dat moment kun je je gewoon aanmelden.
            </p>{" "}
            <p>
              Je krijgt vooraf een herinnering, en uiterlijk op het beslismoment hoor je of hij doorgaat. Is het minimum gehaald, dan gaat de
              datum door, ook als er daarna iemand afhaakt.
            </p>{" "}
            <Link className="tlink" href={routes.help}>
              Meer over doorgaan en annuleren <Arrow />
            </Link>{" "}
          </div>{" "}
          <div className="home-b-lijn" aria-label="Voorbeeld: Italiaans koken met Luca op zaterdag 12 december">
            {" "}
            <p className="home-b-lijn-kop">
              <b>Italiaans koken met Luca: verse pasta</b> · 8 plekken, gaat door bij 4
            </p>{" "}
            <ol className="home-b-stops">
              {" "}
              <li className="home-b-stop home-b-stop--nu">
                {" "}
                <span className="home-b-stip" aria-hidden="true"></span> <b>Nu</b> <span>3 van de 4 aanmeldingen binnen. Nog één nodig.</span>{" "}
              </li>{" "}
              <li className="home-b-stop">
                {" "}
                <span className="home-b-stip" aria-hidden="true"></span> <b>vr 11 dec, 22:00</b>{" "}
                <span>Beslismoment. Zijn er dan 4 of meer, dan gaat hij door.</span>{" "}
              </li>{" "}
              <li className="home-b-stop home-b-stop--doel">
                {" "}
                <span className="home-b-stip" aria-hidden="true"></span> <b>za 12 dec, 15:00</b> <span>De workshop in Wittevrouwen.</span>{" "}
              </li>{" "}
            </ol>{" "}
            <div className="home-b-uitkomst">
              {" "}
              <p>
                <svg width="20" height="20" aria-hidden="true">
                  <use href="#i-check" />
                </svg>
                <span>
                  <b>Minimum gehaald</b> Hij gaat zeker door. Je ziet het aan het lichtpaarse datumvak.
                </span>
              </p>{" "}
              <p>
                <svg width="20" height="20" aria-hidden="true">
                  <use href="#i-cal" />
                </svg>
                <span>
                  <b>Niet gehaald</b> Je krijgt een andere datum aangeboden.
                </span>
              </p>{" "}
            </div>{" "}
            <p className="home-b-deel">Ken je iemand die mee wil? Deel de datum, dan zit het minimum er sneller in.</p>{" "}
            <Flag>Workshop, datums en aanmeldingen zijn voorbeelddata</Flag>{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
    </div>
  );
}

export function PilotBand() {
  return (
    <div className="van-b">
      {" "}
      <section className="home-b-pilot">
        {" "}
        <div className="wrap home-b-pilot-in">
          {" "}
          <h2>Tijdens de pilot betaal je niets</h2>{" "}
          <p>
            Betalen via de site kan op zijn vroegst vanaf januari 2027. Je meldt je aan en je plek staat vast. Bij de meeste workshops annuleer je
            tot 48 uur vooraf gratis.
          </p>{" "}
          <Link className="btn btn-on-band" href={routes.help}>
            Hoe de pilot werkt <Arrow />
          </Link>{" "}
        </div>{" "}
      </section>{" "}
    </div>
  );
}

export function TeamOuting() {
  return (
    <div className="van-a">
      {" "}
      <section className="sec">
        {" "}
        <div className="wrap">
          {" "}
          <div className="home-a-team">
            {" "}
            <div className="home-a-team-kaart">
              {" "}
              <h2>Een teamuitje in de buurt van jullie kantoor</h2>{" "}
              <p>
                Vertel ons de groepsgrootte, het budget en de plaats. Binnen één werkdag hoor je van ons, met aanbod in de buurt van jullie kantoor.
              </p>{" "}
              <ul className="home-d-vink">
                {" "}
                <li>
                  <svg width="16" height="16" aria-hidden="true">
                    <use href="#i-check" />
                  </svg>
                  Groepen van tien tot twintig personen
                </li>{" "}
                <li>
                  <svg width="16" height="16" aria-hidden="true">
                    <use href="#i-check" />
                  </svg>
                  Jullie uitje hangt niet af van losse aanmeldingen
                </li>{" "}
              </ul>{" "}
              <p style={{ marginTop: "26px" }}>
                <Link className="btn" href={routes.contact}>
                  Vraag een voorstel <Arrow />
                </Link>
              </p>{" "}
            </div>{" "}
            <figure>
              <Image
                src="/img/schilderen2.jpg"
                alt="Een groep zit op de grond rond een schildersezel tijdens een creatieve workshop"
                width={1400}
                height={2089}
                sizes={SIZES}
              />
            </figure>{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
    </div>
  );
}

export function BecomeGiver() {
  return (
    <div className="van-a">
      {" "}
      <section className="home-a-gever on-band">
        {" "}
        <div className="home-a-gever-txt">
          {" "}
          <h2>Jij kunt iets wat anderen willen leren</h2>{" "}
          <p>
            Geen btw-nummer nodig om te beginnen, wel een korte check voordat je workshop live gaat. Per datum kies jij hoeveel mensen er minimaal
            nodig zijn en tot wanneer.
          </p>{" "}
          <div className="home-a-gever-rij">
            {" "}
            <div>
              <b>Geen vaste kosten</b>
              <span>
                Geen abonnement: zonder boekingen betaal je <strong>€0</strong>
              </span>
            </div>{" "}
            <div>
              <b>Snel klaar</b>
              <span>In zes stappen staat je workshop klaar</span>
            </div>{" "}
            <div>
              <b>Je betaalt per boeking</b>
              <span>Negen tot twintig procent commissie per categorie, zodra betalen via de site start</span>
            </div>{" "}
          </div>{" "}
          <p style={{ marginTop: "26px" }}>
            {" "}
            <Link className="btn btn-on-band" href={routes.giver}>
              Word workshopgever <Arrow />
            </Link>{" "}
          </p>{" "}
          <div className="home-a-ruimte">
            {" "}
            <svg width="22" height="22" aria-hidden="true">
              <use href="#i-pin" />
            </svg>{" "}
            <p>
              <b>Geen eigen keuken of atelier?</b> Bekijk ruimtes die op jouw tijden leeg staan en spreek het rechtstreeks met de eigenaar af.{" "}
              <Link href={routes.room}>Locatie gezocht</Link> <span>·</span> <Link href={routes.room}>Ik heb een ruimte</Link>
            </p>{" "}
          </div>{" "}
        </div>{" "}
        <figure>
          <Image
            src="/img/repair2.jpg"
            alt="Iemand schuurt met gehoorbescherming een werkstuk in een houtwerkplaats"
            width={1100}
            height={733}
            sizes={SIZES}
          />
        </figure>{" "}
      </section>{" "}
    </div>
  );
}

export function GiftCard() {
  return (
    <div className="van-a">
      {" "}
      <section className="sec">
        {" "}
        <div className="wrap">
          {" "}
          <div className="home-a-bon">
            {" "}
            <div className="home-a-bon-txt">
              {" "}
              <h2>Geef een middag in plaats van een ding</h2>{" "}
              <p>Met de Wicked cadeaubon kiest de ontvanger zelf de workshop en de datum. Je stuurt hem direct per mail.</p>{" "}
              <p style={{ marginTop: "22px" }}>
                {/* Er is nog geen cadeaubonpagina; tot die er is gaat de knop naar contact. */}
                <Link className="btn" href={routes.contact}>
                  Bekijk de cadeaubon <Arrow />
                </Link>
              </p>{" "}
              <Flag>Geldigheid en bedragen nog te bepalen</Flag>{" "}
            </div>{" "}
            <figure>
              <Image src="/img/kaarsen2.jpg" alt="Werktafel met zelfgemaakte kaarsen en droogbloemen" width={1100} height={1650} sizes={SIZES} />
            </figure>{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
    </div>
  );
}
