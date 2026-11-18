---
title: README whistle-stop rewrite
shortDescription: The root README becomes the whistle-stop tour, covering 4 concepts, 13 commands, the funnel table, install and a link to the site
tags: [documentation, open-source, brand-voice]
status: draft
owner: agent
dependsOn: []
---
# README whistle-stop rewrite

## Summary
The first release deliverable. It ships on its own, ahead of the site (d1). A reader can install Ang and run one full funnel loop from the README alone (d2). Everything deeper is left to the site.

## Outcome
The root `README.md` holds the sections in [C4 code: README sections](../c4/4-code.md#readme-sections): the one-liner, the quick start (install one-liner, Node 26+, the WSL (Windows Subsystem for Linux) note, then `/bootstrap-repo` and `/tailor-ang`), the 4 concepts, the funnel table (stage, question, command), bending Ang with an "and a few more" pointer, the link to `https://zacbraddy.github.io/ang/`, and credits with the MIT licence. It is written in Zac's voice, trimmed.

## Rough scope
- Content from the [content cut](../origins/repo-readme/shaping-content/content-cut.md) (k3). Install facts are copied from the install epic's shipped files at write time (plan Risks).
- The site link goes in from day one, even though it stays dead until story 02 deploys (plan Sequencing).
- No status badges. Open-source-hygiene adds them with its CI (d12).
- Links to CONTRIBUTING or the code of conduct only if they exist when this ships (plan Out of scope).

## Related
- [Plan: Scope and Sequencing](../plan.md)
- [README brief](../origins/repo-readme/shaping-content/brief.md)
- [Voice and attribution](/project-context/10k/marketing/voice-and-attribution.md)
