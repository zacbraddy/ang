---
title: Upgrade guide format and chaining
shortDescription: Fixes the per-release upgrade guide format and adds upgrade guides, which fetches and chains every guide between two tags
tags: [distribution, open-source]
status: done
owner: agent
dependsOn: []
---
# Upgrade guide format and chaining

## Summary
Every release gets an upgrade guide in `releases/upgrades/` that starts with a `from:` line (k12, d34). An upgrade walks those lines back from the target to the installed tag, so no API call lists releases. This story fixes the format and builds the deterministic reading of it.

## Outcome
`upgrade guides --from <tag> --to <tag>` prints the chain oldest first as JSON, with each guide's Moves, Migrations, Retired and Notes for the merge parsed ("None" means empty). A missing guide, a missing heading or a broken chain exits 1 naming the problem. `releases/upgrades/` holds the format, ready for rc.1's guide.

## Rough scope
- `upgrade/guides.mjs`: `parseGuide`, `chainGuides` with an injected `fetchGuide`, and the real fetcher against `raw.githubusercontent.com` at the target tag.
- `commands/upgrade.mjs` with the `guides` subcommand; the entry point's import.
- Unit tests in memory with the injected fetch.

## Done when
- `node --test 'src/.claude/**/*.test.mjs'` passes, with a test for every acceptance line below.
- `node .claude/scripts/ang-context-manager.mjs upgrade --help` lists `upgrade guides`.
- `releases/upgrades/README.md` exists with the format and a blank template.

## Acceptance criteria
**Parse** (`parseGuide`)
- Given a guide with all four sections filled, when parsed, then it returns `{ version, from, moves, migrations, retired, notes }`, each move as `{ from, to, note }`.
- Given a section whose only entry is `None`, when parsed, then that list is `[]`.
- Given `from: none`, when parsed, then `from` is `null` (the root of the chain).
- Given a missing title, `from:` line or any of the four headings, or a heading twice, when parsed, then it throws naming what's missing or repeated.
- Given a section with no entries and no `None`, when parsed, then it throws naming the section.
- Given a Moves entry not shaped `` `a` -> `b` ``, when parsed, then it throws quoting the line.

**Chain** (`chainGuides`)
- Given guides v1.0.0 (from none), v1.1.0 (from v1.0.0) and v1.2.0 (from v1.1.0), when chained from v1.0.0 to v1.2.0, then it returns v1.1.0 then v1.2.0, and never fetches v1.0.0.
- Given the installed tag equals the target, when chained, then it returns `[]` without fetching.
- Given a guide in the walk is missing, when chained, then it throws naming the missing tag.
- Given a guide whose title version isn't the tag it was fetched as, when chained, then it throws naming both.
- Given the walk reaches `from: none` without meeting the installed tag (installed is older than any release, newer than the target, or not a release), when chained, then it throws "broken chain" naming the installed and target tags.
- Given a `from:` line that loops back to a tag already walked, when chained, then it throws "broken chain" naming the loop.

**Fetch and command**
- Given a served guide, when the fetcher asks for it, then it requests `<raw base>/zacbraddy/ang/<target>/releases/upgrades/<tag>.md`.
- Given a 404, when fetched, then the error says there's no upgrade guide for that tag at the target. Any other non-2xx names the status, and a thrown fetch names the network.
- Given a valid chain, when `upgrade guides --from v1.0.0 --to v1.2.0` runs, then it prints the JSON array oldest first and exits 0.
- Given any parse, fetch or chain error, when the command runs, then it prints `✖ <message>` to stderr and exits 1.

**Format**
- Given `releases/upgrades/README.md`, when an author reads it, then it gives the file name (`vX.Y.Z.md`), the title line, the `from:` line (`none` for the first release), the four headings in order with what each holds, the move syntax and the "None" rule, plus a copyable template.

## Test plan
- **Unit** (`src/.claude/scripts/ang/upgrade/guides.test.mjs`, `node:test`):
  - `parseGuide` on in-memory strings: every Parse line above.
  - `chainGuides` with `fetchGuide` built from a `Map` of tag → markdown that records which tags it was asked for: every Chain line above.
  - The fetcher against a local `node:http` server passed as its base URL: the URL it builds, the 404, a 500 and a closed port.
- **Integration** (`src/.claude/scripts/cli.test.mjs`): `upgrade guides` with `ANG_GITHUB_RAW` pointing at a local `node:http` server, one happy chain and one missing guide.
- **Won't test**: the real `raw.githubusercontent.com`, exact message wording (assert the key phrase and exit code), the registry's flag handling (covered already), and what the guides mean to an upgrade (stories 05 and 06).

## Implementation notes
- **Files**:
  - `src/.claude/scripts/ang/upgrade/guides.mjs` (new): `parseGuide`, `chainGuides`, `githubGuideFetcher`.
  - `src/.claude/scripts/ang/commands/upgrade.mjs` (new): the `upgrade guides` command; story 05 adds `plan` and `apply` here.
  - `src/.claude/scripts/ang-context-manager.mjs` (changed): imports and spreads `upgrade` beside `version`.
  - `releases/upgrades/README.md` (new, repo root, outside `src/` per k12): the format spec and template. No `vX.Y.Z.md` yet; rc.1's guide comes with story 11.
