---
title: Copy-in bake-off
shortDescription: degit and giget both install a working Ang from src/ in one command, but need --force and overwrite an existing .claude/settings.json
tags: [distribution, open-source]
---
# Copy-in bake-off

## Summary
Spiked on 2026-11-16 against `main` at `cd1b825`. `npx degit zacbraddy/ang/src . --force` and `npx giget gh:zacbraddy/ang/src . --force` each install a working Ang in 4–5 seconds:
- `library init` and `library validate` both exit 0;
- `project-context/README.md` arrives with the rest, which settles u2;
- no `*.local.*` files ship.

Two catches:
- **`--force` is always needed.** Both tools refuse any target that holds a `.git/` folder, even a freshly initialised one.
- **`--force` overwrites `.claude/settings.json`.** The user's own settings file gets replaced by Ang's. Every other user file survived: `CLAUDE.md`, `.gitignore`, their own rules and their own skills.

Plain copy-in (option 1 in the [install route landscape](../ideas-content/install-route.md)) works, so no wrapper is needed to install. The settings clobber needs either a line in the quick start or a merge step.

## Setup
- Script: [`spikes/copy-in/run.sh`](../spikes/copy-in/run.sh), using degit 3.10.1 and giget 3.3.1 through `npx -y`, on Node 22.19.
- Targets:
  1. an empty repo (`git init` only);
  2. a fake existing project with its own `.claude/settings.json` (one permission), `.claude/rules/x.md`, `.claude/skills/mine/SKILL.md`, `CLAUDE.md` and `.gitignore`.
- Each target was run without `--force` and then with it, and the user's files were hashed before and after.

## Results
| Tool / target | Exit | Time | Files | `*.local.*` | Conventions doc | init / validate | User files changed |
|---|---|---|---|---|---|---|---|
| degit / empty repo | 1 (dir not empty) | 3.8s | 0 | – | – | – | – |
| degit / existing, no force | 1 | 2.9s | – | – | – | – | none |
| degit / existing, `--force` | 0 | 5.1s | 90 | 0 | yes | 0 / 0 | `.claude/settings.json` |
| giget / empty repo | 1 (dir exists) | 4.3s | 0 | – | – | – | – |
| giget / existing, no force | 1 | 3.4s | – | – | – | – | none |
| giget / existing, `--force` | 0 | 3.6s | 90 | 0 | yes | 0 / 0 | `.claude/settings.json` |

The two tools tie on every measure.

## What ships besides the workflow
- 4 test files: `.claude/scripts/cli.test.mjs`, `.claude/scripts/ang/features.test.mjs`, `.claude/scripts/ang/config/config.test.mjs` and `.claude/ang/features/pilot/feature.test.mjs`.
- `docs/procedures/running-ang-streams-in-orca.md`, which lands in the user's own `docs/` folder.

Neither breaks anything. Zac's call: the tests stay in. A local workflow improvement may change shipped scripts, and having the tests on hand lets the user check that change.

## What the clobber costs
Ang's `settings.json` carries the hooks that keep indexes fresh, the banner, its permissions and the default output style. The user loses whatever theirs had. In a git repo the old file is one `git diff .claude/settings.json` away, but leaving the merge to the user is easy to miss. Zac chose to wrap the copy-in in a shipped `install.sh` that backs up the user's file and merges the two with node (see [Install script and upgrade ambition](install-and-upgrade-direction.md)).

A file with the same path as an Ang file (for example a user skill called `retro`) would also be overwritten. That is the same mechanism, but the settings merge doesn't cover it. Whether `install.sh` should detect and warn about clashes like this is a detail for planning.

## Unknown unknowns
- **Even a fresh repo needs `--force`**, because both tools count `.git/` as content. The quick start has to say so, or users hit an error on their very first command.
- **The shipped `settings.json` sets `outputStyle`** to Partner In Crime. `/tailor-ang` overrides it per user, so it's fine, but it's one more thing a user's settings lose to the clobber.

## Related
- [Install script and upgrade ambition](install-and-upgrade-direction.md)
- [Spike README](../spikes/copy-in/README.md)
- [Install route landscape](../ideas-content/install-route.md)
- [Hub](../README.md)
