# Wicked Workshops - antwoorden op de operationele vragen (pilot)

Stand: 10 november 2026. Gebaseerd op de repository r-smink/wicked-workshops (main, laatste commit: merge van fase-1), met name `web/lib`, `web/app/api`, `docs/05`, `docs/12`, `docs/CHANGELOG.md` en `docs/juridisch/`. Per onderwerp staat wat de code nu doet en wat ik als pilotkeuze adviseer. De adviezen zijn bedrijfskeuzes voor het bestuur en de aandeelhouders; Legal werkt ze daarna juridisch uit. Dit is geen juridisch advies.

## Kort samengevat

- **De kern van de geldstroom staat al.** Klant boekt direct, betaalt 100% vooraf via iDEAL, het geld blijft in escrow bij OPP, de commissie wordt direct ingehouden en na de workshop plus 7 dagen komt het geld vanzelf vrij voor de workshopgever. Haalt een datum het minimum niet, dan volgt automatisch een volledige terugbetaling.
- **Wicked Workshops raakt het geld niet aan.** Dat is bewust en de reden voor OPP: wie geld van klanten ontvangt en doorbetaalt aan derden, verleent een betaaldienst. Daarvoor is een DNB-vergunning nodig, of je besteedt het uit aan een vergunninghouder. Het gaat om een betaalinstellingsvergunning, niet om een volledige bankvergunning. Zie hoofdstuk 3.
- **Er ontbreekt nog veel rond de problemen.** In de code bestaat geen route voor annuleren door klant of aanbieder, verzetten, no-show, klachten of handmatig terugbetalen, en er worden geen mails verstuurd. Voor een pilot met echte gebruikers is dat het grootste gat.
- **Het geld komt vanzelf vrij, ook als er iets misgaat.** Zonder klachtroute krijgt een aanbieder die niet komt opdagen na 7 dagen toch zijn geld. Het klachtvenster moet dus korter zijn dan de escrowperiode, of de escrow moet te stoppen zijn.
- **Voorwaarden-aanvulling en code spreken elkaar tegen.** Het conceptdocument gaat uit van Mollie, maandelijkse uitbetaling, 15% commissie en aanvraagboekingen. De code gaat uit van OPP, uitbetaling 7 dagen na de workshop, commissie per categorie en direct boeken. Dit moet recht voordat Legal verder schrijft (hoofdstuk 6).
- **Alles draait nu op testgeld.** Besluit van 4 november: pilot via de OPP-sandbox, echt geld op zijn vroegst januari 2027. De koppeling is bovendien nog niet getest tegen de echte OPP-sandbox.

## Update 10 november 2026: wat inmiddels gebouwd is

De punten uit hoofdstuk 7 zijn gebouwd op branch `fase-1` (zie `docs/CHANGELOG.md`, "Pilotoperatie"). De tabellen hieronder beschrijven de stand vóór die ronde.

| Onderdeel | Nu |
| --- | --- |
| Mails | Gebouwd: bevestiging met adres en beheerlink, gaat door, gaat niet door, geannuleerd, annulering, verzet, herinneringen, reviewuitnodiging, melding, terugbetaald, workshop online, e-mailbevestiging en wachtwoord. |
| Annuleren door klant | Gebouwd via de beheerlink. In de pilot altijd 100% terug (instelling); het percentage van de regeling wordt bewaard. |
| Annuleren door aanbieder, andere datum | Gebouwd: iedereen krijgt een andere datum aangeboden of alles terug; de escrow schuift mee. |
| Verzetten | Gebouwd, naar datums met dezelfde prijs. |
| No-show | Gebouwd: de aanbieder meldt het, de deelnemer kan het betwisten. |
| Klachten en terugbetalen door het team | Gebouwd: melding verlengt de escrow bij OPP, team beslist in Directus met vier ogen. |
| Reviews | Gebouwd: schrijven na afloop, uitnodigingsmail. |
| E-mailverificatie | Gebouwd: eerst bevestigen, dan inloggen. |
| Groepsboeking | Verborgen datum met sleutel en vaste prijs. Offerte blijft handwerk. |
| Plekken | Atomair via een nieuwe Directus-extensie. |
| Dashboardtekst uitbetalingen | Gecorrigeerd. |
| `/api/bookings/confirm`, Mollie | Verwijderd. |
| `/api/venues` | Schrijft naar `venue_listings` zonder adres en prijs. |
| Nog open | Migratie, seed en de extensies `ww-guards` en `ww-seats` op productie zetten. Test tegen de echte OPP-sandbox. Andere sessies ongeldig maken na een wachtwoordwijziging. Mijn account (fase 4). |

## 1. Wat de code nu doet

