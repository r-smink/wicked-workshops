# 12 - Open beslispunten en standaardkeuzes

Het ontwerp laat bewust dingen open (de "Annotatie"-kaders). Hieronder staat elk punt met de standaard die je mag aannemen zodat de bouw niet stilvalt. Maak elke standaard omzetbaar via `platform_settings` of een feature flag, en meld het als je er een omzet.

Verantwoordelijken in de annotaties: **Rick** (back-end, werkt techniek en logica uit), **Geeta** (juridisch en privacy), **het team** (productbeslissingen), **Mark van Ooijen** (btw en prijs).

## Account en inloggen

| Punt | Standaard |
|---|---|
| Welke sociale inlogaanbieders (Google, Apple) | Feature flag `auth.social`, standaard uit. |
| Google of Apple met ander e-mailadres dan de aanmelding | Niet bouwen zolang social uit staat. Voorstel voor later: mail naar het aanmeldadres om te koppelen. |
| Geldigheid bevestigings- en resetlinks | Bevestiging 24 uur, reset 1 uur, beide eenmalig. In de tekst geen termijn noemen. |
| Eerst bevestigen of meteen binnen | Eerst bevestigen (gekozen in het ontwerp). |
| Wachtwoord van ruimte-eigenaar (10 tekens) tegenover 8 | Overal minimaal 8. |
| Verwijderen van een account met open aanmeldingen | Blokkeren zolang er toekomstige bevestigde aanmeldingen zijn, met uitleg en link naar Gepland. Verwijderen daarna: persoonsgegevens verwijderen, afgeronde aanmeldingen en reviews anonimiseren. Geeta bevestigt. |
| Auth-implementatie (Directus-native of eigen route handlers) | **Gekozen in fase 1: eigen route handlers in Next.js, met Directus als gebruikersbron.** Wachtwoord controleren en access- en refresh-tokens uitgeven doet Directus (`/auth/login`, `/auth/refresh`); de app bewaart ze in httpOnly-cookies (`04`). Account maken, bevestigen, wachtwoord vergeten en "alleen nog een wachtwoord kiezen" lopen via eigen route handlers: die maken de Directus-gebruiker aan met het systeemtoken en gebruiken een eigen tokentabel (`auth_tokens`: gebruiker of e-mailadres, doel, sha256-hash van het token, `intent`, verloopt, gebruikt). Waarom: eigen mailtemplates in `mail/`, `intent` op de token, eenmalige links met de termijnen hierboven, koppelen van gastaanmeldingen na bevestigen, gelijke foutmelding en responstijd, rate limiting per IP en adres. Directus' eigen registratie en wachtwoordmail staan uit. Omzetbaar: de handlers zitten in `web/lib/account/` (niet `lib/auth/`, omdat `lib/auth.js` al bestaat); terug naar Directus-native raakt alleen die map. Gebouwd 10 november 2026. |
| Inloggen na de bevestigingslink | Directus kan geen sessie maken zonder wachtwoord. Na bevestigen gaat iemand naar `/inloggen` met het adres ingevuld en de melding "Je e-mailadres is bevestigd". Bij wachtwoord kiezen (reset, of account vanuit een aanmelding) kennen we het wachtwoord wel en loggen we direct in. Onbevestigde accounts hebben in Directus status `unverified`, dus ook rechtstreeks inloggen bij Directus kan niet. |
| Landing na inloggen zolang Mijn account (ddash-b) er niet is | Deelnemer naar `/`, workshopgever naar `/dashboard`, of `?next=` als dat een intern pad is (`web/lib/account/redirect.ts`). Zet `PARTICIPANT_HOME` op `/mijn-account` zodra fase 4 er is. |
| Rate limiting | In het geheugen per serverinstantie. Remt af, maar is op Vercel geen harde grens. Voor echt geld (2027) vervangen door gedeelde opslag. |
| Andere sessies ongeldig na wachtwoordwijziging (docs/04) | Nog niet gebouwd: Directus 11 heeft geen API om sessies van een gebruiker in te trekken. Open punt. |

## Datums en aanmeldingen

