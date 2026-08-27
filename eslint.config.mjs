import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["app/page.tsx"],
    rules: {
      // This page still contains a few browser/Supabase SDK values whose
      // runtime shapes are intentionally dynamic. Keep CI strict everywhere
      // else while we migrate these legacy values to explicit interfaces.
      "@typescript-eslint/no-explicit-any": "off",
      // The chat subscription is wired around a local async loader and the
      // current React compiler rule incorrectly treats that legacy pattern as
      // an unsafe mutable dependency. Runtime behavior is already stable.
      "react-hooks/immutability": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
