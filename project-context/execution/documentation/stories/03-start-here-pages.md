---
title: Start here pages
shortDescription: Quick start, Trying Ang alongside your framework, Your first loop, Upgrading and Uninstalling pages are live on the site
tags: [documentation, distribution]
status: draft
owner: agent
dependsOn: [02]
---
# Start here pages

## Summary
The "get it running" group: someone landing from the README or the home page goes from nothing to Ang installed and one loop run.

## Outcome
`start-here/quick-start`, `start-here/alongside-your-framework`, `start-here/first-loop`, `start-here/upgrading` and `start-here/uninstalling` are live. Quick start covers the install line, prerequisites (Node 26+), platforms, Windows through WSL (Windows Subsystem for Linux), the best-effort native Windows manual install as its own section, `/bootstrap-repo`, `/tailor-ang`, and one line each on the two starting points. Trying Ang alongside your framework shows a reader on BMAD, Spec Kit or similar how to trial Ang on a branch with streams off, then either back out or have Ang run the migration onto itself (d13). Your first loop runs the funnel skills end to end once. Upgrading explains `/upgrade-ang`: the clean-tree start, the four routes in the user's terms, the never-commit finish with how to review or drop the result, why the upgrade is agent-run rather than deterministic, and committing `.claude/ang/version.json` (k25). Uninstalling removes Ang by hand, which doubles as the way out of a trial.

## Rough scope
- Sources per the [page map](../information-architecture.md#page-map): Start here rows. Check the native Windows steps and the install facts against the shipped files at write time (k20, plan Risks).
- The alongside page's claims come from Zac's own migrations (ET 1, evidence tier 1: a primary source) and from `install.sh`: install stops if `project-context/` or a same-named skill exists, so say what to rename first. Don't promise coexistence details the files don't show.
- The Upgrading page's brief is the [upgrade routes](https://github.com/zacbraddy/ang/blob/stream/install-uninstall-update/project-context/execution/install-upgrade-release/upgrade-routes.md) doc's "What the user docs should cover" (on `main` once the install epic merges). The shipped `upgrade-ang` skill and `upgrade/size.mjs` win over it: route names, thresholds (agent-resolved up to 5 conflicted files, guided with warning from 12) and steps. Frame the agent-run upgrade as Ang helping in a hard situation, not as a caveat.
- No uninstall command exists. The page lists what to remove from the shipped tree; it doesn't add one.
- Link to the concept and command pages by their planned slugs ([C4 code: Content pages](../c4/4-code.md#content-pages)).

## Related
- [Voice lessons from the README](../voice-lessons.md)
- [Plan: Sequencing step 3](../plan.md)
- [What Ang is](/project-context/10k/product/what-ang-is.md)
