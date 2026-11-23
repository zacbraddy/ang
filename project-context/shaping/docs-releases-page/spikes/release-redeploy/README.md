---
title: "Spike: release-published docs redeploy"
shortDescription: The three workflows run on a throwaway repo to test redeploying the docs when a release is published, and how to rerun them
tags: [documentation, tech-stack]
---
# Spike: release-published docs redeploy

## Summary
`workflows/` holds the three workflows from the throwaway repo. `redeploy-docs-on-release.yml` is the one to adopt. `deploy-docs.yml` is Ang's with a static build and a step that lists releases. `direct-on-release.yml` is the control that the environment rejects. Findings are in [the spike write-up](../../shaping-content/release-redeploy-spike.md).

## Rerun
1. Create a public scratch repo and push these files under `.github/workflows/`, plus a `docs/index.html`.
2. Set Pages to deploy from GitHub Actions: `gh api -X POST repos/<owner>/<repo>/pages -f build_type=workflow`. The `github-pages` environment comes pre-set to main only.
3. Create a draft release and dispatch `deploy-docs`, then publish the draft. Read the "List releases" step in each run's log.
4. Delete the repo afterwards. This needs `gh auth refresh -h github.com -s delete_repo`.

## Related
- [Spike write-up](../../shaping-content/release-redeploy-spike.md)
- [Item hub](../../README.md)
