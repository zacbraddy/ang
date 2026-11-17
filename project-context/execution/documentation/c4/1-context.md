---
title: Documentation epic C4 level 1, context
shortDescription: Who reads the README and docs site, and the GitHub services that build and serve the site; the shipped Ang is unchanged
tags: [documentation, repo-structure]
---
# C4 level 1: context

## Summary
This epic changes the **Ang repo** (the source repository on GitHub, not an install) and adds one new system, the **docs site**. Three kinds of reader use them: someone deciding whether Ang suits them, someone already using it, and coding agents reading `llms.txt`. GitHub Actions builds the site and GitHub Pages serves it at `zacbraddy.github.io/ang/`. Names follow the install epic's C4, which introduces GitHub and the npm registry first; if this epic lands before it, both are new here instead. The installed Ang from [10k context](/project-context/10k/technical/architecture/1-context.md) is unchanged: the docs only describe it.

## Diagram
Labels: **[new]** = added by this epic, **[changed]** = edited by it, **[existing]** = untouched, as in the install epic's C4.

```mermaid
C4Context
  title Documentation epic: system context
  Person(evaluator, "Evaluator", "Deciding whether Ang suits them")
  Person(user, "Ang user", "Installs, runs and bends Ang")
  Person(zac, "Zac", "Maintainer: writes, reviews and merges the docs")
  Person_Ext(agent, "Coding agent [new]", "Reads the docs on a user's behalf")

  System(repo, "Ang repo [changed]", "GitHub repository: README rewritten, docs/ and a deploy workflow added")
  System(site, "Docs site [new]", "Static Starlight site at zacbraddy.github.io/ang/")
  System_Ext(github, "GitHub [changed]", "Hosts the repo; Actions runs workflows; this epic turns on Pages")
  System_Ext(npm, "npm registry [existing]", "Starlight, Astro, plugins and Fontsource packages at build time")
  System_Ext(installed, "Installed Ang [existing]", "Ang running in a user's repo; what the docs describe")

  Rel(evaluator, repo, "Reads the README")
  Rel(evaluator, site, "Reads Home and Why Ang")
  Rel(user, site, "Reads Start here, Concepts, Commands, Reference")
  Rel(user, installed, "Installs with the curl one-liner, runs commands")
  Rel(agent, site, "Fetches llms.txt, llms-full.txt, llms-small.txt")
  Rel(zac, repo, "Pushes docs changes to main")
  Rel(repo, github, "Push touching docs/** triggers deploy-docs.yml")
  Rel(github, npm, "npm ci")
  Rel(github, site, "Actions builds it; Pages serves it")
```

## Elements
| Element | State | Role |
|---|---|---|
| Evaluator | existing reader | Lands on the README or Home. Needs to decide (bar 1 in the [page map](../information-architecture.md)) |
| Ang user | existing reader | Needs to get Ang running, use it and bend it (bars 2–4) |
| Coding agent | new | Reads the agent-readable outputs (d10) |
| Zac | existing | The only writer. Sets the Pages source to GitHub Actions once |
| Ang repo | changed | Gains `docs/`, `.github/workflows/deploy-docs.yml` and a rewritten `README.md`; nothing under `src/` changes |
| Docs site | new | About 20 pages in 6 sidebar groups ([page map](../information-architecture.md)) |
| GitHub | changed | Actions arrives with the install epic's `release.yml`; this epic adds `deploy-docs.yml` and turns on Pages (source: GitHub Actions). Free |
| npm registry | existing | Used by the install epic; here only the docs build touches it, and the shipped Ang still has no dependencies ([ADR 0002](/project-context/10k/technical/adrs/0002-zero-dependency-library-script.md)) |
| Installed Ang | existing | The source of truth for every claim on a page (k5) |

## Related
- [Containers](2-containers.md)
- [Plan](../plan.md)
- [10k context](/project-context/10k/technical/architecture/1-context.md)
