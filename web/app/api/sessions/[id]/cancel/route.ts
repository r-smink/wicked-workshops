import { NextResponse, type NextRequest } from "next/server";
import { directusUpdate, isDirectusConfigured } from "@/lib/directus";
import { currentProvider, forbidden, unauthorized } from "@/lib/guard";
import { getPlatformSettings } from "@/lib/directus/settings";
import { loadOwnedSession } from "@/lib/bookings/sessions";
import { closeSessionForBookings } from "@/lib/bookings/actions";

export const dynamic = "force-dynamic";

/* POST /api/sessions/{id}/cancel   Body: { reason? }
   De workshopgever annuleert een datum (docs/05 §6). Iedereen krijgt bericht
   en een andere datum aangeboden, of het volledige bedrag terug. Kan tot de
   start; de bevestigingsstap zit in het dashboard. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isDirectusConfigured) return NextResponse.json({ error: "Directus is niet geconfigureerd" }, { status: 503 });
  const { user, provider } = await currentProvider();
  if (!user) return unauthorized();
  if (!provider) return forbidden();

  const { id } = await params;
  const session = await loadOwnedSession(id, provider.id);
  if (!session) return forbidden();

  if (["cancelled_by_provider", "not_happening"].includes(session.state ?? "")) {
    return NextResponse.json({ error: "Deze datum gaat al niet door." }, { status: 409 });
  }
  if (!session.starts_at || new Date(session.starts_at).getTime() <= Date.now()) {
    return NextResponse.json({ error: "Deze datum is al begonnen. Neem contact met ons op." }, { status: 409 });
  }

  const body = await request.json().catch(() => ({}));
  const reason = String(body?.reason || "").trim().slice(0, 500) || null;
  const now = new Date().toISOString();

  await directusUpdate("workshop_sessions", session.id, {
    state: "cancelled_by_provider",
    goes_ahead: false,
    closed_at: now,
    cancellation_reason: reason,
  });
  const result = await closeSessionForBookings(session, { kind: "provider", reason, settings: await getPlatformSettings({ fresh: true }) });
  return NextResponse.json({ ok: true, ...result });
}
