/* Endpoint /ww-seats (extensie directus-extension-ww-seats) tegen een
   draaiende Directus: twee gelijktijdige reserveringen op de laatste plek,
   precies één slaagt. Draait in npm run verify. */
import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { BASE, api } from "../scripts/api.mjs";
import { loadEnv } from "../scripts/env.mjs";

const run = randomBytes(4).toString("hex");
const env = loadEnv();
const TOKEN = env.DIRECTUS_TARGET_TOKEN || env.ADMIN_TOKEN;
let workshop;
let session;

const post = (path, body, token = TOKEN) =>
  fetch(`${BASE}/ww-seats/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });

beforeAll(async () => {
  const ping = await fetch(`${BASE}/ww-seats/reserve`, { method: "POST" }).catch(() => null);
  if (!ping || ping.status === 404) throw new Error("Endpoint /ww-seats ontbreekt. Herstart Directus zodat de extensie laadt.");
  const [provider] = await api("GET", "/items/providers?fields=id&limit=1");
  if (!provider) throw new Error("Geen workshopgever gevonden. Draai eerst npm run seed:demo.");
  workshop = await api("POST", "/items/workshops", { provider: provider.id, title: `Stoelen ${run}`, slug: `stoelen-${run}`, status: "draft", duration_minutes: 60 });
  session = await api("POST", "/items/workshop_sessions", {
    workshop: workshop.id, starts_at: new Date(Date.now() + 10 * 86400_000).toISOString(), capacity: 3, seats_taken: 2,
  });
});

afterAll(async () => {
  if (session) await api("DELETE", `/items/workshop_sessions/${session.id}`).catch(() => null);
  if (workshop) await api("DELETE", `/items/workshops/${workshop.id}`).catch(() => null);
});

describe("plekken reserveren", () => {
  it("geeft de laatste plek maar aan één van twee gelijktijdige boekingen", async () => {
    const results = await Promise.all([post("reserve", { session: session.id, n: 1 }), post("reserve", { session: session.id, n: 1 })]);
    expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
    const row = await api("GET", `/items/workshop_sessions/${session.id}?fields=seats_taken`);
    expect(row.seats_taken).toBe(3);
  });

  it("geeft vrij zonder onder nul te gaan", async () => {
    expect((await post("release", { session: session.id, n: 5 })).status).toBe(200);
    const row = await api("GET", `/items/workshop_sessions/${session.id}?fields=seats_taken`);
    expect(row.seats_taken).toBe(0);
  });

  it("is alleen voor de server", async () => {
    expect((await post("reserve", { session: session.id, n: 1 }, null)).status).toBe(403);
    expect((await post("reserve", { session: "geen-id", n: 1 })).status).toBe(400);
  });
});
