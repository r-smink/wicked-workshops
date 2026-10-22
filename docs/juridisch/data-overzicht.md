# Data-overzicht — Wicked Workshops

> **Status:** stand van de code op 22 oktober 2026 (`main`, commit `a88cf3c`), aangevuld met wat er de komende fases bij komt.
> **Legenda:** ✅ = nu in de code · 🔜 = gepland of nodig voor livegang · 💡 = waarschijnlijk later
> **Gebruik:** dit document is meteen de basis voor het **verwerkingsregister** (art. 30 AVG). Dat register is ook voor kleine bedrijven verplicht, omdat de verwerking niet incidenteel is.

---

## 1. Waar staat de data?

| Systeem | Rol | Wat staat er | Locatie | Status |
|---|---|---|---|---|
| **Directus** (`DIRECTUS_URL`) | Database + CMS + gebruikersbeheer + bestandsopslag | Alles: accounts, aanbieders, workshops, boekingen, reviews, content, uploads | `[nog vastleggen: self-hosted of Directus Cloud, en in welk land]` | ✅ |
| **Vercel** | Hosting van de Next.js-site, serverlogs | Tijdelijke requestlogs (IP, URL, user agent) | VS / EU-edge (EU-US Data Privacy Framework) | ✅ |
| **Vercel Web Analytics** | Bezoekstatistiek | Geaggregeerde paginaweergaven, land, apparaat, referrer; geen cookies, gehashte bezoeker-ID per dag | VS | ✅ |
| **Vercel Speed Insights** | Prestaties | Core Web Vitals per pagina, apparaattype | VS | ✅ |
| **Google Tag Manager** (`GTM-NM694S6Z`) | Laadt tags | Afhankelijk van wat er in de container staat (waarschijnlijk GA4, evt. Meta/Google Ads) | VS | ✅ — **zonder toestemming geladen, zie §6** |
| **Google Maps JS API** (`NEXT_PUBLIC_GOOGLE_MAPS_KEY`) | Kaartweergave | IP-adres en kaartinteractie van de bezoeker gaan naar Google | VS | ✅ |
| **Google Geocoding API** (`GOOGLE_GEOCODING_KEY`) | Adres → coördinaten | Adres van aanbieder/workshop/locatie (server-side) | VS | ✅ |
| **Mollie** | Betalingen | Betaling, bedrag, IBAN/kaartgegevens van de betaler, boeking-ID in metadata | NL/EU | ✅ (code klaar, sleutel nog test/fase 2) |
| **Browser van de bezoeker** | Cookies en localStorage | Zie §5 | — | ✅ |
| **E-mailprovider** (transactioneel) | Bevestigingen, betaallinks, reviewverzoeken | Naam, e-mail, boekingsgegevens | `[kiezen — bv. Postmark, Resend, Brevo; bij voorkeur EU]` | 🔜 |
| **Boekhouding/facturatie** | Facturen, self-billing aan aanbieders, zakelijke facturen | NAW, KvK, btw-nummer, bedragen | `[kiezen — bv. Moneybird, e-Boekhouden]` | 🔜 |
| **Mollie Connect** | Doorbetaling aan aanbieders + KYC | Identiteit en bankgegevens aanbieders | NL/EU | 🔜 |
| **Klantenservice/helpdesk** | Klachten en vragen | Correspondentie | `[kiezen]` | 💡 |
| **Nieuwsbrief/marketing** | Mailings | E-mail, voorkeuren, klikgedrag | `[kiezen]` | 💡 |
| **Belastingdienst** (ontvanger) | DAC7-rapportage | Gegevens en inkomsten van aanbieders | NL | 🔜 |

---

## 2. Persoonsgegevens (belangrijkste sectie)

### 2.1 Bezoekers (niet ingelogd)

