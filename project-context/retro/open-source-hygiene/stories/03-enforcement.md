---
title: Enforcement
shortDescription: Husky and lint-staged auto-fix on commit, an advisory ci.yml on every PR and push to main, README badges and the Node LTS bump trigger
tags: [open-source, tech-stack, repo-structure]
status: done
owner: agent
dependsOn: [02]
---
# Enforcement

## Summary
Keeps the code clean from here on: the pre-commit hook fixes what it can, and CI reports on every pull request without blocking it.

## Outcome
A commit with a misformatted, lint-fixable `.mjs` file is fixed by the hook before it lands. A pull request to `main` gets a green `ci.yml` run, and the README shows four badges: CI status, licence (MIT), Node `>=26` from `engines`, and latest release.

## Rough scope
- `.husky/pre-commit` running `npx lint-staged`; `lint-staged` config in `package.json` (`eslint --fix`, `prettier --write`).
- `.github/workflows/ci.yml`: `npm ci`, lint, format check, `npm test`, Node from `.node-version`. Advisory: no branch protection or required checks.
- Four shields.io badges in `README.md`.
- Update the [Node LTS bump trigger](/project-context/triggers/node-lts-bump.md) so the yearly bump covers `.node-version`, `engines` and `ci.yml`.

## Done when
- A commit staging a misformatted, lint-fixable `.mjs` file lands formatted and fixed, with no manual step.
- A pull request to `main` gets a green `ci.yml` run, and a push to `main` triggers another.
- The README shows four badges that render (no shields.io error badge): CI status, licence MIT, Node `>=26` and latest release.
- The `node-lts-bump` trigger names `.node-version` and `engines` as the places to bump, uses `npm test`, and no longer mentions `release.yml`'s `node-version`.
- `npm run lint`, `npm run format:check` and `npm test` pass locally, and `ang-context-manager.mjs library validate` is clean.

## Acceptance criteria
- Given a staged `.mjs` file with Prettier and lint-fixable issues, when I commit, then the hook fixes it and the commit holds the fixed version.
- Given a staged `.mjs` file with a lint error ESLint can't fix, when I commit, then the commit stops and shows the error (`--no-verify` still gets past).
- Given a staged `.json` or `.yml` file, when I commit, then Prettier formats it.
- Given only staged `*.md` or `project-context/` files, when I commit, then the hook passes without touching or warning about them.
- Given a pull request to `main` or a push to `main`, when `ci.yml` runs, then it installs with `npm ci` on the Node in `.node-version` and runs lint, format check and tests.
- Given a red `ci.yml` run, when I look at the PR, then nothing blocks merging (no branch protection, no required check).
- Given a fresh clone, when I run `npm ci`, then `prepare` installs the hook.

