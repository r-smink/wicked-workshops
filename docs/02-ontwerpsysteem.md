# 02 - Ontwerpsysteem

De bron is `reference/css/00-shared-design-system.css`. Dit document zegt hoe je het naar Next.js brengt.

## Tokens (brand guide v1.0)

| Token | Waarde | Gebruik |
|---|---|---|
| `--purple` | `#6C2BD9` | primaire knop, actief, merk |
| `--purple-deep` | `#5620B0` | hover, merktekst op licht |
| `--coral` | `#FF5C6E` | highlight, onderstreping, stappenummer. Niet voor knoppen: wit op coral haalt 3,0:1 |
| `--coral-deep` | `#E8394C` | tekst op wit of op soft coral |
| `--soft-coral` | `#FFE7EB` | zachte vlakken |
| `--sun` | `#FFB020` | sterren |
| `--ink` | `#1B1630` | tekst, donkere banden, footer |
| `--slate` | `#6E6A85` | secundaire tekst |
| `--cloud` | `#F1EAFB` | getinte vlakken (`.on-tint` zet tekst een tint donkerder voor AA) |
| `--mist` | `#FBFAFE` | pagina-achtergrond |
| `--line` | `#E9E3F3` | randen |

Radii: 12, 16, 20, 24 en pil (999). Ease: `cubic-bezier(.22,.68,.32,1)`. Schaduwen: `--shadow` en `--shadow-lift`.

Plaats alles in `web/styles/tokens.css` en importeer in `app/layout.tsx`. Kopieer de `:root`-blokken uit de referentie ongewijzigd.

## Lettertypen

- Koppen: **Bricolage Grotesque** (variabel, assen `opsz`, `wdth`, `wght`), letterspatiering `-.022em`, `line-height 1.05`.
- Tekst: **Plus Jakarta Sans** 400 tot 800.
- Laad met `next/font/google` en wijs ze toe aan de variabelen waar de CSS ze noemt (`"Bricolage Grotesque"`, `"Plus Jakarta Sans"`), of gebruik `variable`-opties en pas de `font-family`-stacks 1 keer centraal aan. Behoud `font-variation-settings:"wdth" ...` waar de CSS dat gebruikt.

## Gedeelde componenten (bouw eerst, hergebruik overal)

| Component | CSS-klassen | Opmerking |
|---|---|---|
| `Announce` | `.announce` | "Ook van makers zonder bedrijf. Geen btw-nummer nodig om te beginnen." Op mobiel valt de tweede zin weg (`.hide-sm`). |
| `Header` | `.head`, `.logo`, `.head-search`, `.nav`, `.head-end`, `.burger` | Uitgelogd: knoppen "Word workshopgever" en "Inloggen". Ingelogd: `.head-acc` met initiaal-avatar en "Mijn account" of "Mijn dashboard". |
| `Megamenu` | `.mm`, `.mm-cat`, `.mm-side` | 12 categorieen met thumbnail en aantal, gelegenheden, plaatsen, "Verras me". Data uit Directus (zie `03`). Sluit op Escape en klik buiten. |
| `Footer` | `.foot` | drie kolommen plus balk, "Boekingskosten EUR 0, altijd". |
| `Button` | `.btn`, `.btn-line`, `.btn-sm`, `.btn-on-band` | paars is de standaard. `.btn-coral` is bewust ook paars. |
| `Chip`, `Badge` | `.chip`, `.fchip`, `.badge-*` | `aria-pressed` voor keuzechips. |
| `WorkshopCard` | `.wk` | beeld 4:3, tag, hartje, titel, meta, prijs. |
| Logo | `reference/brand/logo-horizontaal.svg` | inline SVG, de tekst gebruikt Bricolage Grotesque. |
| Iconen | `reference/brand/icon-sprite.svg.html` | 17 symbolen (`i-grid`, `i-cal`, `i-check`, `i-pin`, ...). Maak er een `<Icon name>` component van die `<use href="#i-...">` gebruikt, met de sprite 1 keer in de layout. |

Pagina-specifieke componenten staan bij de schermspec (stoelenbalk, stappenbalk, tijdlijn, wekelijkse beschikbaarheidsraster, enzovoort).

## Responsive aanpak (belangrijk)

Het prototype gebruikt **container queries** op een wrapper `.stage` (`container-type:inline-size`) in plaats van viewport media queries, zodat de 390 px-telefoonweergave echt meet. Er staan 242 `cqi`-eenheden en `@container stage (max-width: ...)` regels in.

Productie-aanpak, kies 1 en wees consequent:

- **Aanbevolen: behoud 1 op 1.** Zet in `app/layout.tsx` een `<div class="stage">` die de volledige breedte vult met `container: stage / inline-size` en laat alle CSS ongemoeid. `cqi` is dan gelijk aan de viewportbreedte. Beperking: `container-type` zet layout-containment aan, dus gebruik **geen `position: fixed`** binnen `.stage`. Het prototype gebruikt alleen `position: sticky` (zijbalken en de duimbalk onderin), en dat werkt wel.
- Alternatief: vervang `@container stage (max-width: X)` door `@media (max-width: X)` en `cqi` door `vw` (let op de scrollbalkbreedte). Doe dit met een script, niet met de hand.

Breekpunten in de CSS: 1500, 1340, 1200 (header klapt dicht), 1080, 860 (tablet naar mobiel), 560 (smalle telefoon). Ontwerpbreedtes om te testen: 1440, 1024, 768, 390.

Mobiel patroon per onderdeel (zie ook de specs):
- Dashboard workshopgever: zijbalk wordt een duimbalk onderin (sticky, 5 knoppen).
- Mijn account (deelnemer): tabs bovenin worden een knop "Menu" onderin die een paneel van onderen opent.
- Verzetten of annuleren: paneel over de pagina, op mobiel een bottom sheet.
- Wizard: stappenlijst links wordt een compacte stappenbalk bovenin, de checklist "Klaar voor de check" klapt in.

## Interactie en beweging

- Hover op kaarten: `translateY(-3px)` plus `--shadow-lift`, duur 220 ms. Knoppen `translateY(-2px)`.
- `prefers-reduced-motion`: alle duur naar bijna 0 (staat in de CSS, behouden).
- Focus: `outline: 3px solid var(--accent)` met 2 px offset op `a`, `button`, `input`, `select`, `summary`.
- Doelen minimaal 44 px hoog op mobiel (knoppen zijn 50 px, kleine 42 px).

## Wat je niet overneemt

`.tools`, `.tools-title`, `.seg`, `.scherm`, `.scherm-label`, `.demo-flag` (de gestippelde "voorbeelddata"-pil), `.stage[data-view=mobiel]` en alle `#p-...` id-selectors zijn prototype-scaffolding. `.demo-flag` mag in de ontwikkelomgeving als hulpmiddel, nooit in productie.

## Beeld

- Alle `<img>` krijgen `alt`, bij decoratief beeld `alt=""`.
- Gebruik `next/image` met Directus als remote pattern en de transformatiepresets uit `03`.
- Aspect-ratio's staan in de CSS (`.wk-img` 4:3, omslag 16:10, avatars rond). Behoud ze, zodat er geen layoutverschuiving is.
