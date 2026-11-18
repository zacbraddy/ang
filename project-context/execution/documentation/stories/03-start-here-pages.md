---
title: Start here pages
shortDescription: Quick start, Trying Ang alongside your framework, Your first loop, Upgrading and Uninstalling pages are live on the site
tags: [documentation, distribution]
status: ready
owner: agent
dependsOn: [02]
---
# Start here pages

## Summary
The "get it running" group: someone landing from the README or the home page goes from nothing to Ang installed and one loop run.

## Outcome
`start-here/quick-start`, `start-here/alongside-your-framework`, `start-here/first-loop`, `start-here/upgrading` and `start-here/uninstalling` are live. Quick start covers the install line, prerequisites (Node 26+), platforms, Windows through WSL (Windows Subsystem for Linux), the best-effort native Windows manual install as its own section, `/bootstrap-repo`, `/tailor-ang`, and one line each on the two starting points. Trying Ang alongside your framework shows a reader on BMAD, Spec Kit or similar how to trial Ang on a branch with streams off, then either back out or have Ang run the migration onto itself (d13). Your first loop runs the funnel skills end to end once. Upgrading explains `/upgrade-ang`: the clean-tree start, the four routes in the user's terms, the never-commit finish with how to review or drop the result, why the upgrade is agent-run rather than deterministic, and committing `.claude/ang/version.json` (k25). Uninstalling removes Ang by hand, which doubles as the way out of a trial.

