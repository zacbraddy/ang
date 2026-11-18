---
title: Upgrade plan and apply engine
shortDescription: The deterministic upgrade engine classifies every file across base, instance and target, picks one of the four upgrade routes and applies a resolved plan to the working tree without staging or committing
tags: [distribution]
status: ready
owner: agent
dependsOn: [04]
---
# Upgrade plan and apply engine

## Summary
This story is the deterministic half of an upgrade: the upgrade merge spike's harness turned into tested library code. It applies the guides' moves first, so a declared move isn't read as a delete. Then it classifies every file one at a time, using `git merge-file` where both sides changed (d9). Last, it picks one of the four routes in [upgrade routes](../upgrade-routes.md). `apply` writes only to the working tree. It never stages or commits, so the user can always review the result or drop it.

## Outcome
- `upgrade plan --base <dir|none> --target <dir> [--guides <file>]` sorts every path into the spike's categories (k8, known 8), excluding `settings.json`, `version.json` and `*.local.*`. It writes the files to apply into a temp folder and prints `{ route, entries, tempDir }`. It writes nothing in the project.
- `upgrade apply --plan <file>` checks the whole plan first and refuses with nothing written if any conflict is unresolved (d26, decision 26: all or nothing). Otherwise it writes and deletes working-tree files only.
- `AGENT_RESOLVES_UP_TO = 5` and `WARN_FROM = 12` are named constants, tuned after `rc.2`. No version record always routes to guided with warning (d8).

## Done when
- `node --test 'src/.claude/**/*.test.mjs'` passes, with a test for every acceptance line below.
- `node .claude/scripts/ang-context-manager.mjs upgrade --help` lists `upgrade plan` and `upgrade apply`.

## Acceptance criteria
**Classify** (`classifyFile`, `mergeFile`)

In each line below, `b`, `l` and `t` are the base, local (ours) and target (theirs) bytes, and `null` means absent.
- Given `l` equals `t`, or both are absent, when classified, then it's `unchanged`.
- Given `l` equals `b` and `t` differs, then it's `fast-path`, or `fast-path-delete` when `t` is absent. Given `b` and `l` are both absent and `t` is present, then it's `upstream-new`.
- Given `t` equals `b` and `l` differs, then it's `keep-local`. Given `b` and `t` are both absent and `l` is present, then it's `local-only`.
- Given both sides changed and one of them is absent, then it's `conflict-delete`.
- Given both sides changed and `git merge-file` reports 0 conflicts, then it's `clean-merge` with the merged bytes. Given it reports conflicts, then it's `conflict` (or `conflict-no-base` when `b` is absent), with the hunk count and the merged bytes carrying markers.
- Given `git merge-file` fails (not a conflict count), when merged, then it throws naming the path.

**Moves and trees** (`applyMoves`, `classifyTrees`)
- Given a guide moving `a` to `b`, when moves are applied to a file map, then the content at `a` is now at `b` and `a` is gone. Given `a` to `b` then `b` to `c` across two guides, then it ends at `c` and remembers it came from `a`.
- Given a moved file the user edited and upstream left alone, when the trees are classified, then the entry at the new path is `keep-local` with `movedFrom` set to the old path, not a `conflict-delete` at the old path.
- Given a moved path where the instance already has a file at the new path, when moves are applied to the instance, then the existing file wins and the old path stays in the instance's map.
- Given the three trees, when classified, then the entries cover every path in base ∪ target, sorted. Local files outside that set don't appear. `.claude/settings.json`, `.claude/ang/version.json` and any `*.local.*` path never appear.

**Route** (`chooseRoute`)

"Conflicted" counts `conflict`, `conflict-no-base` and `conflict-delete`.
- Given only `unchanged`, `fast-path`, `fast-path-delete`, `upstream-new`, `keep-local` and `local-only`, then the route is `fast`.
- Given a `clean-merge` and no conflicts, or 1 to 5 conflicted files, then the route is `agent-resolved`.
- Given 6 to 11 conflicted files, then it's `guided`. Given 12 or more, then it's `guided-with-warning`.
- Given no version record, whatever the counts, then it's `guided-with-warning`.
- Every route carries `conflictedFiles`, `conflictHunks` (the sum of `max(hunks, 1)` over conflicted files), `cleanMerges` and a one-line `reason`.

**Apply** (`checkPlan`, `applyPlan`)
- Given a conflict entry with no `resolution`, when checked, then the check reports it. When `upgrade apply` runs on that plan, then it exits 1 listing every problem and the project is byte-for-byte unchanged.
- Given a file to write whose `mergedFile` is missing or still has a `<<<<<<< ` or `>>>>>>> ` line, then the check reports it.
- Given an entry path that's absolute, contains `..` or is excluded, then the check reports it.
- Given a passing plan, when applied:
  - `fast-path`, `upstream-new` and `clean-merge` write their `mergedFile`;
  - `fast-path-delete` deletes the file;
  - a conflict resolved `write` writes its `mergedFile`, `delete` deletes and `keep` leaves the file alone;
  - `unchanged`, `keep-local` and `local-only` touch nothing;
  - parent folders are created as needed.
- Given an entry with `movedFrom` that was written, when applied, then the old path is deleted.
- Given the project is a git repo with a clean index, when applied, then `git diff --cached` is empty and `git status` shows the changes unstaged.
- Given a passing plan, when `upgrade apply` runs, then it prints `{ written, deleted, kept }` as JSON and exits 0.

