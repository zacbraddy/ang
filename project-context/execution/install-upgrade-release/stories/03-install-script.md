---
title: install.sh installs Ang into a repo
shortDescription: The root install.sh checks prerequisites, copies src/ in with giget, merges settings and records the installed version
tags: [distribution, open-source]
status: draft
owner: agent
dependsOn: [02]
---
# install.sh installs Ang into a repo

## Summary
The one-line install's script. It lives unstamped at the repo root; the release workflow (story 08) stamps `TAG` and `SHA` into the release asset. Nothing is written until every check passes (d12).

## Outcome
Run with a release tag against a temp git repo, `install.sh` copies `src/` in at the tag's SHA, backs up `.claude/settings.json` once to `settings.json.pre-ang`, merges settings with the copied tree's own `settings merge` (empty base), writes `version.json`, and prints the version, location and next step. Each check (node ≥ 26 and npx, repo root, clean tree, not installed, no collisions, settings parse, ref resolves) stops with what's wrong and how to fix it. Unstamped with no tag, it stops and prints the one-liner (d28). A tag argument resolves through `GET /releases/tags/{tag}` and refuses drafts and unknown tags (d14).

## Rough scope
- Shell functions per [C4 code: install.sh](../c4/4-code.md): `resolve_target`, one `check_*` per check, `copy_in` (giget into `mktemp -d` first), `merge_settings`, `record_and_report`.
- Integration tests against temp git repos with `npx` stubbed on `PATH` to copy a local `src/`, and the GitHub API stubbed at the boundary.

## Related
- [Plan: install](../plan.md)
- [C4 components: install.sh stages](../c4/3-components.md)
- [Install script spike](../origins/install-uninstall-update/shaping-content/install-script-spike.md)
- [Story 02](02-settings-merge-and-version-record.md)
