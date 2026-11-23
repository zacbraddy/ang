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
- **Source:** cut in shaping on 2026-11-16, not from a raw file. Zac's call after the upgrade merge spike (in git history), which found every local edit without a changelog.

### Partial upgrades
The upgrade skill's guided-with-warning route would offer to take only part of a release: the skill groups the release into changes using the release notes, upgrade guide and diff, and the user picks which to take. `.claude/ang/version.json` would then need a per-file base for every taken file, or the next upgrade merges against the wrong base, and untaken files either never update or show false conflicts. Today upgrades are all or nothing. Guided with warning says how big the upgrade is and the user decides whether to go ahead, so every upgrade ends in a stable state.
- **Wake condition:** users ask to take part of a release, because a full upgrade is too costly with their local improvements.
- **Source:** cut in planning on 2026-11-17, not from a raw file. Zac's call: a feature nobody has asked for, and its version-record design was contortion for a "hat on a hat". See [ADR 0006](/project-context/10k/technical/adrs/0006-upgrade-by-three-way-merge.md).

### Gapped-version upgrade rehearsals
Each release would also rehearse upgrades that skip releases, starting from older tags of the upgrade fixture repo: for example, from the last major through every minor and patch since. That would show users can upgrade across several non-breaking versions in one go. Today a release rehearses only the upgrade from the previous release. While every release is a major, every upgrade is breaking anyway, so the only path to assure is the one from the previous major. Users who jump several majors upgrade one major at a time, naming each release tag as the target.
- **Wake condition:** work starts on a project or task meant to ship as Ang's first minor or patch release. Adopting semver sets the expectation that upgrades across several non-breaking versions work.
- **Source:** parked in planning on 2026-11-17, not from a raw file. Zac's call. See [ADR 0007](/project-context/10k/technical/adrs/0007-how-releases-are-cut.md). The fixture is tagged at every release, so the history to test from builds up anyway.

### Undeclared moves on no-record upgrades
With no version record, `upgrade plan` runs with `--base none` and can't see a file that upstream moved without a Moves entry. The old path isn't in the target tree, so it's neither in the plan nor removed: the user's edited copy stays at the old path beside the new file, and their edits never reach the new path. With a base, the same move shows up as a `conflict-delete` that `/upgrade-ang` checks for undeclared moves. A fix would have the plan list local files that sit where shipped files used to be, or have the skill look for them on the no-record route.
- **Wake condition:** a no-record upgrade (a pre-version-record install) leaves an edited file stranded at its old path, or story 13's rehearsal hits it.
- **Source:** found in execution on 2026-11-18, not from a raw file. The dry run in story 06 of the install-upgrade-release epic, in git history (As built, run 2).

### Shell-free hook commands
Ang's hooks in `settings.json` would use Claude Code's exec form (`"command": "node"` with an `args` list, where `${CLAUDE_PROJECT_DIR}` is substituted as a plain string) instead of a shell command line. Today each hook is `node "$CLAUDE_PROJECT_DIR/…"`, which needs a shell to expand the variable. On native Windows Claude Code runs it in Git Bash, or in PowerShell when Git for Windows is missing, where it fails. The exec form runs no shell, so hooks would work either way. Native Windows is untested and best effort ([ADR 0005](/project-context/10k/technical/adrs/0005-install-by-copy-in-from-releases.md)), so it isn't worth changing Ang's shipped settings yet. The change also goes through the settings merge on every upgrade.
- **Wake condition:** a native Windows user reports a hook failure, or native Windows moves from best effort to supported.
- **Source:** parked in execution on 2026-11-17, not from a raw file. Zac's call during story 03 of the install-upgrade-release epic (in git history), from Claude Code's hooks docs ("Exec form and shell form").

### Route threshold tuning
The upgrade's route thresholds would be retuned: `AGENT_RESOLVES_UP_TO` and `WARN_FROM` in `src/.claude/scripts/ang/upgrade/size.mjs`, with the boundary cases in `size.test.mjs`, the route table in [ADR 0006](/project-context/10k/technical/adrs/0006-upgrade-by-three-way-merge.md) to match. Today they're 5 and 12, resting on the upgrade merge spike's two runs. The rc.2 rehearsal barely touches `src/`, so it takes the fast route and has no conflicts to learn from. The only data that would justify a change is real users' upgrades.
- **Wake condition:** an Ang user reports an upgrade that took the wrong route, e.g. guided for trivial conflicts, or agent-resolved when it should have asked.
- **Source:** parked in execution on 2026-11-20, not from a raw file. Zac's call while writing story 13 of the install-upgrade-release epic (in git history).

### Custom domain for the docs site
Move the Ang docs site from `zacbraddy.github.io/ang/` to a custom domain on GitHub Pages (about $10–12 a year, plus DNS and a TXT record that must stay in place). The move means changing Starlight's `site` and `base` config and sweeping any links that hard-code the `/ang/` prefix.
- **Wake condition:** Ang has outside users or contributors finding it through the docs, or We Right Code wants a branded URL to market it under.
- **Source:** parked in planning on 2026-11-17, not from a raw file. See [Docs site hosting](https://github.com/zacbraddy/ang/blob/cd09b979853fdb75db2ac7f202ec86be1aff96c6/project-context/execution/documentation/origins/docs-website/shaping-content/hosting.md).

### Shared base ang.json for teams
Let a company keep one base `ang.json` that many repos inherit from, for example with an `extends` key the way `tsconfig.json` does. JSON has no inheritance of its own, so Ang's config loader would have to read the key and merge the files. Today it rejects any key that isn't a feature. The docs site was going to document this as a free pattern until that came to light.
- **Wake condition:** an organisation runs Ang across several repos and wants one place to set their shared `ang.json` keys.
- **Source:** parked in planning on 2026-11-17, not from a raw file. See [documentation epic](https://github.com/zacbraddy/ang/blob/cd09b979853fdb75db2ac7f202ec86be1aff96c6/project-context/execution/documentation/README.md) (k23, k24) and [ADR 0003](/project-context/10k/technical/adrs/0003-per-user-config-overlay.md).

## Related
- [Delivery intent](/project-context/10k/intent.md)
- [ADR 0003: Per-user config overlay](/project-context/10k/technical/adrs/0003-per-user-config-overlay.md)
