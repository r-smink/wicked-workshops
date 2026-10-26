/* Draait alle migraties in directus/schema/migrations op volgorde. Elke migratie
   is idempotent. Doel is de lokale Directus, tenzij DIRECTUS_TARGET_URL en
   DIRECTUS_TARGET_TOKEN gezet zijn; dan vraagt het script eerst om
   bevestiging met --ja-ik-weet-het. */
import { readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { BASE } from "./api.mjs";
import { ROOT } from "./env.mjs";

const only = process.argv.slice(2).find((a) => !a.startsWith("--"));
const remote = !/^http:\/\/(localhost|127\.0\.0\.1)/.test(BASE);
if (remote && !process.argv.includes("--ja-ik-weet-het")) {
  console.error(`Doel is ${BASE}, niet de lokale Directus. Voeg --ja-ik-weet-het toe als dat de bedoeling is.`);
  process.exit(1);
}

const dir = path.join(ROOT, "schema", "migrations");
const files = readdirSync(dir).filter((f) => /^\d+-.*\.mjs$/.test(f)).sort();
for (const file of files) {
  if (only && !file.startsWith(only)) continue;
  const mod = await import(pathToFileURL(path.join(dir, file)).href);
  if (mod.productionOnly && !remote && !process.argv.includes("--ook-lokaal")) continue;
  process.stdout.write(`${file} (${mod.name}) ... `);
  await mod.up();
  console.log("klaar");
}
