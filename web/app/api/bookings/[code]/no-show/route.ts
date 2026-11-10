import { NextResponse, type NextRequest } from "next/server";
import { isDirectusConfigured } from "@/lib/directus";
import { currentProvider, forbidden, unauthorized } from "@/lib/guard";
import { getPlatformSettings } from "@/lib/directus/settings";
import { loadBookingByCode } from "@/lib/bookings/load";
import { markNoShow } from "@/lib/bookings/actions";

export const dynamic = "force-dynamic";

/* POST /api/bookings/WW-XXXX/no-show
   De workshopgever meldt dat een deelnemer niet kwam. Alleen na de start en
   voor het geld vrijkomt. Geen terugbetaling; de deelnemer krijgt een mail
   en kan het betwisten met een melding. */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  if (!isDirectusConfigured) return NextResponse.json({ error: "Directus is niet geconfigureerd" }, { status: 503 });
  const { user, provider } = await currentProvider();
  if (!user) return unauthorized();
  if (!provider) return forbidden();

  const { code } = await params;
  const booking = await loadBookingByCode(code);
  if (!booking || booking.workshop.provider?.id !== provider.id) return forbidden();

  const result = await markNoShow(booking, await getPlatformSettings({ fresh: true }));
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ ok: true });
}