| Onderdeel | Stand | Wat de code doet |
| --- | --- | --- |
| Aanmelden workshopgever | Deels | Registratie logt direct in; er is geen e-mailbevestiging (docs/04 wil dat wel). Aanbiedersgegevens worden bewaard, het IBAN versleuteld, plus versie en tijdstip van het akkoord met de voorwaarden. |
| Verificatie en KYC | Sandbox: geen, live: via OPP | In de sandbox krijgt een aanbieder bij de eerste boeking automatisch een testmerchant zonder KYC. Live maakt de code een echte OPP-merchant aan en stuurt de aanbieder naar de KYC-link van OPP; een webhook zet de status op live. |
| Workshop aanmaken en keuren | Werkt | De wizard maakt een concept. Het team zet de status via Directus op in\_review en live. Er is geen termijn. |
| Boeken | Werkt | Direct, zonder goedkeuring van de aanbieder. Met account of als gast, maximaal 50 personen per boeking. De plek wordt 30 minuten vastgehouden tijdens het betalen. |
| Betalen | Werkt (sandbox) | Alleen iDEAL, 100% vooraf, in escrow bij OPP. Boekingskosten voor deelnemers zijn EUR 0. |
| Commissie | Deels | Wordt als partner fee direct op de betaling ingehouden. Het percentage komt uit de categorie (9 tot 20%). Is dat veld leeg, dan is de commissie 0%. Vast bedrag per boeking kan niet. |
| Minimum en beslismoment | Werkt | Na het beslismoment heeft de aanbieder nog 12 uur om te kiezen voor doorgaan; daarna volgt automatisch een volledige terugbetaling. Een datum die eenmaal doorgaat, blijft doorgaan. |
| Uitbetaling | Werkt via OPP | Escrow loopt tot einde workshop plus 168 uur (instelling `settlement_delay_hours`). Daarna geeft OPP het geld vrij. Wicked zelf betaalt niets uit. |
| Bevestigingsmail en herinneringen | Ontbreekt | Er is geen mailverzending in de web-code. Alleen de pagina /boeking/terug. De mails staan wel uitgewerkt in docs/05. |
| Annuleren door klant | Ontbreekt | Geen route. Wel een annuleringsdeadline op de boeking en de teksten over de regeling. Annuleringskosten worden nergens berekend. |
| Annuleren door aanbieder, andere datum aanbieden | Ontbreekt | Geen route en geen aangeboden datums. |
| Verzetten | Ontbreekt | Beschreven in docs/05, niet gebouwd. |
| No-show | Ontbreekt | De status bestaat, maar niets zet hem. |
| Klachten | Ontbreekt | Geen route, veld of procedure. |
| Terugbetaling door het team | Ontbreekt in de app | De functie bestaat, maar wordt alleen door de automatische controle en de webhook gebruikt. Handmatig terugbetalen kan dus niet vanuit het platform. |
| Reviews | Deels | Datamodel en weergave zijn er. Een route om een review te schrijven niet, en ook geen uitnodigingsmail. |
| Groepsboeking | Minimaal | Alleen een aanvraagformulier dat in `business_requests` terechtkomt. Geen offerte- of betaalflow. |
| Ruimtes | Deels, staat uit | Feature flag `venues.enabled` staat standaard uit. |
| Dashboard: uitbetalingen | Klopt niet | Toont "automatisch aan het einde van elke maand", terwijl de code 7 dagen na de workshop uitbetaalt. |

**Wanneer wordt een workshop daadwerkelijk gegeven?** De code kent twee momenten. De boeking is definitief zodra OPP de betaling als betaald meldt (webhook, geen klik). Of de workshop zelf doorgaat hangt daarna af van de datum: zonder minimum meteen, met minimum zodra dat is gehaald of op het beslismoment. Pas dan is het voor de klant zeker.

## 2. De pilot per type gebruiker (voorstel)

**Aanbieder.** Account maken, aanbiedersverklaring invullen en akkoord geven op de voorwaarden. In de sandbox volgt automatisch een testmerchant; live doorloopt de aanbieder de KYC bij OPP en kan pas boekingen ontvangen als OPP de merchant op live zet. Daarna maakt de aanbieder de workshop in de wizard en stuurt die in. Het team controleert (formele eisen en veiligheid, geen kwaliteitsoordeel) en zet de workshop live. De aanbieder voegt datums toe met capaciteit, minimum en beslismoment. Klanten boeken en betalen, de aanbieder ziet voornaam, aantal personen en dieetwens. Na de workshop en het klachtvenster geeft OPP het geld vrij, minus commissie.

**Consument.** Zoeken, workshop bekijken met de status van de datum ("n van m nodig"), zien of de aanbieder particulier of ondernemer is, de annuleerregeling lezen, boeken als gast of met account en betalen met iDEAL. Bevestigingsmail met het volledige adres. Eventueel annuleren volgens de regeling. Na afloop een review schrijven, of een klacht indienen.

**Ruimteaanbieder.** Advertentie plaatsen (plaats en wijk, geen adres, geen prijs), team ziet die mee. Een workshopgever neemt contact op via Wicked Workshops. Alles daarna, inclusief afspraken en betaling, gebeurt buiten het platform. Aanbevolen: dit onderdeel in de eerste pilotfase uit laten staan tot de kernflow werkt.

**Bedrijfsboeking.** Aanvraag via het formulier, één vast aanspreekpunt bij Wicked Workshops, offerte van de aanbieder in een standaardformat, akkoord van het bedrijf, volledige betaling vooraf via OPP, uitvoering. Zie hoofdstuk 5, onderdeel 7.

## 3. Betaalprovider: waarom OPP, escrow en de vergunningsvraag

Het gaat niet om een bankvergunning maar om een betaalinstellingsvergunning (DNB, PSD2), en Wicked Workshops heeft die niet nodig zolang een vergunninghouder het geld ontvangt, vasthoudt en doorbetaalt. Dat is precies wat OPP in de code doet.

