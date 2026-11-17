---
title: Native Pages themes bake-off spike
shortDescription: The shared bake-off pages under 4 of GitHub Pages' bundled themes (primer, minima, cayman, slate) on its own Jekyll gem
tags: [documentation, tech-stack]
---
# Native Pages themes spike

## Summary
Throwaway. The shared pages built with the `github-pages` gem v233, which is what Pages' built-in build runs, under 4 bundled themes. Swapping themes is a one-line config change. All 4 build first time from 7 lines of config. None of them has dark mode or search, and only minima has navigation. Zac liked cayman's look best and minima's nav bar. Full findings: [bake-off](../../shaping-content/bake-off.md).

## Run it
From `site/`, building all 4 themes into `_site-<theme>/`:
```sh
docker run --rm --user $(id -u):$(id -g) -e HOME=/tmp -e PAGES_REPO_NWO=zacbraddy/ang -v "$PWD":/srv -w /srv ruby:3.3 sh -c 'bundle config set path vendor && bundle install && for t in jekyll-theme-primer minima jekyll-theme-cayman jekyll-theme-slate; do echo "theme: $t" > /tmp/t.yml; bundle exec jekyll build --config _config.yml,/tmp/t.yml -d _site-$t; done'
python3 -m http.server 4202 -d _site-jekyll-theme-cayman
```
`PAGES_REPO_NWO` (the repo's owner/name) is only needed locally. The themes ask for the repo's name, and Pages supplies it when it builds.

Screenshots go in `screenshots/<theme>/`. Take them with `../_tools/shoot.mjs` as in the [Just the Docs spike](../just-the-docs/README.md). Only the light set is kept, because the dark set came out byte-for-byte the same.

## Related
- [Bake-off](../../shaping-content/bake-off.md)
