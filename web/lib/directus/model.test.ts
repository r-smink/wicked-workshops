import { describe, expect, it } from "vitest";
import {
  bookingStateFromLive,
  bookingStateToLive,
  centsToDecimal,
  levelFromLive,
  locationKindFromLive,
  locationKindToLive,
  participantLabel,
  priceCents,
  workshopStateFromLive,
  workshopStatusToLive,
  type LocationKind,
  type WorkshopState,
} from "./model";
import { DEFAULT_SETTINGS, toPlatformSettings } from "./settings";

describe("workshopstatus", () => {
  it.each<[WorkshopState, string]>([
    ["draft", "draft"],
    ["in_review", "pending_review"],
    ["live", "published"],
    ["hidden", "paused"],
  ])("%s <-> %s", (docs, live) => {
    expect(workshopStatusToLive(docs)).toBe(live);
    expect(workshopStateFromLive(live as never)).toBe(docs);
  });

  it("gearchiveerd telt als weg", () => expect(workshopStateFromLive("archived")).toBe("hidden"));
});

describe("plek", () => {
  it("vertaalt heen en terug", () => {
    for (const k of ["own_place", "participant_home", "company", "online", "seeking"] as LocationKind[]) {
      expect(locationKindFromLive(locationKindToLive(k))).toBe(k);
    }
  });
  it("leeg is eigen plek", () => expect(locationKindFromLive(null)).toBe("own_place"));
});

describe("niveau", () => {
  it("alleen gevorderd vraagt ervaring", () => {
    expect(levelFromLive("advanced")).toBe("some");
    expect(levelFromLive("beginner")).toBe("none");
    expect(levelFromLive("all_levels")).toBe("none");
  });
});

describe("aanmelding", () => {
  it("vertaalt de standen uit docs/03", () => {
    expect(bookingStateFromLive("confirmed")).toBe("confirmed");
    expect(bookingStateFromLive("cancelled_by_customer")).toBe("cancelled");
    expect(bookingStateFromLive("cancelled_by_provider")).toBe("session_cancelled");
    expect(bookingStateFromLive("moved")).toBe("moved");
    expect(bookingStateFromLive("awaiting_payment")).toBeNull();
    expect(bookingStateToLive("cancelled")).toBe("cancelled_by_customer");
    expect(bookingStateToLive("session_cancelled")).toBe("session_cancelled");
  });

  it("toont voornaam plus initiaal (docs/10)", () => {
    expect(participantLabel("Femke", "d")).toBe("Femke D.");
    expect(participantLabel("Sanne", "")).toBe("Sanne");
    expect(participantLabel(null, null)).toBe("Deelnemer");
  });
});

describe("geld", () => {
  it("decimal-string naar centen en terug", () => {
    expect(priceCents("45.00")).toBe(4500);
    expect(priceCents("39.5")).toBe(3950);
    expect(priceCents(52)).toBe(5200);
    expect(priceCents("0.1")).toBe(10);
    expect(priceCents(null)).toBeNull();
    expect(priceCents("")).toBeNull();
    expect(priceCents("abc")).toBeNull();
    expect(centsToDecimal(3950)).toBe("39.50");
  });
});

describe("platform_settings", () => {
  it("zonder rij gelden de standaardkeuzes uit docs/12", () => {
    expect(toPlatformSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(DEFAULT_SETTINGS.features).toEqual({ authSocial: false, venues: false });
    expect(DEFAULT_SETTINGS.enforceMinDecisionLead).toBe(false);
  });

  it("neemt waarden uit Directus over", () => {
    const s = toPlatformSettings({ feature_venues: true, reminder_hours_before_decision: [24], min_hours_decision_before_start: 72 });
    expect(s.features.venues).toBe(true);
    expect(s.reminderHoursBeforeDecision).toEqual([24]);
    expect(s.minHoursDecisionBeforeStart).toBe(72);
    expect(s.pilotNoPayments).toBe(true);
  });
});
