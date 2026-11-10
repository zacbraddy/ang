---
name: ideate
description: Turns raw inputs in project-context/raw/ into new ideas, folds them into in-flight items, or fast-tracks well-understood work straight to shaping. Use when the user runs /ideate.
disable-model-invocation: true
argument-hint: "[optional raw file]"
---

# /ideate: raw → ideas (or further)

Conventions live in `project-context/README.md` (Item anatomy, Item state, Hub templates, Promotion & merging, Indexing & tags). Read those sections as you need them. Raw inputs can be technical or business; treat both the same way.

Not everything in raw deserves to flow through the funnel. Brainstorming has no bad ideas; the workflow does.

## 1. Inventory
List `project-context/raw/` (or just $ARGUMENTS), then run the commit check in `project-context/README.md` (Raw inputs) before reading any of it.

## 2. Know what's in flight
Run `node .claude/scripts/ang-context-manager.mjs board status`. Spawn `context-scout` for any 10k facts relevant to these themes: <one-line gist per raw file>.

## 3. Split and classify
Read each raw file and pull out the distinct threads that could each become a workstream. If a file's purpose isn't obvious, ask me why I added it. Then give each thread one action:
- **new idea**: real unknowns about *whether* or *what*. This is the default.
- **fold in**: overlaps an in-flight item. Add unknowns and knowns to it; if it's substantial, create it and merge.
- **fast-track to shaping**: I've clearly already decided *that* we do it; only *how* is open.
- **feeds in-flight work**: a fact relevant to something being shaped, planned or built. Add it as a known, cited to the durable doc it lands in, never the raw file (it's about to be deleted).
- **moonshot**: a long-range vision we should never work on directly, only keep in mind so cheap openings get spotted along the way. Propose candidates; I have the final say, because some hard things are ideas I want tackled now.
- **park until <wake condition>**: doable, but worth nothing until something specific happens (e.g. "once we first need to write as the user"). Name the condition. Choose this over discard when the thread would be worth doing later.
- **trigger**: we already know what to do and how; it just can't happen until a checkable moment (a story done, a stage reached, a date). Hand it to the `trigger` skill instead of creating an item.
- **seed 10k**: already true now (my goals and constraints, or the architecture of code that exists) while `10k/` is still empty. Don't create an item. Copy those threads to `raw/seed-10k.md` (so deleting the source doesn't lose them) and point me at `/bootstrap-repo`.
- **discard**: not worth carrying. One line on why.

## 4. Agree the plan, 5 at a time
For each proposed action give: title, action, goal, why it matters, and what completing it unlocks. Discuss and revise. Once I approve a batch, show the next 5.

## 5. Write
- New items: create the folder and a signpost hub, run `ang-context-manager.mjs state init <item>`, then seed unknowns in priority order (`state add <item> unknown`). Record the source with `state lineage <item> "from raw: <filename>"`.
- Fold-ins: `state add` (unknown or known), or `ang-context-manager.mjs item merge` followed by the judgement half (README: Promotion & merging). Knowns cite the durable doc the fact lands in, not the raw file.
- Triggers: follow the `trigger` skill.
- Moonshots and parked threads: add an entry to `project-context/ideas/moonshots.md` or `ideas/parked.md` (README: Moonshots & parked work), creating the file if it's missing. Raw files get deleted, so give each parked entry the raw filename plus the commit hash that holds it (if it was committed).
- Tags: reuse first. If a new one is needed, use `ang-context-manager.mjs tag add`.
- Delete the processed raw files.
- Run `ang-context-manager.mjs library validate` and fix every error.

## 6. Wrap up
List what was created, folded, fast-tracked, made a moonshot, parked, made a trigger and discarded, with paths. Changes are unstaged for me to review and commit.
