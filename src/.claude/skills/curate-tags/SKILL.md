---
name: curate-tags
description: Consolidates near-duplicate and low-value tags so the tag set stays small and useful, rewriting every affected document. Use when the user runs /curate-tags or the tag count passes 50.
disable-model-invocation: true
---

# /curate-tags

Goal: fewer than 50 tags, each one picking out a meaningful slice of the library.

1. Run `node .claude/scripts/ang-context-manager.mjs tag stats`.
2. Propose:
   - **merge clusters**: synonyms and overlapping tags → one canonical tag, with an improved description and departments;
   - **removals**: tags used by no docs;
   - **watch list**: tags used once (keep them only if they'll grow).
3. Show me clusters 5 at a time and agree each one.
4. Apply. If the canonical tag is new, run `ang-context-manager.mjs tag add` first, then `ang-context-manager.mjs tag merge <a> <b> --into <canonical>` (this rewrites every doc and `tags.json`). Use `ang-context-manager.mjs tag remove <tag>` for unused tags. Edit descriptions in `tags.json` directly.
5. Run `ang-context-manager.mjs library validate` and report the before and after tag counts. Changes are unstaged.
