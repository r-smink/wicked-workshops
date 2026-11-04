/* ===========================================================================
   Stand van een datum: de doorgaan-drempel uit de export.

   Een workshopgever zet per datum een maximum (capacity), eventueel een
   minimum en een beslismoment. Daaruit volgt één van vier standen:

     goes_ahead  minimum gehaald of geen minimum; blijft zo, ook als
                 iemand daarna afhaakt (vastgelegd in goes_ahead)
     open        minimum nog niet gehaald, beslismoment nog niet voorbij
     cancelled   beslismoment voorbij zonder minimum, of geannuleerd
     full        alle plekken bezet

   Puur en zonder afhankelijkheden, zodat server en client hetzelfde zien.
   =========================================================================== */

const DAY = new Intl.DateTimeFormat("nl-NL", { weekday: "short", day: "numeric", month: "short", timeZone: "Europe/Amsterdam" });
const TIME = new Intl.DateTimeFormat("nl-NL", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Amsterdam" });

/* "za 14 nov" en "15:00" */
export function formatSessionDay(iso) {
  if (!iso) return "";
  return DAY.format(new Date(iso)).replace(/\./g, "");
}

export function formatSessionTime(iso) {
  if (!iso) return "";
  return TIME.format(new Date(iso));
}

export function formatDecision(iso) {
  if (!iso) return "";
  return `${formatSessionDay(iso)}, ${formatSessionTime(iso)}`;
}

/* Directus-sessie → { capacity, taken, min, goesAhead, decisionAt, status }.
   `workshopMin` is het minimum van de workshop als de datum er zelf geen heeft. */
export function normalizeSession(s, workshopMin = null) {
  if (!s) return null;
  const min = s.min_participants ?? workshopMin ?? null;
  return {
    id: s.id,
    startsAt: s.starts_at ?? null,
    endsAt: s.ends_at ?? null,
    capacity: s.capacity ?? 0,
    taken: s.seats_taken ?? 0,
    min: min && min > 0 ? min : null,
    goesAhead: Boolean(s.goes_ahead) || Boolean(s.provider_override),
    decisionAt: s.decision_at ?? null,
    status: s.status ?? null,
  };
}

export function sessionStanding(session, now = Date.now()) {
  const { capacity = 0, taken = 0, min = null, goesAhead = false, decisionAt = null, status = null } = session || {};
  const free = Math.max(0, capacity - taken);
  const decided = decisionAt ? new Date(decisionAt).getTime() <= now : false;
  const reached = !min || taken >= min || goesAhead;

  if (status === "cancelled" || (decided && !reached)) {
    return { key: "cancelled", label: "Gaat niet door", detail: "andere datum aangeboden" };
  }
  if (capacity > 0 && free === 0) {
    return { key: "full", label: "Vol", detail: `${taken} van ${capacity}` };
  }
  if (reached) {
    return {
      key: "goes_ahead",
      label: "Gaat door",
      detail: capacity ? `nog ${free} ${free === 1 ? "plek" : "plekken"}` : "",
    };
  }
  return {
    key: "open",
    label: `${taken} van ${min} nodig`,
    detail: decisionAt ? `beslismoment ${formatDecision(decisionAt)}` : "",
  };
}

export const STANDING_LEGEND = [
  { key: "open", label: "3 van 4 nodig", text: "Het minimum is nog niet gehaald. Aanmelden kan gewoon; uiterlijk op het beslismoment hoor je of hij doorgaat." },
  { key: "goes_ahead", label: "Gaat door", text: "Het minimum is gehaald, of er is geen minimum. Dat verandert niet meer, ook niet als iemand afzegt." },
  { key: "cancelled", label: "Gaat niet door", text: "Het minimum is niet gehaald voor het beslismoment. Je krijgt een andere datum aangeboden." },
  { key: "full", label: "Vol", text: "Alle plekken zijn bezet. Kijk bij de andere datums van deze workshop." },
];
