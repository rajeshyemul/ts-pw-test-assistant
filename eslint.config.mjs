import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import customEsLintRules from "./src/customEsLintRules/index.mjs";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "blob-report/**",
      "reports/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.mjs"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
      },
    },
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        module: "readonly",
        require: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
      },
    },
    plugins: {
      custom: customEsLintRules,
    },
    rules: {
      "no-console": "off",
      "custom/no-duplicate-tags": "error",
      "custom/no-internal-action-imports": "error",
      "custom/no-unused-constants": "warn",
      "custom/prevent-duplicate-titles": "error",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["src/support/constants/**/*.ts"],
    rules: {
      "custom/no-unused-constants": "off",
    },
  },
  { files: ["tests/**/*.ts"] },
);