**Plan command**
- Given base, target and project folders with one file per reachable category, and a guides file declaring a move, when `upgrade plan` runs, then it prints `{ route, entries, tempDir }`. Each entry that writes has a `mergedFile` under `tempDir` holding the bytes to write, and the project is byte-for-byte unchanged.
- Given `--base none`, when it runs, then every path is classified without a base and the route is `guided-with-warning`.
- Given a missing `--base` or `--target` folder, or an unreadable `--guides` file, when it runs, then it prints `✖ <message>` and exits 1.

## Test plan
- **Unit** (`node:test`, beside the code in `src/.claude/scripts/ang/upgrade/`):
  - `classify.test.mjs`: `classifyFile` over in-memory Buffers for every Classify line. The merge cases call the real `git merge-file`, because that's the behaviour under test and git is already a prerequisite. `applyMoves` and `classifyTrees` over in-memory `FileMap`s for every Moves and trees line.
  - `size.test.mjs`: `chooseRoute` over hand-built entry lists, at each boundary (0, 1, 5, 6, 11, 12 conflicted files; a clean merge alone; no record).
  - `apply.test.mjs`: `checkPlan` on in-memory entries for every refusal. `applyPlan` against a temp folder for each action and `movedFrom`, and once against a temp git repo to show the index is untouched.
- **Integration** (`src/.claude/scripts/cli.test.mjs`): three temp folders (base, target and a git-initialised project) built with the existing `project()` helper plus two plain temp folders. One `upgrade plan` run covers every category it can reach plus a declared move. Then the test resolves the conflicts in the printed plan, runs `upgrade apply`, and checks the result and that nothing is staged. It also covers an `upgrade plan --base none` run and an unresolved-plan refusal.
- **Won't test**:
  - `git merge-file`'s own merge quality;
  - binary files (none ship);
  - exact message wording (assert the key phrase and the exit code);
  - the registry's flag handling (already covered);
  - the skill's judgement (story 06);
  - real giget trees (stories 06 and 13).

## Implementation notes
- **Files**:
  - `src/.claude/scripts/ang/upgrade/classify.mjs` (new): `EXCLUDED`, `readTree(dir) → FileMap`, `applyMoves`, `mergeFile`, `classifyFile`, `classifyTrees`.
  - `src/.claude/scripts/ang/upgrade/size.mjs` (new): `AGENT_RESOLVES_UP_TO`, `WARN_FROM`, `CONFLICTED`, `chooseRoute`.
  - `src/.claude/scripts/ang/upgrade/apply.mjs` (new): `checkPlan`, `applyPlan`.
  - `src/.claude/scripts/ang/commands/upgrade.mjs` (changed): adds `plan` and `apply` beside `guides`.
  - C4 code (`c4/4-code.md`) already reflects this story's shapes: `PlanEntry.resolution`, `UpgradeRoute` and `checkPlan`.
- **Trees**:
  - `--base` and `--target` are `src/` trees as giget fetches them, so a path relative to the tree is the same as the repo-relative path. The instance is `PROJECT` (`paths.mjs`: `CLAUDE_PROJECT_DIR` or the current folder), read only at the paths in base ∪ target.
  - `local-only` can't come out of `classifyTrees` with that scope, but `classifyFile` still returns it, matching the spike's table.
  - The shipped `project-context/README.md` is in scope like any other shipped file. The user's own library never is, because it's in neither tree.
- **Moves**:
  - Moves come from the `--guides` JSON that `upgrade guides` prints, oldest first. Without `--guides`, there are no moves.
  - `applyMoves(files, guides)` returns a new map plus the original path of each moved file. `plan` runs it on the base map and on the instance map (reading the instance at both old and new paths).
  - A move whose source is absent in a map is a no-op for that map.
- **Plan output**:
  - Every entry that writes gets `mergedFile`: `tempDir/<path>` holding the target bytes (`fast-path`, `upstream-new`), the merge (`clean-merge`, `conflict*`) or the target bytes for a `conflict-delete` whose target exists.
  - `tempDir` is `fs.mkdtempSync(os.tmpdir()/ang-upgrade-)`. The skill owns cleaning it up.
  - `hasRecord` is `--base !== 'none'`. With no base, merges run against an empty file.
- **Resolving** is the skill's job (story 06). It edits a conflict's `mergedFile` as needed and sets `resolution`. It may also edit a clean merge's `mergedFile` after rereading it. `checkPlan` gathers every problem before `applyPlan` runs, so an apply is all or nothing (d26).
- **Here be dragons**:
  - `git merge-file`'s exit status is the conflict count, capped at 127. A negative or higher status is an error, not a count.
  - Pass `-p` and the `-L` labels so the output is stable and nothing is written in place.
  - `applyPlan` uses `fs` only. Nothing in this story runs `git add` or `git commit`, and the git-repo apply test guards that.
- **Out of scope**:
  - the four routes' behaviour beyond naming the route, and cleaning up `tempDir` (story 06);
  - `settings.json` and `version.json` (`settings merge` and `version write`, story 02);
  - Migrations and Retired entries (they're for the skill's judgement);
  - removing folders a delete leaves empty (git doesn't track them).

## Related
- [Upgrade routes](../upgrade-routes.md)
- [Upgrade merge spike](../origins/install-uninstall-update/shaping-content/upgrade-merge-spike.md)
- [C4 components: library script](../c4/3-components.md)
- [C4 code: library script](../c4/4-code.md)
- [Story 04](04-upgrade-guide-chaining.md)
- [Story 06](06-upgrade-ang-skill.md)
