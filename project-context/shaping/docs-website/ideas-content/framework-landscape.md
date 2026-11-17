---
title: Docs framework landscape, 2026
shortDescription: Which static docs frameworks lead in November 2026, how healthy and liked they are, and which to spike in shaping
tags: [documentation, tech-stack]
---
# Docs framework landscape, 2026

## Summary
Researched on 2026-11-17: what static docs frameworks and hosted docs tools exist in 2026, how healthy and how liked each one is, and how each publishes. This maps the field only; nothing here is a choice. Among the npm frameworks, **Starlight** (Astro) and **VitePress** have the strongest signals on health, popularity and deploy docs. **Zensical**, the successor to Material for MkDocs, has a finished look out of the box but needs Python and is in beta. The hosted tools (Mintlify, GitBook) serve sites from their own platforms. GitHub Pages' own options, including its built-in Jekyll support, haven't been looked at yet (see the hub's hosting unknown).

ET (evidence tier) follows the [Evidence standard](/project-context/README.md). Stars and releases come from the GitHub API, and downloads from the npm and PyPI APIs, all read on 2026-11-17 for the week of 10–16 Nov (ET 1).

## Landscape

| Candidate | Health | Popularity | Look and dark mode | Search | Effort | GitHub Pages |
|---|---|---|---|---|---|---|
| **Starlight** | 0.43.1 on 13 Nov 2026, releases weekly, still pre-1.0. Cloudflare acquired Astro on 16 Jan 2026 | 9.6k stars, 2.44M npm/week | Clean and distinctive. Light, dark and auto toggle built in | Pagefind (static), built in | One `astro.config`. Markdown or MDX | Official Astro guide plus `withastro/action` |
| **VitePress** | Stable 1.6.4 dates from Aug 2025. 2.0 has been in alpha all year (alpha.21, 25 Oct 2026) | 18.5k stars, 1.97M/week | Minimal and polished, but recognisably "the Vue/Vite look". Auto dark mode | MiniSearch, built in | Very low. Plain Markdown | Official guide with a `deploy-pages` workflow |
| **Docusaurus** | 3.10.2 on 10 Jul 2026. No v4 date | 66.7k stars, 2.01M/week | Functional but generic. Follows the system setting | Algolia DocSearch by default; local search is a plugin | Higher: React and MDX, more config | Official GitHub Actions docs |
| **Fumadocs** | 16.19.4 on 17 Nov 2026, releases daily, mostly one maintainer | 13.6k stars, 3.43M/week (probably inflated by templates; unverified as adoption) | Modern shadcn-style look | Default search breaks on static export | Highest: you own a Next.js app | Works via static export, with `basePath` and search changes |
| **Nextra** | 4.6.1 on 4 Dec 2025, last commit Jun 2026 | 14.0k stars, 297k/week | Clean, Vercel-like | Pagefind | Next.js App Router | Static export possible |
| **Rspress** | 2.1.3 on 12 Nov 2026, backed by ByteDance | 2.4k stars, 115k/week | Similar to VitePress | Built in | Low, React and MDX | Official guide |
| **Material for MkDocs** | In maintenance mode since Nov 2025. Its critical-fix window ended 5 Nov 2026 | 27.6k stars, 3.9M PyPI/week | Polished but the most recognisable docs look | Built in | Low, YAML, Python | Official guide |
| **Zensical** | 0.1.1 on 10 Nov 2026. Beta started 5 Nov 2026 and runs 3 months. Paid team | 6.2k stars, 523k PyPI/week | Material's look ("modern" or "classic") | Built in | Low. Reads `mkdocs.yml`. Python and Rust | Official guide |
| **Docus** (Nuxt) | v5.15.0 on 14 Oct 2026 | 3.1k stars, 20k/week | Nuxt UI look | Built in | Low if Nuxt is acceptable | Static via `nuxt generate`; guide not verified |
| **Mintlify** (hosted) | Commercial | 179k/week (CLI) | Polished, but a recognisable "AI startup docs" look (researcher's judgement, ET 3) | Hosted, with AI search | Very low | Not applicable: hosted on Mintlify |
| **GitBook** (hosted) | Commercial | n/a | GitBook's look | Hosted | Very low, WYSIWYG plus Git sync | Not applicable: hosted on GitBook |

**Hosted options and open source.** Mintlify has a free Starter plan with a custom domain, and an OSS Program that gives Pro free only to projects that no company owns or funds (ET 1 that the program exists). Its paid prices conflict across third-party posts ($150–$450 a month), so they are unverified. GitBook has a free Community plan for open-source projects, by application (ET 1). Both serve the site from their own platforms rather than producing files to host elsewhere.

**The MkDocs family is splitting.** MkDocs itself is still on 1.6.1 (Aug 2024). A reported 2.0 would drop plugins and switch to TOML config, but every source for that is an interested party (Material, Zensical, the ProperDocs fork), so it is ET 2–3 and unverified. ProperDocs continues 1.x.

## Strongest signals
What stood out in the evidence, for shaping to weigh. These are observations, not a ranking.
- **Starlight.** It is the most-downloaded docs-specific npm framework and is actively maintained. It has static search built in and the cleanest GitHub Pages story (an official action). Its default look is distinctive without being template-like, and it works in plain Markdown. Independent signals: Cloudflare moved its large docs site to it (ET 1, but Cloudflare now owns Astro), and an HN commenter praised configuring the whole site in one file (ET 1 first-hand, a single voice).
- **VitePress.** The least config, fastest writing loop and best Markdown-only experience, plus an official GitHub Pages workflow. See its release situation below.
- **Zensical.** A finished look out of the box, with a Python toolchain alongside the repo's TypeScript.

## Disconfirming evidence
- **Starlight:** still 0.x, with breaking minors tied to Astro majors: 0.38 dropped Astro 5, and 0.42 needs Astro 7.2.10+ (ET 1, release notes). Content-collection migrations and override API changes have broken custom components, and community themes lag behind core. No Starlight-specific roadmap statement since Cloudflare took over.
- **VitePress:** over a year without a stable release. The official docs now default their install command to the 2.0 alpha (ET 2, several aggregators; npm `latest` is still 1.6.4, ET 1). Choosing it now means picking either an alpha or a version due to be replaced. Its look is widely recognised as the Vue/Vite default (researcher's judgement, ET 3).
- **Zensical:** beta only since 5 Nov 2026. The plugin API, versioning and i18n are still on the roadmap (ET 1). Commercial add-ons fund it, so watch for open-core drift.
- **Docusaurus:** a claim that it is in "maintenance mode" is ET 3, contradicted by commits on 15 Nov 2026, and unverified.

## Candidate approaches for shaping
Options shaping could test, not a plan.
- Look at GitHub Pages on its own: its built-in Jekyll support and themes, or plain Markdown rendering, against the brief's requirements. A framework may be unnecessary if this meets them.
- Build Starlight and VitePress versions of the same 3 real Ang pages: a concept, a guide, and a reference page with a code block and a callout. Judge the default look in light and dark mode, and how much theming it takes to stop looking generic.
- Deploy any framework tried to a GitHub Pages project subpath (`/ang/`) with each one's official workflow. Misconfigured base paths are the usual first-deploy bug.
- A short Zensical trial, to see its out-of-the-box look against the cost of adding Python to the repo.

## Unknown unknowns
- **Agent-readable docs (`llms.txt`).** Ang's users work in Claude Code, so docs agents can read may matter. Fumadocs has it built in; Starlight, VitePress and Zensical use plugins.
- **Cloudflare owns both Astro (Jan 2026) and VoidZero, the company behind Vite (Jun 2026).** Both stay MIT-licensed, and no harm from the acquisitions has been reported. It matters little for a static site built from plain Markdown, which can move between frameworks cheaply. At most a tie-breaker.
- **Few independent comparisons.** Most "best docs tool 2026" articles come from vendors (Mintlify, docsio, Ferndesk, Featurebase).

## Sources
| Title | URL | Date | ET and interest |
|---|---|---|---|
| npm downloads API | https://api.npmjs.org/downloads | accessed 2026-11-17 | 1 |
| GitHub REST API (repos, releases) | https://api.github.com | accessed 2026-11-17 | 1 |
| pypistats and PyPI JSON | https://pypistats.org | accessed 2026-11-17 | 1 |
| Zensical 0.1.0 release | https://github.com/zensical/zensical/releases/tag/v0.1.0 | 2026-11-05 | 1 for facts; promotional on production readiness |
| Zensical roadmap | https://zensical.org/roadmap/ | accessed 2026-11-17 | 1 |
| Material: Insiders now free (maintenance mode) | https://squidfunk.github.io/mkdocs-material/blog/2025/11/11/insiders-now-free-for-everyone/ | 2025-11-11 | 1 |
| Material: MkDocs 2.0 post | https://squidfunk.github.io/mkdocs-material/blog/2026/02/18/mkdocs-2.0 | 2026-02-18 | 2; interested, competes with MkDocs 2.0 |
| ProperDocs on MkDocs 2.0 | https://github.com/orgs/ProperDocs/discussions/33 | 2026 | 2; fork maintainer, interested |
| Astro: deploy to GitHub Pages | https://docs.astro.build/en/guides/deploy/github/ | accessed 2026-11-17 | 1 |
| VitePress: deploy | https://vitepress.dev/guide/deploy | accessed 2026-11-17 | 1 |
| Docusaurus: deployment | https://docusaurus.io/docs/deployment | accessed 2026-11-17 | 1 |
| Rspress: deploy | https://rspress.rs/guide/basic/deploy | accessed 2026-11-17 | 1 |
| Fumadocs: static export | https://fumadocs.dev/docs/deploying/static | accessed 2026-11-17 | 1 |
| Starlight release notes 0.32–0.42 | https://newreleases.io/project/github/withastro/starlight | 2025–2026 | 1 |
| Cloudflare acquires Astro | https://www.cloudflare.com/press/press-releases/2026/ | 2026-01-16 | 1 for the fact; PR spin on outcomes |
| Cloudflare acquires VoidZero | https://www.businesswire.com/news/home/20260604108073/en | 2026-06-04 | 1 for the fact |
| Cloudflare: upgrading our developer docs | https://blog.cloudflare.com/open-source-all-the-way-down-upgrading-our-developer-documentation/ | undated | 1 first-hand; Cloudflare now owns Astro |
| Ask HN: best SSG for docs 2026 | https://hn.svelte.dev/item/48092561 | ~May 2026 | 1 first-hand, single comments |
| VitePress 2.0 alpha status | https://opentechhub.io/vitepress/ | 2026 | 2–3, aggregator |
| Mintlify OSS Program | https://mintlify.com/library/mintlify-oss-program-eligibility-benefits | 2026 | 1 that it exists; vendor |
| Mintlify pricing posts | https://featurebase.app/blog/mintlify-pricing | 2026 | 3; competing vendor |
| GitBook Community plan | https://gitbook.com/docs/account-management/plans/community | accessed 2026-11-17 | 1 that it exists; vendor |
| Comparison roundups | https://docsio.co/blog/vitepress-vs-starlight | 2026 | 3; docsio sells a docs tool |

## Related
- [Hub](../README.md)
- [Brief](brief.md)
