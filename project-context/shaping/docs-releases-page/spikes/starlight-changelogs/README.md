---
title: "Spike: starlight-changelogs on Ang's docs site"
shortDescription: The three files that differ from docs/ when starlight-changelogs 0.7.2 is added, and how to rerun the spike
tags: [documentation, distribution, tech-stack]
---
# Spike: starlight-changelogs on Ang's docs site

## Summary
The plugin builds on Ang's Starlight 0.43.1 and Astro 7.4.12 once an npm `overrides` entry stops a stray Astro 5 install. Findings are in [the spike write-up](../../shaping-content/starlight-changelogs-spike.md). `site/` holds only the three files that differ from `docs/`: `package.json`, `astro.config.mjs` and `content.config.ts` (it goes in `src/`).

## Rerun
1. Copy `docs/` (without `node_modules`, `dist`, `.astro`) to a scratch folder and drop these three files over it.
2. `npm i`
3. `GITHUB_TOKEN=$(gh auth token) npx astro build`, then look in `dist/releases/`.

To see how pre-releases would render, edit `node_modules/starlight-changelogs/providers/github.ts` and drop `|| release.prerelease` from the early return.

## Related
- [Spike write-up](../../shaping-content/starlight-changelogs-spike.md)
- [Item hub](../../README.md)
