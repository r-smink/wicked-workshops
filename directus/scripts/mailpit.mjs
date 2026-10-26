/* Mailpit vangt alle lokale mail op (SMTP 1025, web 8025). Het losse
   programma wordt bij de eerste start gedownload naar directus/.data/mailpit. */
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ROOT } from "./env.mjs";

const VERSION = "v1.21.8";
const DIR = path.join(ROOT, ".data", "mailpit");
const WIN = process.platform === "win32";
const BIN = path.join(DIR, WIN ? "mailpit.exe" : "mailpit");

async function download() {
  const os = WIN ? "windows" : process.platform;
  const arch = process.arch === "arm64" ? "arm64" : "amd64";
  const file = `mailpit-${os}-${arch}.${WIN ? "zip" : "tar.gz"}`;
  const res = await fetch(`https://github.com/axllent/mailpit/releases/download/${VERSION}/${file}`);
  if (!res.ok) throw new Error(`Mailpit downloaden mislukt: ${res.status}`);
  mkdirSync(DIR, { recursive: true });
  const archive = path.join(DIR, file);
  writeFileSync(archive, Buffer.from(await res.arrayBuffer()));
  /* De tar van Windows (System32) pakt ook zip uit. */
  const tar = WIN ? path.join(process.env.SystemRoot || "C:\Windows", "System32", "tar.exe") : "tar";
  execFileSync(tar, ["-xf", archive, "-C", DIR]);
}

export async function startMailpit() {
  try {
    if (!existsSync(BIN)) await download();
  } catch (err) {
    console.warn(`Mailpit niet beschikbaar (${err.message}); Directus draait verder zonder mailvanger.`);
    return null;
  }
  return spawn(BIN, ["--smtp", "127.0.0.1:1025", "--listen", "127.0.0.1:8025", "--quiet"], { stdio: "ignore" });
}
