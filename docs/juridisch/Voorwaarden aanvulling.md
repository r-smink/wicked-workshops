# Voorwaarden aanvulling — Wicked Workshops

> **Status:** concept, opgesteld op basis van de huidige code (oktober 2026) en wat vergelijkbare platforms doen (GetYourGuide, Airbnb Experiences, Funpas, Tripadvisor/Viator). Dit is een juridisch onderbouwde opzet, geen vervanging van een advocaat. Laat de definitieve tekst toetsen, en laat de btw-structuur (punt 0.3) toetsen door de fiscalist.
>
> Bedragen, termijnen en artikelen tussen `[vierkante haken]` zijn keuzes die nog gemaakt moeten worden.

---

## 0. Eerst: de keuze die alles bepaalt

### 0.1 Wie is de contractspartij van de klant?

Er zijn twee modellen. Bijna alle beantwoording hieronder hangt hiervan af.

| | **A. Bemiddelaar (aanbevolen)** | **B. Organisator / wederverkoper** |
|---|---|---|
| Overeenkomst voor de workshop | Tussen klant en workshopgever | Tussen klant en Wicked Workshops |
| Rol Wicked | Platform dat bemiddelt, boekt en int namens de aanbieder | Verkoopt de workshop in eigen naam |
| Aansprakelijkheid voor uitvoering | Bij de workshopgever | Bij Wicked |
| Voorbeeld | GetYourGuide, Airbnb Experiences, Viator | Klassieke reisorganisator, eventbureau |

**Advies: model A**, met één uitzondering: de zakelijke groepsboekingen (`/bedrijven`) waar Wicked één factuur stuurt en "één contactpunt" belooft. Daar ben je feitelijk de opdrachtnemer (model B). Leg dat in de voorwaarden expliciet vast als aparte module "Zakelijke boekingen".

GetYourGuide formuleert het zo: *"GetYourGuide is not the provider of the activities. The contract for the activity is concluded directly between you and the supplier."* Neem een vergelijkbare bepaling op, en maak het ook vóór het boeken zichtbaar (zie 0.2).

### 0.2 Verplichtingen als online marktplaats (gelden ongeacht het model)

- **Wie is de aanbieder?** Je moet vóór de boeking tonen wie de workshopgever is en of die een handelaar is of een particulier (art. 6:230m en 6:230v BW, zoals aangevuld door de Omnibus-richtlijn). Bij een particulier: melden dat het consumentenrecht dan niet tegenover die aanbieder geldt. *Nu niet in de code — het profiel heeft wel `kvk_number`, maar er is geen veld "handelaar ja/nee" en het wordt niet getoond.*
- **Rangschikking uitleggen.** Op basis waarvan staan workshops bovenaan (`featured`, `badge`, `is_top_rated`, beoordeling)? Een korte uitleg in de voorwaarden of een "Zo werkt onze ranglijst"-pagina is verplicht (art. 6:193e BW en art. 5 P2B-verordening). Als aanbieders voor een betere positie betalen, moet dat erbij staan.
- **Reviews.** De site claimt *"Alleen reviews van echte deelnemers"*. Dat mag, maar dan moet je ook uitleggen hoe je dat controleert (art. 6:193e BW) en het ook echt doen (review alleen mogelijk na een `completed` boeking). Verzonnen reviews (zoals nu in `mock-data.js`) zijn een zwarte-lijst-praktijk (art. 6:193g BW) — weghalen vóór livegang, dat staat ook al in de README.
- **De knop.** De laatste knop in de checkout moet duidelijk maken dat er een betaalverplichting ontstaat: "Boeken en betalen" of "Bestelling met betalingsverplichting" (art. 6:230v lid 3 BW). Bij aanvraagboekingen (niet `instant_bookable`) is "Aanvraag versturen" prima, zolang de betaling pas daarna komt.
- **Prijzen all-in.** Prijzen inclusief btw en inclusief een eventuele servicefee van Wicked. De `service_fee` staat nu op 0; komt die er, dan moet hij in de getoonde prijs per persoon zitten, niet pas in de checkout verschijnen.

### 0.3 Geld innen namens aanbieders

De huidige flow: de klant betaalt via Mollie aan Wicked, Wicked houdt 15% commissie in en betaalt maandelijks uit aan de aanbieder. Twee aandachtspunten:

