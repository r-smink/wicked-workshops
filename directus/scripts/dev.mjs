/* `npm run dev`: start PostgreSQL, Mailpit en Directus. Een nieuwe database
   wordt eerst ingericht (bootstrap). Schema en seed zijn aparte stappen:
   `npm run schema:apply` en `npm run seed`. */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { directus, startDirectus } from "./cli.mjs";
import { startDatabase } from "./db.mjs";
import { ROOT, directusUrl } from "./env.mjs";
import { startMailpit } from "./mailpit.mjs";

mkdirSync(path.join(ROOT, "uploads"), { recursive: true });

const { pg, fresh } = await startDatabase();
console.log(fresh ? "PostgreSQL ingericht en gestart." : "PostgreSQL gestart.");
const mailpit = await startMailpit();

await directus(["bootstrap"]);

const server = startDirectus();
let stopping = false;
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  server.kill();
  mailpit?.kill();
  await pg.stop();
  process.exit(code);
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
server.on("exit", (code) => stop(code ?? 0));

console.log(`Directus: ${directusUrl()}  (beheerder: zie directus/.env)`);
if (mailpit) console.log("Mailpit:  http://localhost:8025");
