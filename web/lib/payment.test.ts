import { describe, expect, it } from "vitest";
import { merchantReady, paymentEnv } from "./payment";
import { calculateBookingFees } from "./rules/fees";
import { toPolicyKey } from "./cancellation";

describe("paymentEnv", () => {
  it("alleen sandbox en live betalen", () => {
    expect(paymentEnv({ paymentMode: "off" })).toBeNull();
    expect(paymentEnv({ paymentMode: "sandbox" })).toBe("sandbox");
    expect(paymentEnv({ paymentMode: "live" })).toBe("live");
  });
});

describe("merchantReady", () => {
  const live = { opp_merchant_uid: "mer_1", opp_merchant_status: "live", opp_merchant_env: "sandbox" };

  it("vraagt een live merchant in dezelfde omgeving", () => {
    expect(merchantReady(live, "sandbox")).toBe(true);
    expect(merchantReady(live, "live")).toBe(false);
    expect(merchantReady({ ...live, opp_merchant_status: "pending" }, "sandbox")).toBe(false);
    expect(merchantReady({ ...live, opp_merchant_env: null }, "sandbox")).toBe(false);
    expect(merchantReady(null, "sandbox")).toBe(false);
  });
});

describe("calculateBookingFees", () => {
  it("rekent in centen; de deelnemer betaalt geen boekingskosten", () => {
    expect(calculateBookingFees({ priceCents: 4500, participants: 2, commissionPercent: 15 })).toEqual({
      subtotal: 9000, platformFee: 1350, providerAmount: 7650, total: 9000,
    });
  });
});

describe("toPolicyKey", () => {
  it("zet oude annuleersleutels om naar cancellation_policies", () => {
    expect(toPolicyKey("flexible_48h")).toBe("basis");
    expect(toPolicyKey("moderate_7d")).toBe("vast");
    expect(toPolicyKey("strict_none")).toBe("vast");
    expect(toPolicyKey("soepel")).toBe("soepel");
    expect(toPolicyKey({ key: "basis" })).toBe("basis");
    expect(toPolicyKey("onzin")).toBeNull();
    expect(toPolicyKey(null)).toBeNull();
  });
});