| Gegeven | Waar | Bron in code | Doel | Grondslag | Status |
|---|---|---|---|---|---|
| IP-adres, user agent, opgevraagde URL | Vercel-logs | Automatisch | Hosting, beveiliging, foutopsporing | Gerechtvaardigd belang | ✅ |
| Geaggregeerd bezoekgedrag | Vercel Analytics | `<Analytics />` in `app/layout.jsx` | Statistiek | Gerechtvaardigd belang (cookieloos) | ✅ |
| Prestatiedata | Vercel Speed Insights | `<SpeedInsights />` | Site sneller maken | Gerechtvaardigd belang | ✅ |
| Cookies/identifiers van Google | Google | GTM | Analyse, evt. advertenties | **Toestemming** (nu nog niet gevraagd) | ✅ ⚠️ |
| IP-adres bij kaartgebruik | Google | `components/Map.jsx` | Kaart tonen | Gerechtvaardigd belang, of toestemming als je de kaart pas na klik laadt | ✅ |
| Zoekopdrachten en filters (stad, categorie) | Alleen in URL/state | `zoeken`, `categorie` | Zoekresultaten tonen | — (niet opgeslagen) | ✅ |
| Voorkeur thema en demomodus | localStorage (`ww-theme`, demomodus) | `ThemeProvider`, `DemoModeProvider` | Functioneel | Geen toestemming nodig (strikt functioneel) | ✅ |

### 2.2 Deelnemers / klanten

| Gegeven | Directus-collectie.veld | Bron in code | Doel | Grondslag | Status |
|---|---|---|---|---|---|
| E-mailadres | `directus_users.email` | `api/auth/register` | Account, inloggen | Overeenkomst | ✅ |
| Wachtwoord (gehasht door Directus) | `directus_users.password` | `api/auth/register` | Inloggen | Overeenkomst | ✅ |
| Voor- en achternaam | `directus_users.first_name/last_name` | `api/auth/register` | Account, boeking | Overeenkomst | ✅ |
| Rol (bezoeker/aanbieder) | `directus_users.role` | `lib/auth.js` | Toegang | Overeenkomst | ✅ |
| Laatste login, IP, user agent | `directus_users`, `directus_sessions`, `directus_activity` | Directus intern | Beveiliging, audit | Gerechtvaardigd belang | ✅ (Directus logt dit standaard) |
| Sessietoken + gebruikerssamenvatting (id, e-mail, naam) | Cookies `ww_token`, `ww_user` (httpOnly, 7 dagen) | `lib/auth.js` | Ingelogd blijven | Strikt functioneel | ✅ |
| **Gastboeking:** naam en e-mail | `bookings.guest_name/guest_email` | `api/checkout` | Boeking uitvoeren | Overeenkomst | ✅ |
| Boeking: code, aantal deelnemers, prijs, totaal, status, sessie, workshop, aanbieder, klant-ID | `bookings.*` | `api/checkout` | Boeking, administratie | Overeenkomst + wettelijke plicht (fiscaal) | ✅ |
| Betaalstatus, Mollie payment-ID, betaaldatum | `bookings.payment_status/payment_id/paid_at` | `api/webhooks/mollie` | Betaling verwerken | Overeenkomst | ✅ |
| Rekeningnummer/kaartgegevens van de betaler | **Alleen bij Mollie** (niet in Directus) | Mollie checkout | Betaling, terugbetaling | Overeenkomst (Mollie is eigen verantwoordelijke) | ✅ |
| Reviews: score, tekst, datum, koppeling aan workshop/aanbieder, **naam van de reviewer (openbaar)** | `reviews.*` | Dashboard/WorkshopPage | Reviews tonen | Gerechtvaardigd belang / toestemming bij plaatsen | ✅ (lezen), 🔜 (schrijven) |
| Telefoonnummer (voor wijzigingen op de dag zelf) | `bookings.guest_phone` | — | Contact bij afgelasting | Overeenkomst | 🔜 |
| Namen van mede-deelnemers | `bookings.attendees` | — | Deelnemerslijst aanbieder | Overeenkomst | 💡 |
| **Dieetwensen, allergieën, fysieke beperkingen** | `bookings.notes` / `dietary` | Workshop heeft `diet`-filters | Veilige uitvoering | **Uitdrukkelijke toestemming** (gezondheidsgegeven, art. 9 AVG) | 🔜 — zie §2.6 |
| Leeftijd of geboortejaar deelnemer (bij 18+ of kinderworkshops) | — | `age_rating` | Leeftijdseis controleren | Wettelijke plicht (Alcoholwet) / overeenkomst | 💡 |
| Favorieten | `favorites` | Belofte in `SIDE_COPY` | Account-functie | Overeenkomst | 🔜 |
| Cadeaubon: koper (naam, e-mail), ontvanger (naam, e-mail, persoonlijk bericht), code, saldo, inwisselingen | `giftcards`, `giftcard_redemptions` | `/cadeaubon` | Bon leveren en verzilveren | Overeenkomst (koper); gerechtvaardigd belang (ontvanger) | 🔜 |
| Klachten en correspondentie | Helpdesk / `complaints` | — | Klachtafhandeling | Overeenkomst / wettelijke plicht | 🔜 |
| Akkoord op voorwaarden: tijdstip + versie | `bookings.terms_version/terms_accepted_at` | — | Bewijs toepasselijkheid AV | Gerechtvaardigd belang | 🔜 |
| Nieuwsbriefinschrijving | Mailtool | — | Marketing | Toestemming (of soft opt-in voor bestaande klanten, art. 11.7 Tw) | 💡 |

