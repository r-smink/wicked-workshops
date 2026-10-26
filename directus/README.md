# Directus (achterkant)

Lokale Directus 11.17.4, dezelfde versie als productie (`directus.wickedworkshops.nl`). Geen Docker: PostgreSQL 16 draait ingebouwd via `embedded-postgres`, Mailpit als los programma. Alles wat het schema, de rechten en de data bepaalt staat hier als code.

## Starten

```bash
npm ci && npm run setup     # eenmalig; setup haalt Node 22, PostgreSQL-links en isolated-vm op
npm run dev                 # PostgreSQL :5433, Mailpit :8025, Directus :8055
```

Bij de eerste start maakt `npm run dev` het bestand `directus/.env` aan met willekeurige geheimen, een beheerder (`admin@example.com`, wachtwoord in `.env`) en een statisch beheerderstoken (`ADMIN_TOKEN`) voor de scripts. Vul daarna in een tweede terminal de database:

```bash
npm run schema:apply        # schema/snapshot.yaml -> lokale Directus
npm run seed                # rollen, rechten, categorieen, gelegenheden, 2502 plaatsen, annuleerregelingen, platform_settings
npm run seed:demo           # idem plus Sanne, Luca, Lotte, Mirjam, Noor (wachtwoord: demo-wachtwoord)
```

Directus draait op Node 22, ook als de machine een nieuwere Node heeft: isolated-vm (nodig voor Directus) heeft alleen kant-en-klare builds tot en met Node 22. Daarom staat `ignore-scripts=true` in `.npmrc` en doet `npm run setup` de installatiestappen zelf.

## Testen

```bash
npm test                    # regels van de hook, zonder Directus
npm run test:permissions    # rechtenmatrix uit docs/03, tegen de draaiende lokale Directus
npm run verify              # bouwt een schone Directus uit de code (poort 8056) en draait alles
```

`verify` is wat CI doet: lege database, `snapshot.yaml`, migraties, extensie, seed, tests.

## Mappen

| Map | Wat |
|---|---|
| `schema/snapshot.yaml` | Het schema. Wijzig het nooit alleen in de Directus-UI. |
| `schema/migrations/` | Stappen van het live schema naar docs/03, via de API, idempotent. |
| `seed/` | Rollen en rechten (`access.mjs`, `fields.mjs`), referentiedata, demo-data. |
| `extensions/directus-extension-ww-guards/` | Hook voor wat rechten niet kunnen: eigenaarschap bij aanmaken, statusovergangen, vergrendelde datums. |
| `tests/` | Rechtentest en unit-tests van de hook. |
| `scripts/` | Starten, schema, migreren, verify. |

## Een schemawijziging

1. Schrijf de wijziging als stap in `schema/migrations/` (nieuw bestand, of een bestaande uitbreiden zolang die niet op productie gedraaid heeft).
2. `npm run migrate`, dan `npm run schema:snapshot`.
3. Nieuwe velden op publieke collections: deel ze in als publiek of prive in `seed/fields.mjs` (de seed stopt anders), en pas zo nodig `seed/access.mjs` aan. `npm run seed`.
4. `npm run directus:types` in `web/`.
5. `npm run test:permissions`.

## Live schema en docs/03

Het live schema bestond al voor de publieke site. Waar docs/03 hetzelfde begrip anders noemt, blijft de live naam en vertaalt `web/lib/directus/model.ts` (bijvoorbeeld `places` = `cities`, `live` = `published`, `saved_workshops` = `favorites`). De volledige lijst staat bovenaan dat bestand. Wat ontbrak is toegevoegd door `schema/migrations/001-datamodel-docs03.mjs`.

## Naar productie (nog niet gedaan)

Alleen na akkoord. De scripts weigeren een ander doel dan localhost zonder `--ja-ik-weet-het`.

```bash
# 1. Bekijk wat er zou veranderen (past niets toe)
DIRECTUS_PROD_TOKEN=... npm run schema:diff -- https://directus.wickedworkshops.nl DIRECTUS_PROD_TOKEN
# 2. Migratie en seed
DIRECTUS_TARGET_URL=https://directus.wickedworkshops.nl DIRECTUS_TARGET_TOKEN=... npm run migrate -- --ja-ik-weet-het
DIRECTUS_TARGET_URL=https://directus.wickedworkshops.nl DIRECTUS_TARGET_TOKEN=... npm run seed -- --ja-ik-weet-het
# 3. De extensie uit extensions/ op de productieserver zetten en Directus herstarten
```
