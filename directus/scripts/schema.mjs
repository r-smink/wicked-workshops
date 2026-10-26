/* Schema in code.
     npm run schema:snapshot   lokale Directus -> schema/snapshot.yaml
     npm run schema:apply      schema/snapshot.yaml -> lokale Directus
     npm run schema:diff -- <url> <token-var>
                               toont wat er op een andere Directus (bijvoorbeeld
                               productie) zou veranderen; past niets toe. */
import { readFileSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { directus } from "./cli.mjs";
import { ROOT } from "./env.mjs";

const SNAPSHOT = path.join(ROOT, "schema", "snapshot.yaml");
const [cmd, url, tokenVar] = process.argv.slice(2);

if (cmd === "snapshot") {
  await directus(["schema", "snapshot", "--yes", SNAPSHOT]);
} else if (cmd === "apply") {
  await directus(["schema", "apply", "--yes", process.argv[3] || SNAPSHOT]);
} else if (cmd === "diff") {
  if (!url || !tokenVar || !process.env[tokenVar]) {
    console.error("Gebruik: npm run schema:diff -- <directus-url> <NAAM_VAN_TOKEN_VARIABELE>");
    process.exit(1);
  }
  const snapshot = YAML.parse(readFileSync(SNAPSHOT, "utf8"));
  const res = await fetch(`${url.replace(/\/$/, "")}/schema/diff?force=true`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env[tokenVar]}`, "Content-Type": "application/json" },
    body: JSON.stringify(snapshot),
  });
  if (res.status === 204) console.log("Geen verschillen.");
  else console.log(JSON.stringify(await res.json(), null, 2));
} else {
  console.error("Onbekende opdracht. Kies snapshot, apply of diff.");
  process.exit(1);
}
