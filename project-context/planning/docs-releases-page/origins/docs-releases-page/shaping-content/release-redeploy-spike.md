---
title: "Spike: redeploying the docs when a release is published"
shortDescription: Ran on a throwaway public repo on 2026-11-23. A release-published workflow that dispatches deploy-docs on main works; a direct tag-ref deploy is rejected; CI's contents-read token never sees drafts
tags: [documentation, distribution, tech-stack]
---
# Spike: redeploying the docs when a release is published

## Summary
Publishing a release can rebuild the docs with a small extra workflow. It listens for `release: published` and runs `gh workflow run deploy-docs.yml --ref main`. The dispatched build runs on main, so the `github-pages` environment's main-only rule lets it deploy, with no tag rule needed. A control workflow that deployed straight from the release event was rejected, as predicted. CI's `GITHUB_TOKEN` with `contents: read` never saw a draft release, so drafts can't break the starlight-changelogs build. Run on 2026-11-23 on a throwaway public repo, since deleted.

## Setup
- The throwaway repo had Pages set to "GitHub Actions". Its `github-pages` environment came pre-set to a custom branch policy allowing only `main`, the same as `zacbraddy/ang`'s (checked through the API).
- It had three workflows, kept in [the spike folder](../spikes/release-redeploy/README.md):
  - `deploy-docs.yml` is Ang's, with the same triggers, permissions, concurrency and environment. The Astro build is swapped for a static upload, and a step lists releases as the build token sees them.
  - `redeploy-docs-on-release.yml` runs on `release: published` with `permissions: actions: write`. Its one step is `gh workflow run deploy-docs.yml --ref main`.
  - `direct-on-release.yml` is a control that deploys straight from the `release: published` event.
- The test steps:
  1. Create draft v0.0.1, then dispatch `deploy-docs`.
  2. Create draft v0.0.2, then publish v0.0.1 by hand, as Zac does.

## Results
| Measure | Result |
|---|---|
| Build token sees a draft (draft v0.0.1 only) | **No.** The listing came back empty. |
| Publishing triggers the redeploy | **Yes.** `Redeploy docs on release` ran on the release event and dispatched `Deploy docs`. GitHub's rule that `GITHUB_TOKEN` events don't start workflows exempts `workflow_dispatch`. |
| Dispatched build passes the environment rule | **Yes.** It ran on `refs/heads/main` and both build and deploy succeeded. |
| Dispatched build's view of releases | Published v0.0.1 listed, with `published_at` set. Draft v0.0.2 was not listed. |
| Direct deploy from the release event (control) | **Rejected:** `Tag "v0.0.1" is not allowed to deploy to github-pages due to environment protection rules.` |

## What this means for the build
- The redeploy needs no change to `deploy-docs.yml` and no change to the environment. It adds one workflow file of about 10 lines.
- Drafts made by `release.yml` sit there until Zac publishes them. They can't break a docs build in the meantime, because the docs token can't see them.
- The dispatched build always uses main's docs, not the tagged commit's. That's what the site should show anyway.

## Related
- [Spike files](../spikes/release-redeploy/README.md)
- [starlight-changelogs spike](./starlight-changelogs-spike.md)
- [How other docs sites build it](./how-others-build-it.md)
- [Item hub](../../../README.md)
- [ADR 0008: docs on Starlight and GitHub Pages](/project-context/10k/technical/adrs/0008-docs-starlight-on-github-pages.md)
