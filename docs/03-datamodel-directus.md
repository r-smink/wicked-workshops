# 03 - Datamodel in Directus

Afgeleid uit de zes gekozen schermreeksen. Het is een voorstel dat alle schermen dekt; breid uit als de publieke voorkant (ronde 1) meer nodig heeft. Namen van collections en velden in het Engels, `snake_case`. Alle collections hebben `id` (uuid), `date_created`, `date_updated`, `user_created`, `user_updated` (Directus-standaard) tenzij anders vermeld.

## Rollen en policies

Eenmalig account voor iedereen. Een persoon kan tegelijk deelnemer, workshopgever en ruimte-eigenaar zijn ("inloggen vanaf het dashboard van een workshopgever en vanaf een deelnemersaccount gaat via hetzelfde scherm").

| Rol | Wie | Opmerking |
|---|---|---|
| `Public` (policy) | uitgelogde bezoeker | leest alleen live workshops, hun datums en zichtbare ruimtes |
| `Member` (rol) | elke ingelogde gebruiker | rechten volgen uit eigendom (`$CURRENT_USER`), niet uit extra rollen |
| `Team` (rol) | medewerkers Wicked Workshops | nakijken, privevelden, beheer |
| `Admin` | techniek | Directus-beheer |

Of iemand workshopgever is, volgt uit het bestaan van een rij in `providers` met `user = $CURRENT_USER`. Of iemand ruimte-eigenaar is, volgt uit rijen in `venue_listings`. Maak hier geen aparte Directus-rollen van; dat zou een tweede account of rolwissel afdwingen.

## Gebruikers (`directus_users`, uitgebreid)

Extra velden: `first_name` (bestaat al, "voornaam, mag leeg"), `email_verified_at` (timestamp), `last_context` (`participant` | `provider` | `venue`, voor de standaardbestemming na inloggen), `notify_reminder_decision` (bool, default true), `notify_new_session_followed` (bool, default true), `notify_saved_almost_full` (bool, default true), `notify_tips` (bool, default false). Verplichte transactiemails (bevestiging, "datum gaat door of niet") hebben geen schakelaar.

Vraag niet om achternaam, adres, telefoon of geboortedatum bij gewone accounts.

## Referentiedata (seed, beheerd door het team)

**`categories`** - 12 stuks: Koken & bakken, Keramiek & klei, Ambacht & maken, Schilderen & kunst, Drinks & proeverijen, Wellness & beauty, Bloemen & groen, Actief & buiten, Dans, muziek & theater, Fotografie & media, Niche & onverwacht, Duurzaam & repair. Velden: `name`, `slug`, `image` (file), `sort`, `commission_percent` (intern, 9 tot 20, nu ongebruikt; "straks een commissie per categorie").

**`occasions`** (gelegenheden) - `date` (Date), `friends` (Vrienden), `team` (Teamuitje), `bachelor` (Vrijgezellenfeest), `kids` (Kinderfeestje). Velden: `name`, `slug`, `sort`. Cadeau en Familie zijn niet bevestigd: niet seeden.

**`places`** (plaatsen) - `name`, `slug`, `province`, `lat`, `lng`. Elke plaats mag, ook een dorp. Voor autocomplete in de wizard: seed alle Nederlandse woonplaatsen (CBS-lijst) en laat een aanbieder geen vrije tekst invoeren zonder match.

**`cancellation_policies`** - `key` (`basis` | `soepel` | `vast`), `name`, `description`, `free_until_hours_before` (48, 24, 168), `penalty_percent_after` (50, null, 50), `reschedule_free` (bool). Soepel en Vast zijn werktekst; houd de tekst in een veld, niet in code.

**`platform_settings`** (singleton) - `min_hours_decision_before_start` (default 48), `enforce_min_decision_lead` (default false, zie `12`), `reminder_hours_before_decision` (json `[48, 10]`), `decision_default_time` (optioneel), `pilot_no_payments` (true).

## Workshops

**`providers`** (1 per gebruiker, de publieke workshopgever) - `user` (O2O, unique), `first_name`, `area_label` ("Wittevrouwen, Utrecht"), `bio`, `photo` (file), `kind` (`private` | `business`, voor het label particulier of ondernemer), `status` (`active` | `paused`), `has_location` (`own` | `need` | `unknown`, uit de eerste vraag bij aanmelden), `onboarded_at`.

