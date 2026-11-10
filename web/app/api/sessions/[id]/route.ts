import { NextResponse, type NextRequest } from "next/server";
import { directusFetch, isDirectusConfigured } from "@/lib/directus";
import { currentProvider, forbidden, unauthorized } from "@/lib/guard";
import { countActiveBookings, loadOwnedSession } from "@/lib/bookings/sessions";

export const dynamic = "force-dynamic";

const DIRECTUS_URL = (process.env.DIRECTUS_URL || "").replace(/\/$/, "");
const TOKEN = process.env.DIRECTUS_STATIC_TOKEN || "";

/* DELETE /api/sessions/{id}
   "Datum verwijderen": alleen zolang er niemand is aangemeld (docs/05 §6).
   Met aanmeldingen moet de workshopgever annuleren, zodat iedereen bericht
   en een andere datum of geld terug krijgt. */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isDirectusConfigured) return NextResponse.json({ error: "Directus is niet geconfigureerd" }, { status: 503 });
  const { user, provider } = await currentProvider();
  if (!user) return unauthorized();
  if (!provider) return forbidden();

  const { id } = await params;
  const session = await loadOwnedSession(id, provider.id);
  if (!session) return forbidden();

  const anyBooking = await directusFetch(
    `/items/bookings?filter[session][_eq]=${encodeURIComponent(id)}&fields=id&limit=1`,
    { noCache: true },
  );
  if (anyBooking || (await countActiveBookings(id)) > 0 || (session.seats_taken ?? 0) > 0) {
    return NextResponse.json({ error: "Er zijn aanmeldingen voor deze datum. Annuleer hem in plaats van verwijderen." }, { status: 409 });
  }

  const res = await fetch(`${DIRECTUS_URL}/items/workshop_sessions/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) return NextResponse.json({ error: "Verwijderen lukte niet" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
