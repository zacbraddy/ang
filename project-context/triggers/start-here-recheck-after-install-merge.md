---
title: Re-check the Start here pages against the merged install files
shortDescription: Once the install epic is on main, re-read the docs site's install, Windows, upgrade and uninstall facts against the shipped files there
tags: [documentation, distribution]
---
# Re-check the Start here pages against the merged install files

## Summary
An agent, in a fresh session, re-reads every install, native Windows, upgrade and uninstall fact on the docs site's Start here pages against the shipped files on `main`, and fixes the pages where they've drifted. It's for the moment the install epic (`install-upgrade-release`) is complete on `main`.

## Why now, not sooner or later
Documentation story 03 wrote the pages from the install branch at commit `7541df5`, before that epic finished. Its later stories can still change things: `size.mjs` says its route thresholds get tuned after the rc.2 rehearsal (install story 13), and `install.sh`, `upgrade-ang` or the shipped tree may move too. The epic merged to `main` mid-flight so its release could be built and smoke-tested there, and it finishes on `main`. Checking before it's done would check a moving target. Leaving it long after means readers follow stale steps on the live site. The condition fires once its retro has archived it on `main`.

## What to do
1. Read the shipped files on `main`: `install.sh`, `src/.claude/skills/upgrade-ang/SKILL.md`, `src/.claude/scripts/ang/upgrade/size.mjs`, `src/.claude/scripts/ang/commands/{settings,version}.mjs`, `src/.claude/settings.json`, and the shipped tree (`git ls-tree -r --name-only main src`). Then the `10k/` docs the install epic's retro wrote for user-facing wording: prerequisites and platforms in `10k/product/what-ang-is.md#what-you-need`, the install one-liner and checks in `10k/technical/adrs/0005-install-by-copy-in-from-releases.md`, and the upgrade explainer (the four routes, never commits, why it isn't deterministic) in `10k/technical/adrs/0006-upgrade-by-three-way-merge.md`.
2. Check them against `docs/src/content/docs/start-here/`:
   - `quick-start.md`: prerequisites, the list of folders the install copies into (drop `docs/procedures/`, which no longer ships), the one-liner and tag pinning, what the install does and prints, the WSL route, and the native Windows steps (commands and flags).
   - `upgrading.md`: the steps, the 4 routes and their thresholds, the finish, and the discard command.
   - `uninstalling.md`: the file list (skills, agents, rules, output styles, scripts; drop `docs/procedures/`, which no longer ships) and Ang's entries in `settings.json`.
   - `alongside-your-framework.md`: the clash rules from `check_collisions`.
3. Fix any drift on the pages, run `npm run build` in `docs/`, and leave the changes unstaged for Zac.

## Signs it's already handled
- `git log main -- docs/src/content/docs/start-here/` shows a commit after the install epic's retro that touches these facts.
- The thresholds in `upgrading.md` match `AGENT_RESOLVES_UP_TO` and `WARN_FROM` in `size.mjs` on `main`, and the skill list in `uninstalling.md` matches `git ls-tree --name-only main src/.claude/skills/`.

## Related
- [Story 03: Start here pages](/project-context/execution/documentation/stories/03-start-here-pages.md)
- [Docs site post-merge smoke check](docs-site-post-merge-smoke-check.md)
