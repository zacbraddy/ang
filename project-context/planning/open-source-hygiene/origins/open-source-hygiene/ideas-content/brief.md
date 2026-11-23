---
title: Open-source hygiene, brief
shortDescription: Zac's stance on open-source standards and the deferred quality-tooling options
tags: [open-source]
---
# Brief

## Summary
Zac's stance on open-source release standards (2026-11-13, updated 2026-11-16), plus the quality-tooling options deferred at bootstrap.

## Stance
- Look at open-source projects that aren't afraid of a little whimsy, which suits Zac's persona, and lift what fits. Ang is not a big corporation and shouldn't pretend to be.
- Some standard practices won't fit Ang's nature and will be modified or dropped.
- PR and issue templates are wanted (2026-11-16). They're worth more than tooling for the trickle of issues and PRs Ang expects. One steers requests that clash with Ang's first principles to "raise it as a workflow improvement in your own Ang", linking the first principles in the docs. Another opens an open conversation about the framework, which Zac expects to be more useful than requests for change. The README or a CONTRIBUTING doc tells people the templates exist and how to use them. CONTRIBUTORS is still only in if it's a no-brainer.
- Go full grown-up repo (2026-11-16): status badges on the README, CI included. That still fits the whimsy, which lives in the voice, not in skipping the basics.
- Linting markdown has no value. Code quality is now first-class: see [quality tooling](./quality-tooling.md).

## Quality-tooling options (deferred at bootstrap, decided 2026-11-16)
The repo has no lint, format, tests or CI.
- **B:** zero-dependency setup. GitHub Actions running `node --check` and `node --test`.
- **C:** full kit. Root `package.json` with ESLint, Prettier, Vitest, Husky, lint-staged and CI. This contradicts ADR 0002 unless it is dev-only at the root.
- Tension: the shipped personal rule suggests `/bootstrap-quality` for repos lacking tooling, while the intent says CI "needs convincing".

## Related
- [Hub](../../../README.md)
