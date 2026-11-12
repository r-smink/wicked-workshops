import Link from "next/link";
import Image from "next/image";
import { routes } from "@/lib/routes";
import { ContactForm } from "./ContactForm";

/* Contactpagina (wicked-handoff/design/index.html, #p-contact). Alleen het
   formulier is een client component. Het voorbeeld van de bevestiging onder
   het formulier toont ContactForm pas na versturen, op de plek van het
   formulier. */

const SIZES = "(max-width: 860px) 100vw, 50vw";

const QUICK = [
  { href: `${routes.help}#hulp-d-minimum`, text: "Gaat mijn workshop door?" },
  { href: `${routes.help}#hulp-d-annuleren`, text: "Annuleren of verzetten" },
  { href: `${routes.help}#hulp-d-pilot`, text: "De pilot en betalen" },
  { href: `${routes.help}#hulp-d-aanslag`, text: "Workshop geven: wat heb ik nodig?" },
];

export function ContactPage() {
  return (
    <>
      <div className="wrap"><nav className="kruimel" aria-label="Kruimelpad"><Link href={routes.home}>Home</Link><span>/</span>Contact</nav></div>{" "}
      <section className="contact-d-top">
        <div className="wrap contact-d-top-in">
          {" "}
          <div className="contact-d-hoofd">
            {" "}
            <h1>Neem contact op met Wicked Workshops</h1>{" "}
            <p className="contact-d-lead">Kies waar je bericht over gaat en schrijf ons. Je antwoord komt per mail.</p>{" "}
            <ContactForm />{" "}
          </div>{" "}
          <aside className="contact-d-zij" aria-label="Liever zelf iets opzoeken of mailen">
            {" "}
            <figure className="contact-d-beeld"><Image src="/img/keramiek.jpg" alt="Een vrouw met hoofdband vormt een kom op de draaischijf en kijkt lachend naar de deelnemer naast haar" width={1800} height={1200} sizes={SIZES} priority /></figure>{" "}
            <div className="contact-d-kaart">
              {" "}
              <p><b>Zakelijk of teamuitje?</b> Reactie binnen één werkdag. Een teamuitje vraag je aan via <Link href="/bedrijven">Voor bedrijven</Link>.</p>{" "}
              <p><b>Liever mailen?</b> <span className="hulp-plaatshouder">[e-mailadres volgt]</span></p>{" "}
            </div>{" "}
            <div className="contact-d-snel">
              {" "}
              <h2>Misschien staat het antwoord al op de hulppagina</h2>{" "}
              <ul>
                {QUICK.map((q) => (
                  <li key={q.href}>
                    <Link href={q.href}>{q.text}<svg width="16" height="16" aria-hidden="true"><use href="#i-arrow" /></svg></Link>
                  </li>
                ))}{" "}
              </ul>{" "}
            </div>{" "}
          </aside>{" "}
        </div>
      </section>
    </>
  );
}
