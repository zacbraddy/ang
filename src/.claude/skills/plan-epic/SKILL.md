---
name: plan-epic
description: Groups ready shaped items into an epic and works one planning chunk per session until the epic is ready for execution. Handles technical, business and mixed epics. Use when the user runs /plan-epic.
disable-model-invocation: true
argument-hint: "[optional epic folder or slug, or 'new']"
---

# /plan-epic: "how are we ACTUALLY doing it?"

!`node .claude/scripts/ang-context-manager.mjs session steps plan-epic`

An epic delivers one or more shaped items as one unit. Planning is the last stage where items merge.

## Mode A: new epic (no epic named, or "new")
1. Run `node .claude/scripts/ang-context-manager.mjs board status shaping` and find the `ready-for-planning` items. Propose a grouping into **one** epic (cohesive, deliverable as a unit) and its type: `technical`, `business` or `mixed`. Agree both with me.
2. Create `project-context/planning/<epic-slug>/README.md` as a signpost hub, then run `ang-context-manager.mjs state init <epic> --type <type>`.
3. For each chosen item: `ang-context-manager.mjs item merge project-context/shaping/<x> <epic> --nest origins`. Then do the judgement half: dedupe and reword state entries, reorder unknowns into one planning list, and write the epic hub.

## Mode B: continue an epic
Run `ang-context-manager.mjs state show <epic>`. Pick **one** chunk for this session: answer a planning unknown (research, a tiny spike, or a question for me), or produce or revise one deliverable below.

## Deliverables
- **All epics:** `plan.md` covering scope, out of scope, approach, sequencing and risks, success measures, and **candidate ADRs** (decisions this epic commits us to).
- **Technical/mixed:**
  - `c4/1-context.md` through `c4/4-code.md` in Mermaid (`C4Context`, `C4Container`, `C4Component`; level 4 as a `classDiagram` or a table of modules, types and functions with responsibilities). Each level marks **new** vs **changed** vs **existing**, and the levels must agree with each other.
  - A test strategy in `plan.md` (pyramid, right-sized).
  - Architecture follows the domain, and every pattern must pay off within this epic.
- **Business/mixed:** in `plan.md`, the deliverables (docs, assets, accounts, processes), the tools and services involved, and who does what (agent vs the user).
- **Consistency with `10k/`** (via `context-scout`). Any conflict is resolved or listed as a candidate ADR.

Record settled choices with `state add <epic> decision` and answered unknowns with `state answer`.

## Gate and wrap up
When the deliverables look complete, spawn `stage-gate` with the epic path and the target `execution`. Report what was done, the verdict and the next step in up to 5 bullets. Run `ang-context-manager.mjs library validate` and fix errors. Changes are unstaged.
