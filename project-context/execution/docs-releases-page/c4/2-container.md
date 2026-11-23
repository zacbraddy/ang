---
title: "C4 level 2, containers: releases page"
shortDescription: The repo files and GitHub services behind the docs site and releases, marking the new redeploy workflow and the changed docs site, deploy workflow, notes template and cut-release skill
tags: [documentation, distribution]
---
# C4 level 2: containers

## Summary
Inside the system from [level 1](1-context.md), one container is **new**: the `redeploy-docs-on-release.yml` workflow. Four are **changed**: the `docs/` site gains the plugin and its collection, `deploy-docs.yml` passes the build a read token, the release-notes template loses its h1, and the `/cut-release` skill and launch-notes trigger follow on. `release.yml`, the notes files themselves and the `github-pages` environment are **existing** and untouched. Here a "container" is a separately run or separately edited unit in the repo.

## Diagram
```mermaid
C4Container
  title Docs site and release pipeline: containers
  Person(zac, "Zac")
  Person(reader, "Evaluator or coding agent")
  System_Ext(releases, "GitHub Releases", "Draft and published releases [existing]")
  System_Ext(pages, "GitHub Pages", "github-pages environment; main only [existing]")

  Container_Boundary(repo, "Ang repo (repo-only, never shipped)") {
    Container(cutrelease, "/cut-release skill", "Markdown", "Drafts notes, tags, waits for Publish; new post-publish check [changed]")
    ContainerDb(template, "releases/notes/README.md", "Markdown", "Notes template: no h1, bold theme line, ### sections [changed]")
    Container(trigger, "v1-launch-notes trigger", "Markdown", "Drafts v1.0.0's notes to the template's shape [changed]")
    ContainerDb(notes, "releases/notes/<tag>.md", "Markdown", "One file per tag, used as the release body [existing]")
    Container(release, "release.yml", "GitHub Actions", "On v* tag: tests, smoke install, draft release [existing]")
    Container(redeploy, "redeploy-docs-on-release.yml", "GitHub Actions", "On release published: gh workflow run deploy-docs.yml --ref main [new]")
    Container(deploy, "deploy-docs.yml", "GitHub Actions", "Builds docs/ with GITHUB_TOKEN in env, deploys [changed]")
    Container(site, "docs/", "Astro 7.4.12 + Starlight 0.43.1", "Content pages plus starlight-changelogs Releases page [changed]")
  }

  Rel(zac, cutrelease, "Runs")
  Rel(cutrelease, notes, "Drafts per the template")
  Rel(trigger, notes, "Drafts v1.0.0.md")
  Rel(template, notes, "Shapes")
  Rel(release, releases, "Creates draft from notes [existing]")
  Rel(zac, releases, "Publishes")
  Rel(releases, redeploy, "release: published [new]")
  Rel(redeploy, deploy, "workflow_dispatch on main [new]")
  Rel(deploy, site, "Builds [existing]")
  Rel(site, releases, "Lists published releases via API [new]")
  Rel(deploy, pages, "Deploys [existing]")
  Rel(cutrelease, redeploy, "Checks the run went green [new]")
  Rel(reader, pages, "Reads /ang/releases/ [new]")
```

## Containers
| Container | Status | Change (plan scope row) |
|---|---|---|
| `releases/notes/README.md` | changed | Heading shape (1) |
| `v1-launch-notes` trigger | changed | Drafting step follows the template (2) |
| `docs/` | changed | Dependency, override, collection, plugin, sidebar entry (3–5) |
| `deploy-docs.yml` | changed | `GITHUB_TOKEN` env on the build step; permissions stay `contents: read` (6) |
| `redeploy-docs-on-release.yml` | new | The spike file, adopted as is (7) |
| `/cut-release` skill | changed | Step 8 post-publish check for stable tags (8) |
| `release.yml`, `releases/notes/<tag>.md`, `github-pages` environment | existing | Untouched (k10, k11, k12) |

## Related
- [Context](1-context.md)
- [Components](3-component.md)
- [Plan](../plan.md)
- [Project structure](/project-context/10k/technical/project-structure.md)
