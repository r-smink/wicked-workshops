# 10 - Workshopgever: dashboard (adash-a, "De werkbank")

Referentie: `reference/pages/adash-a.html`, CSS `reference/css/adash-a.css`. Voorbeeldpersoon Luca (pasta- en ravioliworkshops in Wittevrouwen, Utrecht).

Idee: een vaste zijbalk (op mobiel een duimbalk onderin) met daarnaast alles onder elkaar. Bovenaan alleen wat nu aandacht vraagt, daaronder alle datums als lijst die je per datum openklapt tot de deelnemers, daarna workshops, reviews, profiel en uitbetalen als gewone werkschermen.

## Kader en navigatie

- Alleen voor gebruikers met een `providers`-record. Anders redirect naar `/workshopgever/aanmelden`.
- Zijbalk (`.adash-a-nav`, sticky): kopje met voornaam en "Particulier, Utrecht" (afgeleid van `providers.kind` en de aanbieders plaats), vijf items **Overzicht**, **Datums**, **Workshops**, **Reviews**, **Profiel**, daaronder extra: **Uitbetalen**, **Locatie gezocht**, en een paarse knop **Nieuwe workshop** (naar de wizard).
- Mobiel (onder 860 px): de zijbalk wordt een sticky balk onderin met vijf knoppen (Overzicht, Datums, Workshops, Reviews, Profiel), binnen duimbereik, met `padding-bottom: env(safe-area-inset-bottom)`. Uitbetalen, Locatie gezocht en Nieuwe workshop staan dan in het overzicht en bij Workshops.
- Header: gewone site-header met rechts "Mijn dashboard" (avatar-initiaal).

## Routes

| Route | Scherm |
|---|---|
| `/workshopgever` | 1: Overzicht |
| `/workshopgever/datums` | 2: Je komende datums (lijst met uitklap) |
| `/workshopgever/datums/nieuw` | 3a: Nieuwe datum |
| `/workshopgever/datums/[id]` | 3b: Datum aanpassen of annuleren, als intercepting route over de lijst |
| `/workshopgever/workshops` | 4: Je workshops |
| `/workshopgever/reviews` | 5: Reviews |
| `/workshopgever/profiel` | 6: Profiel |
| `/workshopgever/uitbetalen` | 7: Uitbetalen (komt later) |
| `/locatie-gezocht` | ingang naar de publieke pagina (ronde 1) |

## Scherm 1 - Overzicht

- h1 "Dag Luca, twee datums vragen aandacht" (getal volgt het aantal; "Dag Luca, er is niets dat aandacht vraagt" als 0). Regel: "Maandag 9 november. Je hebt 11 komende datums over 3 workshops."
- Aandachtskaarten per datum, meest urgente eerst. Voorbeeld 1: "za 21 nov, 15:00 / Italiaans koken: verse pasta / 1 van 4 nodig". Tekst: "Het beslismoment is vr 20 nov, 22:00. Komen er tot dan geen 3 aanmeldingen bij, dan gaat de middag niet door en krijgt Sanne een andere datum aangeboden." Knoppen "Deel deze datum" en link "Minimum of beslismoment aanpassen". Voorbeeld 2: "za 28 nov, 15:00 / Vol". "Alle 8 plekken zijn bezet. Wie nu kijkt, ziet deze middag als vol. Wil je meer mensen kwijt, zet er dan een datum bij." met link "Zet er een datum bij".
- Wat vraagt aandacht? Standaard (voorstel): (a) datums die nog verzamelen met beslismoment binnen 14 dagen, (b) datums die zojuist vol zijn gekomen (in de laatste 3 dagen), (c) datums waarvoor annuleren of aanpassen openstaat na een aanbod. Zet de regels in `lib/rules/attention.ts`.
- h2 "Eerstvolgende middag": "za 14 nov, 15:00 tot 18:00. 5 deelnemers, gaat door. Eén notenallergie en één lactosevrij." met link "Bekijk wie er komt". De samenvatting van dieetwensen komt uit `bookings.dietary_note` (groepeer en tel; toon geen namen hier).
- **Stoelenbalk** (component `SeatBar`, ook in `07` en `09`): 1 bolletje per plek tot het maximum. Gevuld paars = aangemeld (per persoon), gestippelde rand = nog nodig voor het minimum, lege rand = vrije plek boven het minimum. Alleen gevuld bij een datum zonder minimum of die vol is. Geef de balk een tekstalternatief (`role="img"`, bijvoorbeeld "1 van 4 nodig, 8 plekken"), want kleur en vorm alleen volstaan niet.
- Op mobiel staan hier ook de snelle links naar Uitbetalen, Locatie gezocht en Nieuwe workshop.

