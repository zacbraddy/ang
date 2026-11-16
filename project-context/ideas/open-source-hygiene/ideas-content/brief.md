---
title: Open-source hygiene, brief
shortDescription: Zac's stance on open-source standards and the deferred quality-tooling options
tags: [open-source]
---
# Brief

## Summary
Zac's stance (2026-11-13) on open-source release standards, plus the quality-tooling options deferred at bootstrap.

## Stance
- Look at open-source projects that aren't afraid of a little whimsy, which suits Zac's persona, and lift what fits. Ang is not a big corporation and shouldn't pretend to be.
- Some standard practices won't fit Ang's nature and will be modified or dropped.
- PR/issue templates and CONTRIBUTORS: only if they're absolute no-brainers, with minimal time spent, because Ang's design means contributions should never arrive in volume.
- Linting markdown has no value. Code files might benefit from it. Zac is on the fence about making code quality first-class and needs convincing.

## Quality-tooling options (deferred at bootstrap)
The repo has no lint, format, tests or CI.
- **B:** zero-dependency setup. GitHub Actions running `node --check` and `node --test`.
- **C:** full kit. Root `package.json` with ESLint, Prettier, Vitest, Husky, lint-staged and CI. This contradicts ADR 0002 unless it is dev-only at the root.
- Either way, there are no tests yet for CI to run.
- Tension: the shipped personal rule suggests `/bootstrap-quality` for repos lacking tooling, while the intent says CI "needs convincing".

## Related
- [Hub](../README.md)