### 2.3 Zakelijke klanten (groepsboekingen)

| Gegeven | Waar | Doel | Grondslag | Status |
|---|---|---|---|---|
| Contactpersoon: naam, e-mail, telefoon, functie | `group_requests` | Offerte, uitvoering | Overeenkomst / precontractueel | 🔜 |
| Bedrijfsnaam, KvK, btw-nummer, factuuradres, PO-nummer | `group_requests` / boekhouding | Facturatie | Overeenkomst + wettelijke plicht | 🔜 |
| Groepsgrootte, budget, gewenste datum, wensen | `group_requests` | Voorstel op maat | Overeenkomst | 🔜 |

### 2.4 Workshopgevers (aanbieders)

Let op: een eenmanszaak of particuliere aanbieder is een natuurlijk persoon — al deze gegevens zijn dan persoonsgegevens.

| Gegeven | Directus-collectie.veld | Bron in code | Doel | Grondslag | Status |
|---|---|---|---|---|---|
| Voor- en achternaam, e-mail | `directus_users` | `api/providers/me` | Account | Overeenkomst | ✅ |
| Telefoonnummer | `providers.details.phone` | `ProviderProfileForm` | Contact | Overeenkomst | ✅ |
| **Geboortedatum** | `providers.details.birth_date` | `ProviderProfileForm` | DAC7-rapportage (verplicht voor natuurlijke personen) | Wettelijke plicht | ✅ |
| Factuur-/woonadres (straat, huisnummer, toevoeging, postcode, plaats, land) | `providers.details.billing_*` | `ProviderProfileForm` | Facturatie, DAC7 | Overeenkomst + wettelijke plicht | ✅ |
| Bedrijfsnaam, KvK-nummer, btw-nummer, btw-plichtig, KOR | `providers.kvk_number/vat_number`, `providers.details.company_name/vat_liable/kor` | `ProviderProfileForm` | Facturatie, btw, handelaarsstatus | Wettelijke plicht + overeenkomst | ✅ |
| **IBAN en tenaamstelling** | `providers.details.iban/account_holder` (volledig!) + `providers.payout_iban_last4` | `api/providers/me` | Uitbetaling, DAC7 | Overeenkomst + wettelijke plicht | ✅ ⚠️ zie §6 |
| Akkoord voorwaarden + commissie | `providers.details.terms` | `ProviderProfileForm` | Bewijs | Gerechtvaardigd belang | ✅ (alleen ja/nee, geen tijdstip/versie) |
| **Openbaar profiel:** weergavenaam, vakgebied, korte en lange bio, talen, actief sinds, website, Instagram, stad, buurt, locatienaam | `providers.*` | `ProviderProfileForm` | Publicatie op het platform | Overeenkomst | ✅ |
| Lesadres (kan het woonadres zijn als `location_same = true`!) + coördinaten | `providers.address/postal_code/lat/lng` | `api/providers/me`, `api/geocode` | Kaart, route | Overeenkomst | ✅ ⚠️ zie §6 |
| Toegankelijkheid (rolstoel, parkeren, OV) | `providers.details.*` | `ProviderProfileForm` | Info voor deelnemers | Overeenkomst | ✅ |
| Groepen, max. groepsgrootte | `providers.accepts_groups/max_group_size` | `ProviderProfileForm` | Groepsaanvragen | Overeenkomst | ✅ |
| Afgeleide statistieken: rating, aantal reviews, deelnemers, responstijd, `verified`, `is_top_rated` | `providers.*` | Directus | Ranking en vertrouwen | Gerechtvaardigd belang | ✅ |
| Foto's en video's (kunnen personen bevatten) | `directus_files` + `workshops.media` | `api/upload` | Publicatie | Overeenkomst; toestemming van herkenbare personen is verantwoordelijkheid van de aanbieder | ✅ |
| Commissie, uitbetalingen, facturen (self-billing) | `payouts`, boekhouding | Dashboard "Uitbetalingen" | Uitbetaling, administratie | Overeenkomst + wettelijke plicht | 🔜 |
| **DAC7:** fiscaal identificatienummer (BSN/RSIN of buitenlands TIN), land van vestiging, inkomsten en aantal transacties per kwartaal, ontvangen commissie | `providers.tax_*` + rapportage | — | Jaarlijkse melding aan de Belastingdienst (vóór 31 januari) | Wettelijke plicht (Wet implementatie DAC7) | 🔜 |
| **KYC via Mollie Connect:** ID-document, UBO's, bankverificatie | **Bij Mollie** | — | Witwasregels | Wettelijke plicht (Mollie) | 🔜 |
| Bewijs bedrijfsaansprakelijkheidsverzekering, evt. HACCP/certificaten | `providers.documents` | — | Kwaliteit | Overeenkomst / gerechtvaardigd belang | 💡 |
| Opschortingen, waarschuwingen en motivering (P2B/DSA) | `provider_moderation` | — | Statement of reasons | Wettelijke plicht | 🔜 |

