---
title: Docs site information architecture
shortDescription: The docs site's sidebar groups and pages, and which source material each page draws from
tags: [documentation]
---
# Information architecture

## Summary
Zac agreed this page map on 2026-11-17. There are six sidebar groups and about 18 pages. The "Draws from" column tells the agents building each page where to look. A page exists only if it clears the bar below. The brain dump is a voice sample and a quarry for a few lines, not a list of pages. Where the brain dump and the shipped files disagree on how Ang behaves, the shipped files win ([brief](origins/docs-website/ideas-content/brief.md), Accuracy rule).

## What earns a page
A page or a passage earns its place only if someone using Ang needs it to do one of these:
1. decide whether Ang suits them;
2. get it running;
3. use it day to day;
4. bend it to fit how they work.

Zac's history with other frameworks and his own usage fail this bar. They survive only as the few lines noted in the page map. Zac's writing is verbose, and the brain dump is that turned up to 11, so take its points, not its prose.

## Page map
| Group | Page | Draws from |
|---|---|---|
| Home (splash) | What Ang is, the install one-liner, links in, and 2–3 sentences on why another framework (other frameworks drown agents in their own context and can't be combined) | Brain dump *Overview* and *My motivations*, [spike home page](origins/docs-website/spikes/_content/index.md), [What Ang is](/project-context/10k/product/what-ang-is.md) |
| Start here | Quick start | Install line and prerequisites ([install plan](https://github.com/zacbraddy/ang/blob/c289cabcc7f68e066e1eb8f537f8c1ef2edf500d/project-context/execution/install-upgrade-release/plan.md)); platforms, with Windows through WSL and the best-effort native Windows manual install as its own section ([install-upgrade-release d37](https://github.com/zacbraddy/ang/blob/794b106cdbf5c358fbb429572c684f387f959a9a/project-context/execution/install-upgrade-release/state.json), k20; check the steps against the shipped files); `/bootstrap-repo`, `/tailor-ang`; one line each on the two starting points, an existing repo or a fresh repo with a brain dump in `raw/` (brain dump *How I personally intend to use Ang*) |
| | Your first loop | The funnel skills, run end to end once |
| | Uninstalling | Removing Ang by hand: there is no uninstall command |
| Concepts | The funnel | `src/project-context/README.md`: Workflow, Raw inputs, Stage exit criteria, Promotion & merging, Killing, Moonshots & parked work; brain dump *Raw files* |
| | The context library | `src/project-context/README.md`: Structure, The 10k view, Item anatomy, Item state, Document format, Indexing & tags, Context management |
| | Evidence standard | `src/project-context/README.md`: Evidence standard |
| | Triggers | `src/project-context/README.md`: Triggers; `trigger` skill |
| | Streams & mail | `src/.claude/ang/features/streams/`; Orca named as the optional host |
| | Bending Ang | The "starter, not the loaf" idea; `raise-workflow-improvement`, `improve-workflow` |
| Commands (5 grouped pages, one anchor per command) | Funnel | `ideate`, `refine-ideas`, `shape-ideas`, `plan-epic`, `break-down-epic`, `write-story`, `implement-story`, `review-story`, `retro` |
| | Library upkeep | `kill`, `curate-10k`, `curate-tags`, `trigger` |
| | Setup | `bootstrap-repo`, `tailor-ang`, `bootstrap-quality` |
| | Streams | `start-stream`, `end-stream`, `read-mail` |
| | Bending | `raise-workflow-improvement`, `improve-workflow` |
| Reference | Agents | `src/.claude/agents/` (context-scout, prioritiser, stage-gate) |
| | `ang-context-manager.mjs` | Its `--help` output |
| | Config | `ang.json` and the feature modules: host, intent, pilot, streams |
| Why Ang | First principles | One tight page. For each principle, what it means for the user and how Ang carries it out; none of the essay. Sources: [first principles](/project-context/10k/product/first-principles.md), brain dump *Ang's first principles* for voice |
| | Credits | Attribution to Zac and We Right Code, linking https://zackerthehacker.com ([voice and attribution](/project-context/10k/marketing/voice-and-attribution.md)) |

## Choices behind it
- **Commands as 5 grouped pages:** fewer pages to keep in step when skills change, which fits the low-upkeep intent. The cost is that a command gets an anchor, not its own URL.
- **Why Ang is first principles plus credits:** the principles explain behaviour users run into (agents pushing back on additions, the evidence tiers, the pilot deciding, forking rather than sending PRs). The story-so-far and how-Zac-uses-Ang pages were cut because they failed the bar.
- **Links:** pages use relative links, never a hard-coded `/ang/` prefix, so a later custom domain needs only a config change (k18).

## Related
- [Hub](README.md)
- [Site brief](origins/docs-website/ideas-content/brief.md)
- [README content cut](origins/repo-readme/shaping-content/content-cut.md)
