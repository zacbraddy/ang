---
title: Upgrade merge spike code
shortDescription: Throwaway file-by-file three-way upgrade script and the harness that installs an old Ang, improves it locally and upgrades it
tags: [distribution, open-source]
---
# Upgrade merge spike code

## Summary
Throwaway. `run.sh <scratch-dir> [base-ref] [target-ref]` installs `src/` at `d1c64e3` into a fake project, makes 6 local improvements, and runs `upgrade.mjs --apply` to `HEAD`, with and without `.claude/ang/version.json`. With the record, 2 files needed judgement and the tests passed afterwards. Without it, 16 files conflicted and the applied markers broke the instance. Full findings: [Upgrade merge spike](../../shaping-content/upgrade-merge-spike.md).

`upgrade.mjs <project> <ang-repo> <target-ref> [--apply]` prints the category counts and the files that need judgement. `--apply` writes every category except conflict-delete, conflict markers included.

## Related
- [Findings](../../shaping-content/upgrade-merge-spike.md)
- [Hub](../../../../README.md)
