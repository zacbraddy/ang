---
title: Docs site visual bake-off
shortDescription: The same 3 pages built in each docs-site candidate for Zac to judge by eye, with setup, measurements and his verdict per candidate
tags: [documentation, tech-stack]
---
# Docs site visual bake-off

## Summary
Each candidate got the same 3 pages in its own session, light and dark, so Zac could judge the looks side by side. All four are built (2026-11-17): **Just the Docs**, **native Pages themes**, **Starlight** and **VitePress**. **Zac's pick on looks is Starlight**, with VitePress close behind. Both share the standard docs-site layout he rates as the best design in the field, and both have colours he finds horrible. They're close enough that looks no longer decide between them: effort to implement, maintain, extend and modify does. That was measured in the [effort bake-off](./effort.md), which ended with Zac choosing Starlight. Just the Docs was "a reasonable first outing" with clunky edges. The native themes looked cleaner (cayman his favourite), but only minima has nav and none has search or dark mode. The spike also disproved a research claim: Just the Docs *can* follow the system's dark-mode setting with no JavaScript and no flicker.

## Method
- **Shared pages** live in [`spikes/_content/`](../spikes/_content). Each candidate copies them and only adds its own front matter and link fixes, so the words stay the same everywhere:
  - **Home**: pitch, a "what you get" table, an install snippet and a note callout.
  - **First principles**: long prose with headings, quotes and a table, trimmed from the brain dump.
  - **Commands**: wide tables, a definition list and code blocks.
