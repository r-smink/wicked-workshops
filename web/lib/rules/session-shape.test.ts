import { describe, expect, it } from "vitest";
import { sessionDefaults, sessionShapeError } from "./session-shape";

const NOW = Date.parse("2026-11-10T12:00:00Z");

describe("nieuwe datum", () => {
  it("vraagt een beslismoment voor de start bij een minimum", () => {
    const base = { starts_at: "2026-11-21T14:00:00Z", capacity: 8 };
    expect(sessionShapeError(base, NOW)).toBeNull();
    expect(sessionShapeError({ ...base, min_participants: 4 }, NOW)).toMatch(/beslismoment/);
    expect(sessionShapeError({ ...base, min_participants: 4, decision_at: "2026-11-22T00:00:00Z" }, NOW)).toMatch(/voor de start/);
    expect(sessionShapeError({ ...base, min_participants: 9, decision_at: "2026-11-20T21:00:00Z" }, NOW)).toMatch(/hoger/);
    expect(sessionShapeError({ ...base, starts_at: "2026-11-01T10:00:00Z" }, NOW)).toMatch(/verleden/);
  });

  it("zonder minimum gaat de datum altijd door, eindtijd uit de duur", () => {
    const d = sessionDefaults({ starts_at: "2026-11-21T14:00:00.000Z", capacity: 8 }, 180, new Date(NOW));
    expect(d).toMatchObject({ state: "confirmed", goes_ahead: true, ends_at: "2026-11-21T17:00:00.000Z" });
    expect(sessionDefaults({ starts_at: "2026-11-21T14:00:00Z", capacity: 8, min_participants: 3 }, null).state).toBe("open");
  });
});
