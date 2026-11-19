---
title: What the PR and issue templates are for
shortDescription: Ang's templates are a guided rubber-ducking nudge toward first principles, not a wall against unwanted PRs
tags: [open-source]
---
# What the PR and issue templates are for

## Summary
Ang uses templates only: no collaborators-only setting, no open-PR cap, no auto-close action (Zac, 2026-11-16). The templates were never meant to block anything. They are a guided rubber-ducking exercise: before raising a PR against Ang upstream, the raiser explains why the change belongs there, even though Ang is built so that changes usually belong in their own install. A real improvement gets the prompts it needs to make its case for every current and future Ang user. A "my way is the right way" PR gets asked to justify itself, and the hope is that its raiser talks themselves round to a workflow improvement in their own Ang. Bad PRs will still arrive, and that's accepted.

## Why not the settings
Desk research on 2026-11-16 found that templates don't measurably stop agent-written or accidental PRs. kickstart.nvim's fork warning sits beside 279 of its 308 PRs in 2026 being closed unmerged. superpowers' "no agent PRs" wording sits beside about 100 PRs a month and a 94% rejection rate it reports itself (ET 3, evidence tier 3: self-reported). Only GitHub's collaborators-only PR setting blocks anything outright. That's beside the point, because blocking was never the aim, and a hard block would also silence the PR that genuinely improves Ang for everyone.

## What the PR template asks (shape, not final wording)
- What changes, and which of [Ang's first principles](/project-context/10k/product/first-principles.md) it serves.
- Why it can't live in your own Ang as a workflow improvement (`/raise-workflow-improvement`) or a personal rule (`/tailor-ang`).
- Who benefits: all current and future Ang users, not only your setup.
- Agents filling it in: name the agent, and say what the human asked for and whether a human reviewed the diff (borrowed lightly from superpowers).
- A one-line check of the `base repository`, for forkers whose PR targets upstream by GitHub's default (kickstart.nvim's wording, which is cheap even if unproven).

## The issue templates
The issue templates follow the same spirit. Because of what Ang is built for, an issue is expected to open a conversation more often than to request a feature. Both are welcome, but a discussion fits Ang far better than a cold demand for a feature. So the open-conversation template leads, and the feature-request template carries the same rubber-ducking prompts as the PR template: which first principle the feature serves, and why it can't be a workflow improvement in your own Ang. Blank issues are off.

## Related
- [Brief](../ideas-content/brief.md): the templates as first wanted
- [Hygiene survey](../ideas-content/hygiene-survey.md): kit 2 and the repos the wording borrows from
- [First principles](/project-context/10k/product/first-principles.md)
