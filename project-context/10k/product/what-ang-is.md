---
title: What Ang is
shortDescription: Ang's definition, positioning, deliberately closed feature set and how its author uses it
tags: [product-vision, open-source]
---
# What Ang is

## Summary
Ang (Avoid Navel Gazing) is an AI-assisted software development framework for Claude Code, optionally enriched by the Orca workspace host. It is shipped as a lean *starter* that each user bends into their own framework, not a finished product that grows with every request. Its feature set is deliberately closed. Every fact here is the user's own statement of intent (ET 1, evidence tier 1: a primary source), given at bootstrap on 2026-11-13.

## Definition
- A framework of skills, agents, rules and one library script that runs inside Claude Code. Orca is an optional host that adds worktree cards and streams support.
- It supports the whole software product lifecycle where a project needs it: technical delivery plus product, marketing, sales, competitor intelligence and project management.
- The human drives the work; Ang assists. It is not a "software factory" (see [first principles](/project-context/10k/product/first-principles.md)).
- Name: **Ang**, written as a name, standing for *Avoid Navel Gazing*: agents spiralling into edge cases and over-specification until a project stalls under its own context. Tagline: **"The Last Software Bender you'll ever need"** (a nod to Aang from *Avatar*).

## Positioning
- **A sourdough starter, not the loaf.** The open-source repo is the starter. A user's own copy, bent by their workflow improvements, is *their* Ang. The two serve different purposes and never need to agree.
- Ang gets more useful through use: friction becomes a workflow improvement, which an agent implements in a fresh session.
- Supporting another harness (Codex etc.) or a bespoke workflow is the user's own adaptation, not a roadmap item for the repo.

## Feature set (closed)
The core features are:
1. The stage workflow: raw → ideas → shaping → planning → execution → retro.
2. Context-library management: a curated `10k/` of current truth, per-item sub-libraries, and replacing or deleting over keeping history.
3. Workflow-improvement tooling, so users bend Ang themselves.
4. Streams: parallel worktrees with a cross-stream mailbox, for parallel solo work or teams.

A new feature joins the open-source repo only if its benefit is truly universal. There are no plans to grow the set.

## How the author uses it
- **Client contracts:** drop Ang beside a client repo, `/bootstrap-repo` in brownfield mode, then feed onboarding notes and tickets into `raw/`.
- **Own products (We Right Code):** a fresh repo with a founding brain dump in `raw/`, which `/ideate` cuts into workstreams.
- Per-project friction is handled with workflow improvements. The result can be several Ang instances, each tailored to its project.

## Related
| Doc | Why |
|---|---|
| [First principles](/project-context/10k/product/first-principles.md) | The lens for every decision about what Ang does |
| [Business constraints](/project-context/10k/business-constraints.md) | Licence, maintenance stance and limits on the release |
| [Voice and attribution](/project-context/10k/marketing/voice-and-attribution.md) | How Ang is presented publicly |
| [Delivery intent](/project-context/10k/intent.md) | How the open-source release is being delivered |
