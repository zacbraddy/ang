---
title: Install, uninstall, update
shortDescription: How Ang gets into a project, and whether uninstall and update commands are worth having
tags: [distribution, open-source]
---
# Install, uninstall, update

## Summary
How does Ang land in a user's repo quickly? Research points to copying files in (`degit`/`giget`-style, possibly with a hash-manifest update later) rather than a Claude Code plugin, since plugins can't ship rules or permissions and wipe user edits on update. Also: is an uninstall command worth having, and what must it never remove? Is an update command worth having, given users diverge from upstream by design? And how does `project-context/README.md` reach an install, since `library init` doesn't create it?

## Why it matters
The README's quick start and a clean first run depend on it. ADR 0002 assumes Ang is copied in, but the route was never decided.

## What's here
- [Brief](ideas-content/brief.md)
- [Install route landscape](ideas-content/install-route.md): plugins vs copy-in tools vs copy-in with managed updates, and how comparable frameworks do it

## Related
- [ADR 0002: zero-dependency library script](/project-context/10k/technical/adrs/0002-zero-dependency-library-script.md)
- [Shipped config and defaults](https://github.com/zacbraddy/ang/blob/e34550491f625b84a6013a30e16438245bc62468/project-context/execution/generic-defaults/origins/shipped-config-defaults/shaping-content/brief.md) (generic-defaults origin, at `e345504`)
- [ADR 0003: Per-user config overlay](/project-context/10k/technical/adrs/0003-per-user-config-overlay.md)
- [Repo README](/project-context/shaping/repo-readme/README.md)
