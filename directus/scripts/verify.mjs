/* `npm run verify`: bouwt een schone Directus op uit de code en draait de
   rechtentest. Bewijst dat snapshot.yaml, de migraties, de extensie en de
   seed samen werken zonder iets uit de lokale database.

   Gebruikt een eigen database (directus/.data/pg-verify, poort 5434) en
   Directus op poort 8056, zodat de gewone lokale Directus kan blijven draaien. */
import { spawn } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";
import { ROOT } from "./env.mjs";

process.env.PG_DATA_DIR = path.join(ROOT, ".data", "pg-verify");
process.env.DB_PORT = "5434";
process.env.PORT = "8056";
rmSync(process.env.PG_DATA_DIR, { recursive: true, force: true });

const { startDatabase } = await import("./db.mjs");
const { directus, startDirectus } = await import("./cli.mjs");
const { directusUrl } = await import("./env.mjs");

const run = (args) =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { cwd: ROOT, env: process.env, stdio: "inherit" });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${args.join(" ")} stopte met ${code}`))));
  });

const { pg } = await startDatabase();
let server;
let code = 1;
try {
  await directus(["bootstrap"]);
  await directus(["schema", "apply", "--yes", path.join(ROOT, "schema", "snapshot.yaml")]);
  server = startDirectus();
  const url = directusUrl();
  for (let i = 0; i < 90; i++) {
    if ((await fetch(`${url}/server/ping`).catch(() => null))?.ok) break;
    await new Promise((r) => setTimeout(r, 1000));
  }
  /* De migraties moeten op een schema dat al klopt niets meer doen. */
  await run(["scripts/migrate.mjs"]);
  await run(["seed/seed.mjs", "--demo"]);
  await run([path.join(ROOT, "node_modules", "vitest", "vitest.mjs"), "run"]);
  code = 0;
} catch (err) {
  console.error(err.message);
} finally {
  server?.kill();
  await pg.stop();
}
process.exit(code);
