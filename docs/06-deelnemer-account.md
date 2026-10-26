# 06 - Deelnemer: account maken en inloggen (dflow-a)

Referentie: `reference/pages/dflow-a.html`, CSS `reference/css/dflow-a.css`. Auth-gedrag staat in `04-auth.md`. Hier de schermen en hun inhoud.

De negen schermen in het prototype staan onder elkaar in de volgorde waarin Sanne ze tegenkomt. In productie zijn het losse routes (tabel in `04`). Hergebruik de kop met announce, header en footer uit `02`.

Sanne is de voorbeeldpersoon (voornaam, e-mail `sanne@voorbeeld.nl`, aanmelding voor "Italiaans koken met Luca: verse pasta", za 21 nov, 15:00 tot 18:00, Wittevrouwen, Utrecht). Dat is voorbeelddata: in productie komt alles uit de aanmelding.

## Scherm 1 - Bevestiging op de site: `/aanmelding/[token]`

Sanne heeft zich zonder account aangemeld.

- Kop (h1): "Je bent aangemeld voor za 21 nov bij Luca". Bovenlabel "Je plek staat vast".
- Tekst: "De bevestiging staat ook in je mail, met een link om je aanmelding terug te zien. Daar heb je geen account voor nodig."
- Kaart met beeld van de workshop en regels: Workshop, Wanneer, Waar ("Wittevrouwen, Utrecht. Het adres staat in je mail."), Met ("1 persoon"), Stand ("1 van 4 nodig. Is het minimum er uiterlijk vr 20 nov, 22:00, dan gaat de middag door. Je krijgt een herinnering vóór het beslismoment.").
- Blok "Zie je aanmelding later terug": "Maak een account met het e-mailadres van je aanmelding. Je aanmelding voor za 21 nov hangt er meteen aan." Het e-mailadres staat vast (niet bewerkbaar). Veld "Kies een wachtwoord (minimaal 8 tekens)", knop "Maak mijn account", scheiding "of zonder wachtwoord" met Google en Apple (feature flag), regel over voorwaarden en privacybeleid, en "Een account hoeft niet: je aanmelding blijft gewoon staan."
- Data: `bookings` opgehaald via `access_token`, met `session` en `workshop`. Toon op dit scherm alleen de wijk, nooit `workshop_private.address` (het adres staat in de mail).
- Gebruik dezelfde pagina voor "Bekijk of wijzig je aanmelding" uit de mail: toon stand en acties verzetten en annuleren (gedrag in `05`, uiterlijk als het paneel in `07` scherm 3).

## Scherm 2 - Na "Maak mijn account": `/account-maken/controleer-mail`

- h2 "Bijna klaar: bevestig je e-mailadres".
- Tekst: "We hebben een mail gestuurd naar sanne@voorbeeld.nl. Klik op de knop in die mail, dan staat je account klaar met je aanmelding erin."
- "Geen mail? Kijk in je spam, of stuur hem opnieuw. Verkeerd adres? Pas het aan."
- Ernaast een weergave van de mail (alleen illustratie in het ontwerp). In productie niet tonen; de mail zelf bouw je in `mail/account_verify`.
- Mail: onderwerp "Bevestig je e-mailadres". Tekst: "Hoi Sanne, je account is bijna klaar. Klik op de knop om te laten zien dat dit jouw e-mailadres is. Daarna zie je je aanmelding voor za 21 nov bij Luca in je account." Knop "Bevestig mijn e-mailadres". Voet: "Heb je geen account gemaakt? Dan kun je deze mail negeren."
- Annotatie: eerst bevestigen, dan pas binnen (standaard). Alternatief "meteen binnen laten en later bevestigen" is niet gekozen.

## Scherm 3 - De bevestigingsmail van de aanmelding (alleen mail)

Template `booking_confirmed`. Kop "Je bent aangemeld: za 21 nov bij Luca", "Hoi Sanne, je plek staat vast.", dan een blok met Workshop, Wanneer, Waar (`[adres van Luca], Wittevrouwen, Utrecht`), Stand ("1 van 4 nodig, beslismoment vr 20 nov, 22:00"), knop "Bekijk of wijzig je aanmelding". Onderaan het blok "Al je aanmeldingen op één plek? Maak met één klik een account met dit e-mailadres. Deze aanmelding staat er dan meteen in." met knop "Maak mijn account". Deze knop gaat naar scherm 4.