- **Attribution** goes in each framework's own footer, not in the page content.
- **Library frontmatter:** `library validate` scans spike folders too, so the pages carry `title`, `shortDescription` and `tags` (frameworks ignore what they don't use), and link to each other with `.md`. Each spike also deletes its dependency folders (`vendor/`, `node_modules/`) after building, because the validator would otherwise walk into them.
- **Judging:** Zac looks over the running site and gives his view in his own words. He turned down 1–5 scores per criterion, preferring to compare the whole field at the end.
- **Measured per candidate:** whether the build works, how long it takes, lines of config and custom code, how system light/dark is handled, and screenshots in light and dark at 1440px and 390px wide.
- **Tools:** [`spikes/_tools/shoot.mjs`](../spikes/_tools/shoot.mjs) takes the screenshots. Run it through `mcr.microsoft.com/playwright:v1.55.0-noble` in Docker, because Playwright's Chromium can't run on the host (system libraries are missing). Serve each built site with `python3 -m http.server`.

## Just the Docs on the built-in Pages build (2026-11-17)
Spike: [`spikes/just-the-docs/`](../spikes/just-the-docs/README.md).

| Measure | Result (ET 1, spike) |
|---|---|
| Build | Worked first time with `github-pages` gem v233 (Jekyll 3.10) and `remote_theme: just-the-docs/just-the-docs@v0.12.0` in `ruby:3.3` Docker. About 52s cold including the image pull; 4.5s per rebuild after that |
| Config and custom code | 32 lines: an 11-line `_config.yml`, a 3-line `Gemfile`, an 8-line `head_custom.html` and a 10-line `header_custom.html` |
| Follows the system light/dark setting | Not out of the box. A second `<link>` to the theme's own `just-the-docs-dark.css` with `media="(prefers-color-scheme: dark)"` does it with **no JavaScript and no flicker** |
| Toggle | About 15 lines of JavaScript that flip that link's `media` and save the choice in the browser's local storage. It's applied in `<head>` before the page draws, so there's no flash |
| Sidebar and search | Built in; search uses lunr |
| Phone width | Hamburger nav; wide tables and code blocks scroll sideways inside their own box |
| Rough edges seen | The toggle button looks clunky in dark mode (heavy border, default button style); the definition list renders oddly right-aligned; "This site uses Just the Docs" sits under the sidebar by default |

**Zac's verdict (ET 1):** "Seems like a reasonable first outing." Some of the design is a little clunky, and he'd clean that up during the build, but on the whole it's what he'd expect from a docs site. More to say once he has the rest of the field to compare it with.

## Native Pages bundled themes (2026-11-17)
Spike: [`spikes/pages-native/`](../spikes/pages-native/README.md). Four themes built side by side, because swapping themes is a one-line config change: primer, minima, cayman and slate.

| Measure | Result (ET 1, spike) |
|---|---|
| Build | All 4 worked first time with the `github-pages` gem v233 in `ruby:3.3` Docker. About 8s for all 4 once the gems were installed. Building locally needs `PAGES_REPO_NWO` set; Pages supplies the repo name itself |
| Config and custom code | 7 lines: a 4-line `_config.yml` and a 3-line `Gemfile`. No custom code |
| Follows the system light/dark setting | No. None of the 4 has a dark mode, and the dark screenshots came out byte-for-byte the same as the light ones. Nothing was built for it, to keep the spike's effort matched to its question |
| Toggle | None |
| Sidebar and search | No search in any of them. Only minima has navigation: a header bar linking every page. The other 3 have none, so you can only move between pages through links in the text |
| Attribution | cayman and slate put "maintained by zacbraddy" and a GitHub link in the footer automatically. primer and minima would need a layout override |
| Looks | primer: a plain GitHub README. minima: a clean blog. cayman: a big blue-green gradient banner with a "View on GitHub" button. slate: a dark header and footer around a light body |

**Zac's verdict (ET 1):** all 4 look nice and clean, more so than Just the Docs, whose design feels rougher. **cayman** is his favourite look and feel. He likes minima's nav bar, though. With no nav, the others are "VERY awkward" to move around, so a baseline nav would have to go into the build for the docs to be usable at all. Missing search "kind of sucks", but it might come back with a little work. And even if it doesn't, a first-time visitor won't know it was ever an option: the gap only shows because of the side-by-side comparison.

## Starlight (2026-11-17)
Spike: [`spikes/starlight/`](../spikes/starlight/README.md). Starlight 0.42.8 on Astro 7.4.5, both pinned to releases at least 2 weeks old.

| Measure | Result (ET 1, spike) |
|---|---|
| Build | Worked first time once `@astrojs/markdown-remark` was added (see the plugin row below). About 1.6s per build, 8s including `npm install` in `node:22` Docker; 281 packages, 215 MB of `node_modules` |
| Config and custom code | 41 lines in all: a 6-line `package.json`, a 5-line `content.config.ts` and a 24-line `astro.config.mjs`, 9 of them a remark plugin that turns `page.md` links into routes. Plus a 6-line footer override for attribution. Without the link plugin, which only exists because the spike's source sits in `project-context/`, it's 32 |
| Follows the system light/dark setting | Yes, out of the box, with no code |
| Toggle | Built in: an Auto / Light / Dark dropdown in the header |
| Sidebar and search | Built in. Search is Pagefind, which is indexed at build time and runs in the browser. There's also an "On this page" table of contents and next/previous page links |
| Phone width | Hamburger nav plus an "On this page" dropdown; wide tables wrap rather than scroll |
| Deploy on Pages | A 31-line Actions workflow (`withastro/action@v6`, `actions/deploy-pages@v5`), written but not run. It's the upkeep the Jekyll candidates don't need |
| Rough edges seen | Definition lists aren't supported, so they render as plain `term : text` lines. The note callout is a plain blockquote, because Starlight's callouts need `:::note` syntax. Each page's body H1 had to move into `title`, or it showed twice. `.md` links aren't rewritten, so a plugin is needed while the source lives in `project-context/` |
| Framework churn already visible | Astro 7 made Sätteri its default Markdown engine, so remark plugins now need `@astrojs/markdown-remark` installed separately. It's one example of the breaking releases flagged in [hosting](./hosting.md) |

**Zac's verdict (ET 1):** "The colours are fucking ugly as fuck but the design itself is the best so far." He likes having the nav and search there. The layout is the standard docs-site shape anyone who's spent time in software development will know, and he counts that as a plus. It's his favourite so far, but going with it would definitely mean time spent tinkering with the colours.

## VitePress (2026-11-17)
Spike: [`spikes/vitepress/`](../spikes/vitepress/README.md). VitePress 1.6.4, the latest stable release (Aug 2025).

| Measure | Result (ET 1, spike) |
|---|---|
| Build | Worked first time. About 3.1s per build, 11s including `npm install` in `node:22` Docker; 75 packages, 102 MB of `node_modules` (Starlight: 215 MB) |
| Config and custom code | 30 lines in all: a 6-line `package.json`, a 17-line `.vitepress/config.mjs`, and a 7-line theme override (a 4-line `theme/index.js` and a 3-line stylesheet) to show the attribution footer |
| Follows the system light/dark setting | Yes, out of the box, with no code |
| Toggle | Built in: a light/dark switch in the header. Two states only, with no "Auto" option to go back to following the system |
| Sidebar and search | Built in. Search is local (MiniSearch, indexed at build time, runs in the browser). Also an "On this page" list and next/previous page links |
| Links | `page.md` links are rewritten to routes out of the box, so no plugin is needed while the source lives in `project-context/` |
| Phone width | Menu and "On this page" bar under the header; wide tables wrap, code blocks scroll sideways inside their own box |
| Deploy on Pages | A 41-line Actions workflow (`actions/setup-node@v7`, `actions/upload-pages-artifact@v5`, `actions/deploy-pages@v5`), written but not run. VitePress has no ready-made action like Astro's, so it's 10 lines longer than Starlight's |
| Rough edges seen | The default theme hides its footer on any page with a sidebar, so the attribution needs the override above, and the first try lost to the theme's scoped CSS. Definition lists aren't supported, so they render as plain `term : text` lines. The note callout is a plain blockquote, because VitePress callouts need `::: tip` or `> [!NOTE]` syntax |
| Framework churn already visible | v2 has been in alpha since Jan 2025 (alpha.21 in Oct 2026) and stable 1.x hasn't had a release since Aug 2025, so a major upgrade is still ahead |

**Zac's verdict (ET 1):** it looks good too. The colours are horrible again, but the design is along the same lines as Starlight's and looks pretty alright.

## Zac's view of the whole field (ET 1)
If he had to pick, he'd still choose Starlight. But Starlight and VitePress are close enough on design that looks aren't a factor worth weighing between them. The choice comes down to the effort each takes to implement, maintain, extend and otherwise modify.

## Unknown unknowns
- The spike sites are served from the root with no base path. At `zacbraddy.github.io/ang/`, each candidate also needs its base path set (u7).
- If a native theme goes forward, adding a nav bar (and maybe search) to a theme like cayman hasn't been measured. It would mean overriding the theme's layout.
- The Home page's install snippet in the spikes is a placeholder. The real one is now settled: the `curl … install.sh | sh` one-liner, with Node 26+ as the prerequisite and uninstalling by hand documented on this site (k10 in `state.json`).

## Related
- [Hub](../../../README.md)
- [Effort bake-off](./effort.md)
- [Hosting](./hosting.md)
- [Framework landscape](../ideas-content/framework-landscape.md)