### 2.5 Locatie-eigenaren (venues)

| Gegeven | Veld | Doel | Grondslag | Status |
|---|---|---|---|---|
| Contactpersoon: naam, e-mail, telefoon | `venues.contact_name/contact_email/contact_phone` | Contact over verhuur | Gerechtvaardigd belang / overeenkomst | ✅ |
| Adres, coördinaten, capaciteit, prijs per uur, oppervlakte, voorzieningen | `venues.*` | Publicatie | Overeenkomst | ✅ |

### 2.6 Bijzondere en gevoelige gegevens

| Gegeven | Waarom gevoelig | Advies |
|---|---|---|
| Allergieën, dieet, beperkingen, zwangerschap (bij wellness, koken, actief) | Gezondheidsgegeven (art. 9 AVG) | Vrij tekstveld vermijden. Gebruik vaste keuzes; vraag uitdrukkelijke toestemming met een los, niet voor-aangevinkt vakje; deel alleen met de betreffende aanbieder; verwijderen **30 dagen** na de workshop. "Vegetarisch/vegan" is meestal geen gezondheidsgegeven, "glutenvrij/notenallergie" wel. Halal kan levensbeschouwing onthullen — ook als bijzonder gegeven behandelen. |
| Gegevens van kinderen (kinderfeestjes) | Minderjarigen | Alleen de ouder boekt en geeft gegevens; vraag niet meer dan voornaam en leeftijd. Account aanmaken pas vanaf **16 jaar** (art. 8 AVG / art. 5 UAVG). |
| BSN (DAC7, alleen voor eenmanszaken zonder ander TIN) | Wettelijk beschermd nummer (art. 46 UAVG) | Alleen verwerken omdat de wet het voorschrijft; versleuteld opslaan, beperkte toegang. Bij een KvK-ingeschreven eenmanszaak kan vaak het RSIN/btw-ID volstaan — check dit met de fiscalist. |
| Foto's van deelnemers | Kunnen indirect iets onthullen | Herkenbare foto's alleen met toestemming (portretrecht + AVG). |

---

## 3. Bewaartermijnen (voorstel)

| Categorie | Termijn | Reden |
|---|---|---|
| Account (klant) | Tot verwijdering door de gebruiker, of **2 jaar** na laatste activiteit (eerst waarschuwingsmail) | Dataminimalisatie |
| Boekingen + betalingen + facturen | **7 jaar** na het boekjaar | Fiscale bewaarplicht (art. 52 AWR, art. 2:10 BW) |
| Gastgegevens (naam, e-mail) los van de boeking | Na 7 jaar, of eerder pseudonimiseren als de boeking alleen nog fiscaal nodig is | Dataminimalisatie |
| Gezondheidsgegevens bij een boeking | **30 dagen** na de workshop | Alleen nodig voor uitvoering |
| Cadeaubonnen | **7 jaar** na laatste inwisseling of vervaldatum | Fiscaal + verjaring (5 jaar) |
| Reviews | Zolang de workshop/aanbieder online is; na verwijdering van het account geanonimiseerd ("Een deelnemer") | Gerechtvaardigd belang |
| Aanbiedersprofiel na beëindiging | Openbaar profiel direct offline; administratie **7 jaar** | Fiscaal |
| DAC7-gegevens | **10 jaar** na het rapportagejaar `[laten bevestigen — de richtlijn schrijft 5 tot 10 jaar voor]` | Wettelijke plicht |
| Klachten | **2 jaar** na afhandeling | Bewijs |
| Moderatiebesluiten (P2B/DSA) | **[2 jaar]** | Bewijs en transparantieverslag |
| Serverlogs (Vercel) | Volgens Vercel-plan (± 1 tot 30 dagen) | Beveiliging |
| Directus activity- en revisielog | **[12 maanden]** — instellen, staat standaard onbeperkt aan | Audit |
| Sessiecookie `ww_token` / `ww_user` | 7 dagen | Functioneel |
| Analytics (GA4) | **14 maanden** (instellen in GA4, standaard is 2 maanden) | Statistiek |
| Marketingtoestemming | Tot intrekking + bewijs 2 jaar daarna | Bewijs toestemming |

