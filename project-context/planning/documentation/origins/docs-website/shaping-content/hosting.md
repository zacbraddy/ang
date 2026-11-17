---
title: Docs site hosting, GitHub Pages and the alternatives
shortDescription: What GitHub Pages does on its own against the brief, compared in money and effort with Pages plus a framework, a custom domain and other hosts
tags: [documentation, tech-stack]
---
# Docs site hosting

## Summary
Desk research on 2026-11-17. Pages' built-in Jekyll build is frozen on Jekyll 3.10, and none of its 14 bundled themes has dark mode, search or a docs sidebar. The best docs theme it can load, Just the Docs, adds a sidebar and search but has no dark mode that follows the system setting out of the box. The bake-off spike found it takes one extra stylesheet link, with no JavaScript and no flicker ([bake-off](./bake-off.md)). Starlight and VitePress meet the brief out of the box and still deploy to Pages for $0. The cost is a GitHub Actions workflow of about 37 lines, plus upkeep: GitHub forces a change to the workflow about once a year, and the frameworks have breaking releases. A custom domain on Pages adds only the registration fee, about $10–12 a year. Moving to another host adds an account, a build integration and that host's terms changes for no gain the brief asks for. These are observations; Zac makes the hosting call. A visual bake-off ([bake-off](./bake-off.md)) is informing it.

ET (evidence tier) follows the [Evidence standard](/project-context/README.md). Claims from vendors and theme authors are ET 1 that a feature exists, and ET 3 at best that it's easy or looks good.

## Zac's stance (ET 1, 2026-11-17)
- He leans towards Pages as the simplest and cheapest option.
- Money isn't the blocker: We Right Code openly sponsors the build, and a domain or hosting is a petty-cash expense. But We Right Code's pockets aren't deep, so anything beyond Pages has to show a gap that justifies the extra burden.
- If a bake-off happens, it runs in separate sessions so Zac can judge each candidate's look himself.

