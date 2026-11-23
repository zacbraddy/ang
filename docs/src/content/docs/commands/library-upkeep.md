---
title: Library upkeep
description: The commands that keep your context library in good shape. Killing an item, checking 10k against reality, tidying tags, and deferring work with triggers.
sidebar:
  order: 2
---
The funnel moves work forward. These four commands keep the [context library](../../concepts/context-library/) it runs on worth trusting: binning items that aren't worth it, checking `10k/` still matches reality, keeping the tag list short enough to be useful, and holding onto work that can't happen yet. You won't run them every day, so it might be tough to keep their exact usage in your head, but that's exactly why this page exists. When you do need one, you only need to remember that you can head back here to be reminded of what each takes and what it'll do.

## 🧾 At a glance


| Command        | Run it when                                                    | Who starts it                                    | You get back                                                                    |
| -------------- | -------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------- |
| `/kill`        | An idea or shaping item isn't worth pursuing                   | You, or Ang offers it when it thinks it's time   | The reason recorded, then the folder deleted in a commit Ang makes              |
| `/curate-10k`  | You suspect `10k/` has drifted from your code or your business | You only                                         | Fixes to `10k/` you agreed five at a time, unstaged                             |
| `/curate-tags` | The tag list has grown past 50, or feels muddled               | You only (`validate` suggests it past 50)        | Merged and removed tags, every doc rewritten to match, and before and after counts |
| `/trigger`     | Work is ready to define but can't happen yet, or one's ready   | You, or Ang offers one when it spots deferred work | A new trigger, or a ready trigger's work done and the trigger deleted           |


"Ang offers it" means an agent can suggest the command mid-session when it sees the need. It never goes ahead on its own: every one of these still waits for your yes.

## 🪓 /kill

**Run it when** an idea or shaping item has turned out not to be worth pursuing.

**Pass it** the item's folder or slug (`/kill dark-mode`). [Killing an idea](../../concepts/funnel/#-killing-an-idea) covers why a kill is a good outcome, and why it only works on ideas and shaping items.

Ang only kills what you've explicitly agreed to kill in this conversation. If you run `/kill` cold, or Ang brought it up and you haven't said yes yet, it gives you the case for killing the item in up to three bullets and asks. Nothing gets touched until you agree.

Once you have made the final decision to kill an item, the process that follows happens in two steps. It happens this way so that the reason is safely in git before the folder disappears:

1. **Ang records the reason** as a decision on the item, and asks you to review and commit it.
2. **Once you confirm the commit, Ang deletes the folder,** runs the library check to fix any links elsewhere that pointed into it, and commits all of that itself, with the message `kill: <slug> — <reason>`, like `kill: dark-mode — only three users ever asked`. It reports the commit hash when it's done.

That second commit is one of the few Ang ever makes for you. It's a deletion, and within the Ang framework we rely on git to remember the history of decisions like this, so it's important to the success of the framework that this deletion commit isn't missed. That's why Ang takes care of it for you, with the reason right there in the commit message. Six months down the track, when you want to be reminded about the details of something you killed, you won't be left wondering where it went: `git log` shows you the kill, and the commit just before it holds the whole item.

This allows you, in six months' time, to potentially revive an item if things have changed in a way that makes the idea worth revisiting and picking up the pursuit on.

## 🔬 /curate-10k

**Run it when** you suspect `10k/` has drifted from what's actually true: a refactor that never made it through a retro, a pricing change, a decision that quietly got overtaken.

