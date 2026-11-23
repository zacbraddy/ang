---
title: "ADR 0007: How releases are cut"
shortDescription: Zac cuts each release with the repo-only /cut-release skill, CI does the mechanics on tag push, notes and upgrade guides are separate files, and every release is rehearsed on a fixture repo
tags: [open-source, distribution]
---
# ADR 0007: How releases are cut

## Summary
Releases are cut by Zac with `/cut-release`, a skill that lives only in this repo. It runs preflight warnings, gathers the changes, proposes a version, drafts the release notes and upgrade guide with him, rehearses the upgrade on a fixture repo, then commits, tags and pushes on his explicit go. A `v*` tag push runs `.github/workflows/release.yml`: tests, a smoke install, stamping `install.sh` and creating a draft GitHub Release. Zac presses Publish himself. Drawn from `.claude/skills/cut-release/`, `scripts/`, `releases/` and `release.yml` as of 2026-11-23.

## Context
`install.sh` and `upgrade-ang` both consume releases. Mainstream release tools need Conventional Commits, changeset files or labelled PRs, none of which Ang uses, so drafts are written by an LLM from a deterministic manifest and edited with Zac. "Bare minimum" in the business constraints means the minimum for a process that is comfortable to maintain, not the least effort.

## Decision
- **Thinking runs locally, mechanics run in CI.** `/cut-release` does the gather, version and drafts. CI does the tests, smoke install, stamp and draft release.
- **Gather:** `scripts/release-manifest.mjs` lists everything since the last tag (`src/` changes with renames, commits, archived epics, 10k changes, settings diff). The `release-scout` agent groups it, and a coverage check makes every manifest entry land in the notes, the guide or an "internal" list.
- **Two separate files per version at the repo root:** human notes in `releases/notes/vX.Y.Z.md` (the Release body) and an agent-facing guide in `releases/upgrades/vX.Y.Z.md` with four fixed headings and a `from:` line. Every release gets a guide. Templates are in each folder's `README.md`; `scripts/draft-guides.mjs` checks a guide before its tag exists.
- **Zac decides:** when to release (no schedule or nudges), and every version number. Preflight items are warnings, never blocks. Releases are cut from the head of `main`. Commit, tag and push need a go asked for immediately before.
- **Versioning:** only `v1.0.0-rc.N` pre-releases before v1.0.0, no 0.x. From v1.0.0, semver as guidelines: major when a user must act, minor for features and moves the guide handles silently, patch for fixes.
- **Rehearsal:** each release rehearses the upgrade from the previous release on `zacbraddy/ang-upgrade-fixture`, a public repo seeded once with faker prose (never LLM text) and typical local edits. After publish, the real upgrade is committed and tagged there.
- **Immutable releases are on,** with no `v*` tag ruleset. A broken release or `install.sh` is fixed only by a patch release, never by editing a published asset.
- **Built for the steady state:** the process is designed for semver releases after v1.0.0. A state that only exists before or at v1.0.0 gets a manual step, never a permanent check or branch.

## Consequences
- `gh` is a release-only dependency on Zac's machine.
- Release notes use Zac's public voice ([voice and attribution](/project-context/10k/marketing/voice-and-attribution.md)); upgrade guides have no voice.
- v1.0.0 is cut like any release from the last rc; only its notes are swapped for launch copy by the `v1-launch-notes` trigger.
- Parked: rehearsals that skip releases, until the first minor or patch release.

## Standing
2026-11-23. Built and used to cut `v1.0.0-rc.1` and `v1.0.0-rc.2`, the second with the fixture rehearsal.

## Related
| Doc | Why |
|---|---|
| [ADR 0005: Install by copy-in](/project-context/10k/technical/adrs/0005-install-by-copy-in-from-releases.md) | What the release job stamps |
| [ADR 0006: Upgrade by three-way merge](/project-context/10k/technical/adrs/0006-upgrade-by-three-way-merge.md) | What the upgrade guides feed |
| [Business constraints](/project-context/10k/business-constraints.md) | The maintenance stance this serves |
| [Project structure](/project-context/10k/technical/project-structure.md) | Where the release files live |
