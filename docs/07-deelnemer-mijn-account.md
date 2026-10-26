# 07 - Deelnemer: Mijn account (ddash-b, "Wat nu telt")

Referentie: `reference/pages/ddash-b.html`, CSS `reference/css/ddash-b.css`.

Idee: Mijn account opent op het ene ding dat nu aandacht vraagt, groot bovenaan. De rest is rustig en staat eronder of achter tabs.

Voorbeeldpersoon Sanne; alles hieronder komt in productie uit Directus.

## Structuur en routes

Tabs bovenin (desktop), met tellers waar het ontwerp ze toont:

| Tab | Route | Inhoud |
|---|---|---|
| Nu | `/mijn-account` | het blok dat aandacht vraagt, "Ook gepland", "Te doen" |
| Gepland (met aantal) | `/mijn-account/gepland` | alle toekomstige aanmeldingen |
| Eerder (met "1 review te schrijven") | `/mijn-account/eerder` | afgelopen aanmeldingen, reviewflow |
| Bewaard | `/mijn-account/bewaard` | bewaarde workshops en gevolgde workshopgevers |
| Instellingen | `/mijn-account/instellingen` | meldingen, gegevens, account |

Aanvullende routes: `/mijn-account/aanmelding/[id]` (paneel verzetten of annuleren, als intercepting route die over de pagina schuift en ook los werkt), `/mijn-account/eerder/[bookingId]/review` (twee vragen, 1 per scherm).

Op mobiel (onder 560 px) staat er geen tabrij maar een knop "Menu" die sticky onderin staat (`position: sticky; bottom: 14px`). Die opent een paneel van onderen met de vijf onderdelen, elk met een korte regel: Nu "Wat je aandacht vraagt" (of de titel van het actieve blok), Gepland "2 aanmeldingen", Eerder "1 review te schrijven", Bewaard "2 workshops, 2 workshopgevers", Instellingen "Meldingen, gegevens, account". Of de knop ook op de workshoppagina's buiten Mijn account blijft staan, kiest de bouwer (standaard: nee).

Alle routes vereisen een sessie. Zonder sessie: redirect naar `/inloggen?next=...`.

## Scherm 1 - Nu

Eerste scherm na inloggen. Bepaal op de server wat "nu telt" met de functie `pickFocus(bookings)` (zie onder), toon het groot en de rest eronder.

Voorbeeld (datum die nog aanmeldingen nodig heeft):

- Introregel: "Hoi Sanne. Dit vraagt nu je aandacht:".
- h1: "Za 21 nov bij Luca heeft nog 3 aanmeldingen nodig".
- Subregel: "1 van 4 · beslismoment vr 20 nov, 22:00, over 11 dagen. Is het minimum er dan, dan gaat de middag door."
- Beeld van de workshop (`img`), stoelenstand ("1 van 4 nodig").
- Blok h2 "Haal er zelf iemand bij": voorgeschreven tekst "Ik ga za 21 nov pasta maken bij Luca. Er zijn nog 3 aanmeldingen nodig, doe je mee? [link naar deze datum]", knop "Stuur via WhatsApp" (`https://wa.me/?text=<tekst>`), knop "Kopieer link" (Clipboard API met terugmelding "Gekopieerd"), link "Verzetten of annuleren" (opent paneel scherm 3). De gedeelde link is de publieke datum-URL, bij voorkeur met `?ref=delen`.
- h2 "Ook gepland": compacte kaarten per aanmelding, bijvoorbeeld "Morgen, di 10 nov, 19:00 / Dumplings vouwen en stomen · Studio Stoom · 2 personen / Gaat door".
- h2 "Te doen": taken, bijvoorbeeld "★ Review voor Noor / Handvormen voor beginners, za 31 okt" (linkt naar de review).

### Kiezen wat bovenaan staat (`pickFocus`)

Prioriteit, de eerste die geldt wint:

