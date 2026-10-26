/* Ingebouwde PostgreSQL 16 (embedded-postgres): geen Docker of losse
   installatie nodig. Data staat in directus/.data/pg. */
import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";
import path from "node:path";
import { ROOT, loadEnv } from "./env.mjs";

export async function startDatabase() {
  const env = loadEnv();
  const dataDir = env.PG_DATA_DIR || path.join(ROOT, ".data", "pg");
  const fresh = !existsSync(path.join(dataDir, "PG_VERSION"));
  const pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: env.DB_USER || "directus",
    password: env.DB_PASSWORD,
    port: Number(env.DB_PORT || 5433),
    persistent: true,
    onLog: () => {},
  });
  if (fresh) await pg.initialise();
  await pg.start();
  if (fresh) await pg.createDatabase(env.DB_DATABASE || "directus");
  return { pg, fresh };
}
