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
- [Shipped config and defaults](/project-context/execution/generic-defaults/README.md)
- [Repo README](/project-context/shaping/repo-readme/README.md)
