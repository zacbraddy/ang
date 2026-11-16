---
title: Install, uninstall, update
shortDescription: How Ang gets into a project, and whether uninstall and update commands are worth having
tags: [distribution, open-source]
---
# Install, uninstall, update

## Summary
How does Ang land in a user's repo, and how does it stay current? The install is settled: a shipped `install.sh` one-liner wraps a copy-in of `src/`. A spike showed the copy-in works in about 4 seconds and brings `project-context/README.md` along. The script exists partly to protect a user's own `.claude/settings.json`, which the copy-in tools overwrite. There will be no uninstall command. The script backs up the user's settings before merging into them. An upgrade skill is also in scope, by Zac's deliberate exception to the delivery intent. It merges upstream releases around an instance's local workflow improvements, and most of its design is still open.

## Why it matters
The README's quick start and a clean first run depend on it. ADR 0002 assumes Ang is copied in, but the route was never decided.

## What's here
- [Brief](ideas-content/brief.md)
- [Install route landscape](ideas-content/install-route.md): plugins vs copy-in tools vs copy-in with managed updates, and how comparable frameworks do it
- [Copy-in bake-off](shaping-content/copy-in-spike.md): degit vs giget into an empty repo and an existing project ([spike](spikes/copy-in/README.md))
- [Install script and upgrade ambition](shaping-content/install-and-upgrade-direction.md): Zac's calls on install and uninstall, and the upgrade skill to explore

## Related
- [ADR 0002: zero-dependency library script](/project-context/10k/technical/adrs/0002-zero-dependency-library-script.md)
- [Shipped config and defaults](https://github.com/zacbraddy/ang/blob/e34550491f625b84a6013a30e16438245bc62468/project-context/execution/generic-defaults/origins/shipped-config-defaults/shaping-content/brief.md) (generic-defaults origin, at `e345504`)
- [ADR 0003: Per-user config overlay](/project-context/10k/technical/adrs/0003-per-user-config-overlay.md)
- [Repo README](/project-context/shaping/repo-readme/README.md)
