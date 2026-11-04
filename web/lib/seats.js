/* Plekken op een datum ophogen en vrijgeven. Checkout reserveert direct;
   webhook en cron geven vrij als een betaling niet doorgaat. */

import { directusFetch, directusUpdate } from "./directus";

const sessionIdOf = (session) => (typeof session === "string" ? session : session?.id) || null;

export async function releaseSeats(session, participants = 1) {
  const id = sessionIdOf(session);
  if (!id) return;
  const fresh = await directusFetch(`/items/workshop_sessions/${id}?fields=seats_taken`, { noCache: true });
  await directusUpdate("workshop_sessions", id, {
    seats_taken: Math.max(0, (fresh?.seats_taken ?? 0) - participants),
  });
}

/* Reserveer opnieuw als er nog plek is. true als het gelukt is. */
export async function reserveSeats(session, participants = 1) {
  const id = sessionIdOf(session);
  if (!id) return false;
  const fresh = await directusFetch(`/items/workshop_sessions/${id}?fields=seats_taken,capacity`, { noCache: true });
  const taken = fresh?.seats_taken ?? 0;
  if (!fresh || taken + participants > (fresh.capacity ?? 0)) return false;
  await directusUpdate("workshop_sessions", id, { seats_taken: taken + participants });
  return true;
}
