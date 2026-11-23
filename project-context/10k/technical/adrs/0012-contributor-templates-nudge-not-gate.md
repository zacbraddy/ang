---
title: "ADR 0012: Contributor templates nudge, they don't gate"
shortDescription: Ang's PR and issue templates are rubber-ducking prompts toward its first principles; blank issues are off, chat goes to Discussions, security reports go private, and no setting blocks a PR
tags: [open-source]
---
# ADR 0012: Contributor templates nudge, they don't gate

## Summary
Ang has PR (pull request) and issue templates, but they ask rather than block. They are rubber-ducking prompts: talking yourself through a change before you raise it. Each asks how the change serves every Ang user and why it can't live in your own Ang instead. Blank issues are off, chat goes to GitHub Discussions, and security reports go through private vulnerability reporting. No repo setting stops a PR from being opened. Drawn from the open-source-hygiene epic as built on 2026-11-23.

## Context
Zac has no open-source maintainer time, and agent-written PRs are common. A survey of 17 small or whimsical repos (2026-11-16) found that templates don't measurably stop low-effort PRs, and that closed contribution policies tend to soften over time. Ang's first principles already say a feature idea's default answer is "cool idea, go build it". The templates exist so raisers reach that answer themselves.

## Decision
- **Files:** `CONTRIBUTING.md` (about 10 lines, in Ang's voice: forking is the expected route, small fixes are welcome), `.github/PULL_REQUEST_TEMPLATE.md`, and `.github/ISSUE_TEMPLATE/` with the open-conversation template first, then feature requests. All are Markdown templates, not YAML forms.
- **PR template:** asks which first principle the change serves, why it isn't a local `/raise-workflow-improvement` or `/tailor-ang` change, and who besides the raiser benefits. Agents name themselves and say whether a human reviewed the diff.
- **Links in templates are absolute** (`blob/main`), because relative links don't resolve in pre-filled issue and PR bodies.
- **`config.yml`:** blank issues off, with a contact link to Discussions.
- **Repo settings:** Discussions on, private vulnerability reporting on (so there is no SECURITY.md), wiki off, projects off, delete-branch-on-merge off.
- **Nothing blocks:** no collaborators-only limits, PR caps, auto-close bots, branch protection or rulesets. Bad PRs still arriving is an accepted cost.
- **Not kept:** a CONTRIBUTORS file, account-level `zacbraddy/.github` defaults, and a code of conduct, which is [parked](/project-context/ideas/parked.md) until a community forms.

## Consequences
- Templates are worded in Ang's voice, and Zac signs off any change to that voice.
- If agent-written spam overwhelms Zac, the fallback is GitHub's collaborators-only PR and issue setting. That would be a new decision, not a change to this one.

## Standing
2026-11-23. Built on the `stream/open-source-hygiene` branch, and `gh api` read back every setting. GitHub's issue chooser and pre-filled PR are checked once the branch merges to `main`.

## Related
| Doc | Why |
|---|---|
| [First principles](/project-context/10k/product/first-principles.md) | What the templates nudge toward |
| [Business constraints](/project-context/10k/business-constraints.md) | The maintenance stance this fits |
| [ADR 0011: Dev-only quality tooling and advisory CI](/project-context/10k/technical/adrs/0011-dev-only-quality-tooling-advisory-ci.md) | CI follows the same advisory stance |
