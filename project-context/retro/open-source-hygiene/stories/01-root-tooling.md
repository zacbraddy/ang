---
title: Root tooling
shortDescription: A private, dev-only root package.json with ESLint, Prettier and npm test on node:test, with release.yml and the 10k docs brought in line
tags: [open-source, tech-stack, repo-structure]
status: done
owner: agent
dependsOn: []
---
# Root tooling

## Summary
Adds the repo's dev-only tooling at the root, outside `src/`, so `install.sh` never ships it. `npm test` becomes the single home for the test globs, and `release.yml` uses it.

## Outcome
`npm ci && npm test` passes from a clean clone on Node 26 (the current LTS, long-term support, release). `npm run lint` and `npm run format:check` run; they may still report findings until story 02.

## Rough scope
- `package.json` (`private: true`, `engines.node: ">=26"`, dev dependencies only, scripts `test`, `lint`, `format`, `format:check`, `prepare`), `package-lock.json`, `.node-version` (`26`), `node_modules/` in `.gitignore`.
- `eslint.config.mjs` and `.prettierrc.json` / `.prettierignore` with the shared ignore set.
- `release.yml`: `node-version-file: .node-version` and `npm test`; their stale comments go.
- Amend ADR 0002 (zero-dependency library script) per k10, and update `10k/technical/project-structure.md` (summary, layout table, the test-running dragon and the ADR 0002 row in Related).
- Husky's `prepare` script lands here; the hook itself comes in story 03.

## Done when
- A fresh clone on Node 26 runs `npm ci && npm test` to exit 0 with the same pass count as the raw `node --test` command before the change (183 pass, 0 fail on 2026-11-23).
- `npm run lint` and `npm run format:check` run to completion with no config or load errors. Findings are allowed; a crash is not.
- `eslint .` lints each file under `src/.claude/` once, not again through the root `.claude/` symlinks.
- `git diff main -- .github/workflows/release.yml` shows only the Node version and tests-step changes.
- `install.sh`'s smoke test (`scripts/install.test.mjs`) still passes, so no root file reaches an install.
- ADR 0002 and `project-structure.md` no longer say the repo has no `package.json`, and `ang-context-manager.mjs library validate` is clean.

## Acceptance criteria
- Given a clean clone on Node 26, when I run `npm ci && npm test`, then every `src/.claude/**/*.test.mjs` and `scripts/*.test.mjs` test runs and passes.
- Given a failing test, when I run `npm test`, then it exits non-zero.
- Given Node 24, when I run `npm ci`, then npm warns that `engines.node` wants `>=26`.
- Given the configs, when I run `npm run lint`, then ESLint loads `@eslint/js`, `n`, `regexp` and `eslint-config-prettier` and reports findings without a config error.
- Given `docs/`, `project-context/`, `releases/`, root `.claude/`, `node_modules/` or any `*.md`, when lint or format runs, then those paths are skipped.
- Given a `v*` tag push, when `release.yml` runs, then setup-node reads `.node-version` and the tests step runs `npm test` with no `npm ci` step.
- Given an install via `install.sh`, when it copies `src/`, then no `package.json`, config or `node_modules/` lands in the target repo.

## Test plan
- **Unit:** none new. The configs, scripts and workflow are config, which the plan's test strategy and `engineering-defaults.md` leave untested beyond running them.
- **Integration:** the existing 183 tests, now run through `npm test`, are the regression guard. `scripts/install.test.mjs` already covers what an install copies.
- **E2E:** none. `release.yml` is only exercised by a tag push; checking it on the next rc (release candidate) cut is the plan's accepted risk.
- **Manual checks:** a clean-clone `npm ci && npm test` on Node 26, plus `npm run lint` and `npm run format:check` run once to prove they load.
- **Won't test:** ESLint and Prettier config contents, `package.json` scripts, `.node-version`, the workflow YAML.

## Implementation notes
- **package.json** (C4 code: root tooling files):
  - `name: "ang"`, `private: true`, `type` left unset since every file is `.mjs`, `engines: { "node": ">=26" }`.
  - devDependencies: `eslint` (10), `@eslint/js`, `eslint-plugin-n`, `eslint-plugin-regexp`, `eslint-config-prettier`, `globals`, `prettier`, `husky`, `lint-staged`. Take the current release of each at install time; the lockfile pins them. Run `supermatt:dependency-vetting` before adding them.
  - scripts: `test`: `node --test 'src/.claude/**/*.test.mjs' 'scripts/*.test.mjs'` (globs quoted so Node expands them and reaches the `.claude` dot folder), `lint`: `eslint .`, `format`: `prettier --write .`, `format:check`: `prettier --check .`, `prepare`: `husky`.
  - Without `.husky/pre-commit`, `prepare` only sets `core.hooksPath`; that is harmless until story 03 adds the hook.
