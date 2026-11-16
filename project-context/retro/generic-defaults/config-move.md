---
title: Config move blast radius
shortDescription: Everything that reads or names .claude/ang.json today, and how ang.local.json is limited to personal keys
tags: [distribution, repo-structure]
---
# Config move blast radius

## Summary
Moving config from `.claude/ang.json` to a root `ang.json` plus a gitignored `ang.local.json` (decision d7) is small. Code reads the path through one constant and one loader; everything else is wording. No per-feature "overridable" flag exists, and none is needed. A `LOCAL_KEYS` constant in the loader filters the local file during the merge, and `validate` warns about any key it drops (decision d13). Evidence: a grep of `src/` and `.claude/` on 2026-11-16, plus the code paths cited below.

## Code that reads the config
- `src/.claude/scripts/ang/paths.mjs:8`: `CONFIG_FILE`, the only place the path is built.
- `src/.claude/scripts/ang/config/config.mjs`: `loadConfig()` is the only reader. It applies feature defaults, then the file's keys, and returns `{ config, errors }`. `bannerLine()` (line 51) names `ang.json` in its error text.
- Callers of `loadConfig()`: the dispatcher (`ang-context-manager.mjs:16`), `commands/session.mjs:16` (banner, subagent, steps) and `library/validate.mjs:95`.
- `src/.claude/ang/features/intent/feature.mjs:12-13`: validate messages built from `rel(CONFIG_FILE)`.
- Hooks in `settings.json` only call the script, so they don't change.
- The pilot spike's diff (`origins/generic-personal-defaults/spikes/pilot-feature/script-changes.diff`) changes `features.mjs` and `session.mjs` only. It doesn't conflict with a loader change.

## Text that names the path
These need rewording (a find-and-replace plus a sentence each on the local overlay):
- Skills: `bootstrap-repo/SKILL.md:54` (writes the file; it now writes root `ang.json` and hands personal keys to tailoring) and `read-mail/SKILL.md:9`.
- Feature docs: `ang/features/intent/conventions.md:3` and `ang/features/streams/conventions.md:3`.
- Script comments and help text: `features.mjs:3`, `registry.mjs:5,86`, `commands/session.mjs:64` and `config/config.mjs:14`.
- `src/project-context/README.md:41,45` (Ang config section; this repo's `project-context/README.md` symlinks to it) and `src/docs/procedures/running-ang-streams-in-orca.md:10,12`.

## Which keys the local file may set
There is no per-feature flag. `config.mjs` holds a `LOCAL_KEYS` constant (`host` and `pilot`), and only those keys belong in `ang.local.json`.
- `loadConfig()` applies the defaults, then `ang.json`, then only the `LOCAL_KEYS` found in `ang.local.json`. Any other local key is dropped, so the merged config is always valid.
- `validate` warns about each dropped key, so a silent no-op doesn't cost anyone a debugging session. Example: "`ang.local.json`: `intent` ignored, it's project-wide; set it in `ang.json`".
- The documentation says the same thing, so people learn the rule before they hit the warning. The Ang config section of `src/project-context/README.md` lists which keys `ang.local.json` may set, says that other keys are dropped with a warning, and points to the parked team-controlled overrides. The root `README.md` has no config section today. When it or the [docs website](/project-context/ideas/docs-website/README.md) covers config, it carries the same rule.
- `session features`, which feeds bootstrap, marks `LOCAL_KEYS`. Bootstrap skips them and leaves them to the tailoring command.
- Why not a flag on each feature module: with four features, a flag adds a field to every feature forever and pays nothing back. Flipping it would also mean editing shipped Ang source, which unlocks the key for the whole team and is lost on update. Team-controlled overrides are parked in [parked work](/project-context/ideas/parked.md).

## Gitignore gap
This repo has no `.gitignore`. `.claude/settings.local.json` is ignored here only through Zac's global git ignore, which a fresh user won't have. The tailoring command must create or append the repo `.gitignore` entries using the unanchored patterns in the plan's Approach (`ang.local.json`, `settings.local.json`, `*.local.md`), so files under the symlinked `src/.claude/` are covered too (known k7).

## This repo's own switch (decision d12)
Delete the `.claude/ang.json` symlink and `src/.claude/ang.json` (Ang ships none, decision d11). Add a root `ang.json` with `{ "intent": true, "streams": false }` and a gitignored `ang.local.json` with `{ "host": "orca" }`.

## Test hooks
The scripts have no tests today. The loader merge, the filtering of the local file and the dropped-key warning are the logic worth driving test-first. That belongs to the test strategy in `plan.md`.

## Related
- [Epic hub](README.md)
- [Tailoring and config overlay](origins/generic-personal-defaults/shaping-content/tailoring.md)
- [Fresh-install defaults](origins/shipped-config-defaults/shaping-content/fresh-install-defaults.md)
- [Parked work](/project-context/ideas/parked.md)
- [Pilot feature spike](origins/generic-personal-defaults/spikes/pilot-feature/README.md)
