---
title: Cut v1.0.0-rc.1
shortDescription: The first release, cut with /cut-release, proving the job, the stamp, the publish flow and a live one-liner install
tags: [distribution, open-source]
status: draft
owner: both
dependsOn: [06, 07, 10]
---
# Cut v1.0.0-rc.1

## Summary
The first real run of the whole release process, with no rehearsal because nothing exists to upgrade from. It ships `upgrade-ang`, so the fixture repo built from it can be upgraded in story 13.

## Outcome
`v1.0.0-rc.1` is published as a pre-release. The live one-liner installs it into a fresh repo and into an existing project with its own settings; `version.json` matches `git rev-parse` at the tag; `library init` and `library validate` pass; a re-run stops and points to upgrade. No `*.local.*` file, `install.sh`, `releases/` or `scripts/` content appears in the installed tree (k2, k6).

## Rough scope
- Run `/cut-release` with Zac; fix forward anything the first run turns up.
- Handle the first-release states by hand, since `/cut-release` has no branch for them (d38): tell it to skip the rehearsal (nothing to upgrade from), and make sure `releases/upgrades/v1.0.0-rc.1.md` says `from: none`.

## Related
- [Plan: success measures](../plan.md)
- [Story 10](10-release-scout-and-cut-release.md)
- [Story 12](12-fixture-repo.md)
