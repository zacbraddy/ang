---
title: Open-source hygiene plan
shortDescription: Scope, approach, sequencing, risks, success measures, test strategy, deliverables and candidate ADRs for Ang's dev-only quality tooling, CI and contributor kit
tags: [open-source, tech-stack, repo-structure]
---
# Open-source hygiene plan

## Summary
This epic makes the Ang repo fit to be read, forked and contributed to. It is done when **a pull request to `main` gets a green CI run (lint, format check and every test), the README shows its four badges, and GitHub's New issue page offers only Ang's templates**.
- **Technical half:** a private, dev-only root `package.json` with ESLint, Prettier, Husky and lint-staged; `npm test` on `node:test`; Ang's code fixed to zero errors and zero warnings; an advisory CI workflow on Node 26 (the current LTS, long-term support, release). `release.yml` runs `npm test`.
- **Repo-facing half:** CONTRIBUTING, issue and PR templates written as rubber-ducking nudges toward [first principles](/project-context/10k/product/first-principles.md), a "fork it" README section, badges, and GitHub settings flipped with `gh api`.
- **Shipped change:** Ang stops nudging pilots toward `/bootstrap-quality`; `/bootstrap-repo` offers a `/trigger` instead.

Nothing here ships to installs except the three `src/` edits in story 6. The root `package.json` and its tooling stay outside `src/`, so `install.sh` never copies them.

## Scope
- **Root tooling (d8, d11, k13):**
  - `package.json`: `private: true`, `engines.node >=26`, dev dependencies only (ESLint, `@eslint/js`, `eslint-plugin-n`, `eslint-plugin-regexp`, `@stylistic/eslint-plugin`, `eslint-config-prettier`, `globals`, Prettier, Husky, lint-staged), a lockfile, and scripts `test`, `lint`, `format`, `format:check` and `prepare` (Husky);
  - `.node-version` set to `26`; `node_modules/` added to `.gitignore`;
  - `eslint.config.mjs` with d9's set and `reportUnusedDisableDirectives: "error"`; Prettier config with semicolons and trailing commas set explicitly (d3), formatting JS, JSON and YAML (d17);
  - ignores for both tools: `docs/`, `project-context/`, `releases/`, root `.claude/` (it symlinks into `src/.claude`) and all markdown (d1, k13).
- **Clean code:** Prettier and ESLint over `src/`, `scripts/` and root configs to zero errors and zero warnings, including the regexp plugin's 10 findings as of 2026-11-23: 3 super-linear backtracking, 5 unused capture groups and 2 style fixes ([code level](c4/4-code.md#lint-findings-in-the-shipped-script-story-2)).
- **Enforcement:** Husky pre-commit running lint-staged with `eslint --fix` and `prettier --write` (d1). A `ci.yml` workflow on `pull_request` and `push` to `main`: `npm ci`, ESLint, `prettier --check`, `npm test`, Node from `.node-version` (k13). Advisory only, no branch protection (d18).
- **`release.yml`:** its test step becomes `npm test` (d16), so the test globs live only in `package.json`.
- **Contributor kit (d4, d6, d12):** `CONTRIBUTING.md` (about 10 lines), `.github/PULL_REQUEST_TEMPLATE.md`, `.github/ISSUE_TEMPLATE/` with the open-conversation template leading and the feature-request template, and `config.yml` with `blank_issues_enabled: false` and a contact link to Discussions ([what the templates are for](origins/open-source-hygiene/shaping-content/pr-template-purpose.md)).
- **README:** a "fork it" section in Ang's voice that points to CONTRIBUTING and the templates (d4), and four badges: CI status, licence (MIT), Node `>=26` from `engines`, latest release (k14). The README itself is the documentation stream's rewrite; this epic adds to it.
- **GitHub settings (k14, d19):** Discussions on, private vulnerability reporting on, wiki off, projects off. Delete-branch-on-merge stays off.
- **Shipped `src/` edits (d10, d15):** drop the nudge sentence from `src/.claude/rules/engineering-defaults.md`, drop "flag that instead" from the `bootstrap-quality` description, and swap `bootstrap-repo` step 7's founding-only line for the `/trigger` offer.
- **10k and library upkeep:** amend ADR 0002 (d14), update `10k/technical/project-structure.md` (layout table, "why there is no package.json", commands) and the [Node LTS bump trigger](/project-context/triggers/node-lts-bump.md) so the yearly bump covers `.node-version`, `engines` and `ci.yml`.

