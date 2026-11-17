---
title: upgrade-ang skill
shortDescription: The shipped upgrade-ang skill drives an upgrade end to end, running the target release's engine and taking the fast path, guided merge or escape hatch
tags: [distribution, open-source]
status: draft
owner: agent
dependsOn: [02, 05]
---
# upgrade-ang skill

## Summary
The judgement half of an upgrade, shipped in `src/` so it is in every install from rc.1 on: the fixture repo is an rc.1 install, and the rc.1 to rc.2 rehearsal needs the skill already there. Only the engine comes from the target tree (d29).

## Outcome
`upgrade-ang` runs the checks (d13), fetches the target and base trees with giget into a temp folder, runs `upgrade guides` and `upgrade plan` from the target tree, and takes the fast path, guided merge (rereads clean merges against upstream's diff and Retired entries, resolves conflicts with the user, checks conflict-deletes as moves) or escape hatch (shows the size; all or nothing, d26). It then runs `upgrade apply`, `settings merge` with the base tree's settings, `version write`, `library validate` and the shipped tests, and prints a summary. Changes stay unstaged. Dry-run against hand-built trees here; proven for real in story 13.

## Rough scope
- `src/.claude/skills/upgrade-ang/SKILL.md`, following the stages in [C4 components](../c4/3-components.md).
- Skill prose isn't unit-tested (test strategy).

## Related
- [Plan: upgrade](../plan.md)
- [Story 05](05-upgrade-engine.md)
- [Story 13](13-cut-rc2-with-rehearsal.md)
