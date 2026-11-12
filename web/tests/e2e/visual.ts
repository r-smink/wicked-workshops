import type { Page } from "@playwright/test";

/* Geen cookiebanner over de pagina tijdens tests, en altijd de lichte modus.
   (De pixelvergelijking met reference/pages is vervallen met die map; de
   voorkant wordt vergeleken met wicked-handoff/design, zie voorkant.spec.ts.) */
export async function acceptCookies(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem("ww-consent", JSON.stringify({ version: 1, analytics: false, marketing: false, date: "2026-01-01" }));
    localStorage.setItem("ww-theme", "light");
  });
}
