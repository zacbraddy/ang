---
title: Commands, library upkeep, setup, streams and bending
shortDescription: The four remaining command pages are live, covering 12 commands with one anchor each
tags: [documentation]
status: ready
owner: agent
dependsOn: [02]
---
# Commands: library upkeep, setup, streams and bending

## Summary
The commands outside the funnel. They are run less often, so they're kept short, on four grouped pages (d5).

## Outcome
`commands/library-upkeep` (`kill`, `curate-10k`, `curate-tags`, `trigger`), `commands/setup` (`bootstrap-repo`, `tailor-ang`, `bootstrap-quality`), `commands/streams` (`start-stream`, `end-stream`, `read-mail`) and `commands/bending` (`raise-workflow-improvement`, `improve-workflow`) are live, with one `##` heading per command.

## Rough scope
- Source: each command's shipped skill under `src/.claude/skills/`, from the user's side.
- Heading text matches the command name so anchors stay stable.

## Done when
- `library-upkeep.md`, `setup.md`, `streams.md` and `bending.md` exist in `docs/src/content/docs/commands/`, and `npm run build` in `docs/` passes with only the known chunk-size, `i18n` and `404` notices.
- The sidebar's Commands group reads Funnel, Library upkeep, Setup, Streams, Bending Ang, in that order.
- The 8 inbound links land on their pages: `concepts/context-library.md:48`, `concepts/triggers.md:101`, `concepts/funnel.md:124` and `commands/funnel.md:188` (library upkeep); `concepts/evidence-standard.md:48` and `commands/funnel.md:44` (setup); `concepts/streams-and-mail.md:122` (streams); `concepts/bending-ang.md:64` (bending).
- The built pages hold the 12 anchors (grep each `dist/commands/<page>/index.html`): `#-kill`, `#-curate-10k`, `#-curate-tags`, `#-trigger`, `#-bootstrap-repo`, `#-tailor-ang`, `#-bootstrap-quality`, `#-start-stream`, `#-end-stream`, `#-read-mail`, `#-raise-workflow-improvement`, `#-improve-workflow`. Built-in search finds `curate-tags` and `read-mail` on their pages.
- Every claim about how a command behaves is traced to its shipped `src/.claude/skills/<name>/SKILL.md`, the feature steps it pulls in (`src/.claude/ang/features/{streams,host,intent}/steps/`) or `src/.claude/ang/features/streams/read-mail.md`, on this branch.
- Zac has read the four pages on the dev server (`npm run dev`), in light and dark mode, and signed off on the voice.

