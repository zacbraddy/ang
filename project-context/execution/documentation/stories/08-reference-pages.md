---
title: Reference pages
shortDescription: The Agents, ang-context-manager.mjs and Config reference pages are live
tags: [documentation]
status: draft
owner: agent
dependsOn: [02]
---
# Reference pages

## Summary
Lookup pages for a user bending or debugging Ang: what each agent does, what the library script can do and what `ang.json` controls.

## Outcome
`reference/agents` (context-scout, prioritiser, stage-gate), `reference/ang-context-manager` and `reference/config` (`ang.json` and the host, intent, pilot and streams feature modules) are live.

## Rough scope
- Sources per the [page map](../information-architecture.md#page-map): `src/.claude/agents/`, the script's `--help` output, and the shipped `ang.json` and feature modules.
- The script page groups commands as `--help` does, rather than copying it verbatim, so the script stays the source of truth.

## Related
- [Voice lessons from the README](../voice-lessons.md)
- [Plan: Sequencing step 6](../plan.md)
