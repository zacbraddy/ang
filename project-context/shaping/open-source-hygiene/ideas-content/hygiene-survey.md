---
title: Open-source hygiene survey of small, whimsical repos
shortDescription: Which community health files 17 small or personality-driven repos keep, adapt or drop, and candidate kits for Ang
tags: [open-source]
---
# Open-source hygiene survey

## Summary
Small, solo or personality-driven repos keep a thin kit: README, LICENSE and, if they ship versions, a changelog. They usually put "fork it, it's yours" guidance in the README rather than a CONTRIBUTING file. They mostly drop the code of conduct, SECURITY.md and contributor lists. Where they want structure, they use issue templates with blank issues off and links that send chat to Discussions. These are facts about practice, read from 17 repo trees on 2026-11-16 (ET 1, evidence tier 1: a primary source). No study shows that any of these files changes outcomes for a project this small, so "it helps" stays **unverified** either way. Shaping should pick from the three candidate kits below.

## Ang today (GitHub API, 2026-11-16, ET 1)
README and LICENSE only. Nothing in `.github/`. Discussions and private vulnerability reporting (PVR) are both off. The community profile scores 42%. There is no account-level `zacbraddy/.github` repo.

## What small or whimsical repos do
| Standard | Typical practice | Claim ET |
|---|---|---|
| CONTRIBUTING | **Adapt.** Solo and starter repos skip it and say "fork it" in the README (nanoGPT, kickstart.nvim, LazyVim/starter, both dotfiles repos). Others keep a short, opinionated version (tpope). | ET 1 for the practice. Elazhary 2019: about two-thirds of 53 projects don't follow their own guidelines, so the files drift. |
| Code of conduct | **Mostly dropped** at personal scale: 3 of 13 personal repos have one, one of those only through an account-level default. Org-backed projects keep one (lazygit, zx). | ET 1 for the practice. ET 2 that a private reporting path matters more than the document (opensource.guide, GitHub blog). Benefit for tiny repos **unverified**. |
| SECURITY.md | **Drop, or turn on GitHub PVR instead.** Only repos with real runtime have one (htmx, fzf, lazygit, litestream). | ET 1 that PVR exists and is opt-in (generally available since 2023-04-19). Harm from leaving it out **unverified**. |
| Changelog | **Split.** Tools that ship releases keep one (just, fzf, htmx; superpowers uses RELEASE-NOTES). Starters and dotfiles have no changelog and no tags. | ET 1 |
| CONTRIBUTORS / all-contributors | **Dropped** in all 17. GitHub's contributors graph covers it. | ET 1 for absence. ET 3 for the vendor's claims of value. |
| Issue and PR templates | **Adapt.** `blank_issues_enabled: false` plus `contact_links` that send chat to Discussions or Discord (kickstart, superpowers, agent-os). | ET 1 |
| Discussions | The common home for open conversation (kickstart, llm.c, fzf, just, agent-os). | ET 1 |
| FUNDING, CODEOWNERS, stale bots | Optional. FUNDING appears in 8 of 17 repos and CODEOWNERS in 2. No small repo uses a stale bot. | ET 1 |
| Badges | CI, coverage and dependency badges are "mostly reliable signals" of quality (Trockman, ICSE 2018, 294,941 npm repos). | ET 1 |
| Maintenance signal | repostatus.org offers badges such as "Concept" and "Inactive". SQLite calls itself "Open-Source, not Open-Contribution". Rare among small repos. | ET 1 that these exist |

GitHub's community profile counts README, LICENSE, CODE_OF_CONDUCT, CONTRIBUTING, issue templates, a PR template and the repo description. Files in an account-level `.github` repo count for every repo that lacks its own. That is how ky and doomemacs score files they don't hold (ET 1).

## Per-repo detail
| Repo | Kit | Tone worth borrowing |
|---|---|---|
| nvim-lua/kickstart.nvim | Issue templates with blank issues off and chat sent to Discussions; a PR template | "**NOT** a distribution… a starting point". The PR template warns forkers that GitHub targets the parent repo by default. |
| obra/superpowers (Claude Code skills) | CoC, RELEASE-NOTES, strict templates, chat sent to Discord, FUNDING | PR template: doesn't accept agent-written PRs that fix issues filed by someone else |
| karpathy/llm.c | Contribution guidance in the README, Discussions | Ports "should be done in separate repos", plus a "notable forks" section |
| mathiasbynens/dotfiles, holman/dotfiles | README only | "Don't blindly use my settings"; "meant to be forked" |
| tpope/vim-fugitive | Prickly CONTRIBUTING, Discussions, FUNDING | "'Send a patch' is an edge case answer in my book" |
| bigskysoftware/htmx | CONTRIBUTING, SECURITY with PVR, CHANGELOG, PR template | Asks people to build extensions rather than grow the core |
| benbjohnson/litestream | Full kit | Closed to contributions in 2021, then reopened for bug fixes, calling the closed policy "overly broad" |
| casey/just, junegunn/fzf, sindresorhus/ky, buildermethods/agent-os, LazyVim/starter, karpathy/nanoGPT | Range from a bare template (LazyVim/starter) to a full kit (agent-os) | ky inherits its CoC and CONTRIBUTING from the account-level `.github` repo |