## Out of scope
- The licence. `LICENSE` (MIT, Zac Braddy, 2026) is already in the repo (k1).
- Release mechanics, a changelog, release bots (d13, k11). ADR 0007 is unchanged.
- Vitest and any test-file changes (d7). Shipped tests keep running on Node alone.
- Linting markdown (d1). The docs site's own tooling stays in `docs/`, owned by the documentation stream.
- SECURITY.md, CONTRIBUTORS, a code of conduct (parked), account-level `zacbraddy/.github` defaults (d5, d6).
- Branch protection, rulesets, collaborators-only PRs, auto-close bots (d12, d18).
- Dependency update bots. Nothing decided asks for one; bumps are by hand.
- Nudging other installs toward this kit. One repo's choice binds no other (d10).

## Approach
### Tooling lives at the root, never in `src/`
`install.sh` copies only `src/`, so the root `package.json`, lockfile, configs and `node_modules/` can't reach an install. The shipped tests still run with plain `node --test` in every install; `npm test` is only a name for the same globs in this repo (d7, d8).

### One place for the Node version
`ci.yml` reads `.node-version` through `actions/setup-node`'s `node-version-file`. `release.yml` does the same in story 1, replacing its hard-coded `26` and the "No .node-version yet" comment, so the yearly bump edits `.node-version` and `engines` and nothing else in CI. This is a one-line input swap; the job's steps stay as d16 describes (d20).

### Clean in one pass, then enforce
Formatting and lint fixes land before any hook or CI, so neither starts red. The Prettier pass and the hand fixes (the regexp findings, `n` rules) land together, unstaged; no dedicated formatting commit (d21).

### Templates nudge, settings stay open
Templates ask; nothing blocks (d12). The PR template's prompts are the shape in [what the templates are for](origins/open-source-hygiene/shaping-content/pr-template-purpose.md); wording is Ang's voice and Zac signs it off. The issue chooser links chat to Discussions, so Discussions must be on before `config.yml` lands.

### Settings by agent, confirmed by Zac
The agent proposes each `gh api` call, Zac confirms it, and the story reads the setting back to check it (k14). No script persists; this is a one-off.

## Sequencing
| # | Story | Owner | Depends on |
|---|---|---|---|
| 1 | **Root tooling:** `package.json`, lockfile, `.node-version`, `.gitignore`, ESLint and Prettier configs and ignores, `npm test`; `release.yml` on `npm test` and `node-version-file`; ADR 0002 amendment; `project-structure.md` | agent | — |
| 2 | **Clean code:** Prettier pass, then hand fixes to zero errors and warnings, test-first for changed regexes | agent | 1 |
| 3 | **Enforcement:** Husky and lint-staged, `ci.yml`, README badges (the documentation plan expects badges in the same change as CI), Node bump trigger update | agent | 2 |
| 4 | **GitHub settings:** Discussions, private vulnerability reporting, wiki off, projects off, each read back | both | — |
| 5 | **Contributor kit:** CONTRIBUTING, PR template, issue templates, `config.yml`, README "fork it" section | agent, Zac signs off the voice | 3 (README badges), 4 (Discussions link) |
| 6 | **Drop the nudge:** the three `src/` edits | agent | — |

Stories 4 and 6 can run any time. Stories 3 and 5 touch the README, so they go after the documentation stream's README rewrite reaches `main`, or rebase onto it.

## Risks
| Risk | Mitigation |
|---|---|
| Both streams amend ADR 0002 (k10, d14) | Whichever `package.json` reaches `main` first amends it; the other revises. The documentation branch's rewrite already allows a dev-only root `package.json`, so this epic may only need to fix its Standing line |
| README edits collide with the documentation stream's rewrite | Stories 3 and 5 build on their README once merged; badges and "fork it" are additive sections |
| Regex fixes in the library script change behaviour | A failing regression test per changed regex first, then the fix (see Test strategy) |
| A dev-dependency bump breaks zero warnings | Lockfile pins versions; d9 already dropped the churny plugins; CI is advisory, so a red run blocks nothing |
| `release.yml`'s `npm test` and `node-version-file` are only exercised on the next tag | Both are one-line swaps; check them on the next rc cut, and `ci.yml` runs the same `npm test` on every PR first |
| The documentation stream's story 07 describes `/bootstrap-repo` handing off to `/bootstrap-quality` | d15 only changes the founding-only branch; flagged to that stream at the mail checkpoint |

## Success measures
- `npm ci && npm run lint && npm run format:check && npm test` passes from a clean clone on Node 26, with zero ESLint warnings and `npm test` running every test in both globs.
- A pull request to `main` gets a green `ci.yml` run, and the README CI badge shows it.
- A commit with a misformatted, lint-fixable `.mjs` file is fixed by the pre-commit hook before it lands.
- `gh api` reads back Discussions on, private vulnerability reporting on, wiki off, projects off. GitHub's New issue page offers the two templates and a Discussions link, with no blank issue.
- An install from the next release contains no root tooling files, and `grep -r "bootstrap-quality" src/.claude/rules` finds nothing.
- The next tag's `release.yml` run passes its `npm test` step.