## Scherm 2 - Je komende datums

h2 "Je komende datums". "Klik een datum open om te zien wie er komt. Gevuld is aangemeld, gestippeld is nog nodig voor het minimum." Knop "Datum toevoegen".

Elke rij is een uitklapbare sectie (`<details>` of ARIA disclosure): datum en tijd, korte titel ("Verse pasta"), statuspil ("Gaat door", "Vol", "1 van 4 nodig"), stoelenbalk met "5 van 8, nog 3 plekken", en bij verzamelende datums "Beslismoment vr 20 nov, 22:00". Opengeklapt:

- Tabel **Naam / Personen / Allergie of dieetwens / Aangemeld**: voorbeeld "Femke D. | 2 | Niets doorgegeven | ma 2 nov". Naam als voornaam plus initiaal van de achternaam. Geen e-mailadressen (zie `12`).
- Regel "Gaat door sinds do 5 nov. Minimum en beslismoment liggen nu vast, ook als iemand afzegt." bij bevestigde datums.
- Knop "Deelnemerslijst printen" (print-CSS: alleen de tabel met titel en datum, zwart-wit).
- Lege stand: "Nog niemand aangemeld."
- Sortering altijd op datum. De lijst toont eerst negen items en een knop "Toon meer datums" laadt de rest in dezelfde volgorde (het prototype zet de laatste twee verkeerd achter de knop; bouw het chronologisch).
- Dieetwens "Niets doorgegeven" is de weergave voor een leeg veld.

## Scherm 3 - Datum toevoegen of aanpassen

**Nieuwe datum** (formulier): Workshop (select uit eigen live en in-review workshops), Datum, Begintijd (met "Eindtijd 18:00, de workshop duurt 3 uur" hulptekst), Maximum aantal plekken, Minimum (mag leeg: "Leeg is: gaat altijd door"), Beslismoment (Dag en Tijd). Hulptekst: "Is het minimum er dan, dan gaat de datum door en blijft dat zo. Zo niet, dan krijgen de deelnemers een andere datum aangeboden." Voorvertoning "Zo zien deelnemers deze datum": "zo 29 nov, 15:00 / 0 van 4 nodig / Beslismoment do 26 nov, 22:00". Knop "Datum toevoegen". Validatie en waarschuwing voor de 48 uur: zie `05`. Het prototype toont een annotatie dat Luca's vaste beslismoment (17 uur ervoor) dat zou breken: toon de waarschuwing, blokkeer niet.

**Datum aanpassen** (voor een datum die al doorgaat): titel "za 14 nov aanpassen", tekst "Deze datum gaat door. De 5 deelnemers rekenen erop, dus deze velden liggen vast.", alleen-lezen regels Datum en tijd, Maximum "8 plekken", Minimum "4, gehaald op do 5 nov", Beslismoment. Blok "Kun je echt niet?": "Annuleer je deze datum, dan krijgen alle 5 deelnemers bericht en een andere datum aangeboden. Doe dit alleen als het niet anders kan." Knop "Datum annuleren" met bevestigingsstap. Zie `05` par. 6. Voor datums die nog verzamelen zijn alle velden bewerkbaar tot het minimum gehaald is.

## Scherm 4 - Je workshops

h2 "Je workshops". "Een nieuwe workshop gaat pas live na een check door ons team." Knop "Nieuwe workshop". Kaarten:

