---
title: Generic personal rule and output style, brief
shortDescription: Zac's requirements for shipping generic versions of his personal rule and output style
tags: [open-source, distribution]
---
# Brief

## Summary
Ship generic defaults for both files, add an Ang step that generates versions tailored to the user, and have `/bootstrap-repo` offer to take the defaults or customise them. Captured from Zac's opening brain dump and the bootstrap leftovers (2026-11-13).

## Requirements (Zac)
- Ship generic defaults for `src/.claude/rules/working-with-zac.md` and `src/.claude/output-styles/partner-in-crime.md`, keeping to the spirit of both. Zac has opinions on where the line sits and wants to find it with an agent.
- Add an Ang workflow step that generates a version tailored to the user.
- `/bootstrap-repo` offers a choice: take the defaults or customise them from the start.
- Personalisation matters: being addressed by name makes conversations flow better. Option: a pilot-name property in `ang.json`, templated into skills etc. If so:
  - the workflow-improvement flow must build new features that honour the templating;
  - decide the default when the user doesn't personalise;
  - cover it in `/bootstrap-repo` and anywhere else that's affected.
- An earlier commit replaced "Zac" with "the user" across skills. Usage is still mixed ("the user", first-person "me" meaning the pilot). At import (2026-11-10) the stance was that first-person "me" is fine and only direct naming of Zac had to go.

## Bootstrap finding
`src/.claude/settings.json` sets `"outputStyle": "Partner In Crime"` and the root `.claude/output-styles` symlink is tracked, but `src/.claude/output-styles/` is untracked, so a fresh clone names a style it doesn't have.

## Related
- [Hub](../../../README.md)
- [Project structure](/project-context/10k/technical/project-structure.md)
