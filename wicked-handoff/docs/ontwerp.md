# Ontwerp in detail

## Opbouw van index.html
- Bovenaan een reviewbalk (`.tools`): paginakiezer, desktop/mobiel-schakelaar en de toelichting `data-idee`. Dit is steigerwerk voor de ontwerpreview, geen onderdeel van de site.
- `#stage` (`container-type:inline-size; container-name:stage`) bevat negen `<div class="page" data-pagina="...">`. Alleen de actieve pagina is zichtbaar (`hidden` op de rest).
- Elke pagina heeft een eigen `header.head` (met megamenu, `aria-controls="menu-..."`) en `footer.foot`.
- SVG-sprite met symbolen: `ww-mark` (logo), `i-grid`, `i-compass`, `i-spark`, `i-people`, `i-gift`, `i-search`, `i-heart`, `i-arrow`, `i-check`, `i-pin`, `i-clock`, `i-zero`, `i-chev`, `i-burger`, `i-cal`, `i-shield`, `i-mail`, `i-hand`.
- Navigatie tussen pagina's: links `href="#p-detail"` enzovoort. Staat wordt onthouden in localStorage (`ww5-staat`, `ww5-view`). Rechtstreeks: `?p=cat&v=mobiel`.
- Klassenprefixen komen uit de conceptfase: `home-a-`, `home-b-`, `cat-c-`, `cat-d-`, `detail-a-`, `detail-b-`, `aanbieder-a-`, `aanbieder-d-`, `maker-a-`, `maker-d-`, `locatie-a-`, `locatie-d-`, `hulp-c-`, `hulp-d-`, `contact-d-`, `inloggen-d-`. De letter is het gekozen concept; het definitieve ontwerp combineert ze. Nieuwe klassen krijgen geen conceptletter maar de paginanaam, bijvoorbeeld `detail-...`.

## Pagina's
| id | Pagina | Kern |
|---|---|---|
| `p-home` | Home | Hero met zoekbalk, paradepaardjes, categorieen, dit weekend, "wanneer gaat een datum door", pilotband, dichtbij, reviews, teamuitje, workshop geven, cadeau |
| `p-cat` | Categorie (kookworkshops Utrecht) | Hero, pilotband, tijdlijn per dag, lijst met alle workshops, SEO-tekst, FAQ, verder kijken. Een filterbalk voor tijdlijn en lijst |
| `p-detail` | Workshop (Italiaans koken met Luca) | Kop en galerij, datumkiezer, boekformulier met rekenhulp, wat je doet, inbegrepen, praktisch, aanbieder, annuleren, reviews, zakelijk |
| `p-aanbieder` | Aanbieder (Luca) | Hero, particulier-verklaring, workshops, agenda als weekraster met filter op stand, verhaal, reviews |
| `p-maker` | Workshopgever | Pad van idee naar eerste datum, met of zonder bedrijf, kosten, doorgaan-drempel, ruimtes, vragen, aanmelden met alleen e-mailadres |
| `p-locatie` | Locatie gezocht | Twee deuren (ruimte zoeken of bieden), filters op soort ruimte en dag, ruimtekaarten met vrije dagdelen, twee formulieren |
| `p-hulp` | Hulp | Zoekbalk, veertien onderwerpen in twee groepen (meedoen, workshop geven), FAQ, legenda van de vier standen |
| `p-contact` | Contact | Formulier met onderwerpchips, foto, reactietijd (alleen zakelijk), korte hulplinks, voorbeeldbevestiging |
| `p-inloggen` | Inloggen | Rolkeuze deelnemer of workshopgever bovenaan een formulier, link in je mail als standaard, Google en Apple als voorbeeld |

De complete sectielijst staat in `secties.md`. De ontwerpredenering per pagina staat in het attribuut `data-idee` van elke `.page`.

## Gedrag (JS)
Alle scripts zijn kleine IIFE's zonder afhankelijkheden.
1. Paginarouter, mobiel/desktop, megamenu (open/dicht, Escape), chips met `aria-pressed` (laatste script).
2. Home A: zoekbalk en herohoogte. Home B: dagstrook scrolt naar de dag.
3. Categorie: een filterbalk voor tijdlijn en lijst. Toont `(0)` bij een chip zonder resultaat, noemt in de leegmelding welk filter de nul veroorzaakt, klapt de week erna open.
4. Workshop: datum kiezen (`.detail-b-tegel`, `aria-checked`), aantal personen, prijs (voorbeeld 45), bevestiging die met datum en aantal meebeweegt.
5. Aanbieder: filter op stand in het weekraster (`data-stand`).
6. Workshopgever: simulatie met plekken (min 4, max 8), doorgaan-drempel.
7. Locatie: filters met tellers die samenwerken en een combinatie zonder resultaat uitgrijzen.
8. Hulp: werkende zoekfunctie over de onderwerpen.
Rolwissel op de inlogpagina gebeurt zonder script met `:has()`.

## De vier standen van een datum
Gebruik overal dezelfde termen en kleuren; ze komen terug in de tijdlijn, het weekraster, de sessies en de hulp-legenda. Controleer de exacte labels in `index.html` (zoek op `data-stand`) voordat je iets hernoemt.

## Beeld
63 jpg's in `design/img/`, zie `beeldmap.md`. Voeg nieuwe foto's toe in dezelfde map, schaal ze naar maximaal circa 1800 px breed en houd ze onder 300 KB. Geef elke afbeelding een betekenisvolle `alt`.

## Bekende aandachtspunten
- Het bestand is groot en bevat per pagina een eigen kop en footer. Bij het opsplitsen naar een Node-frontend eerst de gedeelde delen (kop, footer, kaarten, chips) extraheren.
- Google Fonts worden extern geladen. Voor productie zelf hosten.
- Alle formulieren zijn `onsubmit="return false"`; er is nog geen backend.
