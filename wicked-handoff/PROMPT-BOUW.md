# Bouwprompt: Vercel en Directus

Gebruik dit nadat het ontwerp is bijgewerkt (zie `PROMPT.md`), of in plaats daarvan als je het ontwerp zo laat. Kopieer alles onder de streep in Claude Code, gestart in `wicked-handoff`.

---

Bouw het ontwerp in `design/index.html` na als echte website met Next.js (App Router, TypeScript) voor Vercel, en Directus als backend. Lees eerst `CLAUDE.md`, `docs/ontwerp.md`, `docs/secties.md` en `docs/beeldmap.md`. Het ontwerp is de visuele waarheid: pixel-trouw nabouwen, geen eigen ontwerpkeuzes.

## Stappen
1. Maak in de root een Next.js-project (`web/`) met TypeScript en ESLint. Zet de CSS-variabelen uit `:root` in een globale stylesheet en laad Bricolage Grotesque en Plus Jakarta Sans met `next/font` (zelf gehost, niet via de Google-CDN). Kopieer de foto's naar `web/public/img/` en gebruik `next/image`.
2. Splits de gedeelde delen in componenten: kop met megamenu, footer, workshopkaart, datumregel met stand, filterchips, pilotband, reviewkaart, FAQ, formulierblokken, SVG-iconen. Gedeelde componenten komen overal vandaan hetzelfde.
3. Maak routes: `/` (home), `/[plaats]/[categorie]` (bijvoorbeeld `/utrecht/kookworkshops`), `/workshops/[slug]`, `/aanbieders/[slug]`, `/workshops-geven`, `/ruimte-gezocht`, `/hulp`, `/contact`, `/inloggen`. Vervang de `#p-...`-links uit het ontwerp door deze routes.
4. Zet het ontwerpsteigerwerk niet over: de reviewbalk (`.tools`), `#stage`, de paginakiezer en de localStorage-staat vervallen. Responsive via gewone `@media`-breekpunten, vertaald van de `@container stage`-waarden.
5. Zet het gedrag uit de scripts over naar React (client-componenten waar nodig): filters met tellers en lege-staat-melding, datumkiezer met aantal en prijs, weekraster met filter op stand, hulpzoekfunctie, rolkeuze op inloggen, megamenu met Escape en focusbeheer.
6. Het Directus-schema, de rechten en de voorbeelddata staan al klaar in `directus/` (zie `directus/README.md`; draai eerst op een lokale of staging-Directus). Gebruik die en pas ze alleen aan als het ontwerp iets nodig heeft dat ontbreekt. Haal data op in server-componenten met de Directus SDK; cache met `revalidate` en revalidate via een Directus-webhook naar een route handler.
7. Formulieren (boeken, contact, aanmelden, ruimte zoeken of bieden) gaan via Next.js route handlers die server-side naar Directus schrijven met een beperkt token (alleen aanmaken in `bookings`, `messages`, `room_requests`), nooit rechtstreeks vanuit de browser en nooit met het admin-token. Inloggen gebruikt Directus-auth. Valideer server-side, beveilig tegen spam (honeypot of Turnstile) en geef de bevestigingsschermen uit het ontwerp.
8. SEO en GEO standaard: unieke title en meta per pagina, canonical, Open Graph, `sitemap.xml`, `robots.txt`, `llms.txt`, gestructureerde data (Organization, Event of Course voor workshops, AggregateRating, FAQPage, BreadcrumbList) op basis van Directus-data.
9. Toegankelijkheid en prestaties: alle `aria`-gedrag behouden, focusstijlen, `prefers-reduced-motion`, afbeeldingen met `alt`, Lighthouse mobiel boven 90.
10. Maak `.env.example` met `DIRECTUS_URL`, `DIRECTUS_STATIC_TOKEN` (alleen server-side) en `NEXT_PUBLIC_SITE_URL`. Zet geen geheimen in de repo. Beschrijf in `README.md` hoe je lokaal draait en hoe je op Vercel uitrolt (root directory `web`, omgevingsvariabelen).

## Directus-datamodel (afgeleid van het ontwerp)
- `categories`: naam, slug, intro, seo_tekst, afbeelding, volgorde.
- `cities`: naam, slug, regio.
- `providers` (aanbieders): naam, slug, foto, verhaal, type (`particulier` of `bedrijf`), plaats, gekoppelde user.
- `workshops`: titel, slug, korte_tekst, wat_je_doet, inbegrepen, praktisch, prijs_per_persoon, duur, min_deelnemers (leeg = geen minimum), max_deelnemers, categorie, aanbieder, plaats, ruimte, annuleerregels, zakelijk_mogelijk, galerij (files), status.
- `sessions` (datums): workshop, start, eind, beslismoment, bezet (berekend uit bookings), status.
- `spaces` (ruimtes): naam, soort (`keuken`, `atelier`, `zaal`), plaats, capaciteit, vrije_dagdelen (json), foto, eigenaar-contact.
- `bookings`: sessie, naam, e-mail, aantal, status, aangemaakt.
- `reviews`: workshop, naam, score, tekst, datum, gepubliceerd.
- `help_topics` en `faqs`: groep (`meedoen`, `workshop_geven`), vraag, antwoord, volgorde.
- `messages` (contact): onderwerp, naam, e-mail, workshop of boeking (optioneel), bericht, zakelijk (boolean).
- `room_requests`: soort aanvraag (zoeken of bieden), gegevens.
- Gebruikersrollen in Directus: deelnemer en workshopgever. Publieke rol alleen lezen op gepubliceerde content; schrijven alleen via eigen formulier-endpoints.

## Standen van een datum
Vier standen, overal gelijk en berekend op de server: **open** (minimum nog niet gehaald, toon "X van Y nodig" en het beslismoment), **door** (minimum gehaald of er is geen minimum, wijzigt niet meer behalve bij annuleren door de workshopgever), **niet door** (minimum niet gehaald op het beslismoment, deelnemer krijgt een andere datum aangeboden) en **vol** (alle plekken bezet). In het ontwerp staan ze als `data-stand` met de waarden `open`, `door`, `vol` en `geenmin` (geen minimum). Een Directus-flow of cron zet de stand op het beslismoment om en stuurt de bevestigingsmails. Tijdens de pilot betaalt de deelnemer niets.

## Regels
Gelden ook hier: nooit em-dashes of en-dashes (alleen `-`), geen verzonnen contactgegevens (mailadres blijft `[e-mailadres volgt]`), voorbeelddata herkenbaar houden, tone of voice je-vorm en zinsvorm. Werk in kleine stappen, draai na elke stap `npm run build` en `npm run lint`, en vergelijk screenshots met het ontwerp op 1440 en 390 px. Commit niet tenzij ik daarom vraag. Sluit af met een lijst van wat klaar is en wat openstaat.
