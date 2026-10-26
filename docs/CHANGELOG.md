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
- Docker is lokaal nog niet gestart (niet geinstalleerd op de bouwmachine); de compose-bestanden zijn niet getest.
