---
title: "ADR 0009: Docs describe the shipped files"
shortDescription: The README and docs site describe what the files under src/ actually do; where memory and the files differ the files win, and docs defects become recorded work rather than changes to Ang
tags: [documentation, brand-voice]
---
# ADR 0009: Docs describe the shipped files

## Summary
The README and every docs page describe Ang as the files under `src/` make it behave, from the user's seat. Where Zac's memory, a brain dump or a story spec disagrees with the files, the files win. A defect found while writing docs becomes recorded work, not a change to Ang made in the docs work. Drawn from the documentation epic, which found the brain dump out of step with the files (the evidence tiers, for one), and the README story's review (2026-11-18).

## Context
Zac's brain dumps describe Ang from memory and sometimes lag the code. The README story found a spec step that the shipped `/bootstrap-repo` already covered. Docs that describe intended rather than actual behaviour cost users time and trust.

## Decision
- Each page draws its claims from the shipped files it covers, and cites them by full path (`src/…`).
- Pages describe what a user sees and does, not a skill's internal steps.
- A gap between the docs and the files is settled in favour of the files. A gap that looks like a bug in Ang is raised as recorded work.

## Consequences
- Each story review checks every claim on a page against the files it cites.
- When skills change, the matching page needs an edit; one anchor per command keeps those edits local.
- The docs can't run ahead of the code, so features land before their pages.

## Standing
2026-11-18. Built: the README follows it. No site content pages exist yet.

## Related
| Doc | Why |
|---|---|
| [ADR 0008: Docs site](/project-context/10k/technical/adrs/0008-docs-starlight-on-github-pages.md) | Where the docs live |
| [Voice and attribution](/project-context/10k/marketing/voice-and-attribution.md) | How the docs read |
