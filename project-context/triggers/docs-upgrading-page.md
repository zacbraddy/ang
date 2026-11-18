---
title: Add the Upgrading page to the docs site
shortDescription: Once the install epic's upgrade-ang skill is done, scope a Start here page that explains Ang's agent-run upgrade
tags: [documentation, distribution]
---
# Add the Upgrading page to the docs site

## Summary
An agent working in the documentation stream adds an Upgrading page to the site's Start here group. It either widens story 03 (Start here pages) or slices a new story if the page is too big for 03. The page is written once the upgrade it describes has shipped on the install stream.

## Why now, not sooner or later
- **Not sooner:** the page describes the upgrade engine and the `upgrade-ang` skill (install stories 05 and 06). While those are draft, their route thresholds and steps can still change.
- **Not later:** without this page, the site goes live with no account of upgrading. Users would then hit the four routes and the never-commit finish cold.
- **Missing work:** the documentation epic's known for this page records the gap in the current page map.

## What to do
1. Re-read the source on the install branch: `git show <branch>:project-context/execution/install-upgrade-release/upgrade-routes.md`. Use `main` if the install epic has merged; otherwise use `stream/install-uninstall-update`. Its "What the user docs should cover" section is the brief.
2. Check every fact against the shipped `upgrade-ang` skill and the engine: route names, conflict thresholds, the clean-tree start, the never-commit finish, and `version.json`. The shipped files win over the routes doc.
3. Add the page to [information-architecture.md](/project-context/execution/documentation/information-architecture.md) as a Start here row, next to Uninstalling.
4. Decide where the work goes:
   - If story 03 is still `draft` or `ready`, add the page to its Outcome and scope.
   - Otherwise, add a new story with `dependsOn: [02]`.
5. Frame "why it isn't deterministic" as Ang helping in a hard situation, not as a caveat (per the routes doc).

## Signs it's already handled
- `grep -n -i upgrad project-context/execution/documentation/information-architecture.md` finds a Start here row.
- `docs/src/content/docs/start-here/` has an upgrading page.

## Related
- [Story 03: Start here pages](/project-context/execution/documentation/stories/03-start-here-pages.md)
- [Information architecture](/project-context/execution/documentation/information-architecture.md)
