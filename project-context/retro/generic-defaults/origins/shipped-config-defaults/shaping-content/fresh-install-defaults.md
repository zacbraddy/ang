---
title: Shipped config defaults, fresh-install check
shortDescription: Ang ships no ang.json; bootstrap writes one, defaulting intent on and streams off
tags: [distribution, repo-structure]
---
#  Fresh-install defaults

## Summary

Ang ships no `ang.json`. `/bootstrap-repo` still asks each feature question and writes a committed `ang.json` at the repo root. Ang holds an opinion here: intent's default answer is yes, so bootstrap drafts `10k/intent.md` and `validate` passes. Streams' default answer stays no. The loader's default for a key missing from the file stays off, so a hand-made config without `intent` still validates. Personal keys (pilot name, host) are set by the tailoring step into the gitignored `ang.local.json`, as decided in generic-personal-defaults. Zac's call, 2026-11-16 (ET 1, evidence tier 1: the pilot's own decision). The fresh-install check below, run the same day against `src/`, shows that today's shipped file fails `validate` and that "everything off" passes it.

## Setup

Copied `src/.claude` and `src/project-context` (what an install ships) into a scratch folder, unset `ORCA_WORKTREE_ID` and `TERM_PROGRAM`, then ran `library validate` and `session banner` twice.

## Results


| Run                                                                           | `validate`                                              | Banner                         |
| ----------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------ |
| A: shipped `ang.json` as today (`intent: true, streams: false, host: "orca"`) | ✖ exit 1: intent is true but `10k/intent.md` is missing | `Ang: intent`                  |
| B: no `ang.json`                                                              | ✔ exit 0                                                | `Ang: no optional features on` |


## Why bootstrap writes it rather than Ang shipping it

- Per the tailoring decision, `ang.json` is a committed, project-owned file at the repo root. A shipped copy would collide with the user's own on install or update.
- Writing it at bootstrap makes every key visible in the user's repo from day one, rather than leaving the defaults implicit in the feature modules.
- Intent defaults on as an Ang opinion: only the bootstrap question's default answer changes (`src/.claude/ang/features/intent/feature.mjs`), so bootstrap itself needs no rewrite.
- Streams stay off (d1): its default answer is no.
- `host: "orca"` is Zac-specific, so it belongs in his `ang.local.json`, not the release.

## What this repo needs instead

- Delete `src/.claude/ang.json` and the `.claude/ang.json` symlink.
- Give this repo its own real config: `intent: true`, `streams: false` committed; `host: "orca"` in the gitignored local overlay once that exists. The move to the repo root and the overlay land with [generic personal defaults](/project-context/retro/generic-defaults/README.md); until then a real (non-symlinked) `.claude/ang.json` does the job.

## Related

- [Brief](./brief.md)
- [Tailoring](/project-context/retro/generic-defaults/origins/generic-personal-defaults/shaping-content/tailoring.md)
- [Hub](../../../README.md)