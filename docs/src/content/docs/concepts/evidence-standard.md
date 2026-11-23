---
title: Evidence standard
description: Why Ang's agents ask for sources, how they grade them, and the bar a key claim has to clear.
sidebar:
  order: 3
---
At some point an Ang agent will tell you a claim is **unverified**, or ask you where a fact came from. That's the evidence standard at work, and it's there because "a model said so" is a terrible foundation for a decision.

Here's how I think about it. Before LLMs, if I asked a junior colleague to research something, I didn't want a summary of what they already happened to know. I wanted them to go and find what the people who know an enormous amount about the topic have to say, and then connect the dots between those facts and our situation. I hold Ang's research agents to the same standard. I'm not asking for whatever they can reason up; I'm asking for facts they've found and applied to my scenario.

So that you get information you can rely on, Ang's agents go and find real sources and grade every claim by how far it can be trusted. Whoever reads it later (you, or the next agent) then knows whether it's safe to bet the house on, or whether they're holding a document full of made-up truths waiting to bring the whole project down.

## 🥇 The three tiers

Every claim gets an **ET** (evidence tier), from 1 to 3:

- **ET 1 is a primary source**: one close enough to know the answer to your question first-hand. Official docs, data, papers, first-hand statements from users, the results of a spike, and your own statements of what you intend or what constrains you.
- **ET 2 is a credible secondary source**: they "heard it from a friend" and are reporting on someone else's work.
- **ET 3 is anecdote, marketing, or anything undated.** This is what I call the "my mate Dave down the pub reckons" tier. I believe the kids these days call it "trust me, bro".

You'll notice the model's own reasoning isn't on the list. That's on purpose. Reasoning is great for connecting facts together, but it can never stand in for one. Let's not forget that a model's brain is full of Redditors' thoughts!

## 🤨 A tier belongs to the claim, not just the source

Where a fact came from sets its starting tier, but the agent then grades each *claim* on its own, by asking: "Given this claim, how likely is it the author has a reason to spin it, overstate it or say something untrue?"

A vendor's docs are a good example. They're ET 1 that a feature exists, since who'd know better what's available than the people who built it? But they're ET 3 at best that it's quick and easy to adopt, because of course they'd say it is. The same goes for consultancies, case studies, survey sponsors and founders' blog posts. Each source's entry notes the author's interest, so you can see why a claim got the tier it did.

So one source can be ET 1 for one claim and ET 3 for the next, and when a claim lands on shaky ground like that, the agent goes looking for independent backup rather than believing everything it's told.

## 📏 The bar for a key claim

A key claim needs **at least one ET 1 source, or at least two independent ET 2 sources**. If it can't clear that bar, it gets labelled **unverified**. It's not thrown away, it just wears a label so nobody mistakes it for solid ground. Sometimes a project needs a leap of faith to make progress. Knowing when you're taking one means that if the claim turns out to be wrong, you at least know where you're about to land and can hopefully tuck and roll.

Alongside the bar and the labels, Ang's agents have a couple more habits:

- **Looking for the other side.** For any claim that would drive a decision, the agent actively hunts for evidence that it's wrong, not just evidence that it's right.
- **Dating time-sensitive facts.** Prices, versions and claims of being "the latest" anything carry the date they were true.

## 🔍 Where you'll meet it

The standard shows up anywhere Ang goes looking for facts:

- **`/refine-ideas` and `/shape-ideas`** put their findings in research docs that end with a `## Sources` section. Every source gets its title or link, its date and its tier.
- **`/bootstrap-repo`**, in founding mode, treats your own statements of intent or constraint as ET 1, because you're the one who knows them first-hand. Everything else it proposes for `10k/` carries its real standing, like a bit of desk research marked "unverified pending market survey", so it doesn't sneak in looking more certain than it is.
- **Anywhere in between**, an agent will ask you for a source, or label a claim unverified rather than quietly presenting it as fact.

If those commands are new to you, you'll find what they do in [Commands: the funnel](../../commands/funnel/) and [Commands: setup](../../commands/setup/).

## 🎯 Why it's worth the fuss

Facts in your library don't just sit there. Future agents act on them: they pick architectures, write plans and make calls based on what's written down. A fact with the wrong tier gives every one of those agents false confidence, which they'll then build on without a second thought. Grading claims now is how you stop a guess from quietly becoming the foundation of your next epic (epic failure! AMIRITE?!). Plus, it's a lot cheaper than finding out the hard way. 🙃

That's your day-one ideas covered. Next up: [Triggers](../triggers/), for when you've got work you already know how to do but can't do *yet*.