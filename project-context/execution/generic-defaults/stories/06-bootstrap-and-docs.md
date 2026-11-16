---
title: Bootstrap and docs
shortDescription: /bootstrap-repo writes a root ang.json and invokes /tailor-ang; 10k, ADRs and the shipped README describe the finished shape
tags: [distribution, documentation, repo-structure]
status: ready
owner: agent
dependsOn: [05]
---
# Bootstrap and docs

## Summary
`/bootstrap-repo` already asks the feature questions and writes a root `ang.json` with project keys only (story 01). This story adds the `/tailor-ang` hand-off and the restart note in its closing report, then brings the 10k docs, ADRs 0001 and 0002, and the shipped README into line with the finished shape. No script code changes.

## Outcome
A fresh install is generic and valid end to end. Bootstrapping a scratch repo yields a committed `ang.json` plus gitignored personal files, and the docs match what actually happens.

## Done when
- A copy of only the tracked files under `src/.claude` and `src/project-context` (`git ls-files`, so the gitignored `pilot.local.md` stays behind), with no config, passes `library validate`, and its banner says `no optional features on`.
- One manual `/bootstrap-repo` run by Zac in a scratch repo writes root `ang.json` with no `pilot` or `host` key, hands over to `/tailor-ang`, carries on to validate, and its closing report lists tailor's files and says to restart Claude Code.
- The docs edits below are made, a grep of `src/` and `project-context/10k/` finds no `.claude/ang.json` path and no "ships this repo's config" claim, and `library validate` passes in this repo.
- `node --test 'src/.claude/**/*.test.mjs'` still passes.

## Acceptance criteria
- Given a bootstrap run, when it reaches Ang config, then it writes root `ang.json` with only the keys `session features` doesn't mark personal, then invokes `/tailor-ang`.
- Given `/tailor-ang` finishes under bootstrap, then bootstrap resumes at Write (step 5) with no review stop in between.
- Given the closing report, then it lists `ang.json` and every file tailor wrote alongside the docs, leftovers and tooling, and tells Zac to quit and restart Claude Code to pick up the banner, rule and style.
- Given Zac stops tailoring partway, then bootstrap still writes its docs and validates. Validate's existing warnings (missing gitignore lines, dropped local keys) surface anything half-done.
- Given a reader of `project-context/README.md` Ang config, then they learn: which keys go in which file, that `ang.local.json` can only set `LOCAL_KEYS` and project keys there are dropped with a warning, that every `/tailor-ang` choice is easy to change later (`/output-style` switches styles; re-running `/tailor-ang` redoes any choice or builds a custom style), and where the parked team-overrides idea lives.

## Test plan
- **Unit/integration:** none new. The script already does what the docs will describe (`config.mjs` `LOCAL_KEYS` and merge warnings, `session.mjs` personal marker, `validate.mjs` gitignore check), and story 01–05 tests cover it. Re-run the full suite as a regression guard.
- **Fresh-install check:** scripted in the session, not committed. Copy `git ls-files src/.claude src/project-context` to a temp dir, set `CLAUDE_PROJECT_DIR`, run `library validate` and `session banner` (or whatever prints the banner).
- **E2E:** the manual scratch-repo bootstrap run above, per the plan's test strategy.
- **Won't test:** skill prose and doc wording; there's nothing deterministic to assert.

## Implementation notes
- **`src/.claude/skills/bootstrap-repo/SKILL.md`**
  - Step 4, **Ang config** paragraph (~line 54): after writing `ang.json`, invoke the `tailor-ang` skill and follow it, mirroring how step 7 invokes `bootstrap-quality`. Placing it here, before Validate, means step 6 catches gitignore or local-key problems.
  - Step 8, last bullet (~line 71): add `ang.json` and tailor's files to the list, plus the quit-and-restart line.
  - `tailor-ang/SKILL.md:76` already says "return to its next step"; leave it.
- **`project-context/10k/technical/project-structure.md`**
  - Line 16, rules row: tracked `context-library.md` and `engineering-defaults.md`; gitignored `pilot.local.md` written by `/tailor-ang`.
  - Line 17, feature list: add `pilot`.
  - Line 20: replace `src/.claude/ang.json` with root `ang.json` (project keys, committed) and `ang.local.json` (personal keys, gitignored), for both this repo and installs.
  - Dragons, line 29: drop the claim that this repo's `.claude/ang.json` ships as the default. Say Ang ships no config, and this repo has its own root config like any install.
  - Dragons, line 30: output styles are now tracked (five canned styles); `*.local.md` styles are gitignored.
- **ADR 0001** (lines 9, 16): the host is named in `ang.local.json` (personal, set by `/tailor-ang`).
- **ADR 0002** Summary (line 9) and Standing (line 24): the library imports only Node built-ins: `node:fs`, `node:path`, `node:child_process` (for `git check-ignore` in validate), and `node:test` for tests.
- **`src/project-context/README.md`, Ang config (lines 39–48):** fix the shape on line 41 (`intent`, `streams` in `ang.json`; `pilot`, `host` in `ang.local.json`), turn the parked pointer into a link to `/project-context/ideas/parked.md`, and add the easy-to-change-later sentence.
- Before closing, grep `src/` and `project-context/10k/` for other stale `ang.json` or symlink claims and fix what turns up.
- **Out of scope:** script changes, new features in bootstrap's question flow, and the install/uninstall story (`ideas/install-uninstall-update`).

## Links
- [Plan: scope 7–8, success measures, test strategy](../plan.md)
- [Code view: config and files tailor writes](../c4/4-code.md)
- [Fresh-install defaults](../origins/shipped-config-defaults/shaping-content/fresh-install-defaults.md)

## Related
- [Epic hub](../README.md)
- [Story 05: /tailor-ang](05-tailor-ang.md)
- [Project structure](/project-context/10k/technical/project-structure.md)
- [ADR 0001: Claude Code harness, Orca optional](/project-context/10k/technical/adrs/0001-claude-code-harness-orca-optional.md)
- [ADR 0002: Zero-dependency library script](/project-context/10k/technical/adrs/0002-zero-dependency-library-script.md)
