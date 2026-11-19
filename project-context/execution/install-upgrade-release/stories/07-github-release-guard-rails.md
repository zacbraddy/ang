---
title: GitHub release guard rails
shortDescription: Zac turned on immutable releases for the Ang repo; the planned v* tag ruleset was dropped
tags: [open-source, distribution]
status: done
owner: user
dependsOn: []
---
# GitHub release guard rails

## Summary
A one-off setup Zac did by hand in GitHub's settings: immutable releases on `zacbraddy/ang` (d30). A published release's tag and `install.sh` asset can't change, so a broken release is fixed only by a patch release. The `v*` tag ruleset this story first planned was dropped.

## Outcome
Immutable releases are on. Done on 2026-11-18: `gh api repos/zacbraddy/ang/immutable-releases` returns `"enabled": true`. The `/cut-release` preflight checks the same endpoint.

## Guide
1. Open the repo's Settings → General.
2. Under **Releases**, tick **Enable release immutability**. It saves at once.

## Why no tag ruleset
- Immutable releases already stop a published release's tag being moved or deleted. A ruleset would only add cover for unpublished tags, in the short window between the tag push and Zac's publish click.
- Blocking deletes would break the release process's failure path: when the tag-push CI job fails, `/cut-release` deletes the tag and recuts it under the same name.
- Even blocking moves only would be insurance against a hypothetical for a solo maintainer. A tag moved before publishing still installs consistently, because `install.sh` carries its stamped SHA, and Zac sees the draft before publishing.
- Revisit if collaborators or bots get push access, or if a tag is ever moved by mistake.

## Related
- [Release process proposal](../release-process-proposal.md)
- [Plan: scope](../plan.md)
- [Story 10: release-scout and /cut-release](10-release-scout-and-cut-release.md)
