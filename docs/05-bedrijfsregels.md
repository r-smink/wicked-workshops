# 05 - Bedrijfsregels

Dit zijn de regels die in de schermen terugkomen. Implementeer ze als zuivere functies in `web/lib/rules/` (of een Directus-extension) met unit tests, en laat UI, Flows en acties dezelfde functies gebruiken.

## 1. Boeken is direct

Deelnemers boeken direct. De aanbieder keurt niets goed. Elke aanmelding is meteen zichtbaar in het dashboard. ("handmatig goedkeuren", cadeaubon per workshop en groepsoffertes bestaan niet in dit ontwerp; groepen lopen via een aanvraag bij het team.)

## 2. Datum, minimum en beslismoment

Een datum (`workshop_session`) heeft een maximum en optioneel een minimum met beslismoment.

- **Geen minimum:** de datum "gaat altijd door". `state = confirmed` vanaf aanmaken. Geen beslismoment. Tekst: "Geen minimum, dus geen beslismoment."
- **Wel minimum:** de datum verzamelt aanmeldingen. Weergave: "n van m nodig", met stoelenbalk (gevuld is aangemeld, gestippeld is nog nodig voor het minimum).
- **Minimum gehaald** (som van `persons` van bevestigde aanmeldingen >= `min_participants`), op welk moment dan ook: `state = confirmed`, `confirmed_at = now`. Dit blijft zo, ook als iemand daarna afzegt. "Gaat een datum door, dan blijft dat zo."
- **Beslismoment bereikt zonder minimum:** `state = not_happening`. Iedereen die zich aanmeldde krijgt een mail en een andere datum aangeboden (`session_offers`). "Gaat een datum niet door, dan krijgt iedereen die zich aanmeldde een andere datum aangeboden."
- **Vol:** `persons_booked >= capacity_max`. Toon "Vol" (een weergavestand, geen opslagstand). Een volle datum is niet te boeken en niet te kiezen bij verzetten.

Afgeleide teksten (laat ze uit 1 functie komen):

| Toestand | Tekst |
|---|---|
| open, 1 van 4 | "1 van 4 nodig" en "Nog 3 aanmeldingen nodig" |
| open, 0 van 4 | "0 van 4 nodig", "Nog niemand aangemeld." |
| confirmed met minimum | "Gaat door" en, in het dashboard, "Gaat door sinds do 5 nov" |
| confirmed zonder minimum | "Gaat altijd door" |
| vol | "Vol", "8 van 8" |
| beslismoment | "Beslismoment vr 20 nov, 22:00" |

Zorg dat "over 11 dagen" (resterende tijd tot beslismoment) ook correct is bij minder dan 1 dag (uren) en na het beslismoment.

### Vergrendeling zodra een datum doorgaat

Zodra `state = confirmed` met een minimum: datum, tijd, minimum en beslismoment zijn niet meer te wijzigen ("De N deelnemers rekenen erop, dus deze velden liggen vast"). Of het maximum nog omhoog mag is niet beslist; standaard: ook vast (zie `12`). Afdwingen in Directus (veldvalidatie of hook), niet alleen in de UI. De enige mutatie die blijft is "Datum annuleren".

### Beslismoment valideren

- `decision_at < starts_at` altijd.
- Voorstel uit het overleg: minimaal 48 uur tussen beslismoment en start. Dit is een voorstel, geen regel; het vaste beslismoment van Luca (vrijdag 22:00 voor zaterdag 15:00, 17 uur ervoor) zou het breken. Standaard: toon een zachte waarschuwing boven de drempel en blokkeer niet (`platform_settings.enforce_min_decision_lead = false`). Zet de drempel in `platform_settings`.
- In het formulier "Nieuwe datum" toont de regel eronder (live): "Is het minimum er dan, dan gaat de datum door en blijft dat zo. Zo niet, dan krijgen de deelnemers een andere datum aangeboden."

### Eindtijd

`ends_at = starts_at + workshop.duration_minutes`. In het formulier staat "Eindtijd 18:00, de workshop duurt 3 uur" als hulptekst, niet als veld.

