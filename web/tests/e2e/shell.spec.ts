import { expect, test, type Page } from "@playwright/test";
import {
  acceptCookies, compare, FIX_REFERENCE_LEAKS, HIDE_OUR_ADDITIONS, HIDE_REFERENCE_SCAFFOLDING,
  REFERENCE_FONTS_URL, referenceUrl, USE_REFERENCE_FONTS,
} from "./visual";

/* Fase 0: de shell (aankondiging, header, megamenu, footer) moet er
   hetzelfde uitzien als reference/pages/*.html op 1440 en 390 px.
   Onze pagina gebruikt dezelfde voorbeelddata (?fixture=ref). */

const MAX_DIFF = 0.005; /* 0,5 procent van de pixels, voor anti-aliasing */

const WIDTHS = [1440, 390] as const;

const CASES = [
  { name: "uitgelogd", ours: "/dev/shell?fixture=ref", ref: "dflow-a" },
  { name: "deelnemer", ours: "/dev/shell?fixture=ref&ingelogd=deelnemer", ref: "ddash-b" },
  { name: "workshopgever", ours: "/dev/shell?fixture=ref&ingelogd=workshopgever", ref: "adash-a" },
] as const;

async function open(page: Page, url: string, css: string, referenceFonts = false) {
  await acceptCookies(page);
  await page.goto(url);
  if (referenceFonts) await page.addStyleTag({ url: REFERENCE_FONTS_URL });
  await page.addStyleTag({ content: css });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(["400 16px \"Plus Jakarta Sans\"", "700 16px \"Plus Jakarta Sans\"", "800 16px \"Bricolage Grotesque\""].map((f) => document.fonts.load(f)));
  });
}

for (const width of WIDTHS) {
  for (const c of CASES) {
    test(`shell ${c.name} op ${width}px`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: "light" });
      const ours = await ctx.newPage();
      const ref = await ctx.newPage();
      await open(ours, `http://localhost:${process.env.E2E_PORT || 3100}${c.ours}`, HIDE_OUR_ADDITIONS + USE_REFERENCE_FONTS, true);
      await open(ref, referenceUrl(c.ref), HIDE_REFERENCE_SCAFFOLDING + (FIX_REFERENCE_LEAKS[c.ref] ?? ""));

      const parts = [
        await compare(`${c.name}-${width}-announce`, ours.locator(".announce").first(), ref.locator(".announce").first()),
        await compare(`${c.name}-${width}-header`, ours.locator("header.head").first(), ref.locator("header.head").first()),
        await compare(`${c.name}-${width}-footer`, ours.locator("footer.foot").first(), ref.locator("footer.foot").first()),
      ];

      /* Megamenu alleen waar het zichtbaar is (boven 1200px). */
      if (width > 1200 && c.name === "uitgelogd") {
        await ours.getByRole("button", { name: /Categorie/ }).click();
        await ref.locator("nav.nav button").first().click();
        parts.push(await compare(`${c.name}-${width}-megamenu`, ours.locator(".mm").first(), ref.locator(".mm").first()));
      }

      await ctx.close();
      for (const p of parts) {
        expect.soft(p.sameSize, `${p.name}: ${p.sizes}`).toBe(true);
        expect.soft(p.ratio, `${p.name}: ${(p.ratio * 100).toFixed(2)}% verschil`).toBeLessThan(MAX_DIFF);
      }
    });
  }
}

test("next/font laadt Bricolage Grotesque en Plus Jakarta Sans", async ({ page }) => {
  await acceptCookies(page);
  await page.goto("/dev/shell?fixture=ref");
  const loaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family);
  });
  expect(loaded).toContain("Bricolage Grotesque");
  expect(loaded).toContain("Plus Jakarta Sans");
  const family = await page.locator(".announce").evaluate((el) => getComputedStyle(el).fontFamily);
  expect(family).toMatch(/Plus Jakarta Sans/);
});

test("megamenu sluit op Escape en bij klik buiten", async ({ page }) => {
  await acceptCookies(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/dev/shell?fixture=ref");
  const knop = page.getByRole("button", { name: /Categorie/ });
  const menu = page.locator(".mm").first();
  await knop.click();
  await expect(menu).toBeVisible();
  await expect(knop).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await knop.click();
  await page.mouse.click(700, 800);
  await expect(menu).toBeHidden();
});

test("burger opent het menu op mobiel", async ({ page }) => {
  await acceptCookies(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dev/shell?fixture=ref");
  await page.getByRole("button", { name: "Menu openen" }).click();
  await expect(page.locator(".mnav")).toBeVisible();
  await expect(page.locator(".mnav").getByRole("link", { name: "Koken & bakken" })).toBeVisible();
});
