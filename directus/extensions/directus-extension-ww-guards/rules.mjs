/* Zuivere regels voor de hook in index.mjs. Geen Directus, geen database:
   alles wat nodig is komt binnen als argument, zodat het los te testen is
   (directus/tests/guards.test.mjs).

   Statusnamen zijn de live namen. docs/03 noemt ze anders:
     in_review = pending_review, live = published, hidden = paused. */

/* Welke statuswissel mag een workshopgever zelf maken (docs/03 rechtenmatrix):
   alleen draft -> in_review en live <-> hidden. De rest doet het team. */
const WORKSHOP_MEMBER_TRANSITIONS = {
  draft: ["pending_review"],
  published: ["paused"],
  paused: ["published"],
};

export function workshopStatusError(from, to) {
  if (to === undefined || to === from) return null;
  if ((WORKSHOP_MEMBER_TRANSITIONS[from] || []).includes(to)) return null;
  return `Je kunt de status niet van "${from}" naar "${to}" zetten.`;
}

/* Workshopgever: profiel tonen of pauzeren. Publiceren doet het team. */
const PROVIDER_MEMBER_TRANSITIONS = { published: ["paused"], paused: ["published"] };

export function providerStatusError(from, to) {
  if (to === undefined || to === from) return null;
  if ((PROVIDER_MEMBER_TRANSITIONS[from] || []).includes(to)) return null;
  return `Je kunt je profiel niet van "${from}" naar "${to}" zetten.`;
}

/* Velden die vastliggen zodra een datum met minimum doorgaat (docs/05).
   Het maximum ligt ook vast (docs/12). */
export const LOCKED_WHEN_CONFIRMED = ["starts_at", "ends_at", "min_participants", "decision_at", "capacity"];

const same = (a, b) => {
  if (a == null || b == null) return a == b;
  const ta = Date.parse(a);
  const tb = Date.parse(b);
  if (typeof a === "string" && typeof b === "string" && !Number.isNaN(ta) && !Number.isNaN(tb)) return ta === tb;
  return String(a) === String(b);
};

/* Fout bij het wijzigen van een datum, of null.
   current: de rij zoals hij nu is; patch: de wijziging; member: true voor
   een workshopgever (niet team of systeem). */
export function sessionUpdateError(current, patch, { member }) {
  const locked = current.state === "confirmed" && current.min_participants != null;
  if (locked) {
    const changed = LOCKED_WHEN_CONFIRMED.filter((f) => f in patch && !same(patch[f], current[f]));
    if (changed.length) return `Deze datum gaat door. Datum, tijd, minimum, maximum en beslismoment liggen vast (${changed.join(", ")}).`;
  }
  if (member && "state" in patch && patch.state !== current.state) {
    const cancelOk = patch.state === "cancelled_by_provider" && current.state === "confirmed";
    if (!cancelOk) return "Alleen een datum die doorgaat kun je zelf annuleren.";
  }
  if (["not_happening", "cancelled_by_provider"].includes(current.state)) {
    const changed = Object.keys(patch).filter((f) => !same(patch[f], current[f]));
    if (member && changed.length) return "Deze datum gaat niet meer door en is niet meer te wijzigen.";
  }
  return sessionShapeError({ ...current, ...patch });
}

/* Vorm van een datum (docs/03, constraints). */
export function sessionShapeError(s) {
  const start = s.starts_at ? Date.parse(s.starts_at) : NaN;
  const end = s.ends_at ? Date.parse(s.ends_at) : NaN;
  if (Number.isNaN(start)) return "Kies een datum en begintijd.";
  if (!Number.isNaN(end) && end <= start) return "De eindtijd ligt voor de begintijd.";
  if (s.capacity == null || Number(s.capacity) < 1) return "Het maximum is minstens 1.";
  if (s.min_participants != null) {
    if (Number(s.min_participants) < 1) return "Het minimum is minstens 1, of laat het leeg.";
    if (Number(s.min_participants) > Number(s.capacity)) return "Het minimum is hoger dan het maximum.";
    if (!s.decision_at) return "Met een minimum hoort een beslismoment.";
    if (Date.parse(s.decision_at) >= start) return "Het beslismoment ligt voor de start.";
  } else if (s.decision_at) {
    return "Zonder minimum is er geen beslismoment.";
  }
  return null;
}

/* Aanvulling bij het aanmaken van een datum: eindtijd uit de duur, en de
   stand (docs/05: geen minimum = gaat altijd door, vanaf aanmaken). */
export function sessionDefaults(payload, durationMinutes, now = new Date()) {
  const out = {};
  if (payload.starts_at && !payload.ends_at && durationMinutes) {
    out.ends_at = new Date(Date.parse(payload.starts_at) + durationMinutes * 60_000).toISOString();
  }
  if (payload.min_participants == null) {
    out.state = "confirmed";
    out.confirmed_at = now.toISOString();
    out.decision_at = null;
  } else {
    out.state = "open";
  }
  return out;
}