## Scherm 4 - Alleen een wachtwoord kiezen: `/account-maken/wachtwoord?token=`

- h2 "Nog één ding: kies een wachtwoord".
- "Je e-mailadres sanne@voorbeeld.nl" met badge "bevestigd".
- Veld "Wachtwoord (minimaal 8 tekens)" met knop "Toon", knop "Maak mijn account", daaronder "of" en de knoppen Google en Apple (feature flag).
- Zijkaart "Dit staat straks in je account": mini-kaartje met "za 21 nov, 15:00", "Italiaans koken met Luca", "1 van 4 nodig", plus "Ook latere aanmeldingen met sanne@voorbeeld.nl komen er vanzelf bij."

## Scherm 5 - Eerste keer binnen: `/mijn-account?welkom=1`

Banner bovenaan Mijn account (de referentie linkt nog naar het oude concept A van Mijn account; je bouwt het gekozen concept B uit `07`). Label "Je account staat klaar", h2 "Welkom, Sanne. Je aanmelding staat erin.", tekst: "Hier zie je voortaan je aanmeldingen met de stand van elke datum. Je kunt een datum delen, verzetten of annuleren, en na afloop een review schrijven." De banner is wegklikbaar en verschijnt 1 keer.

## Scherm 6 - Account maken zonder boeking: `/account-maken`

Via "Inloggen" in de header en dan "Maak een account".

- h2 "Maak een account". Knoppen Google en Apple (flag), "of met je e-mailadres".
- Velden: "Je e-mailadres", "Kies een wachtwoord (minimaal 8 tekens)", "Je voornaam (mag leeg)". Knop "Maak mijn account". Regel: "Je gaat akkoord met de voorwaarden en het privacybeleid. Daarna krijg je de mail uit scherm 2. Al een account? Log in".
- Zijkaart met beeld en "Wat je aan een account hebt": "Al je aanmeldingen op één plek, met de stand van elke datum" / "Workshops bewaren en workshopgevers volgen" / "Na afloop een review schrijven" / afsluiter "Boeken kan ook zonder account."
- We vragen geen geboortedatum, adres of telefoonnummer. Voornaam mag leeg; de eerste aanmelding vult hem in.

## Scherm 7 - Inloggen: `/inloggen`

Zie `04`. Twee standen: leeg en met foutmelding. Voorgevuld e-mailadres alleen als dat via de querystring of na een fout wordt teruggegeven. Veld "Je wachtwoord", checkbox "Ingelogd blijven op dit apparaat", link "Wachtwoord vergeten?", knop "Log in", Google en Apple (flag), "Nog geen account? Maak er een".

## Scherm 8 - Wachtwoord vergeten: `/wachtwoord-vergeten`, `/wachtwoord-kiezen`

Drie stappen: aanvraag ("Wachtwoord vergeten", "Vul je e-mailadres in. Hoort er een account bij, dan sturen we een link om een nieuw wachtwoord te kiezen.", knop "Stuur me een link", link "Terug naar inloggen"), de mail (template `password_reset`), en het kiezen ("Kies een nieuw wachtwoord", veld met "Toon", knop "Opslaan en inloggen", "Daarna ben je ingelogd en kom je in Mijn account.").

## Scherm 9 - Link werkt niet meer: `/link-werkt-niet-meer`

Zie `04`. Rechts een uitleg "Wat er daarna gebeurt" in drie punten: "Nieuwe link aangevraagd - De oude link doet niets meer." / "Mail met een nieuwe link - Dezelfde mail als in scherm 2 of 8." / "Klaar - Je e-mailadres is bevestigd of je kiest je nieuwe wachtwoord, en je bent binnen."

## Acceptatiecriteria

1. Gast kan boeken, krijgt mail, opent `/aanmelding/[token]` zonder account.
2. Vanuit die pagina en vanuit de mail kan hij een account maken; na bevestigen staat de aanmelding in Mijn account.
3. Een tweede aanmelding met hetzelfde adres na het maken van het account staat er vanzelf in.
4. Inloggen, "ingelogd blijven", fouten, wachtwoord vergeten en verlopen link werken en tonen letterlijk de teksten uit de referentie.
5. Geen enkele melding verraadt of een e-mailadres bij ons bekend is.
6. Playwright-tests dekken minstens de paden 1, 2 en 4.
