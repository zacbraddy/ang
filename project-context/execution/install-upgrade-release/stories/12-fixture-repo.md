---
title: Fixture repo created and seeded
shortDescription: Zac creates the upgrade fixture repo from an rc.1 install and seeds it once with representative local edits
tags: [distribution, open-source]
status: done
owner: user
dependsOn: [11]
---
# Fixture repo created and seeded

## Summary
Upgrade rehearsals run against a dedicated fixture repo, not a real project (d22). Zac creates `zacbraddy/ang-upgrade-fixture` (k13), the name `/cut-release` clones, and seeds it once by hand from an rc.1 install. After that, real upgrades roll it forward (k17).

## Outcome
The fixture repo holds an rc.1 install plus the k17 seed: one local edit in every shipped area, the upgrade merge spike's five cases, a local-only skill and agent, a library built through `ang-context-manager.mjs` with an item at each stage, a 10k doc, a trigger and state entries, and a root `ang.json` with features on. Prose comes from faker, never an LLM; any one-off script stays in the fixture repo. The seeded state is committed and tagged.

## Done when
- `gh repo view zacbraddy/ang-upgrade-fixture --json visibility,defaultBranchRef` shows `PUBLIC` and `main`.
- `git clone https://github.com/zacbraddy/ang-upgrade-fixture` works with no credentials. This is `/cut-release` stage 4's step 1, verbatim.
- In that clone, `.claude/ang/version.json` names `v1.0.0-rc.1` and `faa0de3f01e1f4cf2d60a36d6da51b82c4ced3cd`.
- Tag `v1.0.0-rc.1` in the fixture points at the seeded commit on `main`.
- Every row of the seed checklist below can be found in the clone. A diff against the rc.1 `src/` tree shows the edits, and the library files exist.
- In the clone, `library validate` passes and `node --test .claude/scripts` passes.
- No `*.local.*` file is tracked in the fixture.
- A **Result** section in this story records the repo URL, the seeded commit and anything that went differently from the guide.

## Acceptance criteria
- Given a fresh, empty `main`, when the rc.1 one-liner runs, then Ang installs and `version.json` matches rc.1.
- Given the seed script runs twice from the same commit, then the output is the same, because faker's seed is fixed. A re-run is how a bad seed gets fixed before the tag.
- Given the seeded tree, then each spike case sits in the file the checklist names, so a later upstream change to that file exercises the case.
- Given `ang.json` has `intent: true`, then `project-context/10k/intent.md` exists with `confirmed:` frontmatter, so `library validate` passes.
- Given `streams: true` and no streams registered, then `library validate` passes with no streams warnings.
- Given the new function in `validate.mjs`, then the shipped tests still pass, because nothing calls it.
- Given seeding fails partway (validate fails, or a test breaks), then nothing is committed: `git checkout -- . && git clean -fd` (keeping `seed/`), fix the script and re-run.

## Seed checklist
`*.local.*` files are left out because a clone never carries them (k17). Every edit adds or changes a faker sentence or paragraph, unless the row says otherwise.

| Area | File (under `.claude/` unless stated) | Edit | Case it covers |
|---|---|---|---|
| skills | `skills/review-story/SKILL.md` | A line added after the last numbered step, away from recent upstream changes | edit away from upstream's changes |
| agents | `agents/context-scout.md` | A line appended to the body | area edit |
| rules | `rules/engineering-defaults.md` | A bullet appended under `## Code` | area edit |
| rules | `rules/fixture-house-style.md` (new) | A local rule: a `# ` heading plus 3 faker bullets | a new local rule |
| output-styles | `output-styles/partner-in-crime.md` | A bullet appended under `# Voice` | area edit |
| scripts | `scripts/ang/library/validate.mjs` | A new exported function appended at the end (`export function fixtureNote() { return '<faker sentence>'; }`), called by nothing | a new function in a shipped script |
| ang/features | `ang/features/streams/conventions.md` | A line appended | area edit |
| project-context | `project-context/README.md` (repo root) | The first paragraph under `## Ang config` (the `ang.json` line) gets a faker sentence appended | an edit on a high-churn line (this file has the most upstream commits since June) |
| settings | `settings.json` | `"env": { "FIXTURE_FLAVOUR": "<faker word>" }`, one extra `permissions.allow` entry, `Bash(echo:*)`, and a `PostToolUse` hook on matcher `Bash` running `echo fixture` | a custom setting plus a hook |
| local-only | `skills/fixture-notes/SKILL.md` (new) | A skill with `name`/`description` frontmatter and a faker body | local-only skill |
| local-only | `agents/fixture-auditor.md` (new) | An agent with `name`/`description`/`tools: Read` frontmatter and a faker body | local-only agent |
| config | `ang.json` (repo root) | `{ "intent": true, "streams": true }` | features on |

