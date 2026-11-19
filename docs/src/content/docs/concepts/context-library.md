---
title: The context library
description: Where everything Ang knows about your project lives, and why it's kept lean on purpose.
sidebar:
  order: 2
---
Everything Ang knows about your project lives in one folder: `project-context/`. Technical, product, business, the lot. Agents read it before they work and write to it when they've learned something, so it's the thing that lets a fresh session pick up where the last one left off.

That might set off an alarm bell:

> A folder that every session writes to? Give it six months and it'll be the size of a small moon.

For some frameworks that's exactly where things end up, and that worry is what shaped how I built Ang. A library is only as good as an agent's ability to find the minimum context it needs, without burning a pile of tokens finding it. So most of this page is about how the library stays small and useful.

## 📂 What's in the folder

Here's the trimmed-down tour:

```text title="project-context/"
project-context/
├── raw/          anything you drop in for /ideate
├── ideas/        one folder per idea, plus moonshots.md and parked.md
├── shaping/      one folder per shaping effort
├── planning/     one folder per epic being planned
├── execution/    one folder per epic being built
├── retro/        epics being retro'd
├── triggers/     one doc per deferred action
├── 10k/          current truth
├── README.md     the conventions agents follow
├── tags.json     the tag registry
└── triggers.json the trigger registry
```

