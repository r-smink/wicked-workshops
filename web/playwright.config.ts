import { defineConfig } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT || 3100);

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./test-results/playwright",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    /* Lokaal de geinstalleerde Chrome; in CI de Playwright-Chromium. */
    channel: process.env.CI ? undefined : "chrome",
    colorScheme: "light",
    locale: "nl-NL",
    timezoneId: "Europe/Amsterdam",
    /* Grijstinten-anti-aliasing overal. Chrome kiest anders per laag zelf
       LCD of grijs, en dat geeft pixelverschillen zonder ontwerpverschil. */
    launchOptions: { args: ["--disable-lcd-text"] },
  },
  webServer: {
    command: `npx next start --port ${PORT}`,
    url: `http://localhost:${PORT}/dev/shell`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { ENABLE_DEV_ROUTES: "1" },
  },
});
