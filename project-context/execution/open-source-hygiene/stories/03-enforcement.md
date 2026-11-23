---
title: Enforcement
shortDescription: Husky and lint-staged auto-fix on commit, an advisory ci.yml on every PR and push to main, README badges and the Node LTS bump trigger
tags: [open-source, tech-stack, repo-structure]
status: draft
owner: agent
dependsOn: [02]
---
# Enforcement

## Summary
Keeps the code clean from here on: the pre-commit hook fixes what it can, and CI reports on every pull request without blocking it.

## Outcome
A commit with a misformatted, lint-fixable `.mjs` file is fixed by the hook before it lands. A pull request to `main` gets a green `ci.yml` run, and the README shows four badges: CI status, licence (MIT), Node `>=26` from `engines`, and latest release.

## Rough scope
- `.husky/pre-commit` running `npx lint-staged`; `lint-staged` config in `package.json` (`eslint --fix`, `prettier --write`).
- `.github/workflows/ci.yml`: `npm ci`, lint, format check, `npm test`, Node from `.node-version`. Advisory: no branch protection or required checks.
- Four shields.io badges in `README.md`.
- Update the [Node LTS bump trigger](/project-context/triggers/node-lts-bump.md) so the yearly bump covers `.node-version`, `engines` and `ci.yml`.

## Implementation notes
The README edit builds on the documentation stream's README rewrite. Start once it is on `main`, or rebase onto it.

## Related
- [Plan: scope](../plan.md#scope), [sequencing](../plan.md#sequencing)
- [C4 code: root tooling files](../c4/4-code.md#root-tooling-files-story-1-story-3), [workflows](../c4/4-code.md#workflows)
- [Repo README (shaping)](/project-context/shaping/repo-readme/README.md)