**`provider_declarations`** (PRIVE, alleen team en de eigenaar zelf) - `provider` (M2O, unique tot beslist is of per workshop), `first_name`, `last_name`, `birth_date`, `home_address`, `email`, `phone`, `kind` (`private` | `business`), `kvk_number`, `trade_name`, `iban`, `declared_adult`, `declared_info_correct`, `declared_risks`, `declared_qualifications`, `declared_safe`, `declared_reachable`, `declared_incidents`, `accepted_terms_version`, `signed_at`, `ip` (optioneel). Alle `declared_*` zijn verplicht waar. `kvk_number` en `trade_name` alleen verplicht als `kind = business`. Bewaartermijn en privacytekst: nog open (`12`).

**`workshops`**
- `provider` (M2O)
- `status`: `draft` | `in_review` | `live` | `hidden` (door team of aanbieder weggehaald)
- `title` (max 70), `slug`
- `category` (M2O), `place` (M2O, plaatsnaam wordt getoond), `occasions` (M2M)
- `short_description` (max 120), `description` (tekst), `includes` (json, lijst korte regels), `faq` (json: `[{question, answer}]`, niet verplicht)
- `duration_minutes` (opties 120, 150, 180 en meer, lijst uitbreidbaar), `language` (`nl` | `en` | `nl_en`), `level` (`none` | `some`), `age_min` (null, 16, 18), `accessibility` (kort tekstveld)
- `location_kind`: `own_place` | `participant_home` | `company` | `online` | `seeking`. Bij `seeking` vervalt het adres en blijft de workshop `draft`.
- `price_cents` (integer, tijdens de pilot informatief)
- `cancellation_policy` (M2O)
- `submitted_at`, `published_at`, `review_note` (door team, intern; hoe het team terugkoppelt is open, zie `12`)
- Afgeleid, opgeslagen voor snelle lijsten: `rating_avg`, `review_count`, `next_session_at`

**`workshop_private`** (O2O op workshops, alleen eigenaar, team en geboekte deelnemers via serveractie) - `address` (straat en huisnummer). Publiek staat alleen de plaats. Deelnemers krijgen het adres in hun bevestigingsmail en op hun aanmeldingspagina na aanmelding.

**`workshop_images`** (M2M met sort) - `workshop`, `file`, `sort`, `alt`. Minimaal 1, maximaal 6. `sort = 0` is het omslag.

**`workshop_sessions`** (de "datums")
- `workshop` (M2O)
- `starts_at`, `ends_at` (afgeleid van duur, wel opgeslagen)
- `capacity_max` (integer, verplicht)
- `min_participants` (integer, nullable: leeg betekent "gaat altijd door")
- `decision_at` (timestamp, verplicht als `min_participants` gevuld is, anders null)
- `state`: `open` | `confirmed` | `not_happening` | `cancelled_by_provider`
- `confirmed_at`, `closed_at`
- Afgeleid, niet handmatig: `persons_booked`, `seats_left`, `still_needed`, `is_full`. Bereken in een database-view of in `lib/rules/session.ts` en cache op de rij na elke boeking via een Flow.
- Constraints: `ends_at > starts_at`, `capacity_max >= 1`, `min_participants <= capacity_max`, `decision_at < starts_at`.

## Aanmeldingen en reviews

**`bookings`** (aanmeldingen)
- `session` (M2O), `user` (M2O, nullable: gasten boeken zonder account), `email`, `first_name`, `persons` (integer), `dietary_note` (tekst, "Allergie of dieetwens", zichtbaar voor aanbieder), `status`: `confirmed` | `cancelled` | `moved` (verzet) | `session_cancelled`
- `access_token` (random, 32 bytes base64url, unique, voor de link "Bekijk of wijzig je aanmelding" zonder account)
- `moved_from` (M2O naar `bookings`, voor verzetten)
- `cancelled_at`, `cancel_fee_percent` (bevroren op annuleermoment, pilot: informatief)
- `reviewed` (afgeleid)
- Index op `(email)` en `(user)`.

**`session_offers`** - als een datum niet doorgaat of door de aanbieder wordt geannuleerd: `booking`, `offered_session`, `status` (`pending` | `accepted` | `declined` | `expired`), `created_at`, `responded_at`. De keuze van de aangeboden datum en wat er gebeurt zonder reactie is open (`12`).

