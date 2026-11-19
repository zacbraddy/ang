---
title: release-manifest script
shortDescription: A repo-only script that builds a deterministic release manifest from git alone
tags: [distribution, repo-structure]
status: ready
owner: agent
dependsOn: [01]
---
# release-manifest script

## Summary
The deterministic feed for drafting a release (d20): everything that changed between the last tag and the release candidate, built from git with no commit conventions.

## Outcome
`scripts/release-manifest.mjs` builds `{ fromTag, toRef, files, commits, archivedEpics, tenK, settingsDiff }` from `git diff -M`, `git log`, `retro: archive` commits, `10k/` paths and the settings diff. The same tags always give the same manifest.

## Rough scope
- `buildManifest(fromTag, toRef)` in root `scripts/`, never shipped.
- Integration test over a temp repo with tags, renames and an archive commit.

## Done when
- `node scripts/release-manifest.mjs` in this repo (no tags yet) prints a JSON manifest covering every `src/` file since the first commit, with `fromTag: null`.
- Running it twice with the same refs gives identical bytes.
- `node --test 'scripts/*.test.mjs'` passes, including the new tests, and CI (story 08) picks them up unchanged.

## Acceptance criteria
- Given tags `v1.0.0` and a later commit, when run with `v1.0.0 HEAD`, then `files` lists each changed `src/` path once with status `A`/`M`/`D`/`R`, and line counts.
- Given a `src/` file renamed with small edits, then its entry has status `R`, `path` as the new path, `from` as the old path and a `similarity` percentage.
- Given a binary file changed under `src/`, then its `added`/`removed` are `null`.
- Given a commit with subject `retro: archive my-epic (full context in git history)` in range, then `archivedEpics` holds `{ epic: "my-epic", sha }`. Given the same subject before `fromTag`, then it is absent.
- Given changes under `project-context/10k/`, then `tenK` lists them in the same entry shape as `files`. Changes elsewhere in `project-context/` appear in neither list.
- Given `src/.claude/settings.json` changed in range, then `settingsDiff` is its unified diff text. Unchanged, it is `""`.
- Given no `fromTag` argument and a reachable `v*` tag, then the latest reachable release tag is used. Given none, then `fromTag` is `null` and the range starts from the empty tree.
- Given the same refs, when run twice, then the outputs are byte-identical.
- Given a `fromTag` or `toRef` that doesn't resolve, then it exits non-zero with a one-line message naming the ref and prints nothing to stdout.

## Test plan
- **Unit** (`scripts/release-manifest.test.mjs`): the pure parsers over captured git output strings: `-z` name-status plus numstat records (add, modify, delete, rename with similarity, binary `-`), and the archive-subject match (with and without the parenthetical, non-matching `retro:` subjects).
- **Integration** (same file): one temp repo built once in `before()` with the `tempDir`/`git()` helper pattern from `scripts/install.test.mjs:19-27`: a root commit, tag `v1.0.0`, then a modify, an add, a delete, a rename with edits, a binary file, a `10k/` doc, a `settings.json` change and a `retro: archive` commit, then tag `v1.1.0-rc.1`. Assert the manifest for `v1.0.0 v1.1.0-rc.1`, the no-tag default from a second repo (or `fromTag` omitted before any tag), determinism (two runs deep-equal and string-equal), and the unknown-ref failure through the CLI.
- **Won't test**: git's own rename detection thresholds, JSON formatting, or the CLI-guard line.

## Implementation notes
- **Files**: new `scripts/release-manifest.mjs` and `scripts/release-manifest.test.mjs`. Repo-only, never under `src/`, so `install.sh` and the release tarball never see it. Follow `scripts/link-entries.mjs:47-57`: exported functions, the `import.meta.url === pathToFileURL(process.argv[1]).href` CLI guard, the repo root from `path.resolve(import.meta.dirname, '..')`.
- **Signature**: `buildManifest({ cwd, fromTag, toRef }) → Manifest` (`cwd` so tests point it at a temp repo; C4's `buildManifest(fromTag, toRef)` with the repo made explicit).
- **CLI**: `node scripts/release-manifest.mjs [fromTag] [toRef]`. `toRef` defaults to `HEAD`. `fromTag` defaults to `git describe --tags --abbrev=0 --match 'v*' <toRef>`, or `null` when there is none. Prints `JSON.stringify(manifest, null, 2)` to stdout. `/cut-release` (story 10) decides where to save it and passes `fromTag` explicitly when the default is wrong, such as a final release that should span its rcs.
- **Base of the range**: the tag, or the empty tree (`git hash-object -t tree /dev/null`) when `fromTag` is `null`. This gives v1.0.0 "everything since the first commit" (d17).
- **Manifest shape** (refines C4's `Manifest`, c4/4-code.md:21):
  - `fromTag`: string or `null`. `toRef`: as given.
  - `files`: `{ path, status, from?, similarity?, added, removed }[]` from `git diff -M -z --name-status` and `--numstat` over `-- src/`, joined on path, sorted by `path`. Use `-z` to avoid rename brace syntax and path quoting.
  - `commits`: `{ sha, subject }[]`, oldest first, from `git log --reverse --format=%H%x00%s <base>..<toRef>` (or all of `<toRef>` when there is no tag). Merge commits included; their subjects carry PR numbers for the notes' closing list.
  - `archivedEpics`: `{ epic, sha }[]` from those commits whose subject matches `^retro: archive (\S+)` (format from `src/.claude/skills/retro/SKILL.md:39`).
  - `tenK`: the `files` entry shape over `-- project-context/10k/`.
  - `settingsDiff`: `git diff <base> <toRef> -- src/.claude/settings.json` text.
- **No CLI help diff**: every shipped file ships whatever a user's `ang.json` says, so command-line changes show up in `files` like any other change. C4 and the proposal no longer list a `cli` field.
- **Determinism**: no timestamps, no working-tree reads (refs only), explicit sorting, and run git with `-c core.quotePath=false` and a fixed `LC_ALL=C`.
- **Out of scope**: `release-scout`, the coverage check and saving the manifest (story 10); tag creation and validation (story 08).

## Related
- [C4 code: repo-only](../c4/4-code.md)
- [Release process proposal](../release-process-proposal.md)
- [Story 01](01-per-entry-links.md)
- [Story 08](08-release-workflow.md)
- [Story 10](10-release-scout-and-cut-release.md)
