# Changelog

Per fase een korte demo-notitie (docs/13).

## Fase 0 - Fundament

**Wat werkt**

- Monorepo: de bestaande Next.js-site staat nu in `web/` (TypeScript strict voor nieuwe code, bestaande JSX via `allowJs`). `directus/` bevat Docker Compose met Directus 11.17.4 (gelijk aan productie), PostgreSQL 16 en Mailpit.
- `web/styles/tokens.css`: de tokens uit de referentie ongewijzigd, plus een donkere modus (`html.dark`) die alleen de rollen opnieuw invult.
- Lettertypen via `next/font` (Bricolage Grotesque met assen opsz en wdth, Plus Jakarta Sans). De Google Fonts-import in `globals.css` is weg.
- Gedeelde shell in `web/components/shell/`: `Announce`, `Header` (uitgelogd en ingelogd), `Megamenu`, `MobileMenu`, `Footer`, `Logo`. UI in `web/components/ui/`: `Button`/`ButtonLink`, `Chip`, `Badge`, `Icon` met de sprite 1 keer in de layout.
- `web/styles/shell.css` wordt gegenereerd uit `reference/css/00-shared-design-system.css` (`npm run shell:css`), zonder prototype-scaffolding.
- Responsive: `.stage` als container in de layout, dus alle `cqi`- en `@container stage`-regels werken 1 op 1. `position: fixed` werkt daarbinnen (getest).
- Alle publieke pagina's gebruiken de nieuwe shell via `PublicLayout`.
- CI (`.github/workflows/ci.yml`): lint, typecheck, Vitest, build, Playwright.

**Hoe je het ziet**

- `cd web && npm run dev`, open `/dev/shell` (alleen in ontwikkeling). `?ingelogd=deelnemer` of `?ingelogd=workshopgever` toont de ingelogde header, `?fixture=ref` de voorbeelddata uit de referentie.
- `npm run test:e2e` legt aankondiging, header, megamenu en footer pixel voor pixel naast `reference/pages/dflow-a.html`, `ddash-b.html` en `adash-a.html` op 1440 en 390 px. Bij verschil staan ours, ref en diff in `web/test-results/visual/`.

**Afwijkingen van de referentie (bewust)**

- Donkere modus en de schakelaar "Donkere weergave" in de footerbalk.
- "Cookies" in de footer opent de cookie-instellingen.
- De burger opent een menu (`MobileMenu`); in de referentie doet de knop niets.
- De mobiele onderbalk van de oude site is weg.

**Bekend**

- In `adash-a` lekt de dashboard-CSS naar de shell (`[id^="p-adash-"] form input` op het zoekveld, `[id^="p-adash-"] p` met `text-wrap: pretty` op de footer). De test corrigeert dat in de referentie; bij het dashboard (fase 5) de formulierstijl scopen.
- `next/font` levert iets andere fontbestanden dan de Google-link in de referentie (zelfde letters, andere asbereiken). De visuele test geeft onze pagina daarom dezelfde bestanden; een aparte test controleert dat `next/font` de juiste families laadt.
- Docker is vervangen in fase 1 (zie daar).

## Fase 1 - Datamodel en seed

**Wat werkt**

