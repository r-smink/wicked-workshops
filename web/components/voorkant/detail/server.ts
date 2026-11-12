import "server-only";

import { readItems } from "@directus/sdk";
import { publicClient } from "@/lib/directus/client";
import type { CancellationPolicy } from "@/lib/directus/types";

/* Wat getWorkshop() niet meegeeft: de annuleerregels als getallen (voor de
   drie vakjes) en welke datums verborgen groepsdatums zijn. Alleen publieke
   velden (directus/seed/fields.mjs), zelfde cache als lib/voorkant/data.ts. */

export type PolicyView = Pick<CancellationPolicy, "key" | "name" | "description" | "free_until_hours_before" | "penalty_percent_after" | "reschedule_free">;
export type DetailExtra = { policy: PolicyView | null; privateSessionIds: string[] };

export async function getDetailExtra(slug: string): Promise<DetailExtra> {
  const empty: DetailExtra = { policy: null, privateSessionIds: [] };
  if (!process.env.DIRECTUS_URL) return empty;
  try {
    const rows = (await publicClient({ revalidate: 300, tags: ["directus"] }).request(
      readItems("workshops", {
        fields: [
          "cancellation_policy.key", "cancellation_policy.name", "cancellation_policy.description",
          "cancellation_policy.free_until_hours_before", "cancellation_policy.penalty_percent_after", "cancellation_policy.reschedule_free",
          "sessions.id", "sessions.is_private",
        ],
        filter: { _and: [{ status: { _eq: "published" } }, { slug: { _eq: slug } }] },
        limit: 1,
        deep: { sessions: { _filter: { _and: [{ starts_at: { _gte: "$NOW" } }, { is_private: { _eq: true } }] }, _limit: 200 } },
      } as never),
    )) as unknown as { cancellation_policy: PolicyView | string | null; sessions: ({ id: string; is_private: boolean | null } | string)[] | null }[];
    const w = rows[0];
    if (!w) return empty;
    const policy = w.cancellation_policy && typeof w.cancellation_policy === "object" ? w.cancellation_policy : null;
    const privateSessionIds = (w.sessions ?? []).flatMap((s) => (typeof s === "object" && s.is_private ? [s.id] : []));
    return { policy, privateSessionIds };
  } catch (err) {
    console.error("Directus (workshop-extra) mislukt:", err instanceof Error ? err.message : err);
    return empty;
  }
}
