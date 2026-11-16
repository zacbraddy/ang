---
title: /tailor-ang
shortDescription: A re-runnable skill that writes every per-user choice (host, pilot, output style, personal rule) into gitignored local files
tags: [distribution, brand-voice]
status: done
owner: both
dependsOn: [01, 02, 03, 04]
---
# /tailor-ang

## Summary
A new prose skill, with no script code, that a pilot runs on their own or that `/bootstrap-repo` invokes. In order, it: makes sure `.gitignore` covers the local files; detects the host; asks for the pilot name; shows the numbered style list (the five canned styles plus "Interview me" as 6); runs the 3-question personal-rule interview; previews every file; and writes the local files.

## Outcome
A teammate joining a bootstrapped repo runs `/tailor-ang` and gets their own name, host, style and personal rule without touching a tracked file.

## Done when
- `src/.claude/skills/tailor-ang/SKILL.md` exists. It is reachable as `/tailor-ang` here through the root `.claude/skills` symlink.
- Zac and the agent do two manual runs in a scratch repo with Ang installed. Run A picks a canned style (e.g. 2). Run B, a re-run, picks 6 and finishes the interview. After each run:
  - `git status --porcelain` lists nothing but `.gitignore`, and only when it had entries missing.
  - `git check-ignore` reports every file the run wrote.
  - `node .claude/scripts/ang-context-manager.mjs library validate` passes.
  - The next session's banner names the pilot, and `/output-style` shows the chosen style as active.
- Run B's generated style file follows the shape rules below: no line for an axis answered "none" or skipped, and no mention of another style.
- `library validate` passes in this repo.

## Acceptance criteria
- Given a repo whose `.gitignore` lacks a local pattern, when the skill starts, then it appends the missing patterns (unanchored: `ang.local.json`, `settings.local.json`, `*.local.md`) before anything else is written, creating `.gitignore` if it's absent.
- Given `TERM_PROGRAM=Orca` or `ORCA_WORKTREE_ID` is set, when tailoring runs, then `host` is `"orca"` without asking; otherwise it is `null`.
- Given the pilot question, when the user answers "skip" or "s", then `pilot` is `null`.
- Given the style picker, when it shows, then it opens with the low-stakes note and lists 1 to 6 in one plain message, each with its frontmatter `description`, and 1 marked default and recommended.
- Given "default" or "d" to the picker, then option 1 (Partner In Crime) is chosen.
- Given options 1 to 5, then `outputStyle` in `.claude/settings.local.json` is that style's `name`, and no style file is written.
- Given option 6, when the user answers the five questions, then the agent proposes a name, previews the whole file, and on confirmation writes `.claude/output-styles/<slug>.local.md`, and sets `outputStyle` to its name.
- Given option 6 with tone neutral or formal and humour none, then question 5 (serious mode) is not asked.
- Given an interview answer of "none", "skip" or "s", then the generated file has no line for that axis.
- Given "stop" during the style interview, then no style file is written, Partner In Crime is chosen, and the agent says so.
- Given the rule interview, when the repo has detectable languages or frameworks, then the stack question offers them as suggestions and writes only what the user confirms or types.
- Given all three rule questions are skipped, then `pilot.local.md` is not written, and any existing one is left alone.
- Given an existing `.claude/settings.local.json` with other keys (e.g. permissions), when the skill writes, then only `outputStyle` changes.
- Given an existing local file that isn't valid JSON, then the skill stops before writing it and names the file.
- Given a re-run, when each question shows, then the current local value is offered as the default, kept by replying "keep" or "k", and nothing is overwritten until the preview is confirmed.
- Given the preview, when the user declines, then nothing is written.

## Test plan
- **Unit / integration / E2E**: none. The skill is prose. The config it writes is already covered by `mergeConfig` and CLI tests from story 01.
- **Won't test**: the interview wording, or Claude Code honouring `outputStyle` (its behaviour, not ours). Config and markdown content, per `engineering-defaults.md`.
- **Checks**: the two manual runs in Done when. They are the acceptance test (plan, scope 6).

## Implementation notes
- **Frontmatter**: `name: tailor-ang`; a `description` that says it sets per-user choices in gitignored files, used when the user runs `/tailor-ang` or `/bootstrap-repo` reaches tailoring; `argument-hint` omitted. Leave out `disable-model-invocation`, so `/bootstrap-repo` can invoke it in story 06 (as with `bootstrap-quality`).
- **Prose only**: the skill tells the agent what to read and write. No new script commands.
- **Paths**: everything is relative to the project root. In this repo `.claude/rules` and `.claude/output-styles` are symlinks into `src/.claude/`, so files land there. That is correct, and the skill needn't mention it.
- **Step 1, gitignore**: check each of the three patterns with a plain line match. Append the missing ones and say which were added.
- **Step 2, personal config keys**: run `ang-context-manager.mjs session features` and handle each entry marked "personal, set by `/tailor-ang`" using its question and its "If yes" instruction. Today that means `host` (detected, never asked) and `pilot` (asked). A future `LOCAL_KEYS` feature then gets asked without editing the skill.
- **Step 3, style picker**: per [canned output styles: picker flow](../output-styles.md). Read names and descriptions from the frontmatter of the files in `.claude/output-styles/` that don't end `.local.md`, with Partner In Crime first. A plain numbered message, not a question dialog, because a dialog caps at 4 options. On a re-run, also list any existing `*.local.md` style as a keep option before 6, so a custom style isn't lost.
- **Option 6 interview**: the table, limits and output in [canned output styles: interview](../output-styles.md), asked one question at a time.
  - The file name is `<slug>.local.md`, the kebab-case of the proposed name. C4 wins over the `<name>` wording in older docs.
  - The generated file states only what it wants, in first person as the user ("me", "I"), like the canned files. Skipped or "none" axes get no line; the file never names another style.
