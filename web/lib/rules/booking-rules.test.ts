import { describe, expect, it } from "vitest";
import {
  DEFAULT_POLICIES, cancellationQuote, canCancel, canMarkNoShow, canReview, complaintWindowOpen,
  escrowUntilFor, freeUntil, laterOf, nextRating, offerExpiresAt, pickOfferSession, rescheduleTargets, resolvePolicy,
  type SessionLike,
} from "./booking-rules";

const H = 60 * 60 * 1000;
const NOW = Date.parse("2026-11-10T12:00:00Z");
const at = (hours: number) => new Date(NOW + hours * H).toISOString();
const basis = DEFAULT_POLICIES.basis!;

describe("annuleren", () => {
  it("is gratis tot 48 uur vooraf bij de basisregeling", () => {
    const q = cancellationQuote({ policy: basis, startsAt: at(72), paidCents: 9000, now: NOW, pilotFullRefund: false });
    expect(q).toMatchObject({ allowed: true, free: true, feePercent: 0, refundCents: 9000 });
    expect(q.freeUntil).toBe(at(24));
  });

  it("rekent daarna 50 procent, maar de pilot betaalt alles terug", () => {
    const real = cancellationQuote({ policy: basis, startsAt: at(10), paidCents: 9000, now: NOW, pilotFullRefund: false });
    expect(real).toMatchObject({ free: false, feePercent: 50, refundCents: 4500 });
    const pilot = cancellationQuote({ policy: basis, startsAt: at(10), paidCents: 9000, now: NOW, pilotFullRefund: true });
    expect(pilot).toMatchObject({ free: false, feePercent: 50, refundCents: 9000 });
  });

  it("soepel heeft geen kosten na de termijn", () => {
    const q = cancellationQuote({ policy: DEFAULT_POLICIES.soepel!, startsAt: at(5), paidCents: 3000, now: NOW, pilotFullRefund: false });
    expect(q).toMatchObject({ free: false, feePercent: 0, refundCents: 3000 });
  });

  it("kan niet meer na de start", () => {
    const q = cancellationQuote({ policy: basis, startsAt: at(-1), paidCents: 3000, now: NOW });
    expect(q).toMatchObject({ allowed: false, refundCents: 0 });
  });

  it("leest de regeling uit Directus en valt terug op de standaard", () => {
    expect(resolvePolicy({ key: "vast", free_until_hours_before: 100, penalty_percent_after: 25 }).free_until_hours_before).toBe(100);
    expect(resolvePolicy("soepel").free_until_hours_before).toBe(24);
    expect(resolvePolicy(null).key).toBe("basis");
    expect(freeUntil(DEFAULT_POLICIES.vast!, at(200))).toBe(at(32));
  });
});

const session = (id: string, hours: number, extra: Partial<SessionLike> = {}): SessionLike => ({
  id, starts_at: at(hours), ends_at: at(hours + 3), state: "open", capacity: 8, seats_taken: 2, ...extra,
});

describe("andere datum", () => {
  const sessions = [
    session("now", 24, { state: "cancelled_by_provider" }),
    session("soon", 30, { state: "confirmed" }),
    session("full", 60, { state: "confirmed", seats_taken: 8 }),
    session("open", 70),
    session("later", 100, { state: "confirmed" }),
    session("private", 80, { state: "confirmed", is_private: true }),
    session("pricey", 90, { state: "confirmed", price_override: "99.00" }),
  ];

  it("biedt de eerstvolgende doorgaande datum met plek aan, minstens 48 uur vooruit", () => {
    expect(pickOfferSession(sessions, { currentId: "now", participants: 2, unitPrice: 45, now: NOW })?.id).toBe("later");
  });

  it("geeft null als er niets past", () => {
    expect(pickOfferSession(sessions, { currentId: "now", participants: 9, unitPrice: 45, now: NOW })).toBeNull();
  });

  it("laat bij verzetten ook datums zien die nog verzamelen, maar geen volle, verborgen of duurdere", () => {
    const ids = rescheduleTargets(sessions, { currentId: "now", participants: 2, unitPrice: 45, now: NOW }).map((s) => s.id);
    expect(ids).toEqual(["soon", "open", "later"]);
  });

  it("laat een aanbod 7 dagen voor de datum verlopen, of halverwege als dat te dichtbij is", () => {
    expect(offerExpiresAt(at(24 * 20), { now: NOW })).toBe(at(24 * 13));
    expect(offerExpiresAt(at(72), { now: NOW })).toBe(at(36));
  });
});

describe("escrow", () => {
  it("loopt tot einde plus wachttijd", () => {
    expect(escrowUntilFor(at(3), at(0), 168)).toBe(at(171));
    expect(escrowUntilFor(null, at(0), 24)).toBe(at(24));
  });

  it("schuift alleen naar later", () => {
    expect(laterOf(at(10), at(5))).toBe(at(10));
    expect(laterOf(null, at(5))).toBe(at(5));
  });
});

describe("wat mag nu", () => {
  const booking = (status: string, startHours: number, extra = {}) => ({
    status, session: { starts_at: at(startHours), ends_at: at(startHours + 2) }, ...extra,
  });

  it("annuleren alleen voor de start en als de aanmelding bevestigd is", () => {
    expect(canCancel(booking("confirmed", 1), NOW)).toBe(true);
    expect(canCancel(booking("confirmed", -1), NOW)).toBe(false);
    expect(canCancel(booking("moved", 5), NOW)).toBe(false);
  });

  it("klacht vanaf de start tot de escrowdatum", () => {
    expect(complaintWindowOpen(booking("confirmed", 1), { now: NOW })).toBe(false);
    expect(complaintWindowOpen(booking("confirmed", -1), { now: NOW })).toBe(true);
    expect(complaintWindowOpen(booking("completed", -1, { escrow_until: at(-0.5) }), { now: NOW })).toBe(false);
    expect(complaintWindowOpen(booking("no_show", -5), { now: NOW })).toBe(true);
  });

  it("review na afloop, één keer", () => {
    expect(canReview(booking("confirmed", -3), NOW)).toBe(true);
    expect(canReview(booking("confirmed", -1), NOW)).toBe(false);
    expect(canReview(booking("completed", -3, { review_written_at: at(-1) }), NOW)).toBe(false);
  });

  it("no-show markeren na de start, voor de escrowdatum", () => {
    expect(canMarkNoShow(booking("confirmed", -1), { now: NOW })).toBe(true);
    expect(canMarkNoShow(booking("confirmed", 1), { now: NOW })).toBe(false);
    expect(canMarkNoShow(booking("completed", -1), { now: NOW })).toBe(false);
  });

  it("rekent het nieuwe gemiddelde", () => {
    expect(nextRating("4.50", 2, 3)).toEqual({ avg: 4, count: 3 });
    expect(nextRating(null, 0, 5)).toEqual({ avg: 5, count: 1 });
  });
});
