---
title: "Plan: releases page on the docs site"
shortDescription: Scope, approach, sequencing, risks, test strategy and candidate ADRs for adding a GitHub Releases-fed releases page to Ang's docs, redeployed on publish
tags: [documentation, distribution]
---
# Plan: releases page on the docs site

## Summary
The docs site gets a Releases page from the starlight-changelogs 0.7.2 plugin, which reads published, stable GitHub Releases at build time. `deploy-docs.yml` passes it a token. A new ~10-line workflow dispatches `deploy-docs.yml` on main whenever Zac publishes a release. The release notes template loses its h1 so each release nests under the plugin's version heading. Everything is config, one workflow and doc edits, with no code of our own. Both risky halves were spiked green in shaping. The page stays empty until v1.0.0 is published (d2).

## Scope
| # | Change | Where |
|---|---|---|
| 1 | Notes template: no `#` line; the theme becomes a bold first line `**🚀 {theme}**`, the intro follows, sections become `###` (k12) | `releases/notes/README.md` |
| 2 | The launch-notes trigger's drafting step follows the template's heading shape, since v1.0.0 is the first release the page shows | `project-context/triggers/v1-launch-notes.md` |
| 3 | Add `starlight-changelogs` 0.7.2 (exact pin), the `overrides` entry for `@ascorbic/loader-utils`, and a regenerated lockfile | `docs/package.json`, `docs/package-lock.json` |
| 4 | A `changelogs` collection: GitHub provider, `base: 'releases'`, `title: 'Releases'`, `pageSize: 100`, `token: process.env.GITHUB_TOKEN` | `docs/src/content.config.ts` |
| 5 | Register the plugin and add one "Releases" sidebar entry via `makeChangelogsSidebarLinks` | `docs/astro.config.mjs` |
| 6 | Pass `GITHUB_TOKEN: ${{ github.token }}` as env to the build step; permissions stay `contents: read` | `.github/workflows/deploy-docs.yml` |
| 7 | New `redeploy-docs-on-release.yml`: `release: published`, `actions: write`, one step running `gh workflow run deploy-docs.yml --ref main` (spike file, adopted as is) | `.github/workflows/` |
| 8 | Post-publish check for a stable tag: the "Redeploy docs on release" run went green and `/ang/releases/` lists the tag | `.claude/skills/cut-release/SKILL.md` step 8 |
| 9 | 10k: revise ADR 0008 (see Candidate ADRs), list the new workflow, and add the release-publish build and the Releases API read to the context view | ADR 0008, `10k/technical/project-structure.md`, `10k/technical/architecture/1-context.md` |

## Out of scope
- **Showing RCs (release candidates).** The plugin always drops pre-releases (d2).
- **Prose above the list, or a custom empty state.** No slot exists, and the empty page only lasts until v1.0.0. ADR 0007 says a state that only exists before v1.0.0 gets no permanent code.
- **Rewriting the rc.1 and rc.2 notes** to the new shape. They're never shown.
- **Pointing `quick-start.md` and `upgrading.md` at the new page.** Their tag instructions need RC tags too, which only GitHub's releases page lists.
- **The releases pages in `llms.txt`.** starlight-llms-txt reads the docs collection, not the plugin's routes. That is fine: the agent-readable docs are about using Ang, not its history.
- **A link checker, tests, or an upstream fix** to loader-utils' peer range.

## Approach and sequencing
1. **Template and trigger (1, 2).** These come first, so the shape is in place before anyone drafts v1.0.0's notes. Doc edits only.
2. **Plugin on the site (3–6).** Lift the spike's three files into `docs/`, run `npm i` so the lockfile records the override, and add the env line to the deploy workflow. Lands with the next push to `docs/**`.
3. **Redeploy workflow (7).** Copy the spike file. It needs Prettier's `format:check` to pass.
4. **Release process and 10k (8, 9).** Add the cut-release check, revise ADR 0008, and update project-structure and the 10k context view.

The scope rows are changes, not stories. The whole epic is **one story**, done in the order above.

## Risks
| Risk | Likelihood | What happens / mitigation |
|---|---|---|
| A future `npm i` or bump drops the override, nests Astro 5 again, and config load crashes | Low | The build fails loudly before deploy, and the live site stays as it was. The override is recorded in ADR 0008, and it goes inert once loader-utils widens its peer range. |
| GitHub API down or rate-limited at build time | Low | A production build fails if the fetch fails, so the deploy is skipped and the old site stays up. The token gives 1,000 requests an hour. Rerun the deploy. |
| The first real run of the redeploy is v1.0.0's launch | Medium | Spiked green on a throwaway repo with the same environment rule. The cut-release check (8) catches a miss, and the fix is a manual `gh workflow run deploy-docs.yml --ref main`. |
| Main's docs build is broken when Zac publishes | Low | The page is stale until main is fixed, and the cut-release check shows it. |
| A notes heading emoji with a variation selector breaks its anchor | Low | The docs voice guide already bars them, and the template's emoji are clean. |
| Hand edits to a GitHub release body drift from `releases/notes/<tag>.md` | Low | The page shows the GitHub body. The launch-notes trigger already writes both. |
| The plugin is abandoned | Low | It's pinned and works as is. Removing it means undoing items 3–5 and 7. |

## Test strategy
Everything here is config, workflow and docs, which the engineering defaults say not to unit test. So there are no new tests. The checks, from cheapest to most real:
- **Local build:** `GITHUB_TOKEN=$(gh auth token) npm run build` in `docs/`. Expect a green build, an empty `/releases/` with a title and version finder, the known "collection changelogs is empty" warning, and the existing link crawl of `docs/dist/` still clean.
- **Formatting:** `npm run format:check` passes on the new workflow.
- **CI:** the first `deploy-docs` run on main after step 2 builds with CI's token and deploys.
- **End to end:** at v1.0.0's publish, the cut-release check (8) confirms the redeploy ran and the page lists v1.0.0 with one h1 and `###` sections under its version heading.

## Success measures
- After v1.0.0 is published, `https://zacbraddy.github.io/ang/releases/` lists it within the redeploy run, with no manual step.
- The page has one h1, and each release's sections nest under its version heading.
- No RCs or drafts appear, and no docs build has failed because of them.
- No Ang-owned code was added: one dependency, one override, one workflow file.

## Candidate ADRs
- **Revise ADR 0008 (docs on Starlight and GitHub Pages)**, rather than adding a new ADR:
  - add-ons become `astro-mermaid`, `starlight-llms-txt` and `starlight-changelogs`, with the npm override and why it exists;
  - the sidebar autogenerates content folders plus one manual Releases entry;
  - the site also redeploys from main when a release is published, and the build needs a read token;
  - the releases page shows stable releases only.
- **ADR 0007 (how releases are cut)** needs no change. It points to the template, which carries the new heading shape.

## Related
- [Epic hub](./README.md)
- [C4 context](c4/1-context.md), [container](c4/2-container.md), [component](c4/3-component.md), [code](c4/4-code.md)
- [starlight-changelogs spike](origins/docs-releases-page/shaping-content/starlight-changelogs-spike.md)
- [Release redeploy spike](origins/docs-releases-page/shaping-content/release-redeploy-spike.md)
- [ADR 0007: how releases are cut](/project-context/10k/technical/adrs/0007-how-releases-are-cut.md)
- [ADR 0008: docs on Starlight and GitHub Pages](/project-context/10k/technical/adrs/0008-docs-starlight-on-github-pages.md)
- [Delivery intent](/project-context/10k/intent.md)
