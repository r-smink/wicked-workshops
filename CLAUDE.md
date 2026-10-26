# Wicked Workshops - achterkant (Next.js + Directus)

Je bouwt de ingelogde kant van Wicked Workshops, een Nederlandse marktplaats voor workshops en unieke uitjes. Voorkant (homepage, zoeken, workshoppagina) is een eerdere ronde en valt buiten dit pakket, maar de header, footer en megamenu worden hier wel hergebruikt.

Het ontwerp is af en gekozen. Jouw taak is het 1 op 1 bouwen met Next.js (App Router) en Directus als backend. Lees eerst dit bestand, daarna `docs/` in de volgorde hieronder.

## Wat er gebouwd wordt (de zes gekozen schermreeksen)

| Code | Onderdeel | Concept | Referentie | Spec |
|---|---|---|---|---|
| dflow-a | Deelnemer: account maken en inloggen | A, e-mail en wachtwoord | `reference/pages/dflow-a.html` | `docs/06-deelnemer-account.md` |
| ddash-b | Deelnemer: Mijn account | B, "Wat nu telt" | `reference/pages/ddash-b.html` | `docs/07-deelnemer-mijn-account.md` |
| aflow-a | Workshopgever: aanmelden | A, "De doorloop" | `reference/pages/aflow-a.html` | `docs/08-workshopgever-aanmelden.md` |
| wizard-a | Workshopgever: nieuwe workshop | A, "De zes stappen" | `reference/pages/wizard-a.html` | `docs/09-workshop-wizard.md` |
| adash-a | Workshopgever: dashboard | A, "De werkbank" | `reference/pages/adash-a.html` | `docs/10-workshopgever-dashboard.md` |
| lflow-a | Eigenaar van een ruimte (Locatie gezocht) | A, "Het formulier" | `reference/pages/lflow-a.html` | `docs/11-locatie-eigenaar.md` |

De andere twaalf concepten (B en C) staan alleen in `reference/design-alle-concepten.html`. Bouw ze niet. Gebruik dat bestand alleen als je wilt zien wat is afgevallen.

## Leesvolgorde

1. `docs/01-architectuur.md` - stack, mappen, conventies
2. `docs/02-ontwerpsysteem.md` - tokens, lettertypen, componenten, responsive aanpak
3. `docs/03-datamodel-directus.md` - alle collections, velden, relaties, rechten
4. `docs/04-auth.md` - inloggen, account maken, bevestigen, wachtwoord vergeten
5. `docs/05-bedrijfsregels.md` - minimum, beslismoment, verzetten, annuleren, mails, cron
6. `docs/06` tot en met `docs/11` - per schermreeks: routes, schermen, data, acties, lege en foutstanden
7. `docs/12-open-beslispunten.md` - wat het ontwerp bewust open laat, met de standaardkeuze die je mag aannemen
8. `docs/13-bouwvolgorde.md` - fasering met acceptatiecriteria

## Referentiemateriaal (`reference/`)

- `pages/<code>.html` - elk gekozen concept als losse, werkende pagina. Open in een browser (alle schermen staan onder elkaar). `?v=mobiel` toont 390 px.
- `css/00-shared-design-system.css` - tokens en gedeelde componenten (knoppen, kop, voet, megamenu, kaarten).
- `css/<code>.css` - alleen de regels voor die pagina, inclusief responsive regels. Selectors beginnen met `#p-<code>`; dat is scaffolding van het prototype. Vervang door een wrapperklasse of CSS Module.
- `brand/` - logo (`logo-horizontaal.svg`), merkteken en de 17 iconen als sprite.
- `img/` - tijdelijk stockbeeld (Pexels). Alleen voor ontwikkeling en seed-data, niet voor productie.
- `design-alle-concepten.html` - het volledige prototype met schakelaar.

Als spec en referentie botsen, wint de referentie voor uiterlijk en kopij, en de spec voor gedrag en data.

## Harde regels

- Taal van alle zichtbare tekst: Nederlands (je/jij-vorm). Kopieer de teksten uit de referentie letterlijk. Code, tabelnamen, velden en routes in het Engels, behalve de URL-segmenten die in `docs/` staan.
- Gebruik overal een gewoon streepje `-`. Geen gedachtestreepjes of em-/en-dashes in code, kopij, JSON of docs.
- Tekst gemarkeerd als "Werktekst" of "Voorbeelddata" in het ontwerp is placeholder. Zet werkteksten in een apart bestand (`content/werkteksten.ts`) zodat juristen ze kunnen vervangen zonder code aan te raken.
- Annotaties in het ontwerp (kaders "Annotatie: ...") zijn notities voor het team, geen UI. Bouw ze niet. Hun inhoud staat verwerkt in `docs/12-open-beslispunten.md`.
- Het scaffolding in de prototypes (`.tools`, `.scherm-label`, "Scherm 3 van 9", de schermkoppen en de `#p-...` ids) bouw je niet.
- Tijdens de pilot is er geen betaling. Prijzen worden getoond, nooit afgerekend. Bouw geen betaalflow. Betalen kan op zijn vroegst vanaf januari 2027.
- Boekingskosten voor deelnemers zijn EUR 0, altijd. Dit staat in de footer.
- Privacy: aan deelnemers vragen we nooit geboortedatum, adres of telefoonnummer. Aan workshopgevers vragen we die pas in de aanbiedersverklaring, en alleen het team ziet ze.
- Een workshopgever ziet van deelnemers alleen voornaam, aantal personen en dieetwens (geen e-mailadres, tenzij het team anders beslist).
- Toegankelijkheid: WCAG 2.2 AA. Contrastkeuzes in de CSS zijn bewust (zie comments in `00-shared-design-system.css`). Houd focusringen, labels en `aria-pressed`/`aria-current` zoals in de referentie.

## Werkwijze

- Werk in de volgorde van `docs/13-bouwvolgorde.md`. Elke fase eindigt met een werkende, getypte, geteste slice.
- Genereer Directus-typen uit het schema (zie `docs/01`) en gebruik ze overal. Geen `any` voor collections.
- Schema leeft in code: `directus/schema/snapshot.yaml` plus `directus/seed/`. Wijzig het schema nooit alleen in de Directus-UI.
- Controleer Directus-specifieke API's (registratie, wachtwoord-reset, sessies, access policies) tegen de actuele Directus-documentatie van de versie die je installeert. Dit pakket noemt de bedoeling, niet elk configuratiedetail.
- Vraag bij elke botsing tussen twee documenten eerst om verduidelijking in plaats van te gokken. Voor alles wat in `docs/12` staat: gebruik de daar genoemde standaard en laat de keuze eenvoudig omzetbaar (instelling of feature flag).