---

## 4. Wie heeft toegang en met wie wordt gedeeld?

| Ontvanger | Wat | Rol AVG | Nodig |
|---|---|---|---|
| **Workshopgever** | Naam, e-mail (en later telefoon, dieetwensen) van deelnemers van de eigen boekingen | Zelfstandig verwerkingsverantwoordelijke voor de uitvoering (model A) | Afspraken in de aanbiedersvoorwaarden: alleen gebruiken voor deze workshop, niet voor eigen marketing zonder toestemming |
| **Mollie** | Bedrag, omschrijving (`workshoptitel · boekingscode`), metadata (booking-ID), betaalgegevens | Zelfstandig verwerkingsverantwoordelijke voor betaaldiensten | Mollie-voorwaarden accepteren; noemen in privacyverklaring |
| **Directus-hosting** | Alles | Verwerker | Verwerkersovereenkomst |
| **Vercel** | Requestdata, analytics | Verwerker | DPA (standaard in Vercel-voorwaarden) |
| **Google** (GTM, GA4, Maps, Geocoding) | Identifiers, IP, adressen | Verwerker (GA4, Maps-API) / deels eigen verantwoordelijke (advertenties) | Google Ads Data Processing Terms accepteren; IP-anonimisering; toestemming |
| **E-mailprovider** | Naam, e-mail, inhoud mails | Verwerker | Verwerkersovereenkomst |
| **Boekhouder / boekhoudsoftware** | Financiële gegevens | Verwerker | Verwerkersovereenkomst |
| **Belastingdienst** | DAC7-gegevens aanbieders | Ontvanger op grond van de wet | — |
| **Andere aanbieders/bezoekers** | Openbaar profiel aanbieder, reviewnaam | Openbaar | Melden bij invullen |

**Intern** — leg vast wie in Directus admin-rechten heeft. De `DIRECTUS_STATIC_TOKEN` heeft adminrechten (nodig voor registratie): die token mag nooit in de browser terechtkomen (gebeurt nu ook niet) en moet periodiek worden geroteerd.

---

## 5. Cookies en lokale opslag

| Naam | Type | Doel | Duur | Toestemming nodig? |
|---|---|---|---|---|
| `ww_token` | Cookie, httpOnly | Directus-sessietoken | 7 dagen | Nee — strikt noodzakelijk |
| `ww_user` | Cookie, httpOnly | Naam/e-mail voor snelle checks | 7 dagen | Nee |
| `ww-theme` | localStorage | Licht/donker | Blijvend | Nee |
| Demomodus-sleutel | localStorage | Demo-afbeeldingen aan/uit | Blijvend | Nee (en weghalen bij livegang) |
| Vercel Analytics | Geen cookie | Statistiek | — | Nee, mits je dit in de verklaring noemt |
| `_ga`, `_ga_*` (via GTM) | Cookie | Google Analytics | 2 jaar | **Ja**, tenzij volledig privacyvriendelijk ingesteld — en zelfs dan adviseert de AP toestemming bij GA4 |
| Google Ads / Meta-pixel (indien in GTM) | Cookie | Advertenties, conversies | 3 mnd – 2 jaar | **Ja** |
| Mollie checkout-cookies | Cookie op mollie.com | Betaling | Sessie | Nee (andere domeinnaam, functioneel) |
| Google Maps | Cookies/identifiers van Google | Kaart | Variabel | Grijs gebied — veilig: kaart pas laden na klik of na toestemming |

---

## 6. Bevindingen die je vóór livegang moet oplossen

