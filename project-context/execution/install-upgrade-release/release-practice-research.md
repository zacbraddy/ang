---
title: Release practice research
shortDescription: How widely used open-source projects version, document, publish and pin releases, and where Ang's LLM-drafted release process departs from that convention
tags: [distribution, open-source]
---
# Release practice research

## Summary
- **Semantic Versioning (semver) at 0.x fits Ang.** Under semver, anything can change in 0.x. The common tooling convention is that a breaking change bumps the minor while below 1.0 ([release-please `bump-minor-pre-major`](https://raw.githubusercontent.com/googleapis/release-please/main/docs/manifest-releaser.md)). Calendar Versioning (CalVer) suits large, schedule-driven projects, and Ang is neither.
- **Copy-in tools ship migration data inside the versioned tree, not in release bodies.** Copier's `_migrations` and Angular's `ng update` `migrations.json` are both keyed by version, and the tool runs every entry between the installed version and the target. Ang's upgrade guidance should be cumulative in the same way, because a user may skip several releases.
- **No tool studied reads GitHub Release bodies at upgrade time.** They read files in the fetched tree (copier, Angular, Rails), or build notes from commits locally (oh-my-zsh). If Ang's upgrading agent reads release bodies, that is a departure. It costs an extra API call against a 60-requests-per-hour limit and an online dependency, but one `list releases` call returns every body at once. *(Sample-based finding, not exhaustive.)*
- **Every mainstream release tool needs contributor discipline that Ang doesn't have.** release-please, semantic-release, git-cliff and oh-my-zsh's changelog need Conventional Commits. Changesets needs a changeset file per change, and GitHub's generated notes need labelled pull requests. Ang's commits are free-form prose with a stage prefix and its work isn't pull-request-based, so an LLM draft is the realistic generator.
- **Drafting release notes with an LLM is real but new.** GitHub publishes [copilot-release-notes](https://github.com/github/copilot-release-notes) and jdx publishes [communique](https://github.com/jdx/communique), which also drafts a migration guide. Both say human review is needed. Ang's "LLM drafts, Zac edits, `gh` publishes" is that pattern done by hand.
- **Install scripts either pin a release at release time or resolve "latest".** nvm hard-codes the tag in its script, which is stamped at each release, and lets an env var override it. bun and deno take `releases/latest` or a tag argument, and Homebrew checks out the newest version-sorted tag. None checks that a user-supplied ref is a release; a bad ref just fails to download. giget can't be restricted to tags, so that guard is Ang's own.
- **Cheap conventions worth adopting:** turn on GitHub immutable releases, which lock the tag and assets but keep the notes editable. Use fixed headings with "Breaking changes" first in every release body. Mark drafts as drafts until Zac publishes. A CHANGELOG.md, checksums and signing aren't worth it for Ang yet.

## 1. Versioning
| Scheme | What it signals | Typical users | Fit for Ang |
|---|---|---|---|
| Semantic Versioning (semver) `MAJOR.MINOR.PATCH` | Compatibility of a public API | npm ecosystem, nvm, bun, deno | Good: the "public API" is the file layout, the commands and the `project-context/` conventions that upgrades must carry forward |
| Calendar Versioning (CalVer), e.g. `YY.MM.MICRO` | When it was released | Ubuntu, pip, yt-dlp, Home Assistant ([calver.org](https://calver.org/)) | Weak: CalVer is for large or changing scope, or releases tied to support schedules |
| Commit SHA only | Nothing | oh-my-zsh, which installs the tip of `master` ([install.sh](https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)) and cruft, which records a commit hash ([cruft](https://cruft.github.io/cruft/)) | Ruled out: Ang already targets published releases |

- **What 0.x means:** semver says "Anything MAY change at any time. The public API SHOULD NOT be considered stable" ([semver.org](https://semver.org/), rule 4). In practice, tools treat the minor as the breaking digit below 1.0. release-please's `bump-minor-pre-major` makes "BREAKING CHANGE only bump semver minor if version < 1.0.0" ([release-please manifest docs](https://raw.githubusercontent.com/googleapis/release-please/main/docs/manifest-releaser.md)).
- **When the major gets bumped:** for "any backward incompatible changes … to the public API" (rule 8). The semver FAQ adds that "If your software is being used in production, it should probably already be 1.0.0".
- **Copier sorts tags as PEP 440 versions** (Python Enhancement Proposal 440, Python's version-ordering rules) to pick the newest ([copier updating](https://copier.readthedocs.io/en/stable/updating/)). So any version-comparison rule Ang's upgrade skill uses, such as refusing a downgrade, needs a well-ordered scheme. Plain semver tags (`v0.3.0`) give that.

## 2. Changelog vs release notes
| Approach | Who uses it | Pros | Cons |
|---|---|---|---|
| `CHANGELOG.md` in the repo, in the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format | create-react-app ([updating docs](https://create-react-app.dev/docs/updating-to-new-releases/)), release-please and changesets output | Portable, ships with the code, greppable offline | One more file to keep in step |
| GitHub Release body only | GitHub's [generated release notes](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes) | Zero extra files, and the body stays editable after publishing | Keep a Changelog calls it "non-portable" and less discoverable |
| Both, one generated from the other | release-please writes CHANGELOG.md and then the Release from the same entry ([release-please](https://github.com/googleapis/release-please)) | One source and two surfaces | Needs the generator tooling |
| Docs-site changelog | shadcn/ui ([changelog page](https://ui.shadcn.com/docs/changelog), with RSS) | Rich, linkable | Needs a docs site |

- **What users of pinned or upgraded tools expect:** a per-version entry, newest first and dated, grouped as Added, Changed, Deprecated, Removed, Fixed and Security (Keep a Changelog). They also expect a breaking-change list they can find before upgrading: create-react-app says to "check the changelog for breaking changes before upgrading".
- **Generation:** Keep a Changelog calls a raw git log a "bad idea" because it is noisy. Tools that generate a changelog parse structured commits or changeset files (section 5) rather than dumping the log.

## 3. Upgrade and migration guidance
| Tool | How it tells users or tools what moved or broke | Machine-readable? | Where it lives |
|---|---|---|---|
| copier | `_migrations`: commands, each with an optional `version`. One runs when "new version >= declared version > old version", at a `before` or `after` stage, and only on update ([copier configuring](https://copier.readthedocs.io/en/stable/configuring/)) | Yes | `copier.yml` in the template, at the tag |
| copier update | Regenerates the old version, diffs it against the project, applies the new template and then re-applies the user's diff. Conflicts are inline markers or `.rej` files ([copier updating](https://copier.readthedocs.io/en/stable/updating/)) | n/a | The answers file records the version |
| Angular `ng update` | The library's `package.json` has an `ng-update.migrations` key pointing to a schematics collection. Each entry has a `version`, and every entry between the installed and target versions runs ([angular-cli update spec](https://github.com/angular/angular-cli/blob/main/docs/specifications/update.md)) | Yes, as code | Inside the shipped package |
| Rails `app:update` | An interactive overwrite prompt per file (`[Ynaqdh]`, with diff and merge options) plus a `new_framework_defaults_X_Y.rb` to flip on gradually. The upgrade guide has one section per version step ([Rails upgrading guide](https://guides.rubyonrails.org/upgrading_ruby_on_rails.html)) | Partly | The gem and a docs guide |
| shadcn/ui | `add --diff` and `--dry-run` for copied components, and named `migrate` subcommands (`cn`, `icons`, `radix`, …) as codemods ([shadcn CLI](https://ui.shadcn.com/docs/cli)) | Codemods | The command-line tool (CLI) and the docs changelog |
| cruft | `cruft check` exits 1 when the project is behind, and `cruft update` applies the template diff. No migration mechanism is documented ([cruft](https://cruft.github.io/cruft/)) | No | `.cruft.json` holds the commit |
| Yeoman | Every write to an existing file "will go through a conflict resolution process". No update or migration mechanism is documented ([Yeoman file system](https://yeoman.io/authoring/file-system)) | No | n/a |
| create-react-app eject | "a one-way operation … At this point you're on your own" ([available scripts](https://create-react-app.dev/docs/available-scripts/)) | No | The ejected user gets no upgrade path |
| oh-my-zsh | `git pull --rebase` on the user's clone, then prints a changelog built locally from Conventional Commits, with "BREAKING CHANGES" first ([upgrade.sh](https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/upgrade.sh), [changelog.sh](https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/changelog.sh)) | Via commit format | Git history |

- **Pattern:** tools that take ownership of user files keep version-keyed migration data in the versioned source and replay every entry between the from and to versions (copier, Angular). Docs-only tools put a "Breaking changes" section per version in the guide (Rails, create-react-app).
- **Closest analogue to Ang:** copier. It is a copy-in tool, upgrades by three-way merge, uses version-keyed `_migrations` and needs tags. Ang's upgrade guidance (moves, migrations, retired concepts) is a prose version of `_migrations`, read by an LLM instead of executed. *(Inferred.)*

## 4. Release assets and fetching at upgrade time
- **Automatic:** every release gets a source zip and tarball of the tag. Releases allow up to 1,000 assets, each under 2 gibibytes (GiB) ([about releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)).
- **Common extras:** binaries per platform plus `checksums.txt`, often signed with Sigstore or attested with `actions/attest` (GoReleaser's pattern, [checksum docs](https://goreleaser.com/customization/checksum)). None of the shell installers studied verify a checksum: bun, deno and rustup rely on HTTPS alone (section 6).
- **Immutable releases** (generally available since October 2025): the tag can't move and assets can't change, but the title and notes stay editable. Each release gets an attestation, checked with `gh release verify` ([immutable releases](https://docs.github.com/en/code-security/concepts/supply-chain-security/immutable-releases), [verifying integrity](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/secure-your-dependencies/verifying-the-integrity-of-a-release)). GitHub recommends drafting, attaching assets and then publishing.
- **Do tools fetch release bodies or assets at upgrade time?** Assets, yes: installers download binaries by release URL. No tool studied fetches the release body. Migration data ships in the source (section 3). *(Sample-based.)*

| Endpoint | Returns | Notes |
|---|---|---|
| `GET /repos/{owner}/{repo}/releases/latest` | "the most recent non-prerelease, non-draft release" | Ordered by `created_at`, which is the date of the tagged commit, not of publishing ([REST releases](https://docs.github.com/en/rest/releases/releases)) |
| `GET /repos/{owner}/{repo}/releases/tags/{tag}` | "a published release with the specified tag" | Drafts aren't returned, so this makes a release check for a given ref |
| `GET /repos/{owner}/{repo}/releases?per_page=100` | Published releases, with their bodies | One call can return every body between from and to |
| `https://github.com/{owner}/{repo}/releases/latest/download/{asset}` | Redirects to the latest release's asset | A plain web URL, not a REST API endpoint ([linking to releases](https://docs.github.com/en/repositories/releasing-projects-on-github/linking-to-releases)) |
| `GET /repos/{owner}/{repo}/tarball/{ref}` | The tree at the ref | What giget calls (section 6) |

- **Rate limits:** unauthenticated REST calls get 60 requests per hour per originating IP address, and authenticated ones 5,000 per hour ([REST rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)). giget's tarball download goes through `api.github.com`, so it likely counts against the same 60. *(Inferred.)* An upgrade that resolves latest, lists releases and fetches two tarballs (installed and target) spends about 4 of the 60.

## 5. Release tooling
| Tool | What it does | Required of contributors |
|---|---|---|
| [release-please](https://github.com/googleapis/release-please) | Keeps a release pull request open. Merging it updates CHANGELOG.md and version files, tags, and creates the GitHub Release | Conventional Commits (`feat:`, `fix:`, `!`) |
| [changesets](https://github.com/changesets/changesets) | Gathers changeset files into version bumps and changelog entries, then publishes | A changeset file per change ("lets contributors declare how their changes should be released") |
| [semantic-release](https://semantic-release.gitbook.io/semantic-release) | Runs in continuous integration (CI) after every build on the release branch. It works out the version, generates notes and publishes | Angular-style commit messages by default |
| [git-cliff](https://git-cliff.org/docs/) | Generates a changelog from git history using a template | Conventional Commits by default, or custom regex parsers |
| [GitHub generated notes](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes) | Lists merged pull requests and contributors, grouped by `.github/release.yml` label categories | Labelled pull requests. GitHub says to review the output before publishing |

**LLM-drafted notes in real use:**
- **GitHub's [copilot-release-notes](https://github.com/github/copilot-release-notes) Action:** reads the pull requests merged between two refs and outputs notes plus `uncertain-entries` "flagged for human review". Its README warns "AI output is non-deterministic … Human review is recommended for important releases."
- **jdx's [communique](https://github.com/jdx/communique):** writes the GitHub Release body or a CHANGELOG.md entry from git history, pull requests and repository context. It can also save an editable draft, a review report and a migration guide. It runs on Claude or OpenAI-compatible models.
- **Neither is a widespread default yet.** Practitioner write-ups treat LLM output as a draft and never as the publish step. *(Adoption level inferred from search results.)*

## 6. Install scripts pinned to releases
| Installer | How it picks a version | Guard against non-release refs |
|---|---|---|
| nvm | Hard-codes the release tag in `nvm_latest_version`, which is updated at each release. `NVM_INSTALL_VERSION` overrides it ([install.sh](https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh)) | None: it tries a tag and then any ref, and fails only if `git ls-remote` finds nothing |
| rustup | `/dist` (latest) by default, or `/archive/$RUSTUP_VERSION` ([rustup-init.sh](https://raw.githubusercontent.com/rust-lang/rustup/master/rustup-init.sh)) | Its own static host, so only published builds exist |
| oh-my-zsh | Tip of `BRANCH` (default `master`) | None: no releases |
| Homebrew | Fetches tags and checks out `git tag --list --sort=-version:refname \| head -n1` as a local `stable` branch ([install.sh](https://raw.githubusercontent.com/Homebrew/install/master/install.sh)) | Takes tags only, so branches are never candidates |
| deno | `release-latest.txt` from its own host, or a version argument ([install.sh](https://raw.githubusercontent.com/denoland/deno_install/master/install.sh)) | Downloads a release asset, so a bad version 404s |
| bun | `releases/latest/download/…`, or `releases/download/$1/…` for a tag argument ([bun.sh/install](https://bun.sh/install)) | Same: the tag isn't validated, and `curl --fail` turns the 404 into an error |

- **Two patterns:** stamp the tag into the script at release time (nvm, and Ang's current plan), or resolve "latest" at run time (bun, deno, rustup, Homebrew). Installers that download release assets get release-only behaviour for free. Installers that check out git refs (nvm, oh-my-zsh) accept any ref.
- **giget:** refs use `#ref` and can be a branch, tag or commit, and nothing restricts them to tags or releases ([giget README](https://github.com/unjs/giget)). It downloads from `https://api.github.com/repos/{repo}/tarball/{ref}` and takes a bearer token through its `auth` option ([providers.ts](https://raw.githubusercontent.com/unjs/giget/main/src/providers.ts)). Restricting refs to releases is therefore Ang's own check: one call to `GET /releases/tags/{tag}` before the copy, which also gives a clear "not a published release" message. *(Inferred design.)*

## 7. Where Ang would depart from convention
| Departure | Convention | Cost |
|---|---|---|
| An LLM drafts the notes from history; there is no Conventional Commits or changeset input | Structured input drives the generator (section 5) | The draft is non-deterministic, and items can be missed or invented. Zac's edit is the only check, so the review step must be real. It is cheaper than making Ang's stage-prefixed commits conform |
| Upgrade guidance is prose for an LLM, not executable migrations | copier `_migrations` and Angular schematics run code keyed by version | Results aren't repeatable or testable, and two upgrades can treat the same move differently. It fits Ang because its files are prose and the merge is already LLM-driven *(inferred)* |
| Upgrade guidance would live in the Release body (if chosen) | Migration data ships in the versioned tree | Online-only, one more API call per upgrade, and editable after publishing, even under immutable releases. Putting the guidance in a file at the tag gives it the immutable-tag guarantee and needs no extra call, because the target tarball is already fetched |
| No CHANGELOG.md | Keep a Changelog, release-please and changesets write one | Release history exists only on GitHub. That is acceptable while Ang is GitHub-only, and a later backfill script can rebuild it from release bodies |
| The tag is stamped into `install.sh` | nvm does the same; bun and deno resolve latest | Every release needs a commit before the tag, and forgetting it ships a script that installs the old version. Resolving `releases/latest` at run time removes that step but spends one more API call |
| No checksums or signatures | Binary distributors attach `checksums.txt`; shell installers usually don't | Low for a source copy-in over HTTPS. Immutable releases give attestation for free |

**Cheap conventions to adopt anyway:**
- **Turn on immutable releases:** one repository setting. Tags can't be moved under users who pinned them.
- **Use a fixed skeleton for the release body:** "Breaking changes" first, then the Keep a Changelog categories. The LLM drafts into a known shape and readers know where to look.
- **Key the guidance by version:** each release states the moves and retirements since the previous release only. The upgrading agent reads every release in (installed, target], the copier and Angular rule, so skipping releases works.
- **Use semver 0.x and bump the minor for breaking changes:** state this once in the README, as Keep a Changelog advises for any versioning scheme.
- **Create the release as a draft (`gh release create --draft`) and publish after Zac's edit:** the `releases/latest` and `releases/tags/{tag}` endpoints don't return drafts, so nothing installs it early.

## Related
- [Install, upgrade and release epic](/project-context/execution/install-upgrade-release/README.md)
- [Install and upgrade direction](/project-context/execution/install-upgrade-release/origins/install-uninstall-update/shaping-content/install-and-upgrade-direction.md)
