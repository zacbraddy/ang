---
title: Config move, test harness and this repo's own config
shortDescription: Root ang.json plus a gitignored ang.local.json limited to LOCAL_KEYS, the first node:test tests, and this repo's own config replacing the src symlink
tags: [repo-structure, distribution]
status: draft
owner: agent
dependsOn: []
---
# Config move, test harness and this repo's own config

## Summary
Moves Ang's config from `.claude/ang.json` to a committed root `ang.json` plus a gitignored `ang.local.json` that may set only `LOCAL_KEYS` (`host`, `pilot`). The loader is split into a pure `mergeConfig` and a thin IO wrapper (`loadConfig`), driven test-first with the first `node:test` tests. This repo stops symlinking its config from `src/` and gets its own.

## Outcome
A local key other than `host` or `pilot` is dropped, and `validate` warns about it by name. `node --test 'src/.claude/**/*.test.mjs'` passes. Sessions in this repo still show `Ang: intent · host (orca)`, now read from root `ang.json` and `ang.local.json`.

## Done when
- The `mergeConfig` unit tests and the integration tests that spawn the command-line tool pass.
- `src/.claude/ang.json` and the `.claude/ang.json` symlink are gone. Root `ang.json` (`intent: true, streams: false`), a gitignored `ang.local.json` (`host: "orca"`) and a root `.gitignore` exist.
- `library validate` passes in this repo.

## Rough scope
- `paths.mjs`: `CONFIG_FILE` points at root `ang.json`. New `LOCAL_FILE`.
- `config/config.mjs`: `LOCAL_KEYS`, a pure `mergeConfig(shared, local)` returning `{ config, errors, warnings }`, `loadConfig` reduced to reading the files, and the new `bannerLine` wording.
- `commands/session.mjs`: `session features` marks local keys as personal, set by `/tailor-ang`.
- `library/validate.mjs`: prints merge warnings, and warns when `ang.local.json` exists but `git check-ignore` says it isn't ignored.
- `registry.mjs` help text. The intent feature: `bootstrap.default: true` and messages that name the new path. `streams/conventions.md` wording.
- `.gitignore` with unanchored patterns: `ang.local.json`, `settings.local.json`, `*.local.md`.
- Every remaining wording edit from the config-move blast radius doc.

## Links
- [Plan: scope 1–2, approach, test strategy](../plan.md)
- [Config move blast radius](../config-move.md)
- [C4 components](../c4/3-components.md), [C4 code](../c4/4-code.md)

## Related
- [Epic hub](../README.md)
- [02 Pilot feature](02-pilot-feature.md)
- [ADR 0002: Zero-dependency library script](/project-context/10k/technical/adrs/0002-zero-dependency-library-script.md)
