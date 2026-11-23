---
title: Contributor kit
shortDescription: CONTRIBUTING, PR and issue templates as rubber-ducking nudges, an issue chooser routing chat to Discussions, and a README fork-it section
tags: [open-source, brand-voice]
status: ready
owner: agent
dependsOn: [03, 04]
---
# Contributor kit

## Summary
Writes the repo-facing half of the epic in Ang's voice. The templates ask contributors how a change serves every Ang user, and nothing blocks. The agent drafts and Zac signs off the wording.

## Outcome
GitHub's New issue page offers the open-conversation and feature-request templates plus a Discussions link, with no blank issue. The README has a "fork it" section pointing to CONTRIBUTING and the templates.

## Rough scope
- `CONTRIBUTING.md` (about 10 lines).
- `.github/PULL_REQUEST_TEMPLATE.md`, shaped by [what the templates are for](../origins/open-source-hygiene/shaping-content/pr-template-purpose.md).
- `.github/ISSUE_TEMPLATE/1-open-conversation.md`, `2-feature-request.md`, and `config.yml` with `blank_issues_enabled: false` and a contact link to Discussions.
- README "fork it" section.

## Done when
- The six files exist and match the shapes below, and Zac has signed off their wording at review.
- After merge to `main`, `https://github.com/zacbraddy/ang/issues/new/choose` lists "open a conversation" first, then the feature request, then a Discussions link, and has no "Blank issue" option.
- After merge, opening a PR against `zacbraddy/ang` pre-fills the PR template.
- The README's fork-it section renders on GitHub with working links to `CONTRIBUTING.md`, the templates and Discussions.
- `npm run format:check` (it covers `config.yml`), `npm run lint`, `npm test` and `ang-context-manager.mjs library validate` are clean.

## Acceptance criteria
- Given someone on the New issue page, when they look at the options, then the open-conversation template comes first, the feature request second, a Discussions link third, and there is no blank issue.
- Given someone who just wants to chat or ask a question, when they reach the chooser, then the Discussions link is labelled for exactly that.
- Given someone picks the feature request, when the form opens, then it asks which first principle the change serves, why it can't live in their own Ang through `/raise-workflow-improvement` or `/tailor-ang`, and who besides them benefits.
- Given someone opens a PR, when the template pre-fills, then it opens with a one-line base-repository check, then asks the same three questions, then asks about agent involvement.
- Given an agent wrote the PR, when the template is filled in, then it names the agent, says what the human asked for, and says whether a human reviewed the diff.
- Given a contributor ignores or deletes every prompt, when they submit, then nothing blocks it (templates nudge, d12).
- Given someone reads `CONTRIBUTING.md`, when they finish, then they know Ang is Zac's and forking is the expected route, small fixes are welcome with no promises, which template to use for what, and that `npm ci` installs a pre-commit hook and CI reports on PRs without blocking.
- Given someone reads the README, when they reach the fork-it section, then it sends them to their own `/raise-workflow-improvement` first and to `CONTRIBUTING.md` for upstream changes.

## Test plan
- **Unit, integration, E2E:** none. These are Markdown and YAML community files (`engineering-defaults.md`: config, nothing of ours to assert).
- **Manual checks:** after merge, load the issue chooser and open a draft PR (then close it) to see the template; click each README fork-it link on GitHub.
- **Won't test:** GitHub's template rendering, YAML schema, link targets beyond one click-through.

## Implementation notes
- **Read first:** [voice lessons](/project-context/execution/documentation/voice-lessons.md) and the signed-off `README.md`, especially "Bending Ang". Zac is "I", the reader is "you". One emoji on the left of every heading with no variation selector. Use each joke once. Give a "so that" for each prompt so it reads as rubber-ducking, not a form to get through.
- **Prompts' substance** is fixed by [what the templates are for](../origins/open-source-hygiene/shaping-content/pr-template-purpose.md) and [first principles](/project-context/10k/product/first-principles.md), especially 4: "Get your own bastard framework: Ang is mine". The wording is the agent's draft for Zac to sign off.
- **`CONTRIBUTING.md`** (root, about 10 lines): Ang is mine; fork it, and bend your own copy with `/raise-workflow-improvement` and `/improve-workflow`; small fixes are welcome, with no promises; open a conversation (or Discussions) before a feature request; the PR template's questions are there to help you make the case. Then the dev loop: `npm ci` installs the pre-commit hook (lint-staged auto-fixes), and `npm test`, `npm run lint` and `npm run format:check` are what CI runs, advisory. Story 03 deferred the hook and CI mention to here.
- **`.github/PULL_REQUEST_TEMPLATE.md`:** prompts as headings with HTML-comment hints, so an unfilled hint doesn't render. Order:
  1. A one-line base-repository check for forkers: is this PR meant for `zacbraddy/ang` and not your own fork? (kickstart.nvim's idea, our wording).
  2. What changes, and which first principle it serves.
  3. Why it can't live in your own Ang as a `/raise-workflow-improvement` or `/tailor-ang` change.
  4. Who benefits: every current and future Ang user, not only your setup.
  5. If an agent filled this in: which agent, what the human asked for, and whether a human reviewed the diff. Borrow lightly from superpowers.
- **`.github/ISSUE_TEMPLATE/1-open-conversation.md`:** front matter `name`, `about`, an empty `title`; no labels, since none exist. The body is a light prompt: what's on your mind, and what you've tried in your own Ang. It leads because an issue usually opens a conversation, not a demand.
- **`.github/ISSUE_TEMPLATE/2-feature-request.md`:** the same front matter. The body carries PR prompts 2–4 (principle, why not local, who benefits).
- **`.github/ISSUE_TEMPLATE/config.yml`:** `blank_issues_enabled: false`, and one `contact_links` entry with `name`, `url: https://github.com/zacbraddy/ang/discussions` and an `about` aimed at questions and chat. Discussions has been on since story 04. Link the Discussions root, not a category, so a renamed category can't break it.
- **README fork-it section:** a new `##` heading with a left emoji, placed straight after "🪄 Bending Ang" and before "🫶 So much more...". Keep it short (2–4 sentences), match the section spacing (`<br />` lines), and don't repeat Bending Ang's pitch. It says: bend your own first; if you think it's right for everyone, read `CONTRIBUTING.md`, which explains the templates; for chat, use Discussions. Links: `CONTRIBUTING.md` relative, Discussions absolute.
- **Formatting:** `.prettierignore` skips `*.md`, so only `config.yml` goes through Prettier (the hook and `format:check`).
- **Edge cases:** GitHub reads issue templates, `config.yml` and the PR template from the default branch, so the chooser and the pre-filled PR can only be seen after merge. Before that, check the files against GitHub's documented front matter and `config.yml` keys.
- **Out of scope:** a code of conduct (cut, and parked in [parked work](/project-context/ideas/parked.md#code-of-conduct-for-the-ang-repo)); SECURITY.md, labels and YAML issue forms (C4 names `.md` templates); branch protection and auto-close bots; the `src/.claude` prose edits (story 06).

## Related
- [Plan: templates nudge, settings stay open](../plan.md#templates-nudge-settings-stay-open)
- [C4 code: contributor kit files](../c4/4-code.md#contributor-kit-files-story-5)
- [Hygiene survey](../origins/open-source-hygiene/ideas-content/hygiene-survey.md)
- [First principles](/project-context/10k/product/first-principles.md)
- [Voice lessons](/project-context/execution/documentation/voice-lessons.md)
