// Kleine Directus API-client zonder afhankelijkheden (Node 18+). Alleen ASCII.
export const URL_BASE = (process.env.DIRECTUS_URL || "http://localhost:8055").replace(/\/$/, "");
const TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;
if (!TOKEN) { console.error("Zet DIRECTUS_ADMIN_TOKEN (statisch token van een admin-gebruiker)."); process.exit(1); }
export async function api(method, path, body, okCodes = []) {
  const res = await fetch(URL_BASE + path, { method, headers: { Authorization: "Bearer " + TOKEN, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let data = null; try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
  if (!res.ok && !okCodes.includes(res.status)) throw new Error(method + " " + path + " -> " + res.status + " " + text.slice(0, 400));
  return { status: res.status, data: data && data.data !== undefined ? data.data : data };
}
