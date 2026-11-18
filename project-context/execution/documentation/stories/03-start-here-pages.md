---
title: Start here pages
shortDescription: Quick start, Your first loop and Uninstalling pages are live on the site
tags: [documentation, distribution]
status: draft
owner: agent
dependsOn: [02]
---
# Start here pages

## Summary
The "get it running" group: someone landing from the README or the home page goes from nothing to Ang installed and one loop run.

## Outcome
`start-here/quick-start`, `start-here/first-loop` and `start-here/uninstalling` are live. Quick start covers the install line, prerequisites (Node 26+), platforms, Windows through WSL (Windows Subsystem for Linux), the best-effort native Windows manual install as its own section, `/bootstrap-repo`, `/tailor-ang`, and one line each on the two starting points. Your first loop runs the funnel skills end to end once. Uninstalling removes Ang by hand.

## Rough scope
- Sources per the [page map](../information-architecture.md#page-map): Start here rows. Check the native Windows steps and the install facts against the shipped files at write time (k20, plan Risks).
- No uninstall command exists. The page lists what to remove from the shipped tree; it doesn't add one.
- Link to the concept and command pages by their planned slugs ([C4 code: Content pages](../c4/4-code.md#content-pages)).

## Related
- [Plan: Sequencing step 3](../plan.md)
- [What Ang is](/project-context/10k/product/what-ang-is.md)
