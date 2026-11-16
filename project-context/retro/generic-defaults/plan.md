---
title: Generic defaults plan
shortDescription: Scope, approach, sequencing, risks, test strategy and candidate ADRs for shipping Zac-free defaults plus the /tailor-ang command
tags: [open-source, distribution, repo-structure, brand-voice]
---
# Generic defaults plan

## Summary
A fresh install of Ang becomes generic and valid. It ships a team-neutral rule (`engineering-defaults.md`), five canned output styles and no `ang.json`. Config moves to a committed root `ang.json` plus a gitignored `ang.local.json` that only `LOCAL_KEYS` (`host`, `pilot`) may set. A new `pilot` feature injects the pilot's name through the existing hooks. A re-runnable `/tailor-ang` command writes every per-user choice into gitignored files, and `/bootstrap-repo` invokes it. Six stories, sequenced config first. Tests use `node:test` only (ADR 0002, zero-dependency script) and cover the loader merge, the pilot feature and the `rule(value)` hook point.

## Scope
1. **Config move** (d7, d11, d12, d13): `CONFIG_FILE` becomes root `ang.json`; `LOCAL_FILE` is `ang.local.json`. `loadConfig()` merges defaults, then `ang.json`, then only the `LOCAL_KEYS` found in `ang.local.json`, and returns a warning for each dropped key. `validate` reports those warnings. `session features` marks local keys so bootstrap skips them. The intent feature's bootstrap default becomes yes. All the wording in [config-move.md](config-move.md) gets updated.
2. **This repo's own config** (d12): delete `src/.claude/ang.json` and the `.claude/ang.json` symlink. Add a root `ang.json` (`intent: true, streams: false`), a gitignored `ang.local.json` (`host: "orca"`) and a root `.gitignore`.
3. **Pilot feature** (d4): promote the [spike](origins/generic-personal-defaults/spikes/pilot-feature/README.md) to `src/.claude/ang/features/pilot/`, with the `rule(value)` hook point in `features.mjs` and `commands/session.mjs`. `pilot` is a `LOCAL_KEY`.
4. **Generic rule** (d1, d3, d15): `src/.claude/rules/engineering-defaults.md` keeps everything in `working-with-zac.md` except identity and stack, with team-neutral wording. Fix the two "my rules" pointers in `review-story` and `write-story` ([person-references.md](person-references.md)). Zac's identity, stack and solo framing move to his own gitignored `pilot.local.md`.
5. **Output styles** (d2, d8, k13): commit `partner-in-crime.md` without "ADHD-friendly", and add Straight Shooter, Mentor, Briefing and Pair Programmer as specified in [output-styles.md](output-styles.md). `settings.json` keeps `outputStyle: "Partner In Crime"`.
6. **`/tailor-ang`** (d5, d6, d8, d14, d16): a re-runnable skill that, in order:
   1. detects `host`;
   2. asks for the pilot name;
   3. shows the numbered style picker, with the interview as option 6;
   4. runs the 3-question personal rule interview;
   5. previews every file before writing it;
   6. writes `ang.local.json`, `.claude/settings.local.json`, `.claude/rules/pilot.local.md` and any `.claude/output-styles/<slug>.local.md`;
   7. ensures the repo `.gitignore` covers them.
7. **Bootstrap** (d5, d11): `/bootstrap-repo` writes root `ang.json` with the project keys only, then invokes `/tailor-ang`.
8. **10k and shipped docs**:
   - `10k/technical/project-structure.md`: the config location, the Dragons note about the symlink, output styles no longer untracked, and the rules row.
   - ADR 0001: "`ang.json` names it" becomes `ang.local.json`.
   - ADR 0002: the Summary and Standing say the script imports only `node:fs` and `node:path`. Refresh them to list `node:child_process` (the `git check-ignore` warning) and `node:test` (tests). The Decision, built-ins only, already covers both.
   - The Ang config section of `src/project-context/README.md`: the two files, `LOCAL_KEYS`, dropped-key warnings, and a pointer to the parked team overrides.

