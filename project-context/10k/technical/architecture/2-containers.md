---
title: C4 level 2, containers
shortDescription: Ang's containers split into committed, team-wide ones and gitignored, per-user ones, and how Claude Code and the script use each
tags: [repo-structure, tech-stack]
---
# C4 level 2: containers

## Summary
Ang's containers split into **committed, team-wide** ones (what ships, plus the project's `ang.json` and the library) and **gitignored, per-user** ones that only `/tailor-ang` writes. Claude Code loads skills, agents, rules, styles and settings directly. Hooks in `settings.json` call the one script, which merges the two config files, imports the feature modules and manages the library. Here a "container" is a separately loaded unit, so a group of files Claude Code loads together counts as one. Drawn from `src/.claude/` as of 2026-11-16.

## Diagram
```mermaid
C4Container
  title Ang: containers
  Person(pilot, "Pilot or teammate")
  System_Ext(cc, "Claude Code")
  System_Ext(git, "Git")

  Container_Boundary(committed, "Committed (team-wide)") {
    Container(skills, "Skills", "Markdown", "One per workflow command")
    Container(agents, "Agents", "Markdown", "context-scout, prioritiser, stage-gate")
    Container(rules, "Shipped rules", "Markdown", "context-library.md, engineering-defaults.md")
    Container(styles, "Output styles", "Markdown", "Five canned styles; Partner In Crime is the default")
    Container(settings, "settings.json", "JSON", "Hooks, permissions, default outputStyle")
    Container(script, "ang-context-manager.mjs", "Node ESM, built-ins only", "Library, state, triggers, validate, session banner")
    Container(features, "Feature modules", "Node ESM + Markdown", "intent, streams, host, pilot")
    ContainerDb(angjson, "ang.json (repo root)", "JSON", "Project keys: intent, streams")
    ContainerDb(library, "project-context/", "Markdown + JSON", "The context library")
    ContainerDb(gitignore, ".gitignore", "Text", "Covers every *.local file")
  }

  Container_Boundary(local, "Gitignored (per user)") {
    ContainerDb(localjson, "ang.local.json", "JSON", "LOCAL_KEYS only: host, pilot")
    ContainerDb(localsettings, ".claude/settings.local.json", "JSON", "outputStyle choice")
    ContainerDb(pilotrule, ".claude/rules/pilot.local.md", "Markdown", "Identity, stack, solo or team")
    ContainerDb(localstyle, ".claude/output-styles/*.local.md", "Markdown", "Custom style from the interview")
  }

  Rel(pilot, cc, "Runs commands")
  Rel(cc, skills, "Runs")
  Rel(cc, agents, "Spawns")
  Rel(cc, rules, "Loads")
  Rel(cc, pilotrule, "Loads")
  Rel(cc, styles, "Loads")
  Rel(cc, localstyle, "Loads")
  Rel(cc, settings, "Reads hooks, default style")
  Rel(cc, localsettings, "Reads, beats settings.json")
  Rel(settings, script, "Hooks: session banner, session subagent, library index")
  Rel(script, angjson, "Reads")
  Rel(script, localjson, "Reads LOCAL_KEYS")
  Rel(script, features, "Imports")
  Rel(script, library, "Indexes, validates")
  Rel(script, git, "check-ignore; streams branch")
  Rel(skills, script, "Calls")
  Rel(skills, library, "Read and write docs")
  Rel(skills, angjson, "bootstrap-repo writes")
  Rel(skills, localjson, "tailor-ang writes")
  Rel(skills, localsettings, "tailor-ang writes")
  Rel(skills, pilotrule, "tailor-ang writes")
  Rel(skills, localstyle, "tailor-ang writes")
  Rel(skills, gitignore, "tailor-ang appends")
```

## Containers
| Container | What it holds |
|---|---|
| Skills, agents | Workflow commands and the three subagents. Prose, run by Claude Code |
| Shipped rules | Always-on, team-neutral guidance. `pilot.local.md` adds to it, never overrides it |
| Output styles | Five canned styles, tracked. `settings.json` names Partner In Crime |
| Script | The one CLI, wired into hooks ([ADR 0002](/project-context/10k/technical/adrs/0002-zero-dependency-library-script.md)) |
| Feature modules | Optional behaviour, invisible when off. A feature's rule is `rule.md` or `rule(value)` ([ADR 0004](/project-context/10k/technical/adrs/0004-pilot-identity-hook-injected.md)) |
| `ang.json`, `ang.local.json` | Project config plus a per-user overlay limited to `LOCAL_KEYS` ([ADR 0003](/project-context/10k/technical/adrs/0003-per-user-config-overlay.md)) |
| `project-context/` | The library: `10k/` plus in-flight stage folders |
| Per-user files | Written only by `/tailor-ang`, previewed first, and covered by unanchored `.gitignore` patterns |

## Related
- [Context](1-context.md)
- [Project structure](/project-context/10k/technical/project-structure.md)
