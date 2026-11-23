---
title: release-scout and /cut-release
shortDescription: The repo-only release-scout agent, /cut-release skill and draft-guides script that take a release from preflight to post-publish with Zac making every decision
tags: [distribution, open-source]
status: done
owner: agent
dependsOn: [08, 09]
---
# release-scout and /cut-release

## Summary
The local half of the release process (d15, d18 to d20, d23, d25). `/cut-release` walks stages 1 to 8 of the release process proposal with Zac. `release-scout` reads the manifest and diffs in its own context, so a big manifest doesn't overflow the drafting session. A small repo-only script, `draft-guides.mjs`, turns the local draft upgrade guide into the guides JSON the upgrade engine takes. The rehearsal needs it on every release, because the new tag doesn't exist yet at stage 4, and it doubles as the check that the new guide parses and chains before tagging.

## Outcome
Zac runs `/cut-release` from preflight warnings through manifest, scout, version, drafted notes and upgrade guide, rehearsal, go, CI and publish to post-publish. He makes only decisions and never types a git or gh command. The coverage check maps every manifest entry to the notes, the guide or an internal list.

## Done when
- `node --test 'src/.claude/**/*.test.mjs' 'scripts/*.test.mjs'` passes, including `scripts/draft-guides.test.mjs` with a test for every **draft-guides** acceptance line.
- `.claude/skills/cut-release/SKILL.md` and `.claude/agents/release-scout.md` exist as real files at the repo root, nothing under `src/` names them, and `scripts/link-entries.test.mjs` passes (no conflicts or drift).
- `releases/upgrades/README.md` says how `/cut-release` checks a new guide (`scripts/draft-guides.mjs`).
- `library validate` passes.
- The skill and agent prose is proven for real in story 11 (stages 1 to 3 and 5 to 8) and story 13 (the rehearsal). There's no dry run here.

## Acceptance criteria
**draft-guides** (`node scripts/draft-guides.mjs <fromTag> <toTag>`)
- Given `releases/upgrades/` holds a guide for `toTag` whose `from:` chain reaches `fromTag`, when it runs, then it prints the same JSON `upgrade guides --from <fromTag> --to <toTag>` would (oldest first) and exits 0.
- Given the `toTag` guide is uncommitted in the working tree, then it is read as it stands on disk.
- Given a chain of several guides (`fromTag` two releases back), then every guide after `fromTag` is included, oldest first.
- Given a missing guide anywhere in the chain, then it exits 1 with one line naming the tag and the `releases/upgrades/<tag>.md` path, and prints nothing to stdout.
- Given a guide that doesn't parse, or a chain that loops or never reaches `fromTag`, then it exits 1 with `chainGuides`/`parseGuide`'s message and prints nothing to stdout.
- Given fewer than two arguments, then it exits 1 with a usage line.

**/cut-release** (skill prose; checked in stories 11 and 13)
- Given any preflight check fails, then the skill lists every failing check with its fix and asks Zac whether to carry on. It never stops on its own (d18).
- Given the manifest is built, then it was built with the default range (`fromTag` omitted) before any new tag exists, and saved under the release's temp folder, never in the repo.
- Given the scout's coverage map, then any manifest entry missing from it, or mapped to notes or guide but absent from the drafts, is shown to Zac as a leftover.
- Given a version proposal, then it comes with its reason under d23 and matches the release job's tag format. Zac picks the version.
- Given drafted notes and guide, then the guide passes `draft-guides.mjs <manifest fromTag> <newTag>` before Zac is asked to approve, and nothing moves on until Zac says they're approved.
- Given the rehearsal reports a conflict or conflict-delete the guide doesn't explain, then Zac decides each one: fix the guide (back to stage 3) or ship anyway.
- Given stage 5, then the commands are shown and the go is asked for immediately before running them. A go from an earlier question doesn't count (d19).
- Given the release job fails, then the skill reports the failing step. After Zac's fix, and on his go, it deletes the tag (and any draft release) and repeats stage 5.
- Given Zac says he's published, then the published asset installs into a scratch repo with `version.json` naming the tag and its commit, and the fixture is upgraded, then committed, tagged and pushed on Zac's go.
- On every exit, the release's temp folder is removed.

## Test plan
- **Unit and integration** (`scripts/draft-guides.test.mjs`, `node:test`): a temp folder of guide files written per test, and `draftGuides({ dir, fromTag, toTag })` called directly: single guide, a chain of three, missing guide, parse error passed through, loop passed through. One CLI run through `node scripts/draft-guides.mjs` from a temp working folder for the exit code, empty stdout and the usage line.
- **Won't test**:
  - `parseGuide`/`chainGuides` behaviour beyond pass-through (already tested in `src/.claude/scripts/ang/upgrade/guides.test.mjs`);
  - the skill and agent prose, `gh` calls and the release job (plan test strategy: proven by stories 11 and 13);
  - the coverage check (`jq` set difference in the skill, not code).

