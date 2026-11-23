---
title: Check CI, badges and templates live after open-source hygiene merges
shortDescription: Once stream/open-source-hygiene is merged to main, confirm the first ci.yml run is green, the README badges render, and GitHub's issue chooser and PR template work
tags: [open-source, tech-stack]
---
# Check CI, badges and templates live after open-source hygiene merges

## Summary
An agent checks what it can with `gh` and walks Zac through the rest: the first `ci.yml` run on `main`, the four README badges, GitHub's New issue page and a pre-filled PR. This is the first time the open-source-hygiene epic's repo-facing work is seen live on GitHub.

## Why now, not sooner or later
- **Not sooner:** GitHub only reads `ci.yml`, the issue templates, `config.yml` and the PR template from the default branch, and the CI badge points at `main`. Until the merge, none of it can be seen working.
- **Not later:** the repo is public, so a broken badge or issue chooser is what the first visitor meets.

## What to do
1. Confirm the CI run for the merge commit is green: `gh run list --workflow ci.yml --branch main --limit 3`.
2. Open `https://github.com/zacbraddy/ang` with Zac and check that all four badges render with real values: CI passing, MIT licence, Node `>=26` (a dynamic JSON badge read from `package.json`) and the latest release.
3. Have Zac open the Issues tab → **New issue**. Expect the open-conversation template first, then the feature request, then a Discussions contact link, and no "blank issue" option.
4. Have Zac start a PR from any branch (it can be closed straight away). Expect the body to pre-fill with the PR template, with its `blob/main` links resolving.
5. Record any failure as a story or a workflow improvement, not as an in-session fix.

## Signs it's already handled
- `gh run list --workflow ci.yml --branch main` shows green runs, and Zac says he has already checked the issue chooser and PR template live.

## Related
- [ADR 0011: Dev-only quality tooling and advisory CI](/project-context/10k/technical/adrs/0011-dev-only-quality-tooling-advisory-ci.md)
- [ADR 0012: Contributor templates nudge, they don't gate](/project-context/10k/technical/adrs/0012-contributor-templates-nudge-not-gate.md)
