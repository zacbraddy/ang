---
title: install.sh installs Ang into a repo
shortDescription: The root install.sh checks prerequisites, copies src/ in with giget, merges settings and records the installed version
tags: [distribution, open-source]
status: done
owner: agent
dependsOn: [02]
---
# install.sh installs Ang into a repo

## Summary
The one-line install's script. It lives unstamped at the repo root; the release workflow (story 08) stamps `TAG` and `SHA` into the release asset. Nothing is written until every check passes (d12).

## Outcome
Run with a release tag against a temp git repo, `install.sh` copies `src/` in at the tag's SHA, backs up `.claude/settings.json` once to `settings.json.pre-ang`, merges settings with the copied tree's own `settings merge` (empty base), writes `version.json`, and prints the version, location and next step. Each check (node ≥ 26 and npx, repo root, clean tree, not installed, no collisions, settings parse, ref resolves) stops with what's wrong and how to fix it. Unstamped with no tag, it stops and prints the one-liner (d28). A tag argument resolves through `GET /releases/tags/{tag}` and refuses drafts and unknown tags (d14).

## Rough scope
- Shell functions per [C4 code: install.sh](../c4/4-code.md): `resolve_target`, one `check_*` per check, `copy_in` (giget into `mktemp -d` first), `merge_settings`, `record_and_report`.
- Integration tests against temp git repos with `npx` stubbed on `PATH` to copy a local `src/`, and the GitHub API stubbed at the boundary.

## Done when
- `node --test scripts/install.test.mjs` passes, with a test for every acceptance line below.
- `sh install.sh` from the repo root (unstamped, no argument) exits 1 and prints the release-asset one-liner.
- A copy stamped by hand with a real tag and SHA, run in a fresh temp git repo with the real `npx`, installs Ang. Then `version show` prints that tag and SHA, and `library init` and `library validate` pass.

## Acceptance criteria
**Resolve target** (d28, d14)
- Given the unstamped copy and no argument, when it runs, then it stops before any check and prints `curl -fsSL https://github.com/zacbraddy/ang/releases/latest/download/install.sh | sh`.
- Given a stamped copy and no argument, when it runs, then it uses the stamped `TAG` and `SHA` and makes no API call.
- Given a tag argument for a published release, when it runs, then it resolves the tag's commit SHA and installs that.
- Given a tag argument that is unknown or a draft, when it runs, then it stops saying the tag isn't a published release.
- Given the API is unreachable or rate-limited, when a tag argument resolves, then it stops naming which one (network or rate limit) and how to fix it.

**Checks** (d12). Each stops with exit 1, says what's wrong and how to fix it, and leaves the repo untouched.
- Given node older than 26, or no `npx`, when it runs, then it names what's missing.
- Given Git Bash, MSYS or Cygwin on Windows (`uname -s`), when it runs, then it says Ang on Windows runs inside WSL and how to set that up (d37).
- Given a folder outside any git repo, when it runs, then it says to run it from a git repo's root.
- Given a subdirectory of a git repo, when it runs, then it names the root to `cd` to.
- Given uncommitted or untracked changes, when it runs, then it asks for a clean working tree.
- Given `.claude/ang/version.json` already exists, when it runs, then it says Ang is installed and points to `/upgrade-ang`.
- Given an existing `project-context/`, or any path the copy would write other than `.claude/settings.json`, when it runs, then it lists the colliding paths.
- Given a `.claude/settings.json` that isn't valid JSON, when it runs, then it names the file.
- Given giget fails, when it copies into the temp folder, then it stops saying the download failed, and the repo is untouched.

**Install**
- Given a clean repo with no settings, when it runs, then `src/` lands in the repo, `.claude/settings.json` equals Ang's, and no `.pre-ang` file is written.
- Given a repo with its own `settings.json`, when it runs, then the original is saved to `.claude/settings.json.pre-ang` and the merge keeps the user's values and adds Ang's.
- Given an existing `settings.json.pre-ang`, when it runs, then the backup is left as it was (d7).
- Given the merge reports conflicts, when it runs, then it lists each path where the user's value was kept over Ang's, and the install still succeeds.
- Given success, when it finishes, then `version.json` holds the tag and SHA, and it prints the version, the repo root and `/bootstrap-repo` as the next step.
- Given `CLAUDE_PROJECT_DIR` points elsewhere in the user's shell, when it runs, then everything is still written in the repo root.

## Test plan
- **Integration** (`scripts/install.test.mjs`, `node:test`): runs `sh install.sh` against temp git repos.
  - `npx` is stubbed on `PATH` with a script that copies the local `src/` into giget's target folder, or exits non-zero for the giget-fails case.
  - The GitHub API is a local `node:http` server reached through `ANG_GITHUB_API`. It serves a published release, a draft, a 404, and a 403 with `x-ratelimit-remaining: 0`. The network case points at a closed port.
  - Stamped runs use a temp copy of `install.sh` with `TAG=` and `SHA=` filled in by the test.
  - Node too old: put a `node` stub first on `PATH` that reports `v24.0.0` for the version check.
  - Covers every acceptance line above.
- **Won't test**: giget itself, GitHub's real API responses, exact message wording (assert the key phrase and exit code only), the merge logic (story 02 covers it), and OS, disk or permission failures (d12 rules them out).

