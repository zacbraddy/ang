---
title: Cut v1.0.0-rc.2 with rehearsal
shortDescription: The second release, cut with the first real rc.1 to rc.2 fixture upgrade rehearsal, closing the epic
tags: [distribution, open-source]
status: draft
owner: both
dependsOn: [12]
---
# Cut v1.0.0-rc.2 with rehearsal

## Summary
The epic's finish line: `/cut-release` takes rc.2 from preflight to post-publish, including the first upgrade rehearsal against the fixture repo.

## Outcome
The rc.1 to rc.2 fixture upgrade keeps every seeded local edit and the local-only skill and agent, leaves no conflict-delete the guide doesn't explain, and passes `library validate` and the shipped tests; a second run stops with "already on the target". The coverage check shows no leftover manifest entries. `AGENT_RESOLVES_UP_TO` and `WARN_FROM` are tuned from what the rehearsal shows. `v1.0.0-rc.2` is published and the real upgrade is committed and tagged in the fixture repo.

## Rough scope
- Run `/cut-release` with Zac; fix forward what the rehearsal turns up.

## Related
- [Plan: success measures](../plan.md)
- [Story 06](06-upgrade-ang-skill.md)
- [Story 12](12-fixture-repo.md)