## Out of scope
- Per-user intent garnish and team-controlled local overrides: both in [parked work](/project-context/ideas/parked.md).
- A configurable config path, and `"extends"`-style shared config (sent to the [docs website](/project-context/ideas/docs-website/README.md)).
- Anything under `~/.claude` (d6).
- Rule variants or a rule-style interview (d15).
- Packaging and install, including keeping `*.local.*` files out of a release ([install, uninstall, update](/project-context/ideas/install-uninstall-update/README.md)).
- Rewriting first-person "me" in skills (k15).

## Approach
- **Loader shape:** split `loadConfig()` into a pure `mergeConfig(shared, local)` and a thin IO wrapper that reads both files. The pure half takes the parsed objects and returns `{ config, errors, warnings }`, so the merge rules are unit-testable without temp dirs. Errors from `ang.local.json` (invalid JSON, a bad value for a local key) are reported the same way as errors from `ang.json`, with the file named.
- **Feature contract:** a feature may export `rule(value)` in place of a static `rule.md`. That's the only change to the contract, taken as-is from the spike diff. `LOCAL_KEYS` lives in `config.mjs` and isn't a per-feature flag (d13).
- **Skills stay prose:** `/tailor-ang` is a skill, not a script command. Writing two small JSON files and appending gitignore lines doesn't earn its own script code. `validate` is the safety net, because it flags bad local keys and values.
- **Gitignore patterns** must match the symlinked layout in this repo, where `.claude/rules` and `.claude/output-styles` resolve into `src/`. Use unanchored patterns, `*.local.md`, `ang.local.json` and `settings.local.json`, so local files under `src/.claude/` are ignored too.
- **Closed feature set:** `what-ang-is.md` closes the set of product capabilities (stages, library, workflow improvements, streams). Config feature modules like `host` and `intent` aren't on that list, and `pilot` joins them as personalisation serving the release goal's "generic defaults". No conflict and no ADR needed.

## Sequencing
| # | Story | Depends on | Why this order |
|---|---|---|---|
| 1 | Config move, test harness and this repo's own config | none | Everything else writes to or reads from the new files. The first `node:test` tests land here |
| 2 | Pilot feature | 1 | Needs `ang.local.json` and `LOCAL_KEYS` |
| 3 | Generic rule and pointer fixes | none | Independent; can run in parallel with 1 and 2 |
| 4 | Output styles | none | Independent; the picker in 5 needs them to exist |
| 5 | `/tailor-ang` | 1, 2, 3, 4 | Writes into everything above |
| 6 | Bootstrap and docs (shipped README, 10k, ADR 0001) | 5 | Bootstrap invokes the command, and the docs describe the finished shape |

## Risks
| Risk | Mitigation |
|---|---|
| Local files in this repo land physically inside `src/` because of the symlinks, so they could ship | Unanchored gitignore patterns (story 1). Excluding them from a release belongs to the install item |
| The personal rule overlay contradicts the generic rule, and Claude Code picks either one (k7) | The interview only asks about identity, stack and solo or team (d16). The preview step shows the whole file before it's written |
| `ang.local.json` is committed by mistake and leaks personal keys | `/tailor-ang` ensures the gitignore entries before writing. `validate` warns when `ang.local.json` exists and `git check-ignore` says it isn't ignored. That's cheap with `node:child_process` and stays within ADR 0002 |
| Five styles plus an interview cut against the intent's "build the least" | Zac's call (d8). Each style is a short markdown file with no code. Revisit at `/retro` if nobody picks them |
| Interview quality (style or rule) can't be unit tested | A manual run-through in a scratch repo is part of story 5's acceptance |
| The loader change breaks the hooks that run at every session start | The banner already degrades to "ang.json invalid", and the integration test runs `session banner` against a temp project |

