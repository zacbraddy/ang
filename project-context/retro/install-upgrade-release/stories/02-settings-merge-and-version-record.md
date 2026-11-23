---
title: Settings merge and version record commands
shortDescription: The library script gains the shared three-way settings merge and the version show/write commands that install and upgrade both use
tags: [distribution, tech-stack]
status: done
owner: agent
dependsOn: []
---
# Settings merge and version record commands

## Summary
Install and upgrade share one `settings.json` merge and one way of reading and writing `.claude/ang/version.json`. This story builds both as core (not feature-gated) commands in `ang-context-manager.mjs`, test-first from the settings merge spike, with Node built-ins only (ADR 0002).

## Outcome
- `settings merge --base <file|none> --ours <file> --theirs <file>` passes the spike's four scenarios, gives exactly the install merge when the base is `none` (d7), and is a no-op on re-run. It writes `--ours` in place with stable key order and prints conflicts as JSON; `outputStyle` conflicts are dropped (k15).
- `version show` prints the record, or `none` with exit 0. `version write --ref <tag> --sha <sha>` writes `{ ref, sha, installedAt }` (k7, d35).

## Rough scope
- `settings/merge.mjs` (`mergeSettings`, `mergeArray`, `SKIPPED_KEYS`), `commands/settings.mjs`, `commands/version.mjs`, and the entry point's imports.
- Unit tests beside the code with `node:test`.

## Done when
- `node --test 'src/.claude/**/*.test.mjs'` passes, including new tests for every acceptance line below.
- `node .claude/scripts/ang-context-manager.mjs --help` lists `settings merge`, `version show` and `version write` as core commands, with no feature flag needed.
- Running the spike's vanilla scenario through the CLI (`settings merge --base <base> --ours <copy> --theirs <target>`) leaves the copy byte-identical to the target, and running it a second time changes nothing.
- In a temp project, `version show` prints `none`, `version write --ref v1.0.0 --sha <40 hex>` creates `.claude/ang/version.json`, and `version show` then prints that record.

## Acceptance criteria
- Given the spike's vanilla scenario (user file equals base), when `mergeSettings` runs, then the result equals the target exactly and there are no conflicts.
- Given the spike's customised scenario, when it runs, then the user's `model`, deny rule and `Stop` hook survive, Ang's three additions arrive once, the two removals happen, and the only conflict (`outputStyle`) is dropped by `SKIPPED_KEYS`.
- Given the spike's edited scenario, when it runs, then the user's PostToolUse matcher is kept and one conflict is reported at `["hooks", "SessionStart"]` with both replacement entries in the output.
- Given no record (`base` of `{}`), when it runs, then it reproduces the install merge (d7): the user's values win, missing keys and array entries are added, nothing is removed.
- Given any scenario's output, when it is merged again against the same base and target, then nothing changes.
- Given a key the user deleted that is still in base and target, when it runs, then it stays deleted.
- Given array entries that differ only in key order, when they are compared, then they count as the same entry.
- Given `--base none` and no file at `--ours`, when `settings merge` runs, then `--ours` is created holding the target.
- Given a merge with conflicts, when `settings merge` runs, then it writes `--ours`, prints the conflicts as a JSON array on stdout and exits 0. With no conflicts it prints `[]`.
- Given a missing `--theirs` or `--base` file, or a file that isn't valid JSON, when `settings merge` runs, then it fails with exit 1 naming the file, and `--ours` is untouched.
- Given no `.claude/ang/version.json`, when `version show` runs, then it prints `none` and exits 0.
- Given a record, when `version show` runs, then it prints the record as JSON and exits 0.
- Given `--ref` and a 40-character hex `--sha`, when `version write` runs, then it writes `{ ref, sha, installedAt }` (ISO timestamp), creating `.claude/ang/` if needed and replacing any old record.
- Given a `--sha` that isn't 40 hex characters, when `version write` runs, then it fails with exit 1 and writes nothing.

## Test plan
- **Unit** (`ang/settings/merge.test.mjs`): `mergeSettings` and `mergeArray` as pure functions. Port the spike's four scenarios and its checks from `spikes/settings-merge/scenarios.mjs`, with the base inlined as a fixture (not read from git history), plus the deleted-key, key-order and re-run lines.
- **CLI** (add to `cli.test.mjs`, reusing its `project()` helper, because `paths.mjs` reads `CLAUDE_PROJECT_DIR` at import time): `settings merge` writing in place, the JSON output, the missing `--ours` file and the bad-input failures. Also `version show` with and without a record, and `version write` with good and bad SHAs.
- **Won't test**: the registry's handling of `--help`, unknown flags and required flags (already covered), `writeJson` formatting, or the exact `installedAt` value (only that it parses as a date).

