import nextConfig from "eslint-config-next";

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      // Relax rules that are noisy during rapid multi-agent development
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;
