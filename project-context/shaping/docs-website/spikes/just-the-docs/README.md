---
title: Just the Docs bake-off spike
shortDescription: The shared bake-off pages on Just the Docs v0.12.0 via GitHub Pages' own Jekyll gem, with system dark mode added
tags: [documentation, tech-stack]
---
# Just the Docs spike

## Summary
Throwaway. Just the Docs v0.12.0 as a remote theme on the `github-pages` gem v233, which is what Pages' built-in build runs. It builds first time. System dark mode takes one extra stylesheet link and no JavaScript. Zac called it a reasonable first outing with clunky edges. Full findings: [bake-off](../../shaping-content/bake-off.md).

## Run it
```sh
cd site
docker run --rm --user $(id -u):$(id -g) -e HOME=/tmp -v "$PWD":/srv -w /srv ruby:3.3 sh -c 'bundle config set path vendor && bundle install && bundle exec jekyll build'
python3 -m http.server 4100 -d _site
```
Screenshots (`screenshots/`, from the `spikes/` folder):
```sh
docker run --rm --network host --user $(id -u):$(id -g) -e HOME=/tmp -v "$PWD":/w -w /w/just-the-docs mcr.microsoft.com/playwright:v1.55.0-noble node ../_tools/shoot.mjs http://localhost:4100 screenshots / /first-principles.html /commands.html
```

## The dark-mode trick
`site/_includes/head_custom.html` loads the theme's `just-the-docs-dark.css` a second time, with `media="(prefers-color-scheme: dark)"`, so the dark rules win whenever the OS is dark. The toggle in `header_custom.html` overrides that by setting `media` to `all` or `not all`.

## Related
- [Bake-off](../../shaping-content/bake-off.md)
