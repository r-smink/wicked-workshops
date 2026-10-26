/* Stelt web/styles/shell.css samen uit de referentie, zodat de gedeelde
   onderdelen letterlijk overeenkomen met reference/css/00-shared-design-system.css.
   Draai opnieuw als de referentie verandert:  node scripts/build-shell-css.mjs

   Wat het script aanpast:
   - het prototype-voorvoegsel `.page[data-concept] ` voor het megamenu valt weg
   - lettertypenamen worden var(--font-head) / var(--font-body) (next/font)
   - alleen de regelblokken hieronder; prototype-scaffolding (.tools, .seg,
     .scherm, .demo-flag, #p-...) blijft buiten */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(here, "../../reference/css/00-shared-design-system.css");
const out = path.join(here, "../styles/shell.css");
const lines = readFileSync(src, "utf8").split(/\r?\n/);

/* [eerste regel, laatste regel] (1-based, inclusief) met wat erin staat */
const RANGES = [
  [174, 247, "logo, knoppen, tekstlink"],
  [249, 269, "sterren en badges"],
  [271, 317, "aankondiging, header, menu"],
  [319, 378, "secties, workshopkaart, rail"],
  [380, 404, "footer"],
  [419, 438, "zoekveld in de header"],
  [442, 487, "containerbreedtes"],
  [495, 589, "megamenu en breedtes"],
  [623, 636, "keuzechip"],
  [895, 905, "ingelogde header"],
  [936, 944, "horizontaal logo"],
];

const fix = (s) =>
  s
    .replaceAll(".page[data-concept] ", "")
    .replace(/"Bricolage Grotesque", ?"Plus Jakarta Sans", ?ui-sans-serif, ?system-ui, ?sans-serif/g, "var(--font-head)")
    .replace(/"Bricolage Grotesque", ?sans-serif/g, "var(--font-head)")
    .replace(/"Bricolage Grotesque","Plus Jakarta Sans",sans-serif/g, "var(--font-head)")
    .replace(/"Plus Jakarta Sans", ?sans-serif/g, "var(--font-body)");

let css = `/* GEGENEREERD door scripts/build-shell-css.mjs uit
   reference/css/00-shared-design-system.css. Niet met de hand wijzigen;
   aanvullingen staan in styles/shell-extra.css. */\n`;
for (const [a, b, label] of RANGES) {
  css += `\n/* ---- ${label} (referentie r. ${a}-${b}) ---- */\n`;
  css += fix(lines.slice(a - 1, b).join("\n")) + "\n";
}
if (/Bricolage Grotesque|Plus Jakarta Sans/.test(css)) throw new Error("lettertypenaam niet vervangen");
if (/\.page\[|#p-|\.tools|\.scherm|\.demo-flag/.test(css)) throw new Error("scaffolding in shell.css");
writeFileSync(out, css);
console.log(`shell.css: ${css.split("\n").length} regels`);
