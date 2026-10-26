import next from "@next/eslint-plugin-next";

export default [
  {
    plugins: { "@next/next": next },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs["core-web-vitals"].rules,
    },
  },
  { ignores: [".next/**", "node_modules/**"] },
];
