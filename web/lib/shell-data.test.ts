import { describe, expect, it } from "vitest";
import { FALLBACK_SHELL, toAnnounce, visibleOccasions } from "./shell-data";

describe("visibleOccasions", () => {
  it("laat Cadeau en Familie weg (docs/12)", () => {
    const out = visibleOccasions([
      { name: "Date", slug: "date" },
      { name: "Cadeau", slug: "cadeau" },
      { name: "Familie", slug: "familie" },
      { name: "Teamuitje", slug: "teamuitje" },
    ]);
    expect(out.map((o) => o.slug)).toEqual(["date", "teamuitje"]);
  });

  it("valt terug op de gelegenheden uit het ontwerp", () => {
    expect(visibleOccasions(null)).toEqual(FALLBACK_SHELL.occasions);
    expect(visibleOccasions([])).toEqual(FALLBACK_SHELL.occasions);
  });
});

describe("toAnnounce", () => {
  it("geeft null zonder tekst, zodat de tekst uit het ontwerp verschijnt", () => {
    expect(toAnnounce(null)).toBeNull();
    expect(toAnnounce({ announcement_bar: "  ", announcement_highlight: null })).toBeNull();
  });

  it("zet het vette deel voorop en de rest erachter", () => {
    expect(toAnnounce({ announcement_highlight: "Nieuw.", announcement_bar: "De pilot is begonnen.", announcement_link: "/hulp" }))
      .toEqual({ highlight: "Nieuw.", text: "De pilot is begonnen.", href: "/hulp" });
  });

  it("maakt zonder vet deel de hele tekst vet, zodat hij op mobiel blijft", () => {
    expect(toAnnounce({ announcement_bar: "Alleen tekst" })).toEqual({ highlight: "Alleen tekst", text: "", href: null });
  });
});
