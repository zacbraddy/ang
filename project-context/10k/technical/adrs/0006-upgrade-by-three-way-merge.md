---
title: "ADR 0006: Upgrade by three-way merge"
shortDescription: upgrade-ang merges each file three-way against the recorded release, picks one of four routes by conflict count, never commits and is all or nothing; one settings merge serves install and upgrade
tags: [distribution, tech-stack]
---
# ADR 0006: Upgrade by three-way merge

## Summary
The `upgrade-ang` skill brings an install up to a newer release without losing the user's own changes to Ang. Its engine (the core `upgrade` command in the library script) merges every file three-way: the base is the release recorded in `.claude/ang/version.json`, "ours" is the user's tree and "theirs" is the target release. It then picks one of four routes by how many files conflict. The upgrade starts only from a clean tree, never commits, and applies every file or none. This doc is also the source the user docs draw on to explain upgrades. Drawn from `src/.claude/scripts/ang/upgrade/`, `settings/` and `src/.claude/skills/upgrade-ang/` as of 2026-11-23.

## Context
Ang is customisable at its core: users are expected to edit the skills, agents, rules and conventions that make up the framework, not just configure it. Most frameworks either forbid that or offer no upgrade path. Ang offers both, so no fixed script can know how a user's changes interact with a release. The deterministic half (classifying, merging, applying moves) is done in code, and the judgement half is done by an agent. The spike showed that conflicted files are the real cost signal: across 28 upstream-changed files and 6 local improvements, only 4 files needed judgement.

## Decision
- **File by file, three-way, with `git merge-file`,** against the `version.json` SHA. Both the base and target trees are fetched with giget.
- **The non-destructive premise:** start only from a clean tree, write without staging or committing, and leave the user to review the diff and commit it or drop it (`git restore . && git clean -fd`). A wrong call by the agent costs a review, never lost work.
- **Four routes, by conflicted-file count** (same-line edits on both sides, or a deletion against an edit). The thresholds are named constants in `upgrade/size.mjs`.

| Route | When | What the user experiences |
|---|---|---|
| **Fast** | Every change is one-sided | Told it worked and how to review |
| **Agent-resolved** | Any clean two-sided merge, or 1 to 5 conflicts | The agent rereads clean merges against upstream's diff and the upgrade guide, resolves conflicts itself and reports |
| **Guided** | 6 to 11 conflicts | The agent resolves what it's sure of and asks only about merges that could break Ang or one of the user's customisations |
| **Guided with warning** | 12 or more conflicts, or no version record | Before writing, it gives the count and a risk assessment and suggests owning a fork. The user decides; then as guided |

- **All or nothing:** no partial upgrades, so `version.json` always names exactly one release.
- **The target release's engine runs the upgrade,** fetched at the target tag, so merge fixes reach users on the upgrade that ships them.
- **Upgrade guides chain:** each release's guide names the release it upgrades `from:`. The engine follows that chain back from the target's guide, fetched raw at the target tag, so no API call lists releases. Guides declare moves, which the engine applies before classifying.
- **Stops before writing** when already on the target, on a downgrade, on a dirty tree or on missing prerequisites. A missing record is not a stop: it merges against empty files and goes to guided with warning.
- **`version.json` (`ref`, `sha`, `installedAt`) is read and written only through the core `version show` and `version write` commands,** which `install.sh` uses too.
- **One three-way settings merge** in the library script (`settings merge`). Arrays are sets of whole entries, compared as canonical JSON. With an empty base it is exactly the install merge: the user's values win, Ang adds what's missing.
- **Multi-version jumps go one major at a time,** naming each tag.

## Consequences
- Users should commit `.claude/ang/version.json`. Without it every file looks conflicted and the upgrade looks far bigger than it is.
- A wrong `from:` line breaks the chain; the release rehearsal catches it ([ADR 0007](/project-context/10k/technical/adrs/0007-how-releases-are-cut.md)).
- Clean merges can still be semantically stale, which is why the agent rereads them.
- Parked until a user asks or reports it: route threshold tuning, partial upgrades, a local changelog and undeclared moves on no-record upgrades ([parked work](/project-context/ideas/parked.md)).

## Standing
2026-11-23. Built: the `upgrade`, `settings` and `version` core commands with unit and integration tests, and the `upgrade-ang` skill. Rehearsed on the fixture repo from `v1.0.0-rc.1` to `v1.0.0-rc.2`.

## Related
| Doc | Why |
|---|---|
| [ADR 0005: Install by copy-in](/project-context/10k/technical/adrs/0005-install-by-copy-in-from-releases.md) | Where the version record is first written |
| [ADR 0007: How releases are cut](/project-context/10k/technical/adrs/0007-how-releases-are-cut.md) | Where upgrade guides come from |
| [ADR 0002: Zero-dependency library script](/project-context/10k/technical/adrs/0002-zero-dependency-library-script.md) | Why the engine lives in the library script |
