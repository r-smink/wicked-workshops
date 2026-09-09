# Wicked Workshops - front-end prototype

Next.js 15 project met het volledige prototype: tien schermen op een gedeelde basis, klaar om te deployen naar Vercel.

Dit is nog een prototype op vaste voorbeelddata. Er is nog geen Directus-koppeling, geen betaling en geen echte authenticatie. Het doel is om het geheel te kunnen tonen, doorklikken en testen op echte apparaten.

## Wat er in zit

| Scherm | Wat je ziet |
|---|---|
| Homepage | Hero met zoekveld, categorieen, zo werkt het, uitgelicht aanbod, teamuitjes, reviews |
| Aanbod | Filterpaneel met zestien groepen, kaartweergave, SEO-tekst, interne links |
| Workshop | Galerij, feitenrij, beschrijving, reviews met subscores, FAQ, boekblok |
| Aanbiederprofiel | Statistieken, sfeerimpressie, workshops, reviews, contactkaart |
| Blogarchief | Uitgelicht artikel, filters per onderwerp, meer laden |
| Blogartikel | Kort antwoord, inhoudsopgave, FAQ, gerelateerde workshops |
| Inloggen en registreren | Twee tabs: bezoeker en workshopgever, met driestapsflow |
| Profiel workshopgever | Zeven secties met NAW, KvK, btw, profiel, locatie, uitbetaling |
| Nieuwe workshop | Wizard in zes stappen met live voorbeeldkaart |
| Dashboard | Overzicht, workshops, agenda, boekingen, reviews, uitbetalingen, profiel |

Bovenaan staat een donkere balk om tussen de schermen te springen. Die hoort niet bij het product en haal je weg zodra de echte routes bestaan (zie hieronder).

## Deployen naar Vercel

Er zijn twee manieren. De eerste is de gebruikelijke, de tweede is sneller als je alleen even wilt kijken.

### Optie 1: via GitHub (aanbevolen)

Zo krijg je automatisch een nieuwe preview bij elke wijziging.

```bash
# 1. In de map van dit project
git init
git add .
git commit -m "Wicked Workshops prototype"

# 2. Maak een lege repository aan op github.com en koppel hem
git remote add origin https://github.com/<jouw-account>/wicked-workshops.git
git branch -M main
git push -u origin main
```

