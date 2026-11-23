---
title: Bending Ang
description: Ang is a starting point, not a finished product. How you change it to fit the way you work, and why that's the whole idea.
sidebar:
  order: 6
---
By now you've seen a lot of my opinions. Ang has views on how work moves through the funnel, what goes in the library, how agents should talk to you, how tests get written. Some of them will suit you down to the ground. Some of them, I'm sure, will make you go "has this guy been drinking clown juice?!".

The whole reason I built Ang is that I realised, in the age of agentic development, frameworks that lock you into a prison of their own opinions, like the frameworks of the past did, just won't cut it any more. The tools we write software with now should bend to fit us, not the other way round. So if there's something you'd like to change about Ang, good! That's the point where Ang stops being mine and starts being yours, and making that easy is the whole reason Ang exists at all.

## 🌱 Your copy is your Ang

The Ang you install from GitHub isn't meant to be a finished product that suits you forever. Think of it like a starter Pokémon. It's perfectly handy straight out of the Poké Ball, and you can win a fair few battles with it as it is. But what it evolves into depends entirely on how you train it, and nobody expects yours to end up exactly like mine.

So the thing to realise here is: the open-source repo isn't really Ang, it's just the starter. Your copy, bent to fit how you work, now *that's* Ang. The two have different jobs and they never need to agree. Your copy can change any of Ang's opinions, add new ones, or drop the ones you don't like, all the way down to its first principles. You don't need my permission, and I don't need to agree. You see a problem, you make a change, it's as simple as that. I'm doing exactly the same thing with mine!

That has a knock-on effect you might not expect, because it's different from how most open-source software works: if you disagree with something Ang does, the answer isn't an issue or a pull request on the Ang repo. The answer is to change it in your copy. If you do open an issue, my most likely reply is going to be "cool idea, you should go build it!", and I promise I mean that in the kindest way possible. Ang's feature set is kept small on purpose. A new feature only gets considered for the repo if there's a **very** strong argument that it'd be useful to pretty much everyone. That way the starter stays lean enough for anyone to bend in any direction.

It also means no waiting around for me to review pull requests before Ang works the way you need it to. And, to be completely honest with you, I don't have the time to be a proper open-source maintainer anyway. So trust me, this works out for both of us. 😅

Bending Ang isn't just for the minor stuff, either: you can go **big** with it. I use Claude Code as my daily driver, so that's what I built Ang to work with. Want Ang running on a different agent harness? Do it, Ang will help. Does your team have a special process or ceremony you want Ang to be aware of and manage as part of its native workflow? Do it, Ang would love to help. Once you've installed Ang, it's yours: it doesn't answer to the open-source repo, my own Ang, or anyone else's. You can even have a slightly different version of Ang in each repo you work on, each one tweaked to suit that repo perfectly. And fear not, the heavy lifting isn't all down to you. Ang comes with the tools to help you do it.

## 🔁 The bending loop

Here's how a bend happens. It's a short loop, and it's built so that changing Ang never derails the work you were actually trying to get done.

**1. You hit some friction.** A command asks you something it should already know, a step feels like ceremony for its own sake, or you find yourself giving an agent the same correction for the third time.

**2. It gets raised as a workflow improvement.** This can happen three ways:

- **You raise it yourself**, by running `/raise-workflow-improvement` with what happened and what you'd like instead, like `/raise-workflow-improvement /write-story keeps asking me which test runner we use, it should check package.json`.
- **Ang offers.** If an agent notices the workflow getting in your way, or can tell you're frustrated with how a command played out, it asks once: "Want me to raise that as a workflow improvement?" It's a soft offer, not a nag, and nothing gets raised unless you say yes.
- **At `/retro`.** Part of every retro is looking back at friction with the commands and agents during the epic. You decide which points are worth fixing, and Ang raises an improvement for each one.

Raising a workflow improvement writes a short file in `workflow-improvements/` at the root of your repo: the problem, the moment it happened, the proposed change, the files likely involved, and a rough size. If there's already an item covering the same thing, it adds to that one instead of making a duplicate.

But raising **only** records what happened and what could be done to fix it. It never touches the workflow itself. That might seem slow, but it's done that way for a reason. Friction usually shows up in a session that's busy doing something else, and its context window is already full of that something else. Fixing Ang there and then would derail the work that's already in flight, and make the agent worse at completing both the improvement **and** the thing it was already doing for you. Raising it instead means the file carries the whole improvement forward: you never have to explain it again. Best of all, you get to stay focused on the task at hand. Later, when the task you were working on is complete and you now have the time to focus on making Ang even better at working for you, Ang will be ready and waiting to help.

**3. A fresh session makes the change.** When you're ready, run this in a fresh session:

```text title="Fix a workflow improvement"
/improve-workflow
```

When you run this command you can name an improvement's item file, or let the agent propose the most valuable item, or Ang may notice it can pick up a handful of small related ones that fit in one session. Once you've agreed which to pick, Ang reads the files involved, restates the change in a few bullets and confirms it with you before editing anything. Changes to skills go through Anthropic's `skill-creator` skill, so they're drafted and sanity-checked properly, guided by the best advice available. If you haven't got it installed, the agent tells you, but installing it is your call, so it won't install it for you. If you choose not to use `skill-creator`, it carries on carefully without it. When the improvement is done, the agent deletes the item file.

**4. You review and commit.** Like everything else in Ang, the changes are left unstaged. Look them over, push back if something's off, and commit the change and the deleted item together when you're happy. Then start a fresh Claude Code session so the change gets picked up. From then on, your Ang works exactly the way you wanted it to.

The nice thing about this loop is that you get to decide what goes into your Ang, and how much effort you spend on it. Friction gets captured quickly, so the flow of your work isn't interrupted, but you also don't have to live with the pain of a framework that's just not quite right. When you're ready to invest in making Ang your perfect framework, everything you and Ang captured is handed to a fresh agent with nothing else on its mind, ready to focus on making the changes that suit you best.

End result: you stay focused on what you're building, and your Ang gets a little more yours with every lap.

## 🪛 The gentler dials

Not every change needs the full loop. A few things are built to be customised without touching Ang's files at all:

- **`/tailor-ang`** sets the personal bits: what Ang calls you, how it talks to you (pick a shipped style, or let it interview you and build one of your own), a few facts about your role, stack and whether you work solo or as part of a team, and whether you're running inside a specific development environment like Orca. It's all saved in gitignored files, so it's yours alone and never clashes with a teammate's choices, and you can re-run it whenever you fancy a change. Also, if you're just looking to try a different shipped style, you don't have to run this full command every time: `/output-style` switches between them on the spot.
- **`ang.json`** switches Ang's optional features on and off for the whole repo, like [streams](../streams-and-mail/) and the delivery intent. Flip one and it takes effect from your next Claude Code session. The full details are in [Config](../../reference/config/).

## 🆙 Will my bends survive an upgrade?

Yes. This is the worry that stops most people bending a framework in the first place, and it's exactly why upgrades in Ang are done by an agent rather than a plain merge. When you upgrade to pick up new features from the open-source repo, the agent reads both your changes and the repo's, works out how and why each one was made, and keeps both wherever they can live together. [Upgrading](../../start-here/upgrading/) has the full story.

So that's how bending Ang works at a high level. You can find out more about every command that helps you bend Ang in [Commands: bending Ang](../../commands/bending/).

And with that, we've covered the last of the big ideas. You've got the funnel, the library, the evidence bar, triggers, streams and now the tools to make Ang your own. From here on it's all detail, starting with every command and what it does. Next up: [Commands: the funnel](../../commands/funnel/).
