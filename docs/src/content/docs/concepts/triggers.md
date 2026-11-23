---
title: Triggers
description: Work you already know how to do but can't do yet. How Ang holds onto it, tells you when its moment comes, and runs it.
sidebar:
  order: 4
---
You know exactly what needs doing. You know how to do it, and you know why it matters. The only problem is that something else has to happen first: a story has to land, a branch has to merge, the calendar has to tick over to March. So what do you do with it in the meantime?

Usually you'd stick it on a to-do list, or worse, try to remember it. Then three weeks later the thing it was waiting on quietly happens, nobody notices, and the job sits there forgotten until it bites you. A trigger fixes that. You say what to do and what has to be true first, and Ang tells you the moment it is.

## 🧭 Trigger, parked or moonshot?

The [funnel page](../funnel/#-moonshots-and-parked-work) already introduced you to the three ways work can wait. But in case you need a recap, here's how to tell them apart when you're the one deciding where something goes:


|                   | A trigger                                 | A parked entry                                                                   | A moonshot                                              |
| ----------------- | ----------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------- |
| What you know     | What to do *and* how to do it             | What you could build                                                             | That it'd be amazing                                    |
| What it waits on  | Something that has to happen first        | Evidence that it's worth doing                                                   | A way to actually pull it off                           |
| How long it lives | Days or weeks, then it's done             | As long as it takes, possibly forever                                            | As long as it takes, probably forever                   |
| When it wakes     | You've got work to do, so let's get to it | It's probably been a while, so this needs fresh thinking given what you know now | You've discovered a way to achieve your software dreams |


If you're unsure if something is a trigger or parked work, the simplest test is this: can you say what the job is and why it's worth doing? If you can, and the only thing missing is the right moment, it's a trigger. If you know what needs to be done and you could probably do it right now, if you only had a good reason to do it: that's parked work.

## 🧩 What can make a trigger ready

Ang's agents are always there to help you write a good trigger when you've got work you need reminding of when the time is right. So you don't have to worry about accidentally picking conditions that don't fit, or wording a trigger so it confuses an agent, leaving your important work doomed to be forgotten. You'll never have to write a condition yourself, but to give you an idea of what triggers can do, let's take a moment to look at the options an agent has when it's helping you build one.

A trigger has one or more conditions, and **every one** of them has to hold before it's ready. A condition can be:

- **a story reaching a status**, like "story 4 of the docs epic is done"
- **an item reaching a stage**, like "the pricing epic has made it to retro" (or gone past it)
- **a file existing**, like "there's a `CHANGELOG.md` in the repo"
- **a date or time passing**, like "after the 1st of March"
- **work on another stream's branch**, like "story 3 is done over in the `bake-off` stream". Obviously Ang will only pick this one if you're running [streams](../streams-and-mail/).

The list above makes up the suite of conditions available to Ang that we call predefined conditions, but one final condition it can use covers all the cases that predefined conditions can't. We call this final condition **a judgement call**. A judgement call is written as a plain question for an agent to answer, like "Has the vendor shipped their v2 API?". The best judgement call conditions also say how to settle it, like the command to run or the file to look at.

When an agent helps you make a trigger, it reaches first for the predefined conditions which Ang can check deterministically. These conditions are simply true or they're not, like a date passing or a story reaching a certain status. While the predefined conditions cover the most common things a trigger might need to wait for, edge cases do happen. When they do you don't want to find Ang's triggers have become useless!

When the predefined conditions won't cut it, the agent falls back on a judgement call, which is simply a question handed to whichever agent checks the trigger later. That agent is fed the condition as a prompt and works out the answer for you.

Here's a real one from the Ang repo itself. While I was preparing Ang for its open-source release, I was writing the documentation's Start here pages, and they needed to explain how to install Ang. But the install work itself was still being done on another branch. I had a good high-level idea of how it was going to work, but the implementation was in flight, so the exact details could still change. If they did, the docs still needed to tell the truth about what was actually built. So rather than trying to remember to go back and double-check them, I made a trigger with the condition: once the install epic has finished its retro on main, tell Ang to re-read every install, upgrade and uninstall fact on those pages and compare them against the files that actually shipped, then apply fixes wherever the implementation had drifted from what the docs said.

When Ang made this trigger for me, its one condition was a judgement call ("has that retro landed on main?"), with the `git log` command that settles it written right there in the condition. That way, any agent checking it could be sure when the time was right. Now I could be sure the docs I'm shipping are accurate for the people reading them (you're welcome 😉), without the burden of remembering the work needed to be done, because let's face it, I was **definitely** going to forget!

## 🚦 Waiting, judge, ready

Whenever an Ang agent checks a trigger's conditions it will find the trigger in one of three states:

- **Waiting**: at least one condition Ang can check isn't true yet.
- **Judge** (shown as `🤔 needs judgement`): everything Ang can check with predefined trigger conditions is true, and all that's left are the custom judgement calls the agent needs to answer.
- **Ready** (shown as `⏰ ready`): every condition, predefined or otherwise, holds. Time to do the thing.

Ang works out which state a trigger is in every time it checks, and it checks a lot, so you don't have to worry that the moment to act on a trigger might pass you by. **Every** workflow command finishes by checking the state of play across your project, and that check reports any trigger that's ready, or that needs judgement. When one needs judgement, the agent you're working with answers the questions the condition asks: it runs the command, reads the file mentioned, or does whatever else the condition needs. Ang only tells you the trigger is ready when every predefined and judgement-based condition says so. If even one condition is still a no, Ang says nothing and leaves you to focus on whatever you were already working on.