- **Live**: beeld, titel, status "Live", "6 datums", "★4,9 (312)", "€45 p.p.", knoppen "Datum toevoegen" en "Bewerken".
- **In de check**: "In de check. Ingestuurd op vr 6 nov" en "Ons team kijkt je workshop na voordat hij live gaat. Je krijgt een mail zodra hij erop staat of als we iets willen vragen." Knop "Bekijk wat je instuurde" (alleen lezen).
- **Concept**: "Concept. Nog in te vullen: foto's en datums" met knop "Verder met opstellen" (naar de eerste stap die niet af is).
- Sortering: concepten bovenaan? Het prototype toont live, check, concept. Neem dat over.

## Scherm 5 - Reviews

h2 "389 reviews, gemiddeld 4,9". Verdeling 5 tot 1 sterren als balkjes met aantallen (351, 31, 5, 1, 1). Hulptekst "Alleen deelnemers die via Wicked Workshops hebben geboekt en meededen, kunnen een review schrijven." Lijst met sterren, "Marloes, verse pasta, za 17 okt", en de review in aanhalingstekens. Filter niet nodig. Een knop om te reageren bestaat bewust niet (niet beslist).

## Scherm 6 - Profiel

h2 "Je profiel". Foto met knop "Andere foto", Voornaam, "Waar je workshops geeft" (bijvoorbeeld "Wittevrouwen, Utrecht"), "Over jou" (textarea), "Je geeft workshops als" (radio: Particulier "Zonder KvK-nummer" / Ondernemer "Met KvK-nummer en handelsnaam"), knop "Profiel opslaan". Uitleg: "Dit staat op je profiel en bij elke workshop. Bij een particulier geldt het consumentenrecht niet; dat zien deelnemers voordat ze boeken."

- "Wat niet op je profiel komt": "Een eigen website, telefoonnummer of socials. Deelnemers boeken en schrijven reviews via Wicked Workshops."
- "Alleen voor ons team": "Uit je aanbiedersverklaring, ingevuld op di 3 nov. Deelnemers zien dit nooit." met de punten Naam, geboortedatum en adres / E-mail en telefoon / IBAN, voor uitbetalen later / Veiligheid en voorwaarden, en link "Verklaring bekijken of wijzigen" (naar de wizard-stap 8).
- "Inloggen": "luca@voorbeeld.nl, met een wachtwoord." met link "Wachtwoord wijzigen".
- Wijzigen van `kind` raakt de verklaring: vraag bevestiging en markeer de verklaring als "te herzien".

## Scherm 7 - Uitbetalen en Locatie gezocht

h2 "Uitbetalen". "Hier zie je later wat er naar je rekening gaat, min de commissie voor je categorie." plus "Tijdens de pilot betaal je niets. Betalen via de site kan op zijn vroegst vanaf januari 2027." Geen functionaliteit; bouw een stille lege pagina en het datamodel (geen).

Daaronder h2 "Een grotere keuken nodig?" "Bij Locatie gezocht zetten eigenaren ruimtes die vaak leeg staan. Je neemt zelf contact op met de eigenaar." met knop "Naar Locatie gezocht" (naar de publieke pagina uit ronde 1; in dit pakket kan het voorlopig naar `/locatie-gezocht` wijzen).

## Data

- `workshops` van de aanbieder met afgeleide cijfers.
- `workshop_sessions` komende, met `bookings` (selectie van kolommen zoals in `03`).
- Aggregaties voor het overzicht via Directus aggregate of 1 query met `groupBy`, niet via N+1 in een lus.
- Dashboard is persoonlijk: geen caching.

## Acceptatiecriteria

1. Elke datum met een minimum toont de juiste stand en het juiste beslismoment, ook rond middernacht en zomertijd.
2. Een datum die doorgaat laat alleen annuleren toe, afgedwongen door Directus.
3. De deelnemerslijst bevat nooit e-mailadressen, telefoonnummers of volledige achternamen.
4. De mobiele duimbalk blijft bruikbaar met toetsenbord open en op een telefoon met notch.
5. Print van de deelnemerslijst geeft 1 schone pagina.
6. Uitklappen werkt met toetsenbord en schermlezer (`aria-expanded`).