1. Een openstaand aanbod voor een andere datum (scherm 2, stand "Gaat niet door").
2. Een toekomstige aanmelding waarvan de datum nog verzamelt (`open`), met het dichtstbijzijnde beslismoment eerst.
3. De eerstvolgende bevestigde aanmelding ("Morgen", "Za 21 nov gaat door").
4. Geen aanmeldingen: lege stand uit het ontwerp ("Nog geen aanmeldingen" met link naar Ontdek). Een lege stand is niet uitgewerkt; gebruik een eenvoudig blok met tekst en 1 knop naar de publieke zoekpagina.

Een review die nog moet worden geschreven is geen focus maar een taak onder "Te doen", tenzij er niets anders is.

## Scherm 2 - Het blok bovenaan in vier standen

Eén component `FocusBlock` met vier standen. Dezelfde plek, andere inhoud:

| Stand | Kop | Details |
|---|---|---|
| Nu | "Za 21 nov bij Luca heeft nog 3 aanmeldingen nodig" | stoelenbalk "1 van 4 nodig", delen eronder |
| Deels gevuld | "Nog 1 aanmelding nodig" | "3 van 4 nodig". Het blok blijft bovenaan staan tot het minimum er is. |
| Gehaald | "Za 21 nov gaat door" | "Dat blijft zo, ook als iemand afzegt. Het blok schuift naar Gepland." |
| Gaat niet door | "Er is een nieuwe datum voor je: za 5 dec" | "Zelfde tijd, de datum gaat al door, en er is plek." Knoppen "Ja, za 5 dec" en "Andere datum of annuleren". Dit gebeurt als op vr 20 nov om 22:00 maar 2 van de 4 aanwezig zijn. |

Tijd tot beslismoment ("over 11 dagen") wordt relatief getoond en verandert naar uren in de laatste 48 uur.

## Scherm 3 - Verzetten of annuleren (paneel)

Paneel over de pagina (modal op desktop, bottom sheet op mobiel, sluitbaar met Escape en "Sluiten"). Titel "Je aanmelding voor za 21 nov bij Luca".

- h3 "Verzetten, kosteloos": radiolijst met datums van dezelfde workshop. Per regel datum en stand: "za 14 nov gaat door", "za 28 nov vol" (uitgeschakeld), "za 5 dec gaat door", "za 12 dec 3 van 4 nodig", "za 19 dec 0 van 4 nodig". Knop "Verzet naar za 5 dec" (tekst volgt de keuze).
- h3 "Annuleren": "Gratis tot do 19 nov, 15:00. 50 procent daarna, tot de start." Uitleg "Dit is de basisregeling, die geldt bij de meeste workshops. Tijdens de pilot betaal je niets. Betalen via de site kan op zijn vroegst vanaf januari 2027." Knop "Annuleer, nu nog gratis".
- Regels en berekening in `05` (paragrafen 4 en 5). Na een actie: sluit het paneel, toon een korte bevestiging en ververs het Nu-blok.

## Scherm 4 - Menu op de telefoon

Zie boven. Bovenin het paneel staat de titel van het actieve blok (bijvoorbeeld "Za 21 nov bij Luca heeft nog 3 aanmeldingen nodig"). De knop blijft sticky onderin.

## Scherm 5 - Eerder en review

Lijst met afgelopen aanmeldingen (nieuwste eerst). Per rij: beeld, titel, aanbieder, plaats, datum, knop "Schrijf een review" of de reeds geplaatste review.

Reviewflow, 1 vraag per scherm:

1. Kop: beeld, titel "Handvormen voor beginners", "Noor · Oudwijk, Utrecht · za 31 okt", "Vraag 1 van 2". h2 "Hoe was het bij Noor? Je oordeel in sterren" met vijf radio-opties "1 ster" tot "5 sterren" (zichtbaar als ster-knoppen, toetsenbord bedienbaar). Knop "Volgende".
2. "Vraag 2 van 2". h2 "Wat wil je anderen vertellen?". Textarea "Je review" met placeholder "Bijvoorbeeld wat je maakte, en voor wie dit leuk is". Hulptekst "Je review staat er met je voornaam: Sanne. Mag ook kort." Knop "Plaats je review".

