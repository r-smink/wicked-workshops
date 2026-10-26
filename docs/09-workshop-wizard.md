# 09 - Workshopgever: nieuwe workshop (wizard-a, "De zes stappen")

Referentie: `reference/pages/wizard-a.html`, CSS `reference/css/wizard-a.css`. Voorbeeld: "Kaarsen gieten van sojawas in Hattem" door Lotte.

Idee: een vaste werkplek voor elke stap. Links de zes stappen, in het midden het formulier, rechts de lijst "Klaar voor de check" (9 punten). Alles wordt tussendoor bewaard als concept.

## Routes

| Route | Scherm |
|---|---|
| `/workshopgever/workshops/nieuw` | maakt een leeg concept en stuurt door naar stap 1 |
| `/workshopgever/workshops/[id]/basis` | 1: Basis |
| `/workshopgever/workshops/[id]/inhoud` | 2: Inhoud |
| `/workshopgever/workshops/[id]/praktisch` | 3: Praktisch |
| `/workshopgever/workshops/[id]/fotos` | 4: Foto's |
| `/workshopgever/workshops/[id]/prijs` | 5: Prijs en annuleren |
| `/workshopgever/workshops/[id]/datums` | 6: Datums |
| `/workshopgever/workshops/[id]/voorbeeld` | 7: Zo ziet je workshop eruit |
| `/workshopgever/workshops/[id]/verklaring` | 8: Je aanbiedersverklaring |
| `/workshopgever/workshops/[id]/ingediend` | 9: Je workshop ligt bij ons team |

Alleen de eigenaar (en het team) heeft toegang. Een workshop in `in_review` of `live` is nog bewerkbaar maar elke wijziging zet hem terug naar `in_review` voor velden die de check raken (bepaal de lijst met het team; standaard: alles behalve datums en max/min).

## Gedeeld kader van elke stap

- Bovenaan: "Concept, bewaard om 20:41" (tijd van laatste autosave, live bijgewerkt).
- Stappenlijst links (op mobiel een compacte balk): Basis, Inhoud, Praktisch, Foto's, Prijs en annuleren, Datums, daarna "Bekijk voorbeeld". Stappen zijn vrij te bezoeken (links, niet strikt lineair). Toon per stap een vinkje als alle verplichte velden van die stap gevuld zijn. Label "Stap 3 van 6 Praktisch".
- Voet: "Vorige" (link), "Opslaan als concept" (knop), "Volgende: <stap>" (link of knop). De laatste stap eindigt in "Bekijk je voorbeeld".
- Rechts: kaart "Klaar voor de check 4 van 9" met de lijst: Titel, Categorie, Plaats, Korte omschrijving, Beschrijving, Duur, Minstens één foto, Prijs per persoon, Minstens één datum. Gevuld = vink. Hulptekst: "Foto's en datums tellen mee: zonder kun je niet boeken." Als alles klaar is: "Alles staat erin. Kijk je voorbeeld na en ga door naar je verklaring."
- Autosave: debounce 800 ms na typen, direct bij blur en bij stapwissel, via een Server Action die alleen de gewijzigde velden naar Directus schrijft. Geen verlies bij browser sluiten; toon bij mislukken een foutmelding "Opslaan lukt niet, probeer opnieuw" en bewaar tijdelijk in `sessionStorage`.
- Voortgangspunten volgen de 9 checks; tel ze op de server met `lib/rules/checklist.ts` zodat client en server hetzelfde zeggen.

## Stap 1 - Basis

h1 "Stel je workshop op". "Zes korte stappen. Alles wordt tussendoor bewaard, dus je kunt altijd stoppen en later verder."

- **Titel** (max 70 tekens, teller "36 van 70 tekens"). Hulptekst: "Zeg wat deelnemers gaan doen en waar. Dat zoeken ze ook."
- **Categorie** (select, 12 uit `categories`).
- **Plaats** (autocomplete uit `places`). "Elke plaats kan, ook een dorp. Het precieze adres vul je in bij Praktisch."
- **Geschikt voor** (checkboxes uit `occasions`): Date, Vrienden, Teamuitje, Kinderfeestje, Vrijgezellenfeest. Cadeau en Familie niet tonen.
- **Korte omschrijving** (max 120 tekens, teller). Hulptekst: "Staat op je kaart in de zoekresultaten en in Google."
- Knoppen: "Opslaan als concept", "Volgende: inhoud".

## Stap 2 - Inhoud