**Waarom is dit een vergunningskwestie?** In dit model ontvangt Wicked Workshops geld van de klant dat bestemd is voor de workshopgever, en houdt daar commissie van in. DNB beschrijft dit patroon zo: het platform ontvangt de gelden van de koper op een eigen rekening of op een rekening van een gelieerde stichting derdengelden en betaalt daarna de verkoper. Handelsplatformen die zelf betaaldiensten verrichten hebben daarvoor een vergunning nodig, of laten dit over aan een vergunninghoudende betaalinstelling of bank. Escrow (geld vasthouden tot de workshop is geleverd) maakt het alleen maar duidelijker dat je de geldstroom beheert.

| Optie | Wat het inhoudt | Beoordeling voor Wicked Workshops |
| --- | --- | --- |
| Eigen DNB-vergunning | Wicked wordt zelf betaalinstelling, met stichting derdengelden, eigen vermogen en compliance-inrichting | Te zwaar en te traag voor een pilot |
| Uitzondering voor handelsagenten | Wicked ontvangt zonder vergunning, onder voorwaarden | Smal, streng uitgelegd en volgens commentatoren onder druk. Geen basis om een verdienmodel op te bouwen |
| Platform-PSP met escrow (OPP) | Vergunde partij ontvangt het geld, houdt het vast tot de escrowdatum, splitst de commissie af en doet de KYC op aanbieders | Gekozen route. Wicked raakt het geld niet aan |
| Platform-PSP met gesplitste betalingen (Mollie Connect) | Geld staat in een holding balance bij Mollie en wordt na de betaling gerouteerd naar de aanbieder (maximaal 90 dagen). De commissie is wat je niet doorsluist | Ook een legitiem alternatief, maar Wicked is dan zelf betaaleigenaar met verantwoordelijkheid voor refunds en chargebacks, en moet het routeren zelf bouwen. Moet bovendien op verzoek worden aangezet |

**Waarom OPP?** OPP (Online Payment Platform B.V.) is een Nederlandse betaalinstelling met DNB-vergunning. Wat de code ervan gebruikt: escrow met een eigen escrowdatum per transactie, commissie als partner fee op dezelfde transactie, onboarding en KYC van aanbieders als merchant, en in de sandbox een simulatie van de merchantstatus zodat de pilot zonder echte KYC kan draaien. Het conceptdocument in docs/juridisch adviseerde nog Mollie Connect; de wissel naar OPP staat in docs/12, maar de redenen staan nergens vastgelegd. Mijn advies: leg die redenen alsnog in een beslisnotitie vast, want investeerders en Legal zullen ernaar vragen.

**De geldstroom zoals de code hem nu inricht:**

1. De klant betaalt het volledige bedrag met iDEAL.
2. OPP ontvangt het geld en houdt het vast (escrow) tot einde workshop plus 168 uur.
3. De commissie wordt direct als partner fee afgesplitst voor Wicked.
4. Op de escrowdatum geeft OPP het restant vrij aan de merchant van de aanbieder.
5. Gaat de datum niet door, dan betaalt Wicked via OPP het volledige bedrag terug uit de escrow.

**Wat dit voor de pilot betekent:**

- **Elke betaling moet via OPP lopen, ook bij groepsboekingen.** Een bedrijf laten overmaken naar de rekening van Wicked en daarna doorbetalen aan de aanbieder is precies de vergunningplichtige activiteit. Het alternatief is dat Wicked zelf contractpartij wordt, een eigen factuur stuurt en de aanbieder als leverancier betaalt. Dat kan zonder betaaldienst, maar brengt aansprakelijkheid en btw bij Wicked. Laat Legal en de fiscalist dit bevestigen.
- **Het escrowcontract bij OPP moet aanstaan.** Staat het uit, dan weigert OPP de transactie (staat zo in de changelog).
- **Nog niet getest tegen de echte OPP-sandbox.** Er is een sandboxsleutel en notificatiegeheim van OPP nodig. OPP vraagt mogelijk om vaste uitgaande IP-adressen, die Vercel niet heeft.
- **Live vraagt echte KYC.** Elke aanbieder doorloopt de verificatie bij OPP voordat hij boekingen kan ontvangen. Particulieren kunnen als consumer-merchant worden aangemeld.
- **Alleen iDEAL.** Voor een Nederlandse pilot prima. Kaarten en buitenlandse klanten kunnen niet.
- **Vragen voor OPP:** wie draagt de OPP- en iDEAL-kosten bij boekingen zonder commissie, krijgt Wicked de partner fee terug bij een refund, en kan de escrowdatum achteraf worden verschoven of vervroegd (bijvoorbeeld bij een klacht)? Dat laatste staat niet in de code en bepaalt of een klacht de uitbetaling kan stoppen.
- **Btw en facturatie.** Wicked factureert zijn commissie aan de aanbieder. Of de aanbieder zelf factureert aan de klant, of Wicked namens hem, moet de fiscalist vastleggen (zie het conceptdocument, punt 0.3).

## 4. De 13 kapstokvragen

Per vraag: wat de code nu doet en wat ik als pilotflow adviseer.

### 1. Aanbieder: van aanmelding tot eerste workshop online

**Code nu:** account maken (logt direct in, geen e-mailbevestiging), aanbiedersgegevens en akkoord op de voorwaardenversie, workshop in de wizard als concept, insturen, het team zet hem in Directus live. In de sandbox volgt automatisch een testmerchant, live een KYC bij OPP.

