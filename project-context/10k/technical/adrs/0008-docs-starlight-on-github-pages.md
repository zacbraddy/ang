---
title: "ADR 0008: Docs are a Starlight site on GitHub Pages"
shortDescription: The user docs are a Starlight site in root docs/, built and published to zacbraddy.github.io/ang/ by one Actions workflow, with relative page links so a custom domain stays a config change
tags: [tech-stack, documentation]
---
# ADR 0008: Docs are a Starlight site on GitHub Pages

## Summary
The user docs are an Astro Starlight site in the root `docs/` folder. `.github/workflows/deploy-docs.yml` builds it and publishes it to GitHub Pages at `https://zacbraddy.github.io/ang/` on every push to `main` that touches `docs/**`, and again from `main` whenever a release is published. Pages link to each other with relative routes, never `/ang/…`, so moving to a custom domain is a change to `site` and `base` alone. Drawn from `docs/astro.config.mjs` and the workflows as of 2026-11-23.

## Context
The release needs a live docs site in Zac's voice for as little building and upkeep as possible. Starlight won a bake-off against VitePress, Just the Docs and Pages' built-in Jekyll on looks, active maintenance and built-in search, sidebar and light/dark, which outweighed VitePress's cheaper upkeep. Pages is free and needs no new vendor. A custom domain is parked in [parked work](/project-context/ideas/parked.md).

## Decision
- Starlight with exact version pins in `docs/package.json`, upgraded only when the build breaks or a security fix lands. Add-ons are limited to the `astro-mermaid` Astro integration and the `starlight-llms-txt` and `starlight-changelogs` Starlight plugins. An `overrides` entry points `@ascorbic/loader-utils` (a `starlight-changelogs` dependency) at the site's own `astro`: without it npm nests Astro 5 under it and config load crashes.
- `site: 'https://zacbraddy.github.io'` and `base: '/ang'` in `docs/astro.config.mjs`.
- The sidebar autogenerates one group per content folder, so adding a page needs no config edit, then ends with one Releases entry.
- `/releases/` is built by `starlight-changelogs` from the repo's GitHub Releases, newest first on one page. The build reads the API with the workflow's read-only `GITHUB_TOKEN`, so the page shows published stable releases only: no drafts, no `-rc.` pre-releases.
- `deploy-docs.yml`: `withastro/action` builds, `actions/deploy-pages` publishes. A failed build, a failed GitHub API read included, blocks the deploy. `redeploy-docs-on-release.yml` runs when a release is published and dispatches `deploy-docs.yml` on `main`, never on the tag ref. The repo's Pages source is set to GitHub Actions.
- Page links are relative routes (`../../concepts/funnel/`).

## Consequences
- The build is the only automated gate; there's no link checker.
- Expect 1–3 forced Starlight or action bumps a year.
- The site changes only when `docs/**` lands on `main`, a release is published, or on a manual run; only `main` may deploy to the `github-pages` environment.
- Pages are reviewed on `npm run dev` in `docs/`, which hot-reloads Zac's edits; screenshots come from Orca's built-in browser. Links are checked by crawling the built `docs/dist/`.

## Standing
2026-11-23. Built: `docs/` with all 21 pages and the releases page, `deploy-docs.yml` and `redeploy-docs-on-release.yml`. The repo's Pages source is GitHub Actions, and the site is live at `https://zacbraddy.github.io/ang/`.

## Related
| Doc | Why |
|---|---|
| [ADR 0002: Zero-dependency library script](/project-context/10k/technical/adrs/0002-zero-dependency-library-script.md) | Why `docs/` may have its own dependencies |
| [ADR 0010: Docs publish llms.txt](/project-context/10k/technical/adrs/0010-docs-publish-llms-txt.md) | The agent-readable output |
| [Delivery intent](/project-context/10k/intent.md) | The low-upkeep stance |