Also checked: lazygit, zx, gum and doomemacs. All are team- or org-backed with fuller kits.

## Candidate kits for shaping
1. **Minimal-whimsical.** A "Fork it, it's yours" section in the README in Ang's voice, carrying d4's pointer to the templates. Issue templates with blank issues off: the first-principle redirect, plus an open-conversation template or a link to Discussions. A kickstart-style PR template that warns about the fork's base repo. Turn on PVR instead of writing SECURITY.md. No CoC, no CONTRIBUTING.
   - Upside: near-zero upkeep, and the closest fit to the intent.
   - Downside: the community profile stays partial.
2. **Minimal plus short files.** Option 1 plus a ~10-line CONTRIBUTING ("Ang is mine; fork it; small fixes welcome; no promises") and a 3-line CoC (be decent, I moderate, report privately). **Chosen by Zac (2026-11-16).**
   - Upside: GitHub links both files at the moment someone opens an issue or PR.
   - Downside: two more files to keep true.
3. **Account-level `zacbraddy/.github` defaults.** Write CoC, SECURITY and CONTRIBUTING once and reuse them in every repo. **Ruled out by Zac (2026-11-16):** not every repo needs this rigour, and copy-paste suits the few that do.
   - Upside: the cheapest per repo.
   - Downside: the generic text loses Ang's voice. The defaults also become the issue templates of every repo that has none.

For every kit: use tags plus generated GitHub Releases rather than a hand-kept changelog, unless people pin versions. A repostatus "Concept" or "Inactive" badge fits beside the CI badge as an honest maintenance signal.

## Unknown unknowns
- **Agent-written PRs and issues** are a live problem for Claude Code frameworks; superpowers' template exists because of them. GitHub added collaborators-only PR access on 2026-02-13 and collaborators-only issue creation on 2026-06-29 as whole-repo fallbacks.
- **Forkers PR-ing upstream by accident**, because GitHub's fork default targets the parent repo.
- **Closed policies tend to soften** (litestream). "Small fixes welcome" may age better than "no PRs".

## Sources
| Source | Date | ET | Interest |
|---|---|---|---|
| Repo trees and community profiles of the 17 repos, via the GitHub API | 2026-11-16 | 1 | |
| [GitHub Docs: community profiles](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/about-community-profiles-for-public-repositories) | undated | 1 | GitHub wants adoption |
| [GitHub Docs: default community health files](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file) | undated | 1 | |
| [GitHub Docs: private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/working-with-repository-security-advisories/configuring-private-vulnerability-reporting-for-a-repository) | undated | 1 | |
| [GitHub Blog: PVR generally available](https://github.blog/2023-04-19-private-vulnerability-reporting-now-generally-available) | 2023-04-19 | 1 for facts | Vendor |
| [GitHub Changelog: PR access settings](https://github.blog/changelog/2026-02-13-new-repository-settings-for-configuring-pull-request-access/) | 2026-02-13 | 1 | |
| [GitHub Changelog: collaborators-only issues](https://github.blog/changelog/2026-06-29-restrict-issue-creation-to-collaborators-only/) | 2026-06-29 | 1 | |
| [Elazhary et al., "Do as I Do, Not as I Say", ICSME](https://arxiv.org/abs/1908.02320) | 2019 | 1 | |
| [Tourani et al., "Code of conduct in open source projects", SANER](https://mcislab.github.io/publications/2017/saner.pdf) | 2017 | 1 (adoption only) | |
| [Wessel et al., "Should I stale or should I close?", BotSE](https://www.ime.usp.br/~gerosa/papers/BotSE2019.pdf) | 2019 | 1 | |
| [Trockman et al., "Adding Sparkle to Social Coding", ICSE](https://par.nsf.gov/servlets/purl/10063054) | 2018 | 1 | |
| [GitHub Open Source Survey](https://opensourcesurvey.org/2017/) | 2017 | 1, dated and not specific to small repos | |
| [opensource.guide: Code of conduct](https://opensource.guide/code-of-conduct) | undated | 2 | GitHub-sponsored, pro-CoC |
| [GitHub Blog: when your project becomes a community](https://github.blog/2022-06-30-what-to-do-when-your-open-source-project-becomes-a-community/) | 2022 | 2 | |
| [repostatus.org](https://www.repostatus.org/) | undated | 1 for its definitions | |
| [SQLite: Open-Source, not Open-Contribution](https://www.sqlite.org/copyright.html) | undated | 1 | |
| [The Register: SQLite CoC episode](https://www.theregister.com/2018/10/22/sqlite_code_of_conduct/) | 2018-10-22 | 2 | |
| [GitHub ReadME: How open is open source (litestream)](https://github.com/readme/featured/how-open-is-open-source) | undated | 2 | |

## Related
- [Hub](../README.md)
- [Brief](brief.md)
- [Quality tooling](quality-tooling.md)
- [First principles](/project-context/10k/product/first-principles.md)