## Rough scope
- Sources per the [page map](../information-architecture.md#page-map): Start here rows. Check the native Windows steps and the install facts against the shipped files at write time (k20, plan Risks).
- The alongside page's claims come from Zac's own migrations (ET 1, evidence tier 1: a primary source) and from `install.sh`: install stops if `project-context/` or a same-named skill exists, so say what to rename first. Don't promise coexistence details the files don't show.
- The Upgrading page's brief is the [upgrade routes](https://github.com/zacbraddy/ang/blob/stream/install-uninstall-update/project-context/execution/install-upgrade-release/upgrade-routes.md) doc's "What the user docs should cover" (on `main` once the install epic merges). The shipped `upgrade-ang` skill and `upgrade/size.mjs` win over it: route names, thresholds (agent-resolved up to 5 conflicted files, guided with warning from 12) and steps. Frame the agent-run upgrade as Ang helping in a hard situation, not as a caveat.
- No uninstall command exists. The page lists what to remove from the shipped tree; it doesn't add one.
- Link to the concept and command pages by their planned slugs ([C4 code: Content pages](../c4/4-code.md#content-pages)).

## Done when
- The 5 pages exist under `docs/src/content/docs/start-here/` and `npm run build` in `docs/` passes, with only the known chunk-size, `i18n` and `404` notices.
- Under `npm run preview`, the sidebar's Start here group lists the 5 pages in order. The home page's 🚀 Quick start button now lands on a real page.
- Every install and upgrade fact on the pages is traced to a line in the shipped files on `stream/install-uninstall-update`, and the commit SHA read is noted under As built.
- A trigger exists to re-check the Start here pages against the shipped files once the install epic merges to `main`.
- Zac has read the pages in the preview, in light and dark mode, and signed off on the voice.

## Acceptance criteria
- **Given** a reader on Quick start, **when** they follow it top to bottom on macOS, Linux or WSL, **then** they meet the prerequisites (git repo root, clean tree, Node 26+ with npx), the one-liner, what the install prints, then `/bootstrap-repo`, in that order.
- **Given** a reader on native Windows, **when** they reach Quick start's Windows section, **then** they see that WSL is the supported route (`install.sh` stops under Git Bash, MSYS and Cygwin). A separate section marked untested and best effort gives the manual steps, which need Git for Windows.
- **Given** a reader who is choosing a starting point, **when** they read Quick start's `/bootstrap-repo` section, **then** they get one line each on an existing repo (brownfield: Ang surveys the code) and a fresh repo (drop a brain dump in `project-context/raw/` first). They're told bootstrap runs `/tailor-ang` itself, so they only rerun it to tweak.
- **Given** a repo that already has `project-context/`, a same-named skill folder or another file Ang ships, **when** the reader reads the alongside page, **then** they know install stops and lists the clashes, and they know to rename, commit and rerun.
- **Given** a reader trialling Ang, **when** they finish the alongside page, **then** they have both exits: back out through Uninstalling, or have Ang run a migration of their old framework's docs onto Ang.
- **Given** a reader on Your first loop, **when** they read it top to bottom, **then** they meet every funnel command in run order, `/ideate` through `/retro`, one fresh session each. Each step says what they do, what Ang hands back, and where it lands in `project-context/`.
- **Given** a reader on Upgrading, **when** they read the routes section, **then** each of the 4 routes says when they get asked something and why, with the thresholds from `size.mjs`: agent-resolved up to 5 conflicted files, guided above 5, guided with warning from 12 or with no version record.
- **Given** an upgrade they don't like, **when** they read Upgrading's finish section, **then** they can review it (`git status`, `git diff`) and drop it (`git restore . && git clean -fd`), and they know to commit `.claude/ang/version.json` with the rest.
- **Given** a reader removing Ang, **when** they follow Uninstalling, **then** every path that install and bootstrap add is either removed or deliberately kept. That covers `project-context/`, which is their call, and `.claude/settings.json`, which comes back from `.claude/settings.json.pre-ang` if it exists, otherwise by stripping Ang's entries.
- **Given** any Start here page, **when** it links to another page, **then** the link is a relative route to a slug in [C4 code: Content pages](../c4/4-code.md#content-pages), never `/ang/…`.

## Test plan
No unit or integration tests: these are content pages with no code (plan Test strategy, `engineering-defaults.md`).
- **Build gate:** `npm run build` in `docs/`.
- **Fact check:** read every install and upgrade claim against `git show stream/install-uninstall-update:<path>`, mainly `install.sh`, `src/.claude/skills/upgrade-ang/SKILL.md` and `src/.claude/scripts/ang/upgrade/size.mjs`. Read the funnel claims against `src/.claude/skills/*/SKILL.md` on this branch.
- **Click-through:** under `npm run preview`, click every link on the 5 pages. Links to pages that stories 04–09 haven't written yet 404, which is expected. List them under As built so the last content story can recheck them.
- **Screenshots:** light and dark shots of Quick start with [`shoot.mjs`](../origins/docs-website/spikes/_tools/shoot.mjs), for Zac's review.
- **Won't test:** actually running the native Windows manual steps (best effort and untested by decision) or a real `/upgrade-ang` (the install epic's job).

## Implementation notes
- **Files:** `docs/src/content/docs/start-here/{quick-start,alongside-your-framework,first-loop,upgrading,uninstalling}.md`. Each needs `title`, `description` and `sidebar.order` 1–5, in that order. Use `.mdx` only if a page needs a Starlight component, and use `:::note`/`:::caution` asides for callouts. No config edits.
- **Voice:** follow [voice lessons](../voice-lessons.md). Put an emoji at the left of every heading, write in the first person from the reader's seat, give every mechanism a "so that", and hand off between sections. Write the first draft at the README's level of whimsy.
- **Source of truth:** the shipped files are on `stream/install-uninstall-update` only, not on `main` or this branch. Read them with `git show`, not by checking the branch out. They win over the upgrade-routes doc and over this story. Where they disagree, follow the files and flag it.
- **Quick start:**
  - Copy the one-liner and the WSL note from the root `README.md`, which matches `install.sh`.
  - Mention `… | sh -s -- <tag>` for pinning a release (from `install.sh`'s header).
  - What the install does, from `install.sh`'s checks and steps, at trust level. It checks everything before touching the repo, downloads into a temp folder, stops on clashes, merges `.claude/settings.json` (keeping the reader's values and backing theirs up to `.pre-ang`) and records the version.
  - **Native Windows section:** no written steps exist anywhere (state.json's "6-step manual install" is only an outline). Derive them from `install.sh`:
    1. Git for Windows and Node 26+.
    2. A clean tree at the repo root.
    3. `npx -y giget@3.3.1 "gh:zacbraddy/ang/src#<tag>" <temp> --force`.
    4. Copy everything except `.claude/settings.json` in.
    5. `node .claude/scripts/ang-context-manager.mjs settings merge --base none --ours .claude/settings.json --theirs <temp>/.claude/settings.json`.
    6. `… version write --ref <tag> --sha <sha>`.

    Check every command's flags against `src/.claude/scripts/ang/commands/` on the install branch. Say that hooks run in Git Bash, so Git for Windows isn't optional (parked note "Shell-free hook commands").
  - **Starting points:** brownfield and founding, from `bootstrap-repo`'s `argument-hint` and the brain dump's *How I personally intend to use Ang*. Keep it to the points, one line each (d5).
- **Alongside your framework:**
  - Trial on a branch, and turn streams off when `/bootstrap-repo` asks about features (`ang.json` `"streams": false`), so the trial stays one branch.
  - Clashes come from `check_collisions`: `project-context/`, any skill folder Ang ships, and any other shipped file. `.claude/settings.json` merges rather than clashes.
  - **Migration exit:** drop the old framework's docs into `project-context/raw/` and run `/ideate`, or `/bootstrap-repo brownfield`. Zac has done this himself (ET 1). Don't claim more coexistence than the files show.
- **First loop:** walk `raw → ideas → shaping → planning → execution → retro → 10k` with one running example. Take each step's output and its "Next:" line from that skill's `SKILL.md`, not from the README table. Link to the `commands/funnel/` and `concepts/funnel/` pages, not to per-command anchors (story 06 sets those).
- **Upgrading:**
  - Steps from `upgrade-ang/SKILL.md`: checks, target (latest or `/upgrade-ang <tag>`), fetch, plan, warn, resolve, apply, finish.
  - Routes from `size.mjs`'s `chooseRoute`, told from the reader's seat:
    - **fast:** asks nothing.
    - **agent-resolved:** asks nothing, and flags risky calls in the summary.
    - **guided:** asks about each risky merge, one at a time.
    - **guided with warning:** shows the counts, the risk and the fork option first.
  - **Why it's agent-run:** a textual merge can't tell the reader's customisation from upstream's intent. The clean tree and never-commit finish make any wrong call cost a review, not lost work.
  - **Install branch caveat:** `size.mjs` says its thresholds get tuned after the rc.2 rehearsal (install story 13), so they may move. That's what the re-check trigger is for.
- **Uninstalling:**
  - Build the list from the shipped tree (`git ls-tree -r --name-only stream/install-uninstall-update src`): `.claude/agents`, `.claude/ang`, `.claude/output-styles`, `.claude/rules`, `.claude/scripts`, `.claude/skills` (Ang's folders only), `docs/procedures` and `project-context/`.
  - Add what bootstrap and tailor write: `ang.json`, `ang.local.json`, the `*.local.md` rule files and the `.gitignore` lines. Check those in `bootstrap-repo` and `tailor-ang`'s `SKILL.md`.
  - **Settings:** restore `.pre-ang`, or remove the hooks and permissions Ang ships (diff against `src/.claude/settings.json`).
  - Keeping `project-context/` is a legitimate choice, since it's the reader's own docs.
  - Finish with "review the diff and commit", which matches the alongside page's back-out.
- **Trigger:** use the `trigger` skill. The condition is the install epic merged to `main` (`git branch -r --merged origin/main` lists `origin/stream/install-uninstall-update`). The action is to re-check Start here's install, Windows, upgrade and uninstall facts against the files on `main`.
- **Out of scope:**
  - any change to `install.sh`, `upgrade-ang` or other shipped files
  - an uninstall command
  - the README
  - the home page (story 02 finished it)
  - concept and command pages (stories 04–07)

## Related
- [Voice lessons from the README](../voice-lessons.md)
- [Plan: Sequencing step 3](../plan.md)
- [What Ang is](/project-context/10k/product/what-ang-is.md)
