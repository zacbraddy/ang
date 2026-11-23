---
title: Clean code
shortDescription: Prettier pass in its own blame-ignored commit, then hand fixes to zero ESLint errors and warnings, test-first where behaviour could change
tags: [open-source, tech-stack]
status: draft
owner: agent
dependsOn: [01]
---
# Clean code

## Summary
Brings Ang's code to zero findings before any hook or CI enforces it, so neither starts red. Behaviour must not change.

## Outcome
`npm run lint` and `npm run format:check` both pass with zero errors and zero warnings, and `npm test` stays green.

## Rough scope
- Prettier pass over `src/`, `scripts/` and root configs as its own commit; its SHA goes in `.git-blame-ignore-revs`.
- Re-run ESLint and fix what it finds. The C4 code table (10 regexp findings as of 2026-11-23) is a starting map; `eslint-plugin-n` may add more.
- Test first where a fix could change behaviour: a new `library/frontmatter.test.mjs` covering list items, key-value lines and the tags rewrite; check `upgrade/guides.test.mjs` covers a move with and without a note and fill the gap.
- Unused capture groups inside `.test()` need no new test.

## Related
- [Plan: clean in one pass, then enforce](../plan.md#clean-in-one-pass-then-enforce), [test strategy](../plan.md#test-strategy)
- [C4 code: lint findings](../c4/4-code.md#lint-findings-in-the-shipped-script-story-2)
- [ESLint plugins](../origins/open-source-hygiene/shaping-content/eslint-plugins.md)
