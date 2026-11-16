---
title: "ADR 0003: Per-user config is a gitignored overlay limited to LOCAL_KEYS"
shortDescription: Root ang.json is committed and project-owned; gitignored ang.local.json may set only host and pilot, and any other key is dropped with a warning
tags: [tech-stack, repo-structure]
---
# ADR 0003: Per-user config is a gitignored overlay limited to LOCAL_KEYS

## Summary
Ang's config is two files at the repo root. `ang.json` is committed and holds the project's feature keys. `ang.local.json` is gitignored and may set only the keys in `LOCAL_KEYS` (`host`, `pilot`). The loader drops any other key in it and `validate` warns about each dropped key, so the merged config is always valid. Drawn from `src/.claude/scripts/ang/config/config.mjs` as of 2026-11-16.

## Context
Some choices belong to the project (whether intent or streams are on) and must hold for everyone in the repo. Others belong to one person (their name, their workspace host) and must never leak into a team's tracked files. One shared file can't serve both.

## Decision
- `ang.json` (root, committed) holds project keys. Ang ships none, and `/bootstrap-repo` writes it.
- `ang.local.json` (root, gitignored, written by `/tailor-ang`) overrides only `LOCAL_KEYS`, a constant in `config.mjs` rather than a per-feature flag.
- The merge is the pure `mergeConfig(shared, local)`. It returns `{ config, errors, warnings }` and takes `undefined` for a missing file. `loadConfig` is a thin IO wrapper that owns file reads and invalid-JSON errors, which are reported with the file named.
- `validate` also warns when `ang.local.json` exists but `git check-ignore` says it isn't ignored. That check stays out of the loader to keep git IO off the session-start hook path.

## Consequences
- A new feature that should be personal joins `LOCAL_KEYS`. Everything else is project-locked by default.
- A user can't override a project key for themselves. Team-controlled overrides are [parked](/project-context/ideas/parked.md).
- The merge rules are unit-tested without temp dirs (`config.test.mjs`).

## Standing
2026-11-16. Built: `LOCAL_KEYS = ['host', 'pilot']`, `mergeConfig` and `loadConfig` in `config.mjs`, with unit and CLI integration tests. This repo's root `.gitignore` covers `ang.local.json`.

## Related
| Doc | Why |
|---|---|
| [ADR 0001: Claude Code harness, Orca optional](/project-context/10k/technical/adrs/0001-claude-code-harness-orca-optional.md) | `host` is one of the local keys |
| [ADR 0004: Pilot identity is hook-injected](/project-context/10k/technical/adrs/0004-pilot-identity-hook-injected.md) | `pilot` is the other |
| [Project structure](/project-context/10k/technical/project-structure.md) | Where the two files live |
