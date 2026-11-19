---
title: Install, uninstall, update, brief
shortDescription: Zac's framing of the install, uninstall and update questions
tags: [distribution]
---
# Brief

## Summary
Raised by Zac at bootstrap (2026-11-13): explore how Ang gets into a project quickly and easily.

## Questions
- **Install route.** A Claude Code plugin marketplace is one option, but would it stop users editing their own copy, which is what workflow improvements depend on? Ang is a starter users bend, so files they own may beat a managed plugin. Weigh alternatives such as a copy script or `npx degit`-style cloning.
- **Uninstall.** Is a command worth having? If so, what does it remove (`.claude/` entries, `project-context/`), and what must it never remove?
- **Update.** Probably not, because Ang shouldn't change much and users diverge from upstream by design. Consider it anyway, even if the answer is "not for now".
- **Conventions doc.** `library init` doesn't create `project-context/README.md`, yet the rules tell agents to read it. In this repo it only exists at `src/project-context/README.md`. How does a user's install get it, and should init copy it?

## Related
- [Hub](../../../README.md)
