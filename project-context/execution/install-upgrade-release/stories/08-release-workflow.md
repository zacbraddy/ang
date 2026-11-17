---
title: Release workflow
shortDescription: A tag-triggered GitHub Actions job tests, smoke-installs, stamps install.sh and creates the draft release
tags: [distribution, open-source]
status: draft
owner: agent
dependsOn: [01, 03]
---
# Release workflow

## Summary
The mechanics of a release run in CI on tag push (d16, d21), in a separate `release.yml` so they don't collide with open-source hygiene's CI. This story also creates `releases/notes/` beside story 04's `releases/upgrades/` (k12).

## Outcome
Pushing a `v*` tag runs `node --test` on Node 26 (the link drift test included), smoke-installs with the stamped `install.sh` on a fresh runner repo, stamps `TAG` and `SHA` into the asset, and creates a draft GitHub Release with it attached, marked prerelease for rc tags. The release notes body comes from `releases/notes/<tag>.md`.

## Rough scope
- `.github/workflows/release.yml` and `releases/notes/`.
- The YAML isn't unit-tested; its first real run is story 11.
- Run the tests by glob, e.g. `node --test 'src/.claude/**/*.test.mjs' 'scripts/*.test.mjs'`. Bare `node --test` skips test files under dot folders, so it misses everything in `src/.claude/` (on 2026-11-17 it ran 31 of 87 tests). The plan's test strategy and the C4 `release.yml` rows say bare `node --test` and need the same change.

## Related
- [C4 components: repo-only release tooling](../c4/3-components.md)
- [Release process proposal](../release-process-proposal.md)
- [Story 03](03-install-script.md)
