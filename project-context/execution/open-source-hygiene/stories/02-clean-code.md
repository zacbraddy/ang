---
title: Clean code
shortDescription: Prettier pass, then hand fixes to zero ESLint errors and warnings, test-first where behaviour could change
tags: [open-source, tech-stack]
status: ready
owner: agent
dependsOn: [01]
---
# Clean code

## Summary
Brings Ang's code to zero findings before any hook or CI enforces it, so neither starts red. Behaviour must not change.

## Outcome
`npm run lint` and `npm run format:check` both pass with zero errors and zero warnings, and `npm test` stays green.

## Rough scope
- Prettier pass over `src/`, `scripts/` and root configs.
- Re-run ESLint and fix what it finds. The C4 code table (10 regexp findings as of 2026-11-23) is a starting map; `eslint-plugin-n` may add more.
- Test first where a fix could change behaviour: a new `library/frontmatter.test.mjs` covering list items, key-value lines and the tags rewrite; check `upgrade/guides.test.mjs` covers a move with and without a note and fill the gap.
- Unused capture groups inside `.test()` need no new test.
- Fix the 7 findings outside C4's map too: 4 shebangs, 2 rethrows without `cause`, 1 unused rest-omit variable.

## Done when
- `npm run lint` exits 0 with 0 errors and 0 warnings; `npm run format:check` exits 0.
- `npm test` passes with 183 plus the new tests, 0 fail, and the pre-existing 183 are unchanged.
- Each regex rewrite in `library/frontmatter.mjs` and `upgrade/guides.mjs` has a test that passed against the old regex before it changed.
- No `eslint-disable` comment was added.
- `ang-context-manager.mjs library validate` is clean.

## Acceptance criteria
- Given the cleaned repo, when I run `npm run lint`, then ESLint reports nothing.
- Given the cleaned repo, when I run `npm run format:check`, then Prettier reports every file formatted.
- Given frontmatter with a block list (`tags:` then `  - a` lines), when `parseFrontmatter` runs, then it returns the same arrays as before the fix.
- Given a list item with no list key above it, or a line whose key doesn't start with a letter, when `parseFrontmatter` runs, then the line is skipped as before.
- Given a doc whose tags are a block list, when `setFrontmatterTags` runs, then the whole block becomes one inline `tags: [...]` line and the rest of the frontmatter is untouched.
- Given a Moves entry `` `a` -> `b`: `` with an empty note, when `parseGuide` runs, then it returns `note: ''` as before.
- Given a missing local guide that fails with an error other than ENOENT, or a fetch that throws, when the guide is read, then the thrown error keeps its old message and carries the original as `cause`.
- Given a pathological line (e.g. `-` followed by thousands of spaces and no text), when the old regex would backtrack, then the new one returns promptly with the same result.

## Test plan
- **Unit (new):** `src/.claude/scripts/ang/library/frontmatter.test.mjs`, written against the current regexes and passing before any rewrite:
  - `parseFrontmatter`: no frontmatter → `null`; CRLF line endings; key-value with hyphens and digits in the key, extra spaces after the colon, quoted values; inline `[a, "b", ]` arrays; empty value starting a block list; list items with one and several spaces after `-`, quoted items; a list item with no list key; a key starting with a digit or `_` skipped; a key-value line ending a block list.
  - `setFrontmatterTags`: inline tags replaced; a block list collapsed into one line; tags with indented items using tabs; no `tags:` line → unchanged; no frontmatter → unchanged; a body line starting `tags:` below the frontmatter left alone.
- **Unit (gap):** `upgrade/guides.test.mjs` gets a Moves entry with a colon and an empty note (`` `a` -> `b`: ``). Moves with and without a note, and a malformed move, are already covered.
- **Integration:** the existing 183 tests are the regression guard for everything else.
- **Won't test:**
  - the `(…)` → `(?:…)` swaps inside `.test()`, since `.test()` ignores groups
  - shebang removal
  - the `cause` additions (message text unchanged, and existing tests already assert it)
  - the unused-variable fix in a test file
  - the Prettier pass, which `npm test` and `format:check` cover
  - backtracking timing; the pathological-input criterion is a manual check

## Implementation notes
Paths below are under `src/.claude/scripts/ang/` unless rooted. C4 element: [lint findings in the shipped script](../c4/4-code.md#lint-findings-in-the-shipped-script-story-2).

- **Prettier pass:** `npm run format`. It touches 56 files (54 `.mjs`, `src/.claude/settings.json`, `release.yml`), mostly quotes and 80-column wraps, because `.prettierrc.json` leaves Prettier's defaults on. Run it again after the hand fixes so `format:check` passes on the final tree. Everything is left unstaged for Zac (d21).
- **Regex fixes, test first:**
  - `library/frontmatter.mjs:11` `^\s*-\s+(.*)$`: `\s+` and `.*` both match spaces. One fix is `^\s*-\s+(\S.*)?$`, but check it against the "dash then only spaces" case: today that yields `''`, so keep `?? ''` or equivalent.
  - `:16` `^([A-Za-z][\w-]*):\s*(.*)$`: same overlap after the colon; add `i` and `[a-z]`.
  - `:35` `[ \t]*-[ \t]+.*` → `[ \t]*-[ \t].*` per the rule.
  - `upgrade/guides.mjs:22` `` `\s*->\s*` `` plus `(?::\s*([\s\S]*))?`: rewrite so the note's leading space can't trade with `\s*`; `.trim()` already strips it.
  - Take the plugin's suggested rewrite where it's offered, then confirm with the tests.
- **Unused groups** at `items/move.mjs:60`, `:77`, `triggers/triggers.mjs:33`, `upgrade/apply.mjs:11` and `util.mjs:10`: `(…)` → `(?:…)`. ESLint's `--fix` handles these.
- **Findings outside C4's map:**
  - `n/hashbang`: delete line 1 (`#!/usr/bin/env node`) of `src/.claude/scripts/ang-context-manager.mjs`, `scripts/draft-guides.mjs`, `scripts/link-entries.mjs` and `scripts/release-manifest.mjs` (Zac's call, 2026-11-23). All four are mode 644 and every caller runs them with `node`.
  - `preserve-caught-error`: pass `{ cause: error }` as the second `Error` argument at `scripts/draft-guides.mjs:17` and `upgrade/guides.mjs:84`. Keep the messages as they are.
  - `no-unused-vars` at `scripts/install.test.mjs:111`: the `CLAUDE_PROJECT_DIR` rest-omit is deliberate. Set `"no-unused-vars": ["error", { ignoreRestSiblings: true }]` in `eslint.config.mjs` rather than rewriting the test.
- **New findings:** if the re-run turns up anything not listed here, fix it the same way: test first where behaviour could change. No disable comments.
- **Edge cases:** CRLF frontmatter, tab indentation in tag lists, and the dash-only list item.
- **Out of scope:**
  - `.husky/pre-commit`, lint-staged config, `ci.yml` (story 03)

## Related
- [Plan: clean in one pass, then enforce](../plan.md#clean-in-one-pass-then-enforce), [test strategy](../plan.md#test-strategy)
- [C4 code: lint findings](../c4/4-code.md#lint-findings-in-the-shipped-script-story-2)
- [ESLint plugins](../origins/open-source-hygiene/shaping-content/eslint-plugins.md)
