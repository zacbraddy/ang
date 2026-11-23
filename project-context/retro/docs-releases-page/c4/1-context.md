---
title: "C4 level 1, context: releases page"
shortDescription: The docs site and release pipeline in context, marking the new Releases API read at build time and the new publish-triggered redeploy
tags: [documentation, distribution]
---
# C4 level 1: context

## Summary
The system in focus is Ang's docs site together with the release pipeline that feeds it, since both are repo-only and never ship. The epic adds two relationships and changes no actors. At build time, the docs site reads published releases from the GitHub Releases API (**new**). When Zac presses Publish on a draft release, GitHub Actions rebuilds and redeploys the site from `main` (**new**). Everything else already exists. Labels mark each element and relationship as new, changed or existing.

## Diagram
```mermaid
C4Context
  title Docs site and release pipeline: context
  Person(zac, "Zac", "Cuts releases with /cut-release and presses Publish on each draft [existing]")
  Person(reader, "Evaluator or coding agent", "Reads the docs, now including the Releases page [existing]")
  System(site, "Docs site", "Starlight site at zacbraddy.github.io/ang/, now with /releases/ [changed]")
  System_Ext(releases, "GitHub Releases", "Drafts from release.yml; published by Zac [existing]")
  System_Ext(actions, "GitHub Actions and Pages", "Builds docs/ from main and serves it [changed: new trigger]")
  System_Ext(npm, "npm registry", "Exact-pinned docs dependencies, now including starlight-changelogs [changed]")

  Rel(zac, releases, "Publishes a draft [existing]")
  Rel(releases, actions, "release: published event [new]")
  Rel(actions, site, "Builds from main and deploys [existing]")
  Rel(site, releases, "Reads published stable releases at build [new]")
  Rel(actions, npm, "Installs pinned dependencies [existing]")
  Rel(reader, site, "Reads pages, llms*.txt and /releases/ [changed]")
```

## Elements
| Element | Status | What changes |
|---|---|---|
| Zac | existing | Same Publish click. `/cut-release` gains a post-publish check that the page lists the tag |
| Evaluator or coding agent | existing | Gains a Releases page. `llms.txt` doesn't list it (plan, Out of scope) |
| Docs site | changed | A Releases page: published stable releases, newest first, one page |
| GitHub Releases | existing | Now read by the docs build. Drafts are invisible to the build's read token (k9) and the plugin drops pre-releases (d2) |
| GitHub Actions and Pages | changed | A second trigger: publishing a release dispatches `deploy-docs.yml` on `main` (d3). Only `main` may still deploy (k10) |
| npm registry | changed | Serves one more pinned dependency |

## Related
- [Containers](2-container.md)
- [Plan](../plan.md)
- [10k context](/project-context/10k/technical/architecture/1-context.md)
