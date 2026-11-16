---
title: Pilot feature spike
shortDescription: Throwaway spike proving a pilot-name Ang feature reaches sessions and subagents with no per-skill templating
tags: [distribution, repo-structure]
---
# Pilot feature spike

## Summary
A `pilot` feature in `.claude/ang.json` gets the pilot's name into every main session and subagent through the existing SessionStart and SubagentStart hooks. All 4 agreed measures passed. Skills and rules don't change. Run on 2026-11-16 in a scratch repo holding a copy of `src/.claude`.

## What's here
- `feature.mjs`: the feature module. Its value is `null` or a name. It is on when the value is a string, and it builds its rule text from the name.
- `script-changes.diff`: about 10 lines across `features.mjs` and `commands/session.mjs`. It adds `featureRule(feature, config)`, so a feature can ship a `rule(value)` function in place of a static `rule.md`, and the banner and subagent hooks use it.

## Setup
- A scratch git repo holding `src/.claude` (minus `working-with-zac.md`) and the starter `project-context/README.md`. Its git user was set to `spike`, so the control couldn't pick up "zacbraddy".
- `claude -p` on Sonnet 5.5, with `CLAUDE_PROJECT_DIR` pointing at the scratch repo.

## Results
| # | Measure | Result |
|---|---|---|
| 1 | With the name set, `session banner` and `session subagent` output it | Pass. The banner reads `Ang: pilot (Zac)` followed by the Pilot rule, and the subagent's `additionalContext` carries the same rule |
| 2 | A fresh session uses the name unprompted | Pass. 3 of 3 runs with the name set opened "Hey Zac". 0 of 3 control runs (unset) used a name |
| 3 | A subagent sees the name | Pass. 2 of 2 runs with the name set gave "Hi/Hello Zac". The control was generic. The main agent was told not to pass a name on |
| 4 | Unset adds nothing and validates | Pass. The banner reads `no optional features on`, the subagent hook prints nothing and `library validate` passes. `""`, `"  "` and `42` are rejected with "pilot must be null or a name" |

## Unknown unknowns
- The workspace was untrusted, so permissions were ignored, but the hooks still ran. Tailoring doesn't depend on trust.
- The Pilot rule adds about 200 characters to the SessionStart output, well under the 10,000-character hook limit.
- `/bootstrap-repo` already asks every feature's `bootstrap.question` through `session features`. The pilot question comes for free, which is part of u3.

## Related
- [Pilot name findings](../../shaping-content/pilot-name.md)
- [Hub](../../../../README.md)
