---
title: C4 level 4, code for open-source hygiene
shortDescription: Every file this epic adds or changes, its key settings, and the lint findings in the shipped script with the test each regex fix needs first
tags: [open-source, repo-structure, tech-stack]
---
# C4 level 4: code for open-source hygiene

## Summary
This epic adds no new modules or types. Its code level is a set of **config files**, **two workflows** and **ten regex lint findings** in the shipped script. The configs are the components in [level 3](3-components.md), written out as files and keys. The findings come from a probe on 2026-11-23 with `eslint-plugin-regexp` `flat/recommended`: 3 super-linear backtracking, 5 unused capture groups and 2 style fixes. That is two more than shaping counted, because the code has grown since. Story 2 re-runs the lint and fixes whatever it finds, so this table is a starting map, not a fixed list. Behaviour must not change. **No unit test touches `library/frontmatter.mjs` directly**, so its two backtracking fixes need a failing test first.

## Root tooling files (story 1, story 3)
| File | Status | Key contents |
|---|---|---|
| `package.json` | new | `private: true`; `engines.node: ">=26"`; `devDependencies` only; scripts `test` (`node --test 'src/.claude/**/*.test.mjs' 'scripts/*.test.mjs'`), `lint` (`eslint .`), `format` (`prettier --write .`), `format:check` (`prettier --check .`), `prepare` (`husky`); `lint-staged`: `*.{js,mjs}` → `eslint --fix`, `prettier --write`; `*.{json,yml,yaml}` → `prettier --write` |
| `package-lock.json` | new | Pins every dev dependency |
| `.node-version` | new | `26` |
| `.gitignore` | changed | Adds `node_modules/` |
| `eslint.config.mjs` | new | `@eslint/js` recommended, `n` flat recommended, `regexp` flat recommended, `eslint-config-prettier` last; `globals.node`; `linterOptions.reportUnusedDisableDirectives: "error"`; ignores from the shared set |
| `.prettierrc.json` | new | `{ "semi": true, "trailingComma": "all" }` |
| `.prettierignore` | new | `docs/`, `project-context/`, `releases/`, `.claude/` (root only), `*.md`, `node_modules/` |
| `.husky/pre-commit` | new | `npx lint-staged` |

## Workflows
| File | Status | Shape |
|---|---|---|
| `.github/workflows/ci.yml` | new | `on: push` to `main` and `pull_request`; one job on `ubuntu-latest`: `actions/checkout`, `actions/setup-node` with `node-version-file: .node-version` and npm cache, `npm ci`, `npm run lint`, `npm run format:check`, `npm test` |
| `.github/workflows/release.yml` | changed | `setup-node`: `node-version: 26` and its comment become `node-version-file: .node-version`. Tests step: `node --test …` becomes `npm test`, and its globbing comment goes, since the globs now live in `package.json`. Nothing else changes |

## Lint findings in the shipped script (story 2)
Paths are under `src/.claude/scripts/ang/`.

| File:line | Rule | Fix | Test first? |
|---|---|---|---|
| `library/frontmatter.mjs:11` | no-super-linear-backtracking | Rewrite the list-item regex so `\s*` and `\s+` can't trade characters | **Yes**: no direct test; add a `frontmatter.test.mjs` covering list items |
| `library/frontmatter.mjs:16` | no-super-linear-backtracking, use-ignore-case | Rewrite the key-value regex the same way; `[A-Za-z]` → `[a-z]` with `i` | **Yes**: same new test file, key-value lines |
| `library/frontmatter.mjs:35` | optimal-quantifier-concatenation | Tighten `[ \t]*-[ \t]+.*` | **Yes**: same file, tags rewrite with a list |
| `upgrade/guides.mjs:22` | no-super-linear-backtracking | Rewrite the moves-entry regex | Check `upgrade/guides.test.mjs` covers a move with and without a note; add the gap first |
| `items/move.mjs:60`, `:77` | no-unused-capturing-group | `(…)` → `(?:…)` inside `.test()` | No: `.test()` ignores groups, so behaviour can't change |
| `triggers/triggers.mjs:33` | no-unused-capturing-group | Same | No |
| `upgrade/apply.mjs:11` | no-unused-capturing-group | Same | No |
| `util.mjs:10` | no-unused-capturing-group | Same | No |

`n` rules may add findings once `eslint-plugin-n` runs with the full config; story 2 fixes them to zero the same way: test first where behaviour could change.

## Shipped prose edits (story 6)
| File | Status | Edit |
|---|---|---|
| `src/.claude/rules/engineering-defaults.md` | changed | Drop "If a repo past spike stage lacks them, flag it once and suggest `/bootstrap-quality`." (d10) |
| `src/.claude/skills/bootstrap-quality/SKILL.md` | changed | Description drops "; flag that instead" (d10) |
| `src/.claude/skills/bootstrap-repo/SKILL.md` | changed | Step 7's founding-only line offers a `/trigger` for `/bootstrap-quality` once code exists; no means nothing is set (d15) |

## Contributor kit files (story 5)
| File | Status |
|---|---|
| `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` | new |
| `.github/PULL_REQUEST_TEMPLATE.md` | new |
| `.github/ISSUE_TEMPLATE/1-open-conversation.md`, `2-feature-request.md` | new (numbered so the chooser lists conversation first) |
| `.github/ISSUE_TEMPLATE/config.yml` | new: `blank_issues_enabled: false`, one `contact_links` entry to Discussions |
| `README.md` | changed: four shields.io badges, a "fork it" section |

## Related
- [Components](3-components.md)
- [Plan: test strategy](../plan.md#test-strategy)
- [ESLint plugins](../origins/open-source-hygiene/shaping-content/eslint-plugins.md)
