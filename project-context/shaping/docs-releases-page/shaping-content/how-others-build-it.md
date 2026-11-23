---
title: How other docs sites build a releases page
shortDescription: Survey of Starlight changelog plugins, real open-source releases pages and GitHub's release-publish trigger, as of 2026-11-23
tags: [documentation, distribution, tech-stack]
---
# How other docs sites build a releases page

## Summary
One off-the-shelf Starlight plugin fits: `starlight-changelogs` (by HiDeoo, a Starlight core maintainer), and every releases page found on a Starlight site uses it. It reads GitHub Releases at build time and runs on Ang's exact Starlight and Astro versions in other projects. Its catches are that it always drops pre-releases, has no slot for prose above the list, and needs a token in CI (continuous integration) to dodge rate limits. Separately, a `release: published` workflow trigger does fire when Zac publishes a draft by hand, but on Ang's workflow it would build from the tag and hit the `github-pages` environment's main-only rule. Surveyed 2026-11-23; ET means evidence tier (ET 1 is a primary source, see Sources).

## Off-the-shelf options

### starlight-changelogs 0.7.2 (published 2026-11-16)
- **Fits Ang's versions.** Peer dependency `@astrojs/starlight >=0.38.0` (ET 1). The author's own docs site still runs Astro 6, but independent sites run it on Starlight 0.43.1 and Astro 7.4.x: biomejs/website (0.7.2), catppuccin/whiskers and mozilla/enterprise-admin-reference (0.7.1) (ET 1, their package.json). No Astro 7 issue open; one issue open in total.
- **Activity:** 7 releases in 2026, roughly monthly, mostly by HiDeoo.
- **GitHub source:** `provider: 'github'` calls REST (GitHub's web API) `/repos/{owner}/{repo}/releases`, follows pagination to fetch all, token optional (ET 1, source).
- **Drafts and pre-releases are always dropped.** `providers/github.ts` returns early on `release.draft || release.prerelease`, before the `process` hook, and no option turns it off (ET 1, source). Not stated in its docs. Live pages bear it out: homebox and InvokeAI both omit their pre-releases (ET 1).
- **Order:** newest first (API order).
- **Pagination:** `pageSize`, default 10; a large value gives one page. catppuccin/whiskers sets `pageSize: 100` (ET 1).
- **Pages generated:** a list page, one page per version, compare pages, optional sidebar links. The list page has the configured `title` and a version-picker toolbar, then each release body under its own heading. No slot found for prose above the list (ET 1, `Versions.astro`).
- **Other options:** `pagefind` (search indexing on/off), `enabled`, `process` (rename or drop a version), per-locale `title`. No option found to turn off per-version or compare pages.
- **Failure:** a production build fails if the fetch fails; local dev falls back to cached data (ET 1, plugin changelog 0.6.0).
- **Quirk:** a release body starting with its own `# heading` renders a second h1 (seen on InvokeAI's page, ET 1). Ang's notes in `releases/notes/` would need checking for this.

### astro-loader-github-releases 3.0.1 (published 2026-07-04)
- A content loader only: it supplies data and Ang would write the page, sort and filtering itself (ET 1).
- Uses GitHub's GraphQL API, which always needs a token; README asks for a classic token with `repo` scope (ET 1).
- Exposes `isDraft` and `isPrerelease`, so pre-releases could be shown and marked. Sort order undefined.
- Peer `astro >=4.14.0 <8.0.0`, depends on octokit. 20 stars, quiet since July.

### Not found
No other Starlight changelog plugin on npm. `@ascorbic/github-loader` and `starlight-github-releases` don't exist.

## What real sites do
All six found use starlight-changelogs (ET 1, each repo's config and workflows).

| Site | Source | Above the list | Pre-releases | Freshness |
|---|---|---|---|---|
| InvokeAI | GitHub Releases, `GITHUB_TOKEN` | Title + picker | Hidden | Push/PR/manual only; stale on 2026-11-23 (missing 6.14.4 from 2026-11-03) |
| multi-scrobbler | GitHub Releases | Title + picker | Hidden | `on: release: types: [released]` + manual |
| homebox | GitHub Releases, `GITHUB_TOKEN` | Title + picker | Hidden | Cloudflare Pages; current |
| catppuccin/whiskers | CHANGELOG.md (changesets) | Title + picker | n/a | Pushes to `docs/**` |
| biomejs.dev | CHANGELOG (changesets) | Title + picker | n/a | Website repo workflows |
| Firefox admin docs | Keep a Changelog file | Title + picker | n/a | Push to main |

- **Above the list:** every site shows only the title and version picker. No prose (bears on u4).
- **Rate limits are real:** InvokeAI's and homebox's configs both note intermittent `403 rate limit exceeded` build failures without a token, as the unauthenticated limit is shared per CI runner IP (ET 1 that they hit it).
- **Staleness is real:** InvokeAI, with no release trigger, was three weeks stale on the survey date.

## Rebuilding on publish
From GitHub's "events that trigger workflows" docs (ET 1):
- `release: types: [published]` fires when a draft is published by hand, for both stable and pre-releases. `released` fires for stable only; `prereleased` doesn't fire for pre-releases published from drafts.
- Events made with `GITHUB_TOKEN` don't start workflows. Irrelevant while Zac publishes by hand.
- **Unknown unknown:** a release-triggered run has `GITHUB_REF=refs/tags/<tag>` and checks out the tagged commit. On Ang's `deploy-docs.yml` that means building docs from the tag rather than main, and the deploy job's `github-pages` environment only lets main deploy by default, so it would fail with "Tag … is not allowed to deploy to github-pages due to environment protection rules" (ET 2: community discussion #39054, ILGPU issue #979). Fixes seen: add a tag rule to the environment, or check out `ref: main`.

## Token and rate limits
GitHub REST docs (ET 1): unauthenticated 60/hour per IP; `GITHUB_TOKEN` in Actions 1,000/hour per repo; a personal token 5,000/hour. Conditional (ETag) requests that return 304 don't count, but only when authenticated. Drafts are listed only to callers with push access, so the workflow token would see them; starlight-changelogs filters them anyway. Passing the workflow's `GITHUB_TOKEN` (`contents: read`) to the plugin's `token` is enough.

## Still open after this survey
- Would HiDeoo take an option to include pre-releases? No issue asks for it yet.
- Can prose sit above the list without overriding the plugin's route? Matters only if Zac wants prose (u4 suggests not).
- Can the per-version and compare pages be turned off, and does Ang care?
- Whether a real build on Ang's site behaves as the source reads (versions, h1 quirk, token wiring) is unspiked.

## Sources
| Source | Date | ET | Interest |
|---|---|---|---|
| starlight-changelogs 0.7.2 package source and CHANGELOG (npm) | 2026-11-16 | 1 | Author's own: ET 1 for features, not for ease |
| github.com/HiDeoo/starlight-changelogs issues, PRs, docs/package.json, providers/github.mdx | checked 2026-11-23 | 1 | Author's own |
| astro-loader-github-releases 3.0.1 source and README (npm) | 2026-07-04 | 1 | Author's own |
| `@astrojs/starlight@0.43.1` peer `astro ^7.2.10` (npm) | 2026-11-13 | 1 | None |
| Config and workflow files: invoke-ai/InvokeAI, FoxxMD/multi-scrobbler, sysadminsmedia/homebox, catppuccin/whiskers, biomejs/website, mozilla/enterprise-admin-reference, github/gh-aw | checked 2026-11-23 | 1 | Independent users |
| Live pages: homebox.software/en/changelog/, invoke-ai.github.io/InvokeAI/releases/ | fetched 2026-11-23 | 1 | None |
| [GitHub Docs: events that trigger workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows) | current | 1 | None |
| [GitHub Docs: REST rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api) | current | 1 | None |
| [GitHub Docs: REST best practices](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api) | current | 1 | None |
| [GitHub Docs: list releases](https://docs.github.com/en/rest/releases/releases#list-releases) | current | 1 | None |
| [Community discussion #39054](https://github.com/orgs/community/discussions/39054), [ILGPU issue #979](https://github.com/m4rs-mt/ILGPU/issues/979) | — | 2 | Users hitting the tag/environment rule |

## Related
- [Item hub](../README.md)
- [ADR 0007: how releases are cut](/project-context/10k/technical/adrs/0007-how-releases-are-cut.md)
- [ADR 0008: docs on Starlight and GitHub Pages](/project-context/10k/technical/adrs/0008-docs-starlight-on-github-pages.md)
