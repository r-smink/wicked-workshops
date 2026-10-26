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

  /* Optioneel verkleinen: ?w=84&h=84 wordt een Directus-transformatie.
     Alleen gehele getallen tot 2400, zodat niemand willekeurige formaten
     laat renderen. */
  const { searchParams } = new URL(request.url);
  const size = (v) => {
    const n = Number.parseInt(v || "", 10);
    return Number.isInteger(n) && n > 0 && n <= 2400 ? n : null;
  };
  const w = size(searchParams.get("w"));
  const h = size(searchParams.get("h"));
  const transform = w || h
    ? `?${new URLSearchParams({ ...(w ? { width: String(w) } : {}), ...(h ? { height: String(h) } : {}), fit: "cover", quality: "80" })}`
    : "";
  const url = `${DIRECTUS_URL.replace(/\/$/, "")}/assets/${id}${transform}`;
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