| Punt | Standaard |
|---|---|
| Minimale tijd tussen beslismoment en start (48 uur) | Zachte waarschuwing, geen blokkade (`enforce_min_decision_lead = false`). |
| Herinneringen voor het beslismoment | 48 en 10 uur ervoor, in `platform_settings`. |
| Kan het maximum omhoog nadat een datum doorgaat | Nee, vast. |
| Hoe wordt een andere datum aangeboden en wat bij geen reactie | Eerstvolgende bevestigde, niet volle datum van dezelfde workshop, minimaal 48 uur vooruit. Zonder reactie vervalt het aanbod 7 dagen voor die datum en wordt de aanmelding zonder kosten geannuleerd. Ligt die datum dichterbij dan 8 dagen, dan vervalt het aanbod halverwege tussen nu en de datum. Is er geen geschikte datum, dan meteen alles terug. De escrow bij OPP schuift mee naar de aangeboden datum; lukt dat niet, dan meteen terugbetalen. |
| Hoe beheert een deelnemer zonder account een aanmelding | Via de beheerlink uit de mails: `/boeking/beheer?code=&t=`. Het token is een HMAC (`BOOKING_LINK_SECRET`) over het boekings-id en een nonce in `bookings.access_token`. Daar: verzetten, annuleren, aanbod kiezen, melding doen, review schrijven. Komt later ook in Mijn account. |
| Annuleren na de gratis termijn in de pilot | Besloten 10 november 2026: in de pilot altijd 100 procent terug (`platform_settings.pilot_full_refund_on_cancel`, standaard aan). Het percentage uit de regeling wordt wel berekend en bewaard in `cancel_fee_percent`. |
| Verzetten naar een datum met een andere prijs | Kan niet; alleen datums met dezelfde prijs per persoon. Verzetten houdt dezelfde OPP-transactie. |
| No-show | De workshopgever meldt het in het dashboard, na de start en voor het geld vrijkomt. Geen terugbetaling. De deelnemer krijgt een mail en kan het betwisten met een melding. |
| Klachten (meldingen) | Kan vanaf de start tot de escrowdatum, via de beheerlink. Een melding verlengt de escrow bij OPP met `complaint_hold_days` (14) en houdt de afronding tegen tot het team besluit. Het team werkt in Directus (`complaints`) met de knoppen Terugbetalen, Uitbetaling vrijgeven en Workshopgever blokkeren. Terugbetalen vraagt vier ogen: `approved_by` is iemand anders dan wie op de knop drukt. |
| E-mailadressen van deelnemers zichtbaar voor de aanbieder | Nee. Alleen voornaam plus initiaal, aantal, dieetwens. Geeta beoordeelt de AVG-kant. Zonder berichtenfunctie moet het team wijzigingen doorgeven. |
| Berichtenfunctie aanbieder naar deelnemers of team | Bestaat niet. Terugkoppeling van de check gaat per mail. |
| Hoe reageert de aanbieder op een review | Kan niet. Geen knop. |
| Worden reviews eerst nagekeken | Nee, direct zichtbaar; veld `status` voorbereid. |

## Workshop en wizard

| Punt | Standaard |
|---|---|
| Mogen aanbieders hun eigen prijs bepalen | Ja, vrij invulbaar. |
| Naam van de prijs bij een particulier zonder btw | Alleen "€39" tonen, zonder "inclusief btw". Mark en Geeta bepalen de definitieve term. |
| Annuleerregelingen Soepel en Vast | Werktekst uit het ontwerp, uit `cancellation_policies`. |
| Is de aanbiedersverklaring per workshop of eenmalig | Eenmalig per aanbieder, met "Klopt dit nog?" bij elke nieuwe workshop. Snapshot bij indienen. |
| Is het IBAN al in de pilot nodig | Nee, optioneel via `platform_settings.require_iban_in_pilot`. |
| Bewaartermijn verklaringsgegevens en privacytekst | Geeta werkt uit; bouw een verwijderfunctie voor het team, zonder automatische verwijdering. |
| Wanneer ziet de deelnemer het volledige adres | Na aanmelding (in mail en op `/aanmelding/[token]` of Mijn account). Niet publiek. |
| Wat vraagt een herziene workshop opnieuw om een check | Alles behalve datums en max/min. |
| Cadeaubon per workshop aan of uit | Niet bouwen. Het team beslist later. |
| Termijn van de check | Niet noemen in de UI. |
| Gelegenheden Cadeau en Familie | Niet tonen. |
| Wordt het antwoord op "Heb je zelf een plek?" gebruikt | Wel bewaren, nergens gebruiken. |
| Particulier-tekst bij workshop ("Het consumentenrecht geldt niet") | Werktekst in `content/werkteksten.ts`. Geeta en de jurist leveren definitieve tekst. |

