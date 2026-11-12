import next from "@next/eslint-plugin-next";
import tsParser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";

const nextRules = {
  ...next.configs.recommended.rules,
  ...next.configs["core-web-vitals"].rules,
};

export default [
  {
    files: ["**/*.{js,jsx,mjs}"],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { "@next/next": next, "react-hooks": reactHooks },
    rules: { ...nextRules, "react-hooks/rules-of-hooks": "error", "react-hooks/exhaustive-deps": "warn" },
  },
  /* TypeScript-bestanden: zelfde Next-regels plus de hooks-regels. Zonder dit
     blok sloeg ESLint alle .ts/.tsx over. */
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { parser: tsParser, parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { "@next/next": next, "react-hooks": reactHooks },
    rules: {
      ...nextRules,
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  { ignores: [".next/**", "node_modules/**", "test-results/**", "next-env.d.ts"] },
];
