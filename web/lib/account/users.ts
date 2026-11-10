import "server-only";

import { directusFetch, directusUpdate } from "@/lib/directus";

/* Gebruikers in Directus, met het servertoken. Registratie en
   wachtwoordherstel lopen via eigen route handlers (docs/12, "Auth-
   implementatie"); de ingebouwde registratie en wachtwoordmail van Directus
   staan uit. Wachtwoorden hasht Directus zelf (argon2). */

const DIRECTUS_URL = (process.env.DIRECTUS_URL || "").replace(/\/$/, "");
const TOKEN = process.env.DIRECTUS_STATIC_TOKEN || "";

export type AccountUser = {
  id: string;
  email: string;
  first_name: string | null;
  status: string;
  email_verified_at: string | null;
  last_context: string | null;
};

const FIELDS = "id,email,first_name,status,email_verified_at,last_context";

export const normalizeEmail = (email: unknown) => String(email || "").trim().toLowerCase();
export const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;

async function admin(method: string, path: string, body?: unknown) {
  if (!DIRECTUS_URL || !TOKEN) return null;
  try {
    const res = await fetch(`${DIRECTUS_URL}${path}`, {
      method,
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`Directus ${res.status} bij ${method} ${path}:`, (await res.text().catch(() => "")).slice(0, 300));
      return null;
    }
    return res.status === 204 ? {} : (await res.json()).data ?? {};
  } catch (err) {
    console.error(`Directus ${method} ${path} mislukt:`, (err as Error).message);
    return null;
  }
}

export async function findUserByEmail(email: string): Promise<AccountUser | null> {
  const value = normalizeEmail(email);
  if (!value) return null;
  const rows = await directusFetch(`/users?filter[email][_eq]=${encodeURIComponent(value)}&fields=${FIELDS}&limit=1`, { noCache: true });
  return rows && !Array.isArray(rows) ? (rows as AccountUser) : null;
}

export async function findUserById(id: string): Promise<AccountUser | null> {
  return id ? ((await directusFetch(`/users/${encodeURIComponent(id)}?fields=${FIELDS}`, { noCache: true })) as AccountUser | null) : null;
}

/* Rol voor nieuwe accounts: Member (directus/seed/access.mjs). Of iemand
   workshopgever is, volgt uit een rij in providers, niet uit de rol. */
let memberRole: string | null | undefined;
export async function memberRoleId(): Promise<string | null> {
  if (process.env.DIRECTUS_ROLE_MEMBER) return process.env.DIRECTUS_ROLE_MEMBER;
  if (memberRole !== undefined) return memberRole;
  const row = await directusFetch(`/roles?filter[name][_eq]=Member&fields=id&limit=1`, { noCache: true });
  memberRole = row?.id ?? null;
  return memberRole ?? null;
}

/* Nieuw account. Zonder bevestigd adres krijgt het de status unverified:
   dan kan er ook rechtstreeks bij Directus niet mee worden ingelogd. */
export async function createUser({
  email, password, firstName, lastName, verified, context,
}: { email: string; password: string; firstName?: string | null; lastName?: string | null; verified: boolean; context: string }) {
  const now = new Date().toISOString();
  return (await admin("POST", "/users", {
    email: normalizeEmail(email),
    password,
    first_name: firstName?.trim() || null,
    last_name: lastName?.trim() || null,
    role: await memberRoleId(),
    status: verified ? "active" : "unverified",
    email_verified_at: verified ? now : null,
    last_context: context,
  })) as AccountUser | null;
}

export async function markVerified(userId: string) {
  return directusUpdate("directus_users", userId, { status: "active", email_verified_at: new Date().toISOString() });
}

export async function setPassword(userId: string, password: string) {
  return directusUpdate("directus_users", userId, { password });
}

/* Koppel gastboekingen aan het account, alleen op een bevestigd adres
   (docs/04). Hoofdletterongevoelig en getrimd. */
export async function linkGuestBookings(userId: string, email: string): Promise<number> {
  const value = normalizeEmail(email);
  if (!value) return 0;
  const rows = await directusFetch(
    `/items/bookings?filter[customer][_null]=true&filter[guest_email][_icontains]=${encodeURIComponent(value)}&fields=id,guest_email&limit=200`,
    { noCache: true },
  );
  const list = Array.isArray(rows) ? rows : rows ? [rows] : [];
  let count = 0;
  for (const b of list) {
    if (normalizeEmail(b.guest_email) !== value) continue;
    await directusUpdate("bookings", b.id, { customer: userId });
    count += 1;
  }
  return count;
}

/* Wachtwoordeisen uit docs/04: minimaal 8 tekens, geen samenstellingsregels. */
export function passwordError(password: unknown): string | null {
  const value = String(password || "");
  if (value.length < 8) return "Kies een wachtwoord van minimaal 8 tekens.";
  if (value.length > 200) return "Dit wachtwoord is te lang.";
  return null;
}
