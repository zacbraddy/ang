---
title: Test runner for the Ang repo
shortDescription: Why the quality kit keeps node:test instead of Vitest, and how a dev-only root package.json sits beside ADR 0002
tags: [open-source, tech-stack]
---
# Test runner for the Ang repo

## Summary
Ang keeps `node:test`, and Vitest is dropped from the quality kit (Zac, 2026-11-16). Tests ship with every install, so they have to run wherever Ang runs, and that means plain Node with no packages. The kit's dev tools (ESLint, Prettier, Husky, lint-staged) sit in a private, dev-only `package.json` at the repo root, which never ships. ADR 0002 gets amended to allow that file when it's built.

## Setup
No spike. The decision came from first-hand facts plus a call already made on another stream.
- The 4 test files (37 tests) sit beside their code under `src/.claude/` and import only Node built-ins: `node:test`, `node:assert/strict`, `node:child_process`, `node:fs`, `node:os` and `node:path`.
- The install-uninstall-update stream decided that the install copies files in, and that tests ship with installs. A local workflow improvement may change shipped scripts, and having the tests on hand lets it run and update them (Zac's call, `stream/install-uninstall-update`, `shaping-content/copy-in-spike.md`).

## Options weighed
| Shape | Effect | Verdict |
|---|---|---|
| A. Keep `node:test` | No test files change. Tests run in any install with Node alone. The root `package.json` holds lint, format and hook tools only | **Chosen** |
| B. Vitest, tests stay beside the code | Every shipped test imports `vitest`, so installs either need Vitest or the install has to strip tests, which contradicts the install stream's decision | Out |
| C. Vitest, tests move to a root `test/` | Nothing test-related ships, so a local workflow improvement has no tests to run. Breaks the "tests beside the code" convention | Out |

## Decision
- **Test runner:** `node:test` and `node:assert`, with tests beside the code. Vitest is out of the kit.
- **Root `package.json`:** `"private": true`, devDependencies only, with an `npm test` script: `node --test 'src/.claude/**/*.test.mjs'`. This also fixes the documented glob that finds 0 tests (k3). The quoted glob needs Node 21 or later.
- **ADR 0002 amendment**, made when the file is built: *shipped code imports Node built-ins only; the repo root may hold a private, dev-only `package.json` for quality tooling, which never ships.* The install's copy list already leaves the repo root out.

## Unknowns surfaced
- ESLint has to lint test files that use `node:test` globals through imports. That's fine for flat config, but check that the plugin set (u5) has no Vitest- or Jest-specific rules switched on.

## Related
- [Hub](../../../README.md)
- [Quality tooling](../ideas-content/quality-tooling.md): the kit decision this narrows
- [ADR 0002: zero-dependency library script](/project-context/10k/technical/adrs/0002-zero-dependency-library-script.md)
- [Project structure](/project-context/10k/technical/project-structure.md): where the test command is documented
