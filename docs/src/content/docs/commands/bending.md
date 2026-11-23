---
title: Bending Ang
description: The two commands that change Ang itself. Recording friction as you hit it, and fixing it later in a session of its own.
sidebar:
  order: 5
---
[Bending Ang](../../concepts/bending-ang/) covers why your copy of Ang is meant to change, and the loop that changes it. Two commands make that loop: one writes the friction down while you're busy with something else, and the other fixes it when you've got the time. This page explains the arguments each one takes, what the commands will do and what each will and won't touch.

## 🧾 At a glance


| Command                       | Run it when                                         | Who starts it                                            | You get back                                           |
| ----------------------------- | --------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------ |
| `/raise-workflow-improvement` | Ang got in your way, and you want it written down   | You, or Ang offers when it spots friction or at `/retro` | One line: the improvement item's path and title        |
| `/improve-workflow`           | You've got time to fix something you raised earlier | You only                                                 | The change made, the item deleted, everything unstaged |


## 📌 /raise-workflow-improvement

**Run it when** a command, agent or rule has just got in your way and you want it fixed later.

**Pass it** what happened and what you'd like instead, in plain words: `/raise-workflow-improvement /write-story keeps asking me which test runner we use, it should check package.json`.

You aren't left with the sole responsibility of noticing the places where the Ang workflow could afford to flex to how you like to deliver your software products. Ang is here to help you craft your own personal style as well. If an agent notices the workflow causing you grief, it asks once whether you'd like to raise an improvement to avoid similar pain in the future. Also, every `/retro` looks back at the epic's friction, decides if there's a way that Ang could work with you differently in future, and then makes some suggestions for you to pick from. No matter how Ang makes these suggestions, they are just that: suggestions. Ang isn't going to try and wrestle the steering wheel from you. Nothing is raised without your yes.

When you've decided that a workflow improvement does need to be raised, Ang runs the creation of the improvement spec via a sub-agent with a context of its own, so that your session stays lean, and once the improvement has been raised you'll be free to carry straight on with what you were doing. When raising the improvement, the sub-agent reads only the workflow files it needs to make the item concrete, then writes `workflow-improvements/<slug>.md` at the root of your repo with five things:

- **Problem:** what went wrong or felt clunky.
- **Example:** the moment it happened.
- **Proposed change:** specific enough to implement in one session.
- **Files:** the ones likely to change.
- **Size:** small, medium or large.

When the sub-agent is raising the workflow improvement, it also takes a look at the other improvements waiting to be implemented, and if an item already covers the same thing, it adds to that one instead of making a duplicate.

This is all this command does. This command doesn't edit Ang's files, and it doesn't implement the improvement itself. Once the improvement is raised, Ang sends you back one line with the item's path and title, and then leaves the file sitting there unstaged until you're ready. If everything looks good, you can stage and commit the workflow improvement file and then you're ready to continue with the important work you were doing.

### 🫠 When improvements don't...improve

When it comes to workflow improvements, it's important that you are choosy about what you raise. Part of why Ang's agents work so well is that they aren't wading through thousands of guard rails every time they make a decision. Every line you add to a skill or rule is one more thing every future agent has to weigh, in every session...forever. Pile enough of them on and you end up with agents terrified of the consequences of taking any action at all lest it break any part of its complex web of rules. Each one is so busy checking the rules that, by the time it's decided on a path forward, its context is so exhausted it can't tell an `if` statement from a lemonade stand (did that analogy not make sense? Neither will your agents!).

So a workflow improvement isn't the place for "don't ever do that again, it annoys me" after one bad moment in one session. Remember, agents are non-deterministic. If you work with them long enough, eventually you're going to see one get confused and/or do something odd. There's no avoiding this, no matter how immaculately curated your framework's skills and rules are. If an agent got something wrong once, it might offer to raise a workflow improvement. But unless it's something you've seen repeated, and it's getting to be a hindrance to Ang's ability to deliver you results, the best advice I can give you in this spot is: just tell it and move on.

Only raise an improvement when you want Ang to change how it does something *every time*: a repeatable, useful change to the workflow that genuinely belongs in your process. A good test before you say yes: would I want every agent, in every session from now on, to be carrying this around? Or to put it another way, does this change provide enough value to my workflow that I'm willing to spend some of every future agent's ability to remain accurate and effective on making sure things are done in this different way? If the answer's "eh, sure...maybe?", do an Elsa and let it go. [Ang's first principles](../../why-ang/first-principles/) have the longer version of why keeping Ang lean matters so much, and it's worth a read if you want to use Ang as your daily driver in the long term.

## 🪚 /improve-workflow

**Run it when** you're between tasks and fancy making Ang a bit more yours. Run it in a fresh session, so that the agent's whole context goes on this workflow improvement alone. You'll thank yourself for this when your new improvement is making Ang even more effective at achieving results for you in just the way you've always wanted.

**Pass it** an item's file to work on a specific one (`/improve-workflow workflow-improvements/write-story-test-runner.md`). Leave it off and Ang lists `workflow-improvements/` and proposes either the most valuable item, or a batch of small related ones that fit comfortably in one session.

Ang won't start editing until you've agreed twice: first which item, then the change itself, which it restates in up to three bullets after reading the files involved. That way you're never surprised by what it does to your copy of Ang.

Changes to skills go through Anthropic's `skill-creator` skill, so that they're drafted and sanity-checked properly. If you haven't got it installed, Ang tells you (but doesn't install it on your behalf, because that's your choice to make) and carries on carefully by hand. When Ang is making the change, it always keeps in mind that changes to the rules Ang loads into every session are kept lean, because every line there costs every session you ever run.

Once the change is made, Ang deletes the item file and tells you what changed and how to try it. Everything is left unstaged, so you can review the change and the deleted item and commit them together. Then start a fresh Claude Code session so the change gets picked up.

:::note[Worried about upgrades?]
When the open-source Ang repo gets updates or new features, you might be a bit worried about what happens when you upgrade your perfectly tailored instance of Ang. The short answer is: don't worry, your bends and folds won't be ironed out during an upgrade. The longer answer can be found in [Will my bends survive an upgrade?](../../concepts/bending-ang/#-will-my-bends-survive-an-upgrade) over on Bending Ang, and [Upgrading](../../start-here/upgrading/) has the full story.
:::

That's every command Ang has. If you're enjoying diving deep into the nuts and bolts of Ang, then next up on your reading list is [Config](../../reference/config/), for the switches that turn Ang's optional features on and off.