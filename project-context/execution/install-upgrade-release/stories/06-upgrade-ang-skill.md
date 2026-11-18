---
title: upgrade-ang skill
shortDescription: The shipped upgrade-ang skill drives an upgrade end to end, running the target release's engine and taking whichever of the four upgrade routes the plan picks, without ever committing
tags: [distribution, open-source]
status: draft
owner: agent
dependsOn: [02, 05]
---
# upgrade-ang skill

## Summary
The judgement half of an upgrade, shipped in `src/` so it is in every install from rc.1 on: the fixture repo is an rc.1 install, and the rc.1 to rc.2 rehearsal needs the skill already there. Only the engine comes from the target tree (d29).

## Outcome
`upgrade-ang` runs the checks (d13), fetches the target and base trees with giget into a temp folder, runs `upgrade guides` and `upgrade plan` from the target tree, and takes the plan's route ([upgrade routes](../upgrade-routes.md)). On every route it rereads clean merges against upstream's diff and Retired entries, resolves the conflicts it's sure of, and checks conflict-deletes as moves, recording each as a `resolution` in the plan. Agent-resolved asks the user nothing. Guided confirms only the merges that risk breaking Ang or a customisation. Guided with warning first shows the conflict count and a risk assessment and suggests owning a fork, and the user decides (all or nothing, d26). It then runs `upgrade apply`, `settings merge` with the base tree's settings, `version write`, `library validate` and the shipped tests, and prints a summary. Changes stay unstaged. Dry-run against hand-built trees here; proven for real in story 13.

## Rough scope
- `src/.claude/skills/upgrade-ang/SKILL.md`, following the stages in [C4 components](../c4/3-components.md).
- Skill prose isn't unit-tested (test strategy).

## Related
- [Plan: upgrade](../plan.md)
- [Story 05](05-upgrade-engine.md)
- [Story 13](13-cut-rc2-with-rehearsal.md)
