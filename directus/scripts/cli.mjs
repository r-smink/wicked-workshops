import { spawn } from "node:child_process";
import path from "node:path";
import { ROOT, directusEnv } from "./env.mjs";
import { NODE_BIN } from "./node22.mjs";

const CLI = path.join(ROOT, "node_modules", "directus", "cli.js");

/* Voert een Directus-CLI-opdracht uit met de lokale omgeving. */
export function directus(args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(NODE_BIN, [CLI, ...args], { env: directusEnv(), stdio: "inherit", ...opts });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`directus ${args.join(" ")} stopte met ${code}`))));
  });
}

export function startDirectus() {
  return spawn(NODE_BIN, [CLI, "start"], { env: directusEnv(), stdio: "inherit" });
}
