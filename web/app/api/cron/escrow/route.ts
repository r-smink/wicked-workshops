import { NextResponse, type NextRequest } from "next/server";
import { isDirectusConfigured } from "@/lib/directus";
import { getPlatformSettings } from "@/lib/directus/settings";
import {
  handleCompleted, handleDecisions, handleExpiredCheckouts, handleExpiredOffers, handleReminders,
  handleReviewInvites, handleWorkshopChecks,
} from "@/lib/bookings/cron";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/* GET of POST /api/cron/escrow, elke 10 minuten (.github/workflows/cron.yml).
   Alleen met Authorization: Bearer CRON_SECRET; zonder geheim draait niets.

   A. Minimum gehaald: datum gaat door (mail). Beslismoment voorbij zonder
      minimum: workshopgever krijgt bericht, na de grace period gaat de datum
      niet door en krijgt iedereen een andere datum of het geld terug.
   B. Escrowdatum voorbij en geen open klacht: aanmelding afgerond.
   C. Verlopen checkouts: plekken terug.
   D. Verlopen aanbiedingen: alles terug.
   E. Herinneringen voor het beslismoment en voor de start.
   F. Uitnodiging voor een review.
   G. Mails na de check door het team. */
export async function GET(request: NextRequest) {
  return run(request);
}

export async function POST(request: NextRequest) {
  return run(request);
}

async function run(request: NextRequest) {
  const secret = process.env.CRON_SECRET || "";
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }
  if (!isDirectusConfigured) {
    return NextResponse.json({ error: "Directus is niet geconfigureerd" }, { status: 503 });
  }

  const settings = await getPlatformSettings({ fresh: true });
  const now = Date.now();
  const results = {
    decided: await handleDecisions(settings, now),
    expiredOffers: await handleExpiredOffers(now),
    completed: await handleCompleted(settings, now),
    expired: await handleExpiredCheckouts(now),
    reminders: await handleReminders(settings, now),
    reviewInvites: await handleReviewInvites(settings, now),
    workshopChecks: await handleWorkshopChecks(now),
  };
  return NextResponse.json({ ok: true, ...results });
}
