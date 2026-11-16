---
title: Generic defaults C4 level 4, code
shortDescription: Modules, functions, types and test files the epic adds or changes, with signatures and responsibilities, plus the files the tailoring skill writes
tags: [repo-structure, distribution]
---
# Generic defaults C4 level 4: code

## Summary
A table of the functions and constants each changed module exposes, their signatures and who owns which rule. The one new seam is `mergeConfig(shared, local)`: pure, takes parsed JSON (or `undefined` for a missing file) and returns `{ config, errors, warnings }`, so the merge is driven test-first without temp dirs. Everything else is either the spike's diff or a wording change. Tests sit beside the code as `*.test.mjs` and run with `node --test 'src/.claude/**/*.test.mjs'`.

## Script modules
| Module | Export | Status | Signature and responsibility |
|---|---|---|---|
| `paths.mjs` | `CONFIG_FILE` | changed | `<PROJECT>/ang.json` (was `<PROJECT>/.claude/ang.json`) |
| `paths.mjs` | `LOCAL_FILE` | new | `<PROJECT>/ang.local.json` |
| `config/config.mjs` | `LOCAL_KEYS` | new | `['host', 'pilot']`. The only keys `ang.local.json` may set (d13) |
| `config/config.mjs` | `mergeConfig(shared, local)` | new | Pure. `shared` and `local` are parsed JSON or `undefined`. Applies feature defaults, then `shared`, then `local` filtered to `LOCAL_KEYS`. Returns `{ config, errors, warnings }`: an error for a non-object file or a bad value, naming the file; a warning per dropped local key, e.g. "`ang.local.json`: `intent` ignored, it's project-wide; set it in `ang.json`" |
| `config/config.mjs` | `loadConfig()` | changed | IO wrapper. Reads and parses each file that exists; invalid JSON becomes an error naming the file and that file is treated as missing. Delegates to `mergeConfig`. Returns `{ config, errors, warnings }` |
| `config/config.mjs` | `bannerLine()` | changed | Broken suffix reads "Ang config invalid", since errors can come from either file |
| `features.mjs` | `FEATURES` | changed | `[intent, streams, host, pilot]` |
| `features.mjs` | `featureRule(feature, config)` | new | `feature.rule(config[key])` when the feature exports `rule`, else `featureText(feature, 'rule.md')` |
| `commands/session.mjs` | `onRules()` | new (private) | `onFeatures(config).map(featureRule)`, used by `session banner` and `session subagent` |
| `commands/session.mjs` | `session features` | changed | Appends "personal, set by `/tailor-ang`" to each `LOCAL_KEYS` entry |
| `library/validate.mjs` | `validateLibrary()` | changed | Adds `loadConfig` warnings to the report; calls `localFileIgnoreWarning()` |
| `library/validate.mjs` | `localFileIgnoreWarning()` | new (private) | When `LOCAL_FILE` exists, runs `git check-ignore -q` via `node:child_process`; warns if it isn't ignored. No git or not a repo: no warning |
| `ang/features/pilot/feature.mjs` | default export | new | `key: 'pilot'`, `config: { default: null, check }`, `on: string`, `banner: name`, `rule(name)`; copied from the spike |
| `ang/features/intent/feature.mjs` | default export | changed | `bootstrap.default: true`; validate messages built from the new `CONFIG_FILE` |

## Tests
| File | Kind | Covers |
|---|---|---|
| `scripts/ang/config/config.test.mjs` | unit | `mergeConfig`: defaults only; shared over defaults; local over shared for `LOCAL_KEYS`; dropped key warns; unknown key or bad value errors with the file named; non-object local errors |
| `scripts/ang/features.test.mjs` | unit | `featureRule` prefers `rule(value)` and falls back to `rule.md` |
| `ang/features/pilot/feature.test.mjs` | unit | `check` and `on`: `null` and a name pass; `""`, whitespace and numbers fail |
| `scripts/ang/commands/session.test.mjs` | unit | `session features` marks local keys; banner and subagent output skip off features' rules |
| `scripts/cli.test.mjs` | integration | Spawns the CLI with `CLAUDE_PROJECT_DIR` set to a temp dir: banner names the pilot and `validate` passes; dropped key warns with exit 0; invalid JSON exits 1; no config passes `validate` |

## Files `/tailor-ang` writes
Prose skill, no script code (plan Approach). Every file is previewed before it's written.

| File | Content | Source of truth for the shape |
|---|---|---|
| `ang.local.json` | `{ "host": <detected or null>, "pilot": <name or null> }` | `LOCAL_KEYS`; `validate` checks values |
| `.claude/settings.local.json` | `{ "outputStyle": "<style name>" }`, merged into an existing file | Claude Code settings |
| `.claude/rules/pilot.local.md` | Identity, default stack, solo or team | d16 |
| `.claude/output-styles/<slug>.local.md` | Interview output, only for choice 6 | d14 |
| `.gitignore` | Appends `ang.local.json`, `settings.local.json`, `*.local.md` if missing | Plan Approach, gitignore patterns |

## Related
- [Components](3-components.md)
- [Plan](../plan.md)
- [Pilot feature spike diff](../origins/generic-personal-defaults/spikes/pilot-feature/script-changes.diff)
- [ADR 0002: Zero-dependency library script](/project-context/10k/technical/adrs/0002-zero-dependency-library-script.md)