## Locatie gezocht

| Punt | Standaard |
|---|---|
| Bestaan van eigenaarsaccounts en het hele onderdeel | Feature flag `venues.enabled`, standaard uit. |
| Adres in de advertentie voor contact | Niet tonen. Alleen plaats en wijk. |
| Nakijken door het team voor zichtbaarheid | Niet voor de pilot; veld voorbereid. |
| Wat gebeurt na "Neem contact op" | Zie `11` scherm 4: bericht via Wicked Workshops, reply-to alleen met toestemming. |
| Vaste fee voor zichtbaarheid | Geen. Geen bedrag in de tekst. |
| Statistieken (hoe vaak bekeken) | Niet tonen. |

## Betalingen en pilot

| Punt | Standaard |
|---|---|
| Betalen via de site | Besloten 4 november 2026: de pilot betaalt via de OPP-sandbox, met testgeld. Echt geld op zijn vroegst januari 2027. Schakelaar `platform_settings.payment_mode`: `off`, `sandbox` (pilot), `live` (alleen met `OPP_LIVE_API_KEY`). |
| Uitbetalen aan workshopgevers | Via escrow bij OPP: de transactie staat vast tot het einde van de workshop plus `settlement_delay_hours`, daarna komt het geld vanzelf vrij. Gaat een datum niet door, dan volgt een refund. |
| Merchants in de sandbox | Een workshopgever krijgt bij de eerste boeking automatisch een test-merchant (testgegevens, geen KYC). Live vraagt een echte merchant met KYC via OPP. |
| Commissie per categorie | Veld op `categories` (9 tot 20 procent), niet getoond aan deelnemers. |
| Mail | SMTP via nodemailer vanuit Next (`SMTP_URL`, `MAIL_FROM`), lokaal Mailpit. Templates in `web/mail/`. Elke mail gaat hooguit 1 keer per (soort, sleutel) via `mail_log`. Zonder `SMTP_URL` wordt niets verstuurd en alleen gelogd. |
| Groepsboeking | Het team maakt een verborgen datum (`is_private`) met `price_override` en een `private_key`, en stuurt de boekingslink. De checkout accepteert die datum alleen met de sleutel; de grens van 50 personen geldt dan niet, de capaciteit wel. Betaling loopt gewoon via OPP. |
| Mollie | Verwijderd uit de app (10 november 2026), samen met `/api/bookings/confirm` en de Mollie-webhook. Het veld `payment_provider` in Directus is een restant. |

## Inconsistenties in het ontwerp (opgelost zoals hieronder)

1. **Mijn account noemt "Inloggen met een link in je mail"** (concept B). Het gekozen inloggen is wachtwoord. Pas de tekst aan (zie `07`).
2. **Het inlogscherm vraagt in aflow-a "voorbeeldwachtwoord" en "kaarsjes1"** als voorbeeldwaarden. Niet overnemen.
3. **dflow-a scherm 5 linkt naar het oude concept A van Mijn account.** Het gekozen concept is ddash-b.
4. **adash-a toont `Toon meer datums` met de laatste twee datums niet chronologisch.** Bouw chronologisch.
5. **De 48 uur tussen beslismoment en start** past niet bij Luca's vaste beslismoment (17 uur voor de start). Zachte waarschuwing, geen harde regel.
6. **Wachtwoordlengte**: ruimte-eigenaar 10, rest 8. Overal 8.
