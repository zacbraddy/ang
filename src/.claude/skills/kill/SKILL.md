---
name: kill
description: Closes an idea or shaping item that isn't worth pursuing, recording the decision then deleting the folder in its own commit. Use when the user agrees an item should be killed (typically right after you've suggested it in-session), or when they run /kill.
argument-hint: "<item folder or slug>"
---

# /kill: close an item cleanly

1. **Agreement gate.** Continue only if the user has explicitly agreed to kill this item ($ARGUMENTS) in this conversation. If they haven't, give the case for killing it in up to 3 bullets and ask.
2. Record it with `node .claude/scripts/ang-context-manager.mjs state add <item> decision "Killed — <reason>" README.md`. Ask the user to review and commit.
3. Once they confirm the commit: delete the folder, run `ang-context-manager.mjs library validate` (fix any links that pointed into it), and commit with the message `kill: <slug> — <reason>`. This commit is yours to make.
4. Report the commit hash. Git log is the archive if we ever want to revive it.
