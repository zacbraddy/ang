---
title: Commands
shortDescription: "Bake-off page: Ang commands in tables, a definition list and code blocks"
tags: [documentation]
---
# Commands

Every Ang stage is a slash command you run in Claude Code. Each one does one chunk of work, leaves its changes unstaged for you to review, and finishes by validating the context library.

## The workflow

| Stage | Command | What it does |
|---|---|---|
| Raw | `/ideate` | Turns raw notes in `project-context/raw/` into ideas, or fast-tracks known work to shaping |
| Ideas | `/refine-ideas` | Makes one unknown known through research or conversation |
| Shaping | `/shape-ideas` | Answers one "how could we?" through a spike, experiment or research |
| Planning | `/plan-epic` | Groups shaped items into an epic and plans it one chunk at a time |
| Execution | `/break-down-epic` | Slices an epic into small, ordered stories |
| | `/write-story` | Turns a draft story into a spec with "done when" evidence |
| | `/implement-story` | Implements the next ready story, test-first |
| | `/review-story` | Reviews an implementation with fresh eyes |
| Retro | `/retro` | Distils a finished epic into `10k`, then deletes its folder |

## Library upkeep

`/curate-10k`
: Checks `10k` against the code and prunes anything stale.

`/curate-tags`
: Merges near-duplicate tags so the tag set stays small.

`/kill`
: Closes an idea that isn't worth pursuing, in its own commit.

## Streams

Streams let you run several sessions in parallel, one branch and worktree each.

```sh
/start-stream docs        # cuts stream/docs from main
/read-mail                # handles notes from other streams
/end-stream docs          # after the branch merges
```

## Making Ang yours

| Command | Use it to |
|---|---|
| `/bootstrap-repo` | Seed `10k` once, from your goals or an existing codebase |
| `/bootstrap-quality` | Set up lint, format, tests, pre-commit and CI |
| `/tailor-ang` | Set your name, output style and workspace host |
| `/raise-workflow-improvement` | Record friction with Ang itself |
| `/improve-workflow` | Implement a recorded improvement |
| `/trigger` | Defer an action until a condition is met |

## The context manager

Index files are script-managed. Never hand-edit them; use the CLI:

```sh
node .claude/scripts/ang-context-manager.mjs state show docs-website
node .claude/scripts/ang-context-manager.mjs library validate
```

> **Tip:** `--help` lists every command.
