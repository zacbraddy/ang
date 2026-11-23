---
title: Project structure
shortDescription: What ships (src/), how this repo runs Ang on itself through symlinks, the repo-only release tooling, and where everything else lives
tags: [repo-structure, tech-stack]
---
# Project structure

## Summary
`src/` is the Ang that ships. The root `.claude/` points into `src/.claude/`, so this repo runs on the same files it ships: most entries are whole-folder symlinks, while `skills/` and `agents/` are real folders of per-entry links plus the repo-only release skill and agent. The release tooling (`install.sh`, `scripts/`, `releases/`, `.github/`) and the docs site (`docs/`) sit at the root, outside `src/`, so they never ship. The root `project-context/` is this repo's own library and is never shipped. Taken from the tracked tree on 2026-11-23.

## Layout
| Path | What it is |
|---|---|
| `src/.claude/skills/` | One folder per workflow command (`/ideate`, `/retro`, `upgrade-ang`, …), each with a `SKILL.md` |
| `src/.claude/agents/` | Subagents: `context-scout`, `prioritiser`, `stage-gate` |
| `src/.claude/rules/` | Always-on rules: tracked `context-library.md` and `engineering-defaults.md`, plus a gitignored `pilot.local.md` that `/tailor-ang` writes |
| `src/.claude/ang/features/<key>/` | Optional features (`intent`, `streams`, `host`, `pilot`): `feature.mjs`, `rule.md` (or a `rule(value)` export, as `pilot` uses), `steps/`, `agents/`, `conventions.md` |
| `src/.claude/scripts/ang-context-manager.mjs` | The library CLI (command-line tool). Its modules are in `scripts/ang/`: `commands/`, `library/`, `items/`, `triggers/`, `config/`, `settings/` (the three-way settings merge) and `upgrade/` (the upgrade engine) |
| `src/.claude/**/*.test.mjs` | Tests, beside the code they cover. Built-in `node:test` only |
| `src/.claude/settings.json` | Hooks (SessionStart banner, SubagentStart, reindex after edits) and permissions. Formatted the way the settings merge writes it, so a vanilla install leaves it byte-identical |
| `src/.claude/output-styles/` | Five canned output styles, tracked. Custom `*.local.md` styles from `/tailor-ang` are gitignored |
| `src/project-context/README.md` | The library conventions doc that ships to users |
| `.claude/` (root) | `rules`, `output-styles`, `ang`, `scripts` and `settings.json` are symlinks into `src/.claude/`. `skills/` and `agents/` are real folders: one relative link per `src/` entry, plus repo-only `cut-release` and `release-scout.md` |
| `install.sh` (root) | The installer. The repo copy is unstamped and stops without a tag; the release job stamps `TAG` and `SHA` into the copy it uploads as a release asset |
| `scripts/` (root) | Repo-only Node scripts with tests: `link-entries` (keeps the per-entry links in sync, and its test fails on drift), `release-manifest` (what changed since the last tag), `draft-guides` (checks an upgrade guide before its tag exists), and `install.test.mjs` |
| `releases/notes/`, `releases/upgrades/` | Per-version release notes (the GitHub Release body) and agent-facing upgrade guides. Each folder's `README.md` is the template |
| `docs/` (root) | The Starlight docs site: `astro.config.mjs`, `src/content/docs/` (one folder per sidebar group), `src/styles/theme.css`, `src/components/Footer.astro`. Its own `package.json` and lockfile with exact pins |
| `.github/workflows/deploy-docs.yml` | Builds `docs/` and publishes it to Pages on a push to `main` touching `docs/**`, or on a manual run |
| `.github/workflows/release.yml` | Runs on a `v*` tag push: tests, smoke install, stamp `install.sh`, draft release |
| `ang.json` (root) | Project feature keys (`intent`, `streams`), committed. Every install has its own; Ang ships none |
| `ang.local.json` (root) | Personal keys (`pilot`, `host`), gitignored, written by `/tailor-ang` |
| `project-context/` (root) | This repo's own context library. Its `README.md` is a symlink to `src/project-context/README.md`, the conventions that ship |
| `workflow-improvements/` | Raised workflow-improvement docs |
| `LICENSE`, `README.md` | MIT licence and the repo README |

## Dragons
- Because of the symlinks, editing `.claude/` edits the product itself.
- A new skill or agent in `src/` needs `node scripts/link-entries.mjs` before this repo sees it; the drift test fails the release job otherwise.
- Run the tests with the globs quoted, on Node 26 (the minimum, bumped each October by the `node-lts-bump` trigger): `node --test 'src/.claude/**/*.test.mjs' 'scripts/*.test.mjs'`. A bare directory argument is treated as a test file and fails.
- Ang ships no config: a fresh install has every feature off until `/bootstrap-repo` writes `ang.json`. This repo's root `ang.json` and `ang.local.json` are its own, like any install's, and never ship.
- Gitignored `*.local.*` files sit physically under `src/` through the symlinks. Releases are fetched from git, so they never ship; never build a release from disk.

## Docs site dragons
- Work in `docs/`: `npm run dev` to review, `npm run build` to check. Every build prints three harmless notices: the Mermaid chunk-size warning, the empty `i18n` notice and the missing `404` notice.
- Pins are exact and bumped only when the build breaks or a security fix lands. No community plugins beyond `astro-mermaid` and `starlight-llms-txt`.
- Pages link by relative route (`../../concepts/funnel/`), never `/ang/…`. There's no link-checker plugin (`starlight-links-validator` broke on Astro 7), so crawl the built `docs/dist/` with a throwaway script instead.
- The light accent `#208368` sits exactly at AA (the WCAG 4.5:1 contrast minimum). Re-check contrast on any tint change.
- Heading emoji must have no variation selector (🛣️ ⚙️ ✍️ 🛠️ 🗑️ 🗺️ 🌪️ have one): it lands in the anchor and breaks links to it.
- `docs/public/favicon.svg` is a stand-in until Ang has a logo.

## Related
| Doc | Why |
|---|---|
| [ADR 0001: Claude Code harness, Orca optional](/project-context/10k/technical/adrs/0001-claude-code-harness-orca-optional.md) | Why everything lives under `.claude/` |
| [ADR 0002: Zero-dependency library script](/project-context/10k/technical/adrs/0002-zero-dependency-library-script.md) | Why the shipped script has no dependencies, and which `package.json` files exist |
| [ADR 0003: Per-user config overlay](/project-context/10k/technical/adrs/0003-per-user-config-overlay.md) | Why config is split into `ang.json` and `ang.local.json` |
| [ADR 0005: Install by copy-in](/project-context/10k/technical/adrs/0005-install-by-copy-in-from-releases.md) | What `install.sh` does |
| [ADR 0007: How releases are cut](/project-context/10k/technical/adrs/0007-how-releases-are-cut.md) | What `scripts/`, `releases/` and the workflow are for |
| [ADR 0008: Docs site](/project-context/10k/technical/adrs/0008-docs-starlight-on-github-pages.md) | Why `docs/` is Starlight on Pages |
| [What Ang is](/project-context/10k/product/what-ang-is.md) | What these files add up to |
