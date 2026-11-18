---
title: Voice lessons from the README
shortDescription: What Zac changed between the agent's first README draft and the one he signed off, as a target for every docs page still to write
tags: [documentation, brand-voice]
---
# Voice lessons from the README

## Summary
Story 01 took four rounds: an agent draft, Zac rewriting the top half as an example, a second agent draft, then Zac's own edits and a final proofread (2026-11-18). The structure and facts survived almost untouched; nearly every change was voice. The first draft was accurate, terse and too polite. Zac wants more whimsy, more first person, more "why it helps you" and emoji. The final root `README.md` is the voice sample to match. Every point below is ET 1 (evidence tier 1: a primary source), read straight from Zac's edits.

## What Zac changed
- **Whimsy turned up.** He added pop-culture asides (Indiana Jones and git archaeology, "the Leonardo da Vinci of code"), images ("a tomb of decisions past", agents "furiously rowing in opposite directions"), self-deprecation (software "engineer" (lol!)) and a meme image to finish. The first draft's dry jokes read as too restrained.
- **Emoji are expected.** There's one at the start of every heading (on the left, never trailing), plus a few inline for tone. Draft 1 had none, and Zac said he was "a bit upset" about that.
- **Told from the reader's side.** The funnel table became "When I'm asking… / Then I… / I run… / And Ang gives me…". Where a page explains a command, explain it from the user's seat, not the skill's.
- **Benefit after every mechanism.** Each terse fact grew a "so that": one question per session "keeps the agents sharp", work is left unstaged because "the final say on what gets checked in, and in what shape, is **always** down to me", fixes are kept separate because "I've got better things to do than waste my time searching for sepllnig mistakes".
- **"Trimmed" doesn't mean short.** Bending Ang grew from two bullets into a full paragraph on why bending matters, and a "So much more" section was added. Trim repetition and filler, not personality or reasoning.
- **Sections hand off to each other.** Lines like "What? You were expecting more? Well…" and "That said, going in blind can be overwhelming, so if…" lead into the next section instead of stopping dead.
- **Ang isn't tied to one harness.** "in Claude Code" was cut from the one-liner: out of the box Ang runs in Claude Code, but a workflow improvement can take it to any harness. Name Claude Code where a step really needs it (install, running commands), not in Ang's identity.
- **Integrations get their own spot.** Orca moved out of the streams bullet into "Integrates with your tooling", with a link to its GitHub repo (https://github.com/stablyai/orca), plus a cheerful "it's optional".
- **Attribution changed.** It now reads "developed by Zac Braddy and is sponsored by We Right Code". That differs from the wording in [voice and attribution](/project-context/10k/marketing/voice-and-attribution.md), so use the README's wording on the site, and `/retro` should update the 10k doc.

## How to apply it to the site pages
- Write the first draft at the README's level of whimsy and emoji. Expect Zac to add jokes, not cut them.
- Check behaviour, not only the spec wording. The README story's acceptance criteria had `/tailor-ang` as its own quick-start step, but `/bootstrap-repo` already runs it, so telling readers to run it again wasted their time. When a spec and the shipped files disagree, follow the files and flag the spec.
- The proofread pass fixes spelling and grammar only. Keep deliberate jokes ("sepllnig mistakes" is on purpose) and Zac's turns of phrase ("out the box", "ain't").
- Zac's editor can leave non-breaking spaces in pasted text; normalise them before matching strings.

## Related
- [Hub](README.md)
- [Story 01: README rewrite](stories/01-readme-rewrite.md)
- [Voice and attribution](/project-context/10k/marketing/voice-and-attribution.md)
