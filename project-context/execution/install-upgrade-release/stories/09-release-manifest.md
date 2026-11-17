---
title: release-manifest script
shortDescription: A repo-only script that builds a deterministic release manifest from git alone
tags: [distribution, repo-structure]
status: draft
owner: agent
dependsOn: [01]
---
# release-manifest script

## Summary
The deterministic feed for drafting a release (d20): everything that changed between the last tag and the release candidate, built from git with no commit conventions.

## Outcome
`scripts/release-manifest.mjs` builds `{ fromTag, toRef, files, commits, archivedEpics, tenK, cli, settingsDiff }` from `git diff -M --numstat`, `git log`, `retro: archive` commits, `10k/` paths, the `--help` diff and the settings diff. The same tags always give the same manifest.

## Rough scope
- `buildManifest(fromTag, toRef)` in root `scripts/`, never shipped.
- Integration test over a temp repo with tags, renames and an archive commit.

## Related
- [C4 code: repo-only](../c4/4-code.md)
- [Release process proposal](../release-process-proposal.md)
- [Story 01](01-per-entry-links.md)
