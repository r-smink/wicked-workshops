# Wicked Workshops

Monorepo met de site (voorkant en ingelogde kant) en de Directus-achterkant.

| Map | Wat |
|---|---|
| `web/` | Next.js 15 (App Router, TypeScript). Vercel: zet **Root Directory** op `web`. |
| `directus/` | Lokale Directus 11.17.4 met ingebouwde PostgreSQL en Mailpit (geen Docker), plus schema, migraties, seeds, extensie en rechtentest als code. Zie `directus/README.md`. Dit is het schema dat de site gebruikt. |
| `wicked-handoff/` | Het definitieve ontwerp van de voorkant (`design/index.html`, foto's, docs) en de bouwprompt. Read-only: de visuele waarheid. |

```bash
# achterkant (geen Docker nodig)
cd directus && npm ci && npm run setup      # eenmalig
npm run dev                                 # Directus :8055, Mailpit :8025
npm run schema:apply && npm run seed:demo   # eerste keer, in een tweede terminal

# site
cd web && npm install
cp .env.example .env.local                  # DIRECTUS_URL=http://127.0.0.1:8055, token: zie hieronder
npm run dev                                 # http://localhost:3000
npm run lint && npm run typecheck && npm test && npm run build
```

## Voorkant

Het ontwerp in `wicked-handoff/design/index.html` is 1 op 1 nagebouwd. De CSS staat ongewijzigd in `web/styles/voorkant.css` (alleen `@container stage` is `@media` geworden); elke pagina zit in dezelfde wrapper als in het ontwerp (`<div class="page" id="p-...">`, zie `components/voorkant/PageFrame.tsx`), zodat de selectors uit het ontwerp blijven gelden. Kop, megamenu en voet zijn de gedeelde componenten in `components/shell/`.

| Route | Pagina in het ontwerp | Code |
|---|---|---|
| `/` | Home | `app/(voorkant)/page.tsx`, `components/voorkant/home/` |
| `/[plaats]/[categorie]`, bijv. `/utrecht/koken-en-bakken` | Categorie | `app/[slug]/[categorie]/page.tsx`, `components/voorkant/cat/` |
| `/workshops/[slug]` | Workshop, met boeken | `app/(voorkant)/workshops/[slug]/`, `components/voorkant/detail/` |
| `/aanbieders/[slug]` | Aanbieder | `app/(voorkant)/aanbieders/[slug]/`, `components/voorkant/aanbieder/` |
| `/workshops-geven` | Workshopgever | `app/(voorkant)/workshops-geven/`, `components/voorkant/maker/` |
| `/ruimte-gezocht` | Locatie gezocht | `app/(voorkant)/ruimte-gezocht/`, `components/voorkant/locatie/` |
| `/hulp`, `/contact`, `/inloggen` | Hulp, Contact, Inloggen | `app/(voorkant)/...`, `components/voorkant/{hulp,contact,inloggen}/` |

- `nederland` als plaats betekent alle plaatsen (`/nederland/keramiek-en-klei`); `alles` als categorie alle categorieen (`/utrecht/alles`). Links maak je met `lib/routes.ts`.
- Oude routes (`/workshop/...`, `/aanbieder/...`, `/categorie/...`, `/word-workshopgever`, `/locatie-gezocht`) sturen permanent door (`next.config.mjs`).
- Data komt uit Directus in server components via de SDK (`lib/voorkant/data.ts`, publieke rol, alleen gepubliceerde items en publieke velden). Standen van een datum (open, gaat door, gaat niet door, vol) rekent `lib/voorkant/format.ts` uit, overal hetzelfde.
- Formulieren lopen via route handlers die server-side naar Directus schrijven: boeken via `/api/checkout`, contact, ruimte zoeken/bieden en volgen via `/api/forms` (naar `form_submissions`, met honeypot), inloggen via `/api/auth/*`. De browser praat nooit rechtstreeks met Directus.
- Cache: pagina's revalideren elke 5 minuten. Direct verversen: laat een Directus-flow na create/update/delete op publieke collections `POST https://www.wickedworkshops.nl/api/revalidate` aanroepen met header `x-revalidate-secret: <REVALIDATE_SECRET>`.
- SEO en GEO: unieke title, description en canonical per pagina (`lib/voorkant/seo.ts`), Open Graph, `sitemap.xml`, `robots.txt`, `llms.txt`, JSON-LD (Organization, Course met CourseInstance en Event per datum, AggregateRating, FAQPage, BreadcrumbList).
- Foto's: `public/img/` is tijdelijk stockbeeld uit het ontwerp (Pexels), alleen als terugval zolang een workshop, categorie of aanbieder in Directus geen eigen foto heeft (`lib/voorkant/images.ts`). Voor livegang vervangen.
- Teksten die in het ontwerp als "Werktekst" of voorbeeld gemarkeerd zijn, houden die markering tot er definitieve tekst is.

## Omgevingsvariabelen

Lokaal in `web/.env.local`, op Vercel onder **Settings > Environment Variables** (zie `web/.env.example` voor de volledige lijst):

| Variabele | Waarvoor | Scope |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonicals, sitemap, links in mails | Alle omgevingen |
| `DIRECTUS_URL` | Waar de API staat (`https://directus.wickedworkshops.nl`) | Alleen server |
| `DIRECTUS_STATIC_TOKEN` | Server-side token met beperkte rechten | Alleen server, nooit `NEXT_PUBLIC_` |
| `REVALIDATE_SECRET` | Beveiligt `/api/revalidate` | Alleen server |
| `SITE_INDEXABLE` | `1` = zoekmachines toegelaten; leeg = `noindex` overal | Alle omgevingen |
| `OPP_*`, `CRON_SECRET`, `BOOKING_LINK_SECRET`, `FIELD_ENCRYPTION_KEY`, `SMTP_URL` | Betalen (pilot: alleen sandbox), cron, beheerlinks, versleuteling, mail | Alleen server |

Lokaal is het token het `ADMIN_TOKEN` uit `directus/.env`. Gebruik op Vercel nooit een admin-token.

## Uitrollen op Vercel

1. Importeer de repository in Vercel en zet **Root Directory** op `web`. Framework (Next.js), build command en output herkent Vercel zelf; Node 20 of hoger.
2. Zet de omgevingsvariabelen hierboven voor Production en Preview.
3. Laat de site op `noindex` (geen `SITE_INDEXABLE`) zolang er voorbeelddata staat. Zet een wachtwoord op previews via **Settings > Deployment Protection**.
4. Maak in Directus een flow voor de revalidatie-webhook (zie hierboven).
5. Betalen staat in Directus onder **Platform settings > payment_mode**: `off`, `sandbox` (pilot, OPP-testgeld) of `live` (op zijn vroegst januari 2027; nooit vanzelf).

## Contentpagina's (page builder)

Losse contentpagina's (`/[slug]`, bijv. `/over-ons`) komen uit de Directus-collectie `pages` met de blokken in `components/blocks/`. Zie `lib/page-builder.js`. De pagina's uit het ontwerp hierboven zijn vaste schermen en gebruiken de page builder niet.
