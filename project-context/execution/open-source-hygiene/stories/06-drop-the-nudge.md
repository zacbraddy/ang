---
title: Drop the nudge
shortDescription: Shipped Ang stops nudging pilots toward /bootstrap-quality; /bootstrap-repo offers a /trigger instead
tags: [open-source]
status: draft
owner: agent
dependsOn: []
---
# Drop the nudge

## Summary
The three shipped `src/` edits in this epic. Ang offers quality tooling once at `/bootstrap-repo` and doesn't repeat the suggestion.

## Outcome
`grep -r "bootstrap-quality" src/.claude/rules` finds nothing, and `/bootstrap-repo` step 7's founding-only branch offers a `/trigger` for `/bootstrap-quality` once code exists.

## Rough scope
- `src/.claude/rules/engineering-defaults.md`: drop the nudge sentence.
- `src/.claude/skills/bootstrap-quality/SKILL.md`: description drops "; flag that instead".
- `src/.claude/skills/bootstrap-repo/SKILL.md`: step 7's founding-only line offers the `/trigger`; no means nothing is set.

## Related
- [C4 code: shipped prose edits](../c4/4-code.md#shipped-prose-edits-story-6)
- [Dropping the /bootstrap-quality nudge](../origins/open-source-hygiene/shaping-content/bootstrap-quality-nudge.md)
