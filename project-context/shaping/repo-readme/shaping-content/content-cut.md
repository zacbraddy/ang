---
title: Repo README, content cut
shortDescription: Which concepts and commands the whistle-stop README covers, and what goes to the docs site
tags: [documentation]
---
# Content cut

## Summary
Zac's call (2026-11-17), made on a proposal drawn from the shipped files (`src/.claude/skills/`, `src/project-context/README.md`, [What Ang is](/project-context/10k/product/what-ang-is.md)). The README covers four concepts and 13 of the 21 skills. The funnel commands go in a table with one row per stage. Everything else is left to the docs site.

## Concepts in
1. **The funnel:** raw → ideas → shaping → planning → execution → retro → 10k, where each stage answers one question.
2. **Context library:** `10k/` holds current truth and everything else is in flight. Content is replaced, not hoarded. This is the "avoid navel gazing" core.
3. **A starter, not the loaf:** friction becomes a workflow improvement, so each user bends Ang into their own.
4. **Streams (optional):** parallel worktrees with a mailbox between them, in one line that names Orca as the optional host.

## Commands in
| Section | Commands |
|---|---|
| Quick start | `/bootstrap-repo`, `/tailor-ang` |
| Funnel table (stage, the question it asks, its commands) | `/ideate`, `/refine-ideas`, `/shape-ideas`, `/plan-epic`, `/break-down-epic`, `/write-story` → `/implement-story` → `/review-story`, `/retro` |
| Bending Ang | `/raise-workflow-improvement`, `/improve-workflow` |

## Left to the docs site
- Commands: `/kill`, `/curate-10k`, `/curate-tags`, `/trigger`, `/bootstrap-quality`, `/start-stream`, `/end-stream`, `/read-mail`. The README gets an "and a few more" pointer.
- Concepts: triggers, tags, evidence tiers, the agents (stage-gate, prioritiser, context-scout), `ang-context-manager.mjs`, item anatomy and state, and config modules beyond what `/tailor-ang` sets.

## Rejected option
A one-line funnel diagram with five headline commands. It was leaner, but readers couldn't run a full loop from the README alone.

## Related
- [Hub](../README.md)
- [Brief](brief.md)
- [Docs website](/project-context/shaping/docs-website/README.md)
