# Prompt voor Claude Code

Kopieer alles onder de streep in Claude Code, gestart in deze map (`wicked-handoff`). Vul onder "Wijzigingen" in wat je aangepast wilt hebben.

---

Je werkt aan het definitieve klikbare ontwerp van Wicked Workshops, een marktplaats voor workshops. Lees eerst `CLAUDE.md`, `docs/ontwerp.md` en `docs/secties.md`. Het ontwerp staat in `design/index.html` met de foto's in `design/img/`.

Werkwijze:
1. Start `cd design && python3 -m http.server 8080` op de achtergrond en bekijk de pagina's via Playwright (screenshots van desktop 1440 px en mobiel 390 px via `?p=<pagina>&v=desktop` en `&v=mobiel`). Controleer eerst dat alle negen pagina's zonder console-fouten laden en dat geen enkele foto ontbreekt.
2. Voer daarna de wijzigingen onder "Wijzigingen" uit. Wijzig alleen wat gevraagd is en laat de rest van het ontwerp, de merkkleuren, lettertypes en de tone of voice intact.
3. Pas een wijziging die op meerdere pagina's voorkomt (kop, megamenu, footer, kaarten, filterchips, pilotband) overal tegelijk aan.
4. Volg de harde regels in `CLAUDE.md`: geen em-dashes of en-dashes (alleen een gewoon `-`), JS alleen ASCII, alleen bestaande CSS-variabelen, container queries op `stage`, geen verzonnen contactgegevens.
5. Geef na elke wijziging nieuwe screenshots van de geraakte pagina's op desktop en mobiel, controleer op afbreken, overlap en afgekapte tekst bij 390 px, en herstel wat stuk is.
6. Als je ziet dat iets mist of sterker kan (bijvoorbeeld contrast, ontbrekende alt-tekst, een lege staat, een klikdoel kleiner dan 44 px op mobiel), noem het kort in je eindoverzicht en voer het alleen uit als het binnen de opdracht valt.
7. Sluit af met een korte lijst van wat je hebt aangepast, per pagina, plus openstaande punten. Commit niet tenzij ik daarom vraag.

## Wijzigingen
<!-- Vervang dit blok door jouw wijzigingen, bijvoorbeeld: -->
- [pagina] [wat moet er anders]
- [pagina] [wat moet er anders]
