---
title: C4 level 4, code for install, upgrade and release
shortDescription: Modules, types and functions for the settings merge, version record, upgrade engine, install.sh and the repo-only release scripts
tags: [distribution, open-source, repo-structure]
---
# C4 level 4: code for install, upgrade and release

## Summary
Every module here is new except the entry point. The shapes come from the two merge spikes, so the tests can start from the spikes' scenarios. Pure functions take in-memory values. Only the command files and `apply.mjs` touch the disk, and only `guides.mjs` (with `fetch`) and `classify.mjs` (with `git merge-file`) reach outside the process. That boundary is where the tests mock ([test strategy](../plan.md#test-strategy)). Names are working names and may change during execution, but the responsibilities shouldn't.

## Types
| Type | Shape | Used by |
|---|---|---|
| `VersionRecord` | `{ ref: string, sha: string, installedAt: string }` (k7) | `version`, `upgrade-ang`, `install.sh` |
| `MergeConflict` | `{ path: string[], base, ours, theirs }` | `settings/merge.mjs` |
| `UpgradeGuide` | `{ version, from, moves: {from, to, note}[], migrations: string[], retired: string[], notes: string[] }` | `upgrade/guides.mjs`, the skill |
| `FileMap` | `Map<path, Buffer>` for one tree, with `null` for absent | `upgrade/classify.mjs` |
| `FileCategory` | `unchanged`, `fast-path`, `fast-path-delete`, `upstream-new`, `local-only`, `keep-local`, `clean-merge`, `conflict`, `conflict-no-base`, `conflict-delete` (k8) | `classify`, `size`, `apply` |
| `PlanEntry` | `{ path, category, hunks, mergedFile?: string, movedFrom?: string }` | `upgrade plan` output |
| `UpgradePath` | `fast` \| `guided` \| `escape-hatch`, with `{ conflictedFiles, conflictHunks, reason }` | `upgrade/size.mjs` |
| `Manifest` | `{ fromTag, toRef, files: {path, status, similarity?, added, removed}[], commits, archivedEpics, tenK, cli, settingsDiff }` | `release-manifest`, `release-scout` |

## Library script (`src/.claude/scripts/ang/`)
| Module | Function | Responsibility |
|---|---|---|
| `settings/merge.mjs` | `mergeSettings(base, ours, theirs) → { merged, conflicts }` | Recursive three-way merge. `base` of `{}` gives the install merge. Arrays are sets of whole entries compared by JSON value |
| | `mergeArray(path, base, ours, theirs)` | Keeps user entries, swaps Ang's changed entries, drops Ang's removed ones, no duplicates |
| | `SKIPPED_KEYS = ['outputStyle']` | Conflicts on these are dropped; `tailor-ang` owns them |
| `commands/settings.mjs` | `settings merge --base <file\|none> --ours <file> --theirs <file>` | Reads, merges, writes `--ours` in place with stable key order, prints conflicts as JSON. Exit 0 on success, even with conflicts |
| `commands/version.mjs` | `version show` | Prints the `VersionRecord`, or `none` with exit 0 (no record is an escape-hatch input, not an error) |
| | `version write --ref <tag> --sha <sha>` | Writes `.claude/ang/version.json` with `installedAt` set now |
| `upgrade/guides.mjs` | `parseGuide(markdown) → UpgradeGuide` | Splits on the four headings; "None" means empty; a missing heading is an error |
| | `chainGuides(fetchGuide, installedTag, targetTag) → UpgradeGuide[]` | Follows `from:` back from the target, then returns oldest first. `fetchGuide` is injected so unit tests run in memory |
| | `fetchGuide(tag) → string` | `fetch` from `raw.githubusercontent.com/zacbraddy/ang/<target>/releases/upgrades/<tag>.md`; 404 is an error |
| `upgrade/classify.mjs` | `applyMoves(baseFiles, guides) → FileMap` | Renames base paths through every guide's Moves, oldest first |
| | `classifyFile(base, ours, theirs) → { category, hunks, merged }` | The spike's decision table, one file at a time |
| | `mergeFile(ours, base, theirs) → { merged, hunks }` | `git merge-file -p`; its exit code is the conflict count |
| | `classifyTrees(baseFiles, oursFiles, theirsFiles) → PlanEntry[]` | Every path in any tree, sorted, minus `EXCLUDED` (`settings.json`, `version.json`, `*.local.*`) |
| `upgrade/size.mjs` | `choosePath(entries, hasRecord) → UpgradePath` | `escape-hatch` with no record or ≥ `MANY_CONFLICTS` conflicted files; `guided` if any `clean-merge` or conflict; else `fast` |
| | `MANY_CONFLICTS` | One named constant, first set from the spike runs (d9) |
| `upgrade/apply.mjs` | `applyPlan(entries, projectRoot)` | Writes or deletes every settled entry, including conflicts and `conflict-delete`s the skill has resolved. Skips `unchanged` and any unresolved conflict |
| `commands/upgrade.mjs` | `upgrade guides --from <tag> --to <tag>` | Prints the chain as JSON, or exits 1 naming the missing guide |
| | `upgrade plan --base <dir\|none> --target <dir> [--guides <file>]` | Reads three trees, classifies, sizes, writes merged files to a temp folder, prints `{ path, entries, tempDir }`. Writes nothing in the project |
| | `upgrade apply --plan <file>` | Applies a plan the skill has resolved, conflicts included as resolved files |
| `ang-context-manager.mjs` | (changed) | Imports `settings`, `version` and `upgrade` command arrays beside the existing ones |