h2 "Wat gaan deelnemers doen?" "Schrijf het zoals je het aan een vriendin vertelt. Hier lezen deelnemers of het iets voor ze is."

- **Beschrijving** (textarea, geen opmaak behalve alinea's).
- **Wat is inbegrepen** (lijst met korte regels, "Voeg iets toe", verwijderen per regel, volgorde slepen). Voorbeeld: "Sojawas, lont en geurolie", "Twee glazen potten om mee naar huis te nemen", "Koffie en thee".
- **Veelgestelde vragen** (niet verplicht): Vraag (tekst) en Antwoord (textarea), "Voeg een vraag toe".
- Hulptekst onderaan: "Deelnemers boeken en schrijven reviews via Wicked Workshops. Een eigen website, telefoonnummer of socials horen niet in je tekst." Voer een zachte controle uit op URL's, telefoonnummers en `@handle` in alle tekstvelden (waarschuwing, geen blokkade; het team let er bij de check op).
- Het losse veld voor een annuleringstekst bestaat niet meer; annuleren kies je bij stap 5.

## Stap 3 - Praktisch

h2 "Praktisch" "Wat deelnemers willen weten voordat ze boeken."

- **Duur** (select: 2 uur, 2,5 uur, 3 uur; breid de lijst uit tot een redelijke reeks, zoals 1 tot 8 uur in stappen van een half uur).
- **Taal** (Nederlands, Engels, Nederlands en Engels). **Niveau** (Geen ervaring nodig, Met wat ervaring).
- **Waar geef je de workshop?** (radio): "Op mijn eigen plek" (Thuis, in je atelier of werkplaats), "Bij de deelnemer thuis", "Op kantoor bij een bedrijf", "Online", "Ik zoek nog een locatie" (met uitleg "Je bewaart je workshop als concept tot je een plek hebt." en link "Bekijk Locatie gezocht").
- **Adres** (alleen bij "Op mijn eigen plek"; schrijf naar `workshop_private.address`): hulptekst "Op je pagina staat alleen Hattem. Straat en huisnummer krijgen deelnemers na hun aanmelding." Bij "Ik zoek nog een locatie" vervalt het adresveld en kan de workshop niet worden ingediend.
- **Leeftijd** (Voor iedereen, Vanaf 16 jaar, Vanaf 18 jaar). **Toegankelijkheid** (kort tekstveld, bijvoorbeeld "Begane grond, één drempel bij de voordeur").
- Hulpteksten: "Hoeveel mensen er mee kunnen, stel je per datum in bij stap 6. Zo staat het maar op één plek." en "Allergie of dieetwens? Die vullen deelnemers in bij het boeken. Je ziet het bij hun aanmelding."
- Wanneer deelnemers het volledige adres zien is een voorstel (na aanmelding). Gedrag in `03` en `06`.

## Stap 4 - Foto's

h2 "Foto's" "Eén tot zes foto's. De eerste is je omslag: die staat op je kaart."

- Raster met drag-and-drop (toegankelijk alternatief: knoppen "Verplaats naar voren" en "Verwijder"). Eerste foto krijgt badge "Omslag". Knop "Voeg een foto toe" met teller "nog 1 plek".
- Hulptekst: "Sleep een foto naar de eerste plek om hem omslag te maken. Liggend werkt het best, minstens 1200 bij 800 pixels." en "Gebruik foto's die je zelf maakte of mag gebruiken. Foto's van jouw eigen workshop doen het beter dan stockbeeld: deelnemers zien dan wat ze echt krijgen."
- Upload: zie `01`. Toon voortgang en foutmeldingen per bestand. Afmetingscontrole met duidelijke melding.
- Alt-tekst: laat optioneel een korte beschrijving per foto invullen (geen apart scherm; popover).

## Stap 5 - Prijs en annuleren

h2 "Prijs en annuleren" "Wat een plek kost en wat er gebeurt als iemand niet kan."

- **Prijs per persoon** (EUR, hele euro's of centen toegestaan). Hulptekst: "Dit bedrag betalen deelnemers. Boekingskosten komen er voor hen niet bij." Onder de prijs: "Wat Wicked Workshops rekent: straks een commissie per categorie, tussen 9 en 20 procent." en "Tijdens de pilot betaal je niets. Betalen via de site kan op zijn vroegst vanaf januari 2027." Of aanbieders hun eigen prijs bepalen is nog niet beslist: bouw het veld vrij invulbaar.
- **Annuleren** (radio, uit `cancellation_policies`): "De basis - Gratis annuleren tot 48 uur vooraf, daarna 50 procent. Verzetten is kosteloos." / "Soepel - Gratis annuleren tot 24 uur vooraf." / "Vast - Gratis annuleren tot 7 dagen vooraf, daarna 50 procent." Soepel en Vast zijn werktekst. Wat je kiest staat bij je workshop voordat iemand boekt.
- Vaste mededeling: "Deelnemers boeken direct. Je hoeft niets goed te keuren: elke aanmelding zie je meteen in je dashboard." Geen opties voor handmatig goedkeuren, cadeaubon of groepsoffertes.
- Bij een particulier zonder btw-nummer toon je geen "inclusief btw". Hoe de prijs dan heet is open.

## Stap 6 - Datums

h2 "Datums" "Per datum kies je hoeveel mensen er mee kunnen. Wil je pas doorgaan bij genoeg aanmeldingen, zet dan een minimum en een beslismoment."

Per datum een rij met datum en tijd (bijvoorbeeld "za 28 nov 14:00 tot 16:30") en de stand ("Nog 3 nodig" of "Gaat altijd door"):

- **Maximum** (aantal, verplicht), **Minimum** (aantal, leeg toegestaan, placeholder "Geen"), **Beslismoment** (datum en tijd, alleen actief als er een minimum is). Live uitleg: "50 uur voor de start. Zijn er dan minstens 3, dan gaat de datum door." of bij leeg minimum "Geen minimum, dus geen beslismoment."
- Knop "Voeg een datum toe" (opent date-time pickers; begintijd met eindtijd afgeleid van de duur).
- Hulpregels onderaan: "Gaat een datum door, dan blijft dat zo, ook als er daarna iemand afzegt." en "Gaat een datum niet door, dan krijgt iedereen die zich aanmeldde een andere datum aangeboden."
- Regels, vergrendeling en validatie: `05` par. 2. Minimaal 48 uur tussen beslismoment en start is een voorstel: toon een waarschuwing, geen blokkade (instelling in `platform_settings`). De herinneringen 48 en 10 uur voor het beslismoment bouw je in `05` par. 3.
- Pas bij het bekijken van het voorbeeld (stap 7) zijn "Minstens één foto" en "Minstens één datum" voorwaarde. Het label "Klaar voor de check 9 van 9" verschijnt dan.
- Knop onderaan: "Bekijk je voorbeeld".

## Stap 7 - Zo ziet je workshop eruit

h2 "Zo ziet je workshop eruit". "Alles klaar? Dan vul je je aanbiedersverklaring in. Pas daarna kijkt ons team mee."

Toon de echte componenten uit de publieke voorkant met de ingevulde data (alleen lezen): de **kaart in de zoekresultaten** (`WorkshopCard`: omslag, tag "Nieuw", "za 28 nov, 14:00 · nog 3 nodig", titel, "Hattem · 2,5 uur · max. 6 personen", "Nog geen reviews per persoon", prijs "€39") en de **bovenkant van de workshoppagina** ("Ambacht & maken · Hattem", titel, "2,5 uur · max. 6 personen · geen ervaring nodig · vanaf 16 jaar", "Aangeboden door Lotte, particulier. Het consumentenrecht geldt niet." (werktekst), per datum de stand en beslismoment, "Annuleren: gratis tot 48 uur vooraf, daarna 50 procent. Verzetten is kosteloos."). De regel over een particulier verschijnt pas als de aanbieder dat in de verklaring kiest. Toon in de preview een voorlopige versie op basis van `providers.kind`; als die nog leeg is, laat de regel weg. Op de echte pagina volgen daarna de foto's, de beschrijving en de vragen.

Knoppen: "Terug naar bewerken", "Opslaan als concept", "Verder naar je verklaring". Zolang de checklist niet 9 van 9 is: knop "Verder" uitgeschakeld met uitleg welke punten ontbreken.

Als de publieke `WorkshopCard` en workshoppagina nog niet bestaan: bouw `WorkshopCard` uit `00-shared-design-system.css` en laat de paginakop als nagebouwde preview-component staan.

## Stap 8 - Je aanbiedersverklaring

Stappenlabel boven: Workshop **klaar**, Verklaring **nu**, Check **door ons team**.

h2 "Je aanbiedersverklaring".

- Drie uitlegblokken: "Deelnemers zien: Je voornaam, en of je particulier of ondernemer bent" / "Alleen ons team ziet: Je achternaam, geboortedatum, adres, telefoonnummer, IBAN en wat je verklaart" / "Niet op je workshop: Een eigen website, telefoonnummer of socials. Deelnemers boeken en schrijven reviews via Wicked Workshops."
- **Over jou**: Voornaam (voorgevuld), Achternaam, Geboortedatum (`dd-mm-jjjj`, controleer geldige datum en minimaal 18 jaar), Woonadres ("Straat, huisnummer en plaats"), E-mailadres (voorgevuld uit account), Telefoonnummer (placeholder "Voor ons team, niet voor deelnemers").
- **Particulier of ondernemer** (radio): "Particulier - Je geeft workshops zonder eigen bedrijf." / "Ondernemer - Je staat ingeschreven bij de KvK." Bij ondernemer verplicht: **KvK-nummer** (8 cijfers, format controleren) en **Handelsnaam** (placeholders "Alleen als ondernemer").
- **Uitbetaling**: IBAN (placeholder "Rekeningnummer voor uitbetalingen"; valideer IBAN met mod-97). Hulptekst "Tijdens de pilot betaal je niets. Betalen via de site kan op zijn vroegst vanaf januari 2027." Of het IBAN al tijdens de pilot nodig is beslist het team: maak het veld verplicht via `platform_settings.require_iban_in_pilot` (standaard uit).
- **Wat je verklaart** (alle checkboxes verplicht): "Ik ben 18 jaar of ouder." / "De informatie over mijn workshop klopt." / "Ik ken de risico's van mijn workshop en neem maatregelen. (Bij kaarsen gieten bijvoorbeeld hete was en een open vlam.)" / "Ik heb de kwalificaties die mijn workshop vraagt, waar dat nodig is. (Bijvoorbeeld een diploma of certificaat. Niet nodig voor elke workshop.)" / "Ik ben verantwoordelijk voor een veilige uitvoering." / "Ik ben bereikbaar via e-mail en telefoon." / "Ik meld incidenten en klachten bij Wicked Workshops." / "Ik ga akkoord met de voorwaarden voor workshopgevers."
- Knoppen "Terug naar voorbeeld" en "Dien je workshop in".
- Opslaan: schrijf naar `provider_declarations` (privé), met tijdstip en versie van de voorwaarden. Of de verklaring per workshop of eenmalig is, is niet beslist (`12`): standaard eenmalig per aanbieder, vooraf ingevuld bij de volgende workshop met een korte bevestigingsstap "Klopt dit nog?", en koppel bij indienen een snapshot (`declaration_snapshot` json op de workshop) zodat de ingediende staat vastligt.
- Veldniveau-rechten: de aanbieder mag zijn eigen verklaring lezen en wijzigen, nooit andere; het publiek niets; het team alles.

## Stap 9 - Je workshop ligt bij ons team

Stappenlabel: Concept (ma 9 nov), **In de check nu**, Live daarna.

h2 "Je workshop ligt bij ons team". "We lezen hem na voordat hij online gaat, zoals bij elke workshop, met of zonder bedrijf. Staat hij live, dan krijg je een mail. Moet er iets anders, dan hoor je wat." Samenvattingsregels: Workshop, Datums ("za 28 nov, za 12 dec en zo 20 dec"), Aangeboden als ("Particulier"). Knoppen "Naar je dashboard" en "Nog een workshop opstellen".

Indienen zet `status = in_review`, `submitted_at = now()` en stuurt een melding naar het team. Geen termijn noemen.

## Validatie en foutstanden

- Per veld inline foutmelding in gewoon Nederlands, gekoppeld met `aria-describedby`.
- Samenvatting van fouten bovenaan bij "Dien je workshop in" (focus naar eerste fout).
- Het formulier bewaart ook ongeldige tussenwaardes als concept; alleen indienen vereist volledigheid.

## Acceptatiecriteria

1. Elke stap bewaart automatisch en herstelt volledig na herladen en na uitloggen en inloggen.
2. De checklist rechts klopt op elk moment met de feitelijke gegevens, ook na het verwijderen van de enige foto of datum.
3. Foto's uploaden, herschikken en omslag kiezen werken met muis, aanraking en toetsenbord.
4. Indienen is onmogelijk met `seeking`, zonder foto, zonder datum, of met onvolledige verklaring.
5. Het adres is nergens publiek te lezen (controleer via een uitgelogde Directus-aanvraag).
6. Privevelden van de verklaring zijn voor andere gebruikers niet op te vragen.
7. Op 390 px past elke stap zonder horizontaal scrollen.
