---
title: Per-entry links for repo-only tooling
shortDescription: Root .claude/skills and .claude/agents become real folders of per-entry links into src/, kept honest by a link script and a drift test
tags: [repo-structure, distribution]
status: draft
owner: agent
dependsOn: []
---
# Per-entry links for repo-only tooling

## Summary
Repo-only skills, agents and scripts (`/cut-release`, `release-scout`, `release-manifest`) need a home in the Ang repo that never ships. This story turns the root `.claude/skills` and `.claude/agents` into real folders holding one relative link per `src/` entry, and adds a root `scripts/` folder with the link script and its drift test (d24, decision 24 in the epic's `state.json`).

## Outcome
Every shipped skill and agent still resolves from the repo root exactly as before. `scripts/link-entries.mjs` creates missing links and removes dangling ones, and is a no-op on re-run. `scripts/link-entries.test.mjs` fails on a missing or dangling link. `.claude/scripts` stays a whole-folder link.

## Rough scope
- `planLinks(srcDir, rootDir)` and `applyLinks(plan)`; anything at the root that isn't a link is repo-only and left alone.
- The drift test runs `planLinks` over the real repo and expects an empty plan.
- Convert the current whole-folder links in one pass with the script.

## Related
- [Plan: scope and sequencing](../plan.md)
- [C4 components: repo-only release tooling](../c4/3-components.md)
- [C4 code: repo-only](../c4/4-code.md)
