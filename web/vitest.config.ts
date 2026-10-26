import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    include: ["lib/**/*.test.ts", "tests/unit/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
      /* server-only gooit buiten React Server Components; in tests leeg. */
      "server-only": path.resolve(__dirname, "tests/unit/empty.ts"),
    },
  },
});
