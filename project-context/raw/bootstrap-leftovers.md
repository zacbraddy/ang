# Bootstrap leftovers (2026-11-13)

Threads set aside by `/bootstrap-repo`. These are for `/ideate`, alongside `opening-ang.md`.

## Quality tooling: deferred, decide during open-source release prep
The repo has no lint, format, tests or CI. We chose to skip it at bootstrap. The options on the table were:
- (B) a zero-dependency setup: GitHub Actions running `node --check` and `node --test`;
- (C) the full kit: root `package.json` with ESLint, Prettier, Vitest, Husky, lint-staged and CI.

C contradicts ADR 0002 (zero dependencies) unless it's dev-only at the root. Whichever we pick, there are no tests yet for CI to run.

## Shipped settings point at an uncommitted output style
`src/.claude/settings.json` sets `"outputStyle": "Partner In Crime"`, and the root `.claude/output-styles` symlink is tracked. But `src/.claude/output-styles/` itself is untracked, so a fresh clone names a style it doesn't have. This belongs with the "personal rule and output style" workstream.

## Shipped `ang.json` has intent and host switched on
`src/.claude/ang.json` currently reads `{ intent: true, streams: false, host: "orca" }`. That is this repo's config, and it is also the default that ships. Decide what users should get by default. With `intent: true` and no `10k/intent.md`, `validate` fails on a fresh install. This belongs with the "where `ang.json` lives" workstream.

## Evidence tiers: brain dump vs implementation
- The brain dump describes the tiers as ET 1 = the pilot (the human driving Ang), ET 2 = real expert authors, ET 3 = model reasoning.
- The shipped `src/project-context/README.md` defines them as ET 1 = primary sources (the user's own statements included), ET 2 = credible secondary sources, ET 3 = anecdote, marketing or undated material.

The docs site needs one story, and the implementation is current truth.

## Installing, uninstalling and updating Ang (Zac, added at bootstrap)
A workstream to explore: how Ang gets into a project quickly and easily.
- **Install route.** One option is to ship it as a Claude Code plugin marketplace. But would that get in the way of users editing their own copy, which is what workflow improvements depend on? Ang is a starter users bend, so files they own may beat a managed plugin. Weigh the alternatives, e.g. a copy script or `npx degit`-style cloning.
- **Uninstall command.** Is one worth having? If so, what should it remove (`.claude/` entries, `project-context/`), and what must it never remove?
- **Update command.** Probably not, because Ang shouldn't change much and users diverge from upstream by design. Still consider it, even if the answer is "not for now".

This is related to the next item: how `project-context/README.md` reaches a user's install is part of the install story.

## `project-context/README.md` missing at the root
`library init` doesn't create `project-context/README.md`, yet the rules tell agents to read it. In this repo it only exists at `src/project-context/README.md`. Check how a user's install gets it, and whether init should copy it.
