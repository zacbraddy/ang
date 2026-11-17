---
title: Starlight and VitePress upkeep
shortDescription: Breaking releases, migration effort, maintenance health and Pages workflow upkeep for Starlight and VitePress, Nov 2024 to Nov 2026
tags: [documentation, tech-stack]
---
# Starlight and VitePress upkeep

## Summary
Desk research on 2026-11-17 for the effort bake-off ([effort](./effort.md)). Starlight on Astro breaks often but in small steps: 3 Astro majors and 12 Starlight minors flagged breaking in 24 months, of which about 4–5 needed edits to a plain docs site. It's maintained actively (84 releases, 10 open issues; the Astro team are Cloudflare employees since 2026-01-16). VitePress 1.x hasn't broken because it hasn't shipped: its last stable is 1.6.4 (2025-08-05), it sits on the unsupported Vite 5, and v2 has been in alpha for 22 months with about 35 breaking items and no migration guide. The Pages Actions workflow needs 1–3 forced bumps a year for either. Observations, not a recommendation.

Research date 2026-11-17. ET = evidence tier (1 primary, 2 credible secondary, 3 anecdote/marketing). Counts come from GitHub release and npm registry data pulled on 2026-11-17 (ET 1).

## Comparison

| Measure (24 months to 2026-11-17) | Starlight + Astro | VitePress |
|---|---|---|
| Upstream majors | Astro 3 (5.0, 6.0, 7.0) | 0 stable (1.x throughout) |
| Releases flagged breaking | Starlight 12 of 15 minors (0.30–0.35, 0.38–0.43) | 1.x: 0. v2 alphas: 9 of 21 have BREAKING sections (~35 items) |
| Breaks needing edits to a plain docs site | ~4 to 5 (0.30 content config, 0.33 `social`, 0.38 Node 22, 0.39 sidebar `autogenerate`, opt. 0.43 CSS check). The rest are version bumps | 0 on 1.x. v1→v2 will need some (see Q3) |
| Migration guides | Astro v5 1,273 lines / ~7.5k words; v6 1,791 / ~9.1k; v7 384 / ~2.1k (most sections don't touch static docs) | No v1→v2 guide exists yet |
| Upgrade tool | `npx @astrojs/upgrade` (bumps packages, not a codemod); v7 guide also ships an AI "upgrade prompt" | None |
| Stable releases | Starlight 84, Astro 234 | 6 (1.5.0 … 1.6.4); last stable 2025-08-05 |
| Open issues now | Starlight 10; Astro (not measured, rate-limited) | 235 |
| Backing | Astro team are Cloudflare employees since 2026-01-16 | vuejs org; 1 to 2 active maintainers (brc-dd, bluwy) |
| Security on the line you'd run | Astro: security-only fixes for one previous major | 1.6.4 pins Vite ^5.4.14; Vite 5 unsupported, last patch 2025-10-20 |
| Pages actions majors (shared by both) | withastro/action v4, v5, v6 (if used) | n/a (uses setup-node directly) |

## 1. Breaking releases

**Astro majors (ET 1, release tags):** 5.0 (2024-12-03): Content Layer API for collections, Vite 6, `hybrid` mode removed. 6.0 (2026-03-10): Node 22+ required, Vite 7, Zod 4, legacy content collections removed. 7.0 (2026-06-22): Vite 8, Rust compiler, Sätteri default Markdown processor, `compressHTML: 'jsx'` default whitespace. Astro 6 was current for only 3.5 months.

**Starlight 0.x minors (ET 1, release notes, "⚠️ BREAKING CHANGE" markers):**
- 0.29 (2024-11-08): none.
- 0.30 (2024-12-13): requires Astro 5; content collections must move to `docsLoader()` (config edit for every site).
- 0.31 (2025-01-13): minimum Astro 5.1.5.
- 0.32 (2025-02-15): route data moves to `Astro.locals.starlightRoute`; plugin `setup` hook deprecated. Affects overrides and plugins only.
- 0.33 (2025-04-07): `social` config syntax changed (edit `astro.config.mjs`); drops older browsers; `<Badge>`/`<Icon>` trailing-space change.
- 0.34 (2025-04-16): minimum Astro 5.5; Shiki fallback theme removed.
- 0.35 (2025-07-16): Starlight remark/rehype plugins apply only to `docsLoader()` content.
- 0.36 (2025-09-19) and 0.37 (2025-11-28): only "potentially breaking" styling changes (tabs, overflow-wrap, `meta` head validation).
- 0.38 (2026-03-11): requires Astro 6 (so Node 22); backwards compatibility for legacy collections dropped.
- 0.39 (2026-05-07): sidebar `autogenerate` must be wrapped in `items`; subgroups' default collapsed state changes.
- 0.40 (2026-06-09): minimum Astro 6.4.5.
- 0.41 (2026-06-23): requires Astro 7; drops older Chromium and Safari.
- 0.42 (2026-09-02): minimum Astro 7.2.10; mobile menu markup changed; `tagline` option removed.
- 0.43 (2026-11-13): uses Astro's `scopedStyleStrategy` (default changes from `where` to `attribute`); custom CSS specificity may shift. Note: the spike's 0.42.8 is already one breaking minor behind.

**VitePress (ET 1, CHANGELOG):** 1.x stable had 1.5.0 (2024-11-04) and 1.6.0–1.6.4 (2025-01-20 → 2025-08-05), none flagged breaking. 2.0.0-alpha.1 to alpha.21 (2025-01-22 → 2026-10-25) carry ~35 breaking items: Vite 6→7→8, Node 22+, markdown-it-async, DocSearch v4, `useLocalNav`/`useSidebar` replaced by `useLayout`, `scrollOffset` removed, `@include` of missing files now errors, deprecated theme options removed (`outlineTitle`, `lastUpdatedText`), markdown option renames (`attrs`, `anchor`, `image.lazyLoading`, `codeCopyButtonTitle`), font renamed to "Inter Core".

## 2. Migration effort and tooling

- Astro guides are long, but mostly about SSR, adapters and integrations. For a static Starlight site, Starlight's release notes condense the relevant steps to 1 to 3 steps per break (ET 1). The claim that "most users can upgrade without code changes" (Astro v7 guide) is vendor ET 3.
- `@astrojs/upgrade` exists (0.8.1, updated 2026-10-21) and bumps `astro` and `@astrojs/*` together. It does not rewrite code (ET 1).
- **Disconfirming user evidence (ET 2, GitHub issues):** #2658 (2024-12-07, 17 comments): running `@astrojs/upgrade` moved users to Astro 5 while Starlight 0.29 still required Astro 4, which broke builds for 6 days until 0.30 shipped. #4074 and #4044 (2026-07): Astro 7 upgrades broke on outdated third-party Starlight plugins and themes (`starlight-links-validator`, `starlight-theme-nova`). Pain tends to come from ecosystem plugins lagging behind, not from core. Maintainers replied the same day.
- VitePress: no codemod, and no v1→v2 migration doc in the repo as of 2026-11-17 (ET 1, repo tree).

## 3. VitePress v2

- Status: alpha. `latest` = 1.6.4 and `next` = 2.0.0-alpha.21 on npm (ET 1, 2026-11-17). 21 alphas in 22 months. There was a gap from 2026-03-19 to 2026-07-06.
- Roadmap/ETA: none published, with no milestone or project board (ET 1, absence). Maintainer brc-dd, 2026-08-08, in #5201: land the remaining planned breaking changes, then beta; "most likely no sooner than September". There's no beta as of 2026-11-17, so that estimate has slipped. He also said: "New users can start using v2-alpha" (#4945, 2025-09-16), and vitepress.dev documents v2-alpha, not 1.6.4. ET 1 for intent, **unverified** for timing.
- Migration v1→v2: no guide yet. A plain site would need to handle Node 22+, renamed/removed config keys (outline/lastUpdated text, markdown options), custom CSS against changed classes (`vp-code`, fonts), and any custom theme using removed composables. Size is **unverified** until a guide exists.
- 1.x security: the `v1` branch's last commit is 2025-08-05. No GitHub security advisories have been published (ET 1). 1.6.4 depends on Vite ^5.4.14. Vite's policy covers only the current and two previous majors, so Vite 5 is unsupported (last 5.4.21 on 2025-10-20; Vite 8 is current) (ET 1). The maintainer says the v1 vulnerabilities have "very limited impact" (vendor ET 3) and suggests overriding Vite to v6, which is "I think … compatible" (**unverified**). A user report says Vite 5 "has multiple vulnerabilities" (ET 3, single anecdote).

## 4. Maintenance health

- **Cadence (ET 1):** Starlight shipped 84 releases in 24 months (46 in the last 12) and its newest minor is 4 days old. Astro shipped 234. VitePress shipped 6 stable releases plus 21 alphas, with the last stable 15 months ago.
- **Issue trend (ET 1, GitHub search, 6-month windows from 2024-11-17):**
  - VitePress, opened/closed: 202/147, 144/94, 79/103, 74/222. Open issues now: 235. The backlog shrank sharply after mid-2026, which matches the maintainer's "down over 100 issues" (2026-08-08).
  - Starlight, opened/closed: 72/68, 40/40, 24/29, 42/43. Open issues now: 10.
  - Astro, first three windows: 599/575, 339/335, 495/614.
- **Backing:** The Astro Technology Company joined Cloudflare on 2026-01-16. Full-time staff became Cloudflare employees who keep working on Astro full-time, and the project stays MIT (ET 1, astro.build and Cloudflare blog posts; that the project stays independent of Cloudflare's priorities is vendor ET 3). Astro gives security-only fixes to one previous major (ET 1, docs). Even so, astro 6.x has had no release since 2026-06-17 (ET 1, npm), which is consistent with there being no security fixes needed. VitePress lives under the vuejs org. A user opened "Is package dead?" (#5201, 2026-05-29), and a maintainer was away for months in 2026. bluwy joined maintenance around 2026-07 (ET 1, maintainer comment). VoidZero uses VitePress for its own docs (`@voidzero-dev/vitepress-theme`). Whether VoidZero formally funds or maintains VitePress is **unverified**.

## 5. GitHub Pages deploy upkeep (ET 1, release tags)

- `actions/setup-node`: v5 (2025-09-04, auto-caching via package-manager detection), v6 (2025-10-14, auto-cache limited to npm), v7 (2026-07-14, ESM, removes the dummy `NODE_AUTH_TOKEN`). That's 3 majors.
- `actions/upload-pages-artifact`: v4 (2025-08-14, dotfiles excluded, which matters for e.g. `.nojekyll`), v5 (2026-04-10, adds `include-hidden-files`). 2 majors.
- `actions/deploy-pages`: v5 (2026-03-25, Node 24 runtime). 1 major.
- `withastro/action` (Starlight only, optional): v4 (2025-03-20), v5 (2025-10-27, pinned SHAs, upload-pages-artifact v4), v6 (2026-03-19, dependency updates). 3 majors.
- What actually forced edits: GitHub removed Node 20 from Actions runners on 2026-09-23, after a Node 24 default from 2026-06 (ET 1, GitHub changelog). Old action majors needed bumping to Node 24 releases. In the same period, Astro 6 and VitePress v2 both moved to Node 22+, so the `node-version` in workflows had to change for either tool.

## Sources

| Title / URL | Date | ET | Author interest |
|---|---|---|---|
| Starlight GitHub releases, github.com/withastro/starlight/releases | 2024-11 → 2026-11-13 | 1 (that breaks happened) | Vendor |
| Astro release tags, github.com/withastro/astro/releases | 2024-12-03, 2026-03-10, 2026-06-22 | 1 | Vendor |
| Astro upgrade guides v5/v6/v7, github.com/withastro/docs src/content/docs/en/guides/upgrade-to/ | fetched 2026-11-17 | 1 for scope, 3 for "easy" | Vendor |
| Astro "Upgrade Astro" support policy, docs.astro.build/en/upgrade-astro/ | fetched 2026-11-17 | 1 | Vendor |
| npm registry: astro, vite, vitepress, @astrojs/upgrade | 2026-11-17 | 1 | Neutral data |
| VitePress CHANGELOG.md and releases, github.com/vuejs/vitepress | 2026-10-25 | 1 | Vendor |
| VitePress #5201 "Is package dead?" (maintainer brc-dd reply) | 2026-05-29 / 2026-08-08 | 1 intent, 3 on impact | Users vs maintainer |
| VitePress #4945 "Missing documentation for stable version" | 2025-09-14 | 2 | Independent user |
| Vite releases policy, github.com/vitejs/vite/blob/main/docs/releases.md | fetched 2026-11-17 | 1 | Vendor |
| Starlight #2658 "Breaks after Astro updates to 5.0.3" | 2024-12-07 | 2 | Independent users |
| Starlight #4044, #4074 (Astro 7 upgrade breakages) | 2026-07-05, 2026-07-15 | 2 | Independent users |
| GitHub repo/issue search counts (vitepress, starlight, astro) | 2026-11-17 | 1 | Neutral data |
| "The Astro Technology Company joins Cloudflare", astro.build/blog/joining-cloudflare/ and blog.cloudflare.com/astro-joins-cloudflare/ | 2026-01-16 | 1 fact, 3 future promises | Vendor/acquirer (read via search snippets only) |
| Releases: actions/setup-node, upload-pages-artifact, deploy-pages, withastro/action | 2025-03 → 2026-07 | 1 | Vendor |
| GitHub changelog "Node 20 is no longer available in GitHub Actions", github.blog/changelog/2026-09-24-… | 2026-09-23 | 1 | Vendor |
| VoidZero org / @voidzero-dev/vitepress-theme (socket.dev) | 2026 | 3 | Aggregator |

## Related
- [Hub](../../../README.md)
- [Effort bake-off](./effort.md)
- [Hosting](./hosting.md)