**Advies:** vijf stappen: aanmelden en e-mail bevestigen, aanbiedersverklaring, (live) KYC bij OPP, eerste workshop insturen, check door het team en live. Stel intern een norm van twee werkdagen voor de check, maar noem geen termijn in de interface (zo staat het ook in docs/05). Bouw voor de pilot de e-mailbevestiging en de mail "Je workshop staat online".

### 2. Workshop: wie maakt de pagina aan en wie keurt goed

**Code nu:** de aanbieder maakt de workshop in de wizard (status concept). Het team zet hem via Directus op in\_review en live. Terugkoppeling gaat per mail met een interne opmerking; een berichtenfunctie bestaat niet.

**Advies:** aanbieder maakt, het team keurt, iedere nieuwe workshop vooraf. Een wijziging aan alles behalve datums en capaciteit gaat opnieuw langs het team (zo staat het in docs/12).

### 3. Klant: van vinden tot definitieve boeking

**Code nu:** datum en aantal kiezen, naam en e-mail invullen (of ingelogd boeken), de plekken worden 30 minuten vastgehouden, betalen met iDEAL, en zodra OPP de betaling als betaald meldt wordt de boeking bevestigd. Verloopt de vasthoudtijd, dan vervalt de boeking; komt de betaling alsnog binnen en is er nog plek, dan wordt hij alsnog bevestigd, anders volgt een terugbetaling.

**Advies:** maak in de bevestiging expliciet dat "betaald" niet hetzelfde is als "doorgaand" bij workshops met een minimum. Technisch punt: plekken worden nu via lezen en terugschrijven opgehoogd, dus twee gelijktijdige boekingen kunnen allebei de laatste plek krijgen. Voor een pilot met weinig verkeer acceptabel, maar noteer het.

### 4. Betaling: waar betaalt de klant en waar komt het geld terecht

**Code nu:** de klant betaalt op de OPP-betaalpagina en komt terug op /boeking/terug. Het geld staat in escrow bij OPP, niet bij Wicked (zie hoofdstuk 3).

**Advies:** niets aanpassen. Maak alleen duidelijk in de voorwaarden dat de betaling via OPP loopt.

### 5. Bevestiging: wie bevestigt en wat ontvangen aanbieder en klant

**Code nu:** de bevestiging is automatisch (webhook). De klant ziet een bevestigingsscherm; er gaat geen mail uit. De aanbieder ziet de aanmelding in het dashboard: voornaam, initiaal van de achternaam, aantal personen en dieetwens.

**Advies:** bouw vóór de eerste echte gebruiker minimaal de verplichte mails uit docs/05: bevestiging (met volledig adres), datum gaat door, datum gaat niet door, annulering. Zonder mail weet een klant niet waar hij moet zijn.

### 6. Contact: mogen klant en aanbieder rechtstreeks met elkaar praten

**Code nu:** nee. De aanbieder ziet geen e-mailadres en er is geen berichtenfunctie (docs/12).

**Advies:** voor de eerste pilot geen rechtstreeks contact; vragen lopen via Wicked Workshops. Dat is privacyvriendelijk, voorkomt dat boekingen buiten het platform worden afgerekend en is met weinig boekingen te doen. Een variant voor later: een formulier waarmee de klant een vraag aan de aanbieder stuurt en alleen met toestemming zijn e-mailadres als antwoordadres meegeeft (zoals docs/12 voor ruimtes voorstelt). Geeta beoordeelt de AVG-kant.

### 7. Voorbereiding: wat gebeurt er tussen boeking en workshop

**Code nu:** het adres is pas na aanmelding zichtbaar. Herinneringen vóór het beslismoment (48 en 10 uur) zijn beschreven en als instelling aanwezig, maar de scheduler en de mails zijn niet gebouwd. Verzetten is niet gebouwd.

**Advies:** Wicked Workshops heeft hier alleen een geautomatiseerde rol: herinneringen en het adres. Voeg één herinnering 24 uur vóór de start toe met tijd en adres. Geen handmatige voorbereiding door het team.

### 8. Uitvoering: welke rol heeft WW op de dag zelf

**Code nu:** geen. Er is geen incheck en geen aanwezigheidsregistratie.

**Advies:** geen rol, behalve een bereikbaar e-mailadres voor spoedgevallen. Een aanbieder die op het laatste moment niet kan, moet via het dashboard kunnen annuleren (route bestaat nog niet; zie hoofdstuk 7).

### 9. Na afloop: uitbetaling en reviews

**Code nu:** OPP geeft het geld vrij op einde workshop plus 168 uur. Reviews zijn alleen als datamodel en weergave aanwezig; er is geen route om te schrijven en geen uitnodigingsmail.

**Advies:** reviews verzamelen, ja, alleen van deelnemers met een afgeronde aanmelding, direct zichtbaar zonder reactiemogelijkheid van de aanbieder (zo is het ontworpen). Uitbetaling: zie hoofdstuk 5, onderdeel 1.

### 10. Problemen: annuleren, niet komen opdagen, niet doorgaan, klachten

