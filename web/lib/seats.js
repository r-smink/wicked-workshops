/* Plekken op een datum ophogen en vrijgeven. Checkout en verzetten
   reserveren; webhook, cron en annuleren geven vrij.

   Eerst via de Directus-endpoint /ww-seats (extensie
   directus-extension-ww-seats): één UPDATE met de voorwaarde in de WHERE,
   dus atomair. Staat die extensie (nog) niet op de server, dan valt dit
   terug op lezen en terugschrijven, wat bij gelijktijdige boekingen de
   laatste plek dubbel kan uitgeven. */

import { directusFetch, directusUpdate } from "./directus";

const DIRECTUS_URL = (process.env.DIRECTUS_URL || "").replace(/\/$/, "");
const TOKEN = process.env.DIRECTUS_STATIC_TOKEN || "";

const sessionIdOf = (session) => (typeof session === "string" ? session : session?.id) || null;

/* "ok" | "full" | "missing" (endpoint bestaat niet) | "error" */
async function viaEndpoint(action, id, n) {
  if (!DIRECTUS_URL || !TOKEN) return "missing";
  try {
    const res = await fetch(`${DIRECTUS_URL}/ww-seats/${action}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ session: id, n }),
      cache: "no-store",
    });
    if (res.ok) return "ok";
    if (res.status === 409) return "full";
    if (res.status === 404 && action === "reserve") {
      const body = await res.json().catch(() => ({}));
      if (body?.errors?.[0]?.extensions?.code === "ROUTE_NOT_FOUND") return "missing";
    }
    if (res.status === 404) return "missing";
    console.error(`ww-seats ${action} ${res.status}`);
    return "error";
  } catch (err) {
    console.error("ww-seats onbereikbaar:", err.message);
    return "error";
  }
}

export async function releaseSeats(session, participants = 1) {
  const id = sessionIdOf(session);
  if (!id || participants < 1) return;
  const r = await viaEndpoint("release", id, participants);
  if (r === "ok") return;
  const fresh = await directusFetch(`/items/workshop_sessions/${id}?fields=seats_taken`, { noCache: true });
  await directusUpdate("workshop_sessions", id, {
    seats_taken: Math.max(0, (fresh?.seats_taken ?? 0) - participants),
  });
}

/* Reserveer als er nog plek is. true als het gelukt is. */
export async function reserveSeats(session, participants = 1) {
  const id = sessionIdOf(session);
  if (!id || participants < 1) return false;
  const r = await viaEndpoint("reserve", id, participants);
  if (r === "ok") return true;
  if (r === "full" || r === "error") return false;
  const fresh = await directusFetch(`/items/workshop_sessions/${id}?fields=seats_taken,capacity`, { noCache: true });
  const taken = fresh?.seats_taken ?? 0;
  if (!fresh || taken + participants > (fresh.capacity ?? 0)) return false;
  await directusUpdate("workshop_sessions", id, { seats_taken: taken + participants });
  return true;
}