Most of those folders are the [funnel's](../funnel/) stages, and items move between them as they progress. The odd one out is `10k/`.

## 🔭 The 10k view: what's true right now

`10k/` is named after the 10,000-foot view: the big picture every agent should have before it starts work. It holds what's currently true about your project: the decisions that have been made and still hold up, and the shape of what's actually built right now. It isn't a diary of every decision you've ever made. Inside, it's split into `technical/` (architecture, ADRs, which are architecture decision records, and where things live in the codebase) and one folder per business department, like `product/`, `marketing/` and `legal/`.

Only a few things ever write to it:

- **`/retro`**, at the end of an epic. While items are working their way through the funnel, decisions get made, reversed and made again. Facts are in a constant battle royale, none of them backing down. Only *after* delivery has proved them are they stable enough for every future agent to rely on, so this is where most of `10k/` comes from.
- **`/curate-10k`**, for when you suspect `10k/` has drifted from reality. It checks every claim against your code (or flags it for you to confirm), then proposes fixes for you to agree. Ang isn't perfect, and neither are you, so when things appear not quite right you can reach for this command to get you back on track.
- **`/bootstrap-repo`**, once, before your first epic, to seed the facts that are already true: your goals and constraints, or an existing codebase's architecture.

If you've switched on the delivery intent feature, `10k/intent.md` is the one exception. It's yours, and it changes whenever you think it needs revising. When I built Ang, I told it that this file is a room with windows: it can look in all it likes, but the floor is lava. Now Ang knows it can't just go in and change things unless you ask. More on that in [Config](../../reference/config/).

Everything outside `10k/` is in flight, and Ang's agents give it the trust that deserves. A finding in `ideas/` is a working answer that might change by next week; a fact in `10k/` is something agents can build on. Keeping the two apart means an agent always knows how much weight to put on what it's reading. The commands that keep `10k/` honest are on [Commands: library upkeep](../../commands/library-upkeep/).

## 🎒 Context travels with the item

Each item in the funnel is a folder, and everything Ang learns while working on the item goes in that folder: research, spike findings, decisions, plans, stories. When the item moves to the next stage, the whole folder moves with it.

Inside the folder, the newest and most relevant context sits at the top, and older detail nests further down. The shape of the folder itself keeps older, possibly outdated context just out of arm's reach and steers agents towards the newer, more reliable stuff. But it's only a little friction, not a wall: every decision and fact in the up-to-date context can still be traced back to its source if needed.

That structure follows an item for its whole life in the funnel. So when `/plan-epic` groups a few shaped items into an epic, each one's findings get tucked under the epic's `origins/` folder. An agent building that epic in execution will rarely need all that history, but on the odd occasion it does, the answer is only a few hops away. `/retro`, on the other hand, has the job of treasure hunting through the item's whole history for what's worth keeping. It's a big job, made easier because everything relevant to the work is in one place.

To put it simply: an agent working on an item only needs that item's folder, and gets to ignore every other item in flight for free. It loads only the newest, most relevant context, which leaves its context window clear for the actual work. And if it needs to understand how we got here, that's close to hand too. It's a big part of how Ang keeps its agents effective and accurate.

## 📄 Every doc opens with a summary

The folder structure isn't the only thing protecting an agent's context window. Every doc in the library has the same shape:

- **Frontmatter** with a title, a one-line description and some tags
- **A `## Summary`** of a few lines up top
- **A `## Related`** section at the bottom, linking to the docs it connects to

That's so an agent can read a doc's summary and decide whether the rest is worth its time, instead of swallowing the whole thing only to find out the document didn't contain anything useful.

## 🧠 Why Ang curates: the cure for context FOMO

Here's the problem I kept seeing in other frameworks. Working in small sessions is good practice, and most frameworks do it: each session writes its results down, and the next one reads them and takes the baton. In the beginning it works wonders. Agents are snappy, smart and effective, and you assume it'll stay that way until you happily retire. Nobody was asking what happens to all those hand-offs as they pile up.

Then one day your agents start getting dumb. They drop the ball, make wild decisions with very little explanation, and generally become less useful than if you'd just coded the thing yourself. Over time I've come to realise why. Each session leaves more files behind, so each new agent has a bigger pile to choose from, and slowly agents begin to develop a kind of **context FOMO**: with every session, they need a bigger cut of the pile before they can feel comfortable starting their one small task.

I found this same result time and again, one framework after another. Agents got *less* capable the longer you used them, and let's not mince words here, I'm pretty sure that's the opposite of what we were all going for. 😬

So when I set out to build Ang, one of the main questions I wanted to answer was: how do I make sure each agent reads only what its task needs? This is what I came up with:

- **Indexes and tags.** Every stage folder has an `index.json` listing each doc's title, description and tags, so an agent can search the library without opening every file.
- **`context-scout`.** When a task needs project context, the agent sends a scout off to find it. The scout searches the indexes, reads summaries, follows links a few hops, and comes back with a short, sourced summary. The main agent gets the info it needs, and its context stays free for the actual work. More on the scout in [Agents](../../reference/agents/).
- **Summaries first.** Even a doc the scout pointed at might not turn out to be useful, so the main agent doesn't just take the scout at its word. It reads the summary first and only reads on if the doc really helps with its task.

## 🤖 Files you'll never touch

Scattered around the library are three files that nobody edits by hand. Not you, and not the agents either:

- **`index.json`**, in each stage folder and in `10k/`, built from each doc's frontmatter
- **`state.json`**, in each item, holding its status, its open questions (unknowns), its answers (knowns) and its decisions
- **`triggers.json`**, the registry of [triggers](../triggers/)

These files are how Ang runs the processes baked into the framework. You don't need to edit them; you just get the benefits in every session. The agents don't edit them by hand either, and you might have guessed why by now: tokens. Instead, they keep the files up to date through `ang-context-manager.mjs`, a script with a full set of commands for exactly this. You don't need to learn it, since Ang's agents use it all day long (they're pretty good at it now). But if you're curious anyway, it's all in the [ang-context-manager reference](../../reference/ang-context-manager/).

## 🧹 Replace, don't append

Adding context is cheap. Maintaining it is expensive, because every future agent pays for it in tokens every time it reads what you've thrown on the pile. That's the cost the other frameworks I tried had been ignoring, and it's why they fell apart over time. When I built Ang, I had to make sure its agents wouldn't fall into the same trap, so whenever an Ang agent writes to the library, it's reminded:

- **Only capture what matters beyond this session.** If you tried solution A, it blew up in your hands, and solution B worked, the only thing that matters is that you picked B.
- **Not every decision gets written down.** Only the ones that change how we think about the problem, commit future work to an architecture, or overturn an existing path.
- **Outdated content gets replaced, not appended to.** What matters is where you are now and where you're going. Knowing every step of the journey in excruciating detail rarely helps decide the next one. On the rare occasion it would, Git has the history.

Here's what that looks like. Say you've been using Prettier on its own for a while and decide to bring in ESLint as well. A lot of frameworks would record that as a little history lesson: "we used to use Prettier directly, but on such-and-such a date we brought in ESLint". And every future agent pays to read it, forever. An Ang agent finds "we use Prettier" and overwrites it with "we use Prettier and ESLint". Done. No "once upon a time, in a land far away, we used Prettier, until one day a brave knight brought in ESLint". Just the facts.

:::note
This goes for ADRs too, which might set your teeth on edge. Yeah, yeah, I know ADRs are meant to be the font of everything we've ever learned on a project. But that history earns its keep far less when it's being fed to an agent with a limited context window. So when an ADR stops being true, Ang rewrites it or deletes it rather than marking it "superseded". If you're pining for the old version, it's still in git. It's the same reason `/retro` deletes the epic folder once its lessons are in `10k/`: what's in the files is always what's true now.
:::

Now you know where everything lives. But while work is in flight, it's not always clear which facts are **facts** and which are..."facts". Next up, [Evidence standard](../evidence-standard/) covers how Ang decides which ones deserve to be trusted.