## 3. Herinneringen en beslismoment

Voor datums die nog niet `confirmed` zijn:

- Mail 48 uur en 10 uur voor het beslismoment aan alle deelnemers ("herinnering vóór het beslismoment", uitzetbaar in Instellingen voor gebruikers met account). Dit staat als "lijst voor Rick" in het ontwerp: bouw de scheduler met de tijden in `platform_settings.reminder_hours_before_decision`.
- Mail aan de aanbieder bij elk beslismoment of een datum doorgaat.

Idempotentie: sla per (`booking`, `reminder_kind`) op dat de mail is verstuurd; de cron mag nooit dubbel mailen.

## 4. Verzetten door deelnemer

Gratis, tot de start. In het paneel "Verzetten, kosteloos" kies je een andere datum van dezelfde workshop. Weergave per optie: datum plus stand ("gaat door", "vol", "3 van 4 nodig", "0 van 4 nodig"). Volle datums zijn uitgeschakeld. Standaard geselecteerd is de aangeboden of eerstvolgende datum waar plek is. Verzetten maakt een nieuwe aanmelding (`moved_from` wijst terug) en zet de oude op `moved`; het aantal personen blijft hetzelfde.

Regel bij verzetten naar een datum die nog verzamelt: de verplaatste aanmelding telt mee voor die datum. De oorspronkelijke datum verliest ze. Een oorspronkelijke datum die al `confirmed` was blijft dat.

## 5. Annuleren door deelnemer

Tekst in het paneel (voor de basisregeling): "Gratis tot do 19 nov, 15:00. 50 procent daarna, tot de start. Dit is de basisregeling, die geldt bij de meeste workshops." Het tijdstip is `starts_at - free_until_hours_before`. Tijdens de pilot wordt niets afgerekend; sla wel `cancel_fee_percent` op zodat de regel later toepasbaar is. De knop heet "Annuleer, nu nog gratis" zolang het gratis is, daarna "Annuleer" met de kosten genoemd. Na annuleren: bevestigingsmail en melding in Mijn account.

De annuleerregelingen zijn "De basis" (gratis tot 48 uur vooraf, daarna 50 procent, verzetten kosteloos), "Soepel" (gratis tot 24 uur) en "Vast" (gratis tot 7 dagen vooraf, daarna 50 procent). Soepel en Vast zijn werktekst en de regelingen zijn niet uitgewerkt; lees ze uit `cancellation_policies`.

## 6. Datum wordt geannuleerd door de aanbieder

"Kun je echt niet? Annuleer je deze datum, dan krijgen alle N deelnemers bericht en een andere datum aangeboden. Doe dit alleen als het niet anders kan." Zet `state = cancelled_by_provider`, alle aanmeldingen op `session_cancelled`, maak `session_offers`, mail iedereen. Vraag in de UI om bevestiging. Het ontwerp toont de knop alleen bij datums die al doorgaan; bij datums die nog verzamelen volstaat het weghalen van de datum zolang er geen aanmeldingen zijn (bouw dit als "Datum verwijderen", alleen bij 0 aanmeldingen).

## 7. Een andere datum aanbieden

Wanneer een datum niet doorgaat of wordt geannuleerd krijgt elke deelnemer een voorstel. In Mijn account verschijnt het blok bovenaan: "Er is een nieuwe datum voor je: za 5 dec. Zelfde tijd, de datum gaat al door, en er is plek." met knoppen "Ja, za 5 dec" en "Andere datum of annuleren". Hoe het voorstel wordt gekozen en wat er gebeurt zonder reactie is niet beslist. Standaard (zie `12`): kies de eerstvolgende datum van dezelfde workshop die `confirmed` is, niet vol en minimaal 48 uur in de toekomst; zonder reactie verloopt het aanbod 7 dagen voor die datum en wordt de aanmelding geannuleerd zonder kosten. Maak dit in 1 functie met 1 configuratieregel.

## 8. Reviews

