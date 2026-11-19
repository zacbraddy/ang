---
title: Fixture repo created and seeded
shortDescription: Zac creates the upgrade fixture repo from an rc.1 install and seeds it once with representative local edits
tags: [distribution, open-source]
status: draft
owner: user
dependsOn: [11]
---
# Fixture repo created and seeded

## Summary
Upgrade rehearsals run against a dedicated fixture repo, not a real project (d22). Zac creates it (for example `zacbraddy/ang-upgrade-fixture`, k13) and seeds it once by hand from an rc.1 install; real upgrades roll it forward after that (k17).

## Outcome
The fixture repo holds an rc.1 install plus the k17 seed: one local edit in every shipped area, the upgrade merge spike's five cases, a local-only skill and agent, a library built through `ang-context-manager.mjs` with an item at each stage, a 10k doc, a trigger and state entries, and a root `ang.json` with features on. Prose comes from faker, never an LLM; any one-off script stays in the fixture repo. The seeded state is committed and tagged.

## Rough scope
- Step-by-step guidance for Zac, written in `/write-story`.

## Related
- [Release process proposal](../release-process-proposal.md)
- [Upgrade merge spike](../origins/install-uninstall-update/shaping-content/upgrade-merge-spike.md)
- [Story 11](11-cut-rc1.md)
