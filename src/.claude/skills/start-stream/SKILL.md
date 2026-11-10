---
name: start-stream
description: Starts an Ang stream, cutting stream/<slug> from main, creating its worktree and registering it. Use when the user runs /start-stream.
disable-model-invocation: true
argument-hint: "<slug> [\"focus\"]"
---

# /start-stream

!`node .claude/scripts/ang-context-manager.mjs session steps start-stream`

A stream is one branch in one worktree that the user works in independently (`.claude/ang/features/streams/conventions.md`). This sets one up and registers it so other streams can see it.

1. **Name it.** Take the slug (kebab-case) and optional one-line focus from $ARGUMENTS; ask for the slug if it's missing. The focus is what `context-scout` in other streams reads before deciding to peek, so suggest one if the user gave none. Run `node .claude/scripts/ang-context-manager.mjs stream list` and stop if the slug is taken.
2. **Cut the branch and worktree.** The trunk is the first worktree in `git worktree list --porcelain`. Create the new one beside it, as `<trunk's parent>/<trunk folder>-<slug>`:
   `git worktree add <path> -b stream/<slug> main`
   If `main` is behind `origin/main`, say so and ask whether to cut from `origin/main` instead. Don't pull, because main may be checked out and dirty in the trunk.
3. **Copy gitignored settings.** For each non-comment line in the trunk's `.worktreeinclude`, copy that path from the trunk into the new worktree if it exists. These hold settings such as `.env.local` that point every worktree at the same store; never create fresh ones.
4. **Register it.** `ang-context-manager.mjs stream add <slug> "<focus>" --worktree <path>`. This commits to the `ang/streams` branch, which is expected. Nothing else is staged or committed.
5. **Report** the branch, the worktree path and how to start working in it (`cd <path> && claude`). If the repo has a lockfile, remind the user to install dependencies there first (e.g. `pnpm install`).
