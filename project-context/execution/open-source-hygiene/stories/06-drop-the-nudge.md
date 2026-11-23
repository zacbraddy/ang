---
title: Drop the nudge
shortDescription: Shipped Ang stops nudging pilots toward /bootstrap-quality; /bootstrap-repo offers a /trigger instead
tags: [open-source]
status: ready
owner: agent
dependsOn: []
---
# Drop the nudge

## Summary
The three shipped `src/` edits in this epic. Ang offers quality tooling once at `/bootstrap-repo` and doesn't repeat the suggestion.

## Done when
- `grep -rn "bootstrap-quality" src/.claude/rules` prints nothing.
- The `bootstrap-quality` skill description ends at "Don't run it unprompted just because a repo lacks tooling."
- `/bootstrap-repo` step 7's founding-only line offers a `/trigger` for `/bootstrap-quality` once code exists, and says a no sets nothing.
- `npm test` and `npm run lint` are green, and `ang-context-manager.mjs library validate` is clean.

## Acceptance criteria
- Given a repo past spike stage with no quality tooling, when an agent works under `engineering-defaults.md`, then no rule tells it to flag the gap or suggest `/bootstrap-quality`.
- Given the `bootstrap-quality` skill, when an agent reads its description, then it learns not to run unprompted and isn't told to flag missing tooling.
- Given a founding-only repo (no code), when `/bootstrap-repo` reaches step 7, then it offers to add a trigger that runs `/bootstrap-quality` once code exists.
- Given that offer, when the pilot says yes, then the agent adds it through the `trigger` skill.
- Given that offer, when the pilot says no, then no trigger is added and nothing else is set or repeated.
- Given a repo with code, when `/bootstrap-repo` reaches step 7, then it invokes `bootstrap-quality` exactly as before.

## Test plan
- No new tests (plan: Test strategy). These are prose edits to agent-facing files; nothing executable changes.
- Regression guard: `npm test` and `npm run lint` stay green.
- Won't test: agent behaviour against the new prose. The `grep` in Done when is the check.

## Implementation notes
- `src/.claude/rules/engineering-defaults.md:31` (Quality tooling): delete "If a repo past spike stage lacks them, flag it once and suggest `/bootstrap-quality`." Keep "set-and-forget" and "Never debate style a formatter can own."
- `src/.claude/skills/bootstrap-quality/SKILL.md:3`: the description ends "…Don't run it unprompted just because a repo lacks tooling." (drop "; flag that instead").
- `src/.claude/skills/bootstrap-repo/SKILL.md:68`: replace the "tell me to run `/bootstrap-quality`" line. Skip the step, then offer a trigger through the `trigger` skill: intent "run `/bootstrap-quality`", and a `custom:` condition, because a founding-only repo has no story, stage or single file to point at. Phrase the condition so an agent can answer it at a glance, e.g. "the repo has source code outside `project-context/` and `.claude/` (`git ls-files`)". On no, set nothing and don't repeat the offer.
- The `trigger` skill already owns the propose-in-two-lines flow, the doc shape and `trigger add`, so step 7 points at it rather than restating it.
- Write the new line as a description of what happens (memory: prompts describe, not forbid).
- Out of scope:
  - `docs/src/content/docs/commands/setup.md:36-40` already describes the trigger offer and "say no and nothing is set". Leave it.
  - Step 7's has-code branch (`bootstrap-repo/SKILL.md:67`).
  - The shaping doc's "`/bootstrap-repo`'s own offer stays as it is" (`bootstrap-quality-nudge.md:21`). Decision d15 supersedes it, and origins aren't kept current.

## Related
- [C4 code: shipped prose edits](../c4/4-code.md#shipped-prose-edits-story-6)
- [Plan](../plan.md)
- [Dropping the /bootstrap-quality nudge](../origins/open-source-hygiene/shaping-content/bootstrap-quality-nudge.md)
- [Triggers skill](/src/.claude/skills/trigger/SKILL.md)
