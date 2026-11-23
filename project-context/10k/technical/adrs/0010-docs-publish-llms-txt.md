---
title: "ADR 0010: Docs publish llms.txt"
shortDescription: The docs site publishes llms.txt, llms-full.txt and llms-small.txt for agents through starlight-llms-txt with default settings
tags: [documentation, tech-stack]
---
# ADR 0010: Docs publish llms.txt

## Summary
The docs site publishes agent-readable copies of itself: `/ang/llms.txt` (an index), `/ang/llms-full.txt` (every page) and `/ang/llms-small.txt` (a compact version). They come from the `starlight-llms-txt` plugin with its default settings and no custom sets. Drawn from `docs/astro.config.mjs` and a local build on 2026-11-18.

## Context
Ang's users work with agents all day, and an agent asked about Ang does better reading one plain-text file than crawling HTML. The plugin is maintained by a Starlight team member, peers the Astro and Starlight versions the site uses, and costs one config line.

## Decision
- `starlight-llms-txt` runs as a Starlight plugin with default output.
- It builds its links from `site` plus `base`, so `llms.txt` lists `https://zacbraddy.github.io/ang/llms-small.txt` and `…/llms-full.txt`.
- Links inside page bodies in those files keep the relative routes the pages are written with.
- The Releases pages from `starlight-changelogs` aren't in these files, since the plugin reads only the docs collection. That suits the files' job: they cover using Ang, not its history.

## Consequences
- One more pinned plugin to bump alongside Starlight.
- If `site` or `base` changes, the llms.txt links follow with no edit.

## Standing
2026-11-18. Built: the plugin is in `docs/astro.config.mjs`, and a local build writes all three files with `/ang/` links that resolve under `npm run preview`. The first deploy confirmed the same on the live site.

## Related
| Doc | Why |
|---|---|
| [ADR 0008: Docs site](/project-context/10k/technical/adrs/0008-docs-starlight-on-github-pages.md) | The site these files come from |
| [starlight-llms-txt](https://delucis.github.io/starlight-llms-txt/) | The plugin's docs |
