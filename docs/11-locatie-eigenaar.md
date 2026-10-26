# 11 - Eigenaar van een ruimte: Locatie gezocht (lflow-a, "Het formulier")

Referentie: `reference/pages/lflow-a.html`, CSS `reference/css/lflow-a.css`. Voorbeeldpersoon Mirjam ("Lichte keuken met groot eiland", Utrecht, Lombok).

**Status: voorstel.** Het ontwerp zegt zelf: "Locatie gezocht is niet beslist. Of eigenaren van een ruimte een eigen account krijgen, is open; dit concept gaat ervan uit van wel, met e-mail en wachtwoord." Bouw dit onderdeel achter een feature flag `venues.enabled` en laat het in productie uit tot het team beslist.

Wicked Workshops is geen partij bij huur, sleutel, schoonmaak, annuleren of aansprakelijkheid. Zeg dat nergens anders dan zoals in de teksten hieronder, en voeg geen betaling of boeking toe.

## Routes

| Route | Scherm |
|---|---|
| `/locatie-gezocht/zet-je-ruimte-erop` | 1: intro en account maken |
| (mail) | 2: "Klopt dit e-mailadres?" |
| `/locatie-gezocht/mijn-ruimtes/nieuw` | 3: ruimte invullen met meelopend voorbeeld |
| `/locatie-gezocht/mijn-ruimtes/[id]/gelukt` | 4: je advertentie staat erop |
| `/locatie-gezocht/mijn-ruimtes` | 5: beheren |
| `/inloggen` | 6: gedeeld inlogscherm (zie `04`) |

De publieke lijst en detailpagina "Locatie gezocht" komen uit ronde 1 en vallen buiten dit pakket. Bouw wel de datacontracten (`venue_listings`) en de componenten van het meelopende voorbeeld, want die tonen de advertentie zoals een workshopgever hem ziet.

## Scherm 1 - Zet je ruimte op Locatie gezocht

- h1 "Zet je ruimte op Locatie gezocht". "Heb je een keuken, atelier of zaal die vaak leeg staat? Workshopgevers zoeken een plek om les te geven. Zij nemen contact met je op; de afspraken maak je samen."
- h2 "Wat wij doen": "Je advertentie tonen aan workshopgevers" / "Laten zien wanneer je ruimte vrij is" / "De knop om contact met je op te nemen".
- h2 "Wat je zelf regelt": "Huur en betaling" / "Sleutel en schoonmaak" / "Annuleren en aansprakelijkheid".
- h2 "Account maken": Google en Apple (flag), "of met je e-mailadres", velden E-mailadres en Wachtwoord ("Minstens 10 tekens" - let op: 10, niet 8 zoals bij de andere flows; neem dit over of stem het af met `04`; standaard overal 8), knop "Account maken", "Al een account? Inloggen".
- Of een eigenaar een vaste fee betaalt voor zichtbaarheid is open; toon geen bedrag.
- Registratie met `intent=venue`.

## Scherm 2 - De mail

Onderwerp "Klopt dit e-mailadres?". "Hoi, je hebt een account gemaakt om je ruimte op Locatie gezocht te zetten. Klik op de knop om te bevestigen dat dit je e-mailadres is. Daarna vul je je ruimte in." Knop "Bevestig mijn e-mailadres". "Heb je dit niet zelf gedaan? Dan kun je deze mail negeren." Link gaat naar scherm 3.

## Scherm 3 - Je ruimte invullen

Lang formulier met 5 genummerde blokken, rechts een sticky voorbeeld dat meeloopt (`.lflow-a-mee`, sticky op desktop, op mobiel onder het formulier of als inklapbare kaart).

