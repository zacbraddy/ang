---
title: Upgrade guide format and chaining
shortDescription: Fixes the per-release upgrade guide format and adds upgrade guides, which fetches and chains every guide between two tags
tags: [distribution, open-source]
status: draft
owner: agent
dependsOn: []
---
# Upgrade guide format and chaining

## Summary
Every release gets an upgrade guide in `releases/upgrades/` that starts with a `from:` line (k12, d34). An upgrade walks those lines back from the target to the installed tag, so no API call lists releases. This story fixes the format and builds the deterministic reading of it.

## Outcome
`upgrade guides --from <tag> --to <tag>` prints the chain oldest first as JSON, with each guide's Moves, Migrations, Retired and Notes parsed ("None" means empty). A missing guide, a missing heading or a broken chain exits 1 naming the problem. `releases/upgrades/` holds the format, ready for rc.1's guide.

## Rough scope
- `upgrade/guides.mjs`: `parseGuide`, `chainGuides` with an injected `fetchGuide`, and the real `fetchGuide` against `raw.githubusercontent.com` at the target tag.
- `commands/upgrade.mjs` with the `guides` subcommand; the entry point's import.
- Unit tests in memory with the injected fetch.

## Related
- [Plan: upgrade](../plan.md)
- [C4 code: library script](../c4/4-code.md)
- [Release process proposal](../release-process-proposal.md)
