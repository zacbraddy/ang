---
title: Output styles
shortDescription: Commit the five canned output styles, with Partner In Crime as the default and without the ADHD label
tags: [distribution, brand-voice]
status: draft
owner: agent
dependsOn: []
---
# Output styles

## Summary
Commits `partner-in-crime.md`, without "ADHD-friendly" in its description, and adds Straight Shooter, Mentor, Briefing and Pair Programmer as specified in the canned output styles doc.

## Outcome
A fresh install ships five styles, and `settings.json`'s `outputStyle: "Partner In Crime"` resolves to a file that exists.

## Done when
- The five files in `src/.claude/output-styles/` are tracked, each with frontmatter (`name`, `description`, `keep-coding-instructions: true`), a `# Voice` section and a `# Shape of every reply` section.
- The `outputStyle` in `settings.json` matches a shipped style's `name`.

## Rough scope
- Edit Partner In Crime's description (d2).
- Write the four new styles from their specs (d8, k13).

## Links
- [Plan: scope 5](../plan.md)
- [Canned output styles](../output-styles.md)

## Related
- [Epic hub](../README.md)
- [05 /tailor-ang](05-tailor-ang.md)
