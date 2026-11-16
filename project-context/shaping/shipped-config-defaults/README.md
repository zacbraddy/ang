---
title: Shipped config and defaults
shortDescription: Separate this repo's ang.json from the shipped default and lock safe defaults (streams off)
tags: [distribution, repo-structure]
---
# Shipped config and defaults

## Summary
`.claude/ang.json` is a symlink into `src/`, so this repo's config is also the shipped default. Move it, or have bootstrap create it, and decide what new users get: streams must stay off, and `intent: true` without `10k/intent.md` fails `validate` on a fresh install. Fast-tracked: only the how is open.

## Why it matters
A fresh install has to pass `validate` and must not inherit Zac's config.

## What's here
- [Brief](shaping-content/brief.md): the problem and constraints

## Related
- [Project structure](/project-context/10k/technical/project-structure.md)
- [Install, uninstall, update](/project-context/ideas/install-uninstall-update/README.md)
- [Generic personal rule and output style](/project-context/shaping/generic-personal-defaults/README.md)
