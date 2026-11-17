---
title: Dropping the /bootstrap-quality nudge
shortDescription: Why shipped Ang stops suggesting /bootstrap-quality on repos that lack quality tooling
tags: [open-source]
---
# Dropping the /bootstrap-quality nudge

## Summary
Shipped Ang stops nudging pilots toward `/bootstrap-quality` (Zac, 2026-11-16). `/bootstrap-repo` already offers quality tooling at the start, so a pilot who declines has made a decision, and they can run the command themselves whenever they choose. Pilots who want a reminder can set one with `/trigger`. The Ang repo adopting the full kit says nothing about what any other Ang install should do.

## The decision
Zac's reasons, in his words, summarised:
- **Ang agents don't nag.** A pilot who has said no shouldn't have to justify that to agent after agent.
- **The nudge predates triggers.** Its job was to stop pilots forgetting, and `/trigger` does that now, on the pilot's terms.
- **Opting out is a decision.** `/bootstrap-repo` offers the tooling up front. Declining it is a choice, and running `/bootstrap-quality` later is easy.
- **One repo isn't a precedent.** The Ang repo going full tooling doesn't bind other installs, any more than one install binds another.

## What changes when built
- `src/.claude/rules/engineering-defaults.md` ("Quality tooling"): remove the "flag it once and suggest `/bootstrap-quality`" sentence. Keep "set-and-forget" and "never debate style a formatter can own".
- `src/.claude/skills/bootstrap-quality/SKILL.md` description: drop "flag that instead", so it ends at "Don't run it unprompted".
- `/bootstrap-repo`'s own offer stays as it is.

## Related
- [Quality tooling](../ideas-content/quality-tooling.md): the Ang repo's own kit
- [ESLint plugins](eslint-plugins.md): the rest of this session's shaping
