---
title: First principles
shortDescription: "Bake-off page: long prose on Ang's first principles, trimmed from the brain dump"
tags: [documentation]
nav_order: 2
---
# Ang's first principles

These are the reasons I built Ang, written down so I stay honest about what it should and shouldn't become. They're in priority order, but every one of them matters.

## 1. Ang works out. It's lean and must always remain so.

LLMs are a genuine force multiplier, but they haven't repealed trade-offs. The trap I watched framework after framework fall into is trying to manage too much: remember everything, guard against everything, and hug the agent to death until there's no usefulness left in it.

Models in 2026 are good. The more directives you pile on, the more you cap them at the ceiling of your own knowledge in that moment.

### Lean context

Guarding the context window is at the core of getting good results. Most frameworks split work into small sessions; Ang goes further and treats **curating** the context library as a first-class job.

- `10k/` holds the high-level truth every session should know.
- Each item in flight keeps its own sub-library, so other work doesn't leak into your session.
- Outdated facts get **replaced**, not journaled. Git is the history.

> Ang doesn't write "on 03-04 we switched from Prettier to ESLint". It changes "we use Prettier" to "we use Prettier and ESLint" and moves on.

When an epic finishes, `/retro` distils what matters into `10k` and then deletes the epic's folder outright. Not archived, deleted. It's still in git if you truly need it.

### Lean tooling and guard rails

The whole feature set is: the workflow, guidance on context, tools to make Ang your own, and streams. That's it, and I don't plan to grow it.

If "make no mistakes" wasn't effective, then "no seriously bro, don't make any mistakes of any kind" isn't going to be either. So we keep it simple.

### Lean reasoning

An agent suggesting a clever new direction doesn't make it the right one. Ang's research agents gather evidence from real sources and label it with **evidence tiers**, so whoever reads the research later knows how much weight each claim can carry.

| Tier | Source |
|---|---|
| ET 1 | A primary source: official docs, data, spike results, your own statements |
| ET 2 | A credible secondary source reporting on someone else's work |
| ET 3 | Anecdote, marketing or anything undated |

## 2. You are the boss of Ang

Ang works for you, never the other way round. It's AI-**assisted** development, not a vibe-coded software factory. You make the calls; agents do the legwork and tell you what they found.

## 3. Ang is helpful

Ang isn't a passive note-taker. It spots friction, suggests better approaches once, and offers to raise workflow improvements when the process itself gets in your way.

## 4. Get your own bastard framework, Ang is mine!

Ang is opinionated about how *I* work. It ships the tools to rewrite those opinions as yours. Fork it, tailor it, make it weird.
