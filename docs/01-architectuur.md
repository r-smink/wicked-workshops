# 01 - Architectuur

## Stack

- **Frontend:** Next.js (App Router, TypeScript strict, React Server Components waar het kan). Server Actions voor formulieren, Route Handlers voor mail-links en export.
- **Backend:** Directus (huidige stabiele major, gehost op eigen subdomein, bijvoorbeeld `cms.wickedworkshops.nl`) met PostgreSQL. Directus is de enige bron van waarheid voor data, gebruikers, bestanden en geplande taken.
- **SDK:** `@directus/sdk` aan de Next.js-kant, met gegenereerde types.
- **Mail:** via Directus (SMTP-transport) met eigen HTML-templates, of via Next.js met een transactiemailservice. Kies een route en houd alle mailteksten op een plek (`mail/`).
- **Opslag foto's:** Directus Files, met transformaties (presets) voor kaart, omslag en thumbnail.
- **Stijl:** gewone CSS met custom properties, 1 op 1 overgenomen uit de referentie, per pagina als CSS Module. Geen Tailwind-herschrijving.
- **Tests:** Vitest voor bedrijfsregels, Playwright voor de flows.

## Mappen

```
/
  CLAUDE.md
  docs/
  reference/                 (read-only ontwerpreferentie)
  directus/
    schema/snapshot.yaml     (Directus schema-snapshot)
    seed/                    (categorieen, gelegenheden, plaatsen, annuleerregelingen, demo-data)
    extensions/              (eventuele hooks, endpoints en flows als code)
  web/
    app/
      (site)/                (publieke pagina's, buiten dit pakket)
      (auth)/inloggen/ account-maken/ wachtwoord-vergeten/ ...
      (deelnemer)/mijn-account/ ...
      (workshopgever)/workshopgever/ ...
      (locatie)/locatie-gezocht/ ...
      api/                   (route handlers)
    components/
      shell/                 (Announce, Header, Megamenu, Footer)
      ui/                    (Button, Chip, Badge, Field, Stepper, SeatBar, ...)
    lib/
      directus/              (client, server client, types, queries)
      auth/                  (sessie, guards, tokens)
      rules/                 (zuivere bedrijfsregels, 100 procent getest)
      mail/
    content/werkteksten.ts
    styles/
```

## Omgevingen en variabelen

`DIRECTUS_URL`, `DIRECTUS_STATIC_TOKEN` (alleen server, voor beperkte systeemacties), `NEXT_PUBLIC_SITE_URL`, `SESSION_COOKIE_DOMAIN`, `MAIL_FROM`, `CRON_SECRET`. Geen geheimen in de client.

## Hoe Next.js en Directus samenwerken

1. **Publieke data** (live workshops, datums, categorieen): server-side met een publieke policy of statische leestoken, met Next.js caching en tag-revalidatie. Revalideer bij wijziging via een Directus Flow die een webhook naar `/api/revalidate` stuurt.
2. **Ingelogde data**: altijd server-side opgehaald met het token van de gebruiker. De browser praat niet rechtstreeks met Directus, behalve voor bestandsupload (zie hieronder).
3. **Sessie**: Next.js zet access- en refresh-token in `httpOnly`, `secure`, `sameSite=lax` cookies en vernieuwt ze in `middleware.ts`. "Ingelogd blijven op dit apparaat" bepaalt of de refresh-cookie een lange `maxAge` krijgt of een sessiecookie is. Details in `04-auth.md`.
4. **Rechten**: Directus access policies zijn de echte beveiliging (rij- en veldniveau). Next.js-guards zijn alleen voor redirects en UX. Vertrouw nooit op verborgen knoppen.
5. **Privevelden** (adres, verklaring, IBAN): in aparte collections met eigen policies, zodat een fout in een veldfilter niets kan lekken.
6. **Geplande taken** (beslismoment, herinneringen): Directus Flows met cron-trigger, of een beveiligde route `/api/cron/*` die een externe scheduler elke 5 minuten aanroept. De logica zelf staat in `web/lib/rules/` of in een Directus-extension, nooit dubbel.

## Foto's uploaden

De wizard laat 1 tot 6 foto's slepen, herschikken en kiezen als omslag. Upload via een Server Action of een route handler die het bestand naar Directus `/files` doorzet met het token van de gebruiker, in een map `workshops/<workshop-id>`. Valideer type (jpeg, png, webp), grootte (maximaal 10 MB) en minimale afmeting (1200 x 800). Sla volgorde op in de koppeltabel (`workshop_images.sort`); de eerste is de omslag.

## Conventies

- Datums en tijden opslaan in UTC, tonen in `Europe/Amsterdam`. Formaat in de UI: `za 21 nov, 15:00`, `15:00 tot 18:00`, kleine letters voor dagen en maanden, geen punt achter de afkorting.
- Geldbedragen opslaan als hele centen (`price_cents`), tonen als `€39` in de UI. Gebruik `Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' })`.
- Getallen in tabellen met `font-variant-numeric: tabular-nums` (staat al in de CSS).
- Routes in het Nederlands, kleine letters, koppeltekens (`/mijn-account/gepland`). IDs in URL's zijn UUID's, behalve gasttokens (zie `04-auth.md`).
- Elke pagina krijgt een eigen `<title>` en `robots: noindex` (alles in dit pakket is ingelogd of tokengebonden).
- Fouten: nooit onderscheid maken tussen "onbekend e-mailadres" en "fout wachtwoord" (zie `04-auth.md`).

## Types genereren

Gebruik een script `npm run directus:types` dat het schema ophaalt en `web/lib/directus/types.ts` schrijft. Draai het na elke schemawijziging en commit het resultaat.
