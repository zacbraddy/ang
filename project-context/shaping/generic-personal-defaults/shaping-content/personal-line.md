---
title: Where the personal line sits
shortDescription: Line-by-line verdict on what stays in the generic personal rule and output style, and what the tailoring step owns
tags: [open-source, distribution, brand-voice]
---
# Where the personal line sits

## Summary
Only facts *about the pilot* (identity, experience, default stack) are personal and get dropped from the shipped defaults. Everything else ships, including the opinionated methods (DDD, Onion, TDD, Atomic Design, Lean). Opinionated defaults make Ang's output predictable out of the box, and anyone who disagrees can raise a workflow improvement. Partner In Crime ships as the default output style. Wording is team-neutral. Decided with Zac, 2026-11-16 (ET 1, evidence tier 1: the pilot's own call).

## The line
- **Personal (drop from the default; the tailoring step asks for it):** who the pilot is and what they work in.
- **Generic (ship):** anything that serves Avoid Navel Gazing for anyone, *plus* opinionated engineering defaults that are widely held good practice.

Why the opinions stay: without them, each model reaches for its own ideals. Training data makes it likely to land on the same well-used methods anyway, but nondeterministically, so Ang's output looks unreliable. Shipping them makes "works out of the box" more true, not less.

## Personal rule (`working-with-zac.md`)
| Section | Verdict |
|---|---|
| Identity (years, contractor, solo) | Drop |
| Default stack | Drop |
| Favoured methods (DDD, Onion, TDD, Atomic Design, Lean startup) | Keep as defaults |
| Context precedence | Keep |
| Right-size everything | Keep; reword "docs are for future-me" to be team-neutral |
| Working together | Keep |
| Code, including "DDD/Onion is the default starting shape" | Keep |
| Tests | Keep |
| Quality tooling | Keep |

Team-neutral means wording that doesn't assume a solo pilot, such as "docs are for whoever runs this next". The tailoring step can add "solo" back in.

## Output style (`partner-in-crime.md`)
Ship it as-is as the default. The one change is to drop "ADHD-friendly" from its description and keep the behaviour.

## Still open
- The file name `working-with-zac.md` and how the pilot is referred to depend on u2 (pilot name templating).
- What the tailoring step asks, and how it rewrites these sections, is u3.

## Related
- [Hub](../README.md)
- [Brief](brief.md)
- [What Ang is](/project-context/10k/product/what-ang-is.md)
