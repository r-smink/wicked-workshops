/* Laadt directus/.env. Bestaat het bestand niet, dan maken we het aan met
   willekeurige geheimen, zodat `npm run dev` op een schone machine werkt. */
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ENV_FILE = path.join(ROOT, ".env");

const secret = () => randomBytes(24).toString("base64url");

function createEnvFile() {
  const lines = readFileSync(path.join(ROOT, ".env.example"), "utf8")
    .split(/\r?\n/)
    .map((line) => (/^[A-Z_]+=$/.test(line) ? line + secret() : line));
  writeFileSync(ENV_FILE, lines.join("\n"));
  console.log("directus/.env aangemaakt met nieuwe geheimen.");
}

export function loadEnv() {
  if (!existsSync(ENV_FILE)) createEnvFile();
  for (const line of readFileSync(ENV_FILE, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
  return process.env;
}

/* De omgeving waarmee Directus zelf draait. */
export function directusEnv(env = loadEnv()) {
  const port = env.PORT || "8055";
  return {
    ...process.env,
    KEY: env.DIRECTUS_KEY,
    SECRET: env.DIRECTUS_SECRET,
    PORT: port,
    PUBLIC_URL: `http://localhost:${port}`,
    DB_CLIENT: "pg",
    DB_HOST: "127.0.0.1",
    DB_PORT: env.DB_PORT || "5433",
    DB_DATABASE: env.DB_DATABASE || "directus",
    DB_USER: env.DB_USER || "directus",
    DB_PASSWORD: env.DB_PASSWORD,
    ADMIN_EMAIL: env.ADMIN_EMAIL || "admin@example.com",
    ADMIN_PASSWORD: env.ADMIN_PASSWORD,
    ADMIN_TOKEN: env.ADMIN_TOKEN,
    STORAGE_LOCATIONS: "local",
    STORAGE_LOCAL_ROOT: path.join(ROOT, "uploads"),
    EXTENSIONS_PATH: path.join(ROOT, "extensions"),
    /* Eigen schema-migraties staan in schema/migrations en lopen via de API
       (npm run migrate), niet als Directus-databasemigratie. */
    MIGRATIONS_PATH: path.join(ROOT, "extensions", "migrations"),
    EXTENSIONS_AUTO_RELOAD: "true",
    /* Directus leest anders zelf directus/.env, en die wint dan van wat hier
       staat (onze .env gebruikt andere namen, en verify draait op een andere poort). */
    CONFIG_PATH: path.join(ROOT, ".data", "geen-config.env"),
    /* Mail gaat naar een lokale SMTP-vanger (Mailpit) op poort 1025, als die draait. */
    EMAIL_TRANSPORT: "smtp",
    EMAIL_FROM: env.MAIL_FROM || "noreply@wickedworkshops.test",
    EMAIL_SMTP_HOST: "127.0.0.1",
    EMAIL_SMTP_PORT: "1025",
    EMAIL_SMTP_IGNORE_TLS: "true",
    EMAIL_VERIFY_SETUP: "false",
    CORS_ENABLED: "true",
    CORS_ORIGIN: "http://localhost:3000",
    CACHE_ENABLED: "false",
    TELEMETRY: "false",
    LOG_LEVEL: env.LOG_LEVEL || "warn",
    /* Rechtentest logt veel gebruikers in; lokaal geen limiet. */
    RATE_LIMITER_ENABLED: "false",
  };
}

export const directusUrl = (env = loadEnv()) => `http://localhost:${env.PORT || "8055"}`;
