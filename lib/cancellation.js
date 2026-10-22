/* ===========================================================================
   Annuleringsbeleid per workshop.

   Eén bron voor de teksten op de site en voor de annuleringsdeadline die
   de checkout op de booking zet. Toon nooit een vaste "gratis annuleren"-
   belofte: het beleid verschilt per workshop, en een belofte die niet klopt
   is misleidend (art. 6:193c BW). Zie docs/juridisch/Voorwaarden aanvulling.md.
   =========================================================================== */

export const CANCELLATION_POLICIES = {
  flexible_48h: {
    short: "Gratis annuleren tot 48 uur vooraf",
    long: "Gratis tot 48 uur vooraf",
    hoursBefore: 48,
  },
  moderate_7d: {
    short: "Gratis annuleren tot 7 dagen vooraf",
    long: "Gratis tot 7 dagen vooraf",
    hoursBefore: 7 * 24,
  },
  strict_none: {
    short: "Geen kosteloze annulering",
    long: "Geen annulering mogelijk",
    hoursBefore: null,
  },
};

const FALLBACK = "Annuleren volgens de voorwaarden van de aanbieder";

export function cancellationShort(policy) {
  return CANCELLATION_POLICIES[policy]?.short || FALLBACK;
}

export function cancellationLong(policy) {
  return CANCELLATION_POLICIES[policy]?.long || FALLBACK;
}

/* Tot wanneer de klant kosteloos kan annuleren, als ISO-string. null als
   er geen kosteloze annulering is of het beleid onbekend is. */
export function cancellationDeadline(policy, startsAt) {
  const hours = CANCELLATION_POLICIES[policy]?.hoursBefore;
  if (hours == null || !startsAt) return null;
  const start = new Date(startsAt).getTime();
  if (Number.isNaN(start)) return null;
  return new Date(start - hours * 60 * 60 * 1000).toISOString();
}
