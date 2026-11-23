---
title: Releases page on the docs site (epic)
shortDescription: Epic adding a docs-site page that lists every published Ang release, newest first, built from GitHub Releases and redeployed on publish
tags: [documentation, distribution]
---
# Releases page on the docs site (epic)

## Summary
Ang's docs site gets a releases page: every published release, newest first, on one page, with at most a header above it. The page is built by the starlight-changelogs plugin reading GitHub Releases at build time. A small workflow redeploys the docs whenever Zac publishes a release. Shaping spiked both halves green. This epic plans how they land in `docs/` and `.github/workflows/`, plus the release-notes heading change the page needs.

## What's here
- [Plan](plan.md)
- C4: [context](c4/1-context.md), [container](c4/2-container.md), [component](c4/3-component.md), [code](c4/4-code.md)
- [Origin: how other docs sites build a releases page](origins/docs-releases-page/shaping-content/how-others-build-it.md)
- [Origin: starlight-changelogs spike](origins/docs-releases-page/shaping-content/starlight-changelogs-spike.md)
- [Origin: release redeploy spike](origins/docs-releases-page/shaping-content/release-redeploy-spike.md)

Unknowns, knowns and decisions live in `state.json`.

## Related
- [ADR 0007: how releases are cut](/project-context/10k/technical/adrs/0007-how-releases-are-cut.md)
- [ADR 0008: docs on Starlight and GitHub Pages](/project-context/10k/technical/adrs/0008-docs-starlight-on-github-pages.md)
- [Delivery intent](/project-context/10k/intent.md)