## Test strategy
Right-sized: this epic adds tooling and docs, not behaviour, so the pyramid stays the one Ang already has.
- **Unit (existing):** the `node:test` suites in `src/.claude/**/*.test.mjs` and `scripts/*.test.mjs` are the regression guard for story 2. Every story ends with `npm test` green.
- **Unit (new, story 2 only):** where a regexp or `n` fix changes a regex or code path no existing test covers, write a failing test for its current behaviour first, then fix. `library/frontmatter.mjs` has no direct test and three of the findings, so it gets one. No other new tests.
- **Integration:** the CI run on a real pull request is the check for `ci.yml`, the lockfile and `.node-version`. One deliberately misformatted commit checks the hook.
- **Not tested (engineering defaults):** ESLint, Prettier, Husky and lint-staged configs, `package.json` scripts and the workflow YAML beyond running them. Templates and GitHub settings are checked by eye and by `gh api` readback.

## Deliverables, tools and who does what
| Deliverable | Tool or service | Who |
|---|---|---|
| Root `package.json`, lockfile, configs, `.node-version` | npm, ESLint 10, Prettier, Husky, lint-staged | agent |
| `ci.yml`, `release.yml` edit | GitHub Actions, `actions/setup-node` | agent |
| CONTRIBUTING, PR and issue templates, `config.yml`, README sections and badges | GitHub community files, shields.io badges | agent drafts, Zac signs off the voice |
| Discussions, private vulnerability reporting, wiki and projects settings | `gh api` | agent proposes each call, Zac confirms |
| ADR 0002 amendment, `project-structure.md`, Node bump trigger | `project-context/` | agent |
| Shipped `src/` edits | `src/.claude/` | agent |

## Consistency with `10k/`
- [Business constraints](/project-context/10k/business-constraints.md) say no PR or issue templates unless a no-brainer. d6 and d12 add both: candidate ADR 2.
- [Delivery intent](/project-context/10k/intent.md) says CI on the code needs convincing. Zac was convinced in ideas and shaping (d1, d2, [quality tooling](origins/open-source-hygiene/ideas-content/quality-tooling.md)); the constraints doc's own "bare minimum" includes a CI job: candidate ADR 1.
- [ADR 0002](/project-context/10k/technical/adrs/0002-zero-dependency-library-script.md) says the repo has no `package.json`: amended in story 1 (d14).
- [Project structure](/project-context/10k/technical/project-structure.md) has no `package.json`, `.node-version`, hooks or CI, and names ADR 0002 as the reason: updated in story 1.
- [ADR 0007](/project-context/10k/technical/adrs/0007-how-releases-are-cut.md): no conflict; only the test line and the Node input change (d13, d16).

## Candidate ADRs
1. **The Ang repo runs dev-only quality tooling and advisory CI.** Root private `package.json`; ESLint (d9) and Prettier (d3, d17) to zero warnings with auto-fix on commit (d1); `node:test` kept so shipped tests need Node alone (d7); CI on every PR and push to `main`, advisory with no branch protection (d18). Amends ADR 0002 and resolves the intent's "CI needs convincing".
2. **Contributor templates are rubber-ducking nudges, not gates.** PR and issue templates asking how a change serves every Ang user and why it isn't a local workflow improvement; blank issues off, chat to Discussions; no PR-blocking settings (d6, d12). Overrides the business constraint on templates.
3. **Ang's minimum Node is the current LTS, bumped each year.** `engines`, `.node-version` and CI move together each October; only that version is tested (d11, k8).
4. **Ang doesn't nag about quality tooling.** `/bootstrap-repo` offers it once and offers a `/trigger`; no rule or agent repeats the suggestion (d10, d15).

## Related
- [Hub](README.md)
- [C4: context](c4/1-context.md), [containers](c4/2-containers.md), [components](c4/3-components.md), [code](c4/4-code.md)
- [Brief](origins/open-source-hygiene/ideas-content/brief.md)
- [Hygiene survey](origins/open-source-hygiene/ideas-content/hygiene-survey.md)
- [Quality tooling](origins/open-source-hygiene/ideas-content/quality-tooling.md)
- [Dropping the /bootstrap-quality nudge](origins/open-source-hygiene/shaping-content/bootstrap-quality-nudge.md)
- [Minimum supported Node version](origins/open-source-hygiene/shaping-content/node-version.md)
