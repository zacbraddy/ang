---
title: Cut v1.0.0-rc.2 with rehearsal
shortDescription: The second release, cut with the first real rc.1 to rc.2 fixture upgrade rehearsal and roll-forward, closing the epic
tags: [distribution, open-source]
status: done
owner: both
dependsOn: [12]
---
# Cut v1.0.0-rc.2 with rehearsal

## Summary
The epic's finish line: `/cut-release` takes rc.2 from preflight to post-publish. This is the first run of stage 4 (Rehearsal) and stage 8's fixture roll-forward against the fixture repo. It proves the real upgrade path end to end: fetching the base tree, chaining guides from rc.1, `upgrade plan` against a seeded install, `version write`, and validate and tests in the upgraded fixture.

Route threshold tuning is dropped from this story. `src/` barely changes between rc.1 and rc.2, so the rehearsal takes the fast route and has no conflicts to learn from, and any tuning before real users report problems would rest on made-up data. It's parked, to wake on a user report.

## Outcome
The rc.1 to rc.2 fixture upgrade keeps every seeded local edit and the local-only skill and agent, leaves no conflict-delete the guide doesn't explain, and passes `library validate` and the shipped tests; a second run stops with "Already on the target". The coverage check shows no leftover manifest entries. `v1.0.0-rc.2` is published and the real upgrade is committed and tagged in the fixture repo. The threshold tuning promise is replaced everywhere with the parked entry.

## Done when
- `gh release view v1.0.0-rc.2 --json isDraft,isPrerelease` shows `false`, `true`, with the stamped `install.sh` attached.
- `releases/notes/v1.0.0-rc.2.md` and `releases/upgrades/v1.0.0-rc.2.md` are on `main` in the tagged `release: v1.0.0-rc.2` commit, and the guide says `from: v1.0.0-rc.1`.
- In the fixture repo, `main` has an `upgrade: Ang v1.0.0-rc.2` commit with lightweight tag `v1.0.0-rc.2` on it, and its `.claude/ang/version.json` names `v1.0.0-rc.2` and `git rev-parse v1.0.0-rc.2^{commit}` from the Ang repo.
- The threshold parking edits (Implementation notes) are on `main` before the tag.
- This story's **Result** section records the rehearsal and roll-forward reports, the extra checks below and anything fixed forward or raised.
- `library validate` passes.

## Acceptance criteria
**Preflight**
- Given preflight runs, then the expected warnings are no CI run on `main` (no CI workflow yet), the README one-liner (`releases/latest` still skips pre-releases) and the `documentation` stream's unmerged `src/` file. Zac carries on; anything else he fixes or decides on.

**Gather and draft**
- Given the manifest, then `fromTag` is `v1.0.0-rc.1` and the coverage check prints nothing.
- Given the upgrade guide is drafted, then it says `from: v1.0.0-rc.1`, has `- None` under every heading the scout's hazards don't fill, and `node scripts/draft-guides.mjs v1.0.0-rc.1 v1.0.0-rc.2` exits 0.

