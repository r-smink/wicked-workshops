# Directus-schema voor Wicked Workshops

Scripts die het datamodel, de leesrechten en voorbeelddata in Directus zetten. Getest op een lokale Directus 12.5 met SQLite: schema, rechten en seed draaien zonder fouten en zijn opnieuw uit te voeren zonder dubbele data. Nog niet getest op jullie eigen Directus op Coolify.

## Wat je nodig hebt
- Node 18 of nieuwer (geen packages nodig).
- Een Directus-URL en een statisch token van een admin-gebruiker (Directus > Gebruikers > jouw gebruiker > Token). Gebruik het token alleen lokaal of in je shell, nooit in de repo.

## Uitvoeren
```
cd directus
export DIRECTUS_URL=https://directus.wickedworkshops.nl
export DIRECTUS_ADMIN_TOKEN=...        # niet committen
node apply-schema.mjs        # collecties, velden en relaties
node apply-permissions.mjs   # leesrechten voor bezoekers
node seed.mjs                # voorbeelddata uit het ontwerp (optioneel)
```
Probeer het eerst op een lokale of staging-Directus voordat je het op productie draait. De scripts maken niets kapot dat al bestaat: bestaande collecties en rechten worden overgeslagen.

## Collecties
`categories`, `cities`, `providers`, `spaces`, `workshops`, `sessions` (datums), `bookings`, `reviews`, `help_topics`, `faqs`, `messages`, `room_requests` en de koppeltabel `workshops_files` (galerij).

Standen van een datum (`sessions.status`): `open`, `door`, `niet_door`, `vol`. "Geen minimum" is geen stand: dat is `workshops.min_participants` leeg laten. Een stand wordt op het beslismoment omgezet door een Directus Flow of een geplande taak in de website (nog te bouwen).

## Rechten
- Bezoekers (publieke rol) mogen alleen lezen: categorieen, plaatsen, aanbieders, ruimtes, workshops, reviews, hulp, FAQ, datums, bestanden. Boekingen, berichten en aanvragen zijn niet publiek.
- Op een Directus die eigen filterregels toestaat, lezen bezoekers alleen items met `status = published`. Staat jullie Directus dat niet toe (in de test gaf een 403 `custom_permission_rules_enabled`), dan maakt het script de leesrechten zonder filter en meldt dat. Filter dan in de frontend altijd op `status=published` en zet geen gevoelige tekst in concepten.
- Formulieren (boeken, contact, ruimte zoeken of bieden) gaan niet rechtstreeks van de browser naar Directus. Ze lopen via een route handler in Next.js (server-side), die valideert, spam tegenhoudt en met een eigen token schrijft. Maak daarvoor in Directus een aparte gebruiker met rol "Website" die alleen mag aanmaken in `bookings`, `messages` en `room_requests`, en zet het token als `DIRECTUS_STATIC_TOKEN` in Vercel. Gebruik hier nooit het admin-token.

## Daarna nog zelf doen
1. Foto's uploaden in Directus en koppelen (`hero_image`, `photo`, `image`). De seed koppelt geen foto's.
2. De seed-data is verzonnen en herkenbaar als voorbeeld; vervang die door echte content.
3. Een Flow bouwen die `sessions.booked` bijhoudt bij nieuwe boekingen en op `decision_at` de stand omzet en de mails verstuurt.
4. Bij een bestaande Directus: controleer in `schema.mjs` of de collectienamen niet botsen met wat er al staat.