## install.sh (repo root, shipped as a release asset)
| Function | Responsibility |
|---|---|
| `TAG=` / `SHA=` | Empty in the repo copy; `release.yml` fills both in the asset (d16) |
| `resolve_target "$1"` | Stamped and no argument: use the stamp. Argument: `GET /releases/tags/$1`, fail on a draft or unknown tag. Unstamped and no argument: stop with the one-liner (d28) |
| `check_prereqs`, `check_repo`, `check_clean`, `check_not_installed`, `check_collisions`, `check_settings` | One d12 check each, each printing what's wrong and how to fix it |
| `copy_in` | giget into `mktemp -d`, then copy into the repo |
| `merge_settings` | Writes `.claude/settings.json.pre-ang` if absent, then `node .claude/scripts/ang-context-manager.mjs settings merge --base none …` |
| `record_and_report` | `version write`, then prints the version, location and next step |

## Repo-only (`scripts/`, root `.claude/`)
| Module | Function | Responsibility |
|---|---|---|
| `scripts/link-entries.mjs` | `planLinks(srcDir, rootDir) → { create, remove, conflicts }` | Compares `src/.claude/{skills,agents}` entries with root links; anything that isn't a link is repo-only and left alone, and reported as a conflict if it shares a `src/` entry's name |
| | `applyLinks(plan)` | Creates relative links, removes dangling ones |
| `scripts/link-entries.test.mjs` | drift test | Fails when `planLinks` on the real repo isn't empty |
| `scripts/release-manifest.mjs` | `buildManifest(fromTag, toRef) → Manifest` | `git diff -M --numstat`, `git log`, `retro: archive` commits, `10k/` paths, `--help` diff, settings diff. Deterministic |
| `.claude/skills/cut-release/SKILL.md` | prose | Stages 0 to 8; asks for the go immediately before push; `gh release view --web` |
| `.claude/agents/release-scout.md` | prose | Reads the manifest and diffs; returns the grouped summary and coverage map |
| `.github/workflows/release.yml` | job | Checkout, setup-node 26, `node --test`, smoke install with the stamped copy, stamp, draft release |
| `releases/notes/vX.Y.Z.md`, `releases/upgrades/vX.Y.Z.md` | data | One of each per release; guides start with `from:` so `chainGuides` can walk them |

## Related
- [Components](3-components.md)
- [Plan](../plan.md)
- [Release process proposal](../release-process-proposal.md)
