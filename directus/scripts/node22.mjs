/* Directus 11.17 heeft isolated-vm nodig, en daarvan bestaan alleen
   kant-en-klare builds tot en met Node 22. Draait de machine een nieuwere
   Node, dan gebruiken we de Node 22 uit het npm-pakket `node`. */
import path from "node:path";
import { ROOT } from "./env.mjs";

const major = Number(process.versions.node.split(".")[0]);

export const NODE_BIN =
  major === 22
    ? process.execPath
    : path.join(ROOT, "node_modules", "node", "bin", process.platform === "win32" ? "node.exe" : "node");
