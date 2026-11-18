---
title: "ADR 0005: Docs are a Starlight site on GitHub Pages"
shortDescription: The user docs are a Starlight site in root docs/, built and published to zacbraddy.github.io/ang/ by one Actions workflow, with relative page links so a custom domain stays a config change
tags: [tech-stack, documentation]
---
# ADR 0005: Docs are a Starlight site on GitHub Pages

## Summary
The user docs are an Astro Starlight site in the root `docs/` folder. `.github/workflows/deploy-docs.yml` builds it and publishes it to GitHub Pages at `https://zacbraddy.github.io/ang/` on every push to `main` that touches `docs/**`. Pages link to each other with relative routes, never `/ang/…`, so moving to a custom domain is a change to `site` and `base` alone. Drawn from `docs/astro.config.mjs` and the workflow as of 2026-11-18.

## Context
The release needs a live docs site in Zac's voice for as little building and upkeep as possible. Starlight won a bake-off against VitePress, Just the Docs and Pages' built-in Jekyll on looks, active maintenance and built-in search, sidebar and light/dark, which outweighed VitePress's cheaper upkeep. Pages is free and needs no new vendor. A custom domain is parked in [parked work](/project-context/ideas/parked.md).

## Decision
- Starlight with exact version pins in `docs/package.json`, upgraded only when the build breaks or a security fix lands. Add-ons are limited to the `astro-mermaid` Astro integration and the `starlight-llms-txt` Starlight plugin.
- `site: 'https://zacbraddy.github.io'` and `base: '/ang'` in `docs/astro.config.mjs`.
- The sidebar autogenerates one group per content folder, so adding a page needs no config edit.
- One workflow, `deploy-docs.yml`: `withastro/action` builds, `actions/deploy-pages` publishes. A failed build blocks the deploy. The repo's Pages source is set to GitHub Actions.
- Page links are relative routes (`../../concepts/funnel/`).

## Consequences
- The build is the only automated gate; there's no link checker.
- Expect 1–3 forced Starlight or action bumps a year.
- The site changes only when `docs/**` lands on `main`.

## Standing
2026-11-18. Built: `docs/` and `deploy-docs.yml`. The repo's Pages source is GitHub Actions, and the first deploy published the site at `https://zacbraddy.github.io/ang/` ([run](https://github.com/zacbraddy/ang/actions/runs/44314555360)).

## Related
| Doc | Why |
|---|---|
| [ADR 0002: Zero-dependency library script](/project-context/10k/technical/adrs/0002-zero-dependency-library-script.md) | Why `docs/` may have its own dependencies |
| [ADR 0007: Docs publish llms.txt](/project-context/10k/technical/adrs/0007-docs-publish-llms-txt.md) | The agent-readable output |
| [Delivery intent](/project-context/10k/intent.md) | The low-upkeep stance |
