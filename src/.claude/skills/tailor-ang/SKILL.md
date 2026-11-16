---
name: tailor-ang
description: Sets the user's per-user Ang choices (workspace host, pilot name, output style, personal rule) in gitignored local files, so tracked files stay shared. Use when the user runs /tailor-ang, or when /bootstrap-repo reaches its tailoring step. Safe to re-run.
---

# /tailor-ang: make Ang yours

Everything here is per user and lands in gitignored files. Paths are relative to the project root. Ask one question at a time. Collect every answer first; write nothing except `.gitignore` until step 5 is confirmed.

Each question names the short replies that apply to it:
- **"keep" or "k"**: on a re-run, keeps the current value, which you read from the existing local files and show with the question.
- **"skip" or "s"**: leaves that answer out.
- **"default" or "d"**: in the style picker, chooses option 1.

Before anything else, read `ang.local.json` and `.claude/settings.local.json` if they exist. If either isn't valid JSON, stop, name the file, and ask the user to fix or delete it.

## 1. Gitignore
Check `.gitignore` (create it if absent) for each of these lines, matched exactly: `ang.local.json`, `settings.local.json`, `*.local.md`. Append the missing ones and say which you added.

## 2. Personal config keys
Run `node .claude/scripts/ang-context-manager.mjs session features`. For each entry marked "personal, set by `/tailor-ang`", follow its question and its "If yes" instruction. Some say to detect the value rather than ask. A skipped answer means `null`.

## 3. Output style
Read `name` and `description` from the frontmatter of each file in `.claude/output-styles/` whose name doesn't end `.local.md`. Send one plain numbered message (too many options for a question dialog):

- Open with: this is a low-stakes choice. `/output-style` switches between shipped styles any time, and re-running `/tailor-ang` builds a custom one later.
- 1 is Partner In Crime, marked "default, recommended". The other shipped styles follow, then on a re-run any existing `*.local.md` style as "keep <name>", then "Interview me" last. Each line: number, name, description.

"default" or "d" means 1. A shipped or kept style sets `outputStyle` to its `name` and writes no style file.

### Interview me
Picking it means the shipped styles didn't fit: the user is crafting a style of their own. Ask these five, one at a time. With each question, say the numbers are shortcuts for when they have no strong view, and that they can instead describe what they want in their own words.

| # | Axis | Choices |
|---|---|---|
| 1 | Tone | 1 playful · 2 warm · 3 neutral · 4 formal |
| 2 | Verbosity | 1 minimal · 2 balanced · 3 thorough (explains the why) |
| 3 | Reply shape | 1 answer first, then bullets · 2 prose · 3 fixed sections (you name them) · 4 reasoning narrated as it goes |
| 4 | Humour and emoji | 1 none · 2 occasional · 3 liberal |
| 5 | Serious mode: when to drop the personality | 1 when something is on fire · 2 only when I say · 3 never change |

- A number takes that choice as written.
- A described answer is a strong preference: carry its meaning into the file, in the user's own terms, however far it sits from the choices. Echo back what you understood in a sentence. Ask at most one follow-up per question, only to clear up an ambiguity or a contradiction with an earlier answer.
- Ask question 5 only when the style has a personality to drop: playful or warm tone, any humour, or anything similar the user described.
- "skip", "s" or "none" on an axis leaves that axis out of the file entirely.
- "stop" ends the interview: choose Partner In Crime, write no style file, and say so.

Then propose a name that captures the answers (e.g. "Formal Narrator") and draft the file, shaped like the shipped ones:
- Frontmatter: `name`, a one-line `description`, `keep-coding-instructions: true`.
- `# Voice` from answers 1, 4 and 5; `# Shape of every reply` from answers 2 and 3.
- Short bullets written as the user ("me", "I"), stating only what they want. An axis that was skipped or answered "none" gets no line.

It goes to `.claude/output-styles/<slug>.local.md`, where the slug is the kebab-case name, and `outputStyle` is set to that name.

## 4. Personal rule
Three questions, one at a time, each skippable:
1. **Role and experience**: free text, e.g. "Senior engineer, 10 years, mostly agencies".
2. **Default stack**: scan the repo's manifests (`package.json`, `pyproject.toml`, `*.csproj`, IaC folders such as `terraform/` or `cdk.json`) and offer what you find as numbered suggestions, plus free text. Use only what the user picks or types.
3. **Solo or team**: 1 solo · 2 small team · 3 larger organisation, or free text.

The output is `.claude/rules/pilot.local.md`: `# About the pilot`, then `## Role and experience`, `## Default stack` and `## Solo or team`, a short paragraph each, keeping only the answered sections. It adds to `.claude/rules/engineering-defaults.md`, so it carries only what's personal. If all three are skipped, leave any existing `pilot.local.md` as it is and write none.

## 5. Preview
Show the full content of every file you'll write:
- `ang.local.json`: the personal keys from step 2, merged over any keys already there.
- `.claude/settings.local.json`: the existing file with only `outputStyle` set.
- The style file, if the interview ran.
- `pilot.local.md`, if any rule question was answered.

One confirmation covers them all. The user may rename the style or edit a line first; anything bigger means re-running that step. A decline writes nothing.

## 6. Write
Write the previewed files exactly, then run `node .claude/scripts/ang-context-manager.mjs library validate` and report the result.

## 7. Hand back
- **Invoked by `/bootstrap-repo`**: return to its next step. Its closing report covers review, commit and restart for everything the bootstrap changed.
- **Run on its own**: list each file written, with its path. Only `.gitignore` shows in `git status`, and only if it changed; the others are gitignored, so the user reviews them on disk. Changes stay unstaged: ask the user to commit `.gitignore` if they're happy, or to say what to revise. Then tell them to quit Claude Code and start it again, because the banner, rule and style load only at startup.
