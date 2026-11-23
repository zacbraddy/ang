---
title: "ADR 0005: Install by copy-in from published releases"
shortDescription: Ang installs with a stamped install.sh release asset that copies src/ in with pinned giget, only ever onto a published release, with no plugin and no uninstall command
tags: [distribution, tech-stack]
---
# ADR 0005: Install by copy-in from published releases

## Summary
Ang is installed with one piped line, `curl -fsSL https://github.com/zacbraddy/ang/releases/latest/download/install.sh | sh`. That `install.sh` is a GitHub Release asset with the release's tag and SHA stamped in by CI. It checks prerequisites, copies `src/` into the repo with `npx giget@3.3.1`, merges `.claude/settings.json` (the user's values win; see [ADR 0006](/project-context/10k/technical/adrs/0006-upgrade-by-three-way-merge.md)) and records the release in `.claude/ang/version.json`. Installs only ever land on a published release. There is no uninstall command. Drawn from `install.sh` and `.github/workflows/release.yml` as of 2026-11-23.

## Context
Ang ships rules, permissions and hooks, and users are expected to edit its skills and conventions. A Claude Code plugin can't ship rules or permissions, namespaces skills and wipes local edits on update, so copy-in fits and a plugin doesn't. A piped script can't see its own URL, so it can't work out which version it is; the version has to be stamped in. Upgrades need a known merge base, so every install has to sit on a release that can be named.

## Decision
- **Copy-in with giget,** pinned and run through npx. Node is already required, and giget does the GitHub tarball fetch that would otherwise be hand-rolled with curl and tar.
- **`install.sh` is a release asset, stamped with `TAG` and `SHA` by the release job.** A default install makes no GitHub API call. The repo's own copy is unstamped and stops without a tag argument, pointing at the one-liner. A tag override resolves through `GET /releases/tags/{tag}`, which also checks that the tag is a published release.
- **Published releases only:** never a bare SHA or branch. The SHA is still recorded beside the tag as the upgrade's merge base.
- **Checks before writing anything,** each stopping with a plain message saying what's wrong and how to fix it: Node 26+ and npx; inside a git repo, at its root, with a clean tree; Ang not already installed; no collision with any path the copy would overwrite; `settings.json` parses; the ref resolves. No OS, disk or permission checks.
- **The first backup of the user's settings is kept** as `.claude/settings.json.pre-ang`.
- **Platforms:** macOS, Linux, and Windows through WSL (Windows Subsystem for Linux). `install.sh` stops under Git Bash, MSYS or Cygwin. Native Windows is untested best effort with the manual install and Git for Windows.
- **No uninstall command.** Removing a vanilla install is deleting a few folders, and local workflow improvements make automating it unreliable.

## Consequences
- The README one-liner always installs the latest published release, and a broken `install.sh` can only be fixed by a new release (immutable releases; see [ADR 0007](/project-context/10k/technical/adrs/0007-how-releases-are-cut.md)).
- Installing needs Node 26+, npx and git. The library script itself stays dependency-free ([ADR 0002](/project-context/10k/technical/adrs/0002-zero-dependency-library-script.md)).
- `install.sh` lives at the repo root, outside `src/`, so the copy-in never ships it. Gitignored `*.local.*` files under `src/` never ship either, because giget fetches from git, never from disk.
- Revisit the plugin route if Claude Code plugins gain rules and permissions.

## Standing
2026-11-23. Built and released: `install.sh` and its tests (`scripts/install.test.mjs`); the release job stamps and smoke-installs it. `v1.0.0-rc.1` and `v1.0.0-rc.2` were installed through it.

## Related
| Doc | Why |
|---|---|
| [ADR 0006: Upgrade by three-way merge](/project-context/10k/technical/adrs/0006-upgrade-by-three-way-merge.md) | What the version record is for |
| [ADR 0007: How releases are cut](/project-context/10k/technical/adrs/0007-how-releases-are-cut.md) | Where the stamped asset comes from |
| [Project structure](/project-context/10k/technical/project-structure.md) | Where `install.sh` lives |
