---
title: Shipped config and defaults, brief
shortDescription: Where ang.json lives and which defaults ship
tags: [distribution]
---
# Brief

## Summary
Separate this repo's `ang.json` from the shipped default, keep streams off and pick defaults that pass `validate` on a fresh install. From Zac's brain dump and the bootstrap leftovers (2026-11-13).

## Facts
- `.claude/ang.json` is a symlink to `src/.claude/ang.json`, so this repo's config and the shipped default are one file. Zac: move it elsewhere, or have bootstrap create it.
- `src/.claude/ang.json` currently reads `{ intent: true, streams: false, host: "orca" }`.
- Streams must not ship turned on, whatever happens to `ang.json` (Zac).
- With `intent: true` and no `10k/intent.md`, `library validate` fails on a fresh install.
- `ang-context-manager.mjs session features` lists each feature's key, bootstrap question and default.

## Related
- [Hub](../README.md)
