---
title: Generic rule and pointer fixes
shortDescription: Ship team-neutral engineering-defaults.md in place of working-with-zac.md, move Zac's identity to his gitignored pilot.local.md, and fix the two "my rules" pointers
tags: [distribution, brand-voice]
status: ready
owner: agent
dependsOn: []
---
# Generic rule and pointer fixes

## Summary
Replaces `working-with-zac.md` with `src/.claude/rules/engineering-defaults.md`. The new file keeps the methods, the right-sizing guidance and the stance on working together, with team-neutral wording, and drops identity and stack. Those personal facts and the solo framing move to Zac's own gitignored `.claude/rules/pilot.local.md`.

## Outcome
A fresh install ships an opinionated rule with no pilot name in it. Zac's sessions behave as they do today.

## Done when
- `src/.claude/rules/engineering-defaults.md` exists; `src/.claude/rules/working-with-zac.md` is gone.
- `src/.claude/rules/pilot.local.md` holds Zac's identity, stack and solo framing, and `git check-ignore -v src/.claude/rules/pilot.local.md` reports the `*.local.md` rule.
- `review-story` and `write-story` name `engineering-defaults.md` where they said "my rules".
- `grep -rli zac src/ --exclude='*.test.mjs'` returns nothing. (Plain `grep`, not `git grep`, because the old rule was never tracked; test fixtures use "Zac" as a sample pilot name, as in story 02.)
- `node --test 'src/.claude/**/*.test.mjs'` still passes; `library validate` passes.

## Acceptance criteria
- Given a fresh install without `pilot.local.md`, when a session starts, then the engineering defaults load and name no person, stack or solo setup.
- Given Zac's checkout, when a session starts, then both `engineering-defaults.md` and `pilot.local.md` load, and together they cover everything `working-with-zac.md` said.
- Given `pilot.local.md` is loaded, then it only adds to the generic rule; it never restates or contradicts it (rules have no precedence, k7).
- Given `/review-story` runs on a code story, then its checklist points at `engineering-defaults.md`, plus `pilot.local.md` when present.
- Given `git status` after the story, then `pilot.local.md` does not appear.

## Test plan
- **Unit / integration**: none. Nothing here is code.
- **Won't test**: rule wording and markdown content (plan scope 4, "Not tested"), the skill pointer edits, gitignore behaviour (git's, checked once by hand via `git check-ignore`).
- **Checks**: the Done-when commands, run by hand.

## Implementation notes
- **`src/.claude/rules/engineering-defaults.md`**: carry over `working-with-zac.md` section by section, following [personal line](../origins/generic-personal-defaults/shaping-content/personal-line.md):
  - Drop the title "Working with Zac" and the identity and stack lines (years, contractor, solo, TS/Node/React, cloud order). Keep "Favoured: DDD, Onion architecture, TDD, Atomic Design, Lean startup" (d1).
  - Keep Context precedence, Right-size everything, Working together (the "say it once, then do what's decided" stance stays, d15), Code, Tests and Quality tooling.
  - Team-neutral wording (d3): first person ("I", "me", "my") becomes "the user". Change "Docs are for future-me … not team onboarding" to "Docs are for whoever runs this next: setup and how do I run this". Onboarding docs only when a team needs them.
  - Keep the `/bootstrap-quality` pointer.
- **`src/.claude/rules/pilot.local.md`**: hand-write it in the shape `/tailor-ang` (05) will produce, one short section per d16 question. This file sets that shape, since the library holds no template:
  - **Role and experience**: senior engineer, 13 years professional, ~8 in startups, solo contractor.
  - **Default stack**: TypeScript/Node both ends, React frontend; also Python, IaC, CI/CD; cloud AWS > Azure > GCP; defaults, not limits.
  - **Solo or team**: solo; usually the only human reading the code, docs and tests, so docs are for future-me.
  - Additive only: nothing from the generic rule repeated.
- **Delete `working-with-zac.md`** with a plain `rm`: it's untracked, so not `git rm`.
- **Pointers**:
  - `src/.claude/skills/write-story/SKILL.md:16`: "per my testing rules" → "per `engineering-defaults.md`".
  - `src/.claude/skills/review-story/SKILL.md:23`: "my coding and testing rules (right-sized tests, no testing libraries, …)" → "`engineering-defaults.md`, plus `pilot.local.md` when present (right-sized tests, no tests of library behaviour, comments only where there be dragons)". The old "no testing libraries" misread the rule ([person references](../person-references.md)).
- **Gitignore**: no change needed. Root `.gitignore` already has unanchored `*.local.md` (story 01).
- **Out of scope**: "me"/"the user" in other skills, agents and scripts (k5, k15); test fixtures named "Zac"; `src/.claude/output-styles/` (04); `/tailor-ang` writing `pilot.local.md` (05); docs (06).

## Links
- [Plan: scope 4](../plan.md)
- [Person references](../person-references.md)
- [Personal line](../origins/generic-personal-defaults/shaping-content/personal-line.md)

## Related
- [Epic hub](../README.md)
- [05 /tailor-ang](05-tailor-ang.md)
