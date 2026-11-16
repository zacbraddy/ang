---
title: Shipped config and defaults
shortDescription: Separate this repo's ang.json from the shipped default and lock safe defaults (streams off)
tags: [distribution, repo-structure]
---
# Shipped config and defaults

## Summary
`.claude/ang.json` is a symlink into `src/`, so this repo's config is also the shipped default. Move it, or have bootstrap create it, and decide what new users get: streams must stay off, and `intent: true` without `10k/intent.md` fails `validate` on a fresh install. Settled: Ang ships no `ang.json`; bootstrap writes one at the repo root, defaulting intent on and streams off, personal keys go to `ang.local.json`, and this repo gets its own real config.

## Why it matters
A fresh install has to pass `validate` and must not inherit Zac's config.

## What's here
- [Brief](shaping-content/brief.md): the problem and constraints
- [Fresh-install defaults](shaping-content/fresh-install-defaults.md): the validate check and what bootstrap writes

## Related
- [Project structure](/project-context/10k/technical/project-structure.md)
- [Install, uninstall, update](/project-context/ideas/install-uninstall-update/README.md)
- [Generic personal rule and output style](/project-context/shaping/generic-personal-defaults/README.md)
