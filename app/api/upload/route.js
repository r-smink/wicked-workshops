import { NextResponse } from "next/server";
import { isDirectusConfigured } from "@/lib/directus";

export const dynamic = "force-dynamic";

const DIRECTUS_URL = process.env.DIRECTUS_URL || "";
const DIRECTUS_TOKEN = process.env.DIRECTUS_STATIC_TOKEN || "";

/* Uploadt een bestand naar Directus /files via multipart/form-data.
   Geeft { id, filename_download } terug bij succes. */
export async function POST(request) {
  if (!isDirectusConfigured) {
    return NextResponse.json(
      { error: "Directus is niet geconfigureerd" },
      { status: 503 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Geen bestand meegezonden" }, { status: 400 });
  }

  try {
    const directusForm = new FormData();
    directusForm.append("file", file, file.name);

    const res = await fetch(`${DIRECTUS_URL.replace(/\/$/, "")}/files`, {
      method: "POST",
      headers: DIRECTUS_TOKEN ? { Authorization: `Bearer ${DIRECTUS_TOKEN}` } : {},
      body: directusForm,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`Directus ${res.status} bij /files upload:`, text);
      return NextResponse.json({ error: `Upload mislukt (${res.status})` }, { status: 502 });
    }

    const json = await res.json();
    return NextResponse.json({ id: json.data?.id, filename: json.data?.filename_download });
  } catch (err) {
    console.error("Upload fout:", err.message);
    return NextResponse.json({ error: "Upload mislukt" }, { status: 500 });
  }
}
