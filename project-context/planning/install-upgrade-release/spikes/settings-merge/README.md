---
title: Settings merge spike code
shortDescription: Throwaway three-way merge of .claude/settings.json and the harness that upgrades four user scenarios with it
tags: [distribution, open-source]
---
# Settings merge spike code

## Summary
Throwaway. `run.sh <scratch-dir>` takes the shipped `src/.claude/settings.json` as base, builds a target release from it and upgrades four user settings files with `merge.mjs`, checking each result. All checks pass. Full findings: [Settings merge spike](../../settings-merge-spike.md).

`merge.mjs <base> <ours> <theirs>` prints the merged JSON on stdout and a report (added, removed, updated, conflicts) on stderr. `scenarios.mjs` holds the scenarios and checks.

## Related
- [Findings](../../settings-merge-spike.md)
- [Hub](../../README.md)
