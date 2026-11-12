import Link from "next/link";
import Image from "next/image";
import { routes } from "@/lib/routes";
import { LoginForm } from "./LoginForm";

/* Inlogpagina (wicked-handoff/design/index.html, #p-inloggen). */

const SIZES = "(max-width: 860px) 100vw, 50vw";

type Props = { initialEmail: string; confirmed: boolean; next: string | null; providerFirst: boolean };

export function LoginPage(props: Props) {
  return (
    <>
      <div className="wrap"><nav className="kruimel" aria-label="Kruimelpad"><Link href={routes.home}>Home</Link><span>/</span>Inloggen</nav></div>{" "}
      <section className="inloggen-d-top">
        <div className="wrap inloggen-d-top-in">
          {" "}
          <div className="inloggen-d-hoofd">
            {" "}
            <h1>Inloggen bij Wicked Workshops</h1>{" "}
            <LoginForm {...props} />{" "}
          </div>{" "}
          <div className="inloggen-d-beelden">
            {" "}
            <figure className="inloggen-d-beeld inloggen-d-voor-deelnemer">
              {" "}
              <Image src="/img/account-bank.jpg" alt="Twee vriendinnen op de bank met koffie, allebei met hun telefoon" width={1100} height={733} sizes={SIZES} />{" "}
              <figcaption>Na het inloggen: Mijn account, met je aanmeldingen en de stand van elke datum</figcaption>{" "}
            </figure>{" "}
            <figure className="inloggen-d-beeld inloggen-d-voor-gever">
              {" "}
              <Image src="/img/maker-atelier.jpg" alt="Een workshopgever in schort staat achter een werktafel in zijn keramiekatelier" width={1050} height={1573} sizes={SIZES} />{" "}
              <figcaption>Na het inloggen: je dashboard met je workshops en datums</figcaption>{" "}
            </figure>{" "}
          </div>{" "}
        </div>
      </section>{" "}
      <section className="sec inloggen-d-info">
        <div className="wrap inloggen-d-info-in">
          {" "}
          <h2>Praktisch bij het inloggen</h2>{" "}
          <ul className="inloggen-d-rijen">
            {" "}
            <li>
              {" "}
              <b>Boeken kan zonder account</b>{" "}
              <p>Je beheert je boeking via de link in je mail. Een account maak je daarna met één klik, en daarvoor heb je alleen een e-mailadres nodig.</p>{" "}
            </li>{" "}
            <li>
              {" "}
              <b>Lukt inloggen niet?</b>{" "}
              <p>Vraag een link in je mail; die werkt ook als je je wachtwoord kwijt bent. Lukt het dan nog niet, kijk op de <Link href={routes.help}>hulppagina</Link> of <Link href={routes.contact}>stuur ons een bericht</Link>.</p>{" "}
            </li>{" "}
          </ul>{" "}
        </div>
      </section>
    </>
  );
}