1. **Naam en plek**: "Naam van je ruimte" (hulptekst: "Zeg wat het is, niet hoe het heet. Workshopgevers zoeken op soort en plek."), "Plaats", "Wijk".
2. **Wat er is**: radio **Keuken / Atelier / Zaal / Buiten**; "Hoeveel mensen kunnen er meedoen?" (aantal); **Voorzieningen** (checkboxes: Groot eiland, Twee ovens, Water, Vaatwasser, Lange tafel, Rolstoeltoegankelijk; maak de lijst uitbreidbaar vanuit Directus).
3. **Foto's**: tot zes, eerste is de omslag, met bijschriftlabels per foto ("De ingang", "Het werkblad", "De tafel") als optionele omschrijving. Hulptekst: "Tot zes foto's. Workshopgevers willen vooral zien waar mensen staan te werken."
4. **Wanneer hij meestal vrij is**: raster dagdelen (Ochtend, Middag, Avond) x dagen (ma, di, wo, do, vr, za, zo) van checkboxes (semantisch een tabel met `th scope`). Hulptekst: "Geen agenda: dit zegt alleen wanneer het meestal kan. De precieze datum spreek je af."
5. **Beschrijving**: textarea met hulptekst "Geen prijs of huurbedrag: dat bespreek je zelf met de workshopgever."

Knoppen: "Advertentie plaatsen" en "Bewaren als concept". Autosave als concept zoals in de wizard.

Voorbeeldkaart ("Zo ziet een workshopgever hem in de lijst"): omslagfoto, "Utrecht, Lombok", titel, "Keuken · Tot 10 plekken", "Vaak vrij: ma en di middag en avond, do avond". De zin "Vaak vrij" wordt gegenereerd door `describeAvailability(grid)` (groepeer dagen met gelijke dagdelen: "ma en di middag en avond, do avond"; test deze functie uitgebreid).

Het precieze adres vraagt dit formulier bewust niet (alleen plaats en wijk); of het adres vooraf zichtbaar is, is open. Of het team een advertentie nakijkt voordat hij zichtbaar wordt is ook open: standaard direct zichtbaar (`status = published`), met een veld `reviewed_by_team` dat later een vergrendeling kan worden.

## Scherm 4 - Je advertentie staat erop

Toon "Je advertentie staat erop. Zo ziet hij eruit:" en de volledige detailweergave zoals een workshopgever hem opent: omslag, "Utrecht, Lombok", titel, "Keuken · Tot 10 plekken", beschrijving, voorzieningen als chips, h3 "Meestal vrij" met het dagdelenraster als gekleurde cellen ("vrij"), knop "Neem contact op met de eigenaar", en regel "Huur, sleutel en schoonmaak spreek je af met de eigenaar. Wicked Workshops is daarin geen partij." Het contactverzoek bestaat in het ontwerp alleen als knop; wat er daarna gebeurt is open. Standaard: een ingelogde workshopgever kan een kort bericht sturen (`venue_contact_requests`); de eigenaar krijgt een mail met het bericht en de voornaam van de aanvrager en kan per mail antwoorden via een afzender-adres dat Wicked Workshops beheert (reply-to naar de aanvrager alleen na toestemming van die aanvrager). Dit is een voorstel; leg het vast in `12`.

## Scherm 5 - Je ruimtes beheren

h2 "Je ruimtes". Per ruimte: foto, naam, "Utrecht, Lombok. Geplaatst op ma 9 nov", schakelaar "Zichtbaar" (verborgen = niet te vinden maar wel bewaard), "Bewerken", "Verwijderen". Verwijderen opent een bevestiging: "Advertentie verwijderen? Hij verdwijnt meteen van Locatie gezocht en komt niet terug. Wil je hem alleen even weghalen, zet hem dan op verborgen." met "Ja, verwijder hem" en "Toch niet". Link "Nog een ruimte toevoegen". Aantal keer bekeken wordt bewust niet getoond.

## Scherm 6 - Terugkomen

Gedeeld inlogscherm. Tekst bij wachtwoord vergeten is dezelfde als `04`; "Hoe lang de link werkt" is open.

## Acceptatiecriteria

1. Feature flag uit: geen enkele route zichtbaar, geen links in de navigatie.
2. Met flag aan: van intro tot geplaatste advertentie in 1 doorloop, met mail.
3. De voorbeeldkaart en de detailweergave tonen exact wat de publieke pagina later toont (hergebruik dezelfde componenten).
4. De beschikbaarheidszin klopt voor 10 testrasters.
5. Een eigenaar ziet en bewerkt alleen eigen advertenties; verborgen advertenties zijn publiek niet op te halen.
