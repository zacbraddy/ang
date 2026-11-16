---
title: Generic defaults C4 level 1, context
shortDescription: Who uses Ang after the generic-defaults epic and which outside systems it touches, marked new, changed or existing
tags: [repo-structure, distribution]
---
# Generic defaults C4 level 1: context

## Summary
Ang (the workflow framework) stays a set of files inside one repo, run by Claude Code. The epic changes Ang itself and gives a second person a route in: a teammate who joins an already bootstrapped repo runs `/tailor-ang` to set their own pilot name, host, output style and personal rule, without touching committed files. Git gains a repo `.gitignore` that Ang now writes to. Nothing outside the repo is written (decision d6).

## Diagram
```mermaid
C4Context
  title Generic defaults: system context
  Person(pilot, "Pilot", "EXISTING. Bootstraps a repo with Ang, then tailors it to themselves")
  Person(teammate, "Teammate", "NEW route. Joins a bootstrapped repo and runs /tailor-ang only")
  System(ang, "Ang", "CHANGED. Skills, rules, output styles, features and the context script, installed in the repo")
  System_Ext(cc, "Claude Code", "EXISTING. Loads rules, output styles and settings; runs hooks and skills")
  System_Ext(orca, "Orca", "EXISTING, optional. Workspace host, detected into ang.local.json")
  System_Ext(git, "Git", "CHANGED. Repo .gitignore now written by Ang; check-ignore read by validate")

  Rel(pilot, cc, "Runs /bootstrap-repo, /tailor-ang and stage commands")
  Rel(teammate, cc, "Runs /tailor-ang")
  Rel(cc, ang, "Loads files, runs hooks and skills")
  Rel(ang, orca, "Host actions, when host is on")
  Rel(ang, git, "Appends ignore entries; asks whether ang.local.json is ignored")
```

## What changes at this level
| Element | Status | Change |
|---|---|---|
| Pilot | existing | Gets a generic default experience, then tailors it; no longer inherits Zac's config |
| Teammate | new route | `/tailor-ang` is re-runnable on its own (d5) |
| Ang | changed | See [containers](2-containers.md) |
| Claude Code | existing | Same mechanisms: rules, output styles, `settings.local.json` beating `settings.json` (k7) |
| Orca | existing | Only where `host` is configured moves (into `ang.local.json`) |
| Git | changed | Ang writes the repo `.gitignore`; `validate` runs `git check-ignore` |

## Related
- [Containers](2-containers.md)
- [Plan](../plan.md)
- [Epic hub](../README.md)
- [ADR 0001: Claude Code harness, Orca optional](/project-context/10k/technical/adrs/0001-claude-code-harness-orca-optional.md)
