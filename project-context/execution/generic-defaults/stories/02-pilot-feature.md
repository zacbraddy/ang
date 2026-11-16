---
title: Pilot feature
shortDescription: Promote the pilot-feature spike so the pilot's name reaches sessions and subagents through the existing hooks
tags: [distribution]
status: draft
owner: agent
dependsOn: [01]
---
# Pilot feature

## Summary
Promotes the [pilot feature spike](../origins/generic-personal-defaults/spikes/pilot-feature/README.md) to `src/.claude/ang/features/pilot/`, and adds the one contract change it needs: a feature may export `rule(value)` in place of a static `rule.md`. `pilot` is set in `ang.local.json`.

## Outcome
Sessions in this repo show `Ang: intent · host (orca) · pilot (Zac)`, and subagents get the pilot's name through the SubagentStart hook. Skills are never templated.

## Done when
- Unit tests pass for: pilot `check` and `on` (`null` and a name pass; `""`, whitespace and numbers fail); `featureRule` preferring `rule(value)` over `rule.md`; banner and subagent output skipping the rules of features that are off.
- The integration test shows a banner naming the pilot.
- This repo's `ang.local.json` sets `pilot: "Zac"`, and `validate` passes.

## Rough scope
- `ang/features/pilot/feature.mjs`, copied from the spike.
- `features.mjs`: register `pilot` and add `featureRule(feature, config)`.
- `commands/session.mjs`: a private `onRules()` that `banner` and `subagent` both use.

## Links
- [Plan: scope 3](../plan.md)
- [Spike diff](../origins/generic-personal-defaults/spikes/pilot-feature/script-changes.diff)
- [C4 components](../c4/3-components.md), [C4 code](../c4/4-code.md)

## Related
- [Epic hub](../README.md)
- [01 Config move](01-config-move.md)
- [Pilot name decision](../origins/generic-personal-defaults/shaping-content/pilot-name.md)
