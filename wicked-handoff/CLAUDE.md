# Wicked Workshops - voorkant ontwerp

Context voor Claude Code. Lees dit eerst, daarna `PROMPT.md` voor de opdracht.

## Wat dit is
Een definitief klikbaar ontwerp (HTML, CSS en kleine stukjes JS in een enkel bestand) van de voorkant van Wicked Workshops, een marktplaats waar aanbieders workshops plaatsen en bezoekers die boeken.
Merkessentie: "iets buitengewoons, dichtbij". Taal van de site: Nederlands, je-vorm, warm, energiek, kort, spreektaal, altijd zinsvorm (geen Title Case).

## Bestanden
- `design/index.html`: het hele ontwerp (circa 600 KB). Negen pagina's, alle CSS in een paar `<style>` blokken, 9 `<script>` blokken, SVG-sprite met iconen.
- `design/img/`: 63 foto's (jpg, relatief aangeroepen als `img/naam.jpg`). Tijdelijk stockbeeld van Pexels.
- `docs/secties.md`: secties per pagina. `docs/beeldmap.md`: welke foto op welke pagina.
- `docs/ontwerp.md`: pagina's, gedrag en regels in detail.

## Lokaal bekijken
```
cd design && python3 -m http.server 8080
```
Open `http://localhost:8080/?p=cat&v=mobiel`. Parameters: `p` = home, cat, detail, aanbieder, maker, locatie, hulp, contact, inloggen. `v` = desktop of mobiel (390 px).

## Harde regels
1. Nooit em-dashes of en-dashes, ook niet in code, JSON, HTML of tekst. Altijd een gewoon streepje `-`.
2. JS-blokken blijven ASCII. Tekens als het euroteken staan in de HTML als entiteit (`&euro;`).
3. Gebruik uitsluitend de CSS-variabelen uit `:root` (kleuren, `--r-*` radii, `--ease`, schaduwen). Geen losse hexwaarden toevoegen.
4. Responsive werkt met container queries op `container-name: stage` (`@container stage (max-width: ...)`), niet met `@media`. Reden: de ontwerpomgeving toont een mobiel 390 px kader naast de desktopweergave. Houd dat zo, of vervang het in een keer overal door `@media` als je de site uit de ontwerpomgeving haalt.
5. Verzin geen data, telefoonnummers, adressen of mailadressen. Het mailadres is `[e-mailadres volgt]`. Workshops, aanbieders, prijzen en reviews zijn voorbeelddata en moeten als zodanig herkenbaar blijven.
6. Tijdens de pilot betaalt de deelnemer niets voordat een datum doorgaat. Laat die boodschap en de vier standen (zie `docs/ontwerp.md`) consistent op alle pagina's.
7. Een wijziging die op meerdere pagina's terugkomt (kop, footer, megamenu, filterchips, kaarten) pas je overal aan.
8. Toegankelijkheid: behoud `aria-*`, `hidden`, focusstijlen en `prefers-reduced-motion`.

## Merk
Kleuren: Wicked Purple `#6C2BD9`, Purple Deep `#5620B0`, Electric Coral `#FF5C6E`, Coral Deep `#E8394C`, Soft Coral `#FFE7EB`, Sun `#FFB020`, Ink `#1B1630`, Slate `#6E6A85`, Cloud `#F1EAFB`, Mist `#FBFAFE`, Line `#E9E3F3`.
Lettertypes: Bricolage Grotesque voor koppen, Plus Jakarta Sans voor tekst en interface (via Google Fonts).

## Techniek (doel: bouwen op Vercel en Directus)
- Frontend: Next.js (App Router, TypeScript) op Vercel, domein `www.wickedworkshops.nl`.
- Backend: Directus (draait via Coolify) op `directus.wickedworkshops.nl`, gebruikt als headless CMS en database via de REST API of de Directus SDK. De Directus-map met schema:diff/migrate/seed-scripts is de bron voor het schema.
- Eerst een responsive website, daarna uitbreidbaar naar een telefoonapp. Houd data en weergave daarom gescheiden.
- Het ontwerp in `design/index.html` is de visuele waarheid. Bouw het pixel-trouw na in componenten; verzin geen nieuw ontwerp.
- Geheimen (Directus-token, URL) alleen in omgevingsvariabelen (`.env.local`, Vercel project settings), nooit in de repo.
- Directus-schema, leesrechten en voorbeelddata: `directus/` (zie `directus/README.md`).
- Voor de bouw: zie `PROMPT-BOUW.md`.