## Implementation notes
**Files**
- `scripts/draft-guides.mjs` (new) and `scripts/draft-guides.test.mjs` (new). Repo-only, following `scripts/release-manifest.mjs`'s exported-function-plus-CLI-guard shape. It imports `chainGuides` from `../src/.claude/scripts/ang/upgrade/guides.mjs` and passes a fetcher that reads `<dir>/<tag>.md` (default dir `releases/upgrades` under the repo root from `import.meta.dirname`). A missing file throws `no upgrade guide for <tag> at releases/upgrades/<tag>.md`. Prints `JSON.stringify(guides, null, 2)`.
- `.claude/agents/release-scout.md` (new, real file, repo-only per story 01's layout).
- `.claude/skills/cut-release/SKILL.md` (new, real folder, repo-only).
- `releases/upgrades/README.md` (changed): the "`/cut-release` checks the new guide before tagging" line names `scripts/draft-guides.mjs`.

**release-scout** (shaped like `src/.claude/agents/context-scout.md`)
- Frontmatter: `name: release-scout`, `description` ending "Use when /cut-release reaches Gather.", `tools: Read, Grep, Glob, Bash`.
- Input: the manifest file's path. It reads diffs itself with `git diff <fromTag> <toRef> -- <path>` (the empty tree when `fromTag` is `null`).
- Returns:
  - themes, grouped by what they mean for a user, not by file;
  - user-facing vs internal changes;
  - upgrade hazards: renames (`R`) and deletes (`D`) that need a Moves entry, `settingsDiff` changes, wording or names that should be Retired, anything that needs a Migration;
  - a coverage map as a fenced JSON object, keyed by every manifest entry, valued `notes`, `guide` or `internal`. Entries are each `files[].path`, each `tenK[].path`, each `archivedEpics[].epic` as `epic:<name>`, and `settings` when `settingsDiff` isn't empty.

**/cut-release SKILL.md**
- Frontmatter: `name: cut-release`, `description` ending "Use when the user runs /cut-release.", `disable-model-invocation: true`. No argument: the version is proposed at Gather.
- Opening: it runs from the main checkout. It's the one workflow command that commits, tags and pushes, each on Zac's go (d19). `$TMP` is `mktemp -d -t ang-release-XXXXXX`, removed on every exit.
- Host actions are named inline, since there's no shipped `host/steps/` file for a repo-only skill: say status at each stage (`release vX.Y.Z: rehearsal`), and ask for the user at every stop for Zac.
- Numbered bold-lead stages:
  1. **Preflight.** Run every check, then list the failures, each with its fix, and ask whether to carry on:
     - on `main`, `git status --porcelain` empty, and after `git fetch origin` `HEAD` equals `origin/main`;
     - streams with `src/` work not on main: for each stream in `ang-context-manager.mjs stream list`, the count of `git diff --name-only origin/main...<branch> -- src/`, listed as "<slug>: N src/ files";
     - CI green: the latest `gh run list --branch main` conclusion;
     - immutable releases on: `gh api repos/zacbraddy/ang/immutable-releases` shows `"enabled": true`;
     - no draft release left over: `gh release list --json tagName,isDraft`;
     - no link drift: `node --test scripts/link-entries.test.mjs` (fix: `node scripts/link-entries.mjs`);
     - the README one-liner uses `releases/latest/download/install.sh`.
  2. **Gather.** `node scripts/release-manifest.mjs > "$TMP/manifest.json"` (default range, before any tag: story 09's range note). Spawn `release-scout` with that path. Run the coverage check: every manifest entry is a key in the map. Propose a version with its reason (d23: major if the user must act, minor for features and silent moves, patch for fixes; `-rc.N` while Zac wants a candidate), in the release job's format `vX.Y.Z` or `vX.Y.Z-rc.N`. Zac picks it.
  3. **Draft and approve.** Write `releases/notes/<tag>.md` from the template in `releases/notes/README.md` (or the proposal's, carried into that README if it isn't there yet): Zac's voice, emoji per heading, then a closing "Changes in this release" list built from the manifest's commits. Write `releases/upgrades/<tag>.md` in the guide format, `from: <manifest fromTag>`. Run `node scripts/draft-guides.mjs <fromTag> <tag>` and fix until it passes. Show the leftovers, i.e. entries mapped to notes or guide that neither draft covers. Then iterate with Zac until he says "approved".
  4. **Rehearsal.** Spawn a general-purpose subagent to:
     - clone the fixture repo (`zacbraddy/ang-upgrade-fixture`, named once in the skill) into `$TMP/fixture`;
     - read its `.claude/ang/version.json`, then fetch the base tree with giget at its `sha`;
     - take the target as the candidate's `src/`: `git archive HEAD src | tar -x -C "$TMP/cand"`. `HEAD` is right because stage 5 commits only `releases/`;
     - run `node scripts/draft-guides.mjs <fixture ref> <tag> > "$TMP/guides.json"`;
     - from the fixture clone, run the target engine's `upgrade plan`, then follow the target tree's `upgrade-ang` SKILL.md from Resolve to Finish, with `version write --ref <tag> --sha $(git rev-parse HEAD)`. Questions a guided route would ask Zac are recorded as proposals, not asked.

     It reports the route and counts, each conflict and conflict-delete and whether the guide explains it, its judgement calls and proposals, and the validate and test results. The skill shows Zac each unexplained one. He picks fix the guide (back to 3) or ship anyway.
  5. **Commit, tag, push.** Show the commands, then ask for the go:
     - `git add releases/notes/<tag>.md releases/upgrades/<tag>.md`;
     - `git commit -m "release: <tag>"`;
     - `git tag -a <tag> -m "<tag>"`;
     - `git push origin main <tag>`.
  6. **CI.** Find the tag's run (`gh run list --workflow release.yml --branch <tag>`) and `gh run watch <id> --exit-status`. On failure, show `gh run view <id> --log-failed`'s failing step. Once Zac has fixed it, and on his go, delete the tag locally and remotely and any draft release, then repeat 5.
  7. **Publish.** `gh release view <tag> --web`, tell Zac to press Publish, ask for the user and wait for him to say it's done.
  8. **Post-publish.**
     - In `$TMP/install`: `git init`, then `curl -fsSL https://github.com/zacbraddy/ang/releases/download/<tag>/install.sh | sh`. Check `.claude/ang/version.json`'s `ref` is the tag and its `sha` is `git rev-parse <tag>^{commit}`.
     - For a non-rc tag, also check `gh api repos/zacbraddy/ang/releases/latest --jq .tag_name` is the tag.
     - Spawn a subagent to run the fixture's own `upgrade-ang` skill with `<tag>` in a fresh clone, reporting as at 4. Show Zac the summary. On his go, commit `upgrade: Ang <tag>`, tag the fixture `<tag>` and push both.
     - Print what's done and what's left.
- **Bad release** (closing section): fix forward with a patch through the same stages. Tell Zac where to tick "Set as a pre-release" on the bad release (its GitHub release page, Edit), so `releases/latest` falls back to the previous release.
- End with `library validate`.

**Edge cases**
- The fixture's recorded `ref` isn't the manifest's `fromTag` (a missed roll-forward): the rehearsal uses the fixture's `ref` for `draft-guides` and says so. A multi-release chain is fine.
- The skill runs on `main`, not a stream branch, so the stream preflight compares other branches against `origin/main`.
- A re-run after a CI failure keeps the `release:` commit. The fix is a new commit, and the tag moves to the new `HEAD`.

**Deviations**
- The release notes template now lives in `releases/notes/README.md` (carried from the proposal), so `/cut-release` points at one place instead of carrying a fallback to the proposal.
- No stage 0 (Decide): running `/cut-release` is the decision, so the skill starts at Preflight. Stages keep the proposal's numbers 1 to 8.
- No Node LTS preflight check: a once-a-year date check would run on every release. The bump is the `node-lts-bump` trigger instead (Zac's call in review).

**Out of scope**
- Anything for rc.1 (no rehearsal, `from: none`) or v1.0.0's launch notes: story 11 and the `v1-launch-notes` trigger do those by hand (d38, d39).
- Creating or seeding the fixture repo (story 12). If story 12 names it differently, it updates the skill's one mention.
- Tuning the upgrade route thresholds (story 13).

## Review
Done-when evidence present: 183 tests pass (`draft-guides.test.mjs` covers every draft-guides line), nothing under `src/` names the new files, `releases/upgrades/README.md` names the script. Skill commands match the real `upgrade plan`/`guides`/`version write` flags, the release job's tag regex and the manifest's shape.

**Should-fix**
- `.claude/skills/cut-release/SKILL.md:51`: the rehearsal follows `upgrade-ang` through **Finish**, whose Clean up removes `$TMP`. The subagent was handed the release's `$TMP`, so it would wipe `manifest.json`, `coverage.json` and the folder stage 8 works in. Say Clean up removes only the plan's `tempDir` here.

**Nits**
- `c4/3-components.md:99` still says "Stages 0 to 8".
- `releases/notes/README.md:26` hardcodes Node 26, and the Node-bump preflight fix didn't name it. Superseded: the preflight check is gone, and the `node-lts-bump` trigger lists every place the minimum is named, this template included.

## Related
- [Release process proposal](../release-process-proposal.md)
- [C4 components: repo-only release tooling](../c4/3-components.md)
- [C4 code: repo-only](../c4/4-code.md)
- [Story 04](04-upgrade-guide-chaining.md)
- [Story 06](06-upgrade-ang-skill.md)
- [Story 08](08-release-workflow.md)
- [Story 09](09-release-manifest.md)
- [Story 11](11-cut-rc1.md)
- [Story 13](13-cut-rc2-with-rehearsal.md)
