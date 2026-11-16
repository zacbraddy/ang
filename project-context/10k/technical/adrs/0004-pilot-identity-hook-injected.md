---
title: "ADR 0004: Pilot identity is hook-injected, never templated"
shortDescription: The pilot's name reaches agents through the optional pilot feature's rule(value) at session and subagent start; shipped files never contain a name
tags: [tech-stack, brand-voice]
---
# ADR 0004: Pilot identity is hook-injected, never templated

## Summary
The pilot (the person running Ang) is named through the optional `pilot` feature. It is set per user in `ang.local.json` and injected into every session and subagent by the existing SessionStart and SubagentStart hooks. Skills, agents and rules keep saying "me" or "the user" and never contain a literal name. To make this work, a feature may export `rule(value)` in place of a static `rule.md`. Drawn from `src/.claude/ang/features/pilot/feature.mjs` and `features.mjs` as of 2026-11-16.

## Context
Being addressed by name makes sessions flow better, but Ang ships to many users and to teams. Templating a name into skills would need a render step, it would fork every install, and it would leak one person's name into tracked files.

## Decision
- `pilot` is an optional feature: `null` means off. Its rule is generated from the configured value by `rule(value)`, which tells agents that "me", "I" and "the user" mean the pilot.
- `featureRule` in `features.mjs` prefers `rule(value)` over `rule.md`. That is the only change to the feature contract.
- `pilot` is a `LOCAL_KEY` ([ADR 0003](/project-context/10k/technical/adrs/0003-per-user-config-overlay.md)), so the name lives only in a gitignored file.

## Consequences
- New skills and agents need no name handling. They write "me" or "the user" as before.
- Any feature whose guidance depends on its config value can use `rule(value)`.
- `git grep -il <name> -- src/` must stay empty. In this repo, gitignored local files sit physically under `src/` through the symlinks, so check tracked files only.

## Standing
2026-11-16. Built: `features/pilot/` (promoted unchanged from the shaping spike), `featureRule` and `onRules` in `features.mjs`, with unit tests. This repo's banner reads `pilot (Zac)`.

## Related
| Doc | Why |
|---|---|
| [ADR 0003: Per-user config overlay](/project-context/10k/technical/adrs/0003-per-user-config-overlay.md) | Where the name is stored |
| [Project structure](/project-context/10k/technical/project-structure.md) | Where features live |
| [What Ang is](/project-context/10k/product/what-ang-is.md) | Pilot is configuration, not a core feature |
