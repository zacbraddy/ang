---
title: Minimum supported Node version
shortDescription: Ang is developed against the current Node LTS, and that LTS is the minimum it supports
tags: [open-source]
---
# Minimum supported Node version

## Summary
Ang is developed against the current Node LTS (long-term support release), and that LTS is the minimum supported version: Node 26 as of 2026-11-16 (Zac's call). Older versions may still work, but they aren't supported because Ang isn't developed or tested against them, and the release notes say so. This replaces the "Node 21 or later" in project-structure, which the code had already broken: it uses `import.meta.dirname`, and `eslint-plugin-n` flags that below Node 22.16.

## Evidence (2026-11-16)
- `fnm list-remote --lts` gives v26.13.1 (Lithium) as the latest LTS, with v24 (Krypton) the previous one. ET 1 (evidence tier 1: a primary source).
- All 37 `node:test` tests pass on v26.13.1 in about 0.65s with `node --test '**/*.test.mjs'`, run from `src/.claude`.
- Zac's machine now has v26.13.1 installed and set as fnm's default. It had been on v22.19.0, which fnm's stale `lts-latest` alias still pointed to.

## The decision
- **Why LTS, not the lowest version that works:** whatever Ang is developed against is the only version anyone has actually tested. Working out a true floor would mean keeping a CI matrix for versions nobody develops on.
- **Upkeep:** when a new LTS lands (each October), move the dev machine, CI and `engines` up to it together. The release notes carry the caveat that older versions may work but aren't supported.

## What changes when built
- Root `package.json`: `"engines": { "node": ">=26" }`. `eslint-plugin-n` reads it, so lint checks the code against the supported floor.
- A `.node-version` file at the root containing `26`, which fnm (and most version managers) pick up.
- CI runs on Node 26.
- [Project structure](/project-context/10k/technical/project-structure.md): replace "Node 21 or later" with the LTS policy and the new test command (k3).
- The README and release notes state the supported version and the caveat.

## Related
- [ESLint plugins](eslint-plugins.md): where the `engines` gap was found
- [Test runner](test-runner.md): the root `package.json` this lives in
- [Quality tooling](../ideas-content/quality-tooling.md)
