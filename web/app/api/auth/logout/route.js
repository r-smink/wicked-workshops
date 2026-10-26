import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/auth";

export const dynamic = "force-dynamic";

/* POST /api/auth/logout — verwijdert de auth-cookies. */
export async function POST() {
  await clearAuthCookies();
  return NextResponse.json({ ok: true });
}
