---
title: upgrade-ang skill
shortDescription: The shipped upgrade-ang skill drives an upgrade end to end, resolving the target with a new tested upgrade target command, running the target release's engine and taking whichever of the four upgrade routes the plan picks, without ever committing
tags: [distribution, open-source]
status: done
owner: agent
dependsOn: [02, 05]
---
# upgrade-ang skill

## Summary
The judgement half of an upgrade, shipped in `src/` so it is in every install from rc.1 on: the fixture repo is an rc.1 install, and the rc.1 to rc.2 rehearsal needs the skill already there. Only the engine comes from the target tree (d29, decision 29). Resolving the target and the d13 (decision 13) newer-or-downgrade check is deterministic, so it's a small tested command, `upgrade target`, that runs from the *installed* engine because the target isn't fetched yet (Zac's call, 2026-11-18).

## Outcome
`upgrade-ang` runs the checks (d13), resolves the target with `upgrade target`, fetches the target and base trees with giget into a temp folder, runs `upgrade guides` and `upgrade plan` from the target tree, and takes the plan's route ([upgrade routes](../upgrade-routes.md)). On every route it rereads clean merges against upstream's diff and Retired entries, resolves the conflicts it's sure of, and checks conflict-deletes as moves, recording each as a `resolution` in the plan. Agent-resolved asks the user nothing. Guided confirms only the merges that risk breaking Ang or a customisation. Guided with warning first shows the conflict count and a risk assessment and suggests owning a fork, and the user decides (all or nothing, d26). It then runs `upgrade apply`, `settings merge` with the base tree's settings, `version write`, the guides' Migrations, `library validate` and the shipped tests, and prints a summary. Changes stay unstaged. Dry-run against hand-built trees here; proven for real in story 13.

## Done when
- `node --test 'src/.claude/**/*.test.mjs'` passes, with a test for every **Target** acceptance line.
- `node .claude/scripts/ang-context-manager.mjs upgrade --help` lists `upgrade target [--to <tag>]`.
- `src/.claude/skills/upgrade-ang/SKILL.md` exists, `.claude/skills/upgrade-ang` links to it (story 01's per-entry links), and `library validate` passes.
- A dry run, written up under **As built**: in a scratch git repo with Ang installed from a hand-built base tree plus local edits, the implementer follows the skill from "Plan" onwards with a hand-built target tree standing in for giget. It reaches `agent-resolved` and `guided-with-warning` (`--base none`) at least once each, ends with the changes unstaged and `git diff --cached` empty, and removes its temp folders.

## Acceptance criteria
**Target** (`upgrade target [--to <tag>]`)

`from` is the version record, or `null`. `to` is `{ ref, sha }`. Output is `{ status, from, to }` as JSON, exit 0.
- Given no `--to`, when it runs, then `to` is GitHub's latest non-prerelease release (`/releases/latest`) with its commit SHA.
- Given no `--to` and no stable release exists (404), then it prints `✖` saying there is no stable release yet and to name a tag, e.g. `/upgrade-ang v1.0.0-rc.2`, and exits 1.
- Given `--to <tag>` for a published release, then `to.ref` is that tag and `to.sha` its 40-hex commit SHA. Given a tag that doesn't exist or is a draft, then it prints `✖ <tag> isn't a published Ang release` and exits 1.
- Given a record whose `ref` equals `to.ref`, then `status` is `current`.
- Given a record whose tag sorts after `to.ref`, then `status` is `downgrade`. Given one that sorts before, then `upgrade`.
- Given no record, or a record whose `ref` isn't a version tag, then `status` is `no-record` and `from` is `null`.
- Tags sort as semantic versions with prereleases: `v1.0.0-rc.1 < v1.0.0-rc.2 < v1.0.0 < v1.1.0`, and `rc.10` sorts after `rc.9`.
- Given a network error, an exhausted rate limit or any other non-OK answer, then it prints `✖` naming which, with the same fix lines as `install.sh`, and exits 1.

**Checks** (skill)
- Given a dirty working tree (`git status --porcelain` not empty), when `/upgrade-ang` runs, then it stops before fetching anything and says to commit or stash first.
- Given `git` or `npx` missing, or Windows outside WSL, then it stops with the same messages `install.sh` gives.
- Given `upgrade target` says `current`, then it stops with "already on the target <tag>". Given `downgrade`, then it stops saying the installed release is newer and to name a newer tag. Given it exits 1, then the skill passes its message on and stops.
- In every stop above, nothing in the project changes and no temp folder is left.

**Fetch and plan** (skill)
- Given `upgrade`, when it fetches, then the target tree comes from giget at `to.sha` and the base tree at `from.sha`, both into one temp folder. Given `no-record`, then there's no base fetch, no `upgrade guides` call, and `upgrade plan` gets `--base none`.
- Given the trees, then `upgrade guides --from <from.ref> --to <to.ref>` and `upgrade plan` both run from the **target** tree's `ang-context-manager.mjs` with the project root as the working folder, and the guides JSON is passed as `--guides`.
- Given a giget, guides or plan failure, then it stops naming the step, nothing in the project changes, and the temp folders are removed.

**Routes** (skill)
- Given `fast`, then it goes straight to apply without asking anything.
- Given `agent-resolved`, then it rereads every `clean-merge` against upstream's diff (base → target) and the guides' Retired entries, resolves every conflict, and asks nothing.
- Given `guided`, then it resolves everything it's sure of and asks the user only about merges that could break how Ang runs or leave one of their customisations inoperable, one at a time, with its proposed resolution. The user confirms or corrects each.
- Given `guided-with-warning`, then before resolving anything it shows the conflicted file and hunk counts and its risk assessment for the user's customisations, and suggests they may prefer to own their Ang as a fork. If they stop, the temp folders are removed and nothing changes. If they go ahead, it runs as guided.
- Given a `conflict-delete` whose content now lives at another path upstream (an undeclared move), then it carries the user's edits into that path's `mergedFile` and resolves the old path `delete`, and the summary says so.
- On every route, every conflict ends with a `resolution` and a `mergedFile` without markers, and the summary lists each judgement call with a one-line reason.

**Apply and finish** (skill)
- Given a resolved plan, then it writes the plan to the temp folder and runs `upgrade apply --plan` from the target tree. Given apply refuses, then it fixes the listed problems and reruns; it never writes files itself to work around a refusal.
- Given apply succeeds, then it runs `settings merge --base <base tree settings.json|none> --ours .claude/settings.json --theirs <target tree settings.json>` and reviews each conflict it prints the same way as a file merge (asking on guided routes only when risky).
- Then `version write --ref <to.ref> --sha <to.sha>`, then each Migration from the guides: done itself when it's sure, otherwise asked of the user, writing to the working tree only.
- Then `library validate` and `node --test '.claude/**/*.test.mjs'` from the project. Given either fails, then it says so plainly in the summary.
- Given any step after apply fails in a way it can't recover from (validate or tests failing, a `settings merge` or `version write` error), then it says the upgrade is unfinished, reports what went wrong and what is already written, and hands over. It gives the user their two options: fix it by hand from where things stand, or discard everything with `git restore . && git clean -fd` (safe because the tree was clean before). It doesn't revert or retry on its own.
- The summary gives from → to, the route, what applied cleanly vs. by judgement vs. by the user, settings and Migration outcomes, local text still using Retired names, validate and test results, how to review (`git status`, `git diff`), how to discard (`git restore . && git clean -fd`) and a reminder to commit `.claude/ang/version.json` with the rest.
- Given any finish, then `git diff --cached` is empty, nothing is committed, and the temp folders are removed.

## Test plan
- **Unit** (`node:test`, `src/.claude/scripts/ang/upgrade/target.test.mjs`):
  - `compareTags` over the ordering line, including `rc.9` vs `rc.10` and an unparseable tag.
  - `targetStatus(record, to)` for `current`, `upgrade`, `downgrade` and both `no-record` cases.
  - `resolveRelease(fetch, tag?)` with a stub `fetch`: latest, named tag, 404, draft, rate limit, network error, non-OK, non-hex SHA.
- **Integration** (`src/.claude/scripts/cli.test.mjs`): a local HTTP server like `serveGuides`, pointed at with `ANG_GITHUB_API`. One `upgrade target` run each for `upgrade` (with a record), `no-record`, latest-404 and a draft tag. Plus `upgrade --help` listing `upgrade target`.
- **Dry run** (manual, see Done when): the skill's prose isn't unit-tested (test strategy). The dry run is the evidence for the Checks, Fetch and plan, Routes and Apply and finish lines it can reach without giget; story 13 proves the rest for real.
- **Won't test**:
  - GitHub's API behaviour beyond the stubbed responses;
  - giget itself;
  - the agent's merge judgement (story 13's rehearsal is the check);
  - exact message wording (assert the key phrase and the exit code).

## Implementation notes
- **Files**:
  - `src/.claude/scripts/ang/upgrade/target.mjs` (new): `parseTag`, `compareTags(a, b)`, `targetStatus(record, to)`, `resolveRelease(fetch, tag?, api = process.env.ANG_GITHUB_API ?? 'https://api.github.com')`.
  - `src/.claude/scripts/ang/commands/upgrade.mjs` (changed): adds `upgrade target [--to <tag>]`. It reads the record the same way `version show` does (d35: only through the version commands' module, so share the reader rather than reading the file twice).
  - `src/.claude/skills/upgrade-ang/SKILL.md` (new), plus its per-entry link at `.claude/skills/upgrade-ang` (story 01).
- **`upgrade target`**:
  - Port `install.sh`'s `fetch_sha`: `GET /repos/zacbraddy/ang/releases/latest` or `/releases/tags/{tag}` (reject `draft`), then `GET /commits/{tag}` with `accept: application/vnd.github.sha`. Same rate-limit (`403`/`429` with `x-ratelimit-remaining: 0`), network and non-OK messages, so a user sees one voice.
  - `dispatch` doesn't await `run`, so catch the promise's rejection into `fail` as `upgrade guides` does.
  - Tag grammar: `v<major>.<minor>.<patch>` with an optional `-<prerelease>` of dot-separated parts; numeric parts compare as numbers, a release sorts after its prereleases. No dependency for this.
  - It runs from the installed engine, so it ships in rc.1 with this story; later releases can change it freely.
- **SKILL.md shape**: frontmatter `name`, `description` ending "Use when the user runs /upgrade-ang.", `disable-model-invocation: true`, `argument-hint: "[tag]"`; then the `session steps upgrade-ang` line; then numbered bold-lead stages matching the C4 components table: Checks, Target, Fetch, Plan, Warn (guided with warning only), Resolve, Apply, Finish. Describe what to do, not what not to do. Point to [upgrade routes](../upgrade-routes.md)' content by restating the route behaviour briefly in the skill; the library doc doesn't ship.
- **Running the target engine**: `node <tmp>/target/.claude/scripts/ang-context-manager.mjs …` from the project root, so `PROJECT` (`CLAUDE_PROJECT_DIR` or the current folder) is the install. giget as `install.sh` does: `npx -y giget@3.3.1 "gh:zacbraddy/ang/src#<sha>" <dir> --force </dev/null`.
- **Plan JSON**: the route name is at `.route.route`. Conflicted categories are `conflict`, `conflict-no-base` and `conflict-delete`. The skill edits `mergedFile`s in place under `tempDir` and sets `resolution` (`write`, `delete` or `keep`) on each conflict, then saves the whole plan for `upgrade apply`. Remove both the giget temp folder and the plan's `tempDir` on every exit.
- **Edge cases**:
  - `upgrade guides` doesn't check direction; `upgrade target` has already stopped a downgrade before it runs.
  - A user several majors behind upgrades one release at a time by naming each tag (d27). The skill doesn't enforce it; a long guide chain just makes a bigger plan.
  - The skill may overwrite its own SKILL.md during apply. That's fine: the running prompt is loaded and the new one applies next run.
  - `settings merge` already keeps the user's scalar and both array entries on conflict; the skill reviews those, it doesn't redo the merge.
- **Out of scope**:
  - tuning `AGENT_RESOLVES_UP_TO` and `WARN_FROM` (story 13);
  - the user docs explaining routes and why the upgrade isn't deterministic (documentation stream, from [upgrade routes](../upgrade-routes.md));
  - pre-open-source upgrades beyond the `no-record` route (d8).

- **Deviations (small)**:
  - The skill's Checks also check Node 26+, as `install.sh` does: the target engine runs on the user's Node. `install.sh` has no "git missing" message, so the skill's is new wording in the same voice.
  - `cli.test.mjs`: `serveGuides` is now `serve` (it also serves the stubbed GitHub API), and `runAsync` takes the project's files so `upgrade target` can read a record.
  - `version show` and `upgrade target` share `readVersionRecord()`, exported from `commands/version.mjs` (d35).

## As built
**Dry run, 2026-11-18.** Base tree: this branch's `src/` (tracked and new files, no `.local.` files). Target tree: a copy with one change per shape: an appended line in `kill/SKILL.md`, a changed `Next:` line in `implement-story/SKILL.md`, a reworded Spike line in `engineering-defaults.md`, `streams/conventions.md` renamed to `streams-conventions.md` with no Moves entry, a new `.claude/ang/new-in-rc2.md`, and one extra permission in `settings.json`. A hand-built guides JSON stood in for `upgrade guides`, with one Migration (`library index`), one Retired entry ("no polish") and one note. The scratch repo installed the base with an `rc.1` record, then committed local edits: `(local)` on step 1 of `implement-story`, a timebox on the Spike line, a paragraph added to `conventions.md`, and `outputStyle: Terse`.

- **Run 1, `agent-resolved`** (2 conflicted files, 2 hunks, 1 clean merge). Followed the skill from Plan:
  - The `implement-story` clean merge kept both edits, and the reread against upstream's diff found nothing to fix.
  - The Spike-line conflict was resolved to upstream's wording plus the user's timebox.
  - The `conflict-delete` on `conventions.md` matched the target's `streams-conventions.md` byte for byte, so it was an undeclared move. `git merge-file` carried the local paragraph into the new path's `mergedFile`, and the old path was resolved `delete`.
  - `upgrade apply` wrote 5 files and deleted 1. `settings merge` added the permission and kept `Terse` (silently: `outputStyle` is a skipped key). Then `version write`, the Migration, `library validate` ✔ and the shipped tests (128 pass).
  - The "no polish" grep found the merged Spike line, for the summary.
  - Both temp folders were removed, `git diff --cached` was empty and nothing was committed.
- **Discard:** `git restore . && git clean -fd` returned the tree to clean, as the summary advises.
- **Run 2, `guided-with-warning`** (`--base none` after committing the record's removal; 3 `conflict-no-base`, 4 hunks).
  - At Warn the risk was low (wording only, both local customisations survive), so the run went ahead.
  - Each hunk was settled by its side: upstream's note in `kill`, the user's `(local)`, upstream's `Next:` line, and the combined Spike line. None counted as risky, so there were no questions.
  - Apply, settings, record, validate and tests all passed. Temp folders removed, `git diff --cached` empty.
- **Not reached by the dry run** (story 13 proves them for real): `upgrade target` and giget against GitHub, the Checks stops, a risky merge confirmed with the user, an `upgrade apply` refusal, and the unrecoverable-failure handover.
- **Found:** with no record, an undeclared move of a file the user edited isn't visible in the plan. The old path isn't in the target, so it's neither in the plan nor removed: run 2 left the local `conventions.md` beside the new `streams-conventions.md`, and the user's paragraph never reached the new path. The skill's `conflict-delete` handling only covers runs with a base.

## Review
Tests pass (128), `upgrade --help` lists `upgrade target`, `library validate` passes, and the dry run covers what it claims. `target.mjs` is tight and matches `install.sh`'s voice.

**Must-fix:** none.

**Should-fix**
1. `src/.claude/skills/upgrade-ang/SKILL.md:17-22`: the clean-tree check comes before the git prerequisite and passes when `git status --porcelain` "prints nothing". Without git, or outside a git repo, the command fails with empty stdout, so the check passes and the upgrade runs with no `git restore` safety net, the premise the whole skill rests on. Check prerequisites first, and make the clean-tree check require `git status` to succeed (a git repo).
2. Story line 121: the no-record undeclared-move gap is only noted here, so it's lost when the story closes. Park it in `ideas/parked.md` with a wake condition (e.g. the first no-record upgrade report, or story 13's rehearsal hitting it).

**Nit**
3. `SKILL.md:77`: Finish's sub-step **Checks** reuses stage 1's name; "Validate" reads clearer when an agent jumps between them.
4. `SKILL.md:76`: Migrations come from the guides, and a no-record run has none; say so, so the agent doesn't look for a `guides.json` that was never written.

All four fixed: prerequisites and a git-repo check now come before the clean-tree check, the gap is parked as "Undeclared moves on no-record upgrades", and both nits are applied.

## Related
- [Plan: upgrade](../plan.md)
- [Upgrade routes](../upgrade-routes.md)
- [C4 components: upgrade-ang stages](../c4/3-components.md)
- [C4 code: library script](../c4/4-code.md)
- Upgrade guides format: `releases/upgrades/README.md` (repo root, outside the library)
- [Story 02](02-settings-merge-and-version-record.md)
- [Story 05](05-upgrade-engine.md)
- [Story 13](13-cut-rc2-with-rehearsal.md)