| Situatie | Code nu | Advies |
| --- | --- | --- |
| Klant annuleert | Niet gebouwd | Route bouwen. Binnen de gratis termijn 100% terug, daarna volgens de regeling (basis: 50%). Een gedeeltelijke terugbetaling kan technisch via OPP. |
| Klant komt niet opdagen | Niet vastgelegd | Geen restitutie. Er is geen actie nodig; het geld valt vanzelf vrij aan de aanbieder. |
| Te weinig deelnemers | Werkt: 100% terug na beslismoment plus 12 uur | Behouden. Mail en "andere datum aanbieden" ontbreken nog. |
| Aanbieder annuleert | Niet gebouwd | Route bouwen. Klant krijgt 100% terug of een andere datum, met automatische terugbetaling. |
| Aanbieder komt niet opdagen | Niet gebouwd | Valt onder klachten. Klacht binnen het klachtvenster leidt tot volledige terugbetaling, kosten op de aanbieder. |
| Klacht | Niet gebouwd | Zie hoofdstuk 5, onderdeel 3. |

### 11. Ruimtes: hoe loopt het proces als een workshopgever een ruimte vindt

**Code nu:** het onderdeel staat achter een feature flag die uit staat. Het datamodel (docs/03) heeft advertenties zonder adres en prijs en contactverzoeken via Wicked Workshops. De route `/api/venues` slaat echter wel een adres, uurprijs en contactgegevens op in de oude collectie `venues`; die twee komen niet overeen.

**Advies:** laat de flag uit tot er vraag is. Gaat hij aan: eigenaar plaatst een advertentie, de workshopgever klikt op "Neem contact op", Wicked Workshops stuurt het bericht door, alle afspraken en betaling lopen buiten het platform en Wicked is geen partij bij de huurovereenkomst. Geen vergoeding voor zichtbaarheid. Beslis eerst welk datamodel geldt.

### 12. Groepsboeking: hoe wijkt het proces af

**Code nu:** alleen het aanvraagformulier. Zie hoofdstuk 5, onderdeel 7 voor het voorstel.

### 13. Einde: wanneer is een boeking voor WW afgehandeld

**Code nu:** de aanmelding krijgt de status afgerond op hetzelfde moment dat OPP het geld vrijgeeft (einde workshop plus 168 uur).

**Advies:** definieer "afgehandeld" als: de workshop heeft plaatsgevonden, het klachtvenster is gesloten zonder open klacht, het geld is vrijgegeven en de commissie is verwerkt. Dat vereist dat een open klacht de afronding tegenhoudt, wat nu niet kan (zie hoofdstuk 3, vragen voor OPP).

## 5. De acht onderwerpen uit het document

Per onderwerp een voorstel voor de pilot en wat de code nu doet. Gewenste uitkomst van het bestuur: de keuzes in de middelste kolom bevestigen of aanpassen.

### 1. Betaling en uitbetaling

| Vraag | Advies voor de pilot | Code nu |
| --- | --- | --- |
| Betaalt de klant altijd direct het volledige bedrag? | Ja, 100% vooraf | Zo werkt de code, alleen met iDEAL |
| Aanbetalingen bij groepen? | Nee. Betaal volledig vooraf na akkoord op de offerte | Niet ondersteund; een aanbetaling vraagt twee losse OPP-transacties |
| Wie bepaalt de hoogte van een aanbetaling? | Alleen als het later komt: Wicked, met een vast percentage | Niet van toepassing |
| Wanneer krijgt de aanbieder zijn geld? | Na de workshop plus klachtvenster. Start met 7 dagen en verkort naar 2 tot 3 dagen zodra de klachtroute werkt en OPP bevestigt dat de escrow te stoppen is. Niet voor de workshop en niet direct na boeking: dan draagt Wicked het terugbetalingsrisico | Escrow tot einde workshop plus 168 uur (instelling `settlement_delay_hours`). De dashboardtekst "maandelijks" klopt niet |
| Commissie inhouden of achteraf factureren? | Inhouden op de betaling, zoals nu. Wicked factureert de commissie met btw aan de aanbieder | Direct ingehouden als partner fee |
| Wie draagt het risico bij terugdraaien? | Binnen de escrow dekt het geld zelf de refund. Daarna de aanbieder als hij de oorzaak is, anders Wicked. Neem in de aanbiedersvoorwaarden op dat Wicked mag verrekenen. iDEAL kent geen kaart-chargebacks, dus het risico is beperkt | Refund komt uit de escrow; wat er na vrijgave gebeurt is niet geregeld |
| Commissie tijdens de pilot? | Stel hem in om de flow te testen. Voor echt geld bewust kiezen: bij 0% blijven OPP- en iDEAL-kosten bij Wicked terwijl klanten EUR 0 boekingskosten betalen | Percentage per categorie (9 tot 20%). Leeg veld betekent 0%. Een vast bedrag kan niet. De oude aanmeldtekst en het conceptdocument noemen 15% |

### 2. Annuleringen en no-shows

| Vraag | Advies voor de pilot | Code nu |
| --- | --- | --- |
| Eén uniforme basisregeling? | Ja. De basisregeling is de standaard, Soepel en Vast zijn keuzes van de aanbieder binnen grenzen van Wicked | Basis (48 uur), Soepel (24 uur) en Vast (7 dagen), gelezen uit `cancellation_policies`. De oude optie "geen annulering" wordt omgezet naar Vast en lijkt daardoor soepeler dan bedoeld |
| Tot wanneer kosteloos? | 48 uur voor aanvang | Zo ingesteld |
| Wat daarna? | 50% terug tot de start. Geen tegoed in de pilot: dat schept een verplichting en btw-vragen | docs/05 zegt 50%, het conceptdocument adviseert 0% daarna. Berekening is niet gebouwd |
| Klant komt niet opdagen? | Geen restitutie | Niet vastgelegd; het geld valt vanzelf vrij |
| Aanbieder annuleert? | 100% terug, of andere datum naar keuze van de klant | Niet gebouwd |
| Altijd volledig terug, of ook omboeken of tegoed? | Volledig terug of andere datum. Tegoed alleen als de klant er zelf voor kiest | Andere datum aanbieden (`session_offers`) niet gebouwd |
| Mag de aanbieder extra voorwaarden stellen? | Nee, alleen kiezen uit de drie regelingen | De wizard schrijft alleen basis, soepel of vast |
| Afwijkende voorwaarden voor groepen? | Ja, in de offerte, met een standaardtrap: tot 30 dagen kosteloos, daarna 50%, 75% en binnen 7 dagen 100% (uit het conceptdocument) | Niet gebouwd |