- **Step 4, rule interview** (d16): three questions, one at a time, each skippable.
  - Role and experience: free text, e.g. "Senior engineer, 10 years, mostly agencies".
  - Default stack: scan manifests (`package.json`, `pyproject.toml`, `*.csproj`, IaC folders) and offer what's found as numbered suggestions plus free text. Write only what the user picks or types.
  - Solo or team: 1 solo · 2 small team · 3 larger organisation, plus free text.
  - Output: `.claude/rules/pilot.local.md` in this repo's shape: `# About the pilot`, then `## Role and experience`, `## Default stack` and `## Solo or team`, a short paragraph each, with skipped sections left out. Additive only; never restate `engineering-defaults.md`.
- **Step 5, preview**: show each file's full content, or for `settings.local.json` the merged result. One confirmation covers all of them; the user can edit a line before confirming.
- **Step 6, write**:
  - `ang.local.json`: `{ "host", "pilot" }`, keeping any other existing keys so `validate` warns about them rather than losing them silently.
  - `settings.local.json`: read, set `outputStyle` and write back.
  - Then run `library validate` and report the result.
- **Close** (Zac, at implementation): run on its own, the skill lists what it wrote and leaves `.gitignore` unstaged for the user to commit or ask for revisions. Inside `/bootstrap-repo` it hands back, and bootstrap's closing report covers review and commit. Either way the user is told to quit and restart Claude Code, because the banner, rule and style load only at startup.
- **No workflow-improvement nudge** (Zac, at implementation): a custom style is a personal choice, so the interview ends at writing the file. The AC, `output-styles.md` and d8 were updated to match.
- **Keep and default replies** (Zac, after the smoke test): Claude Code won't send an empty prompt, so a re-run keeps a value with "keep" or "k", the picker takes "default" or "d" for option 1, and "skip" or "s" skips a question. Each question names the short replies that apply.
- **Out of scope**: `/bootstrap-repo` calling the skill, and the docs and README updates (story 06). No changes to `config.mjs` or the features.

## Guide
1. Make a scratch repo: `mkdir /tmp/ang-scratch && cd $_ && git init`. Copy `src/.claude/` into it as `.claude/`, add a `package.json` with a dependency or two, and commit.
2. Leave `.gitignore` out for run A, so the gitignore step is exercised.
3. Run A: start Claude Code in the scratch repo and run `/tailor-ang`. Give a name, pick style 2, and answer the rule questions (skip one).
4. Check the Done-when commands, then start a new session and look at the banner and `/output-style`.
5. Run B: run `/tailor-ang` again. Confirm your earlier answers show as defaults, pick 6, answer "none" to humour and emoji, and finish the interview.
6. Check again, and read the generated style file for any "none" lines or mentions of other styles.
7. Delete the scratch repo.

**Agent prepares**: the scratch-repo commands above, and a one-line checklist of the Done-when commands to paste after each run.

**Record afterwards**: in this story's Review section, which runs passed and anything the interview got wrong. No credentials are involved.

## Review
- **Smoke test, 2026-11-16**: Zac ran both manual runs in a scratch repo, and both passed every Done-when check. Run A picked a shipped style (2) and skipped one rule question. Run B re-ran with the interview, a described tone answer and humour "none".
- **Interview issue found**: re-run prompts said "Enter keeps it", left over from the question-dialog design. Fixed to "keep"/"k", with "default"/"d" for the picker and "skip"/"s" for consistency. That wording is not yet re-run.

**Code review, 2026-11-16**: ACs, plan and C4 "Files `/tailor-ang` writes" all match; `library validate` passes. No must-fix.
- **Should-fix**: the "keep"/"k", "default"/"d" and "skip"/"s" replies (`src/.claude/skills/tailor-ang/SKILL.md:10-13`) landed after the smoke test, so the re-run AC has no evidence for them. A two-minute re-run up to the style picker covers it. Accepted without a re-run (Zac): small wording change, scratch repo already removed.
- **Nit**: `SKILL.md:24` says "six options", but a re-run with a kept local style lists seven. "Too many options for a question dialog" holds either way. Fixed.
- **Nit**: `SKILL.md:18` matches gitignore lines exactly, so an existing equivalent such as `/ang.local.json` gets a harmless duplicate appended. Checking each target with `git check-ignore` would avoid it, at the cost of a slightly longer step. Left as is.

## Links
- [Plan: scope 6](../plan.md)
- [C4 code: files /tailor-ang writes](../c4/4-code.md)
- [Canned output styles: picker and interview](../output-styles.md)
- [Tailoring and config overlay](../origins/generic-personal-defaults/shaping-content/tailoring.md)

## Related
- [Epic hub](../README.md)
- [04 Output styles](04-output-styles.md)
- [06 Bootstrap and docs](06-bootstrap-and-docs.md)
