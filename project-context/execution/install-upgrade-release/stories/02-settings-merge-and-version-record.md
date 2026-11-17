---
title: Settings merge and version record commands
shortDescription: The library script gains the shared three-way settings merge and the version show/write commands that install and upgrade both use
tags: [distribution, tech-stack]
status: draft
owner: agent
dependsOn: []
---
# Settings merge and version record commands

## Summary
Install and upgrade share one `settings.json` merge and one way of reading and writing `.claude/ang/version.json`. This story builds both as core (not feature-gated) commands in `ang-context-manager.mjs`, test-first from the settings merge spike, with Node built-ins only (ADR 0002).

## Outcome
- `settings merge --base <file|none> --ours <file> --theirs <file>` passes the spike's four scenarios, gives exactly the install merge when the base is `none` (d7), and is a no-op on re-run. It writes `--ours` in place with stable key order and prints conflicts as JSON; `outputStyle` conflicts are dropped (k15).
- `version show` prints the record, or `none` with exit 0. `version write --ref <tag> --sha <sha>` writes `{ ref, sha, installedAt }` (k7, d35).

## Rough scope
- `settings/merge.mjs` (`mergeSettings`, `mergeArray`, `SKIPPED_KEYS`), `commands/settings.mjs`, `commands/version.mjs`, and the entry point's imports.
- Unit tests beside the code with `node:test`.

## Related
- [Settings merge spike](../settings-merge-spike.md)
- [C4 components: library script](../c4/3-components.md)
- [C4 code: library script](../c4/4-code.md)
- [Plan: test strategy](../plan.md)