- **Format** (the proposal's spec, with your calls on the heading and the root):
  ```markdown
  # Upgrade guide v1.1.0
  from: v1.0.0
  ## Moves
  - `.claude/ang.json` -> `ang.json`: carry every key the user set across to the new file.
  ## Migrations
  - None
  ## Retired
  - "testing rules" wording: replaced by `engineering-defaults.md`. Flag local text that still uses it.
  ## Notes for the merge
  - None
  ```
  - The four headings must each appear exactly once, in that order. JSON keys stay `moves`, `migrations`, `retired` and `notes`.
  - An entry is a `- ` line. Indented lines after it belong to that entry (joined with a newline), so a drafted guide can wrap. Blank lines are ignored.
  - A move is `` `from` -> `to` `` with an optional `: note`. Paths are repo-relative, as `applyMoves` in story 05 expects.
  - `from: none` marks the first release's guide (rc.1). It parses to `from: null`.
- **`chainGuides(fetchGuide, installedTag, targetTag)`** is async: `fetchGuide(tag) → Promise<string>`.
  - Walk from the target, parse each guide, check `guide.version === tag`, then step to `guide.from`. Stop when the next tag is `installedTag`. Reaching `null` first, or a tag already in the walked set, is a broken chain. Reverse and return.
  - Installed equals target returns `[]` with no fetch. Whether the target is newer is the skill's check (d13), not this one's; an older target simply surfaces as a broken chain.
- **`githubGuideFetcher(targetTag, base = process.env.ANG_GITHUB_RAW ?? 'https://raw.githubusercontent.com')`** returns `fetchGuide(tag)`. Every guide is read at the target tag, not its own (d34), so the target ref and the file's tag are separate. `ANG_GITHUB_RAW` is the test seam, like `ANG_GITHUB_API` in `install.sh`, and isn't documented for users. The global `fetch` is a Node built-in, so ADR 0002 holds.
- **Command**: `{ noun: 'upgrade', verb: 'guides', flags: [from, to] both required }`. The registry calls `run` without awaiting it, so `run` returns `chainGuides(...).then(print).catch((e) => fail(e.message))` to keep rejections from going unhandled. Output is `JSON.stringify(guides, null, 2)`, the file story 05's `--guides` reads.
- **Here be dragons**: `cli.test.mjs`'s `project().run` uses `spawnSync`, which blocks the event loop, so a `node:http` server in the test process can never answer. The CLI tests need an async spawn (or the server in a child process).
- **C4**: `c4/3-components.md` and `c4/4-code.md` updated in this session for the heading name, `from: none` and the fetcher factory.
- **Implemented**:
  - Headings out of order throw too ("in that order" from the format), alongside missing and repeated ones.
  - `cli.test.mjs` gained `runAsync` (async `spawn`) for the two `upgrade guides` runs; the existing sync `project().run` is unchanged.
  - `scripts/install.test.mjs` copies `git ls-files src`, so it fails with `ERR_MODULE_NOT_FOUND` for `upgrade.mjs` until the new files are tracked. With them committed in a scratch copy, the full suite passes (108/108).
- **Out of scope**:
  - Writing any real guide (story 11 for rc.1; `/cut-release` drafts later ones, story 10).
  - Applying moves, and reading Retired during the merge (stories 05 and 06).
  - Checking that the target is newer than the installed tag, and the escape hatch on a broken chain (story 06).
  - Release notes in `releases/notes/` (story 10).

## Review
Done-when evidence present: 108/108 tests pass (76 in `src/.claude`, 32 in `scripts/`) now that the files are staged, and `upgrade --help` lists `upgrade guides`. Every acceptance line has a test. Conforms to plan and C4.

**Must-fix:** none.

**Should-fix**
- `releases/upgrades/README.md:5`: "check a new guide with `upgrade guides` before tagging" can't be done, because the fetcher reads at the target tag, which doesn't exist until it's tagged (and `ANG_GITHUB_RAW` is undocumented on purpose). Drop the sentence or say the check comes with `/cut-release` (story 10).
- `src/.claude/scripts/ang/upgrade/guides.mjs:39`: an empty `from:` parses to `from: ''`, so the chain then fetches `.md` and fails with a confusing "no upgrade guide for  at …". Throw on an empty `from:` instead (one line, plus a case in the missing-`from:` test).

**Nit**
- `guides.mjs:1-2`: the module header restates the story rather than a dragon. Could go; the `chainGuides` and fetcher comments do earn their place.
- `guides.mjs:21`: `None` alongside other entries is kept as a literal `"None"` entry. Harmless, not worth a rule yet.

## Related
- [Plan: upgrade](../plan.md)
- [C4 code: library script](../c4/4-code.md)
- [Release process proposal](../release-process-proposal.md)
- [Story 05](05-upgrade-engine.md)