### 3. Klachten en problemen tijdens workshops

| Vraag | Advies voor de pilot | Code nu |
| --- | --- | --- |
| Eerst bij de aanbieder klagen? | Ja, tijdens de workshop direct bij de aanbieder. Komt er geen oplossing, dan binnen 14 dagen bij Wicked, als verzoek en niet als vervaltermijn. De escrow moet dan wel langer lopen dan het klachtvenster | Geen klachtroute |
| Wanneer bemoeit WW zich ermee? | Bij geen oplossing na 5 werkdagen, direct bij veiligheid, wangedrag of een aanbieder die niet kwam opdagen | Niet gebouwd |
| Alleen faciliteren of bemiddelen? | Bemiddelen met beperkt mandaat: Wicked hoort beide kanten en beslist alleen over terugbetaling, niet over schadeclaims | Niet gebouwd |
| Zelfstandig terugbetalen? | Ja bij een duidelijke, ernstige fout, tot het boekingsbedrag, beslist door twee teamleden of een bestuurslid | De terugbetaalfunctie bestaat, maar er is geen knop of route voor het team |
| Wie draagt de kosten? | De aanbieder als hij de oorzaak is, verrekend met de escrow of de volgende uitbetaling. Wicked bij platformfouten | Niet geregeld |
| Wanneer blokkeren of verwijderen? | Tijdelijk bij veiligheid, fraude, buiten het platform afrekenen of herhaald niet opdagen of annuleren. Definitief na gemotiveerd besluit van het bestuur. Voor ondernemers gelden volgens het conceptdocument de P2B-regels (gemotiveerde verklaring, 30 dagen opzegtermijn behalve bij fraude); Legal bevestigt | `providers.status` kent actief en gepauzeerd, maar er is geen blokkeerroute |
| Eenvoudige escalatieregel? | Ja: klacht bij aanbieder, na 5 werkdagen naar Wicked, besluit binnen 14 dagen | Niet gebouwd |

### 4. Aansprakelijkheid en bedrijfsrisico

| Vraag | Advies voor de pilot | Code nu |
| --- | --- | --- |
| Wat draagt WW zelf? | De werking van het platform, correcte verwerking van boekingen en terugbetalingen, en basisondersteuning. Het vasthouden van het geld ligt bij OPP, de verwerking ervan bij Wicked | Past bij wat de code doet |
| Wat ligt primair bij de aanbieder? | Kwaliteit, veiligheid, letsel, materialen, naleving van regels (zoals 18+ bij alcohol) en gedrag. Dat past bij het bemiddelaarsmodel dat het conceptdocument aanbeveelt | De aanbiedersverklaring bevat verklaringen over risico's, kwalificaties, veiligheid en incidenten, maar Wicked controleert de inhoud niet |
| Verzekering verplicht? | Voor risicovolle categorieën (koken, hout, buiten, drinks) een verplichte verklaring dat dekking is geregeld, voor de rest een aanbeveling. Geen controle in de pilot | Geen verzekeringsveld in het datamodel |
| Maximale aansprakelijkheid van WW? | Ja | Niet van toepassing |
| Wat is acceptabel? | Beperken tot het boekingsbedrag per geval, behalve bij opzet of bewuste roekeloosheid (zo adviseert het conceptdocument). Laat Legal beoordelen wat juridisch houdt. Overweeg ook een eigen bedrijfsaansprakelijkheids- en cyberverzekering voor Wicked | Niet van toepassing |

### 5. Foto's, teksten en ander materiaal van aanbieders

| Vraag | Advies voor de pilot | Code nu |
| --- | --- | --- |
| Marketing van WW met het materiaal? | Ja. Voor een marktplaats is dit nodig om aanbod te kunnen tonen en te promoten | Geen licentie of toestemming vastgelegd in de code. Wel worden versie en tijdstip van het akkoord met de voorwaarden bewaard |
| Welke kanalen? | Sociale media, advertenties, nieuwsbrieven, homepage en overige promotie van Wicked. Foto's met herkenbare deelnemers alleen met hun toestemming; de aanbieder garandeert zijn rechten | Niet van toepassing |
| Teksten redactioneel aanpassen? | Ja voor spelling, lengte en opmaak. Inhoudelijke wijzigingen alleen met akkoord van de aanbieder | Niet van toepassing |
| Foto's bijsnijden of verkleinen? | Ja | Een workshop heeft 1 tot 6 beelden met alt-tekst |
| Wat bij vertrek van de aanbieder? | Workshops gaan offline en Wicked gebruikt het materiaal niet meer voor nieuwe uitingen | Geen uitstroomproces |
| Reeds gemaakte publicaties? | Laten staan; terugroepen is niet haalbaar. Toekomstig gebruik stopt | Niet van toepassing |

