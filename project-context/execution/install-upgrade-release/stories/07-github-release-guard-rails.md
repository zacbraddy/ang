---
title: GitHub release guard rails
shortDescription: Zac turns on immutable releases and adds a v* tag ruleset on the Ang repo, guided by this story
tags: [open-source, distribution]
status: draft
owner: user
dependsOn: []
---
# GitHub release guard rails

## Summary
A one-off setup Zac does by hand in GitHub's settings: immutable releases and a `v*` tag ruleset (d30). A broken release or `install.sh` is then fixed only by a patch release, never by editing a published asset.

## Outcome
Immutable releases are on for `zacbraddy/ang`, and a ruleset protects `v*` tags from being moved or deleted. Done when Zac confirms both, ideally with a screenshot or the settings links noted here.

## Rough scope
- Step-by-step instructions for Zac, written in `/write-story`.

## Related
- [Release process proposal](../release-process-proposal.md)
- [Plan: scope](../plan.md)
