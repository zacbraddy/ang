---
title: C4 level 1, context
shortDescription: Who uses Ang and which outside systems it touches; Ang is a set of files inside one repo, run by Claude Code
tags: [repo-structure, tech-stack]
---
# C4 level 1: context

## Summary
Ang is a set of files installed inside one repo and run by Claude Code. The pilot bootstraps the repo and works through the stage commands. A teammate who joins a bootstrapped repo runs `/tailor-ang` to set their own name, host, output style and personal rule without touching committed files. Ang writes only inside the repo: its own files, the context library and the repo `.gitignore`. Orca is an optional host. Drawn from `src/.claude/` as of 2026-11-16.

## Diagram
```mermaid
C4Context
  title Ang: system context
  Person(pilot, "Pilot", "Bootstraps a repo with Ang, tailors it, runs the stage commands")
  Person(teammate, "Teammate", "Joins a bootstrapped repo and runs /tailor-ang")
  System(ang, "Ang", "Skills, agents, rules, output styles, features and the context script, installed in the repo")
  System_Ext(cc, "Claude Code", "Loads rules, output styles and settings; runs hooks, skills and subagents")
  System_Ext(orca, "Orca", "Optional workspace host: worktree cards and stream workspaces")
  System_Ext(git, "Git", "History of the library, .gitignore, check-ignore, the ang/streams branch")

  Rel(pilot, cc, "Runs /bootstrap-repo, /tailor-ang and stage commands")
  Rel(teammate, cc, "Runs /tailor-ang")
  Rel(cc, ang, "Loads files, runs hooks and skills")
  Rel(ang, orca, "Host actions, when host is on")
  Rel(ang, git, "Ignore entries, check-ignore, stream registry and mailbox")
```

## Elements
| Element | Role |
|---|---|
| Pilot | The person running Ang, named through the optional `pilot` feature ([ADR 0004](/project-context/10k/technical/adrs/0004-pilot-identity-hook-injected.md)) |
| Teammate | Same as the pilot, minus bootstrap: `/tailor-ang` runs on its own |
| Claude Code | The only harness ([ADR 0001](/project-context/10k/technical/adrs/0001-claude-code-harness-orca-optional.md)). `settings.local.json` beats `settings.json`; rules have no precedence between them |
| Orca | On only when `ang.local.json` names it and the session detects it |
| Git | The archive for deleted library docs. Ang appends to the repo `.gitignore`, `validate` runs `git check-ignore`, and streams keep their registry on the `ang/streams` branch |

## Related
- [Containers](2-containers.md)
- [Project structure](/project-context/10k/technical/project-structure.md)
- [What Ang is](/project-context/10k/product/what-ang-is.md)
