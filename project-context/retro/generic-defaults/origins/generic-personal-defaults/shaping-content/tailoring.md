---
title: Tailoring step and per-user config
shortDescription: A re-runnable tailoring command writes per-user settings into gitignored local files in the repo, and bootstrap invokes it
tags: [distribution, repo-structure, brand-voice]
---
# Tailoring step and per-user config

## Summary
Tailoring gets its own re-runnable command, and `/bootstrap-repo` invokes it rather than duplicating it. Everything it writes stays inside the repo, in gitignored `*.local` files, and nothing goes to `~/.claude`. Config moves to the repo root: a committed `ang.json` for project defaults, plus a gitignored `ang.local.json` that may override personal keys only. Output style is a numbered pick from five canned styles (Partner In Crime is the recommended default), with a bounded interview as a sixth option ([canned output styles](../../../output-styles.md)). The per-user intent overlay and a configurable config path were both cut on YAGNI (you aren't gonna need it) grounds. Decided with Zac, 2026-11-16 (ET 1, evidence tier 1: the pilot's own call). Claude Code behaviour comes from Anthropic's docs, read the same day (ET 1 for "documented", untested in practice).

## Why a separate command
`/bootstrap-repo` refuses once `10k/` holds docs. A teammate who joins an existing Ang repo would otherwise have no way to set their name, host or style. A re-runnable tailoring command fills that gap, and bootstrap just calls it, so nothing is duplicated.

## Config: project defaults plus a local overlay
| File | Committed | Holds |
|---|---|---|
| `ang.json` (repo root) | Yes | Project defaults for every feature key |
| `ang.local.json` (repo root) | No (gitignored) | Overrides for personal keys only |

| Key | Scope | Local may override? |
|---|---|---|
| `pilot` | Person | Yes |
| `host` | Person | Yes (detected by the tailoring step) |
| `intent` | Project | No |
| `streams` | Project (it drives branches and worktrees) | No. If it appears in local, validate warns and the value is ignored |

- A `LOCAL_KEYS` constant in the loader enforces the table above: other local keys are dropped and `validate` warns (d13, [config move](../../../config-move.md)).
- Root placement signals to anyone reading the repo that it runs on Ang. `$CLAUDE_PROJECT_DIR` is the project root in hooks, even in worktrees, so the hooks can still find the file (Claude Code hooks docs).
- `host` moves out of bootstrap's feature questions and into the tailoring step.

## Output style
- **Ships:** five canned styles in `.claude/output-styles/`, with Partner In Crime as the default ([canned output styles](../../../output-styles.md)).
- **Project default:** `outputStyle` in `.claude/settings.json`.
- **Personal choice:** the tailoring step writes `outputStyle` to `.claude/settings.local.json`. Local beats shared project settings: "managed, command line, project local, shared project, user" (Claude Code settings docs).
- **Picking one:** one numbered list in a plain message, with Partner In Crime as 1 and recommended, so an empty reply takes the default.
- **Option 6, the interview:** 5 fixed questions, built from scratch (d14). It should take under a minute. It writes a gitignored `.claude/output-styles/<name>.local.md`, then suggests raising a workflow improvement to make that style a canned one.

## Personal rule overlay
- The shipped generic rule stays untouched.
- The tailoring step writes a gitignored personal rule into `.claude/rules/` holding identity, stack and solo-or-team framing.
- **Additive only.** Claude Code gives rules no precedence: "if a user rule and a project rule conflict, Claude may follow either one" (Claude Code memory docs). So the overlay must never restate or contradict the generic rule.

## Gitignore
Claude Code only gitignores `settings.local.json` when it creates the file itself, and then only through the global git excludes file (settings docs). The tailoring step writes files by hand, so it must add its `*.local` paths to the repo's `.gitignore`, creating that file if it's missing. This repo has no root `.gitignore` today.

## Cut or parked
- **Per-user intent garnish:** parked in [parked work](/project-context/ideas/parked.md). It solves for teams, which aren't in the release goal, and it would have pulled in a gitignored doc in `10k/` (index churn), conflict rules and `/retro` changes.
- **Configurable config path:** cut. The pointer would need a fixed home anyway. An `"extends"`-style shared config is the team answer, and it was sent to the docs website item to spike as a documented pattern.
- **Anything under `~/.claude`:** out of scope. Ang is bounded to one repo.

## Related
- [Where the personal line sits](./personal-line.md)
- [Pilot name without templating](./pilot-name.md)
- [Brief](./brief.md)
- [Hub](../../../README.md)
- [Shipped config and defaults](/project-context/retro/generic-defaults/README.md)
- [Docs website](/project-context/ideas/docs-website/README.md)
