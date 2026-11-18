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
| `PlanEntry` | `{ path, category, hunks, mergedFile?: string, movedFrom?: string, resolution?: 'write' \| 'delete' \| 'keep' }`. `mergedFile` is the temp copy apply writes; the skill sets `resolution` on every conflict and may edit `mergedFile` | `upgrade plan` output, the skill, `upgrade apply` |
| `UpgradeRoute` | `{ route: 'fast' \| 'agent-resolved' \| 'guided' \| 'guided-with-warning', conflictedFiles, conflictHunks, cleanMerges, reason }` ([upgrade routes](../upgrade-routes.md)) | `upgrade/size.mjs`, the skill |
| `Manifest` | `{ fromTag, toRef, files: {path, status, similarity?, added, removed}[], commits, archivedEpics, tenK, cli, settingsDiff }` | `release-manifest`, `release-scout` |

## Library script (`src/.claude/scripts/ang/`)
| Module | Function | Responsibility |
|---|---|---|
| `settings/merge.mjs` | `mergeSettings(base, ours, theirs) → { merged, conflicts }` | Recursive three-way merge. `base` of `{}` gives the install merge. Arrays are sets of whole entries compared by JSON value |
| | `mergeArray(path, base, ours, theirs)` | Keeps user entries, swaps Ang's changed entries, drops Ang's removed ones, no duplicates |
| | `SKIPPED_KEYS = ['outputStyle']` | Conflicts on these are dropped; `tailor-ang` owns them |
| `commands/settings.mjs` | `settings merge --base <file\|none> --ours <file> --theirs <file>` | Reads, merges, writes `--ours` in place with stable key order, prints conflicts as JSON. Exit 0 on success, even with conflicts |
| `commands/version.mjs` | `version show` | Prints the `VersionRecord`, or `none` with exit 0 (no record routes to guided with warning, not an error) |
| | `version write --ref <tag> --sha <sha>` | Writes `.claude/ang/version.json` with `installedAt` set now |
| `upgrade/guides.mjs` | `parseGuide(markdown) → UpgradeGuide` | Splits on Moves, Migrations, Retired and Notes for the merge; "None" means empty; `from: none` parses to `null`; a missing heading is an error |
| | `chainGuides(fetchGuide, installedTag, targetTag) → UpgradeGuide[]` | Follows `from:` back from the target, then returns oldest first. `fetchGuide` is injected so unit tests run in memory |
| | `githubGuideFetcher(targetTag) → fetchGuide(tag) → Promise<string>` | `fetch` from `raw.githubusercontent.com/zacbraddy/ang/<target>/releases/upgrades/<tag>.md`; 404 is an error |
| `upgrade/classify.mjs` | `applyMoves(baseFiles, guides) → FileMap` | Renames base paths through every guide's Moves, oldest first |
| | `classifyFile(base, ours, theirs) → { category, hunks, merged }` | The spike's decision table, one file at a time |
| | `mergeFile(ours, base, theirs) → { merged, hunks }` | `git merge-file -p`; its exit code is the conflict count |
| | `classifyTrees(baseFiles, oursFiles, theirsFiles) → PlanEntry[]` | Every path in any tree, sorted, minus `EXCLUDED` (`settings.json`, `version.json`, `*.local.*`) |
| `upgrade/size.mjs` | `chooseRoute(entries, hasRecord) → UpgradeRoute` | `guided-with-warning` with no record or ≥ `WARN_FROM` conflicted files; `guided` above `AGENT_RESOLVES_UP_TO`; `agent-resolved` with any conflict or `clean-merge`; else `fast` |
| | `AGENT_RESOLVES_UP_TO = 5`, `WARN_FROM = 12` | Named constants, tuned after `rc.2` (d9) |
| `upgrade/apply.mjs` | `checkPlan(entries) → string[]` | Every problem that blocks an apply: an unresolved conflict, a missing `mergedFile`, conflict markers left in a file to write, a path outside the project or excluded |
| | `applyPlan(entries, projectRoot) → { written, deleted, kept }` | Runs only on a plan `checkPlan` passes (d26). Writes and deletes working-tree files with `fs` alone, then removes each `movedFrom`. Never touches the git index |
| `commands/upgrade.mjs` | `upgrade guides --from <tag> --to <tag>` | Prints the chain as JSON, or exits 1 naming the missing guide |
| | `upgrade plan --base <dir\|none> --target <dir> [--guides <file>]` | Reads three trees, classifies, sizes, writes merged files to a temp folder, prints `{ route, entries, tempDir }`. Writes nothing in the project |
| | `upgrade apply --plan <file>` | Checks then applies a plan the skill has resolved. Any problem exits 1 listing them all, with nothing written. Changes stay unstaged |
| `ang-context-manager.mjs` | (changed) | Imports `settings`, `version` and `upgrade` command arrays beside the existing ones |

## install.sh (repo root, shipped as a release asset)
| Function | Responsibility |
|---|---|
| `TAG=` / `SHA=` | Empty in the repo copy; `release.yml` fills both in the asset (d16) |
| `require_target "$@"` | Unstamped and no argument: stop with the one-liner (d28), before any check |
| `resolve_target "$@"` | Stamped and no argument: use the stamp. Argument: `GET /releases/tags/$1`, fail on a draft or unknown tag, then resolve its commit SHA. Runs after `check_prereqs`, since it needs node |
| `check_prereqs`, `check_repo`, `check_clean`, `check_not_installed`, `check_settings`, `check_collisions` | One d12 check each, each printing what's wrong and how to fix it. `check_prereqs` also stops under Git Bash, MSYS or Cygwin (d37); `check_collisions` runs against the downloaded tree |
| `download` | giget into `mktemp -d`, before `check_collisions` |
| `copy_in` | Moves the tree's `settings.json` aside, then copies the tree into the repo |
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