1. **Betaaldienstenvergunning (PSD2).** Wie geld ontvangt en doorbetaalt namens derden, verleent in beginsel een betaaldienst waarvoor een DNB-vergunning nodig is. De uitzondering voor "handelsagenten" is smal. De gangbare oplossing is **Mollie Connect (Mollie for Platforms)** met split payments of gekoppelde accounts: Mollie verzorgt de doorbetaling en de KYC van de aanbieders, Wicked blijft buiten de geldstroom. Advies: dit inrichten vóór de eerste echte boeking.
2. **Btw.** Treedt Wicked op in eigen naam (de klant ziet alleen Wicked), dan kan de Belastingdienst Wicked zien als degene die de workshop levert (art. 3 lid 3 / art. 4 lid 3 Wet OB, "commissionair"), met btw over het volledige bedrag. Treedt Wicked op als bemiddelaar *op naam en voor rekening van* de aanbieder, dan is alleen de commissie met btw belast. Dit moet in de voorwaarden, op de bevestiging en op de facturen consequent terugkomen. Laat de fiscalist dit vastleggen (staat ook al op de bedrijvenpagina).

---

## 1. Betaling

### 1.1 Betaaltermijnen

| Type boeking | Wat de code nu doet | Advies voor de voorwaarden |
|---|---|---|
| **Direct boekbaar** (`instant_bookable`) | Volledige betaling via Mollie direct bij boeken; plek wordt 30 minuten vastgehouden (`hold_expires_at`) | Vooruitbetaling van 100% bij boeken. De boeking is pas definitief na ontvangst van de betaling. Niet betaald binnen 30 minuten = de reservering vervalt automatisch. |
| **Op aanvraag** | Aanbieder bevestigt, daarna betaallink met 7 dagen houdtijd | Betaling binnen **[7 dagen]** na bevestiging, maar uiterlijk **[48 uur]** vóór aanvang. Daarna vervalt de reservering zonder kosten. *Let op: de code hanteert nu een vaste 7 dagen, ook als de workshop over 3 dagen is. Beperk de houdtijd tot het moment van aanvang min de annuleringstermijn.* |
| **Cadeaubon** | (nog niet gebouwd) | 100% bij aankoop. |
| **Zakelijk / groepsofferte** | (nog niet gebouwd) | Betaling op factuur, **14 dagen** na factuurdatum. Wettelijk maximum zonder uitdrukkelijke afspraak is 30 dagen, bij grote ondernemingen tegenover mkb maximaal 60 (art. 6:119a BW). |
| **Uitbetaling aan workshopgevers** | Dashboard: "automatisch aan het einde van elke maand" | Uitbetaling **[maandelijks, voor de 15e van de maand volgend op de workshop]**, na aftrek van 15% commissie (incl./excl. btw — vastleggen!), en alleen voor workshops die hebben plaatsgevonden. GetYourGuide betaalt maandelijks achteraf; Airbnb ±24 uur na aanvang. |

Volledige vooruitbetaling is in de vrijetijdsbranche gebruikelijk (GetYourGuide, Viator, Funpas rekenen allemaal 100% vooraf af) en toegestaan. De regel dat een consument niet verplicht kan worden meer dan 50% vooruit te betalen (art. 7:26 lid 2 BW) geldt voor koop, niet voor diensten.

### 1.2 Aanbetalingen

- **Consumentenboekingen:** geen aanbetaling, gewoon 100% vooraf. Dat is eenvoudiger en past bij de Mollie-flow.
- **Groepsboekingen en zakelijke offertes (vanaf `group_quote_from`, standaard 10 personen):** gangbaar is
  - **[50%] aanbetaling** bij akkoord op de offerte, restant **[14 dagen]** vóór de workshop; of
  - bij boekingen binnen 14 dagen vóór de datum: 100% direct.
- Leg vast dat het **aantal deelnemers** tot **[7 dagen]** vooraf kosteloos verlaagd kan worden met maximaal **[10%]**; daarna wordt het opgegeven aantal gefactureerd. Verhogen kan altijd, als er plek is.

### 1.3 Gevolgen van te late betaling

