import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import n from "eslint-plugin-n";
import regexp from "eslint-plugin-regexp";
import stylistic from "@stylistic/eslint-plugin";
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
    plugins: { "@stylistic": stylistic },
    linterOptions: { reportUnusedDisableDirectives: "error" },
    rules: {
      "no-unused-vars": ["error", { ignoreRestSiblings: true }],
      "n/no-process-exit": "off",
      "n/prefer-node-protocol": "error",
      // Readability: one idea per line, shallow nesting, code split into paragraphs.
      "no-nested-ternary": "error",
      "no-else-return": "error",
      "max-depth": ["error", 3],
      "@stylistic/padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: "*", next: "return" },
        { blankLine: "always", prev: ["const", "let"], next: "*" },
        { blankLine: "any", prev: ["const", "let"], next: ["const", "let"] },
        { blankLine: "always", prev: "block-like", next: "*" },
        { blankLine: "always", prev: "directive", next: "*" },
      ],
    },
  },
  prettier,
  // After prettier, which turns curly off; "all" doesn't clash with its formatting.
  { rules: { curly: ["error", "all"] } },
]);
