import { NextResponse } from "next/server";
import { isDirectusConfigured } from "@/lib/directus";
import { currentUser, unauthorized } from "@/lib/guard";

export const dynamic = "force-dynamic";

const DIRECTUS_URL = process.env.DIRECTUS_URL || "";
const DIRECTUS_TOKEN = process.env.DIRECTUS_STATIC_TOKEN || "";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024;

/* Uploadt een bestand naar Directus /files via multipart/form-data.
   Geeft { id, filename_download } terug bij succes. */
export async function POST(request) {
  if (!isDirectusConfigured) {
    return NextResponse.json(
      { error: "Directus is niet geconfigureerd" },
      { status: 503 }
    );
  }

  if (!(await currentUser())) return unauthorized();

  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Geen bestand meegezonden" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Alleen JPG, PNG of WebP" }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Een foto mag maximaal 10 MB zijn" }, { status: 413 });
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
