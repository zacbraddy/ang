---
title: Project structure
shortDescription: What ships (src/), how this repo runs Ang on itself through symlinks, and where everything else lives
tags: [repo-structure, tech-stack]
---
# Project structure

## Summary
`src/` is the Ang that ships. The root `.claude/` entries are symlinks into `src/.claude/`, so this repo runs on the same files it ships. The root `project-context/` is this repo's own library and is never shipped. Taken from the tracked tree on 2026-11-13 (`git ls-files`, `src/.claude/scripts/`).

## Layout
| Path | What it is |
|---|---|
| `src/.claude/skills/` | One folder per workflow command (`/ideate`, `/retro`, …), each with a `SKILL.md` |
| `src/.claude/agents/` | Subagents: `context-scout`, `prioritiser`, `stage-gate` |
| `src/.claude/rules/` | Always-on rules, e.g. `context-library.md` |
| `src/.claude/ang/features/<key>/` | Optional features (`intent`, `streams`, `host`): `feature.mjs`, `rule.md`, `steps/`, `agents/`, `conventions.md` |
| `src/.claude/scripts/ang-context-manager.mjs` | The library CLI (command-line tool). Its modules are in `scripts/ang/`: `commands/`, `library/`, `items/`, `triggers/`, `config/` |
| `src/.claude/settings.json` | Hooks (SessionStart banner, SubagentStart, reindex after edits) and permissions |
| `src/.claude/ang.json` | Feature config |
| `src/project-context/README.md` | The library conventions doc that ships to users |
| `src/docs/procedures/` | User-facing how-tos, e.g. running streams in Orca |
| `.claude/*` (root) | Symlinks into `src/.claude/`, so this repo dogfoods Ang |
| `project-context/` (root) | This repo's own context library. It has no `README.md`: the conventions are in `src/project-context/README.md` |
| `workflow-improvements/` | Raised workflow-improvement docs (empty at bootstrap) |
| `LICENSE`, `README.md` | MIT licence and the repo README |

## Dragons
- Because of the symlinks, editing `.claude/` edits the product itself. That includes `.claude/ang.json`, so this repo's own feature config is the default that ships.
- The root `.claude/output-styles` symlink is tracked, but its target, `src/.claude/output-styles/`, was untracked at bootstrap.

## Related
| Doc | Why |
|---|---|
| [ADR 0001: Claude Code harness, Orca optional](/project-context/10k/technical/adrs/0001-claude-code-harness-orca-optional.md) | Why everything lives under `.claude/` |
| [ADR 0002: Zero-dependency library script](/project-context/10k/technical/adrs/0002-zero-dependency-library-script.md) | Why there is no `package.json` |
| [What Ang is](/project-context/10k/product/what-ang-is.md) | What these files add up to |