- Alleen deelnemers die via Wicked Workshops boekten en meededen kunnen een review schrijven. Meegedaan = aanmelding `confirmed` en de datum is voorbij.
- 1 review per aanmelding. 2 vragen, 1 per scherm: "Hoe was het bij Noor?" (1 tot 5 sterren) en "Wat wil je anderen vertellen?" (tekst, mag kort). De review staat er met de voornaam van de deelnemer.
- De review verschijnt direct (`status = published`). Of reviews eerst worden nagekeken en of de aanbieder kan reageren is niet beslist. Bouw het veld `status` wel in, en geen reactieknop.
- Na plaatsen: werk `rating_avg` en `review_count` van workshop en aanbieder bij. Het dashboard van de aanbieder toont de verdeling over 5 tot 1 sterren.

## 9. Check door het team

Elke nieuwe workshop gaat pas live na een nakijkronde door het team, met of zonder bedrijf. Statussen: `draft` -> `in_review` ("Ingestuurd op vr 6 nov", "In de check") -> `live`. Moet er iets anders, dan hoort de aanbieder het per mail (een berichtenfunctie is er niet; zie `12`). Mail bij `live`: "Je workshop staat online". Bij het terugzetten naar `draft` met `review_note` gaat een mail met de opmerking.

Geen termijn in de teksten ("hoe lang de check duurt is niet vastgelegd").

## 10. Particulier of ondernemer

- Een particulier hoeft geen btw-nummer of KvK. Het wordt getoond bij de workshop: "Aangeboden door een particulier. Het consumentenrecht geldt niet." (werktekst, door Geeta en de jurist uit te werken, zet in `content/werkteksten.ts`).
- Die regel verschijnt pas op de workshoppagina als de aanbieder `kind = private` kiest in de verklaring.
- Bij een particulier zonder btw-nummer staat er geen "inclusief btw" bij de prijs; hoe de prijs dan heet is niet beslist (zie `12`).
- Bij een ondernemer: KvK-nummer en handelsnaam zijn verplicht.

## 11. Mails (alle templates)

Alle mails hebben onderwerp, voornaam-aanhef ("Hoi Sanne,"), 1 knop en een veiligheidsregel waar van toepassing. Zet ze in `mail/` en houd ze plat HTML met platte-tekstvariant.

| Sleutel | Wanneer | Inhoud |
|---|---|---|
| `booking_confirmed` | na boeking | "Je bent aangemeld: za 21 nov bij Luca". Workshop, wanneer, waar (volledig adres), stand ("1 van 4 nodig, beslismoment vr 20 nov, 22:00"), knop "Bekijk of wijzig je aanmelding", en voor gasten een blok "Al je aanmeldingen op één plek? Maak met één klik een account" met knop "Maak mijn account". |
| `account_verify` | account maken | "Bevestig je e-mailadres". Knop "Bevestig mijn e-mailadres". "Heb je geen account gemaakt? Dan kun je deze mail negeren." |
| `provider_verify` | aanmelden workshopgever | "Bevestig je e-mailadres", andere tekst (zie `08`). |
| `venue_verify` | eigenaar ruimte | onderwerp "Klopt dit e-mailadres?" (zie `11`). |
| `password_reset` | wachtwoord vergeten | onderwerp "Kies een nieuw wachtwoord". |
| `reminder_decision` | 48 en 10 uur voor beslismoment | stand en wat te doen (delen). |
| `session_confirmed` | minimum gehaald | "Za 21 nov gaat door". |
| `session_not_happening` | beslismoment gemist | met aangeboden datum. |
| `session_cancelled` | aanbieder annuleert | met aangeboden datum. |
| `booking_cancelled` | deelnemer annuleert | kosten (pilot: geen) en bevestiging. |
| `review_invite` | 1 dag na de datum | link naar de reviewvraag. |
| `workshop_live`, `workshop_changes` | check door team | zie 9. |
| `new_session_followed` | nieuwe datum van gevolgde aanbieder | alleen als aan. |
| `saved_almost_full` | bewaarde workshop bijna vol | alleen als aan. |

Altijd verplicht (geen schakelaar): `booking_confirmed`, `session_confirmed`, `session_not_happening`, `session_cancelled`, `booking_cancelled`, beveiligingsmails.
