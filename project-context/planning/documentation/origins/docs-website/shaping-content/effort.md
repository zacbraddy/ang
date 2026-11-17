---
title: Starlight and VitePress effort bake-off
shortDescription: The same 4 changes made to both frontrunners, measured, plus upkeep research and Zac's call for Starlight
tags: [documentation, tech-stack]
---
# Starlight and VitePress effort bake-off

## Summary
Looks didn't separate the two frontrunners ([bake-off](./bake-off.md)), so on 2026-11-17 both spikes got the same 4 changes, and desk research covered upkeep ([upkeep](./upkeep.md)). **VitePress was cheaper to change:** every task worked first time, in about half the wall-clock time. **Starlight took 7 tries to VitePress's 4.** Its friction came from the Markdown pipeline: the spike's `.md` link plugin ignored the base path, Astro's content cache served stale links, and components force a page into `.mdx`. **Upkeep points the other way:** Starlight breaks often in small, documented steps and is maintained actively, while VitePress 1.x is frozen on an unsupported Vite 5, with an unscheduled v2 migration ahead. **Zac chose Starlight** on its looks and its active maintenance. It deploys to GitHub Pages through an Actions workflow, with no separate host.

## Method
- **Starting point:** the visual bake-off spikes, [`spikes/starlight/`](../spikes/starlight/README.md) (Starlight 0.42.8, Astro 7.4.5) and [`spikes/vitepress/`](../spikes/vitepress/README.md) (VitePress 1.6.4), at commit 54235a9.
- **Tasks, same for both:**
  1. **Recolour** to palette 4 from [colour palette research](./colour-palette.md): Radix slate greys with a jade accent, light and dark. Zac picked it for the test because it changes the accent hue and tints every grey, so it exercises the whole theme.
  2. **Native callouts and definition lists:** turn the blockquote note and tip into each framework's callout syntax, and add a definition-list plugin.
  3. **Custom component:** a small "stage card" (stage name, command, slot text) used inline on the First principles page.
  4. **Base path `/ang/`**, checked by serving each build under `/ang/` and requesting every root-relative link and asset.
  5. **Upkeep:** desk research, in [upkeep](./upkeep.md).
- **Measured:** files and lines changed (git numstat, excluding lockfiles), tries until it worked, wall-clock time from first edit to a verified build, and anything that needed digging into the framework's source.
- Wall-clock times include Docker builds and checks. They're one person's single run, so read them as a ratio, not as a benchmark.

## Results (ET 1, spike)

| Task | Starlight | VitePress |
|---|---|---|
| 1. Recolour | 2 tries, 82s. A 39-line `theme.css` plus 1 `customCss` config line. Asides use their own `blue`/`purple` hue tokens, so they needed their own rules, and the footer override's link needed colouring | 1 try, 42s. A 41-line `palette.css` plus 1 import line. Tip callouts, inline code and the footer all follow the brand and grey tokens |
| 2. Callouts and definition lists | 1 try, 59s (including screenshot tooling setup). `:::note`/`:::tip` asides; `remark-definition-list` 2.0.1 plus its rehype handlers (2 config lines). The definition list picks up Starlight's own spacing | 1 try, 33s. `::: info`/`::: tip` containers; `markdown-it-deflist` 4.0.0 (2 config lines). The definition list renders with no gap between entries |
| 3. Custom component | 1 try, 38s. A 12-line `StageCard.astro`. The page had to become `.mdx` to import it, which meant widening the link plugin's pattern and editing the link to it | 1 try, 19s. A 15-line `StageCard.vue`, registered once in `theme/index.js`. The page stays `.md` |
| 4. Base path `/ang/` | 3 tries, 56s. `site` and `base` in config, but the spike's remark link plugin writes root links Astro doesn't prefix, so it had to read `base`. Then `index.md`, which hadn't changed, kept the old links until the `.astro` content cache was deleted. 12 of 13 links resolve; the 404 is a default `favicon.svg` the spike never shipped | 1 try, 10s. 1 config line; 12 of 12 links resolve |
| **Total** | 7 tries, ~4 min, 74 lines added and 7 removed across 8 files, plus a rename | 4 tries, ~1.7 min, 76 lines added and 4 removed across 8 files |

Code blocks keep each framework's syntax-highlighting theme (Expressive Code in Starlight, Shiki in VitePress) after the recolour. Restyling them is a separate theme setting in each and wasn't measured.

Screenshots of the result, light and dark at desktop and phone width, are in each spike's `screenshots/recolour/` folder. The callout, component and base path checks are in `screenshots/effort/`.

## Upkeep (from [upkeep](./upkeep.md))
| | Starlight + Astro | VitePress |
|---|---|---|
| Breaking churn, 24 months | 3 Astro majors and 12 Starlight minors flagged breaking, about 4–5 needing edits to a plain docs site (ET 1). 0.43 shipped 4 days ago, so the spike is already one breaking minor behind | 0 breaking stable releases, and no stable release since 2025-08-05 (ET 1) |
| Ahead | More of the same, in small steps with release notes. Pain reported by users comes from upgrading Astro before Starlight or third-party plugins support it (ET 2) | v2: 22 months in alpha, about 35 breaking items, no migration guide or date (ET 1). 1.6.4 is on Vite 5, which no longer gets patches; the suggested Vite 6 override is **unverified** |
| Health | 84 releases and 10 open issues; Astro's team works for Cloudflare since 2026-01-16 (ET 1) | 235 open issues, falling since a second maintainer joined in mid-2026, after a "Is package dead?" issue (ET 1) |

## Zac's view and decision (ET 1)
Zac clicked around both recoloured sites. His first impression of palette 4 was that it looks nice; that is an observation made before the wider design research (u9), not a palette choice. "Based on the visuals and the ongoing support and active maintenance", Starlight is the pick. VitePress's cheaper changes didn't outweigh its frozen base and unknown v2 migration.

## Hosting with Starlight
Starlight builds to static files, so it uses Pages' "GitHub Actions" source rather than Pages' built-in Jekyll build: a workflow builds the site on push and hands `dist/` to Pages. The 31-line workflow in [`spikes/starlight/deploy.yml`](../spikes/starlight/deploy.yml) uses `withastro/action` and `actions/deploy-pages`. It means no separate host and no cost, at about 1–3 forced action bumps a year ([upkeep](./upkeep.md), [hosting](./hosting.md)). It hasn't been run in this repo yet.

## Unknown unknowns
- Much of Starlight's friction here came from the `.md` link plugin, which exists only because the spike's source sits in `project-context/`. Where the real site's source lives decides whether that plugin, and its base-path and `.mdx` handling, carries over.
- Astro's content cache doesn't notice changes to Markdown plugins in config. A clean build fixes it, and CI always builds clean, so it only bites locally.
- Starlight 0.43 changed how scoped styles are applied, which can shift custom CSS specificity. The recolour stylesheet was only tested on 0.42.8.

## Related
- [Hub](../../../README.md)
- [Bake-off](./bake-off.md)
- [Upkeep](./upkeep.md)
- [Colour palette research](./colour-palette.md)
- [Hosting](./hosting.md)