Let op: het stockbeeld in de repository (Pexels) is volgens CLAUDE.md alleen voor ontwikkeling en moet voor productie worden vervangen.

### 6. Uitvoering van de workshop

| Vraag | Advies voor de pilot | Code nu |
| --- | --- | --- |
| Annuleren bij te weinig deelnemers? | Ja, via het minimum en beslismoment dat vooraf bij de datum staat, niet vrij | Werkt, inclusief automatische volledige terugbetaling |
| Tot welk moment? | Tot het beslismoment. Daarna heeft de aanbieder 12 uur om te kiezen voor "gaat toch door" | Werkt (instelling `decision_grace_hours`) |
| Minimum vooraf vermelden? | Ja, altijd zichtbaar ("n van m nodig") | Zichtbaar |
| Datum, tijd of locatie wijzigen na boeking? | Datum, tijd, minimum en beslismoment liggen vast zodra een datum doorgaat. Een locatiewijziging loopt via het team | De vergrendeling zit in de Directus-extensie `ww-guards`, die volgens de changelog nog niet op productie staat. De locatie is niet vergrendeld |
| Wanneer kosteloos annuleren door de klant? | Altijd, bij elke wijziging van datum, tijd of locatie | Niet gebouwd |
| Aanbieder te laat of afwezig? | Tot 15 minuten te laat geen gevolgen, daarna evenredige verlenging of terugbetaling. Niet verschijnen: 100% terug en bij herhaling blokkeren | Niet gebouwd. Zonder klacht valt het geld toch vrij |
| Ziekte of onbruikbare locatie? | Aanbieder annuleert via het dashboard. Klant kiest tussen 100% terug of een andere datum | Route niet gebouwd |
| Deelnemer weigeren of verwijderen? | Ja bij gevaarlijk of ernstig storend gedrag, zonder restitutie, met melding aan Wicked | Niet gebouwd. Regelen in de voorwaarden |

### 7. Bedrijfs- en groepsboekingen

Voorstel voor één eenvoudige handmatige pilotflow, die later te automatiseren is:

1. Het bedrijf vult het aanvraagformulier in (bestaat al).
2. Een vast aanspreekpunt bij Wicked beoordeelt de aanvraag en benadert de passende aanbieder.
3. De aanbieder vult een standaard offerteformat in: totaalprijs, datum, aantal personen, wat is inbegrepen, locatie en annuleringsvoorwaarden.
4. Wicked stuurt de offerte naar het bedrijf. Akkoord per mail.
5. Het bedrijf betaalt het volledige bedrag vooraf via OPP.
6. Uitvoering, daarna uitbetaling zoals bij reguliere workshops.

| Vraag | Advies voor de pilot | Code nu |
| --- | --- | --- |
| Wie behandelt aanvragen? | Eén vaste persoon bij Wicked. Formuleer "voorstel binnen 1 werkdag" op de website als streven | Formulier slaat op in `business_requests` |
| Offerte door aanbieder of standaardformat? | Standaardformat van Wicked, ingevuld door de aanbieder | Niet gebouwd |
| Afwijkende prijs? | Ja, de aanbieder bepaalt, de prijs staat in de offerte | Niet gebouwd. De checkout kent wel een prijsoverschrijving per datum |
| Aanbetaling? | Nee, volledig vooraf | Niet ondersteund |
| Afwijkende annuleringsvoorwaarden? | Ja, binnen de standaardtrap uit onderdeel 2 | Niet gebouwd |
| Betaling altijd via WW? | Ja, altijd via OPP (zie hoofdstuk 3). Technisch kan dit met de bestaande flow door een niet-openbare datum met vaste prijs aan te maken en de betaallink te sturen. De code kent nog geen verborgen datums en beperkt een boeking tot 50 personen | Niet gebouwd |
| Commissie? | Ja, hetzelfde percentage als reguliere boekingen | Zelfde mechanisme, categorie bepaalt het percentage |
| Wie houdt contact met het bedrijf? | Wicked tot akkoord en betaling. Daarna mag de aanbieder praktisch contact opnemen (tijd, locatie, dieet). Wijzigingen in prijs of aantal lopen via Wicked | Niet gebouwd |

### 8. Operationele rol van WW

| Vraag | Advies voor de pilot | Code nu |
| --- | --- | --- |
| Keurt WW elke nieuwe workshop handmatig? | Ja | Zo ontworpen: concept, in de check, live |
| Zelfstandig publiceren na goedkeuring van de aanbieder? | Nieuwe datums vrij. Nieuwe workshops en inhoudelijke wijzigingen via de check | Zoals docs/12 |
| Alleen formele eisen of ook inhoud? | Formele eisen, veiligheid en risico, en misleidende claims. Geen oordeel over kwaliteit: dat wekt verwachtingen en aansprakelijkheid | Niet vastgelegd |
| Wie behandelt vragen van klanten en aanbieders? | Één gedeeld mailadres met per week een vaste eigenaar. Intern streven naar antwoord binnen 2 werkdagen, niet noemen in de interface | Het contactformulier komt in `form_submissions` in Directus |
| Wie beheert terugbetalingen? | Twee personen: één beoordeelt, één voert uit | Geen route voor het team; waarschijnlijk alleen via het OPP-dashboard (te bevestigen) |
| Wie beslist over blokkeren of verwijderen? | Het bestuur, of twee aangewezen personen bij spoed | Geen blokkeerroute |
| Wat doen we in de pilot nadrukkelijk niet? | Geen berichtenfunctie, geen aanbetalingen, geen tegoeden of cadeaubonnen, geen moderatie of reactie op reviews, geen kwaliteitsinspecties, geen telefonische support, geen automatische offertes | Cadeaubon en berichtenfunctie zijn al uitgesloten in docs/12 |

