# Schema als code

`snapshot.yaml` is het schema van de achterkant: het live schema plus de stappen uit `migrations/`. Wijzig het nooit alleen in de Directus-UI; zie `../README.md` voor de werkwijze.

`migrations/` bevat idempotente stappen via de API. Ze heten bewust niet `directus/migrations`: die naam gebruikt Directus zelf voor databasemigraties.
