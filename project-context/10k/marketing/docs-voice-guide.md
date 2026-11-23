---
title: Docs voice guide
shortDescription: How to write README and docs-site pages Zac signs off with few notes, distilled from his edits to the README and the Start here pages
tags: [documentation, brand-voice]
---
# Docs voice guide

## Summary
Distilled from Zac's edits to the README and the five Start here pages, 2026-11-18 to 2026-11-19, and held across the rest of the docs site. Every point is ET 1 (evidence tier 1: a primary source), read straight from his edits. Read these as the intent behind his edits, not as hard rules: much of what he changed came down to taste in context, so two edits that look alike can go opposite ways. The signed-off pages are the real target. No draft will land with zero notes. The aim is to make his review a light polish, not a rewrite.

## Match these first
The signed-off pages beat anything written below. Read one before drafting.
- **Site pages:** `docs/src/content/docs/start-here/quick-start.md` (the closest sample), then `alongside-your-framework.md`, `first-loop.md`, `upgrading.md` and `uninstalling.md` in the same folder.
- **README:** the root `README.md`.

## Who's talking
- Zac is "I", the author, talking to the reader as "you". He jokes about himself ("I don't work on Windows", "I've done it more than once") and lets his own use of Ang stand as proof: it's how he builds Ang, and how he moved his own repos over.
- Explain everything from the reader's seat, as what they do and what they get back, not as what a skill's internals do. The README's funnel table, "When I'm asking… / I run… / And Ang gives me…", is the reader voicing their own question, which works in a table but not in page prose.
- Ang has a personality: confident, a bit cheeky, on the reader's side ("if there are problems they won't be Ang's!", "Ang won't hold a grudge"). The swagger has to be true.

## Tone
- Whimsical and warm, never dry or corporate. Use pop-culture asides (Indiana Jones, "Ang 2: Electric Boogaloo?"), vivid images and self-deprecation. A first draft that's too restrained gets more jokes added; one that's too busy gets trimmed. Aim for the samples' level.
- Talk back to the reader: quote the worry they're having ("An agent? Messing with my carefully bent copy of Ang?") and answer it ("Fair, but here's the thing…").
- Reassure and hand them the choice: "don't worry", "it's chill", "the final call is yours". Say kindly what isn't supported ("doesn't currently support downgrading, sorry").
- Keep Zac's turns of phrase ("out the box", "ain't"). When proofreading, leave any joke of his intact, even one that looks like a mistake.
- Every joke is a one-off. Don't reuse a gag or a bit from another page; a joke heard twice loses its punch.

## Emoji
- One on the left of every heading, never trailing.
- Use few inline: one or two a page for tone, where they land. Zac asked for emoji and then removed many of the inline ones, so treat that as taste, not a quota.
- Heading emoji must have no variation selector (🛣️, ⚙️, ✍️, 🛠️, 🗑️, 🗺️ and 🌪️ all have one). It puts an invisible character into the heading's anchor and breaks any link to it. 🚦, 🔧, 📋, 🔨, 🚮, 🧭 and 🌀 are safe.

## Building a page
- **Conversational, full sentences.** Explain each thing rather than listing bare bold labels. "Trimmed" means cutting repetition and filler, never personality or reasoning, so pages run long.
- **A "so that" after every mechanism.** Say why it helps the reader, and name what they're really after ("your goal here is to have the framework upgraded, not to rubber stamp an endless stream of merge conflicts").
- **Justify anything that looks alarming.** Retro deleting the epic folder, an agent running the upgrade: each gets a "this might feel weird, but…" explanation.
- **Plain analogies for concepts.** The funnel works like a sales funnel; Ang is your sourdough starter.
- **Describe how the reader actually works with a mechanism, not just the rule.** "Changes are unstaged" became stage what you like, steer the agent, and compare its unstaged second round.
- **Offer the other path with its reason.** "Perhaps you've learned a lot during the trial and would prefer a clean slate…"
- **Hand off between sections and pages.** "What? You were expecting more? Well…", or route the reader: "If you're not on Windows, next up for you is… If you are, keep reading." End each page by pointing to the next one.
- **Practical tips where readers trip.** Make `raw/` yourself and commit before bootstrapping; drop a `readme-first.md` saying what a migration is for.
- **Leave out internals the reader doesn't act on.** "Restart Claude Code" is enough; why the banner only loads at startup isn't.

## Formatting
- Follow every placeholder (`<tag>`, `<path>`) with a worked example, and say what format it takes. Ang tags are `v1.2.3`, or `v1.1.0-rc.1` for a release candidate.
- Anything that can bite the reader goes in `:::caution[Here be dragons 🐉]`. Use `:::note` for lighter asides.
- Give code blocks a `title` where it helps the reader copy the right one.

## Facts
- The shipped files win over the story, the spec and the brief. When they disagree, follow the files and flag the gap. Check behaviour, not only spec wording: an early spec told readers to run `/tailor-ang`, which `/bootstrap-repo` already runs.
- Fact-check Zac's own edits too. They sometimes describe behaviour the skills don't have, such as `/ideate` updating `10k/` or bootstrap recommending a mode. Fix it in his voice and tell him. If the behaviour he described is better than what ships, he may want the skill changed instead (that's how `/review-story` came to recommend fixes).
- Copy rule: name Claude Code only where a step really needs it (install, running commands), not as part of how Ang is pitched. Claude Code is still the only supported harness ([ADR 0001](/project-context/10k/technical/adrs/0001-claude-code-harness-orca-optional.md)).
- Ang can do non-technical work too. Say so wherever "technical" might read as a limit.
- Integrations get their own spot, marked as optional: Orca, with its GitHub link https://github.com/stablyai/orca.
- Attribution wording is in [voice and attribution](/project-context/10k/marketing/voice-and-attribution.md).

## The agent's final pass on Zac's edits
- Fix spelling and grammar, run-on sentences, sentences with no verb, and doubled spaces. When he says a draft is rough, restructure more freely: split paragraphs, add a heading, but keep every point, joke and anecdote. Don't drift his text back toward this guide.
- Normalise the non-breaking spaces his editor leaves, and look for stray characters before the frontmatter. One broke hot reload silently.
- Rebuild, re-run the link check, and tell him every factual change you made.

## Related
| Doc | Why |
|---|---|
| [Voice and attribution](/project-context/10k/marketing/voice-and-attribution.md) | The voice this guide applies |
| [ADR 0009: docs describe the shipped files](/project-context/10k/technical/adrs/0009-docs-describe-shipped-files.md) | Why the files win over memory |
