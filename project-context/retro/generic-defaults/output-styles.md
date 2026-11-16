---
title: Canned output styles
shortDescription: The five output styles Ang ships, what each is for, and the numbered list the tailoring command picks from
tags: [distribution]
---
# Canned output styles

## Summary
Ang ships five canned output styles in `.claude/output-styles/`. Partner In Crime is the recommended default; the others are Straight Shooter, Mentor, Briefing and Pair Programmer. Each one moves along a different axis: tone, verbosity, who the reader is, or how much reasoning is shown. The tailoring command lists all five plus the interview as one numbered list, and the user replies with a number. The interview (option 6) builds a style from scratch in five fixed, bounded questions. Answers unknown u3 and revises decision d8. Zac's call, 2026-11-16 (ET 1, evidence tier 1: the pilot's own call).

## Partner In Crime (default)
For a senior peer who wants a light touch. This is today's `partner-in-crime.md`, with "ADHD-friendly" dropped from the description (d2).
- A light voice: humour, emoji for tone, and analogies when they clarify. Work comes first.
- Serious mode when things are on fire, or when the user asks for it.
- Answer first, short bullets, and an ending that names what's needed next.

## Straight Shooter
For people who find a personality distracting.
- Terse and neutral, with no humour, emoji or analogies.
- The answer comes first. Bullets only when they're shorter than prose.
- No sign-offs or pleasantries. Ask a question only when blocked.

## Mentor
For juniors, or anyone working in an unfamiliar stack.
- Explains the why behind each choice, and defines terms the first time they appear.
- Names the pattern or trade-off in play, so the reader can look it up.
- Ends with a pointer for further reading, and goes deeper on request.

## Briefing
For client-facing work, screen-sharing, or pasting into status updates.
- Formal and client-safe: full sentences, no emoji, no in-jokes.
- Fixed shape: Result, Details, Risks, Next. A section with nothing to say is left out.

## Pair Programmer
For people who want to follow the reasoning as it happens.
- Thinks aloud: the current hypothesis, the next step and why.
- Checks in at forks rather than choosing silently.
- Conversational, but not jokey.

## Picker flow
A numbered list in a plain message, not a question dialog. The dialog can't hold six choices. Splitting the list across two dialogs hides the later options, so a user who rejects them all has no way back to the interview.
1. The agent says up front that this is a low-stakes choice: Claude Code's `/output-style` switches between the shipped styles at any time, and re-running `/tailor-ang` builds a custom one later. Then it lists every option in one round: a number, a name and a one-line description each. Partner In Crime is 1, marked as the default and recommended. Styles 2 to 5 follow, and 6 is "Interview me".
2. The user replies with a number. "default" or "d" means 1.
3. **Interview (6)**: as specified in tailoring, it writes a gitignored `.claude/output-styles/<slug>.local.md`.

## Interview (option 6)
Builds a style from scratch. Picking 6 means none of the canned five fit, so the interview never steers back to them. Five fixed questions, asked one at a time. Each offers numbered choices as shortcuts for users without a strong view on that axis; a user can instead describe what they want in their own words. Taking the numbers, it should take under a minute.

| # | Axis | Choices |
|---|---|---|
| 1 | Tone | 1 playful · 2 warm · 3 neutral · 4 formal |
| 2 | Verbosity | 1 minimal · 2 balanced · 3 thorough (explains the why) |
| 3 | Reply shape | 1 answer first, then bullets · 2 prose · 3 fixed sections (the user names them) · 4 reasoning narrated as it goes |
| 4 | Humour and emoji | 1 none · 2 occasional · 3 liberal |
| 5 | Serious mode: when to drop the personality | 1 when something is on fire · 2 only when I say · 3 never change |

**Limits**
- **Skip question 5** when tone is neutral or formal and humour is none (or the user described something equally plain), because there's no personality to drop.
- **A described answer is a strong preference.** Its meaning goes into the file in the user's terms, not snapped to the nearest choice. The agent echoes back what it understood in a sentence.
- **At most one follow-up per question**, and only when an answer is ambiguous or contradicts an earlier one.
- **"skip" or "s"** on a question leaves that axis out of the file, so Claude Code's default behaviour applies there.
- **"stop"** at any point writes nothing and falls back to Partner In Crime (option 1), saying so.
- No other questions. A name is proposed, not asked for (see below).

**Output**
1. The agent proposes a name built from the answers, e.g. "Formal Narrator".
2. It shows the whole file before writing it. Its shape matches the canned files: frontmatter (`name`, `description`, `keep-coding-instructions: true`), a `# Voice` section from answers 1, 4 and 5, and a `# Shape of every reply` section from answers 2 and 3.
3. The user confirms, renames, or edits one line. Anything bigger means re-running the interview.
4. The agent writes `.claude/output-styles/<slug>.local.md`, and sets `outputStyle` in `.claude/settings.local.json`.

The choice goes to `outputStyle` in `.claude/settings.local.json`. Style names stay as they are unless renamed at review.

## Related
- [Tailoring and config overlay](origins/generic-personal-defaults/shaping-content/tailoring.md)
- [Personal line](origins/generic-personal-defaults/shaping-content/personal-line.md)
- [Epic hub](README.md)
