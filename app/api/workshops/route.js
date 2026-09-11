import { NextResponse } from "next/server";
import { directusCreate, directusUpdate, directusDeleteByFilter, isDirectusConfigured } from "@/lib/directus";

export const dynamic = "force-dynamic";

/* Maakt een nieuwe workshop aan in Directus met status "draft".
   De aanbieder vult het wizard-formulier in; na moderatie wordt
   de status door een beheerder naar "published" gezet.

   Body: JSON met de workshop-velden uit het wizard-formulier. */
export async function POST(request) {
  if (!isDirectusConfigured) {
    return NextResponse.json(
      { error: "Directus is niet geconfigureerd" },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
  }

  const { workshop, inclusions, faq, sessions, media } = body;

  if (!workshop || !workshop.title) {
    return NextResponse.json({ error: "Titel is verplicht" }, { status: 400 });
  }

  const missing = [];
  if (!workshop.provider) missing.push("provider");
  if (!workshop.category) missing.push("category");
  if (!workshop.city) missing.push("city");
  if (!workshop.duration_minutes) missing.push("duration_minutes");
  if (!workshop.price_per_person) missing.push("price_per_person");
  if (missing.length) {
    return NextResponse.json(
      { error: `Verplichte velden ontbreken: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  /* Hoofdrecord aanmaken met status "draft" */
  const created = await directusCreate("workshops", {
    status: "draft",
    slug: workshop.slug,
    title: workshop.title,
    subtitle: workshop.subtitle || null,
    intro: workshop.intro || null,
    description: workshop.description || null,
    duration_minutes: workshop.duration_minutes || null,
    level: workshop.level || null,
    min_participants: workshop.min_participants || null,
    max_participants: workshop.max_participants || null,
    format: workshop.format || null,
    price_per_person: workshop.price_per_person || null,
    group_quote_from: workshop.group_quote_from || null,
    cancellation_policy: workshop.cancellation_policy || null,
    instant_bookable: workshop.instant_bookable ?? false,
    giftcard_eligible: workshop.giftcard_eligible ?? false,
    location_inherits_provider: workshop.location_inherits_provider ?? true,
    neighbourhood: workshop.neighbourhood || null,
    category: workshop.category || null,
    city: workshop.city || null,
    provider: workshop.provider || null,
    age_rating: workshop.age_rating || null,
  });

  if (!created) {
    return NextResponse.json(
      { error: "Kon workshop niet opslaan in Directus" },
      { status: 500 }
    );
  }

  /* Foto's koppelen (m2m via workshop_media) */
  if (Array.isArray(media)) {
    for (let i = 0; i < media.length; i++) {
      if (media[i]?.fileId) {
        await directusCreate("workshop_media", {
          workshop: created.id,
          file: media[i].fileId,
          alt: media[i].alt || "",
          sort: i + 1,
        });
      }
    }
  }

  /* Inbegrepen items aanmaken (m2m) */
  if (Array.isArray(inclusions)) {
    for (let i = 0; i < inclusions.length; i++) {
      if (inclusions[i]?.trim()) {
        await directusCreate("workshop_inclusions", {
          workshop: created.id,
          text: inclusions[i].trim(),
          sort: i + 1,
        });
      }
    }
  }

  /* FAQ items aanmaken (m2m) */
  if (Array.isArray(faq)) {
    for (let i = 0; i < faq.length; i++) {
      if (faq[i]?.q?.trim() && faq[i]?.a?.trim()) {
        await directusCreate("workshop_faq", {
          workshop: created.id,
          question: faq[i].q.trim(),
          answer: faq[i].a.trim(),
          sort: i + 1,
        });
      }
    }
  }

  /* Sessies aanmaken (m2m) */
  if (Array.isArray(sessions)) {
    for (const s of sessions) {
      if (s.date) {
        const startsAt = s.time ? `${s.date}T${s.time}:00` : `${s.date}T14:00:00`;
        await directusCreate("workshop_sessions", {
          workshop: created.id,
          starts_at: startsAt,
          capacity: Number(s.capacity) || 12,
          seats_taken: 0,
        });
      }
    }
  }

  return NextResponse.json({
    ok: true,
    id: created.id,
    slug: created.slug,
    status: created.status,
  });
}

/* Werk een bestaande workshop bij via PATCH. Optioneel worden inclusions,
   FAQ en sessies vernieuwd (oudes verwijderen, nieuwen aanmaken). */
export async function PATCH(request) {
  if (!isDirectusConfigured) {
    return NextResponse.json(
      { error: "Directus is niet geconfigureerd" },
      { status: 503 }
    );
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Workshop-id is verplicht" }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
  }

  const { workshop, inclusions, faq, sessions } = body;

  if (!workshop || !workshop.title) {
    return NextResponse.json({ error: "Titel is verplicht" }, { status: 400 });
  }

  const updated = await directusUpdate("workshops", id, {
    slug: workshop.slug,
    title: workshop.title,
    subtitle: workshop.subtitle || null,
    intro: workshop.intro || null,
    description: workshop.description || null,
    duration_minutes: workshop.duration_minutes || null,
    level: workshop.level || null,
    min_participants: workshop.min_participants || null,
    max_participants: workshop.max_participants || null,
    format: workshop.format || null,
    price_per_person: workshop.price_per_person || null,
    group_quote_from: workshop.group_quote_from || null,
    cancellation_policy: workshop.cancellation_policy || null,
    instant_bookable: workshop.instant_bookable ?? false,
    giftcard_eligible: workshop.giftcard_eligible ?? false,
    location_inherits_provider: workshop.location_inherits_provider ?? true,
    neighbourhood: workshop.neighbourhood || null,
    category: workshop.category || null,
    city: workshop.city || null,
    provider: workshop.provider || null,
    age_rating: workshop.age_rating || null,
  });

  if (!updated) {
    return NextResponse.json(
      { error: "Kon workshop niet bijwerken in Directus" },
      { status: 500 }
    );
  }

  if (Array.isArray(inclusions)) {
    await directusDeleteByFilter("workshop_inclusions", { workshop: { _eq: id } });
    for (let i = 0; i < inclusions.length; i++) {
      if (inclusions[i]?.trim()) {
        await directusCreate("workshop_inclusions", {
          workshop: id,
          text: inclusions[i].trim(),
          sort: i + 1,
        });
      }
    }
  }

  if (Array.isArray(faq)) {
    await directusDeleteByFilter("workshop_faq", { workshop: { _eq: id } });
    for (let i = 0; i < faq.length; i++) {
      if (faq[i]?.q?.trim() && faq[i]?.a?.trim()) {
        await directusCreate("workshop_faq", {
          workshop: id,
          question: faq[i].q.trim(),
          answer: faq[i].a.trim(),
          sort: i + 1,
        });
      }
    }
  }

  if (Array.isArray(sessions)) {
    await directusDeleteByFilter("workshop_sessions", { workshop: { _eq: id } });
    for (const s of sessions) {
      if (s.date) {
        const startsAt = s.time ? `${s.date}T${s.time}:00` : `${s.date}T14:00:00`;
        await directusCreate("workshop_sessions", {
          workshop: id,
          starts_at: startsAt,
          capacity: Number(s.capacity) || 12,
          seats_taken: 0,
        });
      }
    }
  }

  return NextResponse.json({
    ok: true,
    id: updated.id,
    slug: updated.slug,
    status: updated.status,
  });
}