- **Consument, vooruitbetaling:** te laat betalen bestaat in de praktijk niet; zonder betaling geen boeking. Formulering: *"Is de betaling niet binnen de gestelde termijn ontvangen, dan vervalt de reservering automatisch en worden de plekken vrijgegeven. Er zijn dan geen kosten verschuldigd."*
- **Zakelijk, op factuur:**
  - Na de vervaldatum is de klant zonder ingebrekestelling in verzuim (bij een fatale termijn, art. 6:83 sub a BW).
  - Wicked mag de deelname opschorten zolang het (aan)betaalde bedrag niet binnen is (art. 6:52 / 6:262 BW). Is de aanbetaling niet binnen op **[7 dagen]** vóór aanvang, dan mag Wicked de boeking annuleren met toepassing van de annuleringskosten (§3).

### 1.4 Incassokosten en rente

| | Consument | Zakelijke klant |
|---|---|---|
| **Rente** | Wettelijke rente (art. 6:119 BW), nu 6%* | Wettelijke handelsrente (art. 6:119a BW), nu 10,15%*. Een hogere contractuele rente mag, maar is in de praktijk weinig gebruikelijk; 1% per maand komt veel voor. |
| **Incassokosten** | Pas na een kosteloze **14-dagenbrief** (art. 6:96 lid 6 BW). Hoogte volgens de staffel van het *Besluit vergoeding voor buitengerechtelijke incassokosten*: 15% over de eerste € 2.500, minimaal € 40. Een hoger bedrag afspreken is nietig. | Dezelfde staffel geldt als niets anders is afgesproken; een afwijkende afspraak (bv. 15% met een minimum van € 150) mag. Bij handelstransacties is minimaal € 40 altijd verschuldigd (art. 6:96 lid 4 BW). |

\* De wettelijke rentes worden halfjaarlijks vastgesteld. Neem in de voorwaarden geen percentage op, alleen het wetsartikel.

Voorbeeldtekst consument:
> *Betaal je een openstaand bedrag niet op tijd, dan sturen we je eerst een kosteloze herinnering met een betaaltermijn van 14 dagen. Betaal je daarna nog niet, dan ben je de wettelijke rente en de wettelijke incassokosten verschuldigd.*

---

## 2. Levering of uitvoering

De "levering" bestaat hier uit drie dingen: de boekingsbevestiging, de cadeaubon en de workshop zelf.

### 2.1 Levertijden

| Wat | Termijn |
|---|---|
| Boekingsbevestiging met boekingscode (`WW-XXXXXX`) | Direct na betaling per e-mail. *De e-mailverzending zit nog niet in de code — de code staat nu alleen op `/boeking/terug`.* |
| Reactie op een aanvraagboeking | Aanbieder reageert binnen **[48 uur]**; zonder reactie vervalt de aanvraag automatisch en wordt de klant geïnformeerd. (Het profiel toont al `response_time_minutes`.) |
| Groepsofferte | "Voorstel binnen 1 werkdag" staat op de site — dat is een belofte; formuleer het in de voorwaarden als inspanningsverplichting ("streven naar"). |
| Cadeaubon | Digitaal direct na betaling; fysieke bon binnen **[5 werkdagen]**. Wettelijk maximum zonder afspraak is 30 dagen (art. 7:9 lid 4 BW). |
| De workshop | Op de geboekte datum, tijd en locatie zoals in de bevestiging. |

### 2.2 Risico-overgang

- **Digitale bevestiging/cadeaubon:** het risico ligt bij Wicked tot de klant hem heeft ontvangen. Een bon die niet aankomt sturen we opnieuw. Een verloren of gelekte code: Wicked blokkeert de oude en geeft een nieuwe, mits nog niet gebruikt. Wie de code als eerste gebruikt, mag erop vertrouwen dat die geldig is — leg vast dat Wicked niet aansprakelijk is voor gebruik door een derde aan wie de klant de code zelf heeft doorgegeven.
- **Fysieke cadeaubon (als je die gaat verzenden):** bij consumenten gaat het risico pas over bij aflevering (art. 7:11 BW). Dat kun je niet uitsluiten.
- **Wat deelnemers mee naar huis nemen** (keramiek, bloemstuk, kaarsen — `inclusion_types: "Mee naar huis"`): risico gaat over op het moment dat de deelnemer het werkstuk meekrijgt. Moet het werkstuk eerst nog gebakken of opgestuurd worden (bij keramiek gebruikelijk), dan blijft het risico bij de aanbieder tot overhandiging of bezorging. Leg in de aanbiedersvoorwaarden vast dat de aanbieder dit in de workshopbeschrijving moet vermelden (ophaaltermijn, verzendkosten, wat er gebeurt met niet-opgehaalde werkstukken — bv. "na 3 maanden vervallen").
- **Eigendommen tijdens de workshop:** de deelnemer blijft zelf verantwoordelijk voor eigen spullen; schade aan materiaal van de aanbieder door opzet of grove nalatigheid komt voor rekening van de deelnemer.

