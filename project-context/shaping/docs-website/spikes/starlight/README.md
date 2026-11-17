---
title: Starlight bake-off spike
shortDescription: The shared bake-off pages on Starlight 0.42.8 and Astro 7.4.5, with an unused Pages deploy workflow to measure upkeep
tags: [documentation, tech-stack]
---
# Starlight spike

## Summary
Throwaway. The shared pages on Starlight 0.42.8 and Astro 7.4.5. It builds first time, and system light/dark, a theme switcher, sidebar, search and on-this-page nav all come built in. Zac's favourite so far, but the colours are ugly and would need real tinkering. Full findings: [bake-off](../../shaping-content/bake-off.md).

## Run it
```sh
cd site
docker run --rm --user $(id -u):$(id -g) -e HOME=/tmp -v "$PWD":/srv -w /srv node:22 sh -c 'npm ci && npm run build'
rm -rf node_modules   # library validate would walk into it
python3 -m http.server 4300 -d dist
```
Screenshots (`screenshots/`, from the `spikes/` folder; `_tools` needs `npm ci` first, then delete its `node_modules`):
```sh
docker run --rm --network host --user $(id -u):$(id -g) -e HOME=/tmp -v "$PWD":/w -w /w/starlight mcr.microsoft.com/playwright:v1.55.0-noble node ../_tools/shoot.mjs http://localhost:4300 screenshots / /first-principles/ /commands/
```

## What differs from the shared pages
- Starlight renders the frontmatter `title` as the page heading, so each page's body `# H1` moved into `title`.
- Links stay as `page.md` so the context library can check them. An 8-line remark plugin in `astro.config.mjs` turns them into `/page/` routes. Since Astro 7, remark plugins need `@astrojs/markdown-remark` installed, because Astro's new default Markdown engine (Sätteri) doesn't run them.

## Deploy
[`deploy.yml`](deploy.yml) is the GitHub Actions workflow the real site would need on Pages: 31 lines, `withastro/action@v6` and `actions/deploy-pages@v5`. It isn't active here; it's only there to measure the upkeep.

## Related
- [Bake-off](../../shaping-content/bake-off.md)
