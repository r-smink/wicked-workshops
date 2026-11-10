import { NextResponse, type NextRequest } from "next/server";
import { directusCreate, directusFetch, isDirectusConfigured } from "@/lib/directus";
import { currentProvider, forbidden, unauthorized } from "@/lib/guard";
import { sessionDefaults, sessionShapeError, type NewSession } from "@/lib/rules/session-shape";

export const dynamic = "force-dynamic";

/* POST /api/sessions   "Datum toevoegen" in het dashboard (docs/10).
   Body: { workshop_id, starts_at, capacity, min_participants?, decision_at? }
   Een nieuwe datum is vrij te plaatsen, ook bij een workshop die al live
   staat (docs/12); alleen inhoudelijke wijzigingen gaan langs de check. */
export async function POST(request: NextRequest) {
  if (!isDirectusConfigured) return NextResponse.json({ error: "Directus is niet geconfigureerd" }, { status: 503 });
  const { user, provider } = await currentProvider();
  if (!user) return unauthorized();
  if (!provider) return forbidden();

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });

  const workshop = await directusFetch(
    `/items/workshops/${encodeURIComponent(String(body.workshop_id || ""))}?fields=id,provider,duration_minutes`,
    { noCache: true },
  );
  if (!workshop || workshop.provider !== provider.id) return forbidden();

  const min = body.min_participants === "" || body.min_participants == null ? null : Number(body.min_participants);
  const toIso = (v: unknown) => {
    if (!v) return null;
    const t = Date.parse(String(v));
    return Number.isNaN(t) ? null : new Date(t).toISOString();
  };
  const input: NewSession = {
    starts_at: toIso(body.starts_at) || "",
    capacity: Number(body.capacity),
    min_participants: min,
    decision_at: min == null ? null : toIso(body.decision_at),
  };
  const error = sessionShapeError(input);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const created = await directusCreate("workshop_sessions", {
    workshop: workshop.id,
    ...input,
    seats_taken: 0,
    ...sessionDefaults(input, workshop.duration_minutes),
  });
  if (!created?.id) return NextResponse.json({ error: "De datum is niet opgeslagen" }, { status: 500 });
  return NextResponse.json({ ok: true, id: created.id });
}
