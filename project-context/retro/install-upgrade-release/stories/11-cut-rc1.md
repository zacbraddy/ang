---
title: Cut v1.0.0-rc.1
shortDescription: The first release, cut with /cut-release, proving the job, the stamp, the publish flow and a live one-liner install
tags: [distribution, open-source]
status: done
owner: both
dependsOn: [06, 07, 10]
---
# Cut v1.0.0-rc.1

## Summary
The first real run of the whole release process, with no rehearsal because nothing exists to upgrade from. It ships `upgrade-ang`, so the fixture repo built from it can be upgraded in story 13.

## Outcome
`v1.0.0-rc.1` is published as a pre-release. The live one-liner installs it into a fresh repo and into an existing project with its own settings; `version.json` matches `git rev-parse` at the tag; `library init` and `library validate` pass; a re-run stops and points to upgrade. No `*.local.*` file, `install.sh`, `releases/` or `scripts/` content appears in the installed tree (k2, k6).

## Done when
- `gh release view v1.0.0-rc.1 --json isDraft,isPrerelease` shows `false`, `true`, with the stamped `install.sh` attached.
- `releases/notes/v1.0.0-rc.1.md` and `releases/upgrades/v1.0.0-rc.1.md` are on `main` in the tagged `release: v1.0.0-rc.1` commit, and the guide says `from: none`.
- The post-publish checks below all passed, and their results are recorded in this story's **Result** section.
- Any fix-forward found on the way is merged before the tag, or recorded as work if Zac ships without it.
- The `v1-launch-notes` trigger's intent also covers adding the `releases/latest` one-liner to the README.
- `library validate` passes.

## Acceptance criteria
**First-release states (handled by hand, d38)**
- Given preflight runs, then the README one-liner check fails, and Zac carries on: the README gets its `latest` line with v1.0.0, since `releases/latest` ignores pre-releases and would 404 until then.
- Given the manifest, then `fromTag` is `null` and the range covers all of history.
- Given the notes are drafted, then "Changes in this release" is one line saying this is Ang's first release and everything in it is new, not one line per commit.
- Given the guide is drafted, then it says `from: none` with `- None` under all four headings, and it passes `parseGuide` (below) in place of `draft-guides.mjs`, which can't chain from nothing.
- Given stage 4 (Rehearsal) and stage 8's fixture roll-forward, then both are skipped: the fixture is built from this release in story 12.

**Release job (story 08's first real run)**
- Given the tag is pushed, then the job sets `--prerelease`, the tests and smoke install pass on the runner, and it leaves a draft release with the stamped asset.
- Given the job fails, then `/cut-release` stage 6 runs as written: Zac fixes on `main`, the tag and draft are deleted on his go, and stage 5 repeats.

**Post-publish install**
- Given a fresh `git init` repo, when `curl -fsSL https://github.com/zacbraddy/ang/releases/download/v1.0.0-rc.1/install.sh | sh` runs, then `.claude/ang/version.json` names `v1.0.0-rc.1` and `git rev-parse v1.0.0-rc.1^{commit}`, and `library init` then `library validate` pass.
- Given the same repo, when the one-liner runs again, then it stops with "Ang is already installed here" and points to `/upgrade-ang`, changing nothing.
- Given a scratch repo with its own committed `.claude/settings.json` and `CLAUDE.md`, when the one-liner runs, then the settings are merged (Zac's keys kept, Ang's added, `settings.json.pre-ang` written), `CLAUDE.md` is untouched, and `library init` and `library validate` pass.
- Given either installed tree, then no path matches `*.local.*`, no `install.sh`, `releases/` or top-level `scripts/` exists, and every file Ang added is in `git ls-tree -r --name-only v1.0.0-rc.1 -- src/`.

## Test plan
- No new tests for the release itself: it's proven by the post-publish checks above (plan test strategy).
- A fix-forward to code (`install.sh`, the release job, a script) goes test-first, as in any story, and lands on `main` before the tag.
- **Won't test**: skill prose, `gh` behaviour, GitHub's pre-release handling of `releases/latest`.

## Guide
1. In a fresh session on the main checkout, run `/cut-release`. Keep this story open: it lists where the run departs from the skill.
2. **Preflight:** expect the README one-liner warning. Say carry on. Fix anything else it lists, or decide to carry on.
3. **Gather:** check the scout's themes look like Ang as a whole (it's the first release, so everything is user-facing or internal; no upgrade hazards). Pick `v1.0.0-rc.1`.
4. **Draft and approve:** review the notes in your voice. Tell the agent to use the single "first release" line under Changes, and to run the `parseGuide` check instead of `draft-guides.mjs`. Say "approved" when happy.
5. **Rehearsal:** tell the agent to skip it.
6. **Commit, tag, push:** read the four commands, then give the go.
7. **CI:** if it fails, read the failing step, decide the fix with the agent, and give the go to delete the tag and recut.
8. **Publish:** in the browser tab the agent opens, check the draft is marked as a pre-release and has `install.sh` attached, then press **Publish** and tell the agent.
9. **Post-publish:** tell the agent to skip the fixture roll-forward and run this story's extra install checks before it removes its temp folder. Read the results.

## Prepared in advance (agent)
- The `parseGuide` check for stage 3, from the repo root:
  ```bash
  node -e "import('./src/.claude/scripts/ang/upgrade/guides.mjs').then(m => console.log(m.parseGuide(require('fs').readFileSync('releases/upgrades/v1.0.0-rc.1.md', 'utf8'))))"
  ```
  It should print `version: 'v1.0.0-rc.1'` and `from: null`.
