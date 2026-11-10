import { describe, expect, it } from "vitest";
import { landingFor, safeNext } from "./redirect";

describe("redirect na inloggen", () => {
  it("accepteert alleen interne paden", () => {
    expect(safeNext("/boeking/beheer?code=WW-1")).toBe("/boeking/beheer?code=WW-1");
    expect(safeNext("//evil.nl")).toBeNull();
    expect(safeNext("https://evil.nl")).toBeNull();
    expect(safeNext("/\\evil.nl")).toBeNull();
    expect(safeNext(null)).toBeNull();
  });

  it("valt terug op de context", () => {
    expect(landingFor({ context: "provider" })).toBe("/dashboard");
    expect(landingFor({ context: "participant" })).toBe("/");
    expect(landingFor({ next: "/zoeken", context: "provider" })).toBe("/zoeken");
  });
});
