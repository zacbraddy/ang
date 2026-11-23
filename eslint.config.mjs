import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import n from "eslint-plugin-n";
import regexp from "eslint-plugin-regexp";
import prettier from "eslint-config-prettier/flat";
import globals from "globals";

export default defineConfig([
  // Root .claude/ only: it symlinks into src/.claude, which is linted directly.
  globalIgnores([
    "docs/",
    "project-context/",
    "releases/",
    ".claude/",
    "**/*.md",
    "node_modules/",
  ]),
  js.configs.recommended,
  n.configs["flat/recommended-module"],
  regexp.configs["flat/recommended"],
  {
    languageOptions: { globals: globals.node },
    linterOptions: { reportUnusedDisableDirectives: "error" },
    rules: {
      "n/no-process-exit": "off",
      "n/prefer-node-protocol": "error",
    },
  },
  prettier,
]);
