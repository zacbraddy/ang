---
title: Agents
description: The three specialist agents Ang sends off for focused jobs. Who calls each one, what it reads, what it hands back, and which one is allowed to change anything.
sidebar:
  order: 2
---
Most of what Ang does happens in your main session, but three jobs get handed to a specialist agent with its own fresh context: finding project context, picking what to work on next, and deciding whether an item is ready to move on. Sending these off keeps your main session's context free for the actual work, and gives each job an agent with nothing else on its mind. You never call them yourself; Ang's skills do, at the moments described below.

## 🧾 At a glance


| Agent           | Called when                                                             | Hands back                                    |
| --------------- | ----------------------------------------------------------------------- | --------------------------------------------- |
| `context-scout` | A task needs project context, or following links didn't find the answer | A short, sourced summary, gaps stated plainly |
| `prioritiser`   | `/refine-ideas` or `/shape-ideas` runs without you naming an item       | One pick, why, and a runner-up                |
| `stage-gate`    | `/refine-ideas`, `/shape-ideas` or `/plan-epic` wraps up                | A verdict, its reasoning, and your next step  |


## 🏇 context-scout

Called at the start of any task that needs project context, and again for a wide search when following links from what it found didn't turn up the answer.

It navigates by the indexes and tags rather than opening folders, reads each doc's Summary before deciding whether the rest is worth reading, and follows Related links at most five hops per thread, so that it finds what matters without hoovering up the whole library. It treats `10k/` as settled truth and everything else as in flight, and flags any place where the two disagree.

It hands back the relevant context as short points, each with the path it came from, in 300 words or fewer unless the caller asks for more. Any conflicts or gaps it found come with it, and if the answer isn't in the library it says "not in the library" plainly rather than filling the gap with a guess.

With [streams](../../concepts/streams-and-mail/) on, the scout also checks the other streams' focus lines when a question looks like it touches their work, and peeks at the ones that fit. It reads their branches straight from git without checking anything out, and labels everything it finds with the stream it came from, e.g. "(stream pricing, provisional)", because another stream's docs are still in flight until they merge to main, even the ones under `10k/`.

## 🏆 prioritiser

Called when you run `/refine-ideas` or `/shape-ideas` without naming an item. This agent is here so that you don't have to stare at the board deciding where to start. If you can't quite work out what the most important thing you could be working on right now is, then running either of the commands listed will pass off that decision to the prioritiser to be made.

It reads the board for that stage, then for each item only its state (status, unknowns, knowns and decisions) and its hub's Summary, never the content folders. It weighs each item on two things: how much the next step is worth to the project (revenue, learning, unblocking other items, cutting risk), and how answerable the top unknown is right now. Items that unblock others get a boost, and `blocked` ones drop down the list.

It hands back a pick (the item and the unknown to tackle), two lines on why, and a runner-up in case you disagree. The final call is yours, as it always is, but if you felt lost in the woods before, hopefully this agent can provide you with a few breadcrumbs to find your way out 🐻

## 🚧 stage-gate

Called at the end of `/refine-ideas`, `/shape-ideas` and `/plan-epic`, to decide whether the item is ready for the next stage of [the funnel](../../concepts/funnel/).

Think of it as a bouncer with a reasonable door policy, making sure no item gets into the next stage "with those shoes on, mate...". It reads the stage exit criteria, the item's state and only the content docs it needs to make the call. Then it judges this one transition. It defaults to "not yet", so that not just any old work item in any old state gets waved through before it's ready, but it doesn't demand perfection either.

In a nutshell, this agent's goal is to stop work items stalling at a stage, paralysed and never promoted until every piece of knowledge it could ever need falls perfectly into place. It promotes an item the **moment** the next stage can start working in a sensible direction, while making sure the information is there for that direction to *actually* be followed once the item gets there. Open unknowns are fine if they belong to the next stage, or if they're stuck on something in the real world that's outside of our control, and those realities are now forcing us to move forward: in that case a best guess is recorded and we carry on. But if there are unknowns this stage could still answer in its normal run of work, the item stays where it is until they're answered.

If the item is ready to be promoted, the gate does the promotion itself:

- **Ideas to shaping:** if another existing shaping item already covers the same ground, it merges your idea into it and tidies the result. Otherwise it moves the idea to its own shaping item.
- **Shaping to planning:** it moves nothing, and marks the item ready for planning with a one-line reason.
- **Planning to execution:** it moves the epic from planning to execution.

After promoting, the agent runs `library validate` and fixes anything it reports.

Finally, the agent hands back the verdict, three bullets of reasoning against the criteria, and either the gap to close next or the item's new path, plus your next step, such as starting a fresh session for `/plan-epic` or `/break-down-epic`. The main agent passes these back to you in session so that you're made aware as well.

Next up: [ang-context-manager.mjs](../../reference/ang-context-manager/), the script all three agents (and every skill) lean on to keep the library's bookkeeping straight.