Ga daarna naar [vercel.com/new](https://vercel.com/new), kies **Import Git Repository** en selecteer de repository. Vercel herkent Next.js zelf, dus je hoeft niets in te stellen:

| Instelling | Waarde | Actie |
|---|---|---|
| Framework Preset | Next.js | Wordt automatisch herkend |
| Root Directory | `./` | Laat staan |
| Build Command | `next build` | Laat staan |
| Output Directory | standaard | Laat staan |
| Install Command | `npm install` | Laat staan |
| Node.js Version | 20.x of hoger | Alleen wijzigen als er een oudere staat |

Klik op **Deploy**. Na ongeveer een minuut staat het live op een `.vercel.app` adres.

### Optie 2: rechtstreeks vanaf je laptop

```bash
npm i -g vercel
vercel          # preview-omgeving
vercel --prod   # productie
```

De eerste keer stelt de CLI een paar vragen. Antwoord met de standaardwaarden, behalve de projectnaam.

## Lokaal draaien

Node 20 of hoger.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Test het mobiele gedrag met de apparaatweergave in de browser (Chrome: F12, dan het telefoonicoon) op 390 of 430 pixels breed. Onder 768 pixels schakelen de carrousels, de zijlade, de kaartweergave en de "Lees meer" blokken aan.

## Omgevingsvariabelen

Er is er nog niet één nodig om te deployen: het prototype draait volledig op vaste data. `.env.example` staat er alvast voor de volgende fase.

Zodra je Directus koppelt, zet je ze in Vercel onder **Settings > Environment Variables**:

| Variabele | Waarvoor | Scope |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonicals en metadata | Alle omgevingen |
| `DIRECTUS_URL` | Waar de API staat | Alle omgevingen |
| `DIRECTUS_STATIC_TOKEN` | Server-side lezen | Alleen server, nooit `NEXT_PUBLIC_` |
| `REVALIDATE_SECRET` | Beveiligt de revalidatie-webhook | Alleen server |
| `MOLLIE_API_KEY` | Betalingen, fase 2 | Alleen server |

Alles wat met `NEXT_PUBLIC_` begint komt in de browser terecht. Zet daar dus nooit een token in.

## Belangrijk voordat dit echt live gaat

**De site staat nu op `noindex`.** In `app/layout.jsx` staat `robots: { index: false, follow: false }`. Dat is bewust: een prototype met verzonnen aanbod en verzonnen reviews wil je niet in Google hebben. Zet dit pas op `true` als er echte data staat, anders duurt het weken voordat de nepversie weer uit de index is.

**Zet een wachtwoord op de preview.** In Vercel onder **Settings > Deployment Protection** kun je Vercel Authentication of een wachtwoord aanzetten. Handig zolang je dit met klanten of investeerders deelt.

**De reviews en aanbieders zijn verzonnen.** Marco Rossi bestaat niet. Zolang de site afgeschermd is, is dat prima. Zodra hij openbaar wordt, moeten verzonnen reviews eruit, ook als dat het scherm leger maakt.

## Van prototype naar echte site

Het prototype gebruikt een statusrouter in `components/WickedApp.jsx`. Dat werkt om te tonen, maar levert één URL op, en dus geen indexeerbare pagina's, geen deelbare links en geen werkende terugknop.

De volgende stap is die router vervangen door echte routes uit hoofdstuk 5 van de projectblauwdruk:

```
app/
├── page.jsx                                  HomePage
├── zoeken/page.jsx                           ListingPage
├── categorie/[category]/page.jsx             ListingPage
├── categorie/[category]/[city]/page.jsx      ListingPage (money page)
├── workshop/[slug]/page.jsx                  WorkshopPage
├── aanbieder/[slug]/page.jsx                 ProviderPage
├── inspiratie/page.jsx                       BlogIndexPage
├── inspiratie/[slug]/page.jsx                ArticlePage
├── inloggen/page.jsx                         AuthPage
└── dashboard/
    ├── layout.jsx                            zijnavigatie
    ├── page.jsx                              overzicht
    ├── workshops/nieuw/page.jsx              WorkshopWizard
    └── profiel/page.jsx                      ProviderProfileForm
```

De praktische volgorde:

1. Knip `components/WickedApp.jsx` op in losse bestanden. De componentnamen komen al overeen met hoofdstuk 9.2 van de blauwdruk, dus dit is verplaatsen, niet herschrijven.
2. Zet de stylesheet in `app/globals.css` of zet hem om naar Tailwind met de tokens als bron.
3. Vervang `go({ name: ... })` door `next/link` en `useRouter`.
4. Haal de prototypebalk uit `WickedApp` weg.
5. Vervang de vaste arrays (`FEATURED`, `LISTING`, `MARCO_WORKSHOPS`) door Directus-queries in server components.
6. Zet `robots` weer op indexeerbaar en voeg de sitemap, `llms.txt` en de schema.org-blokken toe uit hoofdstuk 8.

Pas na stap 5 heeft server rendering echt zin. Zolang alles vaste data is, maakt het voor SEO geen verschil.

## Vragen die vaak terugkomen

**Waarom staat alles in één bestand?**
Zodat het prototype zelfstandig werkt en je het in één keer kunt bekijken of ergens anders kunt inplakken. Voor de echte bouw gaat het uit elkaar, zie hierboven.

**Waarom `"use client"` bovenaan?**
De schermen gebruiken `useState` voor filters, tabs en formulieren. In de echte bouw worden de publieke pagina's server components en blijven alleen de interactieve delen client components.

**Kan ik hier een eigen domein aan hangen?**
Ja, in Vercel onder **Settings > Domains**. Zolang dit een prototype is, zou ik daar `preview.` of `demo.` voor gebruiken en niet je hoofddomein, want die wil je schoon houden voor de echte site.

**Waar zijn de foto's?**
Bewust placeholders. De brand guide vraagt om echte mensen en echte momenten, en dat is precies wat een prototype niet kan faken. De plekken, verhoudingen en het gedrag kloppen wel, dus foto's toevoegen is straks een vervanging en geen verbouwing.
