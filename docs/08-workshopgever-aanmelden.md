# 08 - Workshopgever: aanmelden (aflow-a, "De doorloop")

Referentie: `reference/pages/aflow-a.html`, CSS `reference/css/aflow-a.css`. Auth-mechanica staat in `04`; hier de schermen. Voorbeeldpersoon: Lotte (kaarsen gieten van sojawas in Hattem).

Boven de schermen staat een voortgangsbalk met drie stappen: **Account**, **Bevestigen**, **Welkom** (component `ProgressSteps`, `aria-current="step"`).

## Routes

| Route | Scherm |
|---|---|
| `/workshopgever/aanmelden` | 1: Maak je account als workshopgever |
| `/workshopgever/aanmelden/controleer-mail` | 2: Bevestig je e-mailadres |
| (mail) | 3: de bevestigingsmail |
| `/workshopgever/welkom` | 4: twee vragen |
| `/workshopgever/start` | 5: je eerste stappen |
| `/inloggen` | 6 (gedeeld, zie `04`) |
| `/wachtwoord-vergeten` | 7 (gedeeld, zie `04`) |

Ingang: de knop "Begin met je e-mailadres" op de publieke pagina "Word workshopgever" (buiten dit pakket). Is iemand al ingelogd, sla scherm 1 tot 3 over en maak direct het `providers`-record via scherm 4.

## Scherm 1 - Account

- Stappen: Account actief.
- h1 "Maak je account als workshopgever".
- Tekst: "Een e-mailadres en een wachtwoord, meer hebben we nu niet nodig. Een eigen bedrijf ook niet: voordat je workshop online gaat, kijkt ons team mee."
- Velden: "Je e-mailadres", "Kies een wachtwoord (minimaal 8 tekens)" met "Toon". Knop "Maak je account". Scheiding "of" en Google en Apple (feature flag).
- Kleine tekst: "We gebruiken je e-mailadres voor je account en voor berichten over je workshops. Meer in onze privacyverklaring." en "Heb je al een account? Log in".
- Zijkaart met beeld, drie regels: "Nu: Je e-mailadres en een wachtwoord" / "Als je workshop klaarstaat: Je aanbiedersverklaring, met wie je bent en of je particulier of ondernemer bent" / "Nooit op je profiel: Je telefoonnummer, eigen website of socials. Deelnemers boeken en schrijven reviews via Wicked Workshops."
- De voorbeeldwaarden (`lotte@voorbeeld.nl`, `kaarsjes1`) zijn prototype; geen voorinvulling in productie.
- Registratie met `intent=provider`.

## Scherm 2 - Bevestigen

h2 "Bevestig je e-mailadres". "We hebben een mail gestuurd naar lotte@voorbeeld.nl. Klik op de knop in die mail, dan ga je verder waar je was." "Geen mail binnen een paar minuten? Kijk in je spam, of stuur hem opnieuw. Verkeerd adres getypt? Pas je e-mailadres aan."

## Scherm 3 - De mail

Template `provider_verify`. Onderwerp "Bevestig je e-mailadres". Tekst: "Hoi, je hebt een account gemaakt om workshops te geven op Wicked Workshops. Bevestig je e-mailadres, dan kun je aan je eerste workshop beginnen." Knop "Bevestig je e-mailadres". Voet: "Heb jij geen account gemaakt? Dan kun je deze mail negeren." Geen wachtwoord in de mail, geen bijlage. De link gaat naar `/account-maken/bevestigen?token=...` en daarna automatisch naar `/workshopgever/welkom`. Verlopen link: `/link-werkt-niet-meer`.

## Scherm 4 - Welkom: twee vragen

h2 "Welkom bij Wicked Workshops". "Twee vragen, dan begin je aan je workshop."

1. "Hoe mogen we je noemen?" tekstveld, voorinvullen als er al een voornaam is. Hulptekst: "Alleen je voornaam. Je volledige naam vragen we pas in je aanbiedersverklaring." Schrijf naar `providers.first_name` en `directus_users.first_name`.
2. "Heb je zelf een plek voor je workshop?" drie kaartkeuzes (radio): "Ja, ik heb een plek" (Thuis, in je eigen atelier, keuken of werkplaats), "Nee, ik heb er een nodig" (Op Locatie gezocht staan keukens, ateliers en zalen die vaak leeg staan), "Weet ik nog niet" (Je kiest het later, in de wizard). Schrijf naar `providers.has_location`.