## Success measures
- **Fresh install:** a copy of `src/.claude` and `src/project-context` with no config passes `library validate` and shows the banner `no optional features on`.
- **No pilot name in shipped files:** `git grep -il zac -- src/` matches nothing. Tracked files only: in this repo, gitignored local files such as `pilot.local.md` land physically under `src/` through the symlinks.
- **The default style resolves:** `settings.json`'s `outputStyle` names a style that exists in `src/.claude/output-styles/`.
- **Tracked files stay untouched:** after `/tailor-ang` on a bootstrapped repo, `git status` shows no tracked changes beyond `.gitignore`, and every file it wrote is ignored.
- **Dropped keys warn:** an `ang.local.json` holding `intent` triggers a `validate` warning naming the key, and the merged config ignores it.
- **This repo still works:** sessions here show `Ang: intent · host (orca) · pilot (Zac)`, and `validate` passes.

## Test strategy
Built-in `node:test` and `node:assert` only, run with `node --test 'src/.claude/**/*.test.mjs'`. The quoted glob matters: Node 22 treats a bare directory argument as a test file and fails, and the pilot feature's tests live outside `scripts/`. Glob arguments need Node 21 or later. No `package.json` and no dependencies (ADR 0002). Tests sit beside the code as `*.test.mjs`.

**Unit tests (most of them), written test-first:**
- `mergeConfig`:
  - defaults alone;
  - `ang.json` overrides defaults;
  - local overrides shared values for `LOCAL_KEYS` only;
  - a non-local key in local is dropped, with a warning;
  - an unknown key, or a bad value in either file, gives an error naming the file;
  - a local file that isn't an object gives an error.
- Pilot feature `check` and `on`: `null` and a valid name pass; `""`, whitespace and numbers are rejected.
- `featureRule` prefers `rule(value)` over `rule.md`; session output skips the rules of off features.
- `session features` output marks local keys.

**Integration tests (a few), each spawning the CLI against a temp project via `CLAUDE_PROJECT_DIR`:**
- Happy path: root `ang.json` plus `ang.local.json` with a pilot gives a banner naming the pilot, and `validate` passes.
- Unhappy path: `ang.local.json` with `intent` gives a warning, still exit 0. Invalid JSON gives an error and exit 1.
- Fresh install: no config files pass `validate`.

**End-to-end:** none automated. Story 5's acceptance includes one manual `/tailor-ang` run and one `/bootstrap-repo` run in a scratch repo, because skills are prose run by an agent.

**Not tested:** the markdown content of rules and styles, the gitignore appends (done by the agent, and caught by the `validate` check), and the wording edits.

**Quality tooling:** this repo has no lint, format, pre-commit or CI. Raise `/bootstrap-quality` once story 1 lands the first tests, rather than building tooling inside this epic.

## Candidate ADRs
1. **Per-user config is a gitignored overlay limited to `LOCAL_KEYS`** (d7, d13): root `ang.json` is committed and project-owned. `ang.local.json` may set `host` and `pilot` only, and other keys are dropped with a warning. It updates ADR 0001's host wording.
2. **The pilot's identity comes from a hook-injected feature, never templating** (d4, k5): features may export `rule(value)`. Shipped files never contain a pilot's name.
3. **Ang ships opinionated engineering defaults, and personal additions are additive** (d1, d3, d15, d16): methods ship as defaults. The personal overlay holds identity, stack and solo or team only.
4. **Ang writes only inside the repo, and ships no `ang.json`** (d6, d11): bootstrap writes the project config, and `/tailor-ang` writes the personal files.
5. **Scripts are tested with built-in `node:test`** (an extension of ADR 0002): no runner dependency, and tests sit beside the code.

## Related
- [Epic hub](README.md)
- [Config move blast radius](config-move.md)
- [Canned output styles](output-styles.md)
- [Person references](person-references.md)
- [C4: context](c4/1-context.md), [containers](c4/2-containers.md), [components](c4/3-components.md), [code](c4/4-code.md)
- [Tailoring and config overlay](origins/generic-personal-defaults/shaping-content/tailoring.md)
- [Delivery intent](/project-context/10k/intent.md)
- [Project structure](/project-context/10k/technical/project-structure.md)
- [ADR 0001: Claude Code harness, Orca optional](/project-context/10k/technical/adrs/0001-claude-code-harness-orca-optional.md)
- [ADR 0002: Zero-dependency library script](/project-context/10k/technical/adrs/0002-zero-dependency-library-script.md)
- [Parked work](/project-context/ideas/parked.md)
