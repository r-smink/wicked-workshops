# 04 - Inloggen en accounts

Gekozen concept: **e-mail en wachtwoord (concept A)**, met Google en Apple als optionele extra knoppen. Ze staan als voorbeeld in het ontwerp ("welke aanbieders er komen, is nog niet gekozen"): bouw de knoppen achter een feature flag `auth.social` en zet de flag standaard uit tot er providers gekozen zijn. Zonder providers verdwijnen ook de scheidingen "of" in de schermen.

Er is 1 inlogscherm voor deelnemers, workshopgevers en ruimte-eigenaren.

## Overzicht van de routes

| Route | Scherm | Bron |
|---|---|---|
| `/inloggen` | Inloggen, plus foutstand | dflow-a s7, aflow-a s6, lflow-a s6 |
| `/account-maken` | Account maken (los, zonder boeking) | dflow-a s6 |
| `/account-maken/controleer-mail` | "Bijna klaar: bevestig je e-mailadres" | dflow-a s2 |
| `/account-maken/bevestigen?token=` | route handler: bevestigt en logt in | dflow-a s2, s5 |
| `/account-maken/wachtwoord?token=` | alleen wachtwoord kiezen, vanuit de bevestigingsmail van een aanmelding | dflow-a s4 |
| `/wachtwoord-vergeten` | e-mailadres invullen | dflow-a s8 |
| `/wachtwoord-vergeten/verstuurd` | bevestiging | dflow-a s8 |
| `/wachtwoord-kiezen?token=` | nieuw wachtwoord kiezen | dflow-a s8 |
| `/link-werkt-niet-meer?type=bevestigen\|wachtwoord&e=` | "Deze link werkt niet meer" met "Stuur een nieuwe link" | dflow-a s9 |
| `/aanmelding/[token]` | bevestigingspagina na boeking zonder account, met aanbod voor een account | dflow-a s1 |
| `/mijn-account` | eerste scherm na inloggen (deelnemer) | `07` |

Redirect na inloggen: `?next=` als die er is en intern is (valideer dat het een relatief pad is), anders op basis van `last_context`: `participant` naar `/mijn-account`, `provider` naar `/workshopgever`, `venue` naar `/locatie-gezocht/mijn-ruimtes`. Eerste keer na bevestigen (dflow-a s5): `/mijn-account?welkom=1`.

## Account maken met e-mail en wachtwoord

Velden: e-mailadres, wachtwoord (minimaal 8 tekens, geen samenstellingsregels, controleer wel tegen een lijst gelekte wachtwoorden als dat eenvoudig kan), voornaam (mag leeg; "dan vullen we hem in bij de eerste aanmelding"). Akkoord met voorwaarden en privacybeleid staat als tekstlink bij de knop, geen losse checkbox.

Volgorde (dflow-a s6 en s2):

1. Gebruiker verstuurt het formulier. Maak het account aan met status "niet bevestigd" en verstuur de bevestigingsmail met een eenmalige link. Toon `/account-maken/controleer-mail` met de opties "stuur hem opnieuw" en "Pas het aan" (verkeerd adres).
2. Klik op de link: route handler valideert de token, markeert `email_verified_at`, logt in en stuurt naar `/mijn-account?welkom=1`. Eerst bevestigen, dan pas binnen: zo ziet niemand die jouw adres intypt jouw aanmeldingen.
3. Bij `?welkom=1` toon je het eerste scherm "Welkom, Sanne. Je aanmelding staat erin." (dflow-a s5) bovenaan Mijn account.

Gebruik Directus' eigen registratie en e-mailverificatie als dat past (publieke registratie aan, verificatie aan, redirect-URL op de allowlist). Als de standaardmail of -flow niet genoeg is voor de eigen mailtemplates of het meegeven van `intent`, bouw dan een eigen route handler die een Directus-gebruiker aanmaakt met het statische token en een eigen tokentabel gebruikt. Beide zijn goed; maak de keuze in fase 1 en leg die vast in `docs/12` onder "Auth-implementatie".

Intent: `intent=participant|provider|venue` reist mee in de registratie (opgeslagen op de token) zodat de bevestigingslink op de juiste vervolgpagina uitkomt (`provider` naar `/workshopgever/welkom`, `venue` naar de ruimte-invulpagina).

## Account maken vanuit een boeking (zonder wachtwoordmail)

Sanne heeft zich als gast aangemeld. Er zijn twee ingangen en beide eindigen op "alleen nog een wachtwoord kiezen":

