import { NextResponse, type NextRequest } from "next/server";
import { directusFetch, directusUpdate, isDirectusConfigured } from "@/lib/directus";
import { getPlatformSettings } from "@/lib/directus/settings";
import { isTeamMember, teamSecretMatches } from "@/lib/team";
import { loadBookingById } from "@/lib/bookings/load";
import { refundBooking, setEscrow } from "@/lib/bookings/actions";
import { mailRefundDone } from "@/lib/mail/notify";
import { priceCents } from "@/lib/directus/model";

export const dynamic = "force-dynamic";

/* POST /api/team/actions
   Header: x-team-secret: TEAM_ACTION_SECRET
   Body:   { action, keys: [ids], user: <id van het teamlid> }

   refund          complaints  Terugbetalen. Vier ogen: approved_by is gezet
                               en is iemand anders dan wie op de knop drukt.
                               Bedrag: refund_amount, of leeg = wat er over is.
   release         complaints  Uitbetaling vrijgeven na een afgewezen of
                               opgeloste klacht: escrowdatum op nu (maar niet
                               eerder dan de normale datum na de workshop).
   block_provider  providers   Workshopgever pauzeren met blocked_reason. Zijn
                               workshops gaan offline. */
export async function POST(request: NextRequest) {
  if (!isDirectusConfigured) return NextResponse.json({ error: "Directus is niet geconfigureerd" }, { status: 503 });
  if (!teamSecretMatches(request.headers.get("x-team-secret"))) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const userId = String(body?.user || "");
  if (!(await isTeamMember(userId))) return NextResponse.json({ error: "Alleen voor het team" }, { status: 403 });

  /* Directus stuurt keys als array, of als tekst als het sjabloon hem
     stringificeert. */
  let raw: unknown = body?.keys;
  if (typeof raw === "string") {
    try {
      raw = raw.trim().startsWith("[") ? JSON.parse(raw) : raw.split(",");
    } catch {
      raw = [];
    }
  }
  raw = Array.isArray(raw) ? raw : [raw];
  const keys: string[] = (raw as unknown[]).filter(Boolean).map((k) => String(k).trim()).slice(0, 20);
  if (!keys.length) return NextResponse.json({ error: "Kies eerst een rij" }, { status: 400 });

  const results: { id: string; ok: boolean; message: string }[] = [];
  for (const id of keys) {
    if (body.action === "refund") results.push({ id, ...(await refund(id, userId)) });
    else if (body.action === "release") results.push({ id, ...(await release(id, userId)) });
    else if (body.action === "block_provider") results.push({ id, ...(await blockProvider(id)) });
    else return NextResponse.json({ error: "Onbekende actie" }, { status: 400 });
  }
  const failed = results.filter((r) => !r.ok);
  return NextResponse.json({ ok: failed.length === 0, results }, { status: failed.length ? 409 : 200 });
}

type Complaint = {
  id: string; status: string; booking: string; refund_amount: string | null;
  approved_by: string | null; executed_by: string | null;
};

async function loadComplaint(id: string): Promise<Complaint | null> {
  return directusFetch(
    `/items/complaints/${encodeURIComponent(id)}?fields=id,status,booking,refund_amount,approved_by,executed_by`,
    { noCache: true },
  );
}

async function refund(id: string, userId: string) {
  const complaint = await loadComplaint(id);
  if (!complaint) return { ok: false, message: "Klacht niet gevonden" };
  if (complaint.status === "refunded") return { ok: false, message: "Al terugbetaald" };
  if (complaint.status !== "refund_approved" || !complaint.approved_by) {
    return { ok: false, message: "Zet eerst de status op Terugbetaling goedgekeurd en vul approved_by in." };
  }
  if (complaint.approved_by === userId) {
    return { ok: false, message: "Vier ogen: wie goedkeurt, voert niet zelf uit. Laat een collega op de knop drukken." };
  }
  const booking = await loadBookingById(complaint.booking);
  if (!booking) return { ok: false, message: "Aanmelding niet gevonden" };

  const amountCents = complaint.refund_amount ? priceCents(complaint.refund_amount.replace(",", ".")) : null;
  if (complaint.refund_amount && !(amountCents && amountCents > 0)) {
    return { ok: false, message: "refund_amount is geen geldig bedrag" };
  }

  const result = await refundBooking(booking, {
    amountCents,
    key: `complaint-${complaint.id}`,
    message: "Naar aanleiding van je melding betalen we je terug.",
    reason: "complaint",
  });
  if (Object.keys(result.updates).length) await directusUpdate("bookings", booking.id, result.updates);
  if (!result.ok) {
    return { ok: false, message: "OPP weigerde de terugbetaling. Probeer het later opnieuw of kijk in het OPP-dashboard." };
  }
  const now = new Date().toISOString();
  await directusUpdate("complaints", complaint.id, { status: "refunded", executed_by: userId, executed_at: now, resolved_at: now });
  if (result.refundCents > 0) await mailRefundDone(booking, result.refundCents, `complaint-${complaint.id}`);
  return {
    ok: true,
    message: result.refundCents > 0 ? `Terugbetaald: EUR ${(result.refundCents / 100).toFixed(2)}` : "Niets meer terug te betalen",
  };
}

async function release(id: string, userId: string) {
  const complaint = await loadComplaint(id);
  if (!complaint) return { ok: false, message: "Klacht niet gevonden" };
  if (!["rejected", "resolved", "refunded"].includes(complaint.status)) {
    return { ok: false, message: "Zet de klacht eerst op afgewezen, opgelost of terugbetaald." };
  }
  const booking = await loadBookingById(complaint.booking);
  if (!booking) return { ok: false, message: "Aanmelding niet gevonden" };

  const settings = await getPlatformSettings({ fresh: true });
  const end = new Date(booking.session.ends_at || booking.session.starts_at || Date.now()).getTime();
  const normal = end + settings.settlementDelayHours * 60 * 60 * 1000;
  const until = new Date(Math.max(Date.now(), normal)).toISOString();
  if (!(await setEscrow(booking, until))) return { ok: false, message: "OPP accepteerde de nieuwe escrowdatum niet" };
  await directusUpdate("complaints", complaint.id, {
    resolved_at: new Date().toISOString(),
    executed_by: complaint.executed_by || userId,
  });
  return { ok: true, message: `Geld komt vrij op ${until}` };
}

async function blockProvider(id: string) {
  const provider = await directusFetch(`/items/providers/${encodeURIComponent(id)}?fields=id,blocked_reason`, { noCache: true });
  if (!provider) return { ok: false, message: "Workshopgever niet gevonden" };
  if (!provider.blocked_reason?.trim()) return { ok: false, message: "Vul eerst blocked_reason in: waarom blokkeren we?" };
  await directusUpdate("providers", provider.id, { status: "paused", blocked_at: new Date().toISOString() });
  const workshops = await directusFetch(
    `/items/workshops?filter[provider][_eq]=${provider.id}&filter[status][_eq]=published&fields=id&limit=-1`,
    { noCache: true },
  );
  for (const w of Array.isArray(workshops) ? workshops : workshops ? [workshops] : []) {
    await directusUpdate("workshops", w.id, { status: "paused" });
  }
  return { ok: true, message: "Geblokkeerd. Datums met aanmeldingen blijven staan; annuleer die zo nodig apart." };
}
