# 13 - Bouwvolgorde

Werk fase voor fase. Elke fase eindigt groen: typecheck, lint, unit- en e2e-tests, en een korte demo-notitie in `docs/CHANGELOG.md`. Commit per fase.

## Fase 0 - Fundament

- Repo met `web/` (Next.js, TypeScript strict) en `directus/` (Docker Compose met Directus, PostgreSQL, Mailpit voor lokale mail).
- `tokens.css`, lettertypen, `Announce`, `Header` (uitgelogd en ingelogd), `Megamenu`, `Footer`, `Button`, `Chip`, `Badge`, `Icon`, logo. Controleer visueel tegen `reference/pages/*.html` op 1440 en 390 px.
- Responsive aanpak uit `02` ingesteld.
- CI: lint, types, Vitest, Playwright (headless).

Klaar als: lege pagina's met de juiste shell zien er identiek uit aan de referentie.

## Fase 1 - Datamodel en seed

- Collections, relaties, policies uit `03` als schema-snapshot. Seeds voor categorieen, gelegenheden, plaatsen, annuleerregelingen en `platform_settings`.
- Demo-seed met de voorbeeldpersonen (Sanne, Luca, Lotte, Mirjam, Noor) en de data uit de prototypes, achter `npm run seed:demo`.
- Gegenereerde types, `lib/directus/*`.
- Tests voor rechten: een uitgelogde aanvraag ziet geen adres, geen verklaring, geen boekingen.

Klaar als: de rechtenmatrix uit `03` is als geautomatiseerde test aanwezig en groen.

## Fase 2 - Bedrijfsregels

- `lib/rules/`: `sessionState`, `pickFocus`, `attention`, `checklist`, `cancellation`, `describeAvailability`, tekstfuncties voor stand en tijd tot beslismoment. Volledig getest, inclusief zomer- en wintertijd en grenzen rond middernacht.
- Directus Flows of extensies voor boeken, beslismoment-cron, herinneringen, koppelen van gastaanmeldingen.
- Mailtemplates en Mailpit-tests.

Klaar als: scenario-tests (min gehaald, niet gehaald, vol, annuleren, verzetten, aanbod) slagen.

## Fase 3 - Auth en deelnemer-account (`04`, `06`)

- Account maken, bevestigen, inloggen, uitloggen, wachtwoord vergeten, verlopen link.
- Gastbevestiging `/aanmelding/[token]` met account maken. Hiervoor heb je minimaal een eenvoudige boekroute nodig; bouw een tijdelijke interne `POST /api/dev/boek` voor tests en seed. De echte boekflow hoort bij de publieke voorkant.
- Middleware voor sessie en guards.

Klaar als: acceptatiecriteria van `06` slagen.

## Fase 4 - Mijn account (`07`)

Tabs, Nu met `FocusBlock` in vier standen, paneel verzetten of annuleren, Gepland, Eerder met review, Bewaard, Instellingen met export.

Klaar als: acceptatiecriteria van `07` slagen op 1440 en 390 px.

## Fase 5 - Workshopgever aanmelden en dashboard (`08`, `10`)

Aanmelden, welkom, start. Dashboard met overzicht, datums (lijst, nieuwe datum, aanpassen, annuleren), workshops, reviews, profiel, uitbetalen. Zijbalk en duimbalk.

Klaar als: acceptatiecriteria van `08` en `10` slagen.

## Fase 6 - Wizard (`09`)

Stappen 1 tot 9, autosave, uploads, checklist, preview, verklaring, indienen, team-check (Directus-weergave voor het team met knoppen "Goedkeuren" en "Terug met opmerking", die de mails versturen).

Klaar als: acceptatiecriteria van `09` slagen. Een volledige doorloop van aanmelden tot live staat in 1 Playwright-test.

## Fase 7 - Locatie gezocht (`11`), achter feature flag

Account, formulier met meelopend voorbeeld, beheer, contactverzoek.

## Fase 8 - Afwerking

- Toegankelijkheid: axe-run op elke route, toetsenbordtest van elk paneel en elke tab.
- Prestaties: Lighthouse op belangrijkste routes, afbeeldingen via presets, geen layoutverschuiving.
- Beveiliging: rate limits, CSRF-check, cookie-instellingen, rechtentests herhalen.
- Observability: foutrapportage (Sentry of gelijkwaardig), logging van mails en cron.
- Documentatie: `README` met opzet, `docs/CHANGELOG.md`, en een lijst met alles wat bewust nog open staat uit `12`.

## Definition of done voor elk scherm

- Visueel 1 op 1 met de referentie op 1440, 1024, 768 en 390 px (screenshot-vergelijking met `reference/pages/<code>.html`).
- Alle teksten letterlijk uit de referentie, werkteksten in `content/werkteksten.ts`.
- Lege, laad-, fout- en successtanden uitgewerkt, ook waar het ontwerp ze niet toont (gebruik de bestaande stijl: kaart, 1 zin, 1 knop).
- Toetsenbord en schermlezer bruikbaar.
- Geen prototype-scaffolding in de productiecode.
- Rechten afgedwongen in Directus, niet alleen in de UI.
