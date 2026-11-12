import "server-only";

import { readItems } from "@directus/sdk";
import { publicClient } from "@/lib/directus/client";
import { fileUrl } from "@/lib/voorkant/data";

/* Aanvullende, publieke velden voor de aanbiederpagina die lib/voorkant/data.ts
   niet ophaalt (directus/seed/fields.mjs: providers.languages, location_name,
   gallery; reviews.rating_overall, workshop). Zelfde aanpak als data.ts:
   publieke rol, gecachet met de tag "directus", bij een fout een lege waarde. */

const client = () => publicClient({ revalidate: 300, tags: ["directus"] });

async function safe<T>(label: string, fallback: T, run: () => Promise<T>): Promise<T> {
  if (!process.env.DIRECTUS_URL) return fallback;
  try {
    return await run();
  } catch (err) {
    console.error(`Directus (${label}) mislukt:`, err instanceof Error ? err.message : err);
    return fallback;
  }
}

export type ProviderExtras = {
  languages: string[];
  locationName: string | null;
  gallery: { src: string; alt: string }[];
};

type Rel<T> = string | number | T | null | undefined;
const obj = <T,>(r: Rel<T>): T | null => (r && typeof r === "object" ? r : null);

export async function getProviderExtras(slug: string): Promise<ProviderExtras> {
  return safe<ProviderExtras>("provider-extras", { languages: [], locationName: null, gallery: [] }, async () => {
    const rows = (await client().request(
      readItems("providers", {
        fields: ["location_name", "languages.sort", "languages.language_id.name", "gallery.file", "gallery.alt", "gallery.sort"],
        filter: { _and: [{ status: { _eq: "published" } }, { slug: { _eq: slug } }] },
        limit: 1,
      } as never),
    )) as unknown as {
      location_name: string | null;
      languages: Rel<{ sort: number | null; language_id: Rel<{ name: string }> }>[] | null;
      gallery: Rel<{ file: string | { id: string } | null; alt: string | null; sort: number | null }>[] | null;
    }[];
    const p = rows[0];
    if (!p) return { languages: [], locationName: null, gallery: [] };
    const bySort = <T extends { sort: number | null }>(a: T, b: T) => (a.sort ?? 0) - (b.sort ?? 0);
    const languages = (p.languages ?? [])
      .map((l) => obj(l))
      .filter((l): l is { sort: number | null; language_id: Rel<{ name: string }> } => Boolean(l))
      .sort(bySort)
      .map((l) => obj(l.language_id)?.name)
      .filter((n): n is string => Boolean(n));
    const gallery = (p.gallery ?? [])
      .map((g) => obj(g))
      .filter((g): g is { file: string | { id: string } | null; alt: string | null; sort: number | null } => Boolean(g?.file))
      .sort(bySort)
      .map((g) => ({ src: fileUrl(typeof g.file === "string" ? g.file : g.file?.id)!, alt: g.alt || "" }));
    return { languages, locationName: p.location_name, gallery };
  });
}

/* Alle gepubliceerde beoordelingen van een aanbieder, alleen cijfer en
   workshop: voor de verdeling en de tellers per workshop. */
export async function getProviderRatings(slug: string): Promise<{ rating: number; workshopSlug: string | null }[]> {
  return safe("provider-ratings", [], async () => {
    const rows = (await client().request(
      readItems("reviews", {
        fields: ["rating_overall", "workshop.slug"],
        filter: { _and: [{ status: { _eq: "published" } }, { provider: { slug: { _eq: slug } } }] },
        limit: -1,
      } as never),
    )) as unknown as { rating_overall: number | null; workshop: Rel<{ slug: string }> }[];
    return rows
      .filter((r) => typeof r.rating_overall === "number")
      .map((r) => ({ rating: r.rating_overall!, workshopSlug: obj(r.workshop)?.slug ?? null }));
  });
}
