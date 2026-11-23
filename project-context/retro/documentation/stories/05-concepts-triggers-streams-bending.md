---
title: Concepts II, triggers, streams and bending
shortDescription: The Triggers, Streams & mail and Bending Ang concept pages are live
tags: [documentation]
status: done
owner: agent
dependsOn: [02]
---
# Concepts II: triggers, streams and bending

## Summary
The ideas a user grows into: deferring work until a condition holds, running parallel streams, and changing Ang to fit how they work.

## Outcome
`concepts/triggers`, `concepts/streams-and-mail` and `concepts/bending-ang` are live. Streams & mail names Orca as the optional host and summarises `src/docs/procedures/running-ang-streams-in-orca.md`, linking to it on GitHub so the steps live in one place (plan Approach). Bending Ang explains the "starter, not the loaf" idea.

## Rough scope
- Sources per the [page map](../information-architecture.md#page-map): the Concepts rows for these three pages (`src/project-context/README.md` Triggers, the `trigger` skill, `src/.claude/ang/features/streams/`, `raise-workflow-improvement`, `improve-workflow`).
- A Mermaid diagram only where it earns its place, e.g. streams and mail.
- Link to the command anchors by their planned slugs.

## Done when
- The 3 pages exist under `docs/src/content/docs/concepts/` and `npm run build` in `docs/` passes, with only the known chunk-size, `i18n` and `404` notices.
- Under `npm run preview`, the sidebar's Concepts group lists Triggers, Streams & mail and Bending Ang after Evidence standard, in that order. The links already pointing at them now land on real pages: `concepts/funnel.md:142`, `concepts/evidence-standard.md:54`, `concepts/context-library.md:90`, `start-here/quick-start.md:78` and `start-here/upgrading.md:12`.
- Any Mermaid diagram renders in both light and dark mode, and is legible at phone width.
- Every claim about how Ang behaves is traced to a shipped file on this branch (`src/project-context/README.md`, a `src/.claude/skills/*/SKILL.md`, `src/.claude/ang/features/streams/*` or `src/docs/procedures/running-ang-streams-in-orca.md`).
- Zac has read the pages in the preview, in light and dark mode, and signed off on the voice.

## Acceptance criteria
- **Given** a reader with work they know how to do but can't do yet, **when** they read Triggers, **then** they can tell a trigger (known what and how, blocked on *when*, short-lived) from a parked idea (fuzzy, long-lived, blocked on *why*) and from a moonshot (blocked on *how*).
- **Given** a reader on Triggers, **when** they read what can make one ready, **then** they know the condition kinds in plain terms (a story reaching a status, an item reaching a stage, a file existing, a date passing, a judgement call an agent checks, and work on another stream's branch), and that every condition must hold.
- **Given** a reader wondering how they'll know, **when** they read Triggers, **then** they learn that the check at the end of every workflow command reports a trigger as ready (or as needing judgement for its `custom:` conditions), so they never carry it in their head, and that they run it with `/trigger <slug>` in a fresh session.
- **Given** a reader running a ready trigger, **when** they read Triggers, **then** they know the session first checks whether the work still stands (done already, half done, drifted, no longer relevant), does it or walks them through it, and deletes the trigger only with their yes, so the commit is the work plus the deletion.
- **Given** a reader wanting parallel work, **when** they read Streams & mail, **then** they know a stream is one branch in one worktree, that it's opt-in through `streams` in `ang.json`, that Ang runs as usual inside each one, and that Ang doesn't stop two streams touching the same item: merges are theirs.
- **Given** a reader worried about streams drowning each other in messages, **when** they read the mail section, **then** they learn that no mail is the normal outcome, that agents only suggest a note when it would change what another stream does, and that every send and every disposition waits for their yes.
- **Given** a reader asking how one stream knows what another is doing, **when** they read Streams & mail, **then** they learn about read-only peeking (`context-scout` checks focus lines first), cross-stream trigger conditions, and that `10k/` changes only on main, so streams merge main to pick it up.
- **Given** a reader without Orca, **when** they read Streams & mail, **then** they know Orca is optional, what it adds (a card per worktree, unread marks, one agent feed), that Ang loses none of its workflow without it, and where the full setup lives (the procedure, linked on GitHub).
- **Given** a reader who disagrees with one of Ang's opinions, **when** they read Bending Ang, **then** they understand the starter-not-the-loaf idea, that their copy is *their* Ang, and the loop: friction → `raise-workflow-improvement` (by them, or offered by Ang, including at `/retro`) → `/improve-workflow` in a fresh session → review and commit.
- **Given** any of the 3 pages, **when** it links to another page, **then** the link is a relative route to a slug in [C4 code: Content pages](../c4/4-code.md#content-pages), never `/ang/…`.

## Test plan
No unit or integration tests: these are content pages with no code (plan Test strategy, `engineering-defaults.md`).
- **Build gate:** `npm run build` in `docs/`.
- **Fact check:** read every behaviour claim against `src/project-context/README.md` (Triggers, Ang config, Moonshots & parked work), the `trigger`, `start-stream`, `end-stream`, `read-mail`, `raise-workflow-improvement`, `improve-workflow`, `retro` and `tailor-ang` skills, `src/.claude/ang/features/streams/{conventions,rule,read-mail}.md` and its `steps/`, `src/.claude/rules/context-library.md` (Workflow friction) and the Orca procedure.
- **Click-through:** under `npm run preview`, click every link on the 3 pages, plus the 5 inbound links listed under Done when. Links to pages stories 06–09 haven't written yet 404, which is expected. List them under As built. Open the GitHub link to the Orca procedure.
- **Screenshots:** light and dark shots of any page with a diagram, from Orca's built-in browser (story 03 As built), for Zac's review.
- **Won't test:** phone-width layout beyond a glance at any diagram, and any skill or script behaviour itself.

## Implementation notes
- **Files:** `docs/src/content/docs/concepts/{triggers,streams-and-mail,bending-ang}.md`, with `title`, `description` and `sidebar.order` 4–6. Mermaid in a fenced `mermaid` block (astro-mermaid, d9). No config edits.
- **Voice:** follow [voice lessons](../voice-lessons.md); read `start-here/quick-start.md` and the three story 04 pages first. Emoji on the left of every heading, none with a variation selector. Fresh jokes and analogies only: the README already spends the sourdough line (`README.md:25`) and "software bender", and `funnel.md` spends the whether/how/when framing that leads into triggers. Chain the "next up" endings: Triggers → Streams & mail → Bending Ang → the Commands section (`../../commands/funnel/`).
- **Triggers**, from README Triggers and `trigger/SKILL.md`:
  - Pick up where `funnel.md:142` leaves off (moonshots wait on a how, parked on a why, triggers on a when) without retelling it.
  - States: the README says waiting or ready; the skill adds **judge** (`🤔 needs judgement`), when only `custom:` conditions are left for an agent to answer. The skill wins: name all three, in the reader's terms.
  - Conditions in plain terms, not the raw syntax. A short example of a real trigger helps, e.g. this repo's "recheck the Start here pages once the install work merges".
  - Who adds one: the reader with `/trigger add …`, or an agent that proposes one (intent and condition in two lines) and adds it only on their yes. Each has a doc saying why now and what to do, written for an agent arriving cold weeks later.
  - A condition pointing at something gone is an error the next session fixes by re-pointing or removing. Moves and merges re-point item references for you.
  - Cross-stream conditions get a line here and the detail on Streams & mail.
  - Leave out `triggers.json` internals and the `trigger add | repoint | …` script commands; link to the ang-context-manager reference (`../../reference/ang-context-manager/`) and the library-upkeep commands page (`../../commands/library-upkeep/`).
- **Streams & mail**, from `src/.claude/ang/features/streams/` and the Orca procedure:
  - What a stream is, why you'd want one (several agents working while you review another), opt-in via `streams` in `ang.json` (link `../../reference/config/`), and that bootstrap asks.
  - Lifecycle: `/start-stream <slug> "focus"` from main, why the focus line matters (it's what other streams read before peeking), `/end-stream` after the branch merges, clearing its inbox and refusing to lose unmerged work.
  - Registry and mail live on the `ang/streams` branch, which shares no history with main and is the one place Ang commits for you, because it's infrastructure, not project content. Justify this; it looks alarming otherwise.
  - Mail: a checkpoint in certain skills, at most one suggested note, sent only on the reader's yes; `/read-mail` proposes one disposition per note (no effect, fold into an item, raise a trigger, save as raw input) and handling deletes it. A note isn't evidence: the agent peeks at the sender's branch for the real doc.
  - Merging between streams: regenerate `index.json`, union `tags.json`, merge main for new `10k/` truth.
  - **Orca** (https://github.com/stablyai/orca), marked optional: what it adds (card status, comment, unread mark, Agents feed), the card-status table in reader terms, and "without Orca you lose the cards and the feed, not the workflow". Link the full setup at `https://github.com/zacbraddy/ang/blob/main/src/docs/procedures/running-ang-streams-in-orca.md` (plan Approach). Summarise only the host-generic parts: the procedure is written for ohnvm, and its database volume, `pnpm install` and `.env.local` details don't belong on this page.
  - A Mermaid diagram earns its place here: main plus two or three streams, the `ang/streams` branch holding registry and mail, notes passing only on yes, and merges back to main. Keep it legible at phone width.
  - Command detail goes to `../../commands/streams/`.
- **Bending Ang**, from `10k/product/what-ang-is.md:18,27,37`, `first-principles.md:26`, the brain dump (`brain-dump-context.md:103,119-123,236-246,259-261`) and the two skills:
  - The idea: the open-source repo is the starter, your copy is your Ang, and the two never need to agree. Disagree by bending, not by opening an upstream issue or PR (Zac's "cool idea, go build it", told kindly).
  - The loop: friction → a workflow improvement recorded in `workflow-improvements/` (raised by the reader, offered by Ang when it notices friction, or raised at `/retro`) → `/improve-workflow` in a fresh session, which agrees the change before editing, uses `skill-creator` for skill changes and deletes the item → the reader reviews and commits. Raising only records; it never edits the workflow.
  - The gentler dials: `/tailor-ang` (output style, pilot name, a personal rule) and the `ang.json` feature switches, linked to `../../reference/config/`.
  - Bends survive upgrades because an agent does the merge and knows why each side changed: link `../../start-here/upgrading/` rather than repeating it.
  - Command detail goes to `../../commands/bending/`.
- **Links:** command links go to the group pages, not per-command anchors (story 04 As built).
- **Out of scope:**
  - the other Concepts pages, and command, reference and why-Ang pages (stories 04, 06–09)
  - any change to `src/` files, including the README's trigger states and the Orca procedure's ohnvm wording
  - the home page and Start here pages, except a link fix if a slug turns out wrong

- **As built:**
  - **Orca procedure no longer ships.** Main's `d8a0010` moved `src/docs/procedures/running-ang-streams-in-orca.md` to `project-context/raw/`, so the planned GitHub link 404s. Agreed with Zac: the page walks the reader through the setup itself under its own heading, using Orca's own UI labels from orca.dev/docs (Add Repo, a local setup script under Settings → Repository as Zac runs it for ohnvm, `.worktreeinclude`, showing non-Orca worktrees), and drops the link and the "lands in `docs/procedures/`" line. `quick-start.md` and `uninstalling.md` still name `docs/procedures/`; the `start-here-recheck-after-install-merge` trigger already re-reads those file lists.
  - **Trigger states:** the shipped README names only waiting and ready; the page names all three from `trigger/SKILL.md` (waiting, judge, ready), as this story asks. The README line is a `src/` change, so it's out of scope.
  - **Fresh analogies:** Triggers uses a phone's "remind me when I get home", Streams & mail a stove with every burner going, and Bending Ang a starter Pokémon in place of the sourdough line.
  - **Illustrative examples:** the `pricing` and `onboarding` streams, the load-test `/trigger add` and the `/write-story` friction example are made up for the page. The worked trigger is this repo's real `start-here-recheck-after-install-merge`.
  - **Diagram:** one, on Streams & mail. Checked in light, dark and at 390px wide in Orca's built-in browser.
  - **Links that 404 until later stories land:** `../../commands/library-upkeep/`, `../../commands/streams/`, `../../commands/bending/`, `../../commands/funnel/` (06, 07), `../../reference/ang-context-manager/`, `../../reference/config/` (08). Every other link and in-page anchor resolves, including the 5 inbound links under Done when. The external Orca repo link returns 200.

## Review
Build passes with only the known notices. The 5 inbound links and the in-page anchors resolve. Behaviour claims match the `trigger`, stream, `read-mail`, improvement, `tailor-ang` and `retro` sources, the README's Ang config and the host steps. The worked trigger matches `trigger list`.

- **nit (fixed):** typos at `streams-and-mail.md:17` ("make every problem is a nail", "while it still providing"), `:37` ("the example like the one above"), `:99` ("a stream's agent decide"), `triggers.md:36` (double space) and `triggers.md:54` (needs commas around "predefined or otherwise").

## Related
- [Docs voice guide](../voice-lessons.md)
- [Plan: Sequencing step 4](../plan.md)
- [What Ang is](/project-context/10k/product/what-ang-is.md)
