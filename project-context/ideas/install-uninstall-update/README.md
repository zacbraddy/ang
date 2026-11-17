---
title: Install, uninstall, update
shortDescription: How Ang gets into a project, and whether uninstall and update commands are worth having
tags: [distribution, open-source]
---
# Install, uninstall, update

## Summary
How does Ang land in a user's repo quickly? Options include a Claude Code plugin marketplace, a copy script, or `degit`-style cloning, weighed against Ang being a starter that users edit (workflow improvements depend on that). Also: is an uninstall command worth having, and what must it never remove? Is an update command worth having, given users diverge from upstream by design? And how does `project-context/README.md` reach an install, since `library init` doesn't create it?

## Why it matters
The README's quick start and a clean first run depend on it. ADR 0002 assumes Ang is copied in, but the route was never decided.

## What's here
- [Brief](ideas-content/brief.md)

## Related
- [ADR 0002: zero-dependency library script](/project-context/10k/technical/adrs/0002-zero-dependency-library-script.md)
- [Shipped config and defaults](https://github.com/zacbraddy/ang/blob/e34550491f625b84a6013a30e16438245bc62468/project-context/execution/generic-defaults/origins/shipped-config-defaults/shaping-content/brief.md) (generic-defaults origin, at `e345504`)
- [ADR 0003: Per-user config overlay](/project-context/10k/technical/adrs/0003-per-user-config-overlay.md)
- [Repo README](/project-context/planning/documentation/README.md)