**Rehearsal (stage 4)**
- Given the fixture is cloned, then its `version.json` `ref` is `v1.0.0-rc.1`, so the chain runs from `fromTag` with no missed roll-forward.
- Given the plan, then its route is `fast` (or `agent-resolved` if a clean merge appears), every seeded file is `keep-local`, and `skills/fixture-notes`, `agents/fixture-auditor` and `rules/fixture-house-style.md` are `local-only`.
- Given the upgrade is applied, then `git diff --name-only` in the fixture lists only files the manifest changed under `src/`, plus `.claude/ang/version.json` (and `.claude/settings.json` only if Ang's settings changed). No seeded edit is lost.
- Given the applied fixture, then `library validate` and `node --test .claude/scripts` pass.
- Given a `conflict` or `conflict-delete` the guide doesn't explain, then Zac picks: fix the guide (back to stage 3) or ship anyway.
- Given the rehearsal fails on the mechanics (giget, guide chaining, the plan or apply engine), then the fix goes test-first on `main` before the tag, and stage 4 reruns.

**Post-publish**
- Given the fixture roll-forward is committed, tagged and pushed, when `node .claude/scripts/ang-context-manager.mjs upgrade target --to v1.0.0-rc.2` runs in `"$TMP/fixture-up"`, then it prints `"status": "current"` (the skill's "Already on the target" stop).
- Given the real install in `"$TMP/install"`, then `version.json` names `v1.0.0-rc.2` and its tag's commit.

## Test plan
- No new tests for the release itself: the rehearsal and the post-publish checks are the end-to-end level (plan test strategy).
- The `size.mjs` change is comment-only, so it needs no test, and `size.test.mjs`'s boundaries stay as they are.
- A fix-forward to code goes test-first, as in any story, and lands on `main` before the tag.
- **Won't test**: skill prose, `gh` behaviour, giget.

## Guide
1. In the `/implement-story` session, the agent makes the threshold parking edits (Implementation notes). Review them and commit as `execution: park route threshold tuning`, then push. `/cut-release` needs a clean `main` level with `origin/main`.
2. In the same session, run `/cut-release`.
3. **Preflight:** expect the three warnings above. Say carry on, or fix anything else.
4. **Gather:** the themes should be small: the comment change, stories 11 to 13 and the parked entry. Pick `v1.0.0-rc.2`.
5. **Draft and approve:** the notes are short, a "second lap of the release process" release, in your voice. "Changes in this release" lists the commits; trim the library-only ones with the agent. Say "approved" when happy.
6. **Rehearsal:** read the report. Decide on any unexplained conflict, which shouldn't happen given `src/` barely moved.
7. **Commit, tag, push:** read the four commands, then give the go.
8. **CI:** if it fails, decide the fix with the agent and give the go to delete the tag and recut.
9. **Publish:** in the browser tab, check the draft is a pre-release with `install.sh` attached, press **Publish** and tell the agent.
10. **Post-publish:** read the roll-forward summary and give the go to commit, tag and push the fixture. Then tell the agent to run this story's second-run check before it removes `$TMP`.

## Prepared in advance (agent)
- The threshold parking edits, ready for step 1 (Implementation notes).
- The second-run check, in `"$TMP/fixture-up"` after the push:
  ```bash
  git status --porcelain   # prints nothing
  node .claude/scripts/ang-context-manager.mjs upgrade target --to v1.0.0-rc.2
  ```
  It should print `"status": "current"`.
- The kept-edits check, in the applied fixture before the commit (rehearsal and roll-forward both):
  ```bash
  git diff --name-only
  ```
  Compare it with the manifest's `src/` files (`jq -r '.files[].path | select(startswith("src/"))' "$TMP/manifest.json"`, minus the `src/` prefix). Anything else in the list is a seeded edit or local file the upgrade touched.

## Record afterwards
- A **Result** section in this story: the release URL and tag commit, the preflight warnings, the rehearsal's route and counts, any conflict and Zac's call on it, the roll-forward commit and tag in the fixture, the second-run and kept-edits results, any CI recut and any fix-forward.
- Anything `/cut-release`, `upgrade-ang` or the release job got wrong, raised as recorded work if it isn't blocking. Say "nothing to raise" if so.
- If the rehearsal hits a stranded file at an old path, mention the parked "Undeclared moves on no-record upgrades" entry's wake condition to Zac.

## Implementation notes
- **Threshold parking edits**, made before `/cut-release` so they ship in rc.2:
  - `src/.claude/scripts/ang/upgrade/size.mjs:1`: the comment becomes `// Starting values from the upgrade merge spike. Revisit when users report upgrades taking the wrong route.` The values stay 5 and 12. This is also rc.2's one `src/` change, so the rehearsal has an upstream-only file to fast-path.
  - `ideas/parked.md`: a new **Route threshold tuning** entry. What: retune `AGENT_RESOLVES_UP_TO` and `WARN_FROM` in `size.mjs` (and the boundary cases in `size.test.mjs`, the prose in `upgrade-routes.md` and d9). Why parked: they rest on the spike's two runs, and the only data that would justify a change is real users' upgrades. Wake condition: an Ang user reports an upgrade that took the wrong route, e.g. guided for trivial conflicts or agent-resolved when it should have asked. Source: parked in execution on 2026-11-20, Zac's call while writing this story.
  - `upgrade-routes.md:17`: "tuned after the `rc.2` rehearsal and real upgrades" becomes a pointer to the parked entry.
  - `plan.md` Risks row for the thresholds: mitigation becomes "Named constants, tuning parked until users report a wrong route".
  - `state replace install-upgrade-release d9`: "tuned after rc.2" becomes "tuning parked until a user reports a wrong route (Zac's call)".
  - `state status install-upgrade-release active`: refresh the stale note ("13 draft stories; next /write-story on 01").
- The run follows `.claude/skills/cut-release/SKILL.md` as written, with no first-release departures. The only addition is the second-run check after stage 8's push.
- The rehearsal runs the fixture's rc.1 `upgrade-ang` with the candidate's engine (d36). The roll-forward runs the fixture's own rc.1 skill against the published rc.2.
- `v1-launch-notes`'s `file:` condition comes true when `releases/notes/v1.0.0-rc.2.md` is committed. Its custom condition (a v1.0.0 draft exists) doesn't, so `library validate` will report it as needing judgement, not ready. Don't run it.
- **Out of scope:** threshold tuning (parked), v1.0.0 and its launch copy (`v1-launch-notes`), the `documentation` stream's `src/` edit, gapped-version rehearsals (parked).
- The rehearsal plan has no `local-only` entries: the engine reads only paths in the base tree, the target tree or a move's old path, so purely local files (`fixture-notes`, `fixture-auditor`, `fixture-house-style.md`) never enter the plan. They stayed untouched, which is the outcome the criterion was after; its expected `local-only` tag was wrong, not the engine.
- The fixture push in stage 8 failed over HTTPS (`could not read Username`), because `/cut-release` clones the fixture by its HTTPS URL and this machine pushes over SSH. Pushed to `git@github.com:zacbraddy/ang-upgrade-fixture.git` instead, same refs. Fixed forward: `/cut-release` stages 4 and 8 now clone the fixture over SSH.

## Result
- **Release:** https://github.com/zacbraddy/ang/releases/tag/v1.0.0-rc.2, tag `v1.0.0-rc.2` on `e214f84` (`release: v1.0.0-rc.2`). Published as a pre-release with `install.sh` attached. CI passed first time, no recut.
- **Preflight:** the three expected warnings only: no CI run on `main`, no `releases/latest` README one-liner, and the `documentation` stream's one unmerged `src/` file (`review-story/SKILL.md`).
- **Gather:** `fromTag` `v1.0.0-rc.1`, one `src/` file (`size.mjs`), 5 commits, no 10k docs, archived epics or settings diff. Coverage check printed nothing. Notes trimmed to the one non-library commit; the guide is `- None` throughout.
- **Rehearsal:** fixture at `v1.0.0-rc.1` (no missed roll-forward). Route `fast`: 92 unchanged, 7 keep-local (every seeded edit), 1 fast-path (`size.mjs`), 0 conflicts or conflict-deletes. `library validate` passed, `node --test .claude/scripts` 125/125.
- **Kept-edits check (rehearsal and roll-forward):** `git diff --name-only` listed only `.claude/scripts/ang/upgrade/size.mjs` and `.claude/ang/version.json`, matching the manifest. No seeded edit or local file touched, nothing stranded.
- **Real install:** `version.json` named `v1.0.0-rc.2` and `e214f84`.
- **Roll-forward:** the fixture's own rc.1 `upgrade-ang` took the same fast route with no questions. Committed as `upgrade: Ang v1.0.0-rc.2` (`157cf6d`) with lightweight tag `v1.0.0-rc.2`, pushed to the fixture's `main`.
- **Second run:** clean tree, `upgrade target --to v1.0.0-rc.2` printed `"status": "current"`.
- **Fix-forward:** the fixture clone in `/cut-release` stages 4 and 8 now uses SSH, so stage 8's push works (Implementation notes). **Raised:** nothing. No stranded files, so the undeclared-moves parked entry stays asleep.

## Review
Every Done-when item checks out: the release is a pre-release with `install.sh`, the tag is on `e214f84` with both release files and `from: v1.0.0-rc.1`, the fixture's `main` is `157cf6d` with its tag and `version.json` naming `e214f84`, the parking commit comes before the tag, `library validate` passes and the tests pass 125/125.

**Should-fix**
- The Outcome says the threshold tuning promise is replaced everywhere, but the C4 docs still promise it: `c4/3-components.md:66` and `c4/4-code.md:40` say "tuned after `rc.2` (d9)". Point both at the parked entry. Story 05:17 is a done story's record, so leave it.
- The `statusNote` in `state.json` still reads "Story 13 … in progress". Once this story is done, every story in the epic is done, so the note should say the epic is ready for `/retro`.

**Nit**
- `stories/13-cut-rc2-with-rehearsal.md:96`: a stray blank line splits the Implementation notes list in two.

## Related
- [Plan: success measures](../plan.md)
- [Upgrade routes](../upgrade-routes.md)
- [Story 06](06-upgrade-ang-skill.md)
- [Story 11](11-cut-rc1.md)
- [Story 12](12-fixture-repo.md)
- [Parked work](/project-context/ideas/parked.md)
