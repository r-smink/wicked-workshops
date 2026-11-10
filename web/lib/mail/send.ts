import "server-only";

import type { Mail } from "@/mail/layout";
import { deliver } from "./transport";

/* Eén mail versturen, hooguit één keer per (kind, refKey).

   Eerst wordt een rij in mail_log geclaimd (dedupe_key is uniek). Lukt dat
   niet, dan is de mail al verstuurd (of is een andere aanroep bezig) en
   gebeurt er niets. Mislukt het versturen, dan wordt de claim weer
   verwijderd, zodat een volgende cron-ronde het opnieuw kan proberen.

   Gooit nooit: een mail mag een boeking of refund niet laten mislukken. */

const DIRECTUS_URL = (process.env.DIRECTUS_URL || "").replace(/\/$/, "");
const TOKEN = process.env.DIRECTUS_STATIC_TOKEN || "";

type Result = "sent" | "duplicate" | "skipped" | "failed";

async function directus(method: string, path: string, body?: unknown): Promise<Response | null> {
  if (!DIRECTUS_URL || !TOKEN) return null;
  try {
    return await fetch(`${DIRECTUS_URL}${path}`, {
      method,
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return null;
  }
}

export async function sendMail(kind: string, refKey: string, to: string | null | undefined, mail: Mail): Promise<Result> {
  const recipient = String(to || "").trim();
  if (!recipient) return "skipped";
  const dedupeKey = `${kind}:${refKey}`.slice(0, 255);

  const claim = await directus("POST", "/items/mail_log", {
    kind, ref_key: refKey.slice(0, 191), dedupe_key: dedupeKey, recipient, sent_at: new Date().toISOString(),
  });
  if (claim && !claim.ok) {
    /* Unieke sleutel bestaat al: al verstuurd. Andere fouten: niet versturen,
       anders mailen we bij elke cron-ronde opnieuw. */
    if (claim.status !== 400) console.error(`mail_log ${claim.status} voor ${dedupeKey}`);
    return "duplicate";
  }
  const claimId: string | null = claim ? (await claim.json().catch(() => null))?.data?.id ?? null : null;

  try {
    const sent = await deliver({ to: recipient, ...mail });
    if (!sent && claimId) await directus("DELETE", `/items/mail_log/${claimId}`);
    return sent ? "sent" : "skipped";
  } catch (err) {
    console.error(`Mail ${dedupeKey} mislukt:`, (err as Error).message);
    if (claimId) await directus("DELETE", `/items/mail_log/${claimId}`);
    return "failed";
  }
}