- The existing-project scratch repo, in the release's `$TMP/existing`: `git init`, a `.claude/settings.json` with one permission and one hook of Zac's own, a one-line `CLAUDE.md`, committed (`install.sh` needs a clean tree).
- The leak check, run in each installed repo before `library init`:
  ```bash
  find . -path ./.git -prune -o \( -name '*.local.*' -o -name install.sh \) -print
  ls -d releases scripts 2>/dev/null
  git -C <ang repo> ls-tree -r --name-only v1.0.0-rc.1 -- src/ | sed 's|^src/||' | sort > "$TMP/shipped"
  git ls-files --others --exclude-standard | grep -v -e '^\.claude/settings\.json\.pre-ang$' -e '^\.claude/ang/version\.json$' | sort | comm -23 - "$TMP/shipped"
  ```
  All three print nothing.

## Record afterwards
- A **Result** section in this story: the release URL, the tag's commit, any CI recut and why, the install-check results, and any fix-forward or recorded work.
- Anything the first run showed was wrong in `/cut-release` or the release job, raised as recorded work, not fixed in the release session if it isn't blocking.
- Run `trigger` to extend `v1-launch-notes`: when v1.0.0 is drafted, add `curl -fsSL https://github.com/zacbraddy/ang/releases/latest/download/install.sh | sh` to the README as the install line.

## Implementation notes
- The run departs from `.claude/skills/cut-release/SKILL.md` only at the first-release states above. The skill isn't changed for them (d38).
- `releases/upgrades/v1.0.0-rc.1.md`:
  ```markdown
  # Upgrade guide v1.0.0-rc.1
  from: none
  ## Moves
  - None
  ## Migrations
  - None
  ## Retired
  - None
  ## Notes for the merge
  - None
  ```
- The unstamped `install.sh`'s fallback message names the `latest` URL, which 404s until v1.0.0. That's a pre-v1 state only, so it stays as is.
- `.github/workflows/release.yml`'s smoke install has never run on a GitHub runner. If it fails on the runner's missing git identity or the like, fix it in the job, test-first where there's code to test.
- **Out of scope:** the fixture repo (story 12), the first rehearsal and threshold tuning (story 13), v1.0.0's launch copy (`v1-launch-notes`).
- `/cut-release` ran in the `/implement-story` session rather than a fresh one, so the first-release departures stayed in context.

## Result
- **Release:** https://github.com/zacbraddy/ang/releases/tag/v1.0.0-rc.1, published as a pre-release with the stamped `install.sh` attached. Tag `v1.0.0-rc.1` is on `faa0de3`, the `release: v1.0.0-rc.1` commit.
- **Preflight:** three expected warnings, carried on: no CI run on `main` (no CI workflow exists yet; the open-source-hygiene item brings one), the README one-liner (first release), and the `documentation` stream's one unmerged `src/` file, left for the next release.
- **Fix-forward before the tag:** the scout found that `src/docs/procedures/running-ang-streams-in-orca.md`, the only file under `src/docs/`, was ohnvm-era source material, not a shipped how-to. It moved to `project-context/raw/` as source for the docs site's Orca page (`d8a0010`). Installs no longer create a `docs/` folder. Because no release had shipped it, it needs no upgrade guide entry.
- **CI:** the release job passed first time, smoke install included, in 16s. No recut.
- **Fresh repo:** the one-liner installed; `version.json` named `v1.0.0-rc.1` and `faa0de3f01e1f4cf2d60a36d6da51b82c4ced3cd`, matching `git rev-parse v1.0.0-rc.1^{commit}`. `library init` and `library validate` passed. A re-run stopped with "Ang is already installed here", pointed to `/upgrade-ang` and changed nothing.
- **Existing project:** with its own permission and `PostToolUse` hook, both were kept and Ang's permission, output style and four hook events were added. `settings.json.pre-ang` matched the original, `CLAUDE.md` was untouched, and `library init` and `library validate` passed.
- **Leak check:** all three checks printed nothing in both repos, and neither had a `docs/` folder.
- **Skipped as planned:** stage 4 (Rehearsal), the fixture roll-forward and the `releases/latest` check.
- **Trigger:** `v1-launch-notes` now also adds the `releases/latest` install line to the README.

## Review
Every Done-when item checks out: the release is a published pre-release with `install.sh` attached, the tag is on `faa0de3` on `origin/main`, the guide parses to `from: null`, the trigger's intent covers the README line and `library validate` passes. A fresh-repo re-run of the one-liner reproduced the version stamp, the clean leak check and the "already installed" stop.

**Must-fix:** none.

**Should-fix:** none.

**Nit**
- `11-cut-rc1.md:98`: the "ran in the `/implement-story` session" line records what happened, so it belongs in **Result** rather than the implementation notes, which are written for whoever runs the story.
- `11-cut-rc1.md:100`: **Record afterwards** asks for any `/cut-release` or release-job problems raised as recorded work, but **Result** doesn't say whether there were any. One line ("nothing to raise", or what was raised) closes it.

## Related
- [Plan: success measures](../plan.md)
- [Release process proposal](../release-process-proposal.md)
- [Story 08](08-release-workflow.md)
- [Story 10](10-release-scout-and-cut-release.md)
- [Story 12](12-fixture-repo.md)
- Upgrade guide format: `releases/upgrades/README.md`