## Implementation notes
- **File**: `install.sh` at the repo root (k6), POSIX `sh` with `set -eu`, because it runs as `curl … | sh`. Functions follow [C4 code: install.sh](../c4/4-code.md).
- **Stamp lines**: `TAG=""` and `SHA=""` on their own lines near the top. Story 08's workflow fills these in by replacing those exact lines.
- **Constants**: `REPO=zacbraddy/ang` and `GIGET=giget@3.3.1` (d6). `ANG_GITHUB_API` defaults to `https://api.github.com`. It is the test seam, and it isn't documented for users.
- **Order** (no repo writes before the copy succeeds, plan.md risks):
  1. `resolve_target`
  2. `check_prereqs`, `check_repo`, `check_clean`, `check_not_installed`, `check_settings`
  3. giget into `mktemp -d`, then `check_collisions` against the temp tree
  4. `copy_in`, `merge_settings`, `record_and_report`
  - The temp folder is removed on exit (`trap`).
- **`resolve_target`** uses `node -e` with `fetch`, so there's no curl or jq dependency.
  - First `GET /repos/$REPO/releases/tags/$TAG`. A 404, or `draft: true`, means the tag isn't a published release. A 403 or 429 with `x-ratelimit-remaining: 0` means the rate limit (60 an hour unauthenticated). A thrown fetch error means the network.
  - Then `GET /repos/$REPO/commits/$TAG` with `accept: application/vnd.github.sha` for the full SHA, as the spike did. The release's `target_commitish` can be a branch name, so it isn't used.
- **`check_prereqs`**: `uname -s` isn't `MINGW*`, `MSYS*` or `CYGWIN*` (d37), `node -p 'process.versions.node'` major ≥ 26 (k9) and `command -v npx`.
- **`check_repo`**: `git rev-parse --show-toplevel` must equal `pwd -P`.
- **`check_clean`**: `git status --porcelain` is empty.
- **`check_not_installed`**: checks for `.claude/ang/version.json`.
- **`check_collisions`**: two kinds of collision.
  - `project-context/` exists.
  - A path in the temp tree already exists in the repo, `.claude/settings.json` excepted. Skills compare by folder name, so any same-named skill collides.
  - This widens d12's "skills, rules or agents" to everything the copy would overwrite (output styles, scripts, `docs/procedures`), because overwriting any of them would lose the user's file.
- **`check_settings`**: parses `.claude/settings.json` with `node -e` if it exists.
- **giget**: `npx -y "$GIGET" "gh:$REPO/src#$SHA" "$TMP" --force </dev/null`. The `</dev/null` stops a child process from reading the rest of the piped script (spike).
- **`copy_in`**: moves the temp tree's `.claude/settings.json` aside to `$TMP_THEIRS` (outside the tree), then copies the tree into the repo with `cp -R "$TMP"/. "$ROOT"`.
- **`merge_settings`**:
  - If `.claude/settings.json` exists and `.pre-ang` doesn't, copy it to `.pre-ang`.
  - Then run `CLAUDE_PROJECT_DIR="$ROOT" node .claude/scripts/ang-context-manager.mjs settings merge --base none --ours .claude/settings.json --theirs "$TMP_THEIRS"`, using the copied tree's own script (plan.md).
  - Parse the conflicts JSON with `node -e`, and print one line per conflict path: kept your value, Ang ships X.
- **`record_and_report`**: `CLAUDE_PROJECT_DIR="$ROOT" node … version write --ref "$TAG" --sha "$SHA"`, then print `Ang <TAG> installed in <root>. Next: open Claude Code here and run /bootstrap-repo.`
- **Output**: errors go to stderr as `✖ <what's wrong>` plus a fix line, with exit 1. Progress and the final report go to stdout.
- **Out of scope**:
  - Stamping and the smoke install (story 08).
  - The README one-liner text (documentation stream).
  - Uninstall (d2).
  - Shellcheck, which isn't installed here and is quality tooling's job.
- **As built**:
  - The unstamped-and-no-tag stop (`require_target`) runs first, then `check_prereqs`, then `resolve_target`, so a missing or old node is named before the API lookup needs it.
  - The giget step is its own `download` function ahead of `check_collisions`; `copy_in` only copies.
  - `project-context/` and same-named skills are listed as folders, not file by file.
  - The `node` snippets are quoted heredocs (`node - <<'JS'`) rather than `node -e`, so their messages can use apostrophes.
  - Done-when evidence: a hand-stamped copy (`v0.0.0-story3`, `06719e8`) piped into `sh -s` with the real `npx` installed into a fresh repo; `version show`, `library init` and `library validate` passed.

## Review
Every acceptance line has a passing test (22 of 22; 88 of 88 across the repo by glob), and the unstamped `sh install.sh` exits 1 with the one-liner. No must-fix.

**Should-fix**
- `c4/4-code.md:51-55`: the install.sh table still has `resolve_target` making the unstamped stop and `copy_in` running giget, and no Windows check. The as-built split (`require_target`, `download`, the `uname` check in `check_prereqs`) belongs there, since stories 05 and 08 read C4, not this story.

**Nit**
- `scripts/install.test.mjs:68-70`: dropping every `PATH` folder that holds `node` or `npx` also drops `git`, `cp` and the rest when they share a folder (Homebrew's `/opt/homebrew/bin`, apt's `/usr/bin`). Fine under nvm and setup-node's tool cache, which is everywhere it runs today.
- `install.sh:111-115`: a user file where Ang ships a folder (a file named `docs`, say) passes `check_collisions`, then `cp -R` fails partway and leaves a partial install. Rare.

## Related
- [Plan: install](../plan.md)
- [C4 components: install.sh stages](../c4/3-components.md)
- [Install script spike](../origins/install-uninstall-update/shaping-content/install-script-spike.md)
- [Story 02](02-settings-merge-and-version-record.md)
