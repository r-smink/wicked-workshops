import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.mjs"],
    testTimeout: 20_000,
    /* Eén Directus, één set testgebruikers: niet parallel. */
    fileParallelism: false,
  },
});
