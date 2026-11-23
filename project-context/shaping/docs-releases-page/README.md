---
title: Releases page on the docs site
shortDescription: A docs-site page listing every Ang release, newest first, built from GitHub Releases
tags: [documentation, distribution]
---
# Releases page on the docs site

## Summary
Many open-source repos have a releases page in their docs as well as GitHub's own. Ang's docs site gets one: every release, newest first, with no pagination (Ang will never have enough releases to need it). The content comes from the GitHub Releases information, with at most a header above it. Zac has decided to do it; what's left open is how to wire it up, chosen by looking at how other repos and Starlight plugins do it, and weighed against Zac's comfort with each option.

## Why it matters
It's the polish people expect on an open-source docs site, and it lets readers see Ang's history without leaving the docs.

## What's here
Nothing yet: unknowns and knowns live in `state.json`.

## Related
- [ADR 0007: how releases are cut](/project-context/10k/technical/adrs/0007-how-releases-are-cut.md)
- [ADR 0008: docs on Starlight and GitHub Pages](/project-context/10k/technical/adrs/0008-docs-starlight-on-github-pages.md)
- [Delivery intent](/project-context/10k/intent.md)
