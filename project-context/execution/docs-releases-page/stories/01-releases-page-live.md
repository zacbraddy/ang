---
title: Releases page live on the docs site
shortDescription: The docs build serves /releases/ from GitHub Releases, publishing a release redeploys the site from main, and the notes template, launch-notes trigger, /cut-release and 10k match
tags: [documentation, distribution]
status: draft
owner: agent
dependsOn: []
---
# Releases page live on the docs site

## Summary
This is the whole epic in one story (d7). The scope is config, one workflow and doc edits, and shaping spiked both risky halves green. The story lifts the spike files into `docs/` and `.github/workflows/`. The notes template loses its h1 so each release nests under the plugin's version heading. The release process and 10k are updated to match.

## Outcome
- A token build of `docs/` serves `/releases/`, built by starlight-changelogs 0.7.2 from published stable GitHub Releases. It shows one newest-first page and one "Releases" sidebar entry. The page stays empty until v1.0.0 is published (d2).
- Publishing a release runs `redeploy-docs-on-release.yml`, which dispatches `deploy-docs.yml` on main (d3).
- The notes template and the v1-launch-notes trigger use the new heading shape: a bold `**🚀 {theme}**` line and `###` sections (k12).
- `/cut-release` step 8 checks, for stable tags, that the redeploy went green and that the page lists the tag.
- ADR 0008, project-structure and the 10k context view describe the new setup (d4).

## Rough scope
Do it in the [plan's sequencing](../plan.md#approach-and-sequencing), which covers all nine [scope rows](../plan.md#scope):
1. Template and trigger: `releases/notes/README.md`, `project-context/triggers/v1-launch-notes.md`.
2. Plugin on the site: `docs/package.json` with the exact pin and the `overrides` entry, a regenerated lockfile, `content.config.ts`, `astro.config.mjs`, and the `GITHUB_TOKEN` env on `deploy-docs.yml`'s build step.
3. Redeploy workflow: copy the [spike file](../origins/docs-releases-page/spikes/release-redeploy/workflows/redeploy-docs-on-release.yml) as is.
4. Release process and 10k: `/cut-release` step 8, ADR 0008, `10k/technical/project-structure.md`, `10k/technical/architecture/1-context.md`.

The exact keys, steps and headings are in [C4 code](../c4/4-code.md). The spike files for the site are in [spikes/starlight-changelogs/site](../origins/docs-releases-page/spikes/starlight-changelogs/site/).

Out of scope: see the [plan's Out of scope](../plan.md#out-of-scope). That covers RCs, prose above the list, rewriting rc notes, quick-start/upgrading links (d5), `llms.txt`, and new tests (d6).

## Done when
- The local build passes: `GITHUB_TOKEN=$(gh auth token) npm run build` in `docs/` is green, and `/releases/` has a title and version finder.
- `npm run format:check` passes.
- All nine scope rows are changed as [C4 code](../c4/4-code.md) describes.

The first CI deploy and the v1.0.0 end-to-end check happen after this story. The new cut-release check covers the second.

## Related
- [Plan](../plan.md), with its [test strategy](../plan.md#test-strategy) and [risks](../plan.md#risks)
- C4: [containers](../c4/2-container.md), [components](../c4/3-component.md), [code](../c4/4-code.md)
- [starlight-changelogs spike](../origins/docs-releases-page/shaping-content/starlight-changelogs-spike.md)
- [Release redeploy spike](../origins/docs-releases-page/shaping-content/release-redeploy-spike.md)
- [ADR 0008: docs on Starlight and GitHub Pages](/project-context/10k/technical/adrs/0008-docs-starlight-on-github-pages.md)
