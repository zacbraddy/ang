---
title: Copy-in spike
shortDescription: Throwaway script comparing degit and giget installs of src/ into an empty repo and an existing project
tags: [distribution]
---
# Copy-in spike

## Summary
`run.sh <scratch-dir>` installs `zacbraddy/ang/src` with degit and with giget into two scratch targets: an empty git repo, and a fake project with its own `.claude/`. It then reports how many files landed, any leaked `*.local.*` files, whether the conventions doc arrived, `library init` and `validate` exit codes, and which of the user's files changed.

Findings, run on 2026-11-16: both tools work in about 4 seconds, both need `--force` (a `.git/` folder counts as "not empty"), and both overwrite the user's `.claude/settings.json`. Full results are in [Copy-in bake-off](../../shaping-content/copy-in-spike.md).

## Related
- [Copy-in bake-off](../../shaping-content/copy-in-spike.md)
- [Hub](../../README.md)
