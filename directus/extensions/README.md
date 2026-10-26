# Extensies

`directus-extension-ww-guards`: hook voor regels die Directus-rechten niet kunnen uitdrukken (eigenaarschap bij aanmaken, statusovergangen van workshops en profielen, vergrendelde datums uit docs/05, uniek volgen en bewaren). De zuivere regels staan in `rules.mjs` en zijn getest in `../tests/guards.test.mjs`.

Lokaal herlaadt Directus extensies automatisch (`EXTENSIONS_AUTO_RELOAD`).
