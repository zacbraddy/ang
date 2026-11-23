---
title: Quality tooling for the Ang repo
shortDescription: Evidence on none vs zero-dependency CI (B) vs a full lint/format/hook kit (C) for a tiny, solo, low-contribution repo
tags: [open-source]
---
# Quality tooling for the Ang repo

## Summary
Zac chose the full kit, option C, on 2026-11-16: ESLint, Prettier, Vitest, Husky, lint-staged and CI, dev-only at the repo root. Lint must reach zero errors and zero warnings, and markdown is ignored by every linter and formatter. The evidence below leaned toward B, a zero-dependency workflow running `node --check` and `node --test`. Zac weighed that against the code being read publicly under his name. Ang already has 37 tests, and the documented test command silently runs none of them.

## Decision (Zac, 2026-11-16)
- **C, in full.** Being lean here would push Ang into building its own quality tooling by hand, and that ends in sticky-tape fixes. Off-the-shelf tools cost a few commands, and sitting idle while Ang changes little costs little.
- **The code's style now matters.** Going open source means people will read and judge the source, and it ships with Zac's name on it.
- **Zero errors and zero warnings, with auto-fix on** to keep them there: ESLint `--fix` and Prettier `--write` run through lint-staged on commit. CI can only check, since it can't commit fixes. No markdown linting or formatting anywhere.
- **Sane defaults.** Prettier mostly as shipped, with semicolons and trailing commas. Prettier 3 already defaults to `semi: true` and `trailingComma: "all"` (from memory of Prettier's docs, unverified), so set both explicitly anyway to pin them. ESLint gets the style and syntax plugins the community treats as sane defaults. Which plugins that means is an open unknown.
- **Status badges** on the README, the CI badge included: Ang should look like a grown-up repo.
- The tooling is dev-only at the repo root and never ships into users' repos. How that squares with tests that live in `src/`, and with ADR 0002, is open for shaping.

## The repo today (first-hand, 2026-11-16)
- 37 `node:test` tests in 4 files, all passing in about 0.5s on Node 22.19. About 1,800 lines of non-test script. `node --check` passes on every script. The brief's "no tests yet" is out of date.
- The documented command, `node --test 'src/**/*.test.mjs'` in [project structure](/project-context/10k/technical/project-structure.md), finds **0 tests** and exits green, because Node's glob skips dot-folders such as `.claude/`. `node --test 'src/.claude/**/*.test.mjs'` finds all 37. CI using the same glob would pass vacuously too.

## Findings
**Upkeep of a minimal GitHub Actions workflow**
- GitHub has forced two Node runtime moves for actions in three years: Node 16 to 20 (2023–24), then Node 20 to 24 (Node 24 the default from 16 Jun 2026, Node 20 removed 23 Sep 2026). The dates moved three times. ET 1 [S1–S4].
- New majors of `actions/checkout` and `actions/setup-node` came out about yearly or faster from 2023 to 2026. checkout reached v7 in 2026-06 and setup-node reached v7 in 2026-07. ET 1 [S5].
- GitHub runs planned "brownouts" (days where jobs deliberately fail) to retire old action versions, e.g. artifact v3 and cache v1/v2 in 2025. A checkout-plus-test workflow uses neither. ET 1 [S6, S7].
- `ubuntu-latest` moves from Ubuntu 24.04 to 26.04 between 19 Oct and 19 Nov 2026. Without `setup-node`, the Node version moves with it. ET 1 [S8].
- Hosted runners stay free for public repos. Scheduled workflows are disabled after 60 days without activity, which doesn't affect push- or PR-triggered ones. ET 1 [S9, S10].
- The median project changed its CI config 12 times over its life (Travis era). ET 1 [S11].

**What small repos actually do** (checked 2026-11-16, ET 1 [S12])
- Maintained solo zero-dependency packages run lean CI. sindresorhus/slugify runs a linter (xo) and `node --test`, with action pins kept current.
- Unattended CI rots in public. lukeed/kleur (last push 2023-06) has old pins and recent runs that fail with no jobs or sit at `action_required`. Fork PRs on lukeed/dequal wait on maintainer approval to run.
- Agent-workflow repos are split. obra/superpowers and anthropics/skills have no workflows. BMAD-METHOD, spec-kit, SuperClaude and wshobson/agents have several, mostly for validation, bots and docs.

**Value of CI to a project like Ang**
- CI users released about twice as often and merged PRs faster. Correlational. ET 1 [S11].
- Non-users' reasons: unfamiliarity (47%), no tests (44%), too few commits for CI to be worth it (35%), maintenance cost (21%). n=35. ET 1 [S11]. Ang has tests, so the second reason doesn't apply.
- Projects with many commits but few PRs and simple builds were the likeliest to abandon CI. ET 1 paper, read via summaries [S14]. Ang fits that profile.
- No credible source argues CI is net-negative for tiny projects, and no clear case was found of a tiny project hurt by having none.

**Cost of the full kit (C)**
- ESLint forced two config migrations in about two years: flat config became the default in v9 (2024-04), and v10 (2026-02) removed `.eslintrc`, with v9 end of life on 2026-08-06. ET 1 [S15, S16].
- Husky 9 broke `husky install`. ET 3, unverified [S17]. Every devDependency also brings Dependabot or Renovate PRs. Unverified.
- C needs a `package.json`, which [ADR 0002](/project-context/10k/technical/adrs/0002-zero-dependency-library-script.md) rules out unless it's dev-only at the root. The [intent](/project-context/10k/intent.md) treats new tooling as a "no" until it makes its case.

## Candidate approaches considered
C was chosen. These stay here as the alternatives it was weighed against.
- **None + one fixed command:** no CI. Fix the documented glob, and possibly have workflow commands run the tests before handing over.
- **B-minimal:** `actions/checkout` only, using the runner's preinstalled Node. One pin to bump about yearly, but the Node version floats.
- **B:** checkout plus `setup-node` pinned to one LTS major (long-term-support release). Optionally, Dependabot for the `github-actions` ecosystem only, so the yearly bump arrives as a PR.
- Any workflow or tooling config lives at the repo root (`.github/`), outside `src/`, so it never ships into users' repos.

## Unknowns surfaced
- Tests live in `src/` and ship to users, who have no Vitest. Moving them to Vitest means either keeping test files out of what ships or keeping `node:test`.
- Whether an action pinned to an old Node major fails hard or gets moved onto the newer runtime. kleur's zero-job failures hint at hard failures. Unverified.
- First-time contributors' fork PRs need a maintainer click to run CI, which is a small ongoing chore.
- How `node --test` globbing and default patterns differ across Node majors. That matters for which Node versions Ang supports. Unverified.

## Sources
- S1 GitHub changelog, "Transitioning from Node 16 to Node 20", 2023-09-22, https://github.blog/changelog/2023-09-22-github-actions-transitioning-from-node-16-to-node-20/ (ET 1)
- S2 GitHub changelog, "All Actions will run on Node20", 2024-03-06, https://github.blog/changelog/2024-03-06-github-actions-all-actions-will-run-on-node20-instead-of-node16-by-default (ET 1)
- S3 GitHub changelog, "Deprecation of Node 20 on Actions runners", 2025-09-19, edited through 2026-08, https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/ (ET 1)
- S4 GitHub changelog, "Node 20 is no longer available", 2026-09-23, https://github.blog/changelog/2026-09-23-node-20-is-no-longer-available-in-github-actions (ET 1)
- S5 GitHub releases API, actions/checkout and actions/setup-node, queried 2026-11-16 (ET 1)
- S6 GitHub changelog, "Deprecation notice: v3 of the artifact actions", 2024-04-16, https://github.blog/changelog/2024-04-16-deprecation-notice-v3-of-the-artifact-actions (ET 1)
- S7 GitHub changelog, 2024-12-05 and 2025-03-20, https://github.blog/changelog/2024-12-05-notice-of-upcoming-releases-and-breaking-changes-for-github-actions/ and https://github.blog/changelog/2025-03-20-notification-of-upcoming-breaking-changes-in-github-actions/ (ET 1)
- S8 GitHub changelog, "Ubuntu 26 GA and latest migration", 2026-09-17, https://github.blog/changelog/2026-09-17-ubuntu-26-generally-available-and-latest-migration (ET 1, read via search snippet)
- S9 GitHub Docs, "Disable and enable workflows", living doc, https://docs.github.com/en/actions/how-tos/manage-workflow-runs/disable-and-enable-workflows (ET 1)
- S10 GitHub changelog, 2025-12-16, https://github.blog/changelog/2025-12-16-coming-soon-simpler-pricing-and-a-better-experience-for-github-actions/ (ET 1. GitHub has an interest in its pricing, but this claim is a factual price statement)
- S11 Hilton et al., "Usage, Costs, and Benefits of Continuous Integration in Open-Source Projects", ASE 2016, https://cs.uwaterloo.ca/~m2nagapp/courses/CS846/1171/papers/hilton_ase16.pdf (ET 1, full text)
- S12 GitHub repos checked via `gh api` on 2026-11-16: sindresorhus/slugify, lukeed/kleur, lukeed/dequal, ai/nanoid, obra/superpowers, anthropics/skills, wshobson/agents, SuperClaude-Org/SuperClaude_Framework, bmad-code-org/BMAD-METHOD, github/spec-kit, and the holman, mathiasbynens and thoughtbot dotfiles (ET 1)
- S13 Vasilescu et al., ESEC/FSE 2015, https://www.cs.ucdavis.edu/~filkov/papers/pr_soc_lan.pdf (ET 1, read via snippets)
- S14 Widder et al., "I'm Leaving You, Travis", MSR 2018, https://par.nsf.gov/biblio/10063057 (ET 1 paper, read via summaries)
- S15 ESLint blog, "v9.0.0 released", 2024-04, https://eslint.org/blog/2024/04/eslint-v9.0.0-released/ (ET 1)
- S16 ESLint blog, "v10.0.0 released", 2026-02, https://eslint.org/blog/2026/02/eslint-v10.0.0-released/ (ET 1), and InfoQ, 2026-04, https://infoq.com/news/2026/04/eslint-10-release (ET 2)
- S17 Husky v9 notes quoted in dependency-bump PRs, e.g. https://github.com/aws-powertools/powertools-lambda-typescript/pull/2131 (ET 3)

## Related
- [Hub](../../../README.md)
- [Brief](./brief.md)
