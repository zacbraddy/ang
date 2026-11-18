---
title: Release workflow
shortDescription: A tag-triggered GitHub Actions job tests, smoke-installs, stamps install.sh and creates the draft release
tags: [distribution, open-source]
status: ready
owner: agent
dependsOn: [01, 03]
---
# Release workflow

## Summary
This story runs a release's mechanics in CI when a tag is pushed (d16, d21). They live in their own `release.yml`, so they don't collide with the open-source hygiene CI or the documentation stream's `deploy-docs.yml`. The story also creates `releases/notes/`, next to story 04's `releases/upgrades/`. Each release then has two files (k12): the notes, which become the GitHub Release body, and the upgrade guide.

## Outcome
Pushing a `v*` tag runs every test on Node 26, including the link drift test. The job then stamps `TAG` and `SHA` into a copy of `install.sh` and smoke-installs that copy into a fresh repo on the runner. Last, it creates a draft GitHub Release with the stamped copy attached. The release body comes from `releases/notes/<tag>.md`, and rc tags are marked as prereleases. If any step fails, nothing is published.

## Done when
- `.github/workflows/release.yml` exists and `actionlint` passes on it, or a YAML parse if actionlint isn't available.
- `releases/notes/README.md` explains what a notes file is, how it's named and what it's used for.
- The bare `node --test` lines in the plan and C4 docs now use the glob command. The proposal and C4 code now stamp before the smoke test.
- The workflow's first real run is story 11. That run is the end-to-end proof.

## Acceptance criteria
- **Given** a pushed tag `v1.2.3` and an existing `releases/notes/v1.2.3.md`, **when** the workflow runs, **then** a draft release `v1.2.3` (not a prerelease) is created. Its body is that file and its only asset is the stamped `install.sh`.
- **Given** the tag `v1.0.0-rc.1`, **when** the release is created, **then** it is marked as a prerelease.
- **Given** a tag with no `releases/notes/<tag>.md`, **when** the workflow runs, **then** it fails at its first step, before the tests, and names the missing file.
- **Given** a tag that isn't `vX.Y.Z` or `vX.Y.Z-rc.N`, **when** the workflow runs, **then** it fails at its first step and creates no release.
- **Given** a failing test, **when** the workflow runs, **then** no release is created.
- **Given** an `install.sh` whose `TAG=""` or `SHA=""` line no longer matches exactly, **when** the stamp step runs, **then** it fails and doesn't ship an unstamped asset.
- **Given** the stamped copy, **when** it is run in a fresh `git init` repo on the runner, **then** it installs, and `library init` followed by `library validate` both exit 0. If not, no release is created.
- **Given** a run of the workflow, **then** the repo's `install.sh` stays unstamped. Only the asset copy changes.

## Test plan
- **Unit:** none. The YAML has no logic worth extracting. Stamping is two `sed` lines, and story 03's `scripts/install.test.mjs` already proves a stamped script runs.
- **Integration and E2E:** the workflow's own smoke step, a real install with the stamped asset, runs on every release. Story 11 is its first run.
- **Deliberately not tested** (`engineering-defaults.md`: CI config fails loudly):
  - the Actions YAML itself;
  - `gh release create`;
  - `setup-node`.

## Implementation notes
- **Trigger:** `on: push: tags: ['v*']`. Give the job `permissions: contents: write` so `gh` can create the release with `GITHUB_TOKEN` (`GH_TOKEN: ${{ github.token }}`).
- **Steps, in this order:**
  1. **Preflight.** Check the tag matches `^v[0-9]+\.[0-9]+\.[0-9]+(-rc\.[0-9]+)?$`. Check that `releases/notes/$TAG.md` exists. Set `PRERELEASE=--prerelease` when the tag contains `-rc.`.
  2. **Setup.** `actions/checkout`, then `actions/setup-node` with `node-version: 26`. This repo has no `.node-version` file, so the workflow pins the version itself (k9: bump it each October).
  3. **Tests.** Run `node --test 'src/.claude/**/*.test.mjs' 'scripts/*.test.mjs'`, quoted so Node expands the globs, not the shell. Bare `node --test` skips everything under dot folders: on 2026-11-18 it ran 32 of 160 tests. `install.test.mjs` copies `git ls-files src`, which works in a checkout.
  4. **Stamp.** Copy `install.sh` to `$RUNNER_TEMP/install.sh`. Replace exactly `^TAG=""$` with `TAG="$TAG"` and `^SHA=""$` with `SHA="$GITHUB_SHA"` (story 03:64). Then `grep` for both stamped lines and fail if either is missing.
  5. **Smoke.** In a new `$RUNNER_TEMP` directory, run `git init`, then `sh $RUNNER_TEMP/install.sh`, then `node .claude/scripts/ang-context-manager.mjs library init` and `library validate`.
     - The stamped script fetches `gh:zacbraddy/ang/src#$SHA` with giget. That works because the repo is public and the tag's commit is already pushed.
     - If the runner's git has no identity, `check_clean` might need one. Set `git config user.email` and `user.name` only if it does.
  6. **Release.** Run `gh release create "$TAG" "$RUNNER_TEMP/install.sh" --draft --title "$TAG" --notes-file "releases/notes/$TAG.md" $PRERELEASE`.
- **Fixes to the library docs:**
  - Swap bare `node --test` for the glob command in `plan.md` (test strategy, around :116), `c4/2-containers.md` (:90), `c4/3-components.md` (:101) and `c4/4-code.md` (:72).
  - In `release-process-proposal.md` (:159-166) and `c4/4-code.md` (:72), put stamping before the smoke test.
- **Notes folder:** `releases/notes/README.md` sets the convention.
  - Files are named `vX.Y.Z.md`, or `vX.Y.Z-rc.N.md` for release candidates.
  - Each file is the release's GitHub body, written for people in Zac's voice (d25). The agent-facing upgrade guide goes in `releases/upgrades/`.
  - Give it frontmatter only if the library validator requires it there. `releases/` sits outside `project-context/`, so it probably doesn't.
- **Out of scope:**
  - writing any real notes file (story 11 writes `v1.0.0-rc.1.md`);
  - `/cut-release`'s delete-and-recut path when a run fails (story 10);
  - publishing the draft, which Zac does by hand;
  - the stale `install.sh` element list in `c4/4-code.md:51-56` (flagged in story 03).

## Related
- [C4 components: repo-only release tooling](../c4/3-components.md)
- [C4 code](../c4/4-code.md)
- [Release process proposal](../release-process-proposal.md)
- [Story 03](03-install-script.md)
- [Story 07](07-github-release-guard-rails.md)
- [Story 11](11-cut-rc1.md)
