---
title: Contributor kit
shortDescription: CONTRIBUTING, code of conduct, PR and issue templates as rubber-ducking nudges, an issue chooser routing chat to Discussions, and a README fork-it section
tags: [open-source, brand-voice]
status: draft
owner: agent
dependsOn: [03, 04]
---
# Contributor kit

## Summary
Writes the repo-facing half of the epic in Ang's voice. The templates ask contributors how a change serves every Ang user; nothing blocks. The agent drafts and Zac signs off the wording.

## Outcome
GitHub's New issue page offers the open-conversation and feature-request templates plus a Discussions link, with no blank issue. The README has a "fork it" section pointing to CONTRIBUTING and the templates.

## Rough scope
- `CONTRIBUTING.md` (about 10 lines) and `CODE_OF_CONDUCT.md` (about 3 lines).
- `.github/PULL_REQUEST_TEMPLATE.md`, shaped by [what the templates are for](../origins/open-source-hygiene/shaping-content/pr-template-purpose.md).
- `.github/ISSUE_TEMPLATE/1-open-conversation.md`, `2-feature-request.md`, and `config.yml` with `blank_issues_enabled: false` and a contact link to Discussions.
- README "fork it" section.

## Implementation notes
The README edit builds on the documentation stream's README rewrite. Start once it is on `main`, or rebase onto it.

## Related
- [Plan: templates nudge, settings stay open](../plan.md#templates-nudge-settings-stay-open)
- [C4 code: contributor kit files](../c4/4-code.md#contributor-kit-files-story-5)
- [Hygiene survey](../origins/open-source-hygiene/ideas-content/hygiene-survey.md)
- [First principles](/project-context/10k/product/first-principles.md)
