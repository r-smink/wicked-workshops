import "server-only";

import { directusFetch } from "@/lib/directus";
import { SESSION_FIELDS, type FullSession } from "./load";

/* Een datum met de workshop en de workshopgever, voor acties van de
   workshopgever. null als de datum niet bestaat of niet van deze
   workshopgever is (zelfde antwoord, zodat niets uitlekt). */
export type OwnedSession = FullSession & {
  id: string;
  cancellation_reason: string | null;
  workshop: { id: string; title: string; duration_minutes: number | null; provider: { id: string } | null };
};

export async function loadOwnedSession(sessionId: string, providerId: string): Promise<OwnedSession | null> {
  if (!sessionId || !providerId) return null;
  const fields = [...SESSION_FIELDS.filter((f) => f !== "workshop"), "cancellation_reason", "workshop.id", "workshop.title", "workshop.duration_minutes", "workshop.provider.id"];
  const row = await directusFetch(`/items/workshop_sessions/${encodeURIComponent(sessionId)}?fields=${fields.join(",")}`, { noCache: true });
  if (!row || row.workshop?.provider?.id !== providerId) return null;
  return row as OwnedSession;
}

export async function countActiveBookings(sessionId: string): Promise<number> {
  const rows = await directusFetch(
    `/items/bookings?filter[session][_eq]=${encodeURIComponent(sessionId)}&filter[status][_in]=confirmed,awaiting_payment,pending&aggregate[count]=id`,
    { noCache: true },
  );
  const first = Array.isArray(rows) ? rows[0] : rows;
  return Number(first?.count?.id ?? first?.count ?? 0) || 0;
}
