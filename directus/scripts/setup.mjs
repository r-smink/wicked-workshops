/* `npm run setup`, na `npm ci`. directus/.npmrc zet install-scripts uit:
   op Windows met een nieuwere Node dan 22 faalt de bouw van isolated-vm
   anders, en daarmee de hele installatie. Dit script doet de stappen die
   wel nodig zijn, met kant-en-klare binaries:
   1. Node 22 (uit het npm-pakket `node`) als de machine een andere Node draait;
   2. de bibliotheek-links van de ingebouwde PostgreSQL;
   3. isolated-vm voor Node 22. */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { ROOT } from "./env.mjs";
import { NODE_BIN } from "./node22.mjs";

const nm = path.join(ROOT, "node_modules");
const run = (bin, args, cwd) => execFileSync(bin, args, { cwd, stdio: "inherit" });

if (!existsSync(NODE_BIN)) {
  console.log("Node 22 ophalen ...");
  run(process.execPath, ["installArchSpecificPackage"], path.join(nm, "node"));
}

const pgDir = path.join(nm, "@embedded-postgres");
for (const platform of existsSync(pgDir) ? readdirSync(pgDir) : []) {
  const script = path.join(pgDir, platform, "scripts", "hydrate-symlinks.js");
  if (existsSync(script)) run(process.execPath, [script], path.join(pgDir, platform));
}

const ivm = path.join(nm, "isolated-vm");
if (!existsSync(path.join(ivm, "out", "isolated_vm.node"))) {
  const target = execFileSync(NODE_BIN, ["-p", "process.versions.node"]).toString().trim();
  console.log(`isolated-vm voor Node ${target} ophalen ...`);
  run(NODE_BIN, [path.join(nm, "prebuild-install", "bin.js"), "--runtime", "node", "--target", target], ivm);
}

execFileSync(NODE_BIN, ["-e", "require('isolated-vm')"], { cwd: ROOT });
console.log("Klaar: Node 22, PostgreSQL en isolated-vm staan klaar.");
