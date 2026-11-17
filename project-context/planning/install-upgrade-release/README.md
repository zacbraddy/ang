---
title: Install, upgrade and release
shortDescription: Technical epic delivering the one-line install.sh, the upgrade skill and the process for cutting the releases they consume
tags: [distribution, open-source]
---
# Install, upgrade and release

## Summary
This is a technical epic about how Ang gets into a user's repo and stays current there. It has three parts:
- **Install:** a root-level `install.sh`, piped from a pinned ref. It checks its prerequisites first, copies in `src/` with giget, merges the user's `.claude/settings.json` (the user's values win) and records the installed version in `.claude/ang/version.json`.
- **Upgrade:** an upgrade skill that runs a file-by-file three-way merge against that recorded version. It picks a fast path, a guided merge or an escape hatch depending on how many files need judgement.
- **Release:** the repeatable process for cutting the tagged releases that both of the above consume.

There is no uninstall command.

## Why it matters
The README's quick start, and a clean first run for every new user, depend on the install. Releases are the open-source milestone in the [delivery intent](/project-context/10k/intent.md), and nothing produces them yet.

## What's here
- [Origin: install, uninstall, update](origins/install-uninstall-update/shaping-content/install-and-upgrade-direction.md): Zac's calls on install, uninstall, upgrade, releases and the checks both scripts run
  - [Brief](origins/install-uninstall-update/ideas-content/brief.md) and [install route landscape](origins/install-uninstall-update/ideas-content/install-route.md)
  - [Copy-in bake-off](origins/install-uninstall-update/shaping-content/copy-in-spike.md): degit vs giget
  - [Install script spike](origins/install-uninstall-update/shaping-content/install-script-spike.md): pinning, the settings merge and the version record
  - [Upgrade merge spike](origins/install-uninstall-update/shaping-content/upgrade-merge-spike.md): the three-way merge on an improved instance

## Related
- [ADR 0002: zero-dependency library script](/project-context/10k/technical/adrs/0002-zero-dependency-library-script.md)
- [ADR 0003: Per-user config overlay](/project-context/10k/technical/adrs/0003-per-user-config-overlay.md)
- [Repo README](/project-context/shaping/repo-readme/README.md): its quick start depends on this epic
