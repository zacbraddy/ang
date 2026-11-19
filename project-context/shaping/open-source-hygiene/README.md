---
title: Open-source hygiene, Ang-sized
shortDescription: Which open-source standards Ang should adopt, adapt or drop, including whether the repo needs quality tooling
tags: [open-source]
---
# Open-source hygiene, Ang-sized

## Summary
Zac has never properly released a repo as open source. Research small, whimsical open-source projects to see which accepted standards suit Ang, adapted or dropped, without pretending to be React. MIT is decided. PR and issue templates are in, to steer contributions toward Ang's first principles and open conversation. The repo gets the full quality kit (ESLint, Prettier, Husky, lint-staged and CI), dev-only in a private root `package.json`, keeping `node:test` because tests ship with installs, with auto-fix, zero warnings and no markdown linting, and the README gets status badges. ESLint runs `@eslint/js`, `n`, `regexp` and `eslint-config-prettier`, a set tested against Ang's own code. Shipped Ang stops nudging pilots toward `/bootstrap-quality`. Ang is developed against the current Node LTS (long-term support release), which is also its minimum: Node 26 today. Releases are git tags with generated GitHub Releases, since install and upgrade pin to tags. The PR and issue templates are a guided rubber-ducking nudge toward Ang's first principles, not a wall: no repo settings block PRs. Ang takes kit 2 from the survey of comparable small repos: "fork it" guidance in the README, issue templates that route chat to Discussions, private vulnerability reporting instead of SECURITY.md, and a short CONTRIBUTING and code of conduct in Ang's voice.

## Why it matters
The tagged release needs a decided, Ang-sized hygiene checklist, and the shipped rule's push for `/bootstrap-quality` should agree with what the Ang repo itself does.

## What's here
- [Brief](ideas-content/brief.md)
- [Quality tooling](ideas-content/quality-tooling.md): evidence and Zac's decision for the full kit
- [Hygiene survey](ideas-content/hygiene-survey.md): what 17 small or whimsical repos keep, and three candidate kits for Ang
- [Test runner](shaping-content/test-runner.md): why `node:test` stays and Vitest is out
- [ESLint plugins](shaping-content/eslint-plugins.md): the preset set, probed on Ang's code
- [Dropping the /bootstrap-quality nudge](shaping-content/bootstrap-quality-nudge.md): why shipped Ang stops suggesting it
- [Minimum supported Node version](shaping-content/node-version.md): the current LTS, and why
- [What the templates are for](shaping-content/pr-template-purpose.md): a nudge, not a guard, and what the PR template asks

## Related
- [Repo README (shaping)](/project-context/shaping/repo-readme/README.md): where the badges will sit
- [Business constraints](/project-context/10k/business-constraints.md)
- [Delivery intent](/project-context/10k/intent.md)
- [ADR 0002: zero-dependency library script](/project-context/10k/technical/adrs/0002-zero-dependency-library-script.md)
