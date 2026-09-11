import { NextResponse } from "next/server";
import { isDirectusConfigured } from "@/lib/directus";

export const dynamic = "force-dynamic";

const DIRECTUS_URL = process.env.DIRECTUS_URL || "";
const DIRECTUS_TOKEN = process.env.DIRECTUS_STATIC_TOKEN || "";

/* Proxyt een Directus-asset naar de browser, zodat we de Directus-URL
   en token niet in de client hoeven te lekken. */
export async function GET(request, { params }) {
  if (!isDirectusConfigured) {
    return new NextResponse("Not configured", { status: 503 });
  }
  const { id } = await params;
  if (!id) return new NextResponse("No id", { status: 400 });

  const url = `${DIRECTUS_URL.replace(/\/$/, "")}/assets/${id}`;
  try {
    const res = await fetch(url, {
      headers: DIRECTUS_TOKEN ? { Authorization: `Bearer ${DIRECTUS_TOKEN}` } : {},
    });
    if (!res.ok) return new NextResponse("Asset not found", { status: res.status });

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    return new NextResponse("Asset error", { status: 500 });
  }
}
