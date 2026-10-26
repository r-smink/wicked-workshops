/* npm run seed       rollen, rechten en referentiedata
   npm run seed:demo  idem, plus de voorbeeldpersonen uit de prototypes

   Alleen tegen de lokale Directus, tenzij DIRECTUS_TARGET_URL gezet is en
   --ja-ik-weet-het meegegeven wordt. De demo-seed weigert altijd buiten
   localhost. */
import { BASE } from "../scripts/api.mjs";
import { seedAccess } from "./access.mjs";
import { seedReference } from "./reference.mjs";

const local = /^http:\/\/(localhost|127\.0\.0\.1)/.test(BASE);
const demo = process.argv.includes("--demo");

if (!local && (demo || !process.argv.includes("--ja-ik-weet-het"))) {
  console.error(demo ? `Demo-data alleen lokaal, niet op ${BASE}.` : `Doel is ${BASE}. Voeg --ja-ik-weet-het toe als dat de bedoeling is.`);
  process.exit(1);
}

console.log("Rollen en rechten ...");
await seedAccess();
console.log("Referentiedata ...");
console.log(await seedReference());

if (demo) {
  const { seedDemo } = await import("./demo.mjs");
  console.log("Demo-data ...");
  console.log(await seedDemo());
}
console.log("Klaar.");
