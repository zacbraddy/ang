---
title: Concepts I, funnel, library and evidence
shortDescription: The funnel, Context library and Evidence standard concept pages are live, the funnel with a Mermaid diagram
tags: [documentation]
status: done
owner: agent
dependsOn: [02]
---
# Concepts I: funnel, library and evidence

## Summary
The three core ideas a user meets on day one: how work moves through stages, where project knowledge lives, and why agents ask for sources.

## Outcome
`concepts/funnel` (with a Mermaid diagram of the stages), `concepts/context-library` and `concepts/evidence-standard` are live. Each describes what a user sees, not a skill's internal steps (plan Risks).

## Rough scope
- Sources per the [page map](../information-architecture.md#page-map): the Concepts rows for these three pages, all drawn from sections of `src/project-context/README.md`, plus the brain dump's *Raw files* for the funnel.
- Where the brain dump and the shipped files differ, the files win (k5), e.g. the evidence tiers.
- Link to the command pages by their planned slugs.

## Done when
- The 3 pages exist under `docs/src/content/docs/concepts/` and `npm run build` in `docs/` passes, with only the known chunk-size, `i18n` and `404` notices.
- Under `npm run preview`, the sidebar's Concepts group lists Funnel, Context library and Evidence standard first, in that order. The links already pointing at `concepts/funnel/` (home page hero and Concepts card, `first-loop.md:110`) now land on a real page.
- The funnel's Mermaid diagram renders in both light and dark mode.
- Every claim about how Ang behaves is traced to a shipped file on this branch (`src/project-context/README.md` or a `src/.claude/skills/*/SKILL.md`).
- Zac has read the pages in the preview, in light and dark mode, and signed off on the voice.

## Acceptance criteria
- **Given** a reader who has done Your first loop, **when** they read The funnel, **then** they learn *why* the stages exist and what each one asks, without a second step-by-step walk of the commands.
- **Given** a reader on The funnel, **when** they reach the diagram, **then** it shows the stages narrowing and the ways out of the main line (kill, park, moonshot, trigger, fold into an in-flight item, fast-track to shaping, retro into `10k/`), not a repeat of the straight-line chart on the home page and first loop.
- **Given** a reader wondering what goes in `raw/`, **when** they read the funnel's raw section, **then** they know it takes anything the harness can read (brain dumps, tickets, articles, chat logs), that they commit it first, that `/ideate` deletes it after use with git keeping the original, and that sensitive files they name are neither committed nor deleted.
- **Given** a reader asking "when does my item move on?", **when** they read the funnel, **then** they get each stage exit in plain terms, that `stage-gate` judges it skeptically, and that moving, merging and killing keep one item with its context travelling with it.
- **Given** a reader whose work isn't code, **when** they read The funnel, **then** they learn the same funnel runs business work, where spikes become experiments and some stories are theirs to do.
- **Given** a reader on The context library, **when** they read it, **then** they know `10k/` is current truth that changes only through `/retro`, `/curate-10k` and the one-off `/bootstrap-repo`, and that every other stage is in flight.
- **Given** a reader worried about the library growing forever, **when** they read The context library, **then** they learn why Ang curates it: summaries first, indexes and tags to navigate, `context-scout` to fetch only what a task needs, git as the history, and replacing outdated docs rather than adding to them.
- **Given** a reader looking inside `project-context/`, **when** they read The context library, **then** they know which files are script-managed (`index.json`, `state.json`, `triggers.json`) and so never hand-edited.
- **Given** a reader on Evidence standard, **when** they read it, **then** they get the three tiers exactly as the shipped README defines them, that a tier belongs to a claim and not just its source, the key-claim bar (one ET 1 or two independent ET 2, otherwise **unverified**), and where they'll meet it: `/refine-ideas`, `/shape-ideas` and `/bootstrap-repo`.
- **Given** any of the 3 pages, **when** it links to another page, **then** the link is a relative route to a slug in [C4 code: Content pages](../c4/4-code.md#content-pages), never `/ang/…`.

## Test plan
No unit or integration tests: these are content pages with no code (plan Test strategy, `engineering-defaults.md`).
- **Build gate:** `npm run build` in `docs/`.
- **Fact check:** read every behaviour claim against `src/project-context/README.md` and the skills it names (`ideate`, `refine-ideas`, `shape-ideas`, `plan-epic`, `retro`, `kill`, `curate-10k`, `bootstrap-repo`, `trigger`) and the `stage-gate` and `context-scout` agents.
- **Click-through:** under `npm run preview`, click every link on the 3 pages, plus the existing links into `concepts/funnel/`. Links to pages that stories 05–09 haven't written yet 404, which is expected. List them under As built.
- **Screenshots:** light and dark shots of The funnel with its diagram, from Orca's built-in browser (`shoot.mjs` can't run here, story 03 As built), for Zac's review.
- **Won't test:** phone-width layout beyond a glance at the diagram, and any skill behaviour itself.

## Implementation notes
- **Files:** `docs/src/content/docs/concepts/{funnel,context-library,evidence-standard}.md`, with `title`, `description` and `sidebar.order` 1–3. Story 05's pages take orders 4–6. Mermaid goes in a fenced `mermaid` block (astro-mermaid, d9). No config edits.
- **Voice:** follow [voice lessons](../voice-lessons.md) and read `start-here/quick-start.md` and `first-loop.md` first. Emoji on the left of every heading, none with a variation selector. Every page ends by pointing to the next one: funnel → context library → evidence standard → Triggers (story 05).
- **Don't repeat first loop:** `first-loop.md` already walks each command in order, shows the straight-line diagram and uses the sales-funnel analogy. The concept page explains the *why* and the rules, links back to first loop for the walk-through, and needs a fresh analogy (one-off jokes rule).
- **The funnel**, from README sections Workflow, Raw inputs, Stage exit criteria, Promotion & merging, Killing, Moonshots & parked work and Business work:
  - The question each stage answers, from the Workflow table, told from the reader's seat.
  - **Raw:** the brain dump's *Raw files* (`brain-dump-context.md:263-271`) gives the why: a place to pour a sprawling mess of thoughts, or any everyday input, for an agent to sort. The files win on behaviour:
    - commit before `/ideate`, which deletes what it consumes and stops if a file is uncommitted
    - sensitive files the reader names are never committed or deleted
    - `/ideate`'s actions are the ones in `ideate/SKILL.md` step 3: new idea, fold in, fast-track, feed in-flight work, moonshot, park, trigger, seed `10k/`, discard. The brain dump's "demote an in-flight stream from execution back to planning" isn't something `/ideate` does; leave it out.
  - **Exits:** say what has to be true to move on, in the reader's terms, and that `stage-gate` checks it skeptically. Execution exits when every story is done.
  - **Merging:** items move as whole folders, merges leave one item, and `/plan-epic` groups shaped items into an epic.
  - **Killing:** Ang proposes, the reader agrees, the reason is recorded, and the folder goes in its own commit. Git is the archive.
  - **Moonshots and parked:** the two lists in `ideas/`, what wakes a parked entry, and that the reader confirms every moonshot. Point to Triggers (`../../concepts/triggers/`) for "known work, blocked on *when*".
  - **Business work:** same funnel, experiments instead of spikes, `user`-owned stories.
  - Diagram: a top-to-bottom flowchart of the stages with side exits. Keep it legible at phone width; if it isn't, split the exits into a second, smaller diagram.
- **The context library**, from README sections Structure, The 10k view, Item anatomy, Item state, Document format, Indexing & tags and Context management:
  - A trimmed folder tree. `10k/` is current truth: why only retro writes it (facts are trustworthy only after delivery), with `/curate-10k` for drift and `/bootstrap-repo` once. Mention `intent.md` only as the intent feature's exception, linked to Config (`../../reference/config/`).
  - Context travels with the item. The newest context sits at the top and older detail nests below.
  - Every doc has frontmatter, a Summary and Related, so that agents can read a summary before a whole doc.
  - Indexes, tags and `context-scout` keep each agent reading only what its task needs. The brain dump's "context FOMO" passage (`brain-dump-context.md:147-152`) is Zac's own why and can be quoted in his voice.
  - Script-managed files are `index.json`, `state.json` and `triggers.json`. Agents run the script, so the reader never needs to touch them. Link to the ang-context-manager reference page (`../../reference/ang-context-manager/`).
  - Context management: adding is cheap and maintaining is expensive, git is the history, and outdated docs are replaced, not appended to.
  - Leave Ang config, hub templates and story format out; Reference (story 08) and the command pages cover them.
- **Evidence standard**, from README Evidence standard:
  - Tiers exactly as shipped. The brain dump's tiers are misremembered (ET 1 as the pilot, ET 3 as model reasoning) and must not leak in. Reasoning isn't a tier: it connects facts and never replaces them.
  - Per-claim tiers with the README's vendor example, the key-claim bar, **unverified** labels, looking for disconfirming evidence, and dating time-sensitive facts.
  - Where the reader sees it: `## Sources` sections in research docs, tiers on bootstrap's proposed facts, and agents asking for a source or labelling a claim unverified. Name every command that applies the standard: `/refine-ideas`, `/shape-ideas` and `/bootstrap-repo`.
  - Why it matters to the reader: future agents act on these facts, so a wrong tier gives them false confidence.
- **Links:** command links go to the group page (`../../commands/funnel/`, `../../commands/library-upkeep/`, `../../commands/setup/`), not to per-command anchors. Story 06 hasn't chosen its heading emoji, and the anchor depends on them (`#-ideate`, story 03 As built).
- **Out of scope:**
  - the Concepts II pages (story 05)
  - command, reference and why-Ang pages (stories 06–09)
  - any change to `src/` files, including the README's "Used by" line
  - the home page and Start here pages, except a link fix if a slug turns out wrong
  - the conflict between `10k/product/first-principles.md:16` and the shipped tiers, which story 09 (Why Ang: first principles) meets head on
- **As built:**
  - **Diagram split in two** (allowed by the funnel notes above): one funnel diagram with the main line, fast-track and kill, and a second, left-to-right diagram of `/ideate`'s nine actions under the Raw section. The single diagram with all the side exits was too wide to read at phone width.
  - **README gap:** the shipped README's Evidence standard says "Used by `/refine-ideas` and `/shape-ideas`", but `bootstrap-repo/SKILL.md:29,59` applies it too. The page names all three, as this story asks. Fixing the README line is a `src/` change, so it's out of scope here.
  - **Execution to retro** isn't a `stage-gate` exit: `/retro` checks every story is done and moves the epic itself (`retro/SKILL.md` step 1). The page says so.
  - **Retitled "Working the funnel"** after Zac's review: the page covers the funnel's rules and side doors, while first loop owns the funnel itself. The slug stays `funnel`, so every link holds; `first-loop.md:110`'s link text now matches the title.
  - **Links that 404 until later stories land:** `../../commands/funnel/`, `../../commands/library-upkeep/`, `../../commands/setup/` (06, 07), `../../concepts/triggers/` (05), `../../reference/agents/`, `../../reference/ang-context-manager/`, `../../reference/config/` (08). Every other link resolves, including the home page hero, its Concepts card and `first-loop.md:110` into `concepts/funnel/`.

## Review
Build passes (only the known notices); every acceptance criterion is met; facts match the shipped README and skills, apart from the points below.
- **Should-fix:** `docs/src/content/docs/concepts/funnel.md:104` says that when `stage-gate` says yes "the move happens in that session". For shaping, that isn't true: `stage-gate` only marks the item `ready-for-planning`, and `/plan-epic` moves it later (`shape-ideas/SKILL.md:35`, README Promotion & merging).
- **Nit:** `docs/src/content/docs/concepts/context-library.md:92` gives tokens as the reason agents don't hand-edit the script-managed files. The shipped reason is that they're generated (a hook rebuilds `index.json` from frontmatter) and checked by `validate`, so hand edits drift.
- **Nit:** the `triggers.json` and `triggers/start-here-recheck-after-install-merge.md` changes are outside this story's scope. They're sound, but would read better as a separate commit.
- **Nit:** `funnel.md:16,26` have doubled blank lines around the table. Rendering is unaffected.

All skipped: none of these changes what a reader takes away, and the extra precision would cost readability.

## Related
- [Docs voice guide](../voice-lessons.md)
- [Plan: Sequencing step 4](../plan.md)
- [Brain dump](../origins/docs-website/ideas-content/brain-dump-context.md)
- [Story 03: Start here pages](03-start-here-pages.md)
