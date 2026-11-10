/* ===========================================================================
   Regels rond een aanmelding na het boeken: annuleren, verzetten, een
   andere datum aanbieden, klacht, review en no-show (docs/05 §4-8).

   Puur en zonder afhankelijkheden: routes, pagina's en de cron gebruiken
   dezelfde functies, en de tests ook. Tijden in ms of ISO-strings.
   =========================================================================== */

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const ms = (iso: string | null | undefined): number | null => {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? null : t;
};

/* ---------- annuleerregeling ---------- */

export type PolicyRow = {
  key: string;
  free_until_hours_before: number | null;
  penalty_percent_after: number | null;
  reschedule_free?: boolean | null;
};

/* Zoals in directus/seed/reference.mjs, voor als Directus de regeling niet
   meegeeft. De bron blijft de collection cancellation_policies. */
export const DEFAULT_POLICIES: Record<string, PolicyRow> = {
  basis: { key: "basis", free_until_hours_before: 48, penalty_percent_after: 50, reschedule_free: true },
  soepel: { key: "soepel", free_until_hours_before: 24, penalty_percent_after: null, reschedule_free: true },
  vast: { key: "vast", free_until_hours_before: 168, penalty_percent_after: 50, reschedule_free: true },
};

export function resolvePolicy(policy: PolicyRow | string | null | undefined): PolicyRow {
  if (policy && typeof policy === "object" && policy.key) {
    const fallback = DEFAULT_POLICIES[policy.key] ?? DEFAULT_POLICIES.basis!;
    return {
      key: policy.key,
      free_until_hours_before: policy.free_until_hours_before ?? fallback.free_until_hours_before,
      penalty_percent_after: policy.penalty_percent_after ?? null,
      reschedule_free: policy.reschedule_free ?? true,
    };
  }
  const key = typeof policy === "string" ? policy : "basis";
  return DEFAULT_POLICIES[key] ?? DEFAULT_POLICIES.basis!;
}

/* Tot wanneer annuleren gratis is (ISO), of null zonder gratis termijn. */
export function freeUntil(policy: PolicyRow, startsAt: string | null | undefined): string | null {
  const start = ms(startsAt);
  if (start == null || policy.free_until_hours_before == null) return null;
  return new Date(start - policy.free_until_hours_before * HOUR).toISOString();
}

export type CancellationQuote = {
  allowed: boolean;
  free: boolean;
  /* Percentage uit de regeling; altijd opgeslagen in cancel_fee_percent. */
  feePercent: number;
  /* Wat de deelnemer terugkrijgt, in centen. */
  refundCents: number;
  freeUntil: string | null;
};

/* Wat kost annuleren nu? Annuleren kan tot de start (docs/05 §5).
   pilotFullRefund: platform_settings.pilot_full_refund_on_cancel. Dan krijgt
   de deelnemer altijd alles terug, maar het percentage wordt wel berekend. */
export function cancellationQuote({
  policy, startsAt, paidCents, now = Date.now(), pilotFullRefund = true,
}: {
  policy: PolicyRow; startsAt: string | null | undefined; paidCents: number; now?: number; pilotFullRefund?: boolean;
}): CancellationQuote {
  const start = ms(startsAt);
  const deadline = freeUntil(policy, startsAt);
  const allowed = start != null && now < start;
  const free = deadline != null && now <= (ms(deadline) ?? 0);
  const feePercent = free ? 0 : Math.max(0, Math.min(100, policy.penalty_percent_after ?? 0));
  const paid = Math.max(0, Math.round(paidCents || 0));
  const refundCents = pilotFullRefund ? paid : Math.round((paid * (100 - feePercent)) / 100);
  return { allowed, free, feePercent, refundCents: allowed ? refundCents : 0, freeUntil: deadline };
}

/* ---------- datums kiezen ---------- */

export type SessionLike = {
  id: string;
  starts_at: string | null;
  ends_at?: string | null;
  state?: string | null;
  status?: string | null;
  capacity?: number | null;
  seats_taken?: number | null;
  goes_ahead?: boolean | null;
  provider_override?: boolean | null;
  is_private?: boolean | null;
  price_override?: string | number | null;
};

const CLOSED_STATES = ["not_happening", "cancelled_by_provider"];

export function freeSeats(s: SessionLike): number {
  return Math.max(0, (s.capacity ?? 0) - (s.seats_taken ?? 0));
}

export function sessionGoesAhead(s: SessionLike): boolean {
  return s.state === "confirmed" || Boolean(s.goes_ahead) || Boolean(s.provider_override);
}

function bookable(s: SessionLike, participants: number, earliest: number): boolean {
  const start = ms(s.starts_at);
  return (
    start != null &&
    start >= earliest &&
    !CLOSED_STATES.includes(s.state ?? "") &&
    s.status !== "cancelled" &&
    !s.is_private &&
    freeSeats(s) >= participants
  );
}

/* Datums waar een deelnemer naartoe kan verzetten (docs/05 §4): dezelfde
   workshop, in de toekomst, niet gesloten, genoeg plek, zelfde prijs per
   persoon (anders klopt de betaling niet meer). Op volgorde van datum. */
