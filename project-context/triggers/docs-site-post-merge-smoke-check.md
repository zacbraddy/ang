---
title: Smoke-check the live docs site after the epic merges
shortDescription: Once the documentation epic is merged to main, walk Zac through the live smoke check of zacbraddy.github.io/ang/ with every page in place
tags: [documentation, open-source]
---
# Smoke-check the live docs site after the epic merges

## Summary
An agent walks Zac through a smoke check of `https://zacbraddy.github.io/ang/`, the first time the full site is live. The site is deployed by the merge of `stream/documentation` into `main`. Zac clicks through, the agent checks what it can, and anything broken becomes recorded work.

## Why now, not sooner or later
- **Not sooner:** story 02 proved the deploy with an empty skeleton through a temporary branch trigger. That trigger was then removed, so stories 03–09 were only checked on a local `npm run preview`. The real site only rebuilds when `docs/**` lands on `main`.
- **Not later:** the README links to the site from day one. Until this check runs, nobody has seen the live content and its deploy working together.

## What to do
1. Confirm the Deploy docs run for the merge commit is green: `gh run list --workflow deploy-docs.yml --branch main --limit 3`.
2. Walk Zac through each check and wait for his report on each:
   - The home page in light and dark, plus the theme switch.
   - One page from every sidebar group, and the sidebar order within each group.
   - Search for a command name, e.g. `write-story`: the result opens the right anchor under `/ang/`.
   - A page with a Mermaid diagram renders it.
   - `/ang/llms.txt`, `/ang/llms-small.txt` and `/ang/llms-full.txt` load, and every page in the [page map](/project-context/retro/documentation/information-architecture.md) appears in `llms-full.txt`.
   - The README's site link lands on the home page.
3. Check every internal link in the agent's own pass: `curl -s` each route in the page map under `https://zacbraddy.github.io/ang/` and expect `200`.
4. Record any failure as a story or a workflow improvement, not as an in-session fix.

## Signs it's already handled
- The documentation retro (`project-context/retro/`) records a live smoke check after the merge.
- Zac says he has already walked the live site since the merge.

## Related
- [Story 02: Site skeleton live on GitHub Pages](/project-context/retro/documentation/stories/02-site-skeleton-live.md)
- [Plan: Test strategy](/project-context/retro/documentation/plan.md)