> **Update 22-10-2026:** punten 1 t/m 6 zijn in de code aangepakt. GTM laadt pas na toestemming (cookiebanner + Consent Mode v2), het IBAN wordt versleuteld met `FIELD_ENCRYPTION_KEY`, het openbare profiel en de workshoppagina's bevatten geen lesadres meer en de coördinaten zijn afgerond op ±1 km. Het volledige adres staat alleen op de bevestigde boeking. Het akkoord van workshopgevers wordt opgeslagen met tijdstip en versie, en de checkout en registratie linken naar de voorwaarden en de privacyverklaring. Nog open: punten 7 en 8, de pagina's `/voorwaarden`, `/voorwaarden-workshopgevers` en `/privacy` in Directus, en het tijdstip en de versie van het akkoord bij boekingen (daarvoor is een nieuw veld in `bookings` nodig).

1. **GTM laadt zonder toestemming** (`app/layout.jsx`). Volgens art. 11.7a Telecommunicatiewet mag dat niet voor analytics/advertentietags zonder toestemming. De AP controleert hier sinds 2024 actief op. → Cookiebanner met Google **Consent Mode v2** (bv. Cookiebot, CookieYes, Klaro), met een even zichtbare "Weigeren"-knop.
2. **IBAN staat volledig in `providers.details`** (een JSON-veld), terwijl er ook al `payout_iban_last4` is. Het lijkt de bedoeling dat alleen de laatste vier cijfers worden bewaard. → Met Mollie Connect beheert Mollie het rekeningnummer en hoef je het zelf niet op te slaan; zo niet, versleutelen op veldniveau en lees-rechten beperken.
3. **Woonadres kan openbaar worden.** Met `location_same = true` (standaard aan) wordt het factuuradres het lesadres, en dat gaat met coördinaten naar de kaart. Voor thuiswerkende aanbieders is dat hun woonadres. Er bestaat al `address_visibility` op workshops — gebruik dat ook voor aanbieders: standaard alleen buurt tonen, exact adres pas in de boekingsbevestiging.
4. **Geboortedatum en andere `details`-velden** zijn alleen nodig voor DAC7 en facturatie, niet voor het openbare profiel. `PROVIDER_FIELDS` haalt `details` (met IBAN, geboortedatum, woonadres) op bij de **publieke** profielquery (`getProvider` op `/aanbieder/[slug]`). Nu wordt `provider` daar nog niet aan de client component doorgegeven, maar zodra iemand dat doet, staan die gegevens in de HTML-payload van een openbare pagina. → Een aparte, beperkte veldlijst voor publieke queries maken zonder `details`.
5. **Geen tijdstip/versie bij akkoord** op voorwaarden (`terms: true`). → `terms_accepted_at` en `terms_version` opslaan.
6. **Geen verwijzing naar voorwaarden en privacyverklaring** in de checkout en registratie.
7. **Verwerkersovereenkomsten** afsluiten of vastleggen: Directus-hosting, Vercel, Google, e-mailprovider, boekhouder.
8. **Directus-logs** (`directus_activity`, revisies) bewaren standaard alles, inclusief oude waarden van gewijzigde persoonsgegevens. → Bewaartermijn instellen (Directus: `ACTIVITY_RETENTION`, `REVISIONS_RETENTION` env-variabelen).

---

## 7. Niet-persoonlijke data (volledigheid)

| Collectie | Inhoud | Status |
|---|---|---|
| `workshops` | Titel, teksten, duur, niveau, prijs, groepsgrootte, annuleringsbeleid, `instant_bookable`, `giftcard_eligible`, locatie, rating-aggregaten, badge, `featured`, leeftijdsklasse | ✅ |
| `workshop_sessions` | Start/eind, capaciteit, bezette plekken, status, prijs-override, privé | ✅ |
| `workshop_faq`, `inclusions`, `media` | FAQ, wat er inbegrepen is, foto's | ✅ |
| `categories`, `cities`, `age_ratings` | Taxonomie | ✅ |
| `articles`, `article_faq` | Blog/inspiratie | ✅ |
| `pages`, `seo_pages`, menu's | CMS-content | ✅ |
| `venues` | Zaalverhuur (bevat contactpersoon, zie §2.5) | ✅ |
| `directus_files` | Uploads (foto's/video's — kunnen personen tonen) | ✅ |
| Kortingscodes / acties | Code, waarde, geldigheid, gebruik | 💡 |
| Commissie-instellingen, uitbetaalbatches | Financieel | 🔜 |
| Juridische versies (AV, privacy) | Tekst + versienummer + datum | 🔜 |
