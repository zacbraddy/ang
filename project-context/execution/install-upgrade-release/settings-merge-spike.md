---
title: Settings merge spike
shortDescription: A three-way JSON merge of .claude/settings.json, based on Ang's settings at the installed SHA, upgraded changed hooks and permissions with no duplicates or stale entries, kept every user value, flagged hooks both sides edited, and reproduces the install merge exactly when the base is empty
tags: [distribution, open-source]
---
# Settings merge spike

## Summary
Spiked on 2026-11-17, answering how an upgrade updates Ang's own `settings.json` entries without duplicating them (u3). A zero-dependency [`merge.mjs`](spikes/settings-merge/merge.mjs) merges three JSON files: base (Ang's settings at the `version.json` SHA), ours (the user's file) and theirs (Ang's settings at the target release). All checks passed across four scenarios:
- **Changed, dropped and added Ang entries land cleanly.** A changed hook command replaced the old one rather than sitting beside it, a dropped permission went, and a new permission and hook event arrived once each.
- **User values all survive.** Their `outputStyle`, `model`, deny rule, own permission and own hook were untouched, and a local edit to an Ang hook that upstream didn't change was kept.
- **An Ang hook edited on both sides is flagged as a conflict.** Both versions stay in the output, so the upgrade must resolve it with the user before writing.
- **Re-running to the same release is a no-op.**
- **One function covers install too.** With an empty base, the result is identical to the install spike's user-favouring merge (d7), so install and upgrade can share one implementation.

## Setup
- Base is the shipped `src/.claude/settings.json` as it stood at `6cf9987`, unchanged since the first commit, so the target is synthetic: the `SessionStart` banner command gains a flag, Ang's shipped `Bash(jq:*)` allow rule is dropped (picked only as a test entry; the merge itself is plain Node and never runs jq), `Bash(gh release view:*)` and a `UserPromptSubmit` hook are added, and `outputStyle` is renamed.
- Scenarios:
  1. **vanilla:** the user's file is exactly base.
  2. **customised:** the install spike's fake project (own `outputStyle`, `model`, allow, deny and `Stop` hook) merged with base the way install does it.
  3. **edited:** customised, plus two local edits to Ang hooks: the banner command (which upstream also changes) and the `PostToolUse` matcher (which upstream doesn't).
  4. **no record:** customised upgraded with an empty base, standing in for a missing `version.json`.

## The merge rule
- **Objects:** merge key by key.
- **Plain values:** if the user's value still equals base, take the target's. If only the user changed it, keep theirs. If both changed it, keep the user's and report a conflict.
- **Arrays are sets of whole entries.** A hook group whose command changed counts as one entry removed and another added. Base entries missing from the target are removed from the user's file, target entries missing from base are added, and the user's own entries are never touched.
- **Conflict signal for arrays:** a base entry missing from *both* the user's file and the target. Each side replaced it with its own version, so both replacements are in the output and one has to go.

## Results
| Scenario | Added | Removed | Updated | Conflicts | Checks |
|---|---|---|---|---|---|
| vanilla | 3 | 2 | 1 | 0 | equals target exactly |
| customised | 3 | 2 | 0 | 1 (`outputStyle`) | all pass |
| edited | 3 | 1 | 0 | 2 (`outputStyle`, banner hook) | all pass |
| no record | 3 | 0 | 0 | 1 | stale `jq` permission kept, banner hook duplicated |

## What it means for the plan
- **Install and upgrade share one settings merge.** Install is the empty-base case. It should live in the shipped library script (zero dependencies, per ADR 0002) as something like `settings merge <base> <ours> <theirs>`. install.sh would call it after the copy-in, and the upgrade skill would call it with the base it already fetches for the file merge (d9), so there's no extra download.
- **Settings conflicts join the guided merge.** They are judgement items like conflicted files, reported by path with the base, user and target versions, and resolved with the user before anything is written.
- **No record means the install merge.** Without a base, stale Ang entries stay and changed hooks duplicate. That fits guided with warning for a missing record (d8, d13). The skill should name the likely stale Ang entries (those not in the target) for the user to remove by hand.

## Unknown unknowns
- **`outputStyle` conflicts are noise.** Every user with their own style shows a conflict whenever Ang renames its default. `/tailor-ang` owns the style per user, so the upgrade can treat `outputStyle` as always the user's and not report it.
- **Whole-entry matching depends on exact JSON.** Key order inside a hook group is part of what makes two entries equal. If Claude Code's `/hooks` editor rewrites the file with keys in a different order, an untouched Ang hook would look like a local edit, and an upstream change to it would show as a conflict instead of a clean replace. Comparing with sorted keys would fix that cheaply; whether the editor reorders keys is unchecked.
- **A dropped entry the user still relies on goes silently.** The merge removes `Bash(jq:*)` because Ang dropped it, even if the user's own skills need it. The upgrade guide for that release should say when a permission is dropped.

## Related
- [Spike code](spikes/settings-merge/README.md)
- [Install script spike](origins/install-uninstall-update/shaping-content/install-script-spike.md): the user-favouring install merge
- [Upgrade merge spike](origins/install-uninstall-update/shaping-content/upgrade-merge-spike.md): the file merge this sits beside
- [ADR 0002: zero-dependency library script](/project-context/10k/technical/adrs/0002-zero-dependency-library-script.md)
- [Hub](README.md)