## Acceptance criteria
- **Given** a reader who has read the matching Concepts page, **when** they open a command's section, **then** they get what that page leaves out (the argument, what it asks, what it changes, what it commits, what can bite) and a link back for the why, not a retelling of it.
- **Given** any command, **when** a reader checks the at-a-glance table, **then** they can see whether only they can start it or Ang may also run it mid-session (`kill`, `trigger`, `tailor-ang`, `bootstrap-quality`, `raise-workflow-improvement`).
- **Given** a reader on `/kill`, **when** they read it, **then** they know it needs their explicit agreement, works on ideas and shaping items, records the reason for them to commit first, and then deletes the folder in a commit Ang makes itself, with the message shape and why git is the archive.
- **Given** a reader on `/curate-10k` or `/curate-tags`, **when** they read it, **then** they know what each checks (claims against code, or for them to confirm; tags past 50, merges, removals, a watch list), that fixes come five at a time for their yes, and that changes stay unstaged.
- **Given** a reader on `/trigger`, **when** they read it, **then** they know its two jobs (add, or run one by slug in a fresh session), that `validate` tells them when one is ready, and that removing it is their call, linking Concepts: Triggers for the rest.
- **Given** a reader on `/bootstrap-repo`, **when** they read it, **then** they know it runs once on an empty `10k/`, the founding and brownfield modes, that it asks about optional features and writes `ang.json`, hands off to `/tailor-ang` and `/bootstrap-quality`, deletes processed raw inputs, writes leftovers to `raw/` with their yes, and ends by telling them to restart Claude Code.
- **Given** a reader on `/tailor-ang`, **when** they read it, **then** they know it's safe to re-run, what it sets (host, pilot name, output style, personal rule), the keep, skip and default shortcuts, that it previews everything before one confirmation, that its files are gitignored, and that a restart picks them up.
- **Given** a reader on `/bootstrap-quality`, **when** they read it, **then** they know it extends what the repo already has, proposes before installing, keeps pre-commit to staged files and full tests in CI, and writes no tests for the tooling.
- **Given** a reader on the Streams page with streams off, **when** they arrive, **then** the page tells them up front these need `streams: true` and links Config, and `/read-mail` says it stops when streams are off.
- **Given** a reader on `/start-stream`, `/end-stream` or `/read-mail`, **when** they read it, **then** they know what they pass, what's committed to `ang/streams` (and that nothing lands on their branch), that `/end-stream` refuses an unmerged branch unless they abandon it, never forces a dirty worktree, and asks forward, record or drop for each waiting note, and that `/read-mail` proposes one disposition per note for their yes and handles a note only after recording it.
- **Given** a reader on the Bending page, **when** they read it, **then** they know `/raise-workflow-improvement` only records an item in `workflow-improvements/` (adding to a matching one) and edits nothing, and that `/improve-workflow` agrees the pick and the change with them, implements it, deletes the item and leaves everything unstaged.
- **Given** any link on the four pages, **when** it's clicked, **then** it's a relative route to a slug in [C4 code: Content pages](../c4/4-code.md#content-pages), never `/ang/…`.

## Test plan
No unit or integration tests: content pages with no code (plan Test strategy, `engineering-defaults.md`).
- **Build gate:** `npm run build` in `docs/`, then grep the four built pages for the 12 anchors.
- **Fact check:** read every behaviour claim against the 12 `SKILL.md` files, `features/streams/read-mail.md` and the feature steps (`node .claude/scripts/ang-context-manager.mjs session steps <skill>` lists them).
- **Click-through:** under `npm run dev`, click every link on the four pages and the 8 inbound links. Links into `reference/` and `why/` 404 until stories 08 and 09: list them under As built. Search `curate-tags` and `read-mail` and check each lands on its anchor.
- **Won't test:** phone-width layout beyond a glance, and the skills' behaviour itself.

## Implementation notes
- **Files:** `docs/src/content/docs/commands/{library-upkeep,setup,streams,bending}.md`, `sidebar.order` 2 to 5 in that order. Titles follow the inbound link text and funnel's `The funnel` style: `Library upkeep`, `Setup`, `Streams`, `Bending Ang`. Each has a `description`. No sidebar config edit.
- **Shape, copied from `commands/funnel.md`:** a short intro linking the matching Concepts or Start here page for the why, an `## 🧾 At a glance` table, then one `## <emoji> /<command>` section per command opening **Run it when** … **Pass it** …. Anchors come out as `#-kill` etc. Pick a fresh emoji per command, not one already used for a command on `funnel.md` or `first-loop.md`, and none with a variation selector.
- **At-a-glance columns:** Command, Run it when, Who starts it (you only, or Ang may offer it mid-session; from `disable-model-invocation`), You get back.
- **Don't repeat the Concepts pages.** These already cover a lot, so each section is the reference detail plus a link:
  - kill: `concepts/funnel.md` "Killing an idea" (#-killing-an-idea)
  - curate-10k: `concepts/context-library.md` 10k view section
  - trigger: `concepts/triggers.md` Adding one, Running a ready trigger, When a trigger points at nothing
  - bootstrap-repo and tailor-ang: `start-here/quick-start.md` Bootstrap and Tailoring
  - start-stream, end-stream, read-mail: `concepts/streams-and-mail.md` Starting and ending, Reading your mail
  - raise and improve: `concepts/bending-ang.md` The bending loop
- **Per command**, from its skill:
  - `/kill <item>`: agreement gate (if you haven't agreed, it gives the case in up to 3 bullets and asks); reason recorded as a decision, you commit; then it deletes the folder, fixes links via validate and commits `kill: <slug> — <reason>`, reporting the hash. Ideas and shaping items only.
  - `/curate-10k [department or path]`: validate first; parallel checks per slice, technical claims against code with file:line evidence, others for consistency, some flagged for you; also hunts ADRs that no longer bind, duplicated facts, docs over ~300 lines and orphans; fixes 5 at a time as rewrite, merge or delete; replaces content, never annotates history. Intent aside: leaves `10k/intent.md` out of the check and asks whether your intent still holds.
  - `/curate-tags` (no argument): aim under 50 tags; `validate` suggests it past 50; merge clusters, unused removals and a watch list of single-use tags; 5 clusters at a time; before and after counts.
  - `/trigger [add <what> | <slug>]`: what a trigger is in one line, then the two jobs; the five states a run can find the work in (ready as written, already done, half done, drifted, no longer relevant) in one sentence; deletion asks you; manual triggers walk you through step by step. Streams aside: a condition can wait on another stream's branch (`stream:<stream>:…`).
  - `/bootstrap-repo [founding|brownfield] [inputs]`: refuses a non-empty `10k/` and points at `/retro` or `/curate-10k`; the two modes and that both can apply; your own statements count as top-tier evidence, other inputs keep their real standing (link `../../concepts/evidence-standard/`); proposals 5 at a time with evidence per fact; brownfield reads the code over the README and leaves your existing docs alone; asks about each optional feature and writes `ang.json`; runs `/tailor-ang`, then `/bootstrap-quality` if there's code (failing rules set to warn, listed as debt); leftovers, raw deletion, restart.
  - `/tailor-ang` (no argument): per-user, gitignored (`ang.local.json`, `.claude/settings.local.json`, `.claude/rules/pilot.local.md`, an optional `.claude/output-styles/<slug>.local.md`); host is detected, not asked; the output style picker with Partner In Crime as default and the five-question interview for a custom style; the three personal rule questions; one preview and confirmation; only `.gitignore` shows in `git status`; restart. Mention `/output-style` switches shipped styles any time.
  - `/bootstrap-quality` (no argument): detects languages and existing setup; the default picks per language (TS ESLint, Prettier, Vitest; Python Ruff, pytest; .NET dotnet format, xUnit) as a proposal you approve; formatter owns style; pre-commit staged-only; one CI workflow on your existing provider; runs each check once and adds a "Running checks" note to the README.
  - `/start-stream <slug> ["focus"]`: from main; stops if the slug's taken; asks to cut from `origin/main` when main is behind and never pulls for you; worktree beside the trunk; `.worktreeinclude` copy; registration commits to `ang/streams`; reminds you to install dependencies. Orca aside: the host creates the worktree as a workspace under `~/orca/workspaces/` and runs setup, so its location differs, link `../../concepts/streams-and-mail/#-orca-optional`.
  - `/end-stream <slug>`: the steps the concept page skips: run from this stream's own checkout and it skips the worktree removal; branch deletion `-d` for merged, `-D` only for abandoned, plus the remote; only `ang/streams` commits, recorded notes left unstaged. Orca aside: the card is marked completed and removed with the worktree.
  - `/read-mail` (no argument): also starts when you just ask in plain words; one note at a time; the four dispositions (no effect, fold into an item, raise a trigger, save as raw input for `/ideate` in a fresh session), "no effect" being normal; a note isn't evidence, so Ang cites the sender's branch; recorded before handled, because handling deletes the note; leave one unhandled and the banner keeps count.
  - `/raise-workflow-improvement <what happened>`: Ang may offer it when it spots friction or at `/retro`; runs in its own context so your session stays lean; the item's five fields (problem, example, proposed change, files, size); returns one line.
  - `/improve-workflow [item file]`: proposes the best item or a batch of small related ones and agrees it; restates the change in up to 3 bullets before editing; uses `skill-creator` for skill changes if installed; deletes the item; unstaged. Link `../../concepts/bending-ang/#-will-my-bends-survive-an-upgrade`.
- **Voice:** follow [voice lessons](../voice-lessons.md) and match `commands/funnel.md`. Reference sections stay tighter than the Concepts prose, full sentences with a "so that" per mechanism. Fresh jokes only. Spent so far: sales funnel, dark mode, floor is lava, stove burners, starter Pokémon, phone reminder, sourdough, software bender, navel gazing, spring cleaning, "won't hold a grudge", Electric Boogaloo, Indiana Jones, ocean boiling, da Vinci, clown juice, prison of opinions, "Mail?!", "thanks, Derick", square peg, "epic failure! AMIRITE", Redditors, battle royale, room with windows, accomplice to feature creep.
- **Endings:** each page ends with "next up" to the following page; Bending Ang points to `../../reference/config/` (Reference, story 08).
- **Workspace host asides:** only on `/start-stream` and `/end-stream`, where the host changes what happens (where the worktree lands, the card going). Story 06 cut host asides as noise elsewhere, so none on the other pages.
- **Out of scope:**
  - the Reference and Why Ang pages (stories 08 and 09)
  - changing the inbound links to point at anchors
  - any change to `src/` files

## Related
- [Docs voice guide](../voice-lessons.md)
- [Plan: Sequencing step 5](../plan.md)
- [Page map](../information-architecture.md#page-map)
- [Story 06: Commands, funnel](06-commands-funnel.md)
