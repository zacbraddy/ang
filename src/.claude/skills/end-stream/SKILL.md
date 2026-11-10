---
name: end-stream
description: Ends an Ang stream once its branch is merged (or the user abandons it), clearing its inbox, deregistering it and offering to remove its worktree. Use when the user runs /end-stream.
disable-model-invocation: true
argument-hint: "<slug>"
---

# /end-stream

!`node .claude/scripts/ang-context-manager.mjs session steps end-stream`

Ending a stream removes it from the registry so other streams stop seeing it. Its work survives only through main, so this refuses to lose unmerged work silently (`.claude/ang/features/streams/conventions.md`).

1. **Find it.** Take the slug from $ARGUMENTS and look it up with `node .claude/scripts/ang-context-manager.mjs stream list`. If it is this checkout's stream (`*`), carry on, but skip the worktree removal in step 5; a session can't remove the folder it runs in.
2. **Check it's merged.** `git merge-base --is-ancestor <branch> main`; if that fails, try `origin/main`. If it isn't merged, stop and show the user what's unmerged (`git log --oneline main..<branch>`). Go on only if they explicitly say to abandon it.
3. **Clear its inbox.** `mail list <slug>`. These notes would otherwise be orphaned, because nothing reads a removed stream's mail. Notes it *sent* stay with their recipients. For each one, the user decides:
   - **forward** it to a live stream (`mail forward <id> <stream>`);
   - **record** it here as a known, unknown, decision or trigger through the usual commands, then `mail handle <id>`;
   - **drop** it (`mail handle <id>`).
4. **Deregister:** `stream remove <slug>`.
5. **Offer the clean-up**, each with the user's yes:
   - `git worktree remove <path>`. If it refuses because the worktree is dirty, show `git -C <path> status --short` and stop there; never `--force` without their say-so.
   - Delete the branch: `git branch -d <branch>` when merged, `-D` only for an abandoned stream. Delete `origin/<branch>` too if it was pushed.
6. **Report** what was forwarded, recorded or dropped, and what was removed. The `ang/streams` commits are the only commits made; anything recorded in step 3 is left unstaged.
