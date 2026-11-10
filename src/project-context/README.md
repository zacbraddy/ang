# Project Context Library

The library is the heart of **Ang**, the workflow framework this project runs on.

Everything known about this project — technical, product, business — lives here. Need information? Start here.
Read the section you need; you rarely need this whole file.

**Sections:** Structure · The 10k view · Ang config · Workflow · Raw inputs · Item anatomy · Item state · Document format · Hub templates · Stories · Indexing & tags · Evidence standard · Stage exit criteria · Promotion & merging · Killing · Moonshots & parked work · Triggers · Business work · Context management

## Structure

```
project-context/
├── raw/          unfiltered inputs (unindexed)
├── ideas/        one folder per idea, plus moonshots.md and parked.md
├── shaping/      one folder per shaping effort
├── planning/     one folder per epic
├── execution/    one folder per epic being built
├── retro/        epics being retro'd
├── triggers/     one doc per deferred action (registry: triggers.json)
├── 10k/          current truth
│   ├── intent.md  the user's delivery intent (intent feature only)
│   ├── technical/ (architecture/, adrs/, project-structure.md)
│   ├── competitor-intelligence/  marketing/  product/  sales/  legal/  financial/
├── README.md     this file
├── tags.json     tag registry
└── triggers.json trigger registry (script-managed)
```

## The 10k view

`10k/` holds the currently known facts: decisions definitely made and the shape of what's actually implemented. It is **not** a history of every decision. It changes only via `/retro` (and `/curate-10k` for drift), because only after delivery are facts trustworthy enough for every agent to rely on. The one exception is `/bootstrap-repo`, run once before any epic to seed facts that are already true: a founder's goals and constraints, or an established codebase's architecture and decisions. Apart from in-flight work, everything in `10k/` is true now. `intent.md`, when the intent feature is on, is the other exception (`.claude/ang/features/intent/conventions.md`).

- `technical/architecture/` — current C4 context and container views (component views only for complex areas)
- `technical/adrs/NNNN-slug.md` — decisions that bind future work. Outdated ADRs are rewritten or deleted, never marked "superseded"
- `technical/project-structure.md` — where things live in the codebase and why
- Department folders — durable knowledge that informs future decisions in that area

## Ang config

`.claude/ang.json` switches Ang's optional behaviour per project: `{ "intent": bool, "streams": bool, "host": null | "orca" }` (`host` names the workspace host, which `/bootstrap-repo` detects). A missing file means everything is off. `/bootstrap-repo` writes it; `validate` rejects unknown keys and values. Flipping a key is the whole change; it takes effect next session.

