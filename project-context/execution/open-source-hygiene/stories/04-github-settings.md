---
title: GitHub settings
shortDescription: Discussions and private vulnerability reporting on, wiki and projects off, each set with gh api and read back
tags: [open-source]
status: draft
owner: both
dependsOn: []
---
# GitHub settings

## Summary
Flips the four repo settings the contributor kit relies on. The agent proposes each `gh api` call, Zac confirms it, and the agent reads the setting back. No script persists.

## Outcome
`gh api` reads back Discussions on, private vulnerability reporting on, wiki off and projects off. Delete-branch-on-merge stays off.

## Rough scope
- One proposed `gh api` call per setting, confirmed by Zac before it runs.
- A readback per setting, recorded in the story's Review.
- Discussions must be on before story 05's issue chooser links to it.

## Related
- [Plan: settings by agent, confirmed by Zac](../plan.md#settings-by-agent-confirmed-by-zac)
- [C4 components](../c4/3-components.md#components)