## Test plan
- **Unit:** none. The hook, the lint-staged config, the workflow and the badges are config and tooling, left untested beyond running them (plan's test strategy, `engineering-defaults.md`).
- **Integration:** one deliberately misformatted, lint-fixable `.mjs` commit on a scratch branch, then the real PR's `ci.yml` run. Both are the plan's success measures.
- **E2E:** none.
- **Manual checks:** a commit with an unfixable lint error stops; a commit staging only `.md` and `project-context/` files passes cleanly; each badge renders on GitHub.
- **Won't test:** lint-staged globs, workflow YAML, badge URLs, the trigger doc.

## Implementation notes
- **Precondition:** the README badges sit on the documentation stream's README rewrite (`stream/documentation`, story `01-readme-rewrite`, done but not merged to `main` on 2026-11-23). Start once it's on `main` and this branch is rebased onto it.
- **package.json** (C4 code: root tooling files): add the `lint-staged` key.
  - `"*.{js,mjs}": ["eslint --fix --no-warn-ignored", "prettier --write"]`
  - `"*.{json,yml,yaml}": "prettier --write"`
  - `--no-warn-ignored` keeps ESLint quiet when a staged file is in the shared ignore set (for example `docs/` once it lands). Prettier already skips `.prettierignore` paths passed explicitly.
  - lint-staged passes file lists to the tools, so this is the one place they're called directly rather than through the npm scripts (C4 components). It runs the same configs, so the behaviour matches.
- **.husky/pre-commit:** the single line `npx lint-staged`. `prepare` is already in place.
- **.github/workflows/ci.yml** (C4 code: workflows):
  - name `CI`, triggered `on: pull_request` and `on: push` to `main`, `permissions: contents: read`, one job on `ubuntu-latest`.
  - Steps: `actions/checkout@v7`, then `actions/setup-node@v7` with `node-version-file: .node-version` and `cache: npm`. Then `npm ci`, `npm run lint`, `npm run format:check`, `npm test`. Use the same action majors as `release.yml`.
  - Advisory only: no branch protection or required checks.
- **README badges:** a row of four shields.io badges between the centred `<h1>` and the bold "**Avoid Navel Gazing.**" line, owner `zacbraddy`, repo `ang`:
  - CI: `github/actions/workflow/status/zacbraddy/ang/ci.yml?branch=main`, linking to the workflow's runs.
  - Licence: `github/license/zacbraddy/ang`, linking to `LICENSE`.
  - Node: `github/package-json/engines-node/zacbraddy/ang`, which reads `engines` from `main`'s `package.json`. shields.io's `node/v` badge reads npm, and Ang isn't published there.
  - Latest release: `github/v/release/zacbraddy/ang` with no `include_prereleases`, linking to the releases page. Until v1.0.0 ships it shows "no releases found"; it fills in by itself at launch.
- **node-lts-bump trigger** (`project-context/triggers/node-lts-bump.md`):
  - Step 2: replace the `release.yml` `node-version` bullet with `.node-version`, which `release.yml` and `ci.yml` read through `node-version-file`. Add `package.json`'s `engines.node`, and drop "if they exist by then" for those two.
  - Step 3: `npm ci && npm test`.
  - "Signs it's already handled": `.node-version` instead of `release.yml`'s `node-version`.
  - Its `triggers.json` entry is unchanged.
- **Edge cases:**
  - `core.hooksPath` (`.husky/_`) is in the git config shared by every worktree. Other stream worktrees without a `.husky/_` folder run no hook. Ones that have run `npm ci` on a branch with `.husky/pre-commit` get it, which is the intent.
  - Shipped Ang is unaffected: `install.sh` copies only `src/` and never runs npm, so `prepare` never runs for installs.
- **Node badge route (deviation):** shields.io's `github/package-json/engines-node` reads a top-level `engines-node` key and shows "not specified". The badge uses shields.io's dynamic JSON badge instead, reading `$.engines.node` from `main`'s raw `package.json`. Same source, same `>=26`.
- **Rebase onto main:** the documentation epic moved `repo-readme` into `execution/documentation/`. Links to it and to the old `shaping/open-source-hygiene/` hub (in both epics, plus the documentation epic's state entries k17 and d12) now point at the execution hubs, and ADR 0002 names both private `package.json` files (root and `docs/`).
- **Hook on `.md`-only commits:** lint-staged prints a one-line "could not find any staged files matching configured tasks" and the commit goes through untouched. That's lint-staged's info line, not a warning.
- **Verified so far:** fixable, unfixable, `--no-verify`, `.md`/`project-context/`-only and `.json`/`.yml` commits on a scratch branch, plus a fresh clone's `npm ci` setting `core.hooksPath`. The green `ci.yml` runs on a pull request and on a push to `main`, and the CI and Node badges rendering, wait on this branch reaching GitHub.
- **Out of scope:** branch protection and required checks (d18); GitHub settings (story 04); CONTRIBUTING's mention of the hook and CI (story 05).

## Review
Lint, format check, `npm test` (200 pass) and `library validate` are clean. `ci.yml`, the hook, the `lint-staged` config, the badges and the trigger edits match the plan and C4.

**Must-fix:** none.

**Should-fix**
- Done-when evidence is incomplete: a green `ci.yml` run on a PR and on a push to `main`, and all four badges rendering, can only happen once the branch is on GitHub (Implementation notes, "Verified so far"). A trigger on the PR's first run would make sure they get checked.

**Nits**
- `README.md:5`: the Node badge's alt text hardcodes `>=26`, but the value is read from `main`. The next LTS bump would leave the alt text stale, and the trigger doesn't list it. Plain `Node` avoids that.
- `c4/4-code.md:14`: the `lint-staged` row lists `eslint --fix` without the `--no-warn-ignored` that the story and `package.json` use.

## Related
- [Plan: scope](../plan.md#scope), [sequencing](../plan.md#sequencing)
- [C4 code: root tooling files](../c4/4-code.md#root-tooling-files-story-1-story-3), [workflows](../c4/4-code.md#workflows)
- [Documentation epic](/project-context/execution/documentation/README.md)
- [Node LTS bump trigger](/project-context/triggers/node-lts-bump.md)
