import { expect, test } from "@playwright/test";
import { acceptCookies } from "./visual";

/* docs/02: .stage is een container (container-type: inline-size). Controleer
   dat position: fixed daarbinnen nog aan het venster vastzit; de bestaande
   pagina's hebben lades en balken die dat nodig hebben. */
test("position: fixed werkt binnen .stage", async ({ page }) => {
  await acceptCookies(page);
  await page.setViewportSize({ width: 390, height: 700 });
  await page.goto("/dev/shell?fixture=ref");
  const top = await page.evaluate(async () => {
    const el = document.createElement("div");
    el.style.cssText = "position:fixed;top:0;left:0;width:10px;height:10px";
    document.querySelector(".stage main")!.appendChild(el);
    document.querySelector<HTMLElement>(".stage main")!.style.minHeight = "3000px";
    window.scrollTo(0, 1500);
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    return el.getBoundingClientRect().top;
  });
  expect(top).toBe(0);
});
