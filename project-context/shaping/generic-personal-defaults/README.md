---
title: Generic personal rule and output style
shortDescription: Ship generic defaults for the personal rule and output style, plus a step that tailors them to the pilot
tags: [open-source, distribution, brand-voice]
---
# Generic personal rule and output style

## Summary
`working-with-zac.md` and the Partner In Crime output style are personal to Zac and so are untracked, yet shipped settings point at that style. The plan is to ship generic defaults that keep their spirit, and add a re-runnable tailoring command that `/bootstrap-repo` invokes. It writes per-user choices (pilot name, host, output style, a personal rule overlay) into gitignored local files inside the repo, with root `ang.json` and `ang.local.json` replacing `.claude/ang.json`.

## Why it matters
Generic defaults are a release goal in the intent, and today a fresh clone names an output style it doesn't have.

## What's here
- [Brief](shaping-content/brief.md): the requirements as Zac stated them, plus the related bootstrap finding
- [Where the personal line sits](shaping-content/personal-line.md): what ships in the generic defaults and what tailoring owns
- [Pilot name without templating](shaping-content/pilot-name.md): the name is an optional hook-injected `pilot` feature, with no per-skill templating
- [Tailoring step and per-user config](shaping-content/tailoring.md): the tailoring command, the local config overlay, canned output styles plus a bounded interview
- [Pilot feature spike](spikes/pilot-feature/README.md): the throwaway code and its 4/4 results

## Related
- [Delivery intent](/project-context/10k/intent.md)
- [Shipped config and defaults](/project-context/shaping/shipped-config-defaults/README.md)
