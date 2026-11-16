---
title: Generic defaults
shortDescription: Ship generic, Zac-free defaults (rule, output style, config) plus a tailoring command that writes per-user choices locally
tags: [open-source, distribution, brand-voice, repo-structure]
---
# Generic defaults

## Summary
Technical epic: make a fresh install of Ang generic and valid. Ang ships a team-neutral rule (`engineering-defaults.md`, replacing `working-with-zac.md`) and five canned output styles, with Partner In Crime as the default, and ships no `ang.json`; `/bootstrap-repo` writes a committed root `ang.json` (intent on, streams off). A re-runnable `/tailor-ang` command, which bootstrap invokes, writes per-user choices (pilot name, host, output style, an additive personal rule in `.claude/rules/pilot.local.md`) into gitignored local files in the repo, with `ang.local.json` overriding personal keys only. The pilot's name reaches agents through a hook-injected `pilot` feature, never templated into skills. This repo stops symlinking its config into `src/` and gets its own.

## Why it matters
Generic defaults are a release goal in the [delivery intent](/project-context/10k/intent.md). Today a fresh install inherits Zac's config, fails `validate` and names an output style it doesn't ship.

## What's here
- [Config move blast radius](config-move.md): what reads `ang.json` today and how the local file is limited to personal keys
- [Canned output styles](output-styles.md): the five shipped styles and the numbered picker
- [Person references](person-references.md): no pilot name leaks; two "my rules" pointers to fix
- `plan.md`, `c4/` and `stories/`: not written yet
- [Origin: generic personal rule and output style](origins/generic-personal-defaults/shaping-content/brief.md): [personal line](origins/generic-personal-defaults/shaping-content/personal-line.md), [pilot name](origins/generic-personal-defaults/shaping-content/pilot-name.md), [tailoring and config overlay](origins/generic-personal-defaults/shaping-content/tailoring.md), [pilot feature spike](origins/generic-personal-defaults/spikes/pilot-feature/README.md)
- [Origin: shipped config and defaults](origins/shipped-config-defaults/shaping-content/brief.md): [fresh-install defaults](origins/shipped-config-defaults/shaping-content/fresh-install-defaults.md)

## Related
- [Delivery intent](/project-context/10k/intent.md)
- [Project structure](/project-context/10k/technical/project-structure.md)
- [Install, uninstall, update](/project-context/ideas/install-uninstall-update/README.md)
