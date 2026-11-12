import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { timingSafeEqual } from "crypto";

export const dynamic = "force-dynamic";

/* POST /api/revalidate?secret=<REVALIDATE_SECRET>
   Webhook vanuit Directus (Flow "Event Hook", actie "Webhook / Request URL")
   na create, update of delete op publieke content. Maakt de cache van de
   voorkant leeg (tag "directus") en die van kop en megamenu (tag "shell").
   Het geheim mag ook als header x-revalidate-secret meekomen. */
function secretOk(given: string | null): boolean {
  const expected = process.env.REVALIDATE_SECRET || "";
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const given = request.headers.get("x-revalidate-secret") || request.nextUrl.searchParams.get("secret");
  if (!secretOk(given)) return NextResponse.json({ error: "Niet toegestaan" }, { status: 401 });
  revalidateTag("directus");
  revalidateTag("shell");
  return NextResponse.json({ ok: true, revalidated: ["directus", "shell"], at: new Date().toISOString() });
}
