/* De zuivere regels achter de hook ww-guards. Draait zonder Directus. */
import { describe, expect, it } from "vitest";
import {
  providerStatusError,
  sessionDefaults,
  sessionShapeError,
  sessionUpdateError,
  workshopStatusError,
} from "../extensions/directus-extension-ww-guards/rules.mjs";

describe("workshopstatus door de workshopgever", () => {
  it.each([
    ["draft", "pending_review"],
    ["published", "paused"],
    ["paused", "published"],
    ["draft", "draft"],
    ["draft", undefined],
  ])("%s -> %s mag", (from, to) => expect(workshopStatusError(from, to)).toBeNull());

  it.each([
    ["draft", "published"],
    ["pending_review", "published"],
    ["pending_review", "draft"],
    ["published", "archived"],
    ["paused", "draft"],
  ])("%s -> %s mag niet", (from, to) => expect(workshopStatusError(from, to)).toBeTruthy());
});

describe("profielstatus", () => {
  it("tonen en pauzeren mag, publiceren niet", () => {
    expect(providerStatusError("published", "paused")).toBeNull();
    expect(providerStatusError("paused", "published")).toBeNull();
    expect(providerStatusError("draft", "published")).toBeTruthy();
  });
});

const start = "2026-11-21T14:00:00.000Z"; /* za 21 nov, 15:00 in Amsterdam */
const base = { starts_at: start, ends_at: "2026-11-21T17:00:00.000Z", capacity: 8, min_participants: 4, decision_at: "2026-11-20T21:00:00.000Z" };

describe("vorm van een datum", () => {
  it("accepteert de datum van Luca (beslismoment 17 uur ervoor)", () => {
    expect(sessionShapeError(base)).toBeNull();
  });

  it.each([
    ["eindtijd voor begintijd", { ends_at: "2026-11-21T13:00:00.000Z" }],
    ["maximum 0", { capacity: 0 }],
    ["minimum boven maximum", { min_participants: 9 }],
    ["minimum zonder beslismoment", { decision_at: null }],
    ["beslismoment na de start", { decision_at: "2026-11-21T15:00:00.000Z" }],
    ["beslismoment gelijk aan de start", { decision_at: start }],
    ["beslismoment zonder minimum", { min_participants: null }],
    ["geen begintijd", { starts_at: null }],
  ])("weigert: %s", (_, patch) => expect(sessionShapeError({ ...base, ...patch })).toBeTruthy());
});

describe("datum aanmaken", () => {
  it("zonder minimum: gaat altijd door, vanaf aanmaken", () => {
    const now = new Date("2026-11-09T10:00:00Z");
    expect(sessionDefaults({ starts_at: start }, 180, now)).toEqual({
      ends_at: "2026-11-21T17:00:00.000Z",
      state: "confirmed",
      confirmed_at: now.toISOString(),
      decision_at: null,
    });
  });

  it("met minimum: verzamelt", () => {
    expect(sessionDefaults({ starts_at: start, ends_at: base.ends_at, min_participants: 4 }, 180)).toEqual({ state: "open" });
  });

  it("eindtijd over de wisseling naar wintertijd heen", () => {
    /* 25 okt 2026 01:00 UTC is 03:00 zomertijd -> 02:00 wintertijd. Duur blijft 3 uur echte tijd. */
    const d = sessionDefaults({ starts_at: "2026-10-25T00:30:00.000Z" }, 180);
    expect(d.ends_at).toBe("2026-10-25T03:30:00.000Z");
  });
});

describe("datum wijzigen", () => {
  const confirmed = { ...base, state: "confirmed" };

  it("een datum die doorgaat ligt vast", () => {
    for (const patch of [{ starts_at: "2026-11-22T14:00:00.000Z" }, { capacity: 10 }, { min_participants: 3 }, { decision_at: "2026-11-19T21:00:00.000Z" }]) {
      expect(sessionUpdateError(confirmed, patch, { member: true })).toBeTruthy();
      expect(sessionUpdateError(confirmed, patch, { member: false })).toBeTruthy();
    }
  });

  it("dezelfde waarde opnieuw sturen is geen wijziging", () => {
    expect(sessionUpdateError(confirmed, { starts_at: "2026-11-21T15:00:00+01:00", capacity: 8 }, { member: true })).toBeNull();
  });

  it("zonder minimum ligt niets vast", () => {
    const always = { ...base, min_participants: null, decision_at: null, state: "confirmed" };
    expect(sessionUpdateError(always, { capacity: 10 }, { member: true })).toBeNull();
  });

  it("de workshopgever annuleert alleen een datum die doorgaat", () => {
    expect(sessionUpdateError(confirmed, { state: "cancelled_by_provider" }, { member: true })).toBeNull();
    expect(sessionUpdateError({ ...base, state: "open" }, { state: "cancelled_by_provider" }, { member: true })).toBeTruthy();
    expect(sessionUpdateError({ ...base, state: "open" }, { state: "confirmed" }, { member: true })).toBeTruthy();
    expect(sessionUpdateError({ ...base, state: "open" }, { state: "confirmed" }, { member: false })).toBeNull();
  });

  it("een datum die niet doorgaat is niet meer te wijzigen", () => {
    expect(sessionUpdateError({ ...base, state: "not_happening" }, { capacity: 6 }, { member: true })).toBeTruthy();
  });

  it("verzamelen: verschuiven mag, binnen de regels", () => {
    const open = { ...base, state: "open" };
    expect(sessionUpdateError(open, { starts_at: "2026-11-28T14:00:00.000Z", ends_at: "2026-11-28T17:00:00.000Z", decision_at: "2026-11-27T21:00:00.000Z" }, { member: true })).toBeNull();
    expect(sessionUpdateError(open, { starts_at: "2026-11-20T14:00:00.000Z" }, { member: true })).toBeTruthy();
  });
});
