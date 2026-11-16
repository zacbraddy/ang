---
title: Person references in shipped files
shortDescription: Where shipped skills, rules and features refer to the pilot, and the two pointers that break when working-with-zac.md is renamed
tags: [open-source, distribution, repo-structure]
---
# Person references in shipped files

## Summary
A grep of `src/.claude` (2026-11-16) found no literal pilot name outside `rules/working-with-zac.md`, which this epic replaces with `engineering-defaults.md`. The remaining split is voice, not identity: older skills speak as the invoker ("ask me", "for me to review"), newer skills (`kill`, `trigger`, `start-stream`, `end-stream`), agents, feature files and scripts say "the user". Both read correctly for whoever runs the command, solo or team, so there's no mass rewrite. Two lines do need fixing, because "my rules" points at a rule this epic renames.

## Must fix in this epic
| File | Line today | Change |
|---|---|---|
| `src/.claude/skills/review-story/SKILL.md` | "my coding and testing rules (right-sized tests, no testing libraries, …)" | Name `engineering-defaults.md` (plus `pilot.local.md` when present). "No testing libraries" also misreads the rule, which says don't test library behaviour; reword it |
| `src/.claude/skills/write-story/SKILL.md` | "per my testing rules" | Name `engineering-defaults.md` |

## Left as is
- First-person "me" in skills: the skill is the invoker's own instruction, so "me" is whoever ran it. Consistent with [k5](origins/generic-personal-defaults/shaping-content/pilot-name.md): new work writes "me" or "the user", never a name.
- "The user" in agents, hook-injected feature rules and scripts: those aren't spoken by the invoker, so third person is right.

## Related
- [Epic hub](README.md)
- [Pilot name](origins/generic-personal-defaults/shaping-content/pilot-name.md)
- [Personal line](origins/generic-personal-defaults/shaping-content/personal-line.md)