Uitleg onder de keuze: "Kies je 'ik heb er een nodig', dan zie je na deze stap eerst de ruimtes op Locatie gezocht. Daar neem je zelf contact op met de eigenaar. Je kunt ook gewoon beginnen en bij 'Waar geef je de workshop?' kiezen voor 'Ik zoek nog een locatie'." Knop "Verder".

Bij "Nee, ik heb er een nodig" redirect je na "Verder" naar de publieke pagina Locatie gezocht (ronde 1, buiten dit pakket; zolang die ontbreekt: naar `/workshopgever/start`).

Of het antwoord op vraag 2 bewaard blijft om later passende ruimtes te tonen is aan het team: bewaar het (veld bestaat), gebruik het nog nergens.

## Scherm 5 - Je eerste stappen

h2 "Hoi Lotte, zo zet je je eerste workshop online". Tekst: "Je hoeft niets in één keer af te maken. Alles wat je invult, bewaren we als concept." Vier genummerde stappen:

1. **Je workshop opstellen** - "Zes stappen: basis, inhoud, praktisch, beeld, prijs en datums."
2. **Je aanbiedersverklaring** - "Pas als je workshop klaarstaat: wie je bent, of je particulier of ondernemer bent, en waar je voor tekent."
3. **De check door ons team** - "Ons team bekijkt elke workshop voordat hij online gaat, met of zonder bedrijf."
4. **Online** - "Deelnemers zien je datums en melden zich direct aan."

Knoppen: "Begin aan je workshop" (naar de wizard, zie `09`) en "Eerst rondkijken in je dashboard" (naar `/workshopgever`). Zijkaart: "Geen bedrijf? Dan ben je particulier. Dat vul je straks in je verklaring in. Deelnemers lezen bij je workshop dan: 'Aangeboden door een particulier. Het consumentenrecht geldt niet.'" (werktekst) en "Tijdens de pilot betaal je niets. Betalen via de site kan op zijn vroegst vanaf januari 2027." Zet de particulier-tekst in `content/werkteksten.ts`.

## Scherm 6 - Terugkomen: inloggen

Gedeeld inlogscherm uit `04`. Extra voor workshopgevers: onder het formulier een kaart "Na het inloggen ga je verder waar je was" die de laatste conceptworkshop toont ("Kaarsen gieten van sojawas in Hattem / Concept, je was bij stap 4 van 6: beeld") met knop "Ga verder met beeld". Dit is alleen een voorbeeld van waar `next` naartoe kan wijzen; maak er geen aparte pagina van. Wel: na inloggen met `last_context = provider` en een concept in de maak, toon dit blok bovenaan het dashboard (zie `10`).

## Scherm 7 - Wachtwoord vergeten

Zoals in `04`: aanvraag, mail "Kies een nieuw wachtwoord" ("Hoi Lotte, met de knop hieronder kies je een nieuw wachtwoord. Heb je dit niet zelf gevraagd, dan blijft je wachtwoord gewoon hetzelfde."), nieuw wachtwoord kiezen, en "Deze link werkt niet meer".

## Annotaties die gedrag raken

- Of een link 24 uur of korter geldig is: kiest Rick; standaard in `04`.
- Het antwoord op "Heb je zelf een plek?" mag bewaard worden.
- De tekst voor particulieren is werktekst.

## Acceptatiecriteria

1. Een nieuwe gebruiker doorloopt scherm 1 tot en met 5 zonder dat er een dood punt is, ook als hij tussendoor de mail pas later opent.
2. Na bevestigen bestaat er een `providers`-record, voornaam en `has_location` zijn gevuld en de gebruiker is ingelogd.
3. Een gebruiker die al een deelnemersaccount heeft kan workshopgever worden zonder tweede account.
4. Alle teksten zijn letterlijk overgenomen.
5. Playwright: aanmelden, mail afvangen (test-SMTP), bevestigen, welkom, start.
