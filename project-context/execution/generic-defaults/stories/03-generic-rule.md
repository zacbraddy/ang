---
title: Generic rule and pointer fixes
shortDescription: Ship team-neutral engineering-defaults.md in place of working-with-zac.md, move Zac's identity to his gitignored pilot.local.md, and fix the two "my rules" pointers
tags: [distribution, brand-voice]
status: draft
owner: agent
dependsOn: []
---
# Generic rule and pointer fixes

## Summary
Replaces `working-with-zac.md` with `src/.claude/rules/engineering-defaults.md`. The new file keeps the methods, the right-sizing guidance and the stance on working together, with team-neutral wording, and drops identity and stack. Those personal facts and the solo framing move to Zac's own gitignored `.claude/rules/pilot.local.md`.

## Outcome
A fresh install ships an opinionated rule with no pilot name in it. Zac's sessions behave as they do today.

## Done when
- `engineering-defaults.md` exists, and `working-with-zac.md` is gone.
- `pilot.local.md` holds Zac's identity, stack and solo framing, and `git check-ignore` confirms it's ignored.
- The "my rules" pointers in `review-story` and `write-story` name `engineering-defaults.md`.
- `git grep -il zac -- src/` matches nothing.

## Rough scope
- Write the generic rule (d1, d3, d15).
- Hand-write Zac's `pilot.local.md` in the shape `/tailor-ang` will produce: identity, stack, solo or team (d16).
- If story 01 hasn't landed yet, add `*.local.md` to the root `.gitignore` before writing `pilot.local.md`.
- Fix the two pointers.

## Links
- [Plan: scope 4](../plan.md)
- [Person references](../person-references.md)
- [Personal line](../origins/generic-personal-defaults/shaping-content/personal-line.md)

## Related
- [Epic hub](../README.md)
- [05 /tailor-ang](05-tailor-ang.md)
