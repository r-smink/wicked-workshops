import { beforeEach, describe, expect, it } from "vitest";
import { allowed, hit, resetRateLimits } from "./rate-limit";

beforeEach(() => resetRateLimits());

describe("rate limiting", () => {
  it("laat tot de limiet door en daarna niet meer, tot het venster om is", () => {
    const opts = { limit: 3, windowMs: 1000, now: 0 };
    expect([hit("a", opts), hit("a", opts), hit("a", opts), hit("a", opts)]).toEqual([true, true, true, false]);
    expect(hit("a", { ...opts, now: 1001 })).toBe(true);
  });

  it("telt elke sleutel apart, en alle moeten binnen de limiet blijven", () => {
    const opts = { limit: 1, windowMs: 1000, now: 0 };
    expect(allowed(["ip:1", "mail:x"], opts)).toBe(true);
    expect(allowed(["ip:2", "mail:x"], opts)).toBe(false);
  });
});
