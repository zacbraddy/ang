---
title: Config move, test harness and this repo's own config
shortDescription: Root ang.json plus a gitignored ang.local.json limited to LOCAL_KEYS, the first node:test tests, and this repo's own config replacing the src symlink
tags: [repo-structure, distribution]
status: ready
owner: agent
dependsOn: []
---
# Config move, test harness and this repo's own config

## Summary
Moves Ang's config from `.claude/ang.json` to a committed root `ang.json` plus a gitignored `ang.local.json` that may set only `LOCAL_KEYS` (`host`, `pilot`). The loader is split into a pure `mergeConfig` and a thin IO wrapper (`loadConfig`), driven test-first with the first `node:test` tests. This repo stops symlinking its config from `src/` and gets its own.

## Outcome
A local key other than `host` or `pilot` is dropped, and `validate` warns about it by name. `node --test 'src/.claude/**/*.test.mjs'` passes. Sessions in this repo still show `Ang: intent · host (orca)`, now read from root `ang.json` and `ang.local.json`.

## Done when
- `node --test 'src/.claude/**/*.test.mjs'` passes: the `mergeConfig` unit tests and the integration tests that spawn the command-line tool.
- `src/.claude/ang.json` and the `.claude/ang.json` symlink are gone. Root `ang.json` (`{ "intent": true, "streams": false }`), a gitignored `ang.local.json` (`{ "host": "orca" }`) and a root `.gitignore` exist; `git check-ignore -q ang.local.json` succeeds.
- `session banner` in this repo prints `Ang: intent · host (orca)`.
- `library validate` passes in this repo.
- `grep -rn '\.claude/ang\.json' src/` returns nothing.

## Acceptance criteria
- Given no `ang.json` or `ang.local.json`, when config loads, then every feature takes its default and there are no errors or warnings.
- Given `ang.json` sets a key, when config loads, then it overrides the default.
- Given `ang.local.json` sets `host`, when config loads, then it overrides `ang.json`'s `host`.
- Given `ang.local.json` sets `intent`, when config loads, then `ang.json`'s `intent` stands and a warning names the key and says to set it in `ang.json`; `validate` prints it and still exits 0.
- Given either file has an unknown key or a bad value, when config loads, then an error names the file and the key, and that key keeps its default.
- Given either file is invalid JSON or not an object, when config loads, then an error names the file, that file is treated as missing, `validate` exits 1 and the banner ends `· Ang config invalid, run … library validate`.
- Given `ang.local.json` exists but isn't gitignored, when `validate` runs, then it warns that personal config would be committed. Given no git or no repo, then no warning.
- Given `session features` runs, then `host` (and `pilot` once 02 registers it) are marked "personal, set by `/tailor-ang`".
- Given a command needs an off feature, then the error names `ang.json`, not `.claude/ang.json`.