**Pass it** a department or path to check just that slice (`/curate-10k technical`, or `/curate-10k 10k/legal`). Leave it off and Ang checks the lot. [The 10k view](../../concepts/context-library/#-the-10k-view-whats-true-right-now) covers what `10k/` is for and why only a couple of commands get to change it.

Ang starts with the library check and fixes anything mechanical, like broken links, so that the real review isn't tripping over trivia. Then it splits `10k/` into slices and sends an agent off to check every claim in each one, in parallel:

- **Technical claims** get checked against your code. The evidence is a file and line, so that you can look for yourself.
- **Everything else** gets checked for consistency and against recent work. Claims only you can confirm (your pricing, your legal setup) are flagged for you rather than guessed at.

Each claim comes back as true, stale, wrong or unverifiable. While it's in there, Ang also hunts for ADRs that no longer bind future work because the code or a later decision overtook them, facts repeated across several docs, docs that have grown past about 300 lines, and orphaned docs nothing links to.

Then it shows you fixes five at a time, each marked as a rewrite, a merge or a delete, along with the evidence behind why Ang thinks the change is justified. When Ang is making a change you've agreed on, it will only leave behind in `10k/` the fact the code proves, or the answer to a question you've clarified. It never records both sides, and it never adds "this used to say…" notes. Ang knows that `10k/` is what's true now, and that's all it needs to hold. Git already has what used to be, so if future agents want to learn the history of your repo, that's where they can go.

At the end you get back a summary of what changed and if there's anything still waiting on your confirmation. Everything is unstaged for you to review. Once you've gotten to a place you're happy with, you can stage the changes and commit your new 10k ready for use by future agents.

:::note[Delivery intent on?]
With the delivery intent switched on, `/curate-10k` leaves `10k/intent.md` out of the check, because it's your intent, not a claim about the code, so there's nothing to check it against. Instead, once the fixes are done, Ang plays your intent back in a few lines and asks whether it still holds. Say yes and it's marked confirmed as of today. Say no and Ang helps you put what's changed into words. More in [Config](../../reference/config/).
:::

## 🔖 /curate-tags

**Run it when** the library check tells you you've passed 50 tags, or the tag list just feels like a junk drawer: three versions of the same thing, and a few that no doc uses any more.

This command takes no arguments.

Tags are how agents find the docs that matter to a task without reading the whole library, so every tag needs to pick out a slice worth finding. Fewer than 50 is the target. Ang looks at how often each tag is used and proposes three kinds of change:

- **Merge clusters:** synonyms and overlapping tags rolled into one canonical tag, with a better description.
- **Removals:** tags no doc uses any more.
- **A watch list:** tags only one doc uses. These stay only if they're likely to grow.

You see the clusters five at a time and agree each one. Then Ang applies them, and a merge rewrites every doc that used the old tags, so that nothing is left pointing at a tag that's gone. You get back the tag count before and after, with every change unstaged. As usual, it's now your job to review, stage and commit the changes so they're ready for use in future sessions.

## 🔔 /trigger

**Run it when** you've got work you know how to do but can't do yet, or in a new session after Ang has told you a trigger is ready.

**Pass it** `add` and what you want deferred, in plain words, if you want to make a new trigger. Otherwise pass it a trigger's slug to have Ang execute the trigger's instructions. [Triggers](../../concepts/triggers/) covers the whole idea, from the conditions a trigger can wait on to how Ang knows when it's ready.

A trigger is work where the *what* and the *how* are clear, and only the *when* is blocked. `/trigger` has two jobs:

- **Add one:** `/trigger add re-run the load test once the caching story is done`. Ang checks it really is a trigger and not a parked idea, works out the conditions with you, and writes the trigger's doc in `project-context/triggers/`. Agents can propose one mid-session too. When an agent does this it will give you two lines describing the proposed trigger, and only add it if you say yes.
- **Run one:** `/trigger <slug>`, in a fresh session, like `/trigger start-here-recheck-after-install-merge`. You shouldn't need to remember the slug because the library check at the end of every workflow command reports a ready trigger with its slug, and Ang passes that on to you ready to be copy pasted into your fresh session.

When you run the trigger command, Ang checks where the work described in the trigger stands today. It will be described as one of five things: ready as written, already done, half done, drifted from the original steps, or no longer relevant. Then Ang will do whatever still meets the trigger's goal. If the work is yours rather than an agent's, Ang will instead walk you through what needs to be done one step at a time.

When whatever needed to be done is complete, Ang will delete the trigger, but only if you give the go-ahead, so Ang asks first if it's allowed. This gives you a chance to go back and forth with the agent until the work is done to your satisfaction.

Once the trigger has been executed and everything is in a place that's to your liking, the finished work and the deletion are left unstaged together, ready to be reviewed, staged and committed.

That's the library kept in shape. Next up: [Commands: setup](../../commands/setup/), for the commands that can help welcome Ang into a new repo and get it all cosy and ready to start delivering for you.
