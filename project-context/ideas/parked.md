---
title: Parked work
shortDescription: Doable threads with no value yet, each with the wake condition that would make it worth doing
tags: [distribution]
---
# Parked work

## Summary
Threads we could do but that are worth nothing until something specific happens. `/refine-ideas` and `/retro` mention any entry whose wake condition looks to have come true.

### Per-user intent garnish
A gitignored, per-user addition to the project's delivery intent. Agents read it after `10k/intent.md`, and it can only add to or narrow the project intent, never override it. It must live outside `10k/` (for example in `.claude/`), so the index doesn't churn between teammates. `/retro` might offer to promote recurring garnishes into the project intent.
- **Wake condition:** a team (more than one person) runs Ang in a single repo and wants personal delivery preferences alongside a shared intent.
- **Source:** parked in shaping on 2026-11-16, not from a raw file. See [Tailoring step and per-user config](https://github.com/zacbraddy/ang/blob/e34550491f625b84a6013a30e16438245bc62468/project-context/execution/generic-defaults/origins/generic-personal-defaults/shaping-content/tailoring.md) (at `e345504`, the last commit before the generic-defaults retro archived it).

### Team-controlled local overrides
A `localOverrides` list in `ang.json` (e.g. `["intent"]`) that lets the team allow each person to override project-wide keys in their gitignored `ang.local.json`. Today the loader merges only a fixed set of personal keys (`host`, `pilot`) and `validate` warns about any other key it drops. This would make that set something the team can configure, without forking Ang.
- **Wake condition:** a user asks to override a project-wide key (`intent`, `streams` or a future one) for themselves only.
- **Source:** parked in planning on 2026-11-16, not from a raw file. See [Config move blast radius](https://github.com/zacbraddy/ang/blob/e34550491f625b84a6013a30e16438245bc62468/project-context/execution/generic-defaults/config-move.md) (at `e345504`) and [ADR 0003](/project-context/10k/technical/adrs/0003-per-user-config-overlay.md).

### Local changelog of workflow improvements
`/raise-workflow-improvement` and `/improve-workflow` would keep a local version and changelog of the improvements made in an instance, so an upgrading agent can see why each local change was made. The upgrade skill already gets *what* changed by diffing the instance against the release recorded in `.claude/ang/version.json`. Only the *why* is missing, and in a guided merge the user is there to supply it.
- **Wake condition:** guided merges keep stalling because nobody remembers why a local change was made.
- **Source:** cut in shaping on 2026-11-16, not from a raw file. Zac's call after the [upgrade merge spike](/project-context/execution/install-upgrade-release/origins/install-uninstall-update/shaping-content/upgrade-merge-spike.md), which found every local edit without a changelog.

### Partial upgrades
The upgrade skill's escape hatch would offer to take only part of a release: the skill groups the release into changes using the release notes, upgrade guide and diff, and the user picks which to take. `.claude/ang/version.json` would then need a per-file base for every taken file, or the next upgrade merges against the wrong base, and untaken files either never update or show false conflicts. Today upgrades are all or nothing. The escape hatch warns that a big upgrade will take a while and the user decides whether to go ahead, so every upgrade ends in a stable state.
- **Wake condition:** users ask to take part of a release, because a full upgrade is too costly with their local improvements.
- **Source:** cut in planning on 2026-11-17, not from a raw file. Zac's call: a feature nobody has asked for, and its version-record design was contortion for a "hat on a hat". See the [install, upgrade and release epic](/project-context/execution/install-upgrade-release/README.md).

### Gapped-version upgrade rehearsals
Each release would also rehearse upgrades that skip releases, starting from older tags of the upgrade fixture repo: for example, from the last major through every minor and patch since. That would show users can upgrade across several non-breaking versions in one go. Today a release rehearses only the upgrade from the previous release. While every release is a major, every upgrade is breaking anyway, so the only path to assure is the one from the previous major. Users who jump several majors upgrade one major at a time, naming each release tag as the target.
- **Wake condition:** work starts on a project or task meant to ship as Ang's first minor or patch release. Adopting semver sets the expectation that upgrades across several non-breaking versions work.
- **Source:** parked in planning on 2026-11-17, not from a raw file. Zac's call. See the [release process proposal](/project-context/execution/install-upgrade-release/release-process-proposal.md). The fixture is tagged at every release, so the history to test from builds up anyway.

### Shell-free hook commands
Ang's hooks in `settings.json` would use Claude Code's exec form (`"command": "node"` with an `args` list, where `${CLAUDE_PROJECT_DIR}` is substituted as a plain string) instead of a shell command line. Today each hook is `node "$CLAUDE_PROJECT_DIR/…"`, which needs a shell to expand the variable. On native Windows Claude Code runs it in Git Bash, or in PowerShell when Git for Windows is missing, where it fails. The exec form runs no shell, so hooks would work either way. Native Windows is untested and best effort (install-upgrade-release d37), so it isn't worth changing Ang's shipped settings yet. The change also goes through the settings merge on every upgrade.
- **Wake condition:** a native Windows user reports a hook failure, or native Windows moves from best effort to supported.
- **Source:** parked in execution on 2026-11-17, not from a raw file. Zac's call during [story 03: install.sh](/project-context/execution/install-upgrade-release/stories/03-install-script.md), from Claude Code's hooks docs ("Exec form and shell form").

## Related
- [Delivery intent](/project-context/10k/intent.md)
- [ADR 0003: Per-user config overlay](/project-context/10k/technical/adrs/0003-per-user-config-overlay.md)