### 2.3 Vertragingen

| Situatie | Regeling |
|---|---|
| **Deelnemer komt te laat** | Geen recht op verlenging of korting. Na **[15 minuten]** mag de aanbieder toegang weigeren; dat geldt dan als no-show (`no_show` bestaat al als status). Geen restitutie. GetYourGuide hanteert dezelfde lijn. |
| **Aanbieder begint te laat** | Tot **[15 minuten]** geen gevolgen. Langer: de workshop wordt evenredig verlengd, of de deelnemer krijgt een evenredige terugbetaling. |
| **Aanbieder kan niet** (ziekte, overmacht) | Aanbieder meldt dit zo snel mogelijk; de klant kiest tussen een andere datum of **100% terugbetaling** binnen **[14 dagen]**. Status `cancelled_by_provider`. |
| **Te weinig deelnemers** (`min_participants`) | De wizard belooft al: "Hieronder annuleren we automatisch en bieden we de gast een andere datum." Leg vast: annulering uiterlijk **[48 uur]** vooraf, keuze uit andere datum of volledige terugbetaling. |
| **Buitenactiviteiten en weer** | Aanbieder beslist uiterlijk **[24 uur]** vooraf; bij afgelasting zelfde regeling als hierboven. Slecht-maar-veilig weer is geen reden voor kosteloze annulering door de klant. |
| **Overmacht** | Definieer het (extreem weer, overheidsmaatregelen, epidemie, storing bij de locatie). Bij overmacht aan de kant van de aanbieder: altijd keuze tussen verzetten of volledig geld terug. Een voucher **in plaats van** geld terug mag alleen als de klant daar zelf voor kiest — bij corona hebben de ACM en de rechter een opgedrongen voucher niet aanvaard. |

Aansprakelijkheid: in model A is de aanbieder aansprakelijk voor de uitvoering. Beperk de aansprakelijkheid van Wicked tot het bedrag van de boeking, met uitzondering van opzet en bewuste roekeloosheid (een verdergaande uitsluiting staat op de grijze lijst, art. 6:237 sub f BW). Verplicht aanbieders in de aanbiedersvoorwaarden een **bedrijfsaansprakelijkheidsverzekering** te hebben — zeker bij koken, houtbewerking en buitenactiviteiten.

---

## 3. Annulering en beëindiging

### 3.1 Geen herroepingsrecht, wel een annuleringsbeleid

Bij workshops op een vaste datum heeft de consument **geen wettelijk herroepingsrecht** van 14 dagen: dat is uitgezonderd voor "diensten betreffende vrijetijdsbesteding met een specifieke datum of periode van uitvoering" (art. 6:230p onder f BW / art. 16 sub l Richtlijn 2011/83). Je **moet** dit wel vóór het boeken melden (art. 6:230m lid 1 sub k BW). Zonder die melding kan de klant zich alsnog op het herroepingsrecht beroepen.

**Uitzondering:** de **cadeaubon** heeft geen vaste datum. Op de aankoop van de bon zelf rust dus wél het herroepingsrecht van 14 dagen. Advies: verleen dat ruimhartig zolang de bon niet is gebruikt.

Daarom is het annuleringsbeleid een contractuele regeling. Die moet duidelijk zijn en mag niet onredelijk bezwarend zijn (art. 6:233 BW). Een annuleringsvergoeding die hoger is dan de werkelijke schade van de aanbieder kan dat zijn; vlak voor aanvang is 100% verdedigbaar omdat de plek dan meestal niet meer gevuld wordt.

### 3.2 Wanneer mag een klant annuleren en wat kost het?

De wizard kent nu drie beleidsvormen (`cancellation_policy`). Advies: voeg een vierde, gebalanceerde vorm toe, en laat de aanbieder per workshop kiezen.

