---
title: README whistle-stop rewrite
shortDescription: The root README becomes the whistle-stop tour, covering 4 concepts, 13 commands, the funnel table, install and a link to the site
tags: [documentation, open-source, brand-voice]
status: done
owner: agent
dependsOn: []
---
# README whistle-stop rewrite

## Summary
The first release deliverable. It ships on its own, ahead of the site (d1). A reader can install Ang and run one full funnel loop from the README alone (d2). Everything deeper is left to the site.

## Outcome
The root `README.md` holds the sections in [C4 code: README sections](../c4/4-code.md#readme-sections): the one-liner, the quick start (install one-liner, Node 26+, the WSL (Windows Subsystem for Linux) note, then `/bootstrap-repo`, which runs `/tailor-ang` itself, so `/tailor-ang` is named only for later tweaks), the 4 concepts plus Orca as an optional integration, the funnel table, bending Ang, a "So much more" section pointing on to the docs, the link to `https://zacbraddy.github.io/ang/`, and credits with the MIT licence. It is written in Zac's voice, trimmed.

## Rough scope
- Content from the [content cut](../origins/repo-readme/shaping-content/content-cut.md) (k3). Install facts are copied from the install epic's shipped files at write time (plan Risks).
- The site link goes in from day one, even though it stays dead until story 02 deploys (plan Sequencing).
- No status badges. Open-source-hygiene adds them with its CI (d12).
- Links to CONTRIBUTING or the code of conduct only if they exist when this ships (plan Out of scope).

## Done when
- The root `README.md` holds the 8 [C4 README sections](../c4/4-code.md#readme-sections), in order, and nothing else.
- Each claim matches a shipped file: the install facts match `install.sh` on `stream/install-uninstall-update`, and the commands and stage questions match `src/project-context/README.md`.
- Zac has read it in GitHub's preview and clicked every link. The site link 404s until story 02 ships, and that is expected.

## Acceptance criteria
- Given a new reader, when they read only the README, then they can install Ang, run `/bootstrap-repo` (which tailors Ang as it goes), and run one loop from `/ideate` to `/retro`.
- Given the quick start, when a reader copies the install line, then it is exactly `curl -fsSL https://github.com/zacbraddy/ang/releases/latest/download/install.sh | sh`. It is followed by Node 26+ and the WSL note ("runs inside WSL, not Git Bash, MSYS or Cygwin").
- Given the funnel table, when a reader scans it, then it has one row per stage from raw to retro, each with its stage question and every command for that stage.
- Given a reader on Windows outside WSL, when they read the quick start, then they learn to use WSL before they hit an error.
- Given a command left to the site (`/kill`, `/curate-10k`, `/curate-tags`, `/trigger`, `/bootstrap-quality`, `/start-stream`, `/end-stream`, `/read-mail`), when a reader looks for it, then the README doesn't name it, and the "So much more" section points them on to the site.
- Given the credits, when a reader looks for them, then they find "developed by Zac Braddy and is sponsored by We Right Code", with Zac's name linking to https://zackerthehacker.com, plus MIT. We Right Code gets no link.
- Given the repo root, when the README ships, then it has no badges and no CONTRIBUTING or code of conduct links, because neither file exists.

## Test plan
No automated tests. The repo has no Markdown lint or link checker, and the plan makes the site build the only gate.
- **Review check** (done in `/review-story`):
  - Diff every install fact against `install.sh` (`git show stream/install-uninstall-update:install.sh`).
  - Check the funnel rows against the Workflow table in `src/project-context/README.md`.
  - Check the commands against `.claude/skills/`, so every named command exists.
- **Won't test:** that the install URL resolves, which can't happen before the first release. Install's release preflight warns if the README one-liner drifts (install d18).

## Implementation notes
- **File:** the root `README.md` only. It's 270 bytes today, so replace it wholesale. Leave `LICENSE` (MIT, 2026 Zac Braddy) untouched; the README only links to it.
- **Sections:** follow [C4 README sections](../c4/4-code.md#readme-sections).
  - *How it works:* 4 concepts from the [content cut](../origins/repo-readme/shaping-content/content-cut.md): the funnel, the context library (`10k/` is truth), "a starter, not the loaf", and streams in one line that names Orca.
  - *The funnel:* the rows are raw → retro from the shipped Workflow table (`src/project-context/README.md`). Name 10k in prose as the place retro promotes to; it has no command, so it gets no row. Execution's command cell is `/break-down-epic`, then `/write-story` → `/implement-story` → `/review-story`.
  - *Bending Ang:* `/raise-workflow-improvement` and `/improve-workflow`, then "and a few more" linking to the site.
- **Install facts:** copy them from `install.sh` at write time (plan Risks) and use Node 26+, not the 21+ in `10k/technical/project-structure.md`. If install has changed on its branch since this story was written, the branch wins.
- **Voice:** follow [voice and attribution](/project-context/10k/marketing/voice-and-attribution.md): conversational, opinionated, a bit whimsical, trimmed. Write from the files, not from the brain dump ([brief](../origins/repo-readme/shaping-content/brief.md)). There's no length target, but every line has to help a reader run a loop.
- **Links:** the README sits outside `project-context/`, so link only to public targets (the site, `LICENSE`, zackerthehacker.com). Never link into `project-context/`.
- **Out of scope:**
  - badges (d12)
  - CONTRIBUTING, code of conduct, "fork it"
  - the site itself (story 02)
  - any change to Ang's behaviour

## Review
All 8 C4 sections are present and in order. The install line, Node 26+ and the WSL wording match `install.sh` on `stream/install-uninstall-update`. The funnel rows match the shipped Workflow table, every named command exists in `.claude/skills/`, no left-to-the-site command is named, and the credits match the acceptance criteria. Zac's GitHub-preview link check isn't something a review can see; `voice-lessons.md` records his sign-off.

**Must-fix:** none.

**Should-fix**
- `README.md:9`: `install.sh` (`check_clean`) refuses to run with uncommitted or untracked changes, and the quick start doesn't say so, so a reader in a dirty repo hits that error first. Say "with a clean working tree".
- `voice-lessons.md:19`: says the README links both https://orca.dev and the GitHub repo, but `README.md:23` links only GitHub. Fix whichever one is wrong.
- `README.md:69`: the meme image has no `alt` text, so screen readers get nothing. Add one.

**Nit**
- `voice-lessons.md:16`: the quoted phrases ("hunt for typos", "the final say is **always** down to me") aren't the README's words (`README.md:38-39`). This doc is the voice sample, so quote the README exactly or drop the quote marks.
- `README.md:64`: "Credits and licence" is the only heading with no emoji, which breaks the rule in `voice-lessons.md:15`.
- `README.md:56`: "work stream merging" oversells it. Merging between streams is the user's job (`.claude/ang/features/streams/conventions.md:3`), and Ang only guides it. "Item merging" would be accurate.

## Related
- [Plan: Scope and Sequencing](../plan.md)
- [README brief](../origins/repo-readme/shaping-content/brief.md)
- [Voice and attribution](/project-context/10k/marketing/voice-and-attribution.md)