## Implementation notes
- **Files**, all under `src/.claude/scripts/` and shipped (c4/4-code.md):
  - New `ang/settings/merge.mjs`: `mergeSettings`, `mergeArray`, `SKIPPED_KEYS`.
  - New `ang/commands/settings.mjs` and `ang/commands/version.mjs`.
  - `paths.mjs` gains `VERSION_FILE` (`.claude/ang/version.json` under `PROJECT`).
  - `ang-context-manager.mjs` adds both command arrays to the core `commands` list. They are not feature-gated, because a fresh install has no `ang.json` yet (c4/3-components.md).
- **`mergeSettings(base, ours, theirs) → { merged, conflicts }`**: start from the spike's `merge.mjs`.
  - Objects merge key by key. A plain value takes theirs when ours still equals base, keeps ours when only the user changed it, and keeps ours with a conflict when both changed it.
  - Arrays are sets of whole entries (`mergeArray`). Base entries missing from theirs are removed, theirs entries missing from base are added, and the user's own entries stay. A base entry missing from both ours and theirs is a conflict, and both replacements stay in the output.
  - Drop the spike's added/removed/updated report. Nothing downstream uses it.
- **Entry equality** compares canonical JSON, with keys sorted recursively. That settles the spike's open question (spike.md:45) cheaply, whether or not the editor reorders keys.
- **Stable key order** means the user's keys in their order, then new Ang keys in the target's order (the spike's `new Set([...ours, ...theirs])`). Re-runs give the same bytes, and the user's diff stays small.
- **Conflict shape** follows C4's `MergeConflict { path: string[], base, ours, theirs }`, not the spike's dotted string, so keys that contain dots stay unambiguous. Array conflicts carry `base` (the entry), `ours` (user entries not in base) and `theirs` (target entries not in base). `SKIPPED_KEYS` filtering happens in `mergeSettings` on the top-level key.
- **Writing with conflicts**: C4 says to write in place and exit 0. That is safe because a scalar conflict keeps the user's value and an array conflict keeps both entries. Resolving conflicts with the user is story 06's job (and install.sh's reporting is story 03's).
- **`--base none`** means `{}`. A missing `--ours` file also means `{}`, so install.sh can call the merge whether or not the repo already has a `settings.json`. A missing `--theirs` or `--base` file is an error.
- **`version show`** prints `JSON.stringify(record, null, 2)` or `none`. **`version write`** accepts any non-empty `--ref`, and the SHA must match `/^[0-9a-f]{40}$/` (k7: install records a full SHA). It writes through `writeJson` after `mkdirSync(..., { recursive: true })`.
- **Implemented**: `cli.test.mjs`'s `project()` helper now creates parent folders, so a test can seed `.claude/ang/version.json`.
- **Implemented**: with no base (`--base none`), a top-level or nested plain value where the user and Ang differ is kept as the user's and reported as a conflict (`outputStyle` excepted). Story 03 decides how install.sh shows these.
- **Implemented**: an array entry both sides removed is a conflict only when each side added entries the other lacks, and `ours`/`theirs` hold just those. Re-running a merge reports no new conflicts.
- **Implemented**: the shipped `settings.json` is formatted as `writeJson` writes it, so a vanilla merge gives the shipped bytes.
- **Out of scope**: the `.pre-ang` backup (install.sh, story 03), resolving conflicts and finding the base tree (story 06), and `version.json` handling in the upgrade classifier (story 05).

## Review
53 tests pass, `--help` lists the three commands as core, and the `version` Done-when runs clean in a temp project. Two gaps against the Done-when and acceptance criteria. Must-fix and both should-fixes applied (56 tests pass); the nit is left.

**Must-fix**
- `src/.claude/scripts/ang/settings/merge.mjs:219`: an entry both sides removed is always a conflict, even with no replacements. Running the vanilla scenario a second time through the CLI (base `6cf9987`) reports `{ path: ["permissions","allow"], base: "Bash(jq:*)", ours: [], theirs: [] }`, and any user who deleted an entry Ang also dropped gets the same false conflict. Fix: `ours`/`theirs` hold only the non-base entries the other side lacks, and the conflict is reported only when both are non-empty. That also removes the re-run caveat this story had left for story 06.

**Should-fix**
- Done-when line 3: the CLI vanilla run gives the target's content but not its bytes, because `writeJson` reformats the hand-inlined `hooks` arrays in `src/.claude/settings.json`. Every user's first install or upgrade then rewrites those lines. Fix: format the shipped `settings.json` as `writeJson` does.
- `src/.claude/scripts/ang/commands/version.mjs:165`: a corrupt `version.json` throws a raw stack trace. Fix: move `settings.mjs`'s `readJson` into `util.mjs` and use it in both commands.

**Nit**
- `merge.mjs:231`: when Ang drops a key the user has edited (`theirs` undefined, `ours` ≠ `base`), the user's whole value stays, Ang's stale array entries included. No planned change hits this. Leave it.

## Related
- [Settings merge spike](../settings-merge-spike.md)
- [C4 components: library script](../c4/3-components.md)
- [C4 code: library script](../c4/4-code.md)
- [Plan: test strategy](../plan.md)
