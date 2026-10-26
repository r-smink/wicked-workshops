import { getMenuItems } from "@/lib/directus";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location") || "header";
  const items = await getMenuItems(location);
  return NextResponse.json({ items });
}