export function rescheduleTargets(
  sessions: SessionLike[],
  { currentId, participants, unitPrice, now = Date.now() }: { currentId: string | null; participants: number; unitPrice: number | null; now?: number },
): SessionLike[] {
  return sessions
    .filter((s) => s.id !== currentId && bookable(s, participants, now))
    .filter((s) => unitPrice == null || s.price_override == null || Number(s.price_override) === unitPrice)
    .sort((a, b) => (ms(a.starts_at) ?? 0) - (ms(b.starts_at) ?? 0));
}

/* De datum die we aanbieden als een datum niet doorgaat (docs/05 §7,
   docs/12): de eerstvolgende datum van dezelfde workshop die doorgaat,
   niet vol is en minstens minHoursAhead uur vooruit ligt. */
export function pickOfferSession(
  sessions: SessionLike[],
  { currentId, participants, unitPrice, now = Date.now(), minHoursAhead = 48 }:
  { currentId: string | null; participants: number; unitPrice: number | null; now?: number; minHoursAhead?: number },
): SessionLike | null {
  const earliest = now + minHoursAhead * HOUR;
  return rescheduleTargets(sessions, { currentId, participants, unitPrice, now: earliest })
    .find((s) => sessionGoesAhead(s)) ?? null;
}

/* Tot wanneer een aanbod geldt: expiresDaysBefore dagen voor de aangeboden
   datum. Ligt dat te dichtbij (minder dan 24 uur van nu), dan halverwege
   tussen nu en de start, zodat er altijd tijd is om te reageren. */
export function offerExpiresAt(offerStartsAt: string, { expiresDaysBefore = 7, now = Date.now() } = {}): string {
  const start = ms(offerStartsAt) ?? now;
  const planned = start - expiresDaysBefore * DAY;
  const at = planned >= now + DAY ? planned : now + Math.max(HOUR, (start - now) / 2);
  return new Date(Math.min(at, start)).toISOString();
}

/* ---------- escrow ---------- */

export function escrowUntilFor(endsAt: string | null | undefined, startsAt: string | null | undefined, delayHours: number): string | null {
  const end = ms(endsAt) ?? ms(startsAt);
  if (end == null) return null;
  return new Date(end + delayHours * HOUR).toISOString();
}

/* De escrow mag alleen later worden, nooit vervroegd door verzetten of een
   klacht. Vrijgeven gaat apart (team). */
export function laterOf(a: string | null | undefined, b: string | null | undefined): string | null {
  const x = ms(a);
  const y = ms(b);
  if (x == null) return y == null ? null : new Date(y).toISOString();
  if (y == null) return new Date(x).toISOString();
  return new Date(Math.max(x, y)).toISOString();
}

/* ---------- wat mag nu met deze aanmelding ---------- */

export type BookingLike = {
  status: string;
  payment_status?: string | null;
  escrow_until?: string | null;
  review_written_at?: string | null;
  session?: { starts_at?: string | null; ends_at?: string | null } | null;
};

const ACTIVE = ["confirmed"];
const ATTENDED = ["confirmed", "completed"];

export function canCancel(b: BookingLike, now = Date.now()): boolean {
  const start = ms(b.session?.starts_at);
  return ACTIVE.includes(b.status) && start != null && now < start;
}

export function canReschedule(b: BookingLike, now = Date.now()): boolean {
  return canCancel(b, now);
}

/* Na de start en zolang het geld nog in escrow staat. */
export function complaintWindowOpen(b: BookingLike, { now = Date.now(), delayHours = 168 } = {}): boolean {
  const start = ms(b.session?.starts_at);
  if (start == null || now < start) return false;
  if (![...ATTENDED, "no_show"].includes(b.status)) return false;
  const until = ms(b.escrow_until) ?? ms(escrowUntilFor(b.session?.ends_at, b.session?.starts_at, delayHours));
  return until != null && now < until;
}

export function canReview(b: BookingLike, now = Date.now()): boolean {
  const end = ms(b.session?.ends_at) ?? ms(b.session?.starts_at);
  return ATTENDED.includes(b.status) && end != null && now >= end && !b.review_written_at;
}

export function canMarkNoShow(b: BookingLike, { now = Date.now(), delayHours = 168 } = {}): boolean {
  const start = ms(b.session?.starts_at);
  if (b.status !== "confirmed" || start == null || now < start) return false;
  const until = ms(b.escrow_until) ?? ms(escrowUntilFor(b.session?.ends_at, b.session?.starts_at, delayHours));
  return until != null && now < until;
}

/* ---------- reviews ---------- */

/* Nieuw gemiddelde na een extra review, op 2 decimalen. */
export function nextRating(avg: number | string | null | undefined, count: number | null | undefined, rating: number): { avg: number; count: number } {
  const n = Math.max(0, Number(count) || 0);
  const a = Number(avg) || 0;
  const next = (a * n + rating) / (n + 1);
  return { avg: Math.round(next * 100) / 100, count: n + 1 };
}
