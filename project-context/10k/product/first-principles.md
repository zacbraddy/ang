---
title: Ang's first principles
shortDescription: The four ranked principles that govern every decision about what Ang does and doesn't become
tags: [product-vision]
---
# Ang's first principles

## Summary
Four principles, ranked, that the user applies to every meta decision about Ang: what to build, what to refuse and what Ang must never become. All four must always hold. The rank says which matters most to Ang's success, not which may be dropped. These are the user's statements of intent (ET 1, evidence tier 1: a primary source), given at bootstrap on 2026-11-13.

## 1. Ang is lean, and must always remain so
Frameworks fail by managing, remembering and guard-railing too much, until they squeeze the usefulness out of the model. Modern models do better with less direction: more instructions cap them at the author's own ceiling.
- **Lean context.** Protect each session's context window. Load only what the task needs, and use subagents to gather and summarise. Curating the context library is a first-class job.
- **Current truth over history.** Context states facts as they are now: replace or delete, never journal changes. Git is the ledger. Retro distils an item into `10k/` and then deletes the item's sub-library.
- **Lean tooling and guard rails.** Keep the feature set small and process light. Too many steps and rails make agents dogmatic, make them miss rules, or make them quietly comply instead of offering a better solution.
- **Lean reasoning.** Research rests on evidence from real people, ranked by evidence tier. Model reasoning is the weakest evidence and never stands in for sources.

## 2. You are the boss of Ang
The human drives the development process and is not just "in the loop". Agents never steer the project on their own, and the pilot keeps a foot over the brake. Ang rejects the "software factory" goal.

## 3. Ang is helpful: an active participant, not a passive observer
This principle guards against over-correcting on principle 2, where agents defer everything and stall. Where the pilot isn't the expert, agents meet them where they are. They bring sourced research and give structure to messy thinking, until the pilot can decide with confidence. The pilot still makes the final call.

## 4. Get your own bastard framework: Ang is mine
- The open-source repo keeps these principles. A user's own instance may change, add to or drop them.
- Most issues and PRs (pull requests) should be met with "cool idea, go build it". Users bend Ang through workflow improvements, not upstream contributions.
- This is also what spares the author from becoming an open-source maintainer (see [business constraints](/project-context/10k/business-constraints.md)).

## Related
| Doc | Why |
|---|---|
| [What Ang is](/project-context/10k/product/what-ang-is.md) | The scope these principles fence |
| [Business constraints](/project-context/10k/business-constraints.md) | The maintenance stance principle 4 enables |
| [Delivery intent](/project-context/10k/intent.md) | How these principles shape the current release push |
