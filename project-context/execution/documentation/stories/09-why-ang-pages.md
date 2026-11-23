---
title: First principles page
shortDescription: The First principles page is live, and every link on the site lands now that the last content page exists
tags: [documentation, brand-voice]
status: ready
owner: agent
dependsOn: [02]
---
# First principles page

## Summary
Explains why Ang behaves the way users find it does: agents pushing back on additions, the evidence tiers, the pilot deciding, forking rather than sending PRs (pull requests). This is the last content page, so the story also rechecks every link earlier stories left as a 404.

## Outcome
`why-ang/first-principles` is one tight page. For each principle it says what the principle means for the user and how Ang carries it out, and it leaves out the essay. There's no Credits page: the footer on every page already credits Zac and We Right Code and links https://zackerthehacker.com (d5, Zac, 2026-11-23).

## Rough scope
- Meaning comes from [first principles](/project-context/10k/product/first-principles.md). Voice comes from the brain dump's *Ang's first principles*, `origins/docs-website/ideas-content/brain-dump-context.md:125-247`, and is used only for voice.
- Zac's history and personal usage stay out (d5).

## Done when
- `docs/src/content/docs/why-ang/first-principles.md` exists, and `npm run build` in `docs/` passes with only the known chunk-size, `i18n` and `404` notices.
- The sidebar's last group, Why Ang, holds one page: First principles.
- Both inbound links land: `reference/ang-context-manager.md:130` and `commands/bending.md:44`.
- Every internal link across all 21 pages resolves in the build. That covers the 404s listed under As built in stories 03 to 08, and none are left.
- Every claim about how Ang behaves is traced to a shipped file under `src/`.
- Zac has read the page on the dev server (`npm run dev`), in light and dark mode, and signed off on the voice.

## Acceptance criteria
- **Given** a reader new to Ang, **when** they open First principles, **then** they see four principles in rank order, and they're told all four always hold and the rank only says which matters most.
- **Given** a reader whose agent turned down or questioned an addition, **when** they read principle 1, **then** they know why: every rule and step costs every future session some accuracy, so Ang stays small on purpose. They also know the bar for adding to it, which is `/raise-workflow-improvement` for changes wanted every time.
- **Given** a reader puzzled that `/retro` deletes the epic or that docs never keep history, **when** they read principle 1, **then** they know the library holds current truth and git is the ledger.
- **Given** a reader seeing tier labels on research, **when** they read principle 1, **then** they know claims rest on evidence from real sources, that model reasoning never stands in for those sources, and where the Evidence standard page explains the tiers.
- **Given** a reader wondering who's in charge, **when** they read principle 2, **then** they know agents never steer the project alone, changes wait unstaged for their review, and the final call is theirs. They also know Ang isn't trying to be a "software factory".
- **Given** a reader whose agent pushed back on their plan, **when** they read principle 3, **then** they know the agent will say once when it sees a better way, will bring sourced research where they aren't the expert, and still leaves the call to them.
- **Given** a reader wanting Ang changed, **when** they read principle 4, **then** they know to bend their own copy, which may change or drop even these principles, rather than open an issue or PR, and they're linked to Bending Ang for the how.
- **Given** any link on the page, **when** it's clicked, **then** it's a relative route to a slug in [C4 code: Content pages](../c4/4-code.md#content-pages), never `/ang/…`.

## Test plan
No unit or integration tests: this is a content page with no code (plan Test strategy, `engineering-defaults.md`).
- **Build gate:** run `npm run build` in `docs/`, then check that `dist/why-ang/first-principles/index.html` exists.
- **Site-wide link check:** there's no link-checker plugin (plan Test strategy). Crawl `docs/dist/` with a throwaway script in the scratchpad: every relative `href` should resolve to a built file or in-page anchor. Not committed.
- **Fact check:** check each "how Ang carries it out" claim against the file it comes from (see Implementation notes).
- **Click-through:** under `npm run dev`, click every link on the page and the 2 inbound links.
- **Won't test:** phone-width layout beyond a glance, and the behaviour the principles describe.

## Implementation notes
- **File:** `docs/src/content/docs/why-ang/first-principles.md`, with `title: First principles`, a `description` and `sidebar.order: 1`. No sidebar config edit: `group('Why Ang', 'why-ang')` already autogenerates it.
- **Shape:** a short intro (these are the rules Zac judges every change to Ang by), then one `##` per principle, ranked, each with a fresh emoji and no variation selector. Each section covers what the principle means for the reader, then how Ang carries it out, with links to the page that covers the mechanism. Keep it tight. The essay stays in the brain dump, and mechanisms other pages already explain get a link, not a re-explanation.
- **Headings:** Zac's own headings from the brain dump are fine ("Ang works out", "You are the boss of Ang", "Get your own bastard framework"). The meaning still follows the 10k doc.
- **How Ang carries each one out**, each from a shipped file:
  - **1 Lean:**
    - **Lean context:** `context-scout` gathers and summarises; agents read Summary sections first and follow at most 5 link hops (`src/.claude/rules/context-library.md:9-10`).
    - **Current truth:** agents replace outdated content and never journal changes (`context-library.md:20`); `/retro` distils into `10k/` and deletes the item (`src/.claude/skills/retro/SKILL.md:24,39`).
    - **Lean tooling:** a small feature set, and features stay invisible until switched on ("Off means invisible", `src/.claude/scripts/ang/config/config.mjs:74`). The bar for `/raise-workflow-improvement` is already told on `commands/bending.md:44`: link it, don't repeat it.
    - **Lean reasoning:** the evidence tiers. Use the shipped tiers on `concepts/evidence-standard.md`. The brain dump's tiers are misremembered (its own Summary says so).
  - **2 Boss:** changes are left unstaged for review (`context-library.md:25`); `stage-gate` gives a verdict and you choose; the delivery intent is yours to word.
  - **3 Helpful:** say a better approach once, then do what the pilot decides, and hold position unless given a better argument (`src/.claude/rules/engineering-defaults.md:16-17`); `/refine-ideas` brings sourced research.
  - **4 Bastard framework:** `concepts/bending-ang.md:15-19` already tells the fork-not-PR story. Summarise it in a few lines and link it, without reusing its jokes.
- **Links:** `../../concepts/evidence-standard/`, `../../concepts/context-library/`, `../../concepts/bending-ang/`, `../../commands/bending/`, and others as needed. All are relative.
- **Voice:** follow [voice lessons](../voice-lessons.md), and match `concepts/bending-ang.md` for this register. Every joke is fresh. The spent list is in the As built sections of stories 05, 07 and 08.
- **Ending:** this is the last page in the sidebar. End by handing the reader back to building, with a link to `../../start-here/quick-start/`.
- **Out of scope:**
  - A Credits page (d5).
  - Changing the footer or README attribution wording.
  - Updating [voice and attribution](/project-context/10k/marketing/voice-and-attribution.md) to the shipped "sponsored by" wording, which belongs to `/retro` (voice lessons, Facts).
  - Any change to `src/`.

## Related
- [Docs voice guide](../voice-lessons.md)
- [Plan: Sequencing step 6](../plan.md)
- [Page map](../information-architecture.md#page-map)
- [Story 08: Reference pages](08-reference-pages.md)
