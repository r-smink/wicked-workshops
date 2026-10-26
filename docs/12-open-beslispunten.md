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
| Auth-implementatie (Directus-native of eigen route handlers) | Kies in fase 1 en leg hier vast. |

## Datums en aanmeldingen

| Punt | Standaard |
|---|---|
| Minimale tijd tussen beslismoment en start (48 uur) | Zachte waarschuwing, geen blokkade (`enforce_min_decision_lead = false`). |
| Herinneringen voor het beslismoment | 48 en 10 uur ervoor, in `platform_settings`. |
| Kan het maximum omhoog nadat een datum doorgaat | Nee, vast. |
| Hoe wordt een andere datum aangeboden en wat bij geen reactie | Eerstvolgende bevestigde, niet volle datum van dezelfde workshop, minimaal 48 uur vooruit. Zonder reactie vervalt het aanbod 7 dagen voor die datum en wordt de aanmelding zonder kosten geannuleerd. |
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
| Betalen via de site | Niet in de pilot. Op zijn vroegst januari 2027. Alleen informatieve teksten. |
| Commissie per categorie | Veld op `categories` (9 tot 20 procent), niet getoond aan deelnemers. |

## Inconsistenties in het ontwerp (opgelost zoals hieronder)

1. **Mijn account noemt "Inloggen met een link in je mail"** (concept B). Het gekozen inloggen is wachtwoord. Pas de tekst aan (zie `07`).
2. **Het inlogscherm vraagt in aflow-a "voorbeeldwachtwoord" en "kaarsjes1"** als voorbeeldwaarden. Niet overnemen.
3. **dflow-a scherm 5 linkt naar het oude concept A van Mijn account.** Het gekozen concept is ddash-b.
4. **adash-a toont `Toon meer datums` met de laatste twee datums niet chronologisch.** Bouw chronologisch.
5. **De 48 uur tussen beslismoment en start** past niet bij Luca's vaste beslismoment (17 uur voor de start). Zachte waarschuwing, geen harde regel.
6. **Wachtwoordlengte**: ruimte-eigenaar 10, rest 8. Overal 8.
