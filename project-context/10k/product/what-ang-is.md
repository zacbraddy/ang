---
title: What Ang is
shortDescription: Ang's definition, positioning, deliberately closed feature set, where it is documented and how its author uses it
tags: [product-vision, open-source]
---
# What Ang is

## Summary
Ang (Avoid Navel Gazing) is an AI-assisted software development framework for Claude Code, optionally enriched by the Orca workspace host. It is shipped as a lean *starter* that each user bends into their own framework, not a finished product that grows with every request. Its feature set is deliberately closed, and it ships opinionated defaults. Every fact here is the user's own statement of intent (ET 1, evidence tier 1: a primary source), given at bootstrap on 2026-11-13 and in the generic-defaults epic on 2026-11-16.

## Definition
- A framework of skills, agents, rules and one library script that runs inside Claude Code. Orca is an optional host that adds worktree cards and streams support.
- It supports the whole software product lifecycle where a project needs it: technical delivery plus product, marketing, sales, competitor intelligence and project management.
- The human drives the work; Ang assists. It is not a "software factory" (see [first principles](/project-context/10k/product/first-principles.md)).
- Name: **Ang**, written as a name, standing for *Avoid Navel Gazing*: agents spiralling into edge cases and over-specification until a project stalls under its own context. Tagline: **"The Last Software Bender you'll ever need"** (a nod to Aang from *Avatar*).

## Positioning
- **A sourdough starter, not the loaf.** The open-source repo is the starter. A user's own copy, bent by their workflow improvements, is *their* Ang. The two serve different purposes and never need to agree.
- **Solo devs and teams.** Shipped wording is team-neutral, and a teammate joining a bootstrapped repo runs `/tailor-ang` to set their own name, host and style. The release doesn't optimise for teams.
- Ang gets more useful through use: friction becomes a workflow improvement, which an agent implements in a fresh session.
- Supporting another harness (Codex etc.) or a bespoke workflow is the user's own adaptation, not a roadmap item for the repo.
- **Try it alongside what you already run.** The docs pitch a trial next to another framework: Ang on its own branch with streams off, one real problem taken through the funnel end to end, then either delete the branch or have Ang run a migration project onto itself. Zac has moved his own repos over this way (decided in the documentation epic, 2026-11-18).

## Feature set (closed)
The core features are:
1. The stage workflow: raw → ideas → shaping → planning → execution → retro.
2. Context-library management: a curated `10k/` of current truth, per-item sub-libraries, and replacing or deleting over keeping history.
3. Workflow-improvement tooling, so users bend Ang themselves.
4. Streams: parallel worktrees with a cross-stream mailbox, for parallel solo work or teams.

A new feature joins the open-source repo only if its benefit is truly universal. There are no plans to grow the set.

Configuration modules (`intent`, `host`, `pilot`) and `/tailor-ang` personalise these four. They aren't features in this sense. Nor is the plumbing that gets Ang into a repo and keeps it current: `install.sh`, `upgrade-ang` and the release process.

## What you need
- Claude Code, and Node.js 26 or newer (the current LTS, long-term support release; the minimum moves up each October) with npx.
- git, inside a git repo: install runs from its root on a clean working tree.
- macOS, Linux, or Windows through WSL (Windows Subsystem for Linux), with everything running inside WSL. Native Windows is untested best effort: it needs Git for Windows and a manual install.
- Install is one piped line, and upgrades run through `upgrade-ang`; there is no uninstall command ([ADR 0005](/project-context/10k/technical/adrs/0005-install-by-copy-in-from-releases.md), [ADR 0006](/project-context/10k/technical/adrs/0006-upgrade-by-three-way-merge.md)).

## Where Ang is documented
- The root `README.md` is a short tour: the main concepts, the funnel as a table with every stage command, and the install one-liner. Everything deeper is on the docs site at `https://zacbraddy.github.io/ang/`, which also publishes `llms.txt`, `llms-full.txt` and `llms-small.txt` for agents ([ADR 0008](/project-context/10k/technical/adrs/0008-docs-starlight-on-github-pages.md), [ADR 0010](/project-context/10k/technical/adrs/0010-docs-publish-llms-txt.md)).
- The docs site's Releases page lists published stable releases only, newest first. Quick-start and upgrading link to GitHub's own releases page instead, because their tag instructions need RC (release candidate) tags, which the docs page hides.
- A page exists only if a user needs it to choose, run, use or bend Ang. Zac's history and how he got here don't meet that bar.
- Pages describe what the shipped files do ([ADR 0009](/project-context/10k/technical/adrs/0009-docs-describe-shipped-files.md)) and are written per the [docs voice guide](/project-context/10k/marketing/docs-voice-guide.md).

## Defaults and opinions
- **Methods ship as defaults.** DDD, Onion architecture, TDD, Atomic Design and Lean ship in `engineering-defaults.md`, so output is predictable out of the box. Only facts about the pilot are personal: identity, experience, stack, and whether they work solo or in a team. `/tailor-ang` adds those in a gitignored `pilot.local.md`.
- **Initiative isn't configurable.** "Say a better approach once, then do what's decided" is part of Ang. There are no rule variants or rule interview.
- **Disagree by bending it.** Anyone who wants different defaults raises a workflow improvement in their own instance.
- **Ang writes only inside the repo.** Per-user choices go to gitignored `*.local` files in the repo, never to `~/.claude`.
- **Fresh-install defaults:** intent on, streams off. `/bootstrap-repo` asks each feature question and writes the answers to `ang.json`.
- **Voice:** Partner In Crime is the default output style. Four more styles ship, plus a short interview for a custom one (`src/.claude/output-styles/`).

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