Each optional feature owns `.claude/ang/features/<key>/`: `feature.mjs` (its key, `validate` checks, commands, bootstrap question, and its config value and on-check when it isn't a plain boolean), `rule.md` (always-on guidance), `steps/<skill>.md` (steps it adds to a skill), `agents/<agent>.md` (subagent add-ons) and `conventions.md` (its library conventions; read it when working with that feature). Off means invisible: nothing feature-specific lives in `.claude/rules/`, skill or agent bodies, or this README.

Agents never read `ang.json`. Hooks and injections deliver what is on:
- SessionStart runs `session banner`: one line naming only what is on (e.g. `Ang: intent · host (orca)`), then each on feature's `rule.md`. `host` is on only when it is also detected in the session's environment, so the same repo works in a plain terminal.
- SubagentStart runs `session subagent`: on features' `rule.md` plus their `agents/<agent-type>.md`.
- Skills carry `` !`ang-context-manager.mjs session steps <skill>` ``, which prints on features' steps for that skill, or nothing.

## Workflow

`raw → ideas → shaping → planning → execution → retro → 10k`. A funnel: many raw inputs, fewer ideas, fewer shaped efforts, one epic at a time per plan.

| Stage | Question it answers | Commands |
|---|---|---|
| raw | "Might this matter?" | `/ideate` |
| ideas | "What's the landscape? Is this worth pursuing?" | `/refine-ideas`, `/kill` |
| shaping | "How *could* we do it, and is it viable for us?" | `/shape-ideas`, `/kill` |
| planning | "How are we *actually* doing it?" (full C4) | `/plan-epic` |
| execution | Build it, story by story | `/break-down-epic`, then per story `/write-story` → `/implement-story` → `/review-story` |
| retro | "What's now true and worth keeping?" | `/retro` |
| bootstrap | "What's already true before any epic?" (once per repo) | `/bootstrap-repo` |
| maintenance | Keep the library lean and correct | `/curate-10k`, `/curate-tags` |
| any | "What must happen later, and when?" | the `trigger` skill |
| workflow | Improve the workflow itself | `/raise-workflow-improvement`, `/improve-workflow` |

`node .claude/scripts/ang-context-manager.mjs board status` shows the board. Every stage handles business work as well as technical work (see Business work).

## Raw inputs

Commands that consume `raw/` files (`/ideate`, `/bootstrap-repo`, and any future consumer) delete them afterwards, trusting git to keep the originals. That only holds for committed files, so committing is a precondition, not a step the command does for the user:
- Before reading anything in `raw/`, run `git status --porcelain project-context/raw`. If a file you'll consume is untracked or modified, stop and suggest the user commits it (`raw: add <files>`); carry on once they have.
- Sensitive files used for inspiration only are the exception: never committed, never deleted by the command. The user says which they are.
- Never cite a raw file as a known's source or a decision's evidence; it will be gone. Cite the durable doc the fact lands in. `ang-context-manager.mjs` refuses raw sources and `validate` flags any that slip in.

## Item anatomy

Item folders are kebab-case slugs, no dates. Context travels with the item: the whole folder moves on promotion, and merges fold earlier items in. The newest, most relevant context sits at the top; older detail nests further down for whoever needs to dig (implementation agents rarely should; retro does).

```
<item>/
├── README.md          signpost hub: summary + map of the folder. Never a tracker.
├── state.json         live state: status, unknowns, knowns, decisions, lineage (script-managed)
├── ideas-content/     research from the ideas stage
├── shaping-content/   research, experiment and spike findings from shaping
├── spikes/<name>/     throwaway spike code (+ README with findings)
├── origins/<slug>/    (epics) the content of shaped items this epic was planned from
├── plan.md            (epics) scope, approach, test strategy, candidate ADRs
├── c4/                (technical/mixed epics) 1-context.md 2-container.md 3-component.md 4-code.md
└── stories/NN-slug.md (epics) stories — status lives in each story's frontmatter
```

## Item state

`state.json` is the single source of truth for an item's progress. **Change it only through the script** (`node .claude/scripts/ang-context-manager.mjs`):

| Need | Command |
|---|---|
| Create | `state init <item> [--type technical\|business\|mixed]` (type for epics) |
| Read | `state show <item>` |
| Status | `state status <item> active\|ready-for-planning\|blocked ["note"]` |
| Add unknown | `state add <item> unknown "<question>" ["<approach>"] [--top]` |
| Answer unknown | `state answer <item> <uId> "<fact in one line>" <source-doc>` |
| Reprioritise | `state order <item> <uId...>` |
| Known without an unknown | `state add <item> known "<fact>" <source-doc>` |
| Decision | `state add <item> decision "<decision — why>" <evidence-doc>` |
| Change an entry (keeps its id; omitted evidence/source/approach is kept) | `state replace <item> <id> "<text>" [<approach\|source\|evidence>]` |
| Drop an entry (duplicate, obsolete) | `state remove <item> <id>` |
| History note | `state lineage <item> "<event>"` (moves/merges/status changes log themselves) |

Unknowns are kept in priority order: the first is the next to tackle. Sources are paths relative to the item folder.

## Document format

Every `.md` outside `raw/`:

```markdown
---
title: Human title
shortDescription: One line — what this doc tells you
tags: [tag-a, tag-b]
---
# Title

## Summary
3–6 lines. A reader decides from this alone whether to read on.

…body…

## Related
| Doc | Why |
|---|---|
| [Other doc](/project-context/…/x.md) | how it relates |
```

- **Links:** relative inside the same item folder; everything else starts with `/project-context/`. `ang-context-manager.mjs item move` rewrites the absolute ones for you.
- Stories add `status`, `owner` and `dependsOn` to frontmatter (see Stories).
- Research docs end with `## Sources` before `## Related`.
- Mermaid for diagrams (C4 uses `C4Context`, `C4Container`, `C4Component`; level 4 uses `classDiagram` or a table).

## Hub templates

The hub (`<item>/README.md`) is a **signpost**: what this is, why it matters, where things are. No status, no knowns or unknowns, no story lists — those live in `state.json` and story frontmatter.

```markdown
---
title: …
shortDescription: …
tags: […]
---
# …

## Summary
What this is and the current understanding, in 3–6 lines. Rewrite (don't append) when understanding changes.

## Why it matters
## What's here
- [Landscape research](ideas-content/landscape.md) — one line on what it covers
## Related
```

**Epic hub:** same shape. Summary covers the goal and the epic type. "What's here" points to `plan.md`, `c4/` (if any), `stories/` and the `origins/` folders.

**ADR** (`10k/technical/adrs/NNNN-slug.md`): frontmatter, Summary, Context, Decision, Consequences, Standing, Related. Under ~60 lines. Standing is dated and gives each call's standing against `src/`: **Built** (the rig bears it out, which is not verification) or **Not built** (the current best guess). Where the drawing and `src/` disagree, settle it to one answer when met, the proven fact if the rig proved it and otherwise the user's call, and record that answer alone. Consequences say what the decision commits us to now; ideas about value go in as what and why, never as design planned past what the build has taught ("later we could…").

## Stories

`stories/NN-slug.md`, frontmatter:

```yaml
title: Set up Mailchimp account
shortDescription: …
tags: [email-marketing]
status: draft        # draft | ready | implemented | done | blocked
owner: user          # agent | user | both
dependsOn: [01]      # story numbers that must be done first ([] if none)
blockedReason: …     # required when blocked
revisit: 2026-11-01  # when to check a blocked story again
```

Body: Summary, Outcome, **Done when** (the evidence that proves it — tests passing, a committed artefact, a config file, a link, a note from the user), Acceptance criteria, Test plan (code stories), Implementation notes, Review, Related.

`ang-context-manager.mjs board status` derives epic progress from these. Ready stories whose dependencies are all done show as **parallel-safe**.

## Indexing & tags

- `index.json` in each stage folder and `10k/` is **generated** from frontmatter by `ang-context-manager.mjs library index` (a hook runs it). Never edit by hand. Schema: `{ title, path, shortDescription, tags[] }`.
- `tags.json`: `{ tag, shortDescription, department[] }`, departments = folder names under `10k/`.
- Reuse tags first. Add one only when nothing fits: `ang-context-manager.mjs tag add <kebab-tag> "<desc>" <dept,…>`. Aim for a tag that slices the library meaningfully (5–30 docs eventually), not a synonym of an existing one. Over 50 tags → `/curate-tags`.
- Navigate with jq, e.g. `jq -r '.[] | select(.tags|index("search")) | "\(.path)\t\(.shortDescription)"' project-context/*/index.json`

## Evidence standard

Used by `/refine-ideas` and `/shape-ideas`.

An **Evidence Tier (ET)** says how far a claim can be trusted. **ET 1** is a primary source, close enough to know first-hand. **ET 2** is a credible secondary source reporting on someone else's work. **ET 3** is anecdote, marketing or anything undated.

- Log every source in `## Sources`: title/URL, date, ET. Source type sets the starting ET: **ET 1** = primary (official docs, data, papers, first-hand user statements, spike results, the user's own statements of intent or constraint). **ET 2** = credible secondary. **ET 3** = anecdote, marketing, undated.
- Then set the *claim's* ET, not just the source's. Ask: "Given this claim, how likely is it that the author has reason to spin, overstate or say something untrue?" An interested author drops that claim's ET, so one source can be ET 1 for one claim and ET 3 for another. For example, a vendor is ET 1 that a feature exists, but ET 3 at best that it's quick and easy to adopt, so look for independent corroboration. The same goes for consultancies, case studies, survey sponsors and founders' posts. Note the interest in that source's entry.
- A key claim needs ≥1 ET 1 or ≥2 *independent* ET 2 sources. Otherwise label it **unverified**.
- For any claim that would drive a decision, actively look for disconfirming evidence.
- Time-sensitive facts carry their date.
- Reasoning connects facts; it never replaces them.

## Stage exit criteria

- **idea → shaping:** the problem is evidenced as real and worth solving; the landscape is mapped (existing solutions, plausible directions); the remaining unknowns are "how could we" questions that need spikes, bake-offs, prototypes, datasets or outreach, not desk research that could still be done now.
- **shaping → planning:** the chosen approach is backed by evidence. Tech choices are spiked or bake-off tested unless the user has decided. Viability is checked (feasibility, rough cost/unit economics where relevant, fit with 10k architecture). Every remaining unknown is either planning-level detail, or blocked by a real-world constraint and carries a documented best guess.
- **planning → execution:** `plan.md` makes scope, out-of-scope, approach and success measures explicit; no open question would stall story writing. **Technical/mixed epics also:** all four C4 levels exist and agree with each other and with 10k (deliberate departures listed as candidate ADRs), and a test strategy exists. **Business/mixed epics also:** deliverables, tools/services and how success will be measured are explicit.
- **execution → retro:** every story is `done`.

## Promotion & merging

- **Move** with `ang-context-manager.mjs item move <item> <stage>`, never `mv`.
- **Merge** when the destination already has a cohesive item (or `/ideate` folds a thread into an in-flight item). A merge produces **one** work item, not two in a folder:
  1. `ang-context-manager.mjs item merge <incoming> <target>` — moves the incoming content docs into the target's content folders (renaming clashes), rewrites links, folds its unknowns/knowns/decisions/lineage into the target's `state.json`, deletes the incoming folder.
  2. Then the judgement part: `state show <target>`, remove duplicates (`state remove`), reword where two entries say the same thing (remove + add), reprioritise unknowns as one list (`state order`), and rewrite the target hub's Summary and "What's here" so it reads as a single item.
- **shaping → planning:** `stage-gate` marks items `ready-for-planning`. `/plan-epic` (in a fresh session) groups one or more ready items into an epic with `ang-context-manager.mjs item merge <shaped> <epic> --nest origins`: their state merges into the epic, their content nests under `origins/<slug>/`. Planning is the last stage where merges happen.

## Killing

1. Propose it with reasons; kill only when the user agrees.
2. Record it: `ang-context-manager.mjs state add <item> decision "Killed — <reason>" README.md`. Ask the user to commit.
3. After they commit: delete the folder, run `ang-context-manager.mjs library index`, and commit `kill: <slug> — <reason>`. Git is the archive; revive from the log if ever needed.

## Moonshots & parked work

Two lists in `ideas/` for threads `/ideate` keeps but that shouldn't become items. Each file is a normal doc (frontmatter, Summary, Related), with one `###` entry per thread. They live outside `10k/` because they are aspirations, not facts.
- `ideas/moonshots.md`: long-range visions, never worked on directly. Entry: the vision, why it matters, and what a cheap opening during implementation would look like. The user confirms every moonshot.
- `ideas/parked.md`: doable work with no value yet. Entry: what it is, the wake condition that would make it worth doing, and the source (raw filename plus commit hash).

Glancing at these lists is optional and never a required step. `/refine-ideas` and `/retro` mention any parked entry whose wake condition looks to have come true, and `/shape-ideas` mentions a moonshot that the chosen approach could open a door to. To promote a parked entry, delete it and run it through `/ideate` (or `ang-context-manager.mjs state init`) as usual.

## Triggers

A trigger defers work we already know how to do until a condition makes it possible: *what* and *how* are clear, and only *when* is blocked. It is short-lived and concrete, where a parked entry is long-lived and fuzzy.

- `triggers.json` holds each trigger's slug, one-line intent and conditions, all of which must hold for it to fire. `triggers/<slug>.md` holds the what, why and how. Change the registry only through `ang-context-manager.mjs trigger add | repoint | list | check | remove`.
- Conditions: `story:<item>/<NN>=<status>`, `stage:<item>=<stage>`, `file:<path>`, `after:<date or datetime>`, and `custom:<text>` for an agent to judge. `merge` re-points item references for you.
- A trigger is **waiting** or **ready**, worked out from its conditions on every check and never stored. `ang-context-manager.mjs library validate` reads only the registry and lists the ready ones; a `custom:` condition is judged by the session that runs the trigger. A condition pointing at something gone is a validate error: re-point the trigger or remove it.
- Run a ready trigger with `/trigger <slug>` in a fresh session. That session does the work (or walks the user through it), then deletes the trigger with their yes, so the commit is the work plus the deletion. There is no archive.

## Business work

The workflow runs non-technical work the same way: "who's our target audience", "set an initial price", "launch the mailing list". Same funnel, same evidence standard, same state and stories; the outputs just aren't always code.
- Shaping "spikes" become experiments: landing pages, surveys, price tests, outreach.
- Epics have a `type`: `technical`, `business` or `mixed`. Business epics skip C4.
- Stories have an `owner`. `user` stories are things only the user can do (sign up, call, decide); the agent guides, prepares material and records the outcome.
- Durable outcomes land in the matching `10k/` department at retro.
- **Never store secrets** (logins, API keys, customer personal data) in `project-context/`. Record *that* an account exists and where credentials live, never the credentials.

## Context management

Adding context is cheap; maintaining it is expensive for every future agent.

- **Not every decision gets documented.** Document what changes our thinking about the domain, commits future work to an architecture, or overturns an existing path.
- **Only what matters beyond this session.** If we tried A and chose B, document B.
- **Git is the history.** Replace outdated content outright. Never leave a reversal (or a reversal of a reversal) in the docs.
- Keep docs focused and well linked rather than long. Split anything over ~300 lines.
- Group related concepts together in folders.