## 6. Tegenstrijdigheden die eerst recht moeten

Legal schrijft op basis van deze stukken. Zolang ze elkaar tegenspreken, schrijft Legal over een product dat niet bestaat.

| Onderwerp | Conceptdocument en oude site | Code en docs | Besluit nodig |
| --- | --- | --- | --- |
| Betaalprovider | Mollie Connect, maandelijkse uitbetaling | OPP met escrow, uitbetaling 7 dagen na de workshop | Conceptdocument herschrijven op OPP |
| Boeken | Direct boekbaar plus aanvraagboekingen met betaallink van 7 dagen | Alleen direct boeken. De route `/api/bookings/confirm` is een restant dat nog Mollie gebruikt | Route verwijderen of herbestemmen |
| Na de gratis termijn | 0% terug (conceptdocument) | 50% terug (docs/05) | Kiezen |
| Namen van de regelingen | flexible\_48h, moderate\_7d, strict\_none | basis, soepel, vast; strict\_none wordt omgezet naar vast | Besluiten of "geen annulering" bestaat |
| Commissie | Vast 15% (oude aanmeldtekst, conceptdocument) | Per categorie 9 tot 20%, leeg is 0% | Kiezen en teksten gelijk trekken |
| Uitbetaling | Maandelijks (dashboardtekst, conceptdocument) | 7 dagen na de workshop | Dashboardtekst aanpassen |
| Groepen | Wicked als opdrachtnemer met één factuur (website /bedrijven) | Aanbieder is merchant, Wicked is bemiddelaar | Model A of B voor groepen kiezen |
| Reviews | Aanbieder kan reageren | Kan niet (docs/12) | Kiezen |
| Aanmelden | docs/04: eerst e-mail bevestigen | Registratie logt direct in | Bouwen of docs aanpassen |
| Ruimtes | docs/03: geen adres, geen prijs | `/api/venues` slaat adres en uurprijs op | Datamodel kiezen |
| Voorwaardenversie | Definitieve voorwaarden bestaan nog niet | Akkoord wordt vastgelegd op versie "2026-10-concept" | Bij de definitieve versie opnieuw akkoord vragen |

## 7. Wat er gebouwd moet worden voor de pilot

In volgorde van belang. Het eerste blok is nodig voordat echte mensen, ook met testgeld, de pilot gebruiken.

**Voor de eerste pilotgebruikers**

1. Verplichte mails: bevestiging met adres, datum gaat door, datum gaat niet door, annulering, en e-mailverificatie bij aanmelden.
2. Annuleren door de klant, met de deadline uit de regeling en gedeeltelijke terugbetaling via OPP.
3. Annuleren door de aanbieder, met 100% terugbetaling of een andere datum.
4. Klachtroute: formulier, overzicht voor het team en een terugbetaalactie voor het team. Zoek bij OPP uit of een escrow kan worden gestopt of verschoven.
5. De Directus-extensie `ww-guards` op productie, zodat vergrendelde datums echt vergrendeld zijn.
6. Dashboardtekst over uitbetalingen corrigeren.

**Daarna**

- Review schrijven en uitnodigingsmail.
- Groepsflow via een verborgen datum met vaste prijs.
- Plekken atomair reserveren in plaats van lezen en terugschrijven.
- Scheduler voor herinneringen vóór het beslismoment.

**Voordat er echt geld doorheen gaat (op zijn vroegst januari 2027)**

- OPP-livecontract met escrow, sleutels en notificatiegeheim, en een antwoord over IP-allowlisting.
- Een volledige test tegen de echte OPP-sandbox, inclusief KYC-doorloop en refunds.
- Btw-structuur vastgelegd door de fiscalist, en DAC7-rapportage geregeld.
- Definitieve voorwaarden, op OPP en de gekozen keuzes afgestemd.

## Bronnen

Geraadpleegd via zoekresultaten, de pagina's zelf zijn niet volledig gelezen. De code en documentatie komen uit de repository r-smink/wicked-workshops.

- [DNB: elektronische handelsplatformen en PSD2](https://www.dnb.nl/voor-de-sector/open-boek-toezicht/wet-regelgeving/psd2/elektronische-handelsplatformen-e-commerce-platforms-psd2)
- [Dirkzwager: Handelsplatform, verleent u geen betaaldiensten of toch wel](https://www.dirkzwager.nl/kennis/artikelen/handelsplatform-u-verleent-geen-betaaldiensten-of-toch-wel)
- [Emerce: handelsagent, voor platformen een onhoudbare uitzondering](https://www.emerce.nl/opinie/handelsagent-platformen-onhoudbare-uitzondering-psd2regels)
- [Online Payment Platform als betaalinstelling met DNB-vergunning](https://paymentproviders.io/providers/online-payment-platform)
- [Mollie: delayed routing](https://docs.mollie.com/docs/delayed-routing)
- [Mollie Connect: core concepts](https://docs.mollie.com/docs/core-concepts)
