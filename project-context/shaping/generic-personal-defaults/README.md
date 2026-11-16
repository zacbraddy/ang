---
title: Generic personal rule and output style
shortDescription: Ship generic defaults for the personal rule and output style, plus a step that tailors them to the pilot
tags: [open-source, distribution, brand-voice]
---
# Generic personal rule and output style

## Summary
`working-with-zac.md` and the Partner In Crime output style are personal to Zac and so are untracked, yet shipped settings point at that style. The plan is to ship generic defaults that keep their spirit, add a workflow step that generates versions tailored to the user (maybe with a pilot name in `ang.json`, templated into skills), and have `/bootstrap-repo` offer "take the defaults or customise". Fast-tracked: *that* is decided, *how* is open.

## Why it matters
Generic defaults are a release goal in the intent, and today a fresh clone names an output style it doesn't have.

## What's here
- [Brief](shaping-content/brief.md): the requirements as Zac stated them, plus the related bootstrap finding
- [Where the personal line sits](shaping-content/personal-line.md): what ships in the generic defaults and what tailoring owns

## Related
- [Delivery intent](/project-context/10k/intent.md)
- [Shipped config and defaults](/project-context/shaping/shipped-config-defaults/README.md)
