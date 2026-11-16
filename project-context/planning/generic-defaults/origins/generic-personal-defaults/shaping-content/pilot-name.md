---
title: Pilot name without templating
shortDescription: The pilot's name ships as an optional Ang feature injected by hooks, so skills, rules and future features never template it
tags: [distribution, repo-structure, brand-voice]
---
# Pilot name without templating

## Summary
There's no templating. An optional `pilot` key in `.claude/ang.json` (default `null`) turns on a feature whose rule tells every session and subagent who "me" and "the user" mean, and to address them by name. Unset, nothing is added and the generic wording stands. A spike passed all 4 measures (ET 1, evidence tier 1: measured directly in this project). Chosen with Zac, 2026-11-16.

## Options weighed
| Option | Verdict |
|---|---|
| **A. A `pilot` feature injected by the existing hooks** | Chosen. It reuses the feature system, skills don't change, and new features need nothing |
| B. `{{pilot}}` rendered through skill `!` commands | Rejected. Rules can't run `!` commands, it adds a failure point to every skill, and future features must remember it |
| C. The tailoring step writes the name into the files | Rejected. The files fork from upstream and every Ang update becomes a merge |

## How it works
- `.claude/ang/features/pilot/feature.mjs` takes `null` or a non-empty name. It is on when the value is a string, its banner note is the name, and `rule(name)` builds the rule text.
- The feature system gains one hook point: a feature may export `rule(value)` in place of a static `rule.md`. That's about 10 lines in `features.mjs` and `commands/session.mjs`.
- The value lives in the gitignored root `ang.local.json`. The [tailoring command](./tailoring.md), which is part of this item and which `/bootstrap-repo` invokes, asks for it.

## Evidence
See the [spike](../spikes/pilot-feature/README.md). With the name set, 3 of 3 fresh sessions and 2 of 2 subagents used "Zac" unprompted. Controls with it unset used no name. Unset validates clean, and bad values are rejected.

## What it settles
- **u2:** the hooks inject it, and unset means off.
- **u4:** the workflow-improvement flow has nothing to honour, because the name never lives in skills. The one rule is to write "me" or "the user", never a literal name. u5 covers the existing ones.

## Related
- [Spike](../spikes/pilot-feature/README.md)
- [Where the personal line sits](./personal-line.md)
- [Brief](./brief.md)
- [Hub](../../../README.md)