| Beleid | Code | Tot … vóór aanvang | Daarna | Vergelijkbaar met |
|---|---|---|---|---|
| **Flexibel** | `flexible_48h` | 48 uur: 100% terug | 0% terug | GetYourGuide-standaard (24 uur) |
| **Gemiddeld** | `moderate_7d` | 7 dagen: 100% terug | 0% terug | Viator "standard" |
| **Gemiddeld met staffel** *(nieuw voorstel)* | `moderate_tiered` | 7 dagen: 100%; 7 d–48 u: 50% | binnen 48 u: 0% | Airbnb Experiences, Funpas |
| **Strikt** | `strict_none` | Geen restitutie | — | Alleen voor events met hoge vaste kosten |

Altijd geldend, ongeacht het beleid:

- **Omboeken** naar een andere datum van dezelfde workshop: kosteloos tot **[48 uur]** vooraf, mits er plek is (de FAQ belooft dit al: "Verzetten naar een andere datum kan altijd kosteloos" — dan moet dat ook in de voorwaarden en ook bij `strict_none`, of de FAQ moet aangepast).
- **Iemand anders laten gaan**: altijd kosteloos toegestaan, tenzij er een leeftijdsgrens (`age_rating`) of niveau-eis geldt.
- **No-show**: geen restitutie.
- **Terugbetaling** binnen **[14 dagen]** via hetzelfde betaalmiddel (Mollie refund; status `refunded` bestaat al).
- **Servicekosten van Wicked** (als die komen): bij annulering door de aanbieder altijd terug; bij annulering door de klant binnen het gratis venster ook terug (GetYourGuide doet dit), daarbuiten mag je ze behouden mits dat vooraf gemeld is.
- **Cadeaubon**: een geboekte workshop die met een bon is betaald, volgt hetzelfde annuleringsbeleid; de restitutie gaat terug op de bon, niet in geld.

**Groepen en zakelijk (§1.2):**

| Moment van annuleren | Kosten |
|---|---|
| Tot 30 dagen vooraf | Kosteloos, of alleen gemaakte kosten |
| 30 – 14 dagen | 50% |
| 14 – 7 dagen | 75% |
| Binnen 7 dagen | 100% |

**Inconsistenties in de huidige site die je vóór livegang moet oplossen:**
1. `WorkshopPage.jsx` toont bij de eerste sessie altijd *"Gratis annuleren tot 48 uur vooraf"*, ook als de workshop `strict_none` of `moderate_7d` heeft. Dat is misleidend (art. 6:193c BW) — toon het werkelijke beleid.
2. `ProviderPage.jsx` en `SIDE_COPY` (registratie) beloven algemeen "Gratis annuleren tot 48 uur vooraf". Maak dat "bij de meeste workshops" of laat het weg.
3. De FAQ in `mock-data.js` zegt *"daarna betaal je 50 procent"* — dat beleid bestaat in de code niet.
4. `ListingPage.jsx`: *"Dat verschilt per aanbieder. Gemiddeld kun je tot 48 uur…"* — goed, zo hoort het.

### 3.3 Mag Wicked opdrachten weigeren of beëindigen?

**Tegenover klanten** — ja, neem op dat Wicked of de aanbieder een boeking mag weigeren of annuleren bij:
- vermoeden van fraude of misbruik van betaalmiddelen of kortingscodes;
- een kennelijke prijsfout (bij een duidelijke vergissing ontstaat geen overeenkomst, art. 3:35 BW; vermeld het toch);
- het niet voldoen aan leeftijds- of gezondheidseisen die in de workshop staan (bv. 18+ bij drankproeverijen — verplicht te controleren onder de Alcoholwet);
- wangedrag, onder invloed zijn, of gevaar voor anderen: aanbieder mag de deelnemer de toegang ontzeggen of verwijderen, **zonder restitutie**;
- een aanvraagboeking: de aanbieder mag die zonder opgave van redenen afwijzen (er is dan nog geen overeenkomst). Weigeren op grond van ras, geslacht, handicap etc. is uiteraard nooit toegestaan (AWGB).

Bij annulering door Wicked of de aanbieder zonder dat het aan de klant ligt: altijd 100% terug.

