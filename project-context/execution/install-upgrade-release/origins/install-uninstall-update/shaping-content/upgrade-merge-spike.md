---
title: Upgrade merge spike
shortDescription: A file-by-file three-way merge, with the recorded install SHA as base, upgraded a locally improved instance across 28 changed files with 2 files needing judgement; with no version record the same upgrade showed 16 conflicted files and broke the instance when applied
tags: [distribution, open-source]
---
# Upgrade merge spike

## Summary
Spiked on 2026-11-16, answering how an upgrade merges upstream around local improvements and what makes a merge simple versus too much (u9). A zero-dependency [`upgrade.mjs`](../spikes/upgrade-merge/upgrade.mjs) does a three-way merge per file. Its base is the SHA in `.claude/ang/version.json`, "local" is the instance and "upstream" is the target release. It sorts every file into one category and runs `git merge-file` where both sides changed. It upgraded an instance installed at `d1c64e3` to `66c483f` (28 files changed upstream) with 6 local improvements:
- **With the version record:** 82 of 87 files needed no judgement. 2 merged cleanly, 1 conflicted (1 hunk, a separate changed block within a file) and 1 was a modify/delete. After the upgrade the instance's 37 tests passed.
- **Without it:** the same upgrade showed 16 conflicted files with 28 hunks, 14 of them false (only upstream had changed the file). Applied blindly, the conflict markers broke `library init` and 11 test files.
- **Two things counts can't catch.** A clean merge can be semantically stale: the merged text still said "my testing rules", which upstream had retired elsewhere. And an upstream *move* looks like a deletion: `.claude/ang.json` moved to the repo root, so the instance's local `streams: true` would be lost.

## Setup
- [`run.sh`](../spikes/upgrade-merge/run.sh) installs `src/` at `d1c64e3` (before the generic-defaults epic) into a fake project with `git archive`. A local `git archive` stands in for giget, since the install route was [already spiked](./install-script-spike.md). It writes `version.json` and makes 6 local improvements:
  1. a line added to `review-story`, away from upstream's change, plus a line that reuses wording upstream retired;
  2. an edit to `write-story` on the same line upstream changed;
  3. an edit to `retro`, which upstream never touched;
  4. a new local rule;
  5. a new function appended to `validate.mjs`, which upstream also changed;
  6. an edit to `.claude/ang.json`, which upstream deleted (it moved to the repo root).
- It then runs `upgrade.mjs --apply` to `HEAD`, once as is and once with `version.json` deleted.
- **Git is only the diff engine.** `git merge-file` merges three plain files and needs no shared history: the instance never branches from Ang's git tree. Base and upstream are Ang's files at the recorded SHA and at the target. The spike reads both from a local Ang checkout. A real skill would fetch both, for example with two giget downloads into a temp folder. So each upgrade fetches twice, and git must be installed on the user's machine.
- Out of scope: `.claude/settings.json` (u13), `version.json` itself and `*.local.*` files.
- Scope of "local files": every path Ang shipped at base or target, plus anything under `.claude/`. The user's own `project-context/` library is never touched.

## Results
| Category | Meaning | With record | No record |
|---|---|---|---|
| unchanged | local equals upstream | 57 | 57 |
| fast-path | only upstream changed: take it | 12 | 0 |
| upstream-new | new upstream file: add it | 12 | 12 |
| keep-local | only local changed: keep it | 1 | 0 |
| local-only | local addition: keep it | 1 | 2 |
| clean-merge | both changed, `merge-file` clean | 2 | 0 |
| conflict | both changed, overlapping | 1 (1 hunk) | 16 (28 hunks) |
| conflict-delete | one side deleted, the other changed | 1 | 0 |

Measures:
- **B. Every file lands in exactly one category:** pass. 87 paths, 87 classifications.
- **C. Hand check:**
  - The `validate.mjs` clean merge is sound: upstream's import and warning changes sit beside the local function, and all 37 tests pass.
  - The `review-story` clean merge is textually right but semantically stale. The local line "Fixes follow my testing rules too" survived beside upstream's new `engineering-defaults.md` wording.
  - The `write-story` conflict is genuine, since both sides rewrote the same line.
  - The `ang.json` conflict-delete is genuine, but it's really a move. The skill leaves the file alone, so the local setting isn't carried to root `ang.json`.
- **D. A rule falls out:** yes, coarsely (see below). It rests on two runs, so the threshold is a starting point.
- **E. No version record finishes and reports "too big":** pass for the report. It completed and produced 16 conflicted files against 2. But `--apply` wrote conflict markers into scripts, so the escape hatch has to come *before* writing anything.

## The rule that falls out
- **Fast path:** no file needs judgement (only fast-path, upstream-new, keep-local and local-only). Apply and report.
- **Guided merge:** a handful of files need judgement. The agent reads each clean merge against upstream's diff for stale wording, resolves each conflict with the user, and handles each conflict-delete as a possible move.
- **Escape hatch:** many conflicted files, or no version record. Warn about the size before writing anything, and offer to take only chosen parts.
- Conflicted files are the cost signal. Fast-path and new-file counts cost almost nothing, however large.

## Unknown unknowns
- **Moves and migrations are invisible to a file-level merge.** `ang.json` moved from `.claude/` to the repo root. Without being told, the agent sees a deletion and the user's config is lost. Releases need to say what moved or needs migrating, which belongs with what each release publishes (u10).
- **Clean merges aren't automatically safe.** Text that merges cleanly can still contradict upstream's new wording. That makes clean merges a judgement category, not a fast-path one.
- **No record makes every changed file look like a conflict.** That fits d8 (decision 8: no hard stop without a record): it routes to the escape hatch rather than failing. It also means a lost `version.json` costs a lot, so it's worth committing it.
- **The test glob.** `node --test .claude/scripts` found nothing. The tests ran only when passed as an explicit `*.test.mjs` list. This matches the known broken test glob.

## Related
- [Spike README](../spikes/upgrade-merge/README.md)
- [Install script spike](./install-script-spike.md)
- [Install script and upgrade ambition](./install-and-upgrade-direction.md)
- [Hub](../../../README.md)
