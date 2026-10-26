import Link from "next/link";
import { LogoMark } from "./Logo";
import { ThemeSwitch, CookieSettingsLink } from "./ThemeSwitch";

const COLUMNS = [
  {
    title: "Ontdekken",
    links: [
      ["Alle workshops", "/zoeken"],
      ["Categorieën", "/zoeken"],
      ["Steden en plaatsen", "/zoeken"],
      ["Inspiratie", "/inspiratie"],
      ["Cadeaubon", "/cadeaubon"],
    ],
  },
  {
    title: "Workshopgevers",
    links: [
      ["Word workshopgever", "/word-workshopgever"],
      ["Zo werkt het", "/hulp"],
      ["Wat kost het", "/word-workshopgever"],
      ["Inloggen op je dashboard", "/inloggen"],
    ],
  },
  {
    title: "Wicked Workshops",
    links: [
      ["Over ons", "/over-ons"],
      ["Voor bedrijven", "/bedrijven"],
      ["Veelgestelde vragen", "/hulp"],
      ["Contact", "/contact"],
    ],
  },
] as const;

/* Footer (.foot) uit de referentie: logo met intro, drie kolommen en de
   balk met "Boekingskosten €0, altijd". De weergaveschakelaar (licht of
   donker) is een toevoeging en staat in de balk, zodat de header gelijk
   blijft aan het ontwerp. */
export function Footer() {
  return (
    <footer className="foot">
      <div className="foot-grid">
        <div>
          <span className="logo">
            <LogoMark onDark />
          </span>
          <p className="foot-intro">De Nederlandse marktplaats voor workshops en unieke uitjes. Ook voor wie net begint met lesgeven.</p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3>{col.title}</h3>
            <ul>
              {col.links.map(([label, href]) => (
                <li key={label}><Link href={href}>{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="foot-bar">
        <span>&copy; {new Date().getFullYear()} Wicked Workshops</span>
        <Link href="/voorwaarden">Algemene voorwaarden</Link>
        <Link href="/privacy">Privacy</Link>
        <CookieSettingsLink />
        <ThemeSwitch />
        <span style={{ marginLeft: "auto" }}>Boekingskosten &euro;0, altijd</span>
      </div>
    </footer>
  );
}
