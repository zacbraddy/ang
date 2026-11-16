---
title: Output styles
shortDescription: Commit the five canned output styles, with Partner In Crime as the default and without the ADHD label
tags: [distribution, brand-voice]
status: ready
owner: agent
dependsOn: []
---
# Output styles

## Summary
Commits `partner-in-crime.md`, without "ADHD-friendly" in its description, and adds Straight Shooter, Mentor, Briefing and Pair Programmer as specified in the canned output styles doc.

## Outcome
A fresh install ships five styles, and `settings.json`'s `outputStyle: "Partner In Crime"` resolves to a file that exists.

## Done when
- `src/.claude/output-styles/` holds five tracked-ready files: `partner-in-crime.md`, `straight-shooter.md`, `mentor.md`, `briefing.md` and `pair-programmer.md`. `git check-ignore` reports none of them.
- Each has frontmatter (`name`, `description`, `keep-coding-instructions: true`), a `# Voice` section and a `# Shape of every reply` section, and nothing else.
- `grep -i adhd src/.claude/output-styles/` returns nothing.
- `outputStyle` in `src/.claude/settings.json` equals the `name` in `partner-in-crime.md` ("Partner In Crime").
- `library validate` passes.

## Acceptance criteria
- Given a fresh install with no `settings.local.json`, when a session starts, then Partner In Crime is the active style.
- Given `/output-style` in Claude Code, when the list shows, then all five styles appear with their one-line descriptions.
- Given any of the four new styles is picked, when the agent replies, then the reply follows that style's bullets in [canned output styles](../output-styles.md) and nothing from Partner In Crime leaks in (no emoji or jokes outside Partner In Crime).
- Given Briefing has nothing to say for a section (e.g. no risks), then that section is left out rather than filled with "None".
- Given Straight Shooter, Briefing or Pair Programmer, when something is on fire, then the reply is unchanged: only Partner In Crime has a serious mode to switch to.

## Test plan
- **Unit / integration / E2E**: none. Nothing here is code.
- **Won't test**: style wording, and whether Claude Code honours a style (its behaviour, not ours). Config and markdown content, per `engineering-defaults.md`.
- **Checks**: the Done-when commands, run by hand, plus a one-off look at `/output-style` listing all five in this repo (the root `.claude/output-styles` symlink already points at `src/.claude/output-styles/`).

## Implementation notes
- **`partner-in-crime.md`**: change only the description, to "Light, emoji-friendly senior-peer voice with answer-first replies" (d2). Body stays as is.
- **New files**: one per style in [canned output styles](../output-styles.md), in the same shape and length as Partner In Crime (a handful of bullets per section). Map the spec's bullets:
  - Tone, humour, emoji, serious mode and reader → `# Voice`.
  - Answer order, verbosity, fixed sections, endings and check-ins → `# Shape of every reply`.
- **Per style**:
  - **Straight Shooter**: neutral, no humour, emoji or analogies. Answer first; bullets only when shorter than prose; no sign-offs or pleasantries; ask a question only when blocked.
  - **Mentor**: reader is a junior or someone new to the stack. Explain the why behind each choice, define terms at first use, and name the pattern or trade-off so it can be looked up. End with one pointer for further reading; go deeper on request.
  - **Briefing**: formal, client-safe, full sentences, no emoji or in-jokes, safe to paste into a status update. Fixed sections Result, Details, Risks, Next, in that order; drop an empty one.
  - **Pair Programmer**: conversational, not jokey. Think aloud (current hypothesis, next step and why) and check in at forks rather than choosing silently.
- **Voice of the files**: write them as the user speaking to the agent ("me", "I"), matching Partner In Crime, because an output style is the user's instructions. Rewriting first person elsewhere is out of scope (k15).
- **Descriptions**: one line each, under ~80 characters. `/tailor-ang` (05) reuses them as the picker's one-line descriptions, so they must say who the style is for or what it does, not just its tone.
- **Names**: `name` is the display name exactly as in the spec ("Straight Shooter", "Mentor", "Briefing", "Pair Programmer"); the filename is its kebab-case slug. No `.local` in canned filenames, since `*.local.md` is gitignored.
- **`settings.json`**: no change; it already says `"Partner In Crime"`.
- **Out of scope**: the picker and interview (05); the `project-structure.md` note that output styles were untracked (06); staging or committing (left for review).

## Links
- [Plan: scope 5](../plan.md)
- [Canned output styles](../output-styles.md)

## Related
- [Epic hub](../README.md)
- [05 /tailor-ang](05-tailor-ang.md)
