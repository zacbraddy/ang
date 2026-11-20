---
title: Upgrade routes and why upgrades work this way
shortDescription: The four upgrade routes (fast, agent-resolved, guided, guided with warning), the non-destructive premise they rest on, and why Ang's upgrade departs from deterministic upgrade tools; source for the user docs
tags: [distribution, open-source]
---
# Upgrade routes and why upgrades work this way

## Summary
An upgrade sorts every file into a route by how likely the agent is to get the merge wrong, not by how much work the merge is. The agent resolves everything it confidently can on every route. It asks the user only about merges that risk breaking Ang or a customisation the user built. All of this is safe because the upgrade never commits: the user reviews the unstaged changes and either commits them or drops the whole changeset. This doc is the source the user docs should draw on to explain the upgrade (Zac's call, 2026-11-18).

## The non-destructive premise
- The upgrade starts only from a clean working tree (d13, decision 13), and it writes files without staging or committing anything.
- The user has the final say on whether the upgrade succeeded. They review the diff, then commit it or drop it (`git restore . && git clean -fd`, safe because the tree was clean before the upgrade) and carry on as before.
- Everything else here rests on that. It's why the agent can act on its own judgement for most merges: a wrong call costs a review, never lost work.

## The four routes
"Conflicted files" means files both sides changed on the same lines, plus files one side deleted while the other edited them. The engine counts them, and the counts are named constants. Tuning them is parked until users report an upgrade taking the wrong route ([route threshold tuning](/project-context/ideas/parked.md#route-threshold-tuning)).

| Route | When | What the user experiences |
|---|---|---|
| **Fast** | Every change is one-sided: only upstream or only the user changed each file | Runs the command, is told it worked and how to review |
| **Agent-resolved** | Any clean merge (both sides changed a file and git merged it), or 1 to 5 conflicted files | The same as fast. The agent rereads clean merges against upstream's diff and the upgrade guide, resolves the conflicts itself, and reports what it did. The upgrade guides exist to widen this route |
| **Guided** | 6 to 11 conflicted files | The agent still resolves everything it's sure of. It walks the user only through the merges it's unsure of: where a merge could break how Ang runs, or leave one of the user's customisations inoperable. The user confirms or corrects each |
| **Guided with warning** | 12 or more conflicted files, or no version record | Before writing anything, the agent says how many conflicts there are and gives its assessment of the risk to the user's customisations. It suggests that, at this level of change, they may prefer to treat their Ang as their own fork. The user decides; if they go ahead, it runs as guided |

- **No version record** is an exception, not a normal case (d8). Without a base, every file both sides have looks conflicted, so it goes to guided with warning. It happens when a user has deleted or broken `version.json`, or copied Ang in by hand. The count will be high, but most conflicts are ones the agent resolves itself, so the warning comes and then little else does.
- **Guided routes don't step through every conflict.** They exist for the merges where the agent is likely to be wrong, not to make the user rubber-stamp easy ones.
- **All or nothing (d26):** whichever route runs, the upgrade applies every file or none. There are no partial upgrades.

## Why Ang's upgrade isn't deterministic
This is the message the user docs need to carry, so users go in knowing what to expect.
- **Ang is customisable at its core.** Users are expected to edit the skills, agents, rules and conventions that make up the framework itself, not just configure it. Every install drifts in its own way, so the combinations an upgrade has to merge are close to endless.
- **Most frameworks avoid the problem.** Either they don't allow that level of customisation at the core, or they don't offer an upgrade path at all and leave users to re-apply their changes by hand.
- **Ang offers both, and that forces a different kind of upgrade.** No fixed script can know how a user's changes interact with a new release. So the deterministic half (classifying files, three-way merging, applying the upgrade guides' moves) is done by code, and the judgement half is done by an agent, with the user consulted only where the risk is real.
- **It's a double-edged sword, and worth saying so plainly.** Users get a framework they can make their own and still upgrade. The cost is that the upgrade is agent-run and its result is theirs to review. It isn't a black box that guarantees the outcome. The clean-tree start and the never-commit finish are what make that trade safe.

## What the user docs should cover
- What install does and what upgrade does, step by step, at the level a user needs to trust them.
- The four routes, in the user's terms: when they'll be asked something, and why.
- That the upgrade never commits, and how to review it or throw it away.
- Why it works this way: the section above, framed as Ang trying to help in a hard situation rather than as a caveat.
- Committing `.claude/ang/version.json`: losing it makes the next upgrade look far bigger than it is (spike finding, k8).

## Related
- [Plan: upgrade](plan.md)
- [Upgrade merge spike](origins/install-uninstall-update/shaping-content/upgrade-merge-spike.md)
- [Story 05: upgrade engine](stories/05-upgrade-engine.md)
- [Story 06: upgrade-ang skill](stories/06-upgrade-ang-skill.md)
