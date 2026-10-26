import { readFile } from "node:fs/promises";
import path from "node:path";
import { devRoutesEnabled } from "@/lib/dev-routes";

/* Serveert beeld uit reference/img voor de fixture van /dev/shell.
   Alleen in ontwikkeling en tests; reference/ hoort niet in productie. */
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  if (!devRoutesEnabled()) return new Response("Not found", { status: 404 });
  const { name } = await params;
  if (!/^[a-z0-9-]+\.jpg$/.test(name)) return new Response("Bad name", { status: 400 });
  try {
    const file = await readFile(path.join(process.cwd(), "..", "reference", "img", name));
    return new Response(new Uint8Array(file), { headers: { "Content-Type": "image/jpeg", "Cache-Control": "no-store" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
