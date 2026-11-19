---
title: Install script spike
shortDescription: Throwaway prototype of install.sh plus a harness that pipes it into an empty repo and an existing project
tags: [distribution]
---
# Install script spike

## Summary
`install.sh` is a prototype of the root-level installer. It:
- resolves a pinned ref to a full SHA;
- backs up the user's `.claude/settings.json` and checks it's valid JSON;
- installs `src/` at that SHA with `npx giget@3.3.1`;
- merges the user's settings back in (the user's values win, arrays are unioned);
- writes `.claude/ang/version.json`.

`run.sh <scratch-dir> [ref]` pipes it into an empty repo and a fake existing project, installs into the existing project twice, and reports the five success measures.

Findings, run on 2026-11-16 at `cd1b825`: every measure passed, with installs taking about 4–5 seconds. Full results are in [Install script spike](../../shaping-content/install-script-spike.md).

## Related
- [Install script spike](../../shaping-content/install-script-spike.md)
- [Hub](../../../../README.md)
