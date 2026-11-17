---
title: VitePress bake-off spike
shortDescription: The shared bake-off pages on VitePress 1.6.4, with an unused Pages deploy workflow to measure upkeep
tags: [documentation, tech-stack]
---
# VitePress spike

## Summary
Throwaway. The shared pages on VitePress 1.6.4, the latest stable release. It builds first time, and system light/dark, a light/dark switch, sidebar, local search and on-this-page nav all come built in. The attribution footer needed a small override, because the default theme hides its footer on pages with a sidebar. Zac rates it close behind Starlight on looks, with the same horrible colours. Full findings: [bake-off](../../shaping-content/bake-off.md). The effort bake-off then recoloured it to palette 4 and added native callouts, definition lists, a custom component and the `/ang/` base path; every change worked first time, but Zac chose Starlight: [effort](../../shaping-content/effort.md).

## Run it
```sh
cd site
docker run --rm --user $(id -u):$(id -g) -e HOME=/tmp -v "$PWD":/srv -w /srv node:22 sh -c 'npm ci && npm run build'
rm -rf node_modules .vitepress/cache   # library validate would walk into node_modules
python3 -m http.server 4301 -d .vitepress/dist
```

The effort bake-off set the base path to `/ang/`, so serve the build under that path: copy the build into an `ang/` folder inside an empty directory, serve that directory, and open `http://localhost:<port>/ang/`.
Screenshots (`screenshots/`, from the `spikes/` folder; `_tools` needs `npm ci` first, then delete its `node_modules`):
```sh
docker run --rm --network host --user $(id -u):$(id -g) -e HOME=/tmp -v "$PWD":/w -w /w/vitepress mcr.microsoft.com/playwright:v1.55.0-noble node ../_tools/shoot.mjs http://localhost:4301 screenshots / /first-principles.html /commands.html
```

## What differs from the shared pages
Nothing. The pages are copied as they are: VitePress keeps the body `# H1` as the heading, ignores frontmatter it doesn't use, and rewrites `page.md` links itself.

## Attribution
`.vitepress/theme/` extends the default theme with one stylesheet that shows the footer on sidebar pages and shifts it clear of the sidebar. The selector needs the extra `.Layout` to beat the theme's scoped CSS.

## Effort bake-off changes
- `.vitepress/theme/palette.css` maps Radix slate and jade onto VitePress's grey, background, text and brand tokens; callouts follow them.
- `markdown-it-deflist` in `.vitepress/config.mjs`; the note and tip use `::: info` and `::: tip`.
- `.vitepress/theme/StageCard.vue`, registered globally in `theme/index.js` and used straight from `first-principles.md`.
- `base: '/ang/'` in config; links and assets follow it with no other change.
- Screenshots: `screenshots/effort/` and `screenshots/recolour/`.

## Deploy
[`deploy.yml`](deploy.yml) is the GitHub Actions workflow the real site would need on Pages: 41 lines, with Node setup, `npm ci`, build, `actions/upload-pages-artifact@v5` and `actions/deploy-pages@v5`. It isn't active here; it's only there to measure the upkeep.

## Related
- [Bake-off](../../shaping-content/bake-off.md)
- [Starlight spike](../starlight/README.md)
