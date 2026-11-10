/* Vorm van een nieuwe datum en de standaardwaarden bij aanmaken.
   Zelfde regels als sessionShapeError en sessionDefaults in
   directus/extensions/directus-extension-ww-guards/rules.mjs: de hook
   bewaakt Directus, deze functies de route die met het servertoken schrijft
   (dat token slaat de hook over). Pas ze samen aan. */

export type NewSession = {
  starts_at: string;
  ends_at?: string | null;
  capacity: number;
  min_participants?: number | null;
  decision_at?: string | null;
};

export function sessionShapeError(s: NewSession, now = Date.now()): string | null {
  const start = s.starts_at ? Date.parse(s.starts_at) : NaN;
  const end = s.ends_at ? Date.parse(s.ends_at) : NaN;
  if (Number.isNaN(start)) return "Kies een datum en begintijd.";
  if (start <= now) return "Deze datum ligt in het verleden.";
  if (!Number.isNaN(end) && end <= start) return "De eindtijd ligt voor de begintijd.";
  if (s.capacity == null || !(Number(s.capacity) >= 1)) return "Het maximum is minstens 1.";
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

export function sessionDefaults(s: NewSession, durationMinutes: number | null | undefined, now = new Date()) {
  const out: Record<string, unknown> = {};
  if (s.starts_at && !s.ends_at && durationMinutes) {
    out.ends_at = new Date(Date.parse(s.starts_at) + durationMinutes * 60_000).toISOString();
  }
  if (s.min_participants == null) {
    out.state = "confirmed";
    out.goes_ahead = true;
    out.confirmed_at = now.toISOString();
    out.decision_at = null;
  } else {
    out.state = "open";
    out.goes_ahead = false;
  }
  return out;
}
