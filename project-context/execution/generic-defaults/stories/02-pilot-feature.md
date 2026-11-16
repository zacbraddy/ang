---
title: Pilot feature
shortDescription: Promote the pilot-feature spike so the pilot's name reaches sessions and subagents through the existing hooks
tags: [distribution]
status: ready
owner: agent
dependsOn: [01]
---
# Pilot feature

## Summary
Promotes the [pilot feature spike](../origins/generic-personal-defaults/spikes/pilot-feature/README.md) to `src/.claude/ang/features/pilot/`, and adds the one contract change it needs: a feature may export `rule(value)` in place of a static `rule.md`. `pilot` is set in `ang.local.json`.

## Outcome
Sessions in this repo show `Ang: intent · host (orca) · pilot (Zac)`, and subagents get the pilot's name through the SubagentStart hook. Skills are never templated.

## Done when
- `node --test 'src/.claude/**/*.test.mjs'` passes, including:
  - pilot `check` and `on` unit tests (`null` and a name pass; `""`, whitespace and numbers fail);
  - `featureRule` unit tests (`rule(value)` beats `rule.md`; falls back to `rule.md`; `null` when neither);
  - integration tests: banner names the pilot and carries its rule; subagent context carries the pilot rule and omits rules of off features.
- This repo's `ang.local.json` is `{ "host": "orca", "pilot": "Zac" }`; `session banner` here prints `Ang: intent · host (orca) · pilot (Zac)` followed by the pilot rule; `library validate` passes.
- `grep -rn 'Zac' src/.claude/ang src/.claude/scripts --exclude='*.test.mjs'` returns nothing (shipped code never holds a pilot's name).

## Acceptance criteria
- Given `pilot` is unset or `null`, when a session or subagent starts, then nothing about a pilot appears and `validate` passes.
- Given `ang.local.json` sets `pilot: "Zac"`, when `session banner` runs, then the mode line ends `· pilot (Zac)` and the `## Pilot` rule follows, naming Zac.
- Given the same, when `session subagent` runs, then `additionalContext` contains the `## Pilot` rule.
- Given `pilot` is `""`, `"   "` or `42` in either file, when config loads, then an error `<file>: pilot must be null or a name` is reported, `pilot` stays `null` (off), and the banner ends `· Ang config invalid, …`.
- Given `ang.json` sets `pilot`, when config loads, then it applies (shared keys are allowed; only non-local keys in `ang.local.json` are dropped). Given `ang.local.json` sets it too, the local value wins.
- Given a feature is off, when `session banner` or `session subagent` runs, then its rule is not included.
- Given a feature exports `rule(value)` and also has a `rule.md`, then `rule(value)` wins.
- Given `session features` runs, then `pilot` is listed with its bootstrap question and marked personal, set by `/tailor-ang`.

## Test plan
- **Unit** — write first:
  - `src/.claude/ang/features/pilot/feature.test.mjs`: `config.check` returns `null` for `null` and `"Zac"`, an error for `""`, `"   "`, `42`; `on` is true for `"Zac"`, false for `null`.
  - `src/.claude/scripts/ang/features.test.mjs`: `featureRule` with fake feature objects over a temp `dir` (`fs.mkdtempSync`): `rule` export + `rule.md` → `rule(value)` output, called with `config[key]`; `rule.md` only → its trimmed text; neither → `null`.
- **Integration** — extend `src/.claude/scripts/cli.test.mjs` with the existing `project()` helper:
  - `ang.local.json` `{ pilot: 'Zac' }` → `session banner` exit 0, matches `/^Ang: pilot \(Zac\)$/m` and `/Zac is the pilot/`; `library validate` exits 0.
  - `ang.json` `{ intent: false }`, `ang.local.json` `{ pilot: 'Zac' }` → `session subagent` prints JSON whose `additionalContext` contains `## Pilot` and not `## Delivery intent` (proves off features are skipped through `onRules()`).
  - `ang.local.json` `{ pilot: '  ' }` → `library validate` exits 1 naming `pilot`.
  - Extend the `session features` test: `pilot` is marked personal.
  - The helper passes `input: ''`; the subagent case needs stdin JSON, so give `run` an optional input (e.g. `'{"agent_type":"Explore"}'`).
- **Won't test**: `onRules()` directly (a private one-line map over `onFeatures` + `featureRule`, needs module mocking; the subagent and banner integration cases cover it), pilot `banner`/`validate`/`bootstrap` (static data), the exact rule wording, the hook wiring in `settings.json`, this repo's `ang.local.json` (the banner proves it). No `session.test.mjs`: this deliberately departs from [C4 code](../c4/4-code.md), since everything it would test is IO-bound and already covered by integration.

## Implementation notes
- **Constraints**: `node:` built-ins only (ADR 0002), ESM `.mjs`, no `package.json`.
- `src/.claude/ang/features/pilot/feature.mjs`: copy [the spike's](../origins/generic-personal-defaults/spikes/pilot-feature/feature.mjs) unchanged. Rule text is load-bearing; don't reword it. No `rule.md` in this folder.
- `src/.claude/scripts/ang/features.mjs`:
  - import `pilot`; `FEATURES = [intent, streams, host, pilot]` (order sets banner order: `intent · host (orca) · pilot (Zac)`).
  - `export const featureRule = (feature, config) => (feature.rule ? feature.rule(config[feature.key]) : featureText(feature, 'rule.md'))`, per the [spike diff](../origins/generic-personal-defaults/spikes/pilot-feature/script-changes.diff).
  - Update the contract comment at :1-6: add `rule?(value) → text (in place of rule.md, when the rule depends on the value)`.
- `src/.claude/scripts/ang/commands/session.mjs`: private `onRules()` = `onFeatures(config).map((f) => featureRule(f, config)).filter(Boolean)`; `banner` and `subagent` use it in place of `onTexts('rule.md')`. `onTexts` stays for `steps` and agent add-ons.
- `config.mjs` needs no change: `LOCAL_KEYS` already includes `pilot`, and `CONFIG_DEFAULTS` picks up `pilot: null` from `FEATURES`.
- **This repo**: add `"pilot": "Zac"` to root `ang.local.json` (gitignored). Leave changes unstaged.
- **Edge cases**: a name with surrounding spaces (`" Zac "`) passes `check` and is used as given; fine, `/tailor-ang` writes it. Hook output budget: the rule adds ~200 characters against the 10,000-character limit.
- **Out of scope**: `/tailor-ang` asking for and writing the name (05); `10k/technical/project-structure.md` feature list (06); skills saying "me"/"the user" (03); the stale `.claude/ang.json` wording at `origins/.../pilot-name.md:9` (origin doc, frozen).

## Links
- [Plan: scope 3](../plan.md)
- [Spike diff](../origins/generic-personal-defaults/spikes/pilot-feature/script-changes.diff)
- [C4 components](../c4/3-components.md), [C4 code](../c4/4-code.md)

## Related
- [Epic hub](../README.md)
- [01 Config move](01-config-move.md)
- [Pilot name decision](../origins/generic-personal-defaults/shaping-content/pilot-name.md)
