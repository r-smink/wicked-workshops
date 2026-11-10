import { describe, expect, it } from "vitest";
import { bookingToken, canAccessBooking, newAccessNonce, tokenMatches } from "./access";

describe("beheerlink", () => {
  it("maakt steeds hetzelfde token uit id en nonce", () => {
    const nonce = newAccessNonce();
    const token = bookingToken("b1", nonce)!;
    expect(token).toBe(bookingToken("b1", nonce));
    expect(token).not.toContain(nonce);
    expect(tokenMatches("b1", nonce, token)).toBe(true);
    expect(tokenMatches("b2", nonce, token)).toBe(false);
    expect(tokenMatches("b1", newAccessNonce(), token)).toBe(false);
    expect(tokenMatches("b1", nonce, "")).toBe(false);
    expect(bookingToken("b1", null)).toBeNull();
  });

  it("geeft toegang met het token of als eigen klant", () => {
    const nonce = newAccessNonce();
    const booking = { id: "b1", access_token: nonce, customer: { id: "u1" } };
    expect(canAccessBooking(booking, { token: bookingToken("b1", nonce) })).toBe(true);
    expect(canAccessBooking(booking, { userId: "u1" })).toBe(true);
    expect(canAccessBooking(booking, { userId: "u2" })).toBe(false);
    expect(canAccessBooking({ id: "b1", access_token: null, customer: null }, { token: "x", userId: null })).toBe(false);
  });
});