- **eslint.config.mjs:** `defineConfig` from `eslint/config`; `@eslint/js` recommended, `n.configs["flat/recommended-module"]` (the shaping probe's preset; C4's "flat recommended" is shorthand for it), `regexp.configs["flat/recommended"]`, then `eslint-config-prettier/flat` last. `languageOptions.globals: globals.node`, `linterOptions.reportUnusedDisableDirectives: "error"`, `n/no-process-exit` off, `n/prefer-node-protocol` on, plus the shared ignores.
- **Shared ignore set:** `docs/`, `project-context/`, `releases/`, root `.claude/` only (it symlinks into `src/.claude`), `*.md`, `node_modules/`. ESLint takes them as `globalIgnores`; `.prettierignore` lists the same.
- **.prettierrc.json:** `{ "semi": true, "trailingComma": "all" }`.
- **.node-version:** `26`. **.gitignore:** add `node_modules/`.
- **release.yml:** `node-version: 26` and its `k9` comment become `node-version-file: .node-version`. The tests step's `run` becomes `npm test` and its globbing comment goes. Add no `npm ci`; `node:test` needs no install (d16).
- **ADR 0002:** per k10, check `main` first. If the documentation stream's rewrite has merged, only revise its wording to name this root `package.json` and fix the Standing line. Otherwise amend it here: Ang's shipped script stays dependency-free on Node built-ins; the repo itself carries a private, dev-only root `package.json` that never ships. Update Summary, Decision and Standing, and keep it short. Candidate ADR 1 is written later, not here.
- **project-structure.md:** add `package.json`, `package-lock.json`, `.node-version`, `eslint.config.mjs` and the Prettier files to the Summary's root list and the layout table. The test-running dragon becomes "run `npm test`" and keeps the bare-directory warning only if it still helps. Reword the ADR 0002 Related row.
- **Edge cases:** the existing tests must pass unchanged (d7). If `npm test` reports fewer tests than the raw command, the globs are wrong.
- **As built:**
  - ESLint already skips the root `.claude/` symlinked folders without the ignore (checked: 0 files linted through them either way). The ignore stays as the plan's shared set and guards explicit paths such as lint-staged's; ESLint writes it `.claude/` (root-only, as Prettier's `/.claude/` is), since it never matches a leading slash; `*.md` is `**/*.md` in ESLint's `globalIgnores` to match Prettier's anywhere-match.
  - ADR 0002 was amended here: the documentation stream's rewrite hadn't merged to `main` on 2026-11-23. The `project-structure.md` dragon drops the bare-directory warning, since the globs now live only in `package.json`.
  - npm's Node 24 engines warning reads `package: undefined` because the root `package.json` has no `version`; the warning still fires.
  - Husky's `prepare` sets `core.hooksPath` in the git config the worktrees share. No hooks existed before, so nothing is bypassed.
- **Out of scope:**
  - lint and format fixes, the Prettier pass and the shebang-versus-`n` finding (story 02)
  - `.husky/pre-commit`, the `lint-staged` config, `ci.yml`, badges and the `node-lts-bump` trigger update (story 03)

## Review
Done-when evidence holds: clean `npm ci && npm test` on Node 26.13.1 gives 183 pass, 0 fail (install smoke test included); lint (17 findings) and `format:check` (56 files) load and finish; only `eslint.config.mjs` and `src/`/`scripts/` files are linted; `release.yml` differs from `main` only in the two planned steps; every lockfile entry resolves from registry.npmjs.org; `library validate` is clean.

- **Must-fix:** none.
- **Should-fix:** `eslint.config.mjs:14`: ESLint's flat config never matches `"/.claude/"` (`isPathIgnored(".claude/scripts/ang-context-manager.mjs")` is `false`, and `eslint .claude/scripts/ang-context-manager.mjs` lints it). `".claude/"` matches the root folder only, leaving `src/.claude/` linted. `eslint .` passes today only because it doesn't walk symlinked folders, so the "guard" in the As built note (line 63) guards nothing. Fix the pattern and the note.
- **Nit:** `project-context/10k/technical/adrs/0002-zero-dependency-library-script.md:9`: with the new clause in between, "Installing it needs Node 26+" now reads as if "it" were the root `package.json`. Say "Installing Ang".

## Related
- [Plan: scope](../plan.md#scope), [approach](../plan.md#approach), [risks](../plan.md#risks), [test strategy](../plan.md#test-strategy)
- [C4 components](../c4/3-components.md#components)
- [C4 code: root tooling files](../c4/4-code.md#root-tooling-files-story-1-story-3), [workflows](../c4/4-code.md#workflows)
- [ESLint plugins](../origins/open-source-hygiene/shaping-content/eslint-plugins.md), [Node version](../origins/open-source-hygiene/shaping-content/node-version.md)
- [ADR 0002](/project-context/10k/technical/adrs/0002-zero-dependency-library-script.md)
- [Project structure](/project-context/10k/technical/project-structure.md)
