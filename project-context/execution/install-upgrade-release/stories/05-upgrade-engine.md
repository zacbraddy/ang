---
title: Upgrade plan and apply engine
shortDescription: The deterministic upgrade engine classifies every file across base, instance and target, sizes the job and applies settled files
tags: [distribution]
status: draft
owner: agent
dependsOn: [04]
---
# Upgrade plan and apply engine

## Summary
The deterministic half of an upgrade, turned from the upgrade merge spike's harness into tested library code. It classifies every file file-by-file with `git merge-file` where both sides changed (d9), after applying the guides' moves so a declared move isn't read as a delete, then picks the path.

## Outcome
- `upgrade plan --base <dir|none> --target <dir> [--guides <file>]` sorts every path into the spike's categories (k8), excluding `settings.json`, `version.json` and `*.local.*`, writes merged files to a temp folder and prints the plan with a path of fast, guided or escape-hatch. It writes nothing in the project. No version record always means escape hatch (d8).
- `upgrade apply --plan <file>` writes every settled entry, including conflicts the skill has resolved, and skips unresolved ones.
- `MANY_CONFLICTS` is one named constant, first set from the spike runs.

## Rough scope
- `upgrade/classify.mjs`, `upgrade/size.mjs`, `upgrade/apply.mjs`, and `plan`/`apply` in `commands/upgrade.mjs`.
- Unit tests over in-memory file maps; integration tests over three temp git trees, one case per category plus a declared move.

## Related
- [Upgrade merge spike](../origins/install-uninstall-update/shaping-content/upgrade-merge-spike.md)
- [C4 components: library script](../c4/3-components.md)
- [C4 code: library script](../c4/4-code.md)
- [Story 04](04-upgrade-guide-chaining.md)