**Tegenover workshopgevers** — hier geldt de **P2B-verordening (EU 2019/1150)**, omdat Wicked een online tussenhandelsdienst is voor ondernemers:
- **Beperken of opschorten** van een aanbieder (workshop offline halen, account blokkeren): de aanbieder krijgt uiterlijk op dat moment een **gemotiveerde verklaring** (art. 4 lid 1 P2B).
- **Beëindigen** van de samenwerking: minimaal **30 dagen opzegtermijn** met motivering (art. 4 lid 2), behalve bij een wettelijke plicht, herhaalde schendingen of fraude.
- **Wijziging van de voorwaarden** (bv. de commissie): minimaal **15 dagen** vooraf aankondigen (art. 3 lid 2); de aanbieder mag dan opzeggen.
- **Klachtensysteem** voor aanbieders: verplicht, tenzij Wicked een kleine onderneming is (< 50 medewerkers én < € 10 mln omzet) — dan vrijgesteld, maar het is wel netjes om er een te hebben.
- Noem in de aanbiedersvoorwaarden concreet waarvoor je kunt opschorten: structureel lage beoordelingen (bv. gemiddeld < 3,5 over 10 reviews), meer dan **[2]** annuleringen door de aanbieder per kwartaal, buiten het platform om afrekenen met via Wicked geworven klanten, misleidende informatie, ontbrekende verzekering, geen geldige identificatie/KYC (DAC7 en Mollie).

---

## 4. Garantie en klachten

### 4.1 Hoe lang kunnen klanten klagen?

- Wettelijk moet een klant **binnen bekwame tijd** na ontdekking klagen (art. 6:89 BW); bij consumenten is een klacht binnen **twee maanden** na ontdekking in elk geval tijdig (analoog aan art. 7:23 BW). Een kortere klachttermijn tegenover consumenten is niet afdwingbaar.
- Praktische regeling (zoals GetYourGuide en Airbnb): *meld een probleem tijdens de workshop direct bij de workshopgever, zodat die het kan oplossen; lukt dat niet, meld het dan zo snel mogelijk en bij voorkeur binnen **[14 dagen]** bij Wicked.* Formuleer die 14 dagen als verzoek, niet als vervaltermijn ("klachten die later binnenkomen nemen we ook in behandeling, maar kunnen we soms minder goed onderzoeken").
- Verjaring: vorderingen uit de overeenkomst verjaren in 5 jaar (art. 3:307 BW); bij non-conformiteit van een gekocht product (bv. werkstuk dat kapot aankomt) 2 jaar na de klacht (art. 7:23 lid 2).
- **Zakelijk** mag je een vervaltermijn afspreken, bv. **8 dagen** na de workshop.

### 4.2 Welke garantie geef je?

Er geldt hoe dan ook het **wettelijke conformiteitsvereiste**: de workshop moet zijn zoals beschreven (art. 6:74 / 7:401 BW, zorg van een goed opdrachtnemer). Dat kan niet worden uitgesloten.

Daarbovenop een eigen **"Wicked-garantie"** als marketingbelofte (GetYourGuide heeft iets vergelijkbaars). Voorstel:

1. **Betaalgarantie** — je geld staat veilig bij Mollie; gaat de workshop niet door, dan krijg je het terug.
2. **"Zoals beschreven"-garantie** — wijkt de workshop wezenlijk af van de beschrijving (andere locatie, veel kortere duur, inbegrepen materialen ontbreken, veel grotere groep dan `max_participants`), dan krijg je een gedeeltelijke of volledige terugbetaling.
3. **Echte reviews** — alleen deelnemers met een afgeronde boeking kunnen een review plaatsen.

Wat géén garantie is: een "tevreden of geld terug" op smaak of persoonlijke beleving. Dat is ongebruikelijk en financieel riskant. Een eigen garantie mag de wettelijke rechten nooit beperken; vermeld dat expliciet (zie art. 7:6a BW voor dezelfde lijn bij consumentenkoop).

### 4.3 Hoe worden klachten afgehandeld?

Voorstel klachtenprocedure (consument):

