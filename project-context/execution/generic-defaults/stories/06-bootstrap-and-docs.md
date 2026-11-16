---
title: Bootstrap and docs
shortDescription: /bootstrap-repo writes a root ang.json and invokes /tailor-ang; 10k, ADRs and the shipped README describe the finished shape
tags: [distribution, documentation, repo-structure]
status: draft
owner: agent
dependsOn: [05]
---
# Bootstrap and docs

## Summary
`/bootstrap-repo` asks the project feature questions (intent defaults to yes, streams to no), writes a root `ang.json` with project keys only, then invokes `/tailor-ang`. The 10k docs, the ADRs and the shipped README are updated to match.

## Outcome
A fresh install is generic and valid end to end. Bootstrapping a scratch repo yields a committed `ang.json` plus gitignored personal files, and the docs match what actually happens.

## Done when
- A fresh copy of `src/.claude` and `src/project-context` with no config passes `library validate`, and its banner says `no optional features on`.
- One manual `/bootstrap-repo` run in a scratch repo writes root `ang.json` and hands over to `/tailor-ang`.
- The docs edits below are made, and `validate` passes.

## Rough scope
- `bootstrap-repo` skill: write root `ang.json`, skip local keys (as `session features` marks them) and invoke `/tailor-ang` (d5, d11). `/tailor-ang` hands back without its own review step, so bootstrap's closing report lists its files with the rest and tells the user to quit and restart Claude Code to pick up the banner, rule and style.
- `10k/technical/project-structure.md`: config location, the symlink note in its Dragons section, output styles now tracked, and the rules row.
- ADR 0001: the host is named in `ang.local.json`.
- ADR 0002: Summary and Standing list `node:child_process` and `node:test`.
- `src/project-context/README.md`, Ang config section: the two files, `LOCAL_KEYS`, dropped-key warnings, and a pointer to the parked team overrides. Also say every `/tailor-ang` choice is easy to change later: `/output-style` switches styles, and re-running `/tailor-ang` redoes any choice or builds a custom style.

## Links
- [Plan: scope 7–8, success measures](../plan.md)
- [Fresh-install defaults](../origins/shipped-config-defaults/shaping-content/fresh-install-defaults.md)

## Related
- [Epic hub](../README.md)
- [Project structure](/project-context/10k/technical/project-structure.md)
- [ADR 0001: Claude Code harness, Orca optional](/project-context/10k/technical/adrs/0001-claude-code-harness-orca-optional.md)
- [ADR 0002: Zero-dependency library script](/project-context/10k/technical/adrs/0002-zero-dependency-library-script.md)