Alleen wie via Wicked Workshops boekte en meedeed krijgt deze vraag. Server-side controle (zie `05` par. 8). Na plaatsen: bedankt-stand en terug naar Eerder.

## Scherm 6 - Bewaard

- h2 "Bewaard". Rij kaarten van bewaarde workshops met stand ("Gaat door vr 13 nov · nog 5 plekken", "2 van 4 nodig vr 4 dec"), titel, plaats of aanbieder, prijs, beoordeling ("★ 4,8 (143)").
- h3 "Je volgt": gevolgde workshopgevers met laatste gebeurtenis ("Nieuwe datum: ravioli, wo 25 nov", "Geen nieuwe datums").
- Hulptekst: "Een melding bij een nieuwe datum zet je aan of uit bij Instellingen."
- Hartje op de workshopkaart (`.wk-heart`) schrijft naar `saved_workshops`. Volgen werkt vanaf het aanbiedersprofiel (publieke voorkant). Tot die er is: seed.

## Scherm 7 - Instellingen

- h3 "Meldingen per mail", vier schakelaars: "Herinnering vóór het beslismoment" (bij een datum die nog aanmeldingen nodig heeft), "Nieuwe datum bij wie je volgt" (naam van de gevolgde aanbieders), "Bewaarde workshop bijna vol", "Tips voor workshops in Utrecht" (af en toe). Vaste regel: "Je bevestiging en het bericht of een datum doorgaat, krijg je altijd." Opslaan per schakelaar of met 1 knop; geef beide een duidelijke bevestiging.
- h3 "Je gegevens": e-mailadres, voornaam (mag leeg), regel over inloggen. **Pas aan**: laat "Inloggen: met een wachtwoord" met link "Wachtwoord wijzigen" zien (het prototype toont de link-variant van concept B). Knop "Opslaan". "Een nieuw e-mailadres werkt pas als je op de link in de mail aan dat adres klikt."
- h3 "Je account": "Download je gegevens - Alles wat we van je weten, in één bestand" (JSON-export van gebruiker, aanmeldingen, reviews, bewaard, volgend, instellingen via een route handler met sessiecontrole) en "Verwijder je account - Je hebt nog 2 aanmeldingen: di 10 nov en za 21 nov". Verwijderen: zie `12` (standaard: blokkeren zolang er toekomstige bevestigde aanmeldingen zijn, met uitleg en link naar Gepland).

## Data en queries

- `bookings` van de gebruiker, met `session`, `workshop`, `provider`, `workshop_images` (omslag), plus afgeleide sessiecijfers.
- Sessiecijfers worden niet in de client uitgerekend maar komen uit 1 functie `sessionState(session, bookings)`.
- Alle tijden tonen in `Europe/Amsterdam`.
- Cache niet: Mijn account is persoonlijk (`cache: 'no-store'` of `dynamic = 'force-dynamic'`).

## Acceptatiecriteria

1. Inloggen toont bovenaan de juiste focus volgens `pickFocus`, ook bij een lege stand.
2. Delen via WhatsApp en kopiëren werkt en de link opent de datum.
3. Verzetten naar een volle datum is onmogelijk; naar een verzamelende datum mag.
4. Annuleren toont de juiste tijdgrens en kosten per annuleerregeling.
5. Review kan alleen voor een afgelopen, niet geannuleerde aanmelding en maar 1 keer.
6. Alle vijf tabs en het paneel werken met het toetsenbord en op 390 px.
7. Instellingen slaan op, de export bevat alle eigen gegevens en geen gegevens van anderen.
