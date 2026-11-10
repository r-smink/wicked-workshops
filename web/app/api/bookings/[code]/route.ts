import { NextResponse, type NextRequest } from "next/server";
import { isDirectusConfigured } from "@/lib/directus";
import { currentUser } from "@/lib/guard";
import { getPlatformSettings } from "@/lib/directus/settings";
import { bookingToken, canAccessBooking } from "@/lib/bookings/access";
import { loadBookingByCode } from "@/lib/bookings/load";
import {
  acceptOffer, cancelByCustomer, fileComplaint, moveBooking, refundOffer, writeReview, type ActionResult,
} from "@/lib/bookings/actions";
import { canReschedule } from "@/lib/rules/booking-rules";

export const dynamic = "force-dynamic";

/* POST /api/bookings/WW-XXXX
   Body: { t, action, ... }
   Toegang met het token uit de beheerlink (t) of ingelogd als de klant.

     cancel                       annuleren (§5)
     reschedule   { session_id }  verzetten naar een andere datum (§4)
     accept_offer { session_id }  aanbod aannemen, of een andere datum kiezen (§7)
     decline_offer                geen andere datum: alles terug
     complaint    { kind, description }
     review       { rating, body } */
export async function POST(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  if (!isDirectusConfigured) return NextResponse.json({ error: "Directus is niet geconfigureerd" }, { status: 503 });
  const { code } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
  }

  const booking = await loadBookingByCode(code);
  const user = booking ? await currentUser() : null;
  if (!booking || !canAccessBooking(booking, { token: String(body.t || ""), userId: user?.id ?? null })) {
    /* Zelfde antwoord voor "bestaat niet" en "geen toegang". */
    return NextResponse.json({ error: "Deze aanmelding is niet gevonden. Klopt de link?" }, { status: 404 });
  }

  const settings = await getPlatformSettings({ fresh: true });
  const sessionId = String(body.session_id || "");
  let result: ActionResult<Record<string, unknown>>;

  switch (body.action) {
    case "cancel":
      result = await cancelByCustomer(booking, settings);
      break;
    case "reschedule":
      if (!canReschedule(booking)) {
        result = { ok: false, status: 409, error: "Deze aanmelding kun je niet meer verzetten." };
        break;
      }
      result = await moveBooking(booking, sessionId, settings);
      break;
    case "accept_offer":
      result = await acceptOffer(booking, sessionId, settings);
      break;
    case "decline_offer":
      result = await refundOffer(booking);
      break;
    case "complaint":
      result = await fileComplaint(booking, { kind: String(body.kind || "other"), description: String(body.description || "") }, settings);
      break;
    case "review":
      result = await writeReview(booking, { rating: Number(body.rating), body: String(body.body || "") });
      break;
    default:
      return NextResponse.json({ error: "Onbekende actie" }, { status: 400 });
  }

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  /* Na verzetten heeft de aanmelding een nieuwe code en link. */
  const moved = "booking" in result ? (result.booking as { id: string; booking_code: string; access_token: string | null } | undefined) : undefined;
  return NextResponse.json({
    ok: true,
    ...(moved ? { booking_code: moved.booking_code, t: bookingToken(moved.id, moved.access_token) } : {}),
  });
}
