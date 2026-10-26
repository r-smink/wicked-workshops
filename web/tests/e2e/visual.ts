import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import type { Locator, Page } from "@playwright/test";

/* Hulpmiddelen om onderdelen van onze pagina's pixel voor pixel te
   vergelijken met reference/pages/<code>.html. */

const ROOT = path.resolve(__dirname, "../../..");
export const OUT_DIR = path.join(__dirname, "../../test-results/visual");

export function referenceUrl(code: string): string {
  return pathToFileURL(path.join(ROOT, "reference", "pages", `${code}.html`)).href;
}

/* Prototype-scaffolding verbergen in de referentie (docs/02: niet bouwen). */
export const HIDE_REFERENCE_SCAFFOLDING = `.tools,.scherm-label,.demo-flag,.noot{display:none!important}`;

/* Fouten in het prototype: in adash-a lekt de dashboard-CSS naar de shell.
   - [id^="p-adash-"] form input stylet ook het zoekveld in de header
   - [id^="p-adash-"] p zet text-wrap:pretty, ook op de footertekst
   Bij de bouw van het dashboard (fase 5) die regels scopen. */
export const FIX_REFERENCE_LEAKS: Record<string, string> = {
  "adash-a": [
    `.head-search input{background:transparent!important;border:0!important;border-radius:revert!important;padding:revert!important;width:revert!important;font-size:14.5px!important}`,
    `.foot p,.foot li{text-wrap:wrap!important}`,
  ].join(""),
};

/* De referentie laadt Google Fonts met andere asbereiken dan next/font.
   Dezelfde letters, maar net andere bestanden, en dus andere anti-aliasing.
   Tijdens de vergelijking krijgt onze pagina dezelfde bestanden, zodat de
   test de opmaak toetst. Dat next/font de juiste families laadt, toetst
   een aparte test in shell.spec.ts. */
export const REFERENCE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,300..800&family=Plus+Jakarta+Sans:ital,wght@0,400..800;1,400..600&display=swap";
export const USE_REFERENCE_FONTS = `:root{--font-head:"Bricolage Grotesque","Plus Jakarta Sans",ui-sans-serif,system-ui,sans-serif;--font-body:"Plus Jakarta Sans",ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}`;

/* Toevoegingen in onze shell die niet in de referentie staan. */
export const HIDE_OUR_ADDITIONS = `.foot-theme{display:none!important}`;

/* Geen cookiebanner over de footer tijdens de vergelijking. */
export async function acceptCookies(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem("ww-consent", JSON.stringify({ version: 1, analytics: false, marketing: false, date: "2026-01-01" }));
    localStorage.setItem("ww-theme", "light");
  });
}

export type Diff = { name: string; ratio: number; sizes: string; sameSize: boolean };

/* Schuif een onderdeel naar een hele pixel. Zonder dit valt tekst op de ene
   pagina op y=594,8 en op de andere op 595,0, en verschilt de rasterisatie
   zonder dat het ontwerp verschilt. */
async function snapToPixel(loc: Locator): Promise<void> {
  await loc.evaluate((el) => {
    const top = el.getBoundingClientRect().top + window.scrollY;
    const frac = top - Math.floor(top);
    /* Met een marge, niet met transform: tekst op een eigen laag rendert
       Chrome net anders. */
    if (frac > 0.001) {
      const mt = parseFloat(getComputedStyle(el).marginTop) || 0;
      (el as HTMLElement).style.marginTop = `${mt + (1 - frac)}px`;
    }
  });
}

/* Screenshot van twee onderdelen, vergelijk ze en bewaar ref, ours en diff. */
export async function compare(name: string, ours: Locator, ref: Locator): Promise<Diff> {
  mkdirSync(OUT_DIR, { recursive: true });
  await snapToPixel(ours);
  await snapToPixel(ref);
  const [a, b] = await Promise.all([ours.screenshot({ animations: "disabled" }), ref.screenshot({ animations: "disabled" })]);
  writeFileSync(path.join(OUT_DIR, `${name}-ours.png`), a);
  writeFileSync(path.join(OUT_DIR, `${name}-ref.png`), b);
  const pa = PNG.sync.read(a);
  const pb = PNG.sync.read(b);
  const sizes = `ours ${pa.width}x${pa.height}, ref ${pb.width}x${pb.height}`;
  if (pa.width !== pb.width || pa.height !== pb.height) {
    return { name, ratio: 1, sizes, sameSize: false };
  }
  const diff = new PNG({ width: pa.width, height: pa.height });
  const changed = pixelmatch(pa.data, pb.data, diff.data, pa.width, pa.height, { threshold: 0.1 });
  writeFileSync(path.join(OUT_DIR, `${name}-diff.png`), PNG.sync.write(diff));
  return { name, ratio: changed / (pa.width * pa.height), sizes, sameSize: true };
}
