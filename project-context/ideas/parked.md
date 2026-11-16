---
title: Parked work
shortDescription: Doable threads with no value yet, each with the wake condition that would make it worth doing
tags: [distribution]
---
# Parked work

## Summary
Threads we could do but that are worth nothing until something specific happens. `/refine-ideas` and `/retro` mention any entry whose wake condition looks to have come true.

### Per-user intent garnish
A gitignored, per-user addition to the project's delivery intent. Agents read it after `10k/intent.md`, and it can only add to or narrow the project intent, never override it. It must live outside `10k/` (for example in `.claude/`), so the index doesn't churn between teammates. `/retro` might offer to promote recurring garnishes into the project intent.
- **Wake condition:** a team (more than one person) runs Ang in a single repo and wants personal delivery preferences alongside a shared intent.
- **Source:** parked in shaping on 2026-11-16, not from a raw file. See [Tailoring step and per-user config](https://github.com/zacbraddy/ang/blob/e34550491f625b84a6013a30e16438245bc62468/project-context/execution/generic-defaults/origins/generic-personal-defaults/shaping-content/tailoring.md) (at `e345504`, the last commit before the generic-defaults retro archived it).

### Team-controlled local overrides
A `localOverrides` list in `ang.json` (e.g. `["intent"]`) that lets the team allow each person to override project-wide keys in their gitignored `ang.local.json`. Today the loader merges only a fixed set of personal keys (`host`, `pilot`) and `validate` warns about any other key it drops. This would make that set something the team can configure, without forking Ang.
- **Wake condition:** a user asks to override a project-wide key (`intent`, `streams` or a future one) for themselves only.
- **Source:** parked in planning on 2026-11-16, not from a raw file. See [Config move blast radius](https://github.com/zacbraddy/ang/blob/e34550491f625b84a6013a30e16438245bc62468/project-context/execution/generic-defaults/config-move.md) (at `e345504`) and [ADR 0003](/project-context/10k/technical/adrs/0003-per-user-config-overlay.md).

## Related
- [Delivery intent](/project-context/10k/intent.md)
- [ADR 0003: Per-user config overlay](/project-context/10k/technical/adrs/0003-per-user-config-overlay.md)
