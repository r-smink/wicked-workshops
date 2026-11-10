import "server-only";

import { timingSafeEqual } from "crypto";
import { directusFetch } from "@/lib/directus";

/* Acties die het team in Directus start (Flow-knoppen). De Flow stuurt het
   gedeelde geheim TEAM_ACTION_SECRET mee en de id van het teamlid; wij
   controleren zelf dat die gebruiker de rol Team (of Administrator) heeft. */

export function teamSecretMatches(header: string | null): boolean {
  const secret = process.env.TEAM_ACTION_SECRET || "";
  if (!secret || !header) return false;
  const a = Buffer.from(secret);
  const b = Buffer.from(header);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isTeamMember(userId: string | null | undefined): Promise<boolean> {
  if (!userId || !/^[0-9a-f-]{36}$/i.test(userId)) return false;
  const user = await directusFetch(`/users/${userId}?fields=id,status,role.name`, { noCache: true });
  if (!user || user.status !== "active") return false;
  return user.role?.name === "Team" || user.role?.name === "Administrator";
}