- Lokale achterkant zonder Docker: `cd directus && npm ci && npm run setup && npm run dev` start PostgreSQL 16 (ingebouwd), Mailpit en Directus 11.17.4. Docker Compose is weg, op verzoek ("zonder Docker").
- Schema: het live schema van productie, omgebouwd naar docs/03 door `directus/schema/migrations/001-datamodel-docs03.mjs` (idempotent, via de API) en vastgelegd in `directus/schema/snapshot.yaml`. Nieuw: `provider_declarations`, `workshop_private`, `session_offers`, `follows`, `cancellation_policies`, `platform_settings` (met de flags `feature_auth_social` en `feature_venues`), `venue_listings`, `venue_listing_images`, `venue_contact_requests`, plus de ontbrekende velden op gebruikers, workshops, datums, aanmeldingen, reviews, workshopgevers en plaatsen.
- Rollen en rechten als code (`directus/seed/access.mjs`): Public, Member (eigen gegevens), Member aanbieder (aanmeldingen op eigen datums, alleen voornaam, initiaal, personen, dieetwens) en Team. `seed/fields.mjs` deelt elk veld van publieke collections in als publiek of prive; een nieuw veld zonder keuze laat de seed stoppen.
- Hook `ww-guards` voor wat rechten niet kunnen: eigenaarschap bij aanmaken, statusovergangen (workshopgever: alleen concept naar check, en live naar weg en terug), vergrendelde datums zodra het minimum gehaald is, vorm van een datum, uniek volgen en bewaren.
- Seeds: 12 categorieen, 5 gelegenheden (zonder Cadeau en Familie), alle 2502 woonplaatsen uit CBS 86312NED, de 3 annuleerregelingen, `platform_settings`. `npm run seed:demo`: Sanne, Luca, Lotte, Mirjam, Noor en de data uit de prototypes (vandaag = ma 9 nov 2026).
- Web: `npm run directus:types` schrijft `web/lib/directus/types.ts` uit `snapshot.yaml`. `lib/directus/client.ts` (getypte clients, alleen server), `model.ts` (vertaling docs/03 en live namen), `settings.ts` (platform_settings met de standaarden uit docs/12).
- Auth-keuze vastgelegd in docs/12: eigen route handlers met Directus als gebruikersbron.
- CI: job `directus` met unit-tests, `npm run verify` (schone Directus uit de code plus rechtentest) en een controle dat `types.ts` bij het schema hoort.

**Hoe je het ziet**

- Directus op http://localhost:8055 (beheerder in `directus/.env`). Demo-accounts `luca@voorbeeld.nl`, `sanne@voorbeeld.nl` enzovoort, wachtwoord `demo-wachtwoord`.
- `npm run test:permissions`: 28 tests voor de rechtenmatrix. `npm test` in `directus/`: 29 tests voor de hook. `npm run verify`: alles op een lege database.

**Bewuste keuzes**

- Live namen blijven waar het begrip al bestond (`cities` = places, `favorites` = saved_workshops, `published` = live, `price_per_person` in euro's in plaats van `price_cents`). De vertaling staat op 1 plek: `web/lib/directus/model.ts`.
- Plaatsen: alle CBS-woonplaatsen staan in `cities`. Status `published` betekent nu "heeft een eigen plaatspagina"; de rest staat op `draft` en is wel kiesbaar. Publiek mag alle plaatsen lezen.
- Aanmeldingen kregen `first_name` en `last_initial`: de workshopgever ziet "Femke D." en nooit `guest_name` of het e-mailadres.
- Een concept-workshop mag zonder prijs, categorie, plaats en duur bewaard worden (autosave in de wizard); die controle hoort bij insturen.
- Deelnemers maken geen aanmeldingen, reviews of annuleringen rechtstreeks in Directus; dat loopt straks via de server (docs/05).
- `venues.city` stond live dubbel en kapot in het schema; de migratie maakt het opnieuw aan als verwijzing naar `cities` (de tabel is leeg).

**Bekend**

- Productie is nog niet aangeraakt. Daar staan 0 workshops, 0 aanmeldingen, 0 datums, 15 plaatsen en 2 gebruikers. De werkwijze staat in `directus/README.md`.
- De bestaande site bepaalt "workshopgever" nog via de rol Provider en registreert met de rollen Customer en Provider. Na de migratie op productie moet dat via de `providers`-rij en de rol Member (fase 3).
- De oude wizard van de site schrijft annuleerwaarden als `flexible_48h`; na de migratie op productie verwijst het veld naar `basis`, `soepel` of `vast`.
- Geen foto's in de demo-seed.
