---
title: Commands, funnel
shortDescription: One page covering the 9 funnel commands, each under its own anchor
tags: [documentation]
status: done
owner: agent
dependsOn: [02]
---
# Commands: funnel

## Summary
The commands a user runs most. One grouped page keeps edits local when skills change (d5).

## Outcome
`commands/funnel` is live, with one `##` heading (and so one anchor) per command: `ideate`, `refine-ideas`, `shape-ideas`, `plan-epic`, `break-down-epic`, `write-story`, `implement-story`, `review-story` and `retro`. Each says when to run it, what it does from the user's side and what comes next.

## Rough scope
- Source: each command's shipped skill under `src/.claude/skills/`, described as the user sees it, not step by step (plan Risks).
- Heading text matches the command name so anchors stay stable for the links from other pages.

## Done when
- `docs/src/content/docs/commands/funnel.md` exists and `npm run build` in `docs/` passes, with only the known chunk-size, `i18n` and `404` notices.
- The sidebar shows a Commands group with Funnel first. The 5 inbound links now land on the page: `index.mdx:44`, `start-here/first-loop.md:110`, `concepts/funnel.md:28`, `concepts/evidence-standard.md:48` and `concepts/bending-ang.md:66`.
- The built page has the 9 anchors `#-ideate`, `#-refine-ideas`, `#-shape-ideas`, `#-plan-epic`, `#-break-down-epic`, `#-write-story`, `#-implement-story`, `#-review-story` and `#-retro` (grep `dist/commands/funnel/index.html`), and the built-in search finds `write-story` on this page.
- Every claim about how a command behaves is traced to its shipped `src/.claude/skills/<name>/SKILL.md` or the feature step it pulls in (`src/.claude/ang/features/{streams,host,intent}/steps/`) on this branch.
- Zac has read the page on the dev server (`npm run dev`), in light and dark mode, and signed off on the voice.

