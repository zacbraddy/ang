---
name: trigger
description: Defers an action or decision until a condition is met, and runs it once it's ready. Use whenever work is clearly needed but can't happen yet because it waits on a story, a stage, a file, a date or an outside event, rather than leaving the user to remember it. Also use when ang-context-manager.mjs library validate reports a ready trigger, a trigger needing judgement or a trigger error, and when the user runs /trigger.
argument-hint: "[add <what to defer> | <slug> to run it]"
---

# Triggers: do it later, at the right moment

A trigger is work we already know how to do, but can't do yet: *what* and *how* are clear, and only *when* is blocked. The user shouldn't have to carry that in their head. The registry carries it, and `ang-context-manager.mjs library validate` (which ends every workflow command) reports it once it's ready. A trigger is only ever **waiting**, **judge** (every checkable condition is met but `custom:` ones still need an agent to check them) or **ready**, worked out fresh each time from its conditions, and it's deleted in the session that does its work.

**A trigger is not a parked idea.** Parked ideas (`ideas/parked.md`) are long-lived and fuzzy, and when one wakes it needs fresh thinking about what it even means now. A trigger is short-lived and concrete: when it's ready there is a job to do. If you can't say what the job is, it's a parked idea, so route it through `/ideate`.

The mechanics (`trigger add | repoint | list | check | remove`) live in `node .claude/scripts/ang-context-manager.mjs`; `trigger --help` lists the condition forms. `triggers.json` is script-managed; never edit it by hand.

!`node .claude/scripts/ang-context-manager.mjs session steps trigger`

## Pick the job
- `$ARGUMENTS` names a slug: **run** it.
- Otherwise: **add**.
- `validate` printed `⏰ ready` mid-session: pass the line on to the user, then carry on with the session's own work. A ready trigger runs in its own fresh session, so its diff is just the work plus the trigger's deletion.
- `validate` printed `🤔 needs judgement` mid-session: the script can't check `custom:` conditions, so you do. Treat each one's text as a question and answer it (run the command, read the file, reason it through). Only when every one holds, tell the user the trigger is ready, as above. If one is false, say nothing: it's simply still waiting. If you can't tell, say so in one line.

## Add
1. **Is it a trigger?** Apply the test above. If you raised it yourself mid-session, propose it to the user in two lines (intent and condition) and add it only on their yes.
2. **Choose the conditions.** All of them must hold for the trigger to be ready.
   - Prefer the checkable kinds. `story:<item>/<NN>=<status>` and `stage:<item>=<stage>` follow an item through `move` and `merge`. A `file:` path breaks when the item moves, so keep `file:` for paths outside the stage folders. `after:` takes a date (local midnight) or a datetime.
   - Use `custom:<one sentence>` only when nothing checkable fits, such as an outside release. Once the checkable conditions are met, any agent that sees the trigger has to check it before calling it ready, so phrase it as something answerable at a glance, ideally with the command or file that settles it.
   - Conditions must point at things that exist now; `add` refuses anything else. When the true condition depends on something that doesn't exist yet (stories not sliced, an epic not named), point at the earliest checkable moment before it, usually a `stage:`, and say in the doc what to re-point it to.
3. **Write the doc** at `project-context/triggers/<slug>.md` in the shape below.
4. Run `ang-context-manager.mjs trigger add <slug> "<intent, one line>" <condition...>`, then `ang-context-manager.mjs library validate`.

If the input is a draft (a raw file, a note from another session), translate it into the doc shape rather than copying its structure, and delete the draft once the trigger is added.

## Run a ready trigger (`/trigger <slug>`, in a fresh session)
1. Read the doc, and run `ang-context-manager.mjs trigger list` to see its conditions.
   - **Custom condition:** check each one yourself before anything else. The `judge` state only means the script couldn't check them, not that they hold. Ask the user if you can't tell. If one doesn't hold yet, say so and stop. The trigger stays waiting for a later session.
   - **Placeholder condition:** if the doc says it was a placeholder (step 2 of Add), the work may be to re-point it with `trigger repoint <slug> <condition...>`, not the whole job.
2. **Judge where the work stands now.** Sessions in between may have moved things, and the doc's *Signs it's already handled* section tells you where to look.
   - **ready as written:** do it.
   - **already done:** confirm with the user and go to step 4.
   - **half done:** finish what's left.
   - **drifted:** the intent holds but the steps no longer fit. Adapt them to today's repo, or rethink them from the doc's *Why now* section.
   - **no longer relevant:** confirm with the user and go to step 4.
3. **Do the work.**
   - **Agent work:** do it here.
   - **Manual work:** walk the user through the steps one at a time and wait for them to report back. Check the result where you can (a file, a command, a status); where you can't, their word settles it.
4. **Delete it:** `ang-context-manager.mjs trigger remove <slug>` (entry and doc together), then `ang-context-manager.mjs library validate`. Ask the user first, since deleting is always their call. The session's changes are the finished work plus the deletion, left unstaged for them. There is no archive; git is the history.

## Fix a trigger error
`validate` errors when a condition points at something gone (an item archived or renamed, a story renumbered). That trigger could never fire, so whoever sees the error fixes it in that session. Read the doc, then either re-point it (`trigger repoint`, which keeps the doc) or ask the user to remove it.

## Doc shape
Write for an agent who arrives cold, possibly weeks later, after the repo has moved on. The registry already holds the conditions, so don't restate them. Give the reasoning behind them, because that is what lets someone adapt the work when things have drifted.

```markdown
---
title: <what will be done>
shortDescription: <one line>
tags: [<existing tags>]
---
# <title>

## Summary
What happens, who does it (agent / the user / the user in a fresh session running X), and the moment it's for, in 2–4 lines.

## Why now, not sooner or later
What has to be true first, and why. What goes wrong if it happens too late, if there's a closing edge. If a condition is a placeholder, say what to re-point it to.

## What to do
Numbered steps, with inputs (paths, commands) and where results go.

## Signs it's already handled
Concrete checks against the repo (a command, a path, a status) that show the work done or half done.

## Related
```
