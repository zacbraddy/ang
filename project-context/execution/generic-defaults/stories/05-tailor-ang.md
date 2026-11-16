---
title: /tailor-ang
shortDescription: A re-runnable skill that writes every per-user choice (host, pilot, output style, personal rule) into gitignored local files
tags: [distribution, brand-voice]
status: draft
owner: both
dependsOn: [01, 02, 03, 04]
---
# /tailor-ang

## Summary
A new prose skill, with no script code, that a pilot runs on their own or that `/bootstrap-repo` invokes. In order, it: detects the host; asks for the pilot name; shows the numbered style list (the five canned styles plus "Interview me" as 6); runs the 3-question personal-rule interview; previews every file; writes the local files; and makes sure `.gitignore` covers them.

## Outcome
A teammate joining a bootstrapped repo runs `/tailor-ang` and gets their own name, host, style and personal rule without touching a tracked file.

## Done when
- The skill exists at `src/.claude/skills/tailor-ang/`.
- Agent and user do one manual run in a scratch repo, covering a canned style choice and the option-6 interview. Afterwards `git status` shows no tracked changes beyond `.gitignore`, every file it wrote is ignored, and `validate` passes.

## Rough scope
- Host detection, and a pilot name prompt that accepts skip (null).
- The numbered picker and the option-6 interview exactly as specified (d8, d14). The picker opens by saying the choice is low stakes: `/output-style` switches between shipped styles any time, and re-running `/tailor-ang` builds a custom one later.
- The personal-rule interview: role and experience, default stack, solo or team (d16). A repo scan may suggest a stack answer, never write one.
- Preview each file. Write `ang.local.json`, `.claude/settings.local.json` (merged into any existing file), `.claude/rules/pilot.local.md` and any `.claude/output-styles/<slug>.local.md`.
- Append any missing `.gitignore` entries before writing.

## Links
- [Plan: scope 6](../plan.md)
- [C4 code: files /tailor-ang writes](../c4/4-code.md)
- [Canned output styles: picker and interview](../output-styles.md)
- [Tailoring and config overlay](../origins/generic-personal-defaults/shaping-content/tailoring.md)

## Related
- [Epic hub](../README.md)
- [06 Bootstrap and docs](06-bootstrap-and-docs.md)