The upshot of all this is that you never have to carry work you know you'll need to do later around in your head. Ang won't remind (nag) you after every message you send, but you **will** hear about it when the work is ready to be done. You don't have to do anything special. Just keep working with Ang like you normally would, and when the time is right, Ang will have your back.

## ✋ Adding one

All the details we've just covered are useful to know, but you don't have to remember every little thing about how triggers work inside. That's Ang's job. All you need to know is how to make a trigger, and how to action it when Ang tells you it's ready.

There are two ways a trigger gets made:

- **You ask for one.** Run `/trigger add` followed by what you want to defer, in plain words, like `/trigger add re-run the load test once the caching story is done`. The agent works with you to figure out the conditions and the work to be done, based on what you've said, and writes the trigger.
- **An agent spots one.** Mid-session, an agent might notice work that clearly needs doing but can't happen yet. Ang thinks it might be important to you that this work gets remembered but knows that you aren't going to want to just drop everything immediately. You're, obviously, already focused on what you're working on right now. When this happens, Ang proposes a trigger in two lines: it tells you what the trigger would do and when it would fire. Ang will sometimes get a bit excited and propose a trigger that you don't think is all that useful, or maybe you just want the agent to get the work done now. You don't have to agree with Ang's suggestion, and it only adds the trigger if you say yes. Ang keeps an eye out for possible triggers during any workflow command, from `/ideate` to `/read-mail`.

Whenever a trigger is created, it gets a short doc of its own in `project-context/triggers/`. It's written for an agent arriving cold, weeks later, after the repo has moved on. It says why the work had to wait, what to do, what might go wrong if it's left too long, and, because sometimes you just get lucky, how to tell if it's already been done.

Why create a doc with so much detail? Because by the time the trigger fires, the project could have shifted in any number of directions, and the steps written down weeks ago might not fit any more. What still holds is what we wanted to achieve and why. Understanding that is what lets the future agent adapt the work while still hitting the goal we were originally aiming for.

## 🏃 Running a ready trigger

When a trigger's ready and an Ang agent notices, it'll let you know and suggest you run it in a fresh session:

```text title="Run a ready trigger"
/trigger <slug>
```

The slug is the trigger's name, which is also the name of its doc in `project-context/triggers/`. You won't have to go digging for it, though: when Ang reports the trigger is ready, it gives you the slug. You'll be told to start up a new session and run something like `/trigger start-here-recheck-after-install-merge`.

Why is Ang so hung up on doing the trigger's work in a fresh session? It's so the changes it leaves you aren't mashed into the changes from the work you were doing in this session. When the trigger's work is done, you're left with just the trigger's work and nothing else, making your review a breeze.

Before it gets to work in your trigger session, Ang re-checks any judgement calls itself, just to be sure. Then it works out where the job actually stands today, because a lot can happen while a trigger has been waiting. Based on what it sees, it acts in whatever way still achieves the trigger's original mission:

- **Ready as written**: not much has changed and the work is still relevant, so it just does the job.
- **Already done**: we got lucky and the work got done while we were waiting. Ang still double-checks with you, and if you agree things are in a good place, it skips to the tidy-up.
- **Half done**: it finishes what's left.
- **Drifted**: the goal still stands but the steps the trigger was going to take no longer fit. When this happens Ang takes stock and adapts what needs doing, so you still get the value the trigger was made for, then gets the work done. Making a new plan can be fiddly, but Ang can always go back to the trigger's doc to make sure it's keeping "past you" happy.
- **No longer relevant**: something has happened that means the trigger's work doesn't provide any value any more. Say you had a trigger to update a form's submit button once you finish the design system changes you're working on, but while you were waiting you decided you didn't need that form at all. Ang can see what's happened and knows: no form, no button to update. Ang still double-checks with you, but if you agree the trigger isn't relevant any more, it skips to the tidy-up.

Triggers aren't only for work you'd have Ang do for you. Perhaps you want a nudge to do something yourself, like trying out a new piece of CRM software the moment it's released to beta. If the work in a trigger is the agent's, of course it does it for you. But if it's yours, it walks you through it one step at a time, and if it can, it also checks the result to make sure things are in the state you expected. So when your shiny new toy hits beta, it'll guide you through signing up step by step, and remind you to untick the checkbox so you don't flood your inbox with marketing emails!

Once the work is done, the trigger gets deleted, along with its doc, but only after you've said Ang is allowed. Just like everything else, the files that get deleted are git's to remember, not Ang's. There's no point leaving the files hanging around because a trigger whose job is done has nothing left to tell anyone, and keeping them around would only be more for future agents to be tempted to waste their limited context window on. By now I'm sure it won't shock you to hear that, once Ang has finished helping you complete the trigger's work, it leaves all the changes unstaged for you to review: the finished work plus the trigger's deletion, all ready to be committed together.

## 🩹 When a trigger points at nothing

Sometimes a condition ends up pointing at something that's gone: the item was archived, a story got renumbered, a stream ended. A trigger like that can never fire, so the library check that Ang runs at the end of every workflow command reports it as an error, which means the problem gets picked up as part of your regular workflow with Ang. When Ang notices the problem, the agent re-points the condition at the right thing, or asks you whether to remove the trigger. Sometimes it might not be able to work out what the new condition should be, and if that happens it asks you how you'd like it handled.

If you're curious about the commands agents use to manage all this, they're in the [ang-context-manager reference](../../reference/ang-context-manager/), and `/trigger` itself has its entry in [Commands: library upkeep](../../commands/library-upkeep/).

You now know what to do with work that can't be done yet, but what if you want to do several things at once? Next up: [Streams & mail](../streams-and-mail/).