## Pages' built-in Jekyll (no workflow of your own)
- **Frozen engine (ET 1):** Jekyll 3.10.0 and Ruby 3.3.4 through the `github-pages` gem, v233 (released 2026-11-03). v233 was a security-only release. The request for Jekyll 4 support (pages-gem #651) has been open since 2019. GitHub's docs now call Actions "the recommended approach", and in github/docs #36740 GitHub staff agreed Jekyll "is no longer being updated". They declined to deprecate it because GitHub.com and GitHub Enterprise Server still rely on it.
- **Bundled themes (ET 1, every `pages-themes` repo grepped):** all 14 date from releases in July 2021. None has `prefers-color-scheme` (the browser's light or dark setting), search or a docs sidebar. In practice they're unmaintained.
- **Plain Markdown with no config (ET 1):** the primer theme turns README.md into the index page and fixes up `.md` links. The result is a single light-only column, like a GitHub README, with no navigation or search.
- **Any theme hosted on GitHub** can be loaded with `remote_theme`, as long as it only needs whitelisted plugins (ET 1).
- **Just the Docs** (v0.12.0, 2026-01-23, 9.2k stars, actively maintained, ET 1):
  - **On the built-in build:** its dependencies are all whitelisted, and the bake-off spike built it first time with the `github-pages` gem v233 pinned to `@v0.12.0` (ET 1).
  - **Sidebar and search:** both built in. Search uses lunr, with no plugin.
  - **Dark mode:** the colour scheme is fixed at build time to light, dark or a custom scheme. Following the system setting has been an open request since 2019 (#234). A toggle needs your own button calling `jtd.setTheme()`, and community workarounds report flicker (#1223, comment from 2026-02). The bake-off spike sidestepped both by loading the dark stylesheet again with `media="(prefers-color-scheme: dark)"`: the system setting is followed with no JavaScript, and a 15-line toggle that runs before the page draws doesn't flash (ET 1, [bake-off](./bake-off.md)).
  - **Upgrades:** v0.11 → v0.12 needed migration steps for a footer regression.
- **jekyll-vitepress-theme** copies the VitePress look onto Jekyll, but it needs Jekyll 4.3+, so it needs Actions anyway. It's young: created March 2026, 73 stars (ET 1).

## Pages limits and terms (ET 1, GitHub docs, fetched 2026-11-17)
- **Size and bandwidth:** the published site can be up to 1 GB. Bandwidth has a soft limit of 100 GB a month.
- **Builds:** the built-in build has a soft limit of 10 builds an hour; custom workflows don't have that limit. A deployment times out after 10 minutes.
- **Actions minutes:** free on public repos.
- **Usage policy:** Pages can't be used as free hosting "to run your online business" or for sites aimed at commercial transactions or software as a service. A free, MIT-licensed docs site with a brief We Right Code credit doesn't obviously fall under that, but this is a reading, not GitHub's ruling (**unverified**).
- **Address:** the project site would be `zacbraddy.github.io/ang/`, and neither a user site nor an Ang site exists yet. Frameworks need `base: '/ang/'` for that path, and moving to a custom domain later means changing the config and maybe links.
- **Custom domain on Pages:** supports `www`, other subdomains (such as `docs.`) and the bare domain, with free HTTPS from Let's Encrypt. A TXT record proves ownership and must stay in place. If Pages is turned off while DNS still points at it, the domain can be taken over.

## Pages plus a framework, built with Actions
- **Setup:** Starlight's official workflow is about 37 lines (`withastro/action@v6`, `deploy-pages@v5`, Node 24). VitePress's is similar. Both need `base` set and the Pages source set to "GitHub Actions" (ET 1 that these exist; how quick they are is unverified until tried).
- **Brief fit (ET 1, features exist):** Starlight has Auto, Dark and Light modes, Pagefind search and a sidebar. VitePress follows the user's colour scheme and has a toggle, a sidebar and an optional local search.
- **Upkeep evidence (ET 1):**
  - **Workflow churn:** GitHub has forced a workflow change about once a year. Artifact actions v3 were removed in January 2025, and real sites broke (Hugo forum, ET 2). Node 20 was removed from runners around 2026-09-23. VitePress's own published workflow already lags the current action versions.
  - **Starlight:** still 0.x. Each of its six minor releases in 2026 carried breaking changes. Astro shipped majors 6 and 7 in 2026, and Starlight 0.41 dropped Astro 6.
  - **VitePress:** stable 1.6.4 dates from August 2025, and 2.0 is still in alpha, so a migration is ahead (how heavy is **unverified**).
  - **Unpinned bumps:** a build with a locked dependency file keeps working until a GitHub deprecation forces a change. Dependabot can open the update PRs, but someone still has to merge them.
- **Whether GitHub absorbs these forced changes for the built-in build** is a reasonable guess, but GitHub doesn't say so (**unverified**).

## Custom domain on another host
- **Cloudflare (ET 1):** static-asset requests on Workers are free and unlimited. Cloudflare now points new projects at Workers instead of Pages.
- **Netlify (ET 1):** the free plan has a hard cap of 300 credits a month (15 per deploy, 20 per GB). Past the cap, every site on the account is paused.
- **Vercel:** the free Hobby plan is for non-commercial personal use only (ET 2, quoted from its fair-use page). Whether a sponsoring company counts as commercial is undefined (**unverified**). Pro costs $20 per user per month (ET 1).
- **Extra burden over Pages:** a second account, a repo integration or API token, DNS, and that host's terms changes. Netlify's switch to credits and Cloudflare's move from Pages to Workers both happened recently.
- **Domain cost (ET 2–3, third-party price lists):** about $10.5 a year for .com and about $12 for .dev at Cloudflare Registrar. Zac costs this himself.

## Comparison
| Option | Money a year | Setup | Ongoing upkeep | Dark mode (system default plus toggle) | Search and sidebar | Main risks |
|---|---|---|---|---|---|---|
| Pages, built-in Jekyll, Just the Docs | $0 | Low: `_config.yml` and nav front matter, no workflow | Low: pin the theme tag | Not built in. One extra stylesheet link follows the system setting; the toggle needs about 15 lines of JavaScript (spike) | Yes | Jekyll 3.10 frozen and "no longer being updated" |
| Pages plus Starlight or VitePress via Actions | $0 | Medium: workflow, `base` path, Node project | Medium: roughly yearly forced action bumps, framework breaking releases | Yes | Yes | Workflow breaks on GitHub deprecations; Starlight 0.x; VitePress 2 migration |
| Custom domain on Pages (either build) | About $10–12 | Plus DNS, TXT record, HTTPS | Renew the domain, keep DNS | As the build | As the build | Domain takeover if Pages is turned off; `base` change if switched later |
| Domain plus another host | About $10–12, host free | Medium: account, integration, DNS, framework | Host terms changes plus framework upkeep | As the framework | As the framework | Netlify pauses at the cap; Vercel non-commercial; a second vendor |

## Unknown unknowns
- **Address:** `github.io/ang` and a custom domain need different `base` config, so choosing later means rework.
- **Commercial terms:** whether We Right Code's sponsorship and credit count as commercial under any host's terms (Pages' "online business", Vercel's "commercial").
- **Lock-in:** each tool keeps nav order somewhere different. Just the Docs uses front matter, Starlight uses frontmatter plus its config, and VitePress uses its config. Switching later means touching every page.
- **Looks:** no evidence either way on how template-like any option looks. All of them have recognisable defaults, so this needs Zac's eyes in a bake-off.
- **Netlify and Vercel open-source programmes** might lift their free-tier limits or terms. Not researched.

## Sources
| Title | URL | Date | ET and interest |
|---|---|---|---|
| Pages dependency versions | https://pages.github.com/versions/ | says 2025-08-13 (lags the gem) | 1; GitHub |
| pages-gem v233 and `dependencies.rb` | https://github.com/github/pages-gem/releases/tag/v233 | 2026-11-03 | 1; GitHub |
| pages-gem #651, Jekyll 4 | https://github.com/github/pages-gem/issues/651 | 2019, open | 1–2 |
| github/docs #36740 | https://github.com/github/docs/issues/36740 | 2025-03 to 2025-08 | 1; GitHub staff |
| About GitHub Pages and Jekyll | https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/about-github-pages-and-jekyll | fetched 2026-11-17 | 1 |
| GitHub Pages limits | https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits | undated, fetched 2026-11-17 | 1 |
| Custom domains and GitHub Pages | https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages | fetched 2026-11-17 | 1 |
| GitHub Actions billing | https://docs.github.com/en/billing/concepts/product-billing/github-actions | fetched 2026-11-17 | 1 |
| pages-themes repos | https://github.com/pages-themes | last commits 2021–2025 | 1 |
| Just the Docs repo and MIGRATION.md | https://github.com/just-the-docs/just-the-docs | v0.12.0, 2026-01-23 | 1 for features; 3 for its own ease claims |
| Just the Docs #234, system dark mode | https://github.com/just-the-docs/just-the-docs/issues/234 | 2019, open | 1–2 |
| Just the Docs #1223, theme toggle | https://github.com/just-the-docs/just-the-docs/issues/1223 | comments to 2026-02 | 2; users |
| jekyll-vitepress-theme | https://github.com/crmne/jekyll-vitepress-theme | v1.13.0, 2026-11-13 | 1 for dependencies; 3 for looks |
| Astro: deploy to GitHub Pages | https://docs.astro.build/en/guides/deploy/github/ | fetched 2026-11-17 | 1 that it exists; 3 for ease |
| Starlight site search | https://starlight.astro.build/guides/site-search/ | fetched 2026-11-17 | 1 that it exists |
| Starlight CHANGELOG | https://github.com/withastro/starlight/blob/main/packages/starlight/CHANGELOG.md | to 2026-11-13 | 1 |
| VitePress: deploy | https://vitepress.dev/guide/deploy | fetched 2026-11-17 | 1 that it exists; 3 for ease |
| Pages actions require artifacts v4 | https://github.blog/changelog/2024-12-05-deprecation-notice-github-pages-actions-to-require-artifacts-actions-v4-on-github-com/ | 2024-12-05 | 1 |
| Node 20 removed from Actions | https://github.blog/changelog/2026-09-23-node-20-is-no-longer-available-in-github-actions | 2026-09-23 | 1 (dates vary slightly between posts) |
| Hugo forum: artifact v3 build failure | https://discourse.gohugo.io/t/build-failed-because-it-uses-a-deprecated-version-of-actions-upload-artifact-v3/53335 | 2025 | 2; independent user |
| githubstatus, Pages incident | https://www.githubstatus.com/incidents/q27ttsnp0x4g | 2026-05-26 | 1 |
| Cloudflare Pages overview and limits | https://developers.cloudflare.com/pages/platform/limits/ | fetched 2026-11-17 | 1 |
| Workers static assets billing | https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/ | fetched 2026-11-17 | 1 |
| Netlify: how credits work | https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/ | updated 2026-10-30 | 1 |
| Vercel Hobby plan | https://vercel.com/docs/plans/hobby | updated 2026-11-12 | 1 for limits; 2 for the non-commercial quote |
| Domain price lists (CostGoat and others) | https://costgoat.com/compare/domains/dev | 2026 | 2–3; possible affiliate interest |

## Related
- [Hub](../../../README.md)
- [Brief](../ideas-content/brief.md)
- [Framework landscape](../ideas-content/framework-landscape.md)
- [Business constraints](/project-context/10k/business-constraints.md)
