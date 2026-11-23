---
title: "ADR 0011: Dev-only quality tooling and advisory CI"
shortDescription: The Ang repo lints and formats to zero warnings with root-only dev tooling, keeps node:test, and runs CI on every PR and push to main without blocking merges
tags: [tech-stack, repo-structure, open-source]
---
# ADR 0011: Dev-only quality tooling and advisory CI

## Summary
The Ang repo holds its own code to the standards Ang recommends, using tooling that never ships. A private, dev-only root `package.json` carries ESLint, Prettier, Husky and lint-staged. Code stays at zero errors and zero warnings, fixed automatically on commit. Tests stay on `node:test`. CI (continuous integration) runs lint, format check and tests on every pull request and push to `main`, but it only reports: nothing blocks a merge. Drawn from the open-source-hygiene epic as built on 2026-11-23.

## Context
Code that bears Zac's name should meet the bar Ang sets for others, and an open-source repo needs a visible green check. Ang is maintained solo with little free time, so the tooling has to be set-and-forget. Shipped tests run in every install, where only Node is guaranteed.

## Decision
- **Root only.** `package.json` (private, `engines.node >=26`), the lockfile and all configs sit outside `src/`, so `install.sh` never copies them ([ADR 0002](/project-context/10k/technical/adrs/0002-zero-dependency-library-script.md) keeps the shipped script dependency-free).
- **ESLint:** `@eslint/js`, `eslint-plugin-n`, `eslint-plugin-regexp`, `eslint-config-prettier` and `@stylistic/eslint-plugin` with readability rules: padding lines, `curly: all`, `no-nested-ternary`, `no-else-return` and `max-depth` 3. `reportUnusedDisableDirectives` is an error, and the code carries no disable comments. Noisier plugins (unicorn, jsdoc, security, import, promise) were tried and dropped.
- **Prettier** formats JS, JSON and YAML, with semicolons and trailing commas set explicitly. Markdown is ignored by every linter and formatter, along with `docs/`, `project-context/`, `releases/` and the root `.claude/` symlinks.
- **On commit:** Husky runs lint-staged, which applies `eslint --fix` and `prettier --write` to staged files.
- **Tests:** `node:test` only. `npm test` holds the globs, and the tests need no `npm ci`.
- **CI:** `ci.yml` runs `npm ci`, lint, format check and `npm test` on pull requests and pushes to `main`. `release.yml` runs `npm test` only. Both read Node from `.node-version`. There is no branch protection and no rulesets.

## Consequences
- A dev-dependency bump can surface new warnings. The lockfile pins versions, and a red run blocks nothing.
- The yearly Node bump edits `.node-version` and `engines` only ([trigger](/project-context/triggers/node-lts-bump.md)).
- Husky sets `core.hooksPath`, which every worktree shares.
- Pull requests from first-time fork contributors need a maintainer's click before CI runs.

## Standing
2026-11-23. Built: `npm run lint`, `npm run format:check` and `npm test` all pass, and the hook fixes a misformatted file before it lands. The first `ci.yml` run on GitHub comes when the branch merges to `main`.

## Related
| Doc | Why |
|---|---|
| [ADR 0002: Zero-dependency library script](/project-context/10k/technical/adrs/0002-zero-dependency-library-script.md) | Why the tooling stays dev-only |
| [ADR 0007: How releases are cut](/project-context/10k/technical/adrs/0007-how-releases-are-cut.md) | The release job that shares `npm test` |
| [Project structure](/project-context/10k/technical/project-structure.md) | Where the files live |
| [ADR 0012: Contributor templates nudge](/project-context/10k/technical/adrs/0012-contributor-templates-nudge-not-gate.md) | The same no-blocking stance for contributions |