- Vanaf de bevestigingspagina `/aanmelding/[token]`: formulier met het (vooraf ingevulde, niet bewerkbare) e-mailadres van de aanmelding en een wachtwoord. Verstuur de bevestigingsmail zoals hierboven.
- Vanuit de bevestigingsmail van de aanmelding: knop "Maak mijn account". De link bevat een ondertekende token die het adres al bewijst. Ga naar `/account-maken/wachtwoord?token=`. Scherm: e-mailadres met label "bevestigd", wachtwoordveld met "Toon", knop "Maak mijn account", plus Google en Apple. Rechts of eronder "Dit staat straks in je account" met de aanmelding. Na opslaan: ingelogd, adres bevestigd, aanmelding gekoppeld, door naar `/mijn-account?welkom=1`.

Koppelen: na `email_verified_at` zet je `bookings.user` voor alle rijen met hetzelfde e-mailadres (case-insensitive, getrimd) en `user IS NULL`. Koppel nooit op een onbevestigd adres.

Als iemand via Google of Apple inlogt met een ander adres dan dat van de aanmelding, hangt de aanmelding er niet vanzelf aan. Voorstel (staat als voorstel in concept C): toon na inloggen "Is deze aanmelding van jou?" met een mail naar het aanmeldadres dat de koppeling bevestigt. Pas bouwen als social login aan staat.

## Inloggen

Velden: e-mailadres, wachtwoord, checkbox "Ingelogd blijven op dit apparaat", link "Wachtwoord vergeten?", knop "Log in", onderaan "Nog geen account? Maak er een".

Foutmelding (letterlijk uit het ontwerp): "Dit e-mailadres en dit wachtwoord horen niet bij elkaar. Probeer het nog eens, of kies een nieuw wachtwoord." Dezelfde melding voor onbekend adres, fout wachtwoord en niet-bevestigd account (voor die laatste mag je een extra regel tonen met "Stuur de bevestigingsmail opnieuw", zonder te verklappen dat het adres bestaat: toon die regel altijd, niet alleen bij bestaande accounts). Zorg ook dat de responstijd niet verraadt of een account bestaat. Beperk pogingen per IP en per adres.

"Ingelogd blijven" aan: refresh-cookie 30 dagen. Uit: sessiecookie. Access-token kort (15 minuten) en stil vernieuwd in `middleware.ts`.

Welke gebruiker waar landt: zie redirectregel hierboven. In de header toont een workshopgever "Mijn dashboard", een deelnemer "Mijn account". Heeft iemand beide, toon beide in het accountmenu.

## Wachtwoord vergeten

1. `/wachtwoord-vergeten`: veld e-mailadres, knop "Stuur me een link". Antwoord altijd hetzelfde: "Hoort er een account bij, dan sturen we een link om een nieuw wachtwoord te kiezen."
2. Mail "Kies een nieuw wachtwoord", knop "Kies een nieuw wachtwoord", met de regels "De link werkt één keer." en "Niet zelf aangevraagd? Dan hoef je niets te doen; je oude wachtwoord blijft werken."
3. `/wachtwoord-kiezen?token=`: nieuw wachtwoord (minimaal 8, met "Toon"), knop "Opslaan en inloggen". Daarna ingelogd en op de juiste startpagina.
4. Verlopen of gebruikte link: `/link-werkt-niet-meer` met de uitleg "Een link uit onze mail werkt één keer en niet onbeperkt lang. Vraag een nieuwe aan, dan staat hij zo in je mail." en een veld met het adres en "Stuur een nieuwe link". Daaronder de uitleg wat er daarna gebeurt, en "Weet je je wachtwoord nog? Log dan gewoon in."

Geldigheid van links is niet beslist. Standaard: bevestigingslink 24 uur, wachtwoordreset 1 uur, beide eenmalig. Zet ze in configuratie. Zet in de tekst bewust geen termijn (zo staat het in het ontwerp).

Na een wachtwoordwijziging: alle andere sessies van die gebruiker ongeldig maken.

## Account beheren (deelnemer)

In Instellingen (zie `07`): e-mailadres wijzigen werkt pas als op de link in de mail aan het nieuwe adres is geklikt. Wachtwoord wijzigen (let op: in het gekozen ontwerp van Mijn account staat nog de tekst "Inloggen: Met een link in je mail aan dit adres". Dat hoort bij concept B. Vervang door "Inloggen: met een wachtwoord" plus link "Wachtwoord wijzigen", zoals in het dashboard van de workshopgever). Account verwijderen: zie `12`.

## Veiligheid

- Wachtwoorden hasht Directus (argon2). Sla zelf nooit wachtwoorden of tokens leesbaar op; sla tokens gehasht op in je eigen tokentabel als je die bouwt.
- CSRF: server actions en route handlers die state wijzigen controleren de `Origin`. Cookies zijn `sameSite=lax`.
- Rate limiting op alle tokenroutes, inloggen, wachtwoord-vergeten en "stuur opnieuw".
- Mails bevatten geen wachtwoord en geen bijlage.
- Gasttokens (`/aanmelding/[token]`) zijn 32 bytes random, niet raadbaar, en geven alleen toegang tot die ene aanmelding. Geen enumeratie, geen sequentiele ids.