1. **Melding** via een klachtenformulier of `[klachten@wickedworkshops.nl]`, met boekingscode.
2. **Ontvangstbevestiging** binnen **[2 werkdagen]**.
3. Wicked legt de klacht voor aan de workshopgever, die **[5 werkdagen]** heeft om te reageren.
4. **Inhoudelijke reactie** binnen **14 dagen**; als dat niet lukt, binnen 14 dagen een bericht met een verwachte termijn.
5. Oplossing: omboeken, gedeeltelijke of volledige restitutie (verrekend met de uitbetaling aan de aanbieder — leg in de aanbiedersvoorwaarden vast dat Wicked dit mag verrekenen).
6. **Komen we er niet uit:** de klant kan naar de bevoegde rechter. Overweeg aansluiting bij **De Geschillencommissie** (algemene commissie of via een brancheorganisatie) — dat wekt vertrouwen, maar kost een bijdrage per zaak.

Let op: het **Europese ODR-platform** is per 20 juli 2025 opgeheven. Een verwijzing naar `ec.europa.eu/odr` die veel oude voorwaarden nog hebben, hoort er niet meer in.

**Reviews die klachten zijn:** de aanbieder mag reageren op een review (dashboard heeft dat al). Wicked verwijdert een review alleen bij strijd met de reviewrichtlijnen (beledigend, persoonsgegevens, geen echte deelnemer) — niet omdat hij negatief is. Publiceer die richtlijnen.

**Meldingen van illegale inhoud (DSA):** zorg voor een meldknop of e-mailadres om illegale workshops, foto's of reviews te melden, en een contactpunt voor autoriteiten (art. 11, 12 en 16 DSA). Deze plichten gelden ook voor kleine platforms.

---

## 5. Overige bepalingen die je nodig hebt

Kort, omdat ze niet gevraagd zijn, maar ze horen in de set:

- **Cadeaubon:** geldigheid **minimaal 2 jaar** (korter wordt door de rechter vaak onredelijk bevonden; de vordering verjaart pas na 5 jaar, dus na afloop coulant zijn). Restwaarde blijft op de bon staan. Niet inwisselbaar voor geld, behalve binnen de 14 dagen herroeping. Btw: dit is een *meervoudige-doeleindenvoucher* — btw pas bij inwisseling.
- **Leeftijd en gezondheid:** deelnemers onder 18 alleen met toestemming van een ouder; alcohol alleen 18+ (aanbieder controleert ID); deelnemer meldt allergieën en beperkingen vooraf (dat zijn gezondheidsgegevens — zie de privacyverklaring).
- **Foto's tijdens de workshop:** de aanbieder mag alleen herkenbaar fotograferen voor publicatie met toestemming van de deelnemer.
- **Intellectueel eigendom:** aanbieders geven Wicked een licentie op hun teksten en foto's voor het platform en marketing; aanbieders garanderen dat ze de rechten op de foto's hebben.
- **Buiten het platform om afrekenen** met via Wicked geworven klanten: verboden voor **[12 maanden]** na de boeking (anti-circumvention, zoals bij Airbnb).
- **Toepasselijk recht:** Nederlands recht. Rechter: tegenover consumenten mag je de relatieve bevoegdheid niet beperken tot je eigen woonplaats als dat de consument benadeelt (art. 6:236 sub n BW); tegenover zakelijke klanten wel.
- **Toepasselijkheid AV:** de voorwaarden moeten vóór of bij het boeken ter hand worden gesteld (art. 6:234 BW; online: link + downloadbaar). In de huidige checkout ontbreekt een verwijzing naar voorwaarden en privacyverklaring. Voor aanbieders is er al een vinkje ("Ik ga akkoord met de voorwaarden voor workshopgevers en met 15 procent commissie per boeking") — bewaar het tijdstip en de versie van de voorwaarden waarmee is ingestemd.

---

## 6. Opbouw van de voorwaardenset (advies)

1. **Algemene gebruiksvoorwaarden platform** — voor iedereen (account, reviews, gedrag, aansprakelijkheid van Wicked, DSA-meldingen).
2. **Boekingsvoorwaarden voor deelnemers** — §1 t/m §4 van dit document, consumentenkant.
3. **Voorwaarden voor workshopgevers** — commissie, uitbetaling, P2B, verzekering, KYC/DAC7, kwaliteit, opschorting.
4. **Zakelijke voorwaarden** — groepsoffertes en facturatie (Wicked als opdrachtnemer).
5. **Cadeaubonvoorwaarden** — kort, op de bon zelf te vermelden.
6. **Privacyverklaring en cookieverklaring** — zie `privacy-verklaring.md`.
