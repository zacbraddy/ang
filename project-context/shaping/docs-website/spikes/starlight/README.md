---
title: Starlight bake-off spike
shortDescription: The shared bake-off pages on Starlight 0.42.8 and Astro 7.4.5, with an unused Pages deploy workflow to measure upkeep
tags: [documentation, tech-stack]
---
# Starlight spike

## Summary
Throwaway. The shared pages on Starlight 0.42.8 and Astro 7.4.5. It builds first time, and system light/dark, a theme switcher, sidebar, search and on-this-page nav all come built in. Zac's favourite so far, but the colours are ugly and would need real tinkering. Full findings: [bake-off](../../shaping-content/bake-off.md). The effort bake-off then recoloured it to palette 4 and added native callouts, definition lists, a custom component and the `/ang/` base path. Zac chose Starlight: [effort](../../shaping-content/effort.md).

## Run it
```sh
cd site
docker run --rm --user $(id -u):$(id -g) -e HOME=/tmp -v "$PWD":/srv -w /srv node:22 sh -c 'npm ci && npm run build'
rm -rf node_modules   # library validate would walk into it
python3 -m http.server 4300 -d dist
```

The effort bake-off set the base path to `/ang/`, so serve the build under that path: copy the build into an `ang/` folder inside an empty directory, serve that directory, and open `http://localhost:<port>/ang/`.
Screenshots (`screenshots/`, from the `spikes/` folder; `_tools` needs `npm ci` first, then delete its `node_modules`):
```sh
docker run --rm --network host --user $(id -u):$(id -g) -e HOME=/tmp -v "$PWD":/w -w /w/starlight mcr.microsoft.com/playwright:v1.55.0-noble node ../_tools/shoot.mjs http://localhost:4300 screenshots / /first-principles/ /commands/
```

## What differs from the shared pages
- Starlight renders the frontmatter `title` as the page heading, so each page's body `# H1` moved into `title`.
- Links stay as `page.md` so the context library can check them. An 8-line remark plugin in `astro.config.mjs` turns them into `/page/` routes. Since Astro 7, remark plugins need `@astrojs/markdown-remark` installed, because Astro's new default Markdown engine (Sätteri) doesn't run them.

## Effort bake-off changes
- `src/styles/theme.css` (via `customCss`) maps Radix slate and jade onto Starlight's grey and accent tokens, plus rules for the note and tip asides, which use their own hue tokens.
- `remark-definition-list` with its rehype handlers in `astro.config.mjs`; the note and tip use `:::note` and `:::tip`.
- `src/components/StageCard.astro`, imported by `first-principles.mdx`. It had to become `.mdx` to import a component, so the link plugin also matches `.mdx`.
- `site` and `base: '/ang'`, and the link plugin prefixes `base`, which Astro doesn't add to links a plugin writes. After changing a Markdown plugin, delete `.astro/` before building, or unchanged pages keep their old output.
- Screenshots: `screenshots/effort/` and `screenshots/recolour/`.

## Deploy
[`deploy.yml`](deploy.yml) is the GitHub Actions workflow the real site would need on Pages: 31 lines, `withastro/action@v6` and `actions/deploy-pages@v5`. It isn't active here; it's only there to measure the upkeep.

## Related
- [Bake-off](../../shaping-content/bake-off.md)
