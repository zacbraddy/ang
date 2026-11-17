---
title: Home
shortDescription: "Bake-off page: Ang pitch, what you get, install snippet"
tags: [documentation]
nav_order: 1
---
# Ang

**Avoid Navel Gazing.** The last software bender you'll ever need.

Ang is a lean, AI-assisted development workflow for Claude Code. You drive; it helps. It takes work from a rough thought to shipped code, one small session at a time, without drowning your agents in their own paperwork.

[Get started](./commands.md) · [Why Ang exists](./first-principles.md)

## Why another framework?

Every agentic framework I tried ended the same way: each session added another "we definitely need to consider this" until the agents were stuck forever over-speccing and never shipping. Ang exists to avoid that navel gazing at all costs.

## What you get

| Part | What it is |
|---|---|
| **A workflow** | raw → ideas → shaping → planning → execution → retro, one command per stage |
| **A context library** | `project-context/`, where the `10k` view is always current truth and in-flight work keeps its own notes |
| **Streams** | Run several sessions in parallel, one branch each, with mail between them |
| **Your opinions** | Tools to bend Ang to how you work, not the other way round |

## Install

```sh
# copy Ang's src/ into your repo, then:
claude
/bootstrap-repo
```

> **Note:** Ang runs inside Claude Code. It works fine on its own and gets a bit nicer inside Orca.
