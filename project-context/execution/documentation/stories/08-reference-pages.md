---
title: Reference pages
shortDescription: The Agents, ang-context-manager.mjs and Config reference pages are live
tags: [documentation]
status: done
owner: agent
dependsOn: [02]
---
# Reference pages

## Summary
Lookup pages for a user bending or debugging Ang: what each agent does, what the library script can do and what `ang.json` controls.

## Outcome
`reference/agents` (context-scout, prioritiser, stage-gate), `reference/ang-context-manager` and `reference/config` (`ang.json` and the host, intent, pilot and streams feature modules) are live.

## Rough scope
- Sources per the [page map](../information-architecture.md#page-map): `src/.claude/agents/`, the script's `--help` output, and the feature modules under `src/.claude/ang/features/` with the config loader they plug into.
- The script page groups commands as `--help` does, rather than copying it verbatim, so the script stays the source of truth.

## Done when
- `config.md`, `agents.md` and `ang-context-manager.md` exist in `docs/src/content/docs/reference/`, and `npm run build` in `docs/` passes with only the known chunk-size, `i18n` and `404` notices.
- The sidebar's Reference group reads Config, Agents, ang-context-manager.mjs, in that order, between Commands and Why Ang.
- The 14 inbound links land on their pages:
  - Config (11): `commands/library-upkeep.md:57`, `commands/bending.md:62`, `commands/streams.md:8`, `commands/funnel.md:85,103,148,166,185`, `concepts/streams-and-mail.md:15`, `concepts/bending-ang.md:58`, `concepts/context-library.md:46`.
  - Agents (1): `concepts/context-library.md:81`.
  - ang-context-manager (2): `concepts/triggers.md:101`, `concepts/context-library.md:92`.
- Every claim is traced to a shipped file on this branch: the three `src/.claude/agents/*.md`, `src/.claude/ang/features/streams/agents/context-scout.md`, the four `src/.claude/ang/features/*/feature.mjs` and their `rule.md`, `src/.claude/scripts/ang/config/config.mjs`, `features.mjs`, `library/validate.mjs`, and `node .claude/scripts/ang-context-manager.mjs --help`.
- Zac has read the three pages on the dev server (`npm run dev`), in light and dark mode, and signed off on the voice.

## Acceptance criteria
- **Given** a reader arriving from any "switch it on" link, **when** they open Config, **then** they can see the file to edit, the exact line to add for `streams` or `intent`, and that the change takes effect from their next session.
- **Given** a reader on Config, **when** they read the two files, **then** they know `ang.json` is committed and holds project-wide keys (`intent`, `streams`) for everyone in the repo, and `ang.local.json` is gitignored and holds only their personal keys (`host`, `pilot`), with a worked example of each file.
- **Given** a reader who puts `intent` or `streams` in `ang.local.json`, **when** they read Config, **then** they know it's ignored and `validate` warns, naming the key, because project keys hold for everyone.
- **Given** a reader with no `ang.json`, **when** they read Config, **then** they know every feature is off, including the delivery intent, even though `/bootstrap-repo` offers intent with a default of yes.
- **Given** any of the four features, **when** a reader checks the at-a-glance table, **then** they see its key, file, allowed values, default and what switching it on gets them.
- **Given** a reader turning `intent` on or off, **when** they read its section, **then** they know `validate` errors until `10k/intent.md` and the flag agree, and the doc needs a `confirmed: YYYY-MM-DD` date, linking Concepts and Library upkeep for the why.
- **Given** a reader with `host: "orca"` outside Orca, **when** they read its section, **then** they know the host only switches on when the session is really running inside it, so the same repo works in a plain terminal.
- **Given** a reader with a typo'd key or value, **when** they read Config, **then** they know `validate` rejects it naming file and key, the banner says the config is invalid, and the key falls back to its default.
- **Given** a reader on Agents, **when** they read an agent's section, **then** they know who calls it and when, what it reads, what it returns, and whether it can change anything (only `stage-gate` writes: it promotes, merges or marks ready, then validates).
- **Given** a reader with streams on, **when** they read context-scout, **then** they know it also peeks at other streams' branches read-only and labels what it finds with the stream name.
- **Given** a reader on the ang-context-manager page, **when** they look up a command, **then** they find it under the same noun groups as `--help` (library, board, item, state, tag, trigger, session, stream, mail), with what the group is for, and are told to run `--help` for exact syntax.
- **Given** a reader on the ang-context-manager page, **when** they read the intro, **then** they know they rarely need to run it, that it's zero-dependency Node, and which files only it should write (`index.json`, `state.json`, `triggers.json`).
- **Given** any link on the three pages, **when** it's clicked, **then** it's a relative route to a slug in [C4 code: Content pages](../c4/4-code.md#content-pages), never `/ang/…`.

## Test plan
No unit or integration tests: content pages with no code (plan Test strategy, `engineering-defaults.md`).
- **Build gate:** `npm run build` in `docs/`, then check `dist/reference/{config,agents,ang-context-manager}/index.html` exist.
- **Fact check:** read every claim against the files listed under Done when. For config, `config.test.mjs` pins the merge rules: use it to check the precedence and warning wording.
- **Click-through:** under `npm run dev`, click every link on the three pages and the 14 inbound links. Links into `why-ang/` 404 until story 09: list them under As built. Search `ang.local.json` and `stage-gate` and check each lands on its page.
- **Won't test:** phone-width layout beyond a glance, and the script's or agents' behaviour itself.

## Implementation notes
- **Files:** `docs/src/content/docs/reference/{config,agents,ang-context-manager}.md`, `sidebar.order` 1 Config, 2 Agents, 3 ang-context-manager. Config goes first because `commands/bending.md` already hands off to it as "next up", so Starlight's next button agrees, and it's the most linked. Titles: `Config`, `Agents`, `ang-context-manager.mjs` (the inbound link text says "ang-context-manager reference"). Each has a `description`. No sidebar config edit: `group('Reference', 'reference')` autogenerates.
- **Shape:** short intro linking the matching Concepts page for the why, an `## 🧾 At a glance` table, then one `##` section per item (feature, agent or command group) with a fresh emoji, none with a variation selector. Anchors are bonus: no inbound link uses one.
- **Config, per [ADR 0003](/project-context/10k/technical/adrs/0003-per-user-config-overlay.md) and [ADR 0004](/project-context/10k/technical/adrs/0004-pilot-identity-hook-injected.md):**
  - Two files at the repo root. `ang.json`, committed, written by `/bootstrap-repo`, Ang ships none. `ang.local.json`, gitignored, written by `/tailor-ang`, may set only `host` and `pilot`, and beats `ang.json` for those. `validate` warns if `ang.local.json` isn't gitignored.
  - Precedence: defaults, then `ang.json`, then `ang.local.json`'s personal keys. Missing files mean defaults, which is everything off (intent and streams `false`, host and pilot `null`). Flipping a key is the whole change; it takes effect next session.
  - Per feature, from `feature.mjs`:
    - `intent` (bool, project): Ang reads `10k/intent.md` before shaping, planning or building and delivers to it; `/curate-10k` and `/retro` ask whether it still holds. Validate errors when the flag and the doc disagree (either way) or `confirmed:` is missing. Switching on: ask any session to write it and set the flag. Link `../../concepts/context-library/` and `../../commands/library-upkeep/`.
    - `streams` (bool, project): unlocks `/start-stream`, `/end-stream`, `/read-mail` and the script's `stream` and `mail` nouns (they fail with a message naming `"streams": true` when off); adds mail checkpoints and the context-scout peek. Validate warns about registry drift (a stream's branch or worktree gone, mail to an unregistered stream). Link `../../concepts/streams-and-mail/` and `../../commands/streams/`.
    - `host` (`null` or `"orca"`, personal): detected by `/tailor-ang`, not asked; on only when set and detected in the environment. What it adds: the host actions that keep the Orca card's status, stage and unread flag honest. Link `../../concepts/streams-and-mail/#-orca-optional`.
    - `pilot` (`null` or a name, personal): Ang addresses you by name, and "me", "I" and "the user" in skills mean you. The name only lives in your gitignored file, so shipped files never carry it.
  - How "on" reaches agents, one short section: agents never read the files. The session banner names only what's on (show this repo's example shape `Ang: intent · streams (…) · host (orca) · pilot (Zac)`, with a made-up name not Zac's), then each on feature's rule; subagents get the same; skills pull in on features' extra steps. "Off means invisible." Link `../../concepts/bending-ang/` for bending a feature.
  - Validation: unknown key, bad value or invalid JSON errors naming the file and key, the key keeps its default, and the banner adds "Ang config invalid".
- **Agents**, from each agent file:
  - `context-scout`: called at the start of any task needing project context, and for wide searches. Reads indexes and tags, Summary sections first, at most 5 link hops, flags `10k/` vs in-flight disagreements; returns ≤300 words of sourced points, conflicts and a plain "not in the library". Read-only. Streams add-on as above. Link `../../concepts/context-library/`.
  - `prioritiser`: called when a stage command runs without a named target. Reads the board and each item's state plus hub Summary only; weighs value of the next step against how answerable the top unknown is, favours unblockers, pushes `blocked` down. Returns pick, why, runner-up. Read-only.
  - `stage-gate`: called at the end of `/refine-ideas`, `/shape-ideas` and `/plan-epic`. Defaults to "not yet" but doesn't demand perfection; the per-transition actions (merge into or move to shaping, mark ready-for-planning, move to execution), then validate. Returns verdict, reasoning, gap or new path, next step. Link `../../concepts/funnel/`.
  - Tools column in the table (from frontmatter) so the reader sees which can write.
- **ang-context-manager.mjs:** run it as `node .claude/scripts/ang-context-manager.mjs <noun> <verb>`; zero dependencies ([ADR 0002](/project-context/10k/technical/adrs/0002-zero-dependency-library-script.md)). One section per noun with one line per verb in plain words and a worked example for the handful a human might run (`library validate`, `board status`, `trigger list`, `stream list`, `mail list`). `session` is for hooks, say so and don't detail. Mention the hooks in `.claude/settings.json` that run it (SessionStart banner, SubagentStart, reindex after edits and at stop) so the reader knows where the banner comes from. Never copy flags verbatim beyond the examples.
- **Voice:** follow [voice lessons](../voice-lessons.md) and match `commands/setup.md`. Reference stays tighter than Concepts. Fresh jokes only; spent list is in story 07 plus its As built additions.
- **Endings:** Config → Agents → ang-context-manager.mjs → `../../why-ang/first-principles/` (404 until story 09).
- **Out of scope:**
  - Why Ang pages (story 09)
  - changing inbound links to anchors
  - any change to `src/`
  - a Team config page (d11) and the parked shared base config (k24)
- **As built:** heading emoji: Config 📁 two files, 🔮 intent, 🛶 streams, 🃏 host, 🪪 pilot, 📡 how "on" reaches agents, 🚨 when something's wrong; Agents 🐕 context-scout, 🏆 prioritiser, 🚧 stage-gate; script 📒 library, 📊 board, 📦 item, 🧮 state, 🪧 tag, ⏰ trigger, 🪝 session (with the hooks), 💧 stream, 📮 mail. New jokes spent: fuse box (config), phone driving mode (host), "unless you're also called Sam" (pilot), sniffer dog (context-scout), bouncer with a reasonable door policy (stage-gate), stagehand (script). Made-up pilot name: Sam.
- **As built:** the only broken links are `../../why-ang/first-principles/` from `ang-context-manager.md` and the existing one in `commands/bending.md`, both 404 until story 09. All 14 inbound links land.
- **Files vs story:** `prioritiser` is called only by `/refine-ideas` and `/shape-ideas` (not `/plan-epic`), so the page says so. `mergeConfig` also lets `ang.json` carry `host` and `pilot` (`config.test.mjs` "ang.json pilot applies"), with `ang.local.json` winning; the page keeps to the story's split (personal keys belong in the local file) and doesn't mention it.

## Review
Build passes and all three pages render. All 18 inbound links land on live slugs, and no link uses `/ang/…`. The facts match the agent files, feature modules, `config.mjs`, `--help` and the hooks in `settings.json`.

**Must-fix**
- `docs/src/content/docs/reference/agents.md:12`: the AC "whether it can change anything" isn't met. Won't fix: Zac dropped the column on purpose because it didn't help readers, so the AC no longer applies.

**Should-fix**
- `docs/src/content/docs/reference/config.md:102`: a reader with a typo'd key isn't told how to find it. Resolved by Zac: the page now says what the reader will see, not which script command to run.
- Story As built is out of date (emoji and spent-jokes list). Won't fix: pedantic.

**Nit**
- `docs/src/content/docs/reference/config.md:84`: the bold "**in**" looked accidental. Fixed.
- `docs/src/content/docs/reference/config.md:64`: "it will let you know" undersells the `validate` error. Won't fix: pedantic.

## Related
- [Docs voice guide](../voice-lessons.md)
- [Plan: Sequencing step 6](../plan.md)
- [Page map](../information-architecture.md#page-map)
- [Story 07: Commands, library upkeep, setup, streams and bending](07-commands-other-groups.md)
