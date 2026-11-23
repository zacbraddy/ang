---
title: Root tooling
shortDescription: A private, dev-only root package.json with ESLint, Prettier and npm test on node:test, with release.yml and the 10k docs brought in line
tags: [open-source, tech-stack, repo-structure]
status: draft
owner: agent
dependsOn: []
---
# Root tooling

## Summary
Adds the repo's dev-only tooling at the root, outside `src/`, so `install.sh` never ships it. `npm test` becomes the single home for the test globs, and `release.yml` uses it.

## Outcome
`npm ci && npm test` passes from a clean clone on Node 26 (the current LTS, long-term support, release). `npm run lint` and `npm run format:check` run; they may still report findings until story 02.

## Rough scope
- `package.json` (`private: true`, `engines.node: ">=26"`, dev dependencies only, scripts `test`, `lint`, `format`, `format:check`, `prepare`), `package-lock.json`, `.node-version` (`26`), `node_modules/` in `.gitignore`.
- `eslint.config.mjs` and `.prettierrc.json` / `.prettierignore` with the shared ignore set.
- `release.yml`: `node-version-file: .node-version` and `npm test`; their stale comments go.
- Amend ADR 0002 (zero-dependency library script) per k10, and update `10k/technical/project-structure.md` (layout table, "why there is no package.json", commands).
- Husky's `prepare` script can land here, but the hook itself comes in story 03.

## Related
- [Plan: scope](../plan.md#scope), [approach](../plan.md#approach)
- [C4 components](../c4/3-components.md#components)
- [C4 code: root tooling files](../c4/4-code.md#root-tooling-files-story-1-story-3), [workflows](../c4/4-code.md#workflows)
- [ADR 0002](/project-context/10k/technical/adrs/0002-zero-dependency-library-script.md)
- [Project structure](/project-context/10k/technical/project-structure.md)
