import { NextResponse } from "next/server";
import { directusCreate, isDirectusConfigured } from "@/lib/directus";

export const dynamic = "force-dynamic";

const FORMS = new Set(["contact", "venue_search", "venue_offer", "follow", "business"]);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Houdt alleen korte strings en lijsten van korte strings over, zodat er
   niets onverwachts in Directus belandt. */
function clean(data) {
  const out = {};
  for (const [key, value] of Object.entries(data || {}).slice(0, 20)) {
    if (!/^[a-z_]{1,32}$/.test(key)) continue;
    if (Array.isArray(value)) out[key] = value.filter((v) => typeof v === "string").slice(0, 10).map((v) => v.slice(0, 80));
    else if (typeof value === "string") out[key] = value.trim().slice(0, 4000);
  }
  return out;
}

/* Inzendingen van de formulierblokken (components/blocks/FormBlock.jsx).
   Teamuitjes gaan naar business_requests, de rest naar form_submissions. */
export async function POST(request) {
  if (!isDirectusConfigured) {
    return NextResponse.json({ error: "Directus is niet geconfigureerd" }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
  }

  /* Honeypot ingevuld: doe alsof het gelukt is. */
  if (body.website) return NextResponse.json({ ok: true });

  if (!FORMS.has(body.form)) {
    return NextResponse.json({ error: "Onbekend formulier" }, { status: 400 });
  }

  const data = clean(body.data);
  if (!EMAIL.test(data.email || "")) {
    return NextResponse.json({ error: "Vul een geldig e-mailadres in" }, { status: 400 });
  }

  const page = typeof body.page === "string" ? body.page.slice(0, 255) : null;
  const created = body.form === "business"
    ? await directusCreate("business_requests", {
        company: data.company || null,
        contact_name: data.name || null,
        email: data.email,
        participants: Number(data.participants) || null,
        message: data.message || null,
        source: page || "page_builder",
      })
    : await directusCreate("form_submissions", {
        form: body.form,
        email: data.email,
        name: data.name || null,
        source_page: page,
        data,
      });

  if (!created) {
    return NextResponse.json({ error: "Versturen lukte niet, probeer het later opnieuw" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
