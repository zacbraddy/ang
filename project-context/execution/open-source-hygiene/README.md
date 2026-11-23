---
title: Open-source hygiene
shortDescription: Epic delivering Ang's contributor kit, dev-only quality tooling and CI so the repo is ready to release as open source
tags: [open-source]
---
# Open-source hygiene

## Summary
A mixed epic that gets the Ang repo ready to be read, forked and contributed to. The technical half adds a private, dev-only root `package.json` with ESLint, Prettier, Husky and lint-staged, a working `npm test` on `node:test`, and GitHub Actions CI on the current Node LTS (long-term support release), then fixes Ang's code to zero warnings. The repo-facing half adds a short CONTRIBUTING and code of conduct in Ang's voice, issue and PR templates that nudge toward Ang's first principles, private vulnerability reporting and README badges. Shipped Ang also drops its nudge toward `/bootstrap-quality`.

## Why it matters
Ang's tagged release needs a decided, Ang-sized hygiene kit, and code that bears Zac's name should hold to the standards Ang itself recommends.

## What's here
- [Plan](plan.md): scope, sequencing, risks, success measures, test strategy and candidate ADRs
- [Stories](stories/): six stories, from root tooling to dropping the `/bootstrap-quality` nudge
- [C4](c4/1-context.md): [context](c4/1-context.md), [containers](c4/2-containers.md), [components](c4/3-components.md), [code](c4/4-code.md)
- [Brief](origins/open-source-hygiene/ideas-content/brief.md)
- [Quality tooling](origins/open-source-hygiene/ideas-content/quality-tooling.md): evidence and the decision for the full kit
- [Hygiene survey](origins/open-source-hygiene/ideas-content/hygiene-survey.md): what 17 small or whimsical repos keep
- [Test runner](origins/open-source-hygiene/shaping-content/test-runner.md): why `node:test` stays
- [ESLint plugins](origins/open-source-hygiene/shaping-content/eslint-plugins.md): the preset set, probed on Ang's code
- [Dropping the /bootstrap-quality nudge](origins/open-source-hygiene/shaping-content/bootstrap-quality-nudge.md)
- [Minimum supported Node version](origins/open-source-hygiene/shaping-content/node-version.md)
- [What the templates are for](origins/open-source-hygiene/shaping-content/pr-template-purpose.md)

## Related
- [Repo README (shaping)](/project-context/shaping/repo-readme/README.md): where the badges will sit
- [ADR 0002: zero-dependency library script](/project-context/10k/technical/adrs/0002-zero-dependency-library-script.md)
- [Business constraints](/project-context/10k/business-constraints.md)
- [Delivery intent](/project-context/10k/intent.md)