## Acceptance criteria
- **Given** a reader who knows the loop from Your first loop, **when** they jump to any command's heading, **then** they get when to run it, what to pass it, what it does from their seat, what they get back and what comes next, without the page retelling the first-loop walkthrough or its dark mode example.
- **Given** a reader who runs a command with no argument, **when** they read its section, **then** they know what Ang picks for them (the prioritiser's pick, the lowest-numbered story at the right status, the epic without stories, and so on) and that they can name a target or redirect.
- **Given** a reader with a messy `raw/` folder, **when** they read `/ideate`, **then** they know every place a thread can land (new idea, fold in, fast-track to shaping, feeds in-flight work, moonshot, park, trigger, seed `10k/`, discard), that they agree it five at a time, and that processed raw files are deleted, so committing first matters.
- **Given** a reader on `/refine-ideas` or `/shape-ideas`, **when** they read the section, **then** they know it's one unknown per session, the ways it can be answered, that a gate gives a verdict each time, and where the item ends up when it passes (moved to `shaping/`; marked `ready-for-planning` but left in `shaping/`).
- **Given** a reader on `/shape-ideas` blocked by the real world, **when** they read the section, **then** they know Ang records a best guess as a decision with its evidence and risk, but never guesses where it could still find out.
- **Given** a reader on `/plan-epic`, **when** they read the section, **then** they can tell the first session (group ready items into one epic and agree its type) from later ones (one chunk each), and know what the plan holds for technical, business and mixed epics.
- **Given** a reader on `/implement-story`, **when** they read the section, **then** they know how it differs for an agent's code, an agent's non-code artefact and a story they own, that a big deviation stops and asks, that a stalled story can be marked `blocked`, and that nothing is staged or committed for them.
- **Given** a reader on `/review-story`, **when** they read the section, **then** they know to run it in a fresh session with the implementation staged, that it stops and asks when nothing is staged, and that it recommends fix or skip per finding and leaves its fixes unstaged.
- **Given** a reader on `/retro`, **when** they read the section, **then** they know it needs every story done, proposes `10k/` changes five at a time with contradictions settled to one answer, writes follow-ups to `raw/` only with their yes, and archives the epic in a commit of its own after they commit, with that deletion justified.
- **Given** a reader with streams, a workspace host or delivery intent switched on, **when** they read the affected commands, **then** a short aside says what changes (a mail checkpoint, card updates, the intent check-in at retro), and a reader with those off loses nothing.
- **Given** any link on the page, **when** it's clicked, **then** it's a relative route to a slug in [C4 code: Content pages](../c4/4-code.md#content-pages), never `/ang/…`.

## Test plan
No unit or integration tests: a content page with no code (plan Test strategy, `engineering-defaults.md`).
- **Build gate:** `npm run build` in `docs/`, then grep the built page for the 9 anchors.
- **Fact check:** read every behaviour claim against the 9 `SKILL.md` files and the feature steps they pull in (`node .claude/scripts/ang-context-manager.mjs session steps <skill>` lists them).
- **Click-through:** under `npm run dev`, click every link on the page and the 5 inbound links. Links to pages stories 07–09 haven't written yet 404, which is expected: list them under As built. Search `write-story` and check it lands on the anchor.
- **Won't test:** phone-width layout beyond a glance, and the skills' behaviour itself.

## Implementation notes
- **File:** `docs/src/content/docs/commands/funnel.md` (the `commands/` folder is new), with `title: The funnel` style naming matched to the Concepts pages, a `description`, and `sidebar.order: 1`. The sidebar autogenerates from the folder, so no config edit.
- **Headings and anchors:** one `## <emoji> /<command>` per command, in funnel order. Starlight slugs strip the emoji and slash and leave a leading dash, as on every existing page, so the anchors are `#-ideate` … `#-retro`. Reuse each command's emoji from `first-loop.md` (💡 🔎 🧪 🧭 🔪 📋 🔨 👀 🧹) so a command looks the same wherever it appears; none has a variation selector. Other headings (intro, at-a-glance) pick their own.
- **Shape:** a short intro that points to Your first loop for the walkthrough and Working the funnel for the why, then an at-a-glance table (command, run it when, you get back, next), then the 9 sections. This is the reference the first-loop page links to, so each section goes past it: the argument it takes (`argument-hint`), what it picks when you don't name one, the choices it asks you to make, and anything that can bite.
- **Voice:** follow [voice lessons](../voice-lessons.md); read `start-here/quick-start.md`, `first-loop.md` and the Concepts pages first. Fresh jokes and analogies only: the funnel-as-sales-funnel, dark mode, "floor is lava", stove burners, starter Pokémon and the phone reminder are spent. Sections are reference, so keep each one tighter than first-loop's prose, but in full sentences with a "so that" per mechanism.
- **Per command**, from its skill (facts first-loop leaves out are the point):
  - `/ideate [raw file]`: runs the commit check before reading; asks why a file is there if it can't tell; the full list of landing spots, with moonshot (you have the final say), park (with a wake condition, keeping the raw filename and commit hash) and trigger linked to the Concepts pages; seed `10k/` points at `/bootstrap-repo`; 5 proposals at a time; deletes processed raw files. No fixed next step: `/refine-ideas`, or `/shape-ideas` for anything fast-tracked.
  - `/refine-ideas [idea]`: no argument means the prioritiser picks and says why in two lines, and you can redirect; mentions parked entries whose wake condition looks met; one unknown, answered by research, asking you or both, to the evidence standard (link `../../concepts/evidence-standard/`); findings in `ideas-content/`; stage gate verdict, moving the idea to `shaping/` when ready; ends recommending the next session. "Move on as early as that's honest" is worth a line.
  - `/shape-ideas [item]`: same picking; the four methods (spike or bake-off with a success measure agreed before building, business experiment where you run the human parts, desk research, asking you); numbers over impressions; the blocked-by-the-real-world rule; moonshot openings mentioned, never built toward; gate marks `ready-for-planning` and leaves the item in `shaping/`.
  - `/plan-epic [epic | new]`: first session groups ready items into one epic and agrees its type (technical, business, mixed); later sessions do one chunk; deliverables by type (`plan.md` with candidate ADRs for all, C4 levels and a test strategy for technical, deliverables, tools and who-does-what for business); checked against `10k/`; gate moves it to `execution/`.
  - `/break-down-epic [epic]`: defaults to the execution epic with no stories; stories are outcome-focused, small (one implement session) and ordered risky-first; you agree the list before files are written; owners and dependencies.
  - `/write-story [story]`: lowest-numbered draft whose dependencies are done; done-when, acceptance criteria, test plan and implementation notes for code, a guide plus prep and what to record (never secrets) for stories you own; asks only about genuine ambiguity; marks `ready`.
  - `/implement-story [story]`: lowest-numbered ready story; the three ways it works by owner; full test, lint and typecheck at the end; small deviations noted, significant ones stop and ask; `blocked` with a reason and a revisit date when something outside stalls it; never stages or commits. Point out why you stage but don't commit, linking first-loop rather than repeating it.
  - `/review-story [story]`: fresh session; staged changes are the implementation; stops if nothing's staged; reviews against done-when, criteria and plan, plus C4 and engineering defaults for code or accuracy and audience for artefacts; must-fix, should-fix and nit with file:line; recommends fix or skip, you pick, fixes land unstaged and tests re-run; marks `done` and says when it's `/retro` time.
  - `/retro [epic]`: needs every story done and moves the epic to `retro/`; proposes `10k/` changes 5 at a time, only what changes how future work gets done, rewritten in place; contradictions come back as one answer or a question for you; follow-ups to `raw/retro-<epic>.md` and workflow improvements only with your yes (link `../../concepts/bending-ang/`); archive commit `retro: archive <epic> (full context in git history)` after you commit. Justify the deletion briefly and link first-loop for the longer version.
- **Optional features**, as `:::note` asides on the commands they touch, linking `../../reference/config/`: streams add a mail checkpoint to `/shape-ideas`, `/plan-epic`, `/implement-story`, `/review-story` and `/retro` (link `../../concepts/streams-and-mail/`); a workspace host gets card updates from `/break-down-epic`, `/implement-story` and `/review-story`; delivery intent adds the "does your intent still hold?" check-in to `/retro`, which leaves `10k/intent.md` out of its proposals.
- **Ending:** "next up" to `../../commands/library-upkeep/`.
- **Out of scope:**
  - the other 4 Commands pages, Reference and Why Ang pages (stories 07–09)
  - adding anchor links to this page from existing pages; they link to the page, and story 08 or a later pass can deepen them
  - any change to `src/` files
- **As built:** links to `commands/library-upkeep`, `commands/setup` and `reference/config` 404 until stories 07 and 08 write those pages. The 5 inbound links and every other link resolve; anchors `#-ideate` … `#-retro` are in the built page.
- **`/plan-epic` with no argument starts a new epic** (the skill's Mode A covers "no epic named"), so the page tells readers to pass the epic's slug to carry on planning one.
- **No workspace-host asides:** Zac cut the card-update mentions from every command. They don't help a reader understand the commands, and the host is covered in Concepts: Streams & mail.

## Review
Build passes with only the known notices, all 9 anchors are in the built page, the 5 inbound links resolve and the page is in the search index. Every behaviour claim was checked against the 9 shipped skills and their feature steps: no errors.

**Should-fix**
- `docs/src/content/docs/commands/funnel.md:19`: the at-a-glance table's Next cell says "`/plan-epic` again", but a bare `/plan-epic` starts a new epic (`plan-epic/SKILL.md` Mode A). A reader working from the table would start a second epic. Line 90 gets it right.

**Nit**
- `docs/src/content/docs/commands/funnel.md:9`: "The only commits Ang makes itself are deletions" ignores `mail send`'s commits, though those land on the `ang/streams` branch, never yours, and only with your yes.

## Related
- [Docs voice guide](../voice-lessons.md)
- [Plan: Sequencing step 5](../plan.md)
- [Page map](../information-architecture.md#page-map)