**`reviews`** - `booking` (O2O, unique: 1 review per aanmelding), `workshop`, `provider`, `user` (nullable), `display_first_name`, `rating` (1 tot 5), `body`, `status` (`published` default, `pending` voor later), `created_at`. Alleen te maken als de bijbehorende datum voorbij is en de aanmelding niet geannuleerd was. De aanbieder kan niet reageren (geen veld, geen knop).

**`saved_workshops`** (user, workshop) en **`follows`** (user, provider), beide unique per paar. Een volger krijgt een mail bij een nieuwe datum (als `notify_new_session_followed`).

## Locatie gezocht

**`venue_listings`** (ruimte van een eigenaar)
- `owner` (M2O naar `directus_users`), `visible` (bool, "verborgen" betekent niet te vinden maar wel bewaard), `status` (`draft` | `published`)
- `name` ("Zeg wat het is, niet hoe het heet"), `place` (M2O), `neighbourhood` (wijk, tekst), `kind` (`kitchen` | `atelier` | `hall` | `outdoor`), `capacity` (integer), `amenities` (M2M of json-tags: Groot eiland, Twee ovens, Water, Vaatwasser, Lange tafel, Rolstoeltoegankelijk, en meer), `description`
- `availability` (json: raster van 3 dagdelen x 7 dagen, bijvoorbeeld `{"mon":["afternoon","evening"], ...}`; geen agenda, alleen "meestal vrij")
- Geen adres, geen prijs en geen huurbedrag in de advertentie. Of een adres vooraf zichtbaar is, is open.
- `venue_images` (M2M met sort, maximaal 6, eerste is omslag).

**`venue_contact_requests`** - `listing`, `from_user`, `message` (optioneel), `created_at`, `status`. De knop "Neem contact op met de eigenaar" bestaat in het ontwerp; wat er daarna gebeurt is niet beslist. Zie `12` voor de standaard.

## Rechtenmatrix (samengevat)

| Collection | Public | Member | Team |
|---|---|---|---|
| categories, occasions, places, cancellation_policies | lezen | lezen | volledig |
| workshops | lezen waar `status = live` | eigen (via `provider.user`) volledig, behalve `status`: aanbieder mag alleen `draft -> in_review` en `live <-> hidden` | volledig |
| workshop_private | geen | eigen workshops | volledig |
| workshop_sessions | lezen bij live workshop | eigen workshops, met veldvergrendeling (zie `05`) | volledig |
| bookings | geen | eigen (`user = $CURRENT_USER`), aanbieder leest alleen kolommen `first_name`, `persons`, `dietary_note`, `created_at`, `status` van eigen datums | volledig |
| provider_declarations | geen | eigen | volledig |
| providers | lezen (alleen publieke velden) | eigen | volledig |
| reviews | lezen waar `published` | maken via serveractie met controle op aanmelding, lezen | volledig |
| saved_workshops, follows | geen | eigen | lezen |
| venue_listings | lezen waar `visible` en `published` | eigen volledig | volledig |

Gasten (aanmelding zonder account) hebben geen Directus-sessie. Alles wat ze via `access_token` doen loopt via een Next.js route handler met een beperkt systeemtoken, met controle op het token en rate limiting.

## Directus Flows en extensies (minimaal)

1. `booking.after_create` -> bevestigingsmail, herbereken sessiecijfers, bepaal `confirmed`.
2. `booking.after_update` (annulering) -> herbereken, nooit van `confirmed` terug naar `open`.
3. `session.cron_decision` (elke 5 minuten) -> sessies met `state = open`, `decision_at <= now`: zet `not_happening`, maak `session_offers`, mail deelnemers en aanbieder.
4. `session.cron_reminders` -> herinneringen 48 en 10 uur voor `decision_at` aan deelnemers van sessies die nog niet `confirmed` zijn (alleen als `notify_reminder_decision` of gastaanmelding).
5. `user.after_verified` -> koppel gastaanmeldingen met hetzelfde geverifieerde e-mailadres aan het account.
6. `workshop.after_update` -> revalideer Next.js-cache, mail aanbieder bij `live`.
7. Mailtemplates: zie `05`.
