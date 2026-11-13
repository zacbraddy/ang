---
title: Delivery intent
shortDescription: How Zac means the open-source release of Ang to be delivered, and why
tags: [delivery-intent, open-source]
confirmed: 2026-11-13
---
# Delivery intent

## Summary
Zac's intent: get Ang to its first open-source release with as little building and as little future upkeep as possible. Ang runs on itself throughout. He gave this at bootstrap on 2026-11-13, and it is his to revise.

## The goal, and what reaching it looks like
Ang is released as an open-source *starter*. Reaching it looks like:
- a tagged release;
- a whistle-stop README (the main concepts, the key commands and a quick start);
- a live docs site in Zac's voice;
- generic defaults in place of anything Zac-specific;
- only the open-source hygiene that suits Ang.

Stars and adoption are not part of the goal.

## Why we work this way
- Zac has very little free time and won't be a maintainer. The release has to leave Ang needing almost no upkeep.
- Ang only works if it stays lean, so the release must not add weight to it.
- Building Ang with Ang turns every rough edge into evidence.

## The stance
- Build the least that makes the release real.
- Buy over build: prefer off-the-shelf tools, such as an existing docs framework, over bespoke design.
- Where Zac lacks experience (running an open-source project), bring evidence from real sources, not model reasoning. Where he has it (web hosting, costs), lay out the options and he decides.

## What it means for agents
- Treat new features, process and tooling as a "no" until they make their case. CI (continuous integration) on the code needs convincing.
- Prefer cutting to adding.
- Defer to [first principles](/project-context/10k/product/first-principles.md) when a choice is unclear.

## Holds until
The first tagged release, or until Zac says otherwise.

## Related
| Doc | Why |
|---|---|
| [What Ang is](/project-context/10k/product/what-ang-is.md) | What is being released |
| [First principles](/project-context/10k/product/first-principles.md) | The lens behind the stance |
| [Business constraints](/project-context/10k/business-constraints.md) | Time, spend and maintenance limits |
| [Voice and attribution](/project-context/10k/marketing/voice-and-attribution.md) | How the README and docs read |
