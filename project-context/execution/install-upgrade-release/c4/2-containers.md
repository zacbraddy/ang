---
title: C4 level 2, containers for install, upgrade and release
shortDescription: The containers this epic adds or changes, split by where they live - the Ang repo (repo-only and shipped), GitHub, and the user's repo
tags: [distribution, open-source, repo-structure]
---
# C4 level 2: containers for install, upgrade and release

## Summary
The containers sit in three places:
- **The Ang repo:**
  - What **ships** is still only `src/`. Inside it, the library script and the new `upgrade-ang` skill change.
  - What's **repo-only** sits beside `src/` and never ships (d24): `/cut-release`, `release-scout`, the root `scripts/`, `releases/`, the unstamped `install.sh` and the release workflow.
- **GitHub:** holds each release and its stamped `install.sh` asset.
- **The user's repo:** gains `version.json` and a one-off settings backup.

The fixture repo is a user's repo like any other, so it isn't drawn separately. Containers from [10k level 2](/project-context/10k/technical/architecture/2-containers.md) that this epic doesn't touch (rules, styles, features, per-user files) are left out.

## Diagram
```mermaid
C4Container
  title Install, upgrade and release: containers
  Person(zac, "Zac as maintainer")
  Person(user, "Pilot")
  System_Ext(npm, "npm: giget@3.3.1")

  Container_Boundary(repo, "Ang repo") {
    Container_Boundary(repoonly, "Repo-only, never ships") {
      Container(cutrelease, "/cut-release [new]", "Skill, Markdown", "Preflight, gather, version, drafts, rehearsal, go, publish, post-publish")
      Container(scout, "release-scout [new]", "Agent, Markdown", "Reads the manifest and diffs; returns themes and upgrade hazards")
      Container(manifest, "scripts/release-manifest.mjs [new]", "Node ESM", "Deterministic JSON of everything since the last tag")
      Container(links, "scripts/link-entries.mjs + drift test [new]", "Node ESM", "Per-entry links from root .claude/skills and agents into src/")
      ContainerDb(releases, "releases/ [new]", "Markdown", "notes/vX.Y.Z.md and upgrades/vX.Y.Z.md")
      Container(installsrc, "install.sh, unstamped [new]", "POSIX sh", "Stops without a tag argument (d28)")
      Container(workflow, ".github/workflows/release.yml [new]", "GitHub Actions", "Tests, smoke install, stamp, draft release")
    }
    Container_Boundary(shipped, "src/, ships") {
      Container(scriptsrc, "ang-context-manager.mjs [changed]", "Node ESM, built-ins only", "Adds settings merge and the upgrade command group")
      Container(upskill, "upgrade-ang [new]", "Skill, Markdown", "Checks, fetch, run the target's engine, three paths, summary")
    }
  }

  Container_Boundary(github, "GitHub") {
    ContainerDb(release, "GitHub Release [new]", "Tag + notes + asset", "Draft until Zac publishes; rc tags are prereleases")
    Container(asset, "install.sh asset [new]", "POSIX sh", "Stamped with TAG and SHA")
  }

  Container_Boundary(userrepo, "User's repo") {
    Container(script, "ang-context-manager.mjs [changed]", "Installed copy", "Runs settings merge on install; runs upgrade only from the target tree")
    Container(upskilli, "upgrade-ang [new]", "Installed skill", "Run by Claude Code")
    ContainerDb(settings, ".claude/settings.json [changed]", "JSON", "Merged, user's values win")
    ContainerDb(backup, ".claude/settings.json.pre-ang [new]", "JSON", "First backup only (d4, d7)")
    ContainerDb(version, ".claude/ang/version.json [new]", "JSON", "ref, sha, installedAt (k7)")
    ContainerDb(library, "project-context/ [existing]", "Markdown + JSON", "Validated after install and upgrade")
  }

  Rel(zac, cutrelease, "Runs, decides, says go")
  Rel(cutrelease, manifest, "Runs")
  Rel(cutrelease, scout, "Spawns with the manifest")
  Rel(cutrelease, links, "Preflight: drift as a warning")
  Rel(cutrelease, releases, "Drafts notes and guide with Zac")
  Rel(cutrelease, workflow, "Tag push triggers")
  Rel(workflow, installsrc, "Stamps a copy")
  Rel(workflow, release, "gh release create --draft")
  Rel(release, asset, "Carries")
  Rel(zac, release, "Publish")
  Rel(user, asset, "curl | sh")
  Rel(asset, npm, "npx giget src/ at SHA")
  Rel(asset, script, "settings merge, empty base")
  Rel(asset, backup, "Writes once")
  Rel(asset, version, "Writes")
  Rel(user, upskilli, "Runs")
  Rel(upskilli, release, "Target and base trees, tag lookup")
  Rel(upskilli, releases, "Raw upgrade guides in (installed, target]")
  Rel(upskilli, script, "Target tree's engine (d29)")
  Rel(script, settings, "Three-way merge")
  Rel(script, version, "Reads base SHA")
  Rel(upskilli, library, "library validate")
```

## Containers
| Container | Status | Lives | What it does |
|---|---|---|---|
| `/cut-release` | new | Repo-only `.claude/skills/` | Runs a release with Zac from preflight to post-publish (d15, d18, d19, d23). Commits, tags and pushes only on a go asked for right then |
| `release-scout` | new | Repo-only `.claude/agents/` | Keeps diff reading out of the main session; feeds the coverage check (d20) |
| `scripts/release-manifest.mjs` | new | Root `scripts/` | `src/` paths with rename similarity, commits, archived epics, `10k/` changes, CLI and settings diffs since the last tag. Same tags, same output (d20) |
| `scripts/link-entries.mjs` + drift test | new | Root `scripts/` | Creates missing per-entry links, removes dangling ones, re-runs as a no-op. The test fails on drift in the release job; preflight warns (k16) |
| Root `.claude/skills`, `.claude/agents` | changed | Repo root | From whole-folder symlinks to real folders of per-entry links plus repo-only entries (d24). Drawn in [level 3](3-components.md) |
| `releases/` | new | Repo root | Human notes (the Release body, d25) and agent-facing upgrade guides, one of each per release (k12) |
| `install.sh` (repo copy) | new | Repo root | Unstamped. Without a tag it stops and points at the release-asset one-liner (d28) |
| `release.yml` | new | `.github/workflows/` | On `v*` push: `node --test`, smoke install, stamp, draft release (d21). Separate from open-source hygiene's CI |
| GitHub Release + asset | new | GitHub | Drafts are invisible to `releases/latest` until Zac publishes. Immutable once published (d30) |
| `ang-context-manager.mjs` | changed | `src/`, installed | Gains core (non-feature-gated) `settings merge` and `upgrade` commands, Node built-ins only ([ADR 0002](/project-context/10k/technical/adrs/0002-zero-dependency-library-script.md)) |
| `upgrade-ang` | new | `src/.claude/skills/` | The judgement half of an upgrade: rereads clean merges, resolves conflicts, confirms risky merges with the user on guided routes and gives the size warning (d9, d13, d26) |
| `settings.json` | changed | User's repo | Merged on install and upgrade. `outputStyle` conflicts are skipped (k15) |
| `settings.json.pre-ang`, `version.json` | new | User's repo | The backup is written once; the version record is rewritten by each upgrade |

## Related
- [Context](1-context.md)
- [Components](3-components.md)
- [Plan](../plan.md)
- [10k containers](/project-context/10k/technical/architecture/2-containers.md)