**Library**, built with `node .claude/scripts/ang-context-manager.mjs`. Each item's folder and docs follow `project-context/README.md` (Item anatomy, Hub templates, Stories). Doc prose comes from faker, and frontmatter tags come from `tags.json`, with any new tags added through `tag add`.
- `library init`.
- `10k/intent.md` with `confirmed: 2026-11-20` frontmatter, plus one more 10k doc, `10k/product.md`.
- One item per stage: `ideas/`, `shaping/`, `planning/`, `execution/` (an epic with three stories: one `done`, one `ready`, one `draft`) and `retro/`. Each gets `state init`, and two or more `state add` entries mixing `unknown`, `known` and `decision`.
- One trigger: write `triggers/<slug>.md`, then `trigger add` with `story:<execution item>/<NN>=done` on the execution item's `draft` story.
- `ideas/parked.md` with one parked entry.
- `library index`, then `library validate`.

## Guide
1. Create the repo: `gh repo create zacbraddy/ang-upgrade-fixture --public --add-readme --description "Ang upgrade rehearsal fixture"`. Clone it somewhere outside the Ang repo, e.g. `~/Projects/we-right-code/ang-upgrade-fixture`.
2. In the clone, install rc.1: `curl -fsSL https://github.com/zacbraddy/ang/releases/download/v1.0.0-rc.1/install.sh | sh`. Check `.claude/ang/version.json` names `v1.0.0-rc.1`. Commit it as `install: Ang v1.0.0-rc.1`. That commit is the clean baseline, so the seed lands as a diff on top of it.
3. Open a Claude session in the clone and hand it this story's **Seed checklist** and the agent brief below. Review the `seed/seed.mjs` it writes before it runs.
4. When the script has run, read `git status` and `git diff` (the edits to shipped files). Check every checklist row is there and the prose reads as faker filler, not real guidance.
5. Have it run `node .claude/scripts/ang-context-manager.mjs library validate` and `node --test .claude/scripts`. Both must pass.
6. Commit everything, `seed/` and `package.json` included, as `seed: rc.1 fixture`. Then `git tag v1.0.0-rc.1` (lightweight, matching `/cut-release`'s roll-forward) and `git push origin main v1.0.0-rc.1`.
7. Run the Done-when checks from a temp folder, then come back here and say so. The agent writes **Result** and runs `library validate` in the Ang repo.

## Prepared in advance (agent)
- **Seed agent brief**, for step 3:
  > Write a one-off Node script, `seed/seed.mjs`, that applies this Seed checklist to the repo. Use `@faker-js/faker@10.6.0` as a devDependency (`npm i -D @faker-js/faker@10.6.0`) and call `faker.seed(17)` first. Every piece of prose comes from faker; write no prose yourself. Edit shipped files by exact string anchors and fail loudly if an anchor is missing. Build the library only through `node .claude/scripts/ang-context-manager.mjs` and plain file writes for docs, following `project-context/README.md`. Add `node_modules/` to `.gitignore`. Run it, then run `library validate` and `node --test .claude/scripts` and report.
- `gh` auth check before step 1: `gh auth status` shows `zacbraddy` with `repo` scope.

## Record afterwards
- **Result** in this story: the fixture URL, the `install:` and `seed:` commits, the tag's commit, the Done-when results and anything that went differently.
- Nothing about the fixture goes into Ang's shipped files. `/cut-release` already names the repo.

## Implementation notes
- **Public repo:** `/cut-release` clones it over anonymous HTTPS from a subagent, so public is the reliable choice. It holds only faker text and Ang's own public files.
- **Tag shape:** a lightweight `<tag>` on `main`, the same as `/cut-release`'s roll-forward (`git tag <tag>`), so every fixture tag looks alike.
- **No docs area:** k17 lists `docs`, but `src/docs/` was removed before rc.1 (story 11 Result), so there is no docs edit. Settings take its place through the custom-setting-plus-hook case.
- **Spike mapping:** the spike's `retro` (an untouched file) and `ang.json`-moved cases aren't in k17's five. The area edits cover untouched files, and the move case only arises when upstream moves something.
- **Faker version:** `@faker-js/faker` 10.6.0 is the latest, last published 2026-09-06. Vet it with `supermatt:dependency-vetting` before the install.
- **Out of scope:** any rehearsal run and threshold tuning (story 13), seed generators or fixture tooling in the Ang repo (k17), and `*.local.*` files.

## Result
- **Fixture:** https://github.com/zacbraddy/ang-upgrade-fixture, public, default branch `main`.
- **Commits:** `install: Ang v1.0.0-rc.1` is `4a92a16`. `seed: rc.1 fixture` is `45ebac3`, and lightweight tag `v1.0.0-rc.1` points at it, level with `main`.
- **Done when**, checked from a fresh anonymous HTTPS clone in a temp folder: `gh repo view` showed `PUBLIC` and `main`; the clone needed no credentials; `version.json` named `v1.0.0-rc.1` and `faa0de3f01e1f4cf2d60a36d6da51b82c4ced3cd`; the diff against the `install:` commit showed all eight shipped-file edits, the three local-only `.claude` files and the library; `library validate` passed and `node --test .claude/scripts` passed 125 of 125; no `*.local.*` file is tracked.
- **Seed script:** `seed/seed.mjs` applies the checklist with `faker.seed(17)`, using `faker.lorem` for all prose. Before applying, it restores the files it edits and cleans the paths it generates, so a re-run needs no manual `git checkout`/`git clean`. It refuses to run once `ang.json` is committed at `HEAD`. A second run produced byte-identical output across all 57 seeded files.
- **Differently from the guide:**
  - The fixture had no `package.json`, so `npm i -D` walked up and installed faker into `~/Projects`. That stray install was deleted. The fixture now has `package.json` with faker pinned exactly to `10.6.0` (same integrity hash as the vetted tarball), committed with `package-lock.json`.
  - Re-runs match byte for byte only on the same day: `state.json` lineage entries take the date from `ang-context-manager.mjs`'s `today()`.
  - The planning, execution and retro epics are typed `business`, so they don't imply missing C4 docs.

## Review
Re-checked every Done-when from a fresh anonymous clone: `PUBLIC`/`main`, `version.json` matches rc.1 at `faa0de3`, tag and `main` both at `45ebac3`, all 12 checklist rows and the library present, `library validate` passes, 125 of 125 tests pass, and no `*.local.*` file is tracked.
- **must-fix:** none.
- **should-fix:** none.
- **nit:** the fixture's `project-context/ideas/parked.md:12` reads `What:Sustineo` with no space after the colon. It's faker filler and validate passes, so leave it; fixing it means a re-seed and moving the tag.

## Related
- [Release process proposal](../release-process-proposal.md)
- [Upgrade merge spike](../origins/install-uninstall-update/shaping-content/upgrade-merge-spike.md)
- [Story 11](11-cut-rc1.md)
- [Story 13](13-cut-rc2-with-rehearsal.md)
- Rehearsal steps: `.claude/skills/cut-release/SKILL.md`
