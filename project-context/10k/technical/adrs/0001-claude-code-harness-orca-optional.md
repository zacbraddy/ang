---
title: "ADR 0001: Claude Code is the harness, Orca is an optional host"
shortDescription: Ang targets Claude Code only; Orca support switches on only when configured and detected
tags: [tech-stack]
---
# ADR 0001: Claude Code is the harness, Orca is an optional host

## Summary
Ang is built for Claude Code alone, using skills, subagents, rules, output styles and hooks. Orca is an optional workspace host. Its support is on only when `ang.json` names it *and* the session detects it, so the same repo runs in a plain terminal. This rests on the user's statement of intent (ET 1, evidence tier 1: a primary source) and on `src/.claude/settings.json` and `src/.claude/ang/features/host/feature.mjs`.

## Context
Ang grew up as one developer's daily driver on Claude Code, often run inside Orca worktrees. Supporting several harnesses would add weight that [first principles](/project-context/10k/product/first-principles.md) rule out.

## Decision
- All of Ang is Claude Code primitives under `.claude/`. Session wiring is done by hooks in `settings.json`.
- Host support is a feature (`host`) that owns its commands. It turns on only when `host: "orca"` is set in `ang.json` *and* the environment check passes (`TERM_PROGRAM=Orca` or `ORCA_WORKTREE_ID`).

## Consequences
- Other harnesses (Codex etc.) are each user's own adaptation, not repo work.
- Host-specific behaviour stays inside `ang/features/host/` and never leaks into skill bodies.

## Standing
2026-11-13. Built: `src/.claude/settings.json` hooks and `features/host/feature.mjs` detection.

## Related
| Doc | Why |
|---|---|
| [Project structure](/project-context/10k/technical/project-structure.md) | Where these files live |
| [What Ang is](/project-context/10k/product/what-ang-is.md) | Scope this decision serves |
