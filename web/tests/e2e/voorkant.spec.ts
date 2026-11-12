import { expect, test, type Page } from "@playwright/test";
import { acceptCookies } from "./visual";

/* Voorkant uit wicked-handoff/design: elke pagina rendert, heeft een h1,
   geeft geen consolefouten en scrolt op 390 px niet horizontaal. Werkt ook
   zonder Directus (CI): dan tonen de pagina's hun lege staat. */

const PAGES = [
  { path: "/", h1: /wicked/i },
  { path: "/nederland/alles", h1: /workshops/i },
  { path: "/workshops-geven", h1: /workshop/i },
  { path: "/ruimte-gezocht", h1: /ruimte/i },
  { path: "/hulp", h1: /hulp/i },
  { path: "/contact", h1: /contact/i },
  { path: "/inloggen", h1: /inloggen/i },
] as const;

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    /* Zonder Directus faalt een enkele afbeelding of fetch; dat is geen fout van de pagina. */
    /* Vercel Analytics en Speed Insights bestaan alleen op Vercel zelf. */
    if (m.type() === "error" && !/Failed to load resource|\/_vercel\//.test(m.text())) errors.push(m.text());
  });
  return errors;
}

for (const width of [1440, 390]) {
  for (const p of PAGES) {
    test(`${p.path} rendert op ${width} px`, async ({ page }) => {
      await acceptCookies(page);
      await page.setViewportSize({ width, height: 900 });
      const errors = collectErrors(page);
      const res = await page.goto(p.path);
      expect(res?.status()).toBe(200);
      await expect(page.locator(".page[data-concept] h1").first()).toHaveText(p.h1);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      expect(errors).toEqual([]);
    });
  }
}

test("onbekende workshop, aanbieder en plaats geven 404", async ({ page }) => {
  for (const path of ["/workshops/bestaat-niet", "/aanbieders/bestaat-niet", "/bestaat-niet/koken-en-bakken"]) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(404);
  }
});

test("oude routes sturen door", async ({ page }) => {
  await page.goto("/word-workshopgever");
  await expect(page).toHaveURL(/\/workshops-geven$/);
  await page.goto("/locatie-gezocht");
  await expect(page).toHaveURL(/\/ruimte-gezocht$/);
});

test("hulp: zoeken filtert de onderwerpen", async ({ page }) => {
  await acceptCookies(page);
  await page.goto("/hulp");
  const search = page.locator("#hulp-d-q");
  await search.fill("annuleren");
  await expect(page.locator(".hulp-d-status")).toContainText(/antwoorden? voor "annuleren"/);
  await search.fill("qqqzzzonzin");
  await expect(page.getByRole("heading", { name: "Geen antwoord gevonden" })).toBeVisible();
});

test("inloggen: rolkeuze wisselt de onderste link zonder script", async ({ page }) => {
  await acceptCookies(page);
  await page.goto("/inloggen");
  await expect(page.locator(".inloggen-d-voor-deelnemer").first()).toBeVisible();
  await page.locator("label[for=inloggen-d-gever]").click();
  await expect(page.locator("p.inloggen-d-voor-gever")).toBeVisible();
  await expect(page.locator("p.inloggen-d-voor-deelnemer")).toBeHidden();
});

test("seo-bestanden bestaan", async ({ request }) => {
  for (const path of ["/robots.txt", "/sitemap.xml", "/llms.txt"]) {
    const res = await request.get(path);
    expect(res.status(), path).toBe(200);
  }
});