## Test plan
- **Unit** — `src/.claude/scripts/ang/config/config.test.mjs` against `mergeConfig(shared, local)`, one test per merge criterion above: both `undefined`; shared over defaults; local `host` over shared; local non-local key dropped with a warning; unknown key and bad value in each file, error naming the file; non-object in each file. Write these first; they drive the split of `loadConfig`.
- **Integration** — `src/.claude/scripts/cli.test.mjs`. Each test makes a temp project dir (`fs.mkdtempSync`), writes config files, and spawns `ang-context-manager.mjs` with `CLAUDE_PROJECT_DIR` set to it (`paths.mjs` reads the env at import time, so spawning is the only clean seam). Cases: no config files → `library validate` exits 0; local `intent` → warning printed, exit 0; invalid JSON in `ang.json` → error naming the file, exit 1; `session banner` with a local `host` names it (guards the hook path from the plan's risk list); `session features` marks `host` as personal. Keep a small helper for "temp project + spawn" here; story 02 extends this file with the pilot case.
- **Won't test**: `loadConfig`'s file reading (thin IO, covered by integration), `bannerLine` formatting beyond the integration case, the `git check-ignore` warning (shells out to git; trivial branch), markdown and wording edits, `.gitignore` content, this repo's own config files (`validate` and the banner prove them).

## Implementation notes
- **Constraints**: `node:` built-ins only (ADR 0002), ESM `.mjs`, no `package.json`. Node 22 here; the glob in the test command must be quoted.
- `src/.claude/scripts/ang/paths.mjs`: `CONFIG_FILE = path.join(PROJECT, 'ang.json')`, new `LOCAL_FILE = path.join(PROJECT, 'ang.local.json')`.
- `src/.claude/scripts/ang/config/config.mjs`:
  - `export const LOCAL_KEYS = ['host', 'pilot']`. Until 02 registers the pilot feature, a local `pilot` still fails `keyError` as unknown; that's fine.
  - `export function mergeConfig(shared, local)` → `{ config, errors, warnings }`. Validate each file's object with `keyError`, prefixing messages with `ang.json:` / `ang.local.json:` (use `rel()` of the constants). Defaults, then valid shared keys, then valid local keys in `LOCAL_KEYS`. Dropped local key warning: `` ang.local.json: <key> ignored, it's project-wide; set it in ang.json ``.
  - `loadConfig()`: read each file if it exists; invalid JSON → `<file>: invalid JSON` error and pass `undefined`; then return `mergeConfig`'s result with the parse errors prepended. Callers (`ang-context-manager.mjs:16`, `commands/session.mjs:16`, `library/validate.mjs:95`) keep destructuring `config`/`errors`.
  - `bannerLine()`: broken suffix becomes `` · Ang config invalid, run ${SCRIPT} library validate ``. Warnings don't show in the banner.
  - Update the comment at :14 to name both files.
- `src/.claude/scripts/ang/library/validate.mjs`: push `loadConfig`'s `warnings` into `report.warnings`; private `localFileIgnoreWarning()` runs `git check-ignore -q <LOCAL_FILE>` via `child_process.spawnSync` with `cwd: PROJECT` when the file exists. Exit status 1 → warning `ang.local.json is not gitignored; it holds personal settings, add it to .gitignore`. Any other status or spawn error → no warning.
- `src/.claude/scripts/ang/commands/session.mjs` `features`: append ` — personal, set by \`/tailor-ang\`` to `LOCAL_KEYS` entries; fix the summary's path wording.
- `src/.claude/ang/features/intent/feature.mjs`: `bootstrap.default: true`. Messages already use `rel(CONFIG_FILE)`, so they follow the move.
- `src/.claude/ang/features/intent/conventions.md:3`: path wording **and** the "defaults to no doc" sentence, which now contradicts the default.
- Wording edits from the [blast radius doc](../config-move.md): `skills/bootstrap-repo/SKILL.md:54` (writes root `ang.json`, leaves personal keys to `/tailor-ang`), `skills/read-mail/SKILL.md:9`, `ang/features/streams/conventions.md:3`, `scripts/ang/features.mjs:3`, `scripts/ang/registry.mjs:5,86`, `src/project-context/README.md:41,45` (Ang config section: which keys `ang.local.json` may set, others dropped with a warning, pointer to parked team overrides), `src/docs/procedures/running-ang-streams-in-orca.md:10,12`.
- **This repo**: `git rm src/.claude/ang.json` and the `.claude/ang.json` symlink; add root `ang.json`, `ang.local.json` and `.gitignore` with unanchored `ang.local.json`, `settings.local.json`, `*.local.md`. Leave unstaged.
- **Out of scope**: the pilot feature, `featureRule`/`onRules()` and the subagent rule (02); `session.test.mjs` (02 creates it); `10k/technical/project-structure.md` and ADR 0001 wording (06); `/tailor-ang` writing `.gitignore` entries for users (05).
- **After landing**: flag `/bootstrap-quality` once, per the plan.

## Links
- [Plan: scope 1–2, approach, test strategy](../plan.md)
- [Config move blast radius](../config-move.md)
- [C4 components](../c4/3-components.md), [C4 code](../c4/4-code.md)

## Related
- [Epic hub](../README.md)
- [02 Pilot feature](02-pilot-feature.md)
- [ADR 0002: Zero-dependency library script](/project-context/10k/technical/adrs/0002-zero-dependency-library-script.md)
