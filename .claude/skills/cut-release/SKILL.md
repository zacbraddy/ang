---
name: cut-release
description: Cuts an Ang release with Zac, from preflight warnings through the change manifest, drafted notes and upgrade guide, the fixture rehearsal, tag and CI to his Publish click and the post-publish checks. Use when the user runs /cut-release.
disable-model-invocation: true
---

# /cut-release

This runs from the main checkout of the Ang repo, on `main`. It's the one workflow command that commits, tags and pushes, and it does each only on Zac's go. Zac makes every decision; you hold every step and run every command, so he never types a git or gh command himself.

First, `TMP=$(mktemp -d -t ang-release-XXXXXX)`. Shell state doesn't carry between commands, so write the path out in full each time. On every exit, finished or stopped, remove it with `rm -rf`.

Host actions: say status at the start of each stage as `release <tag>: <stage>` (`release: preflight` until the tag is picked), and ask for the user at every stop where you wait on Zac.

1. **Preflight.** Run every check, then list each failing one with its fix and ask Zac whether to carry on. These are warnings for him to eyeball; the release is cut from the head of `main` as it stands, and only Zac stops it.
   - **On main, clean, up to date:** `git branch --show-current` is `main`, `git status --porcelain` prints nothing, and after `git fetch origin`, `git rev-parse HEAD` equals `git rev-parse origin/main`. Fix: switch to `main`, commit or stash, pull or push.
   - **Streams with `src/` work not on main:** for each stream in `node .claude/scripts/ang-context-manager.mjs stream list`, count `git diff --name-only origin/main...<branch> -- src/ | wc -l` and list any above zero as "<slug>: N src/ files". Usually that's work for the next release; it's listed so Zac can spot one he meant to include. Fix: merge that stream first.
   - **CI green:** `gh run list --branch main --limit 1 --json conclusion,headSha` shows `success` on `HEAD`. Fix: look at the failing run.
   - **Immutable releases on:** `gh api repos/zacbraddy/ang/immutable-releases --jq .enabled` is `true`. Fix: turn it on in the repo's Settings, General, Releases.
   - **No leftover draft release:** `gh release list --json tagName,isDraft --jq '.[] | select(.isDraft) | .tagName'` prints nothing. Fix: `gh release delete <tag> --yes` for an abandoned attempt.
   - **No link drift:** `node --test scripts/link-entries.test.mjs` passes. Fix: `node scripts/link-entries.mjs`, then commit the links.
   - **README one-liner:** `grep -F 'releases/latest/download/install.sh' README.md` finds the copy-paste install line. Fix: point the README's install line at `https://github.com/zacbraddy/ang/releases/latest/download/install.sh`.

2. **Gather.**
   1. `node scripts/release-manifest.mjs > "$TMP/manifest.json"`, with no arguments: the default range runs from the latest tag to `HEAD`, which is right only before the new tag exists. The manifest stays in `$TMP`, never in the repo.
   2. Spawn `release-scout` with the manifest's path. Save its coverage map to `"$TMP/coverage.json"`.
   3. **Coverage check:** every manifest entry is a key in the map.
      ```bash
      jq -r '.files[].path, .tenK[].path, (.archivedEpics[] | "epic:\(.epic)"), (if .settingsDiff != "" then "settings" else empty end)' "$TMP/manifest.json" | sort > "$TMP/entries"
      jq -r 'keys[]' "$TMP/coverage.json" | sort > "$TMP/mapped"
      comm -23 "$TMP/entries" "$TMP/mapped"
      ```
      Anything printed is a leftover the scout missed: show it to Zac and have the scout map it.
   4. Show Zac the scout's themes, user-facing vs internal split and upgrade hazards.
   5. **Propose a version** with its reason. Guidelines, not rules: major when a user must act or their way of working changes; minor for features, and file moves the upgrade guide handles without the user noticing; patch for fixes. Add `-rc.N` while Zac wants a release candidate. It must match the release job's format, `vX.Y.Z` or `vX.Y.Z-rc.N`. Zac picks the version; from here, `<tag>` is his pick and `<fromTag>` is the manifest's `fromTag`.

3. **Draft and approve.**
   - **Release notes**, `releases/notes/<tag>.md`, from the template in `releases/notes/README.md`: Zac's public voice (`project-context/10k/marketing/voice-and-attribution.md`), an emoji per heading, user-facing themes from the coverage map's `notes` and `guide` entries. Fixes and breaking changes stay plain-spoken. Close with "Changes in this release", one line per commit in the manifest's `commits`; group or trim noise (merges, library-only commits) with Zac.
   - **Upgrade guide**, `releases/upgrades/<tag>.md`, in the format in `releases/upgrades/README.md`, with `from: <fromTag>`. Plain and formulaic, no voice: one entry per Move, Migration or Retired name from the scout's hazards and the `guide` entries.
   - Run `node scripts/draft-guides.mjs <fromTag> <tag>` and fix the guide until it exits 0.
   - **Leftovers:** list every coverage-map entry valued `notes` or `guide` that neither draft covers, and show them to Zac.
   - Iterate with Zac, his own edits included, as many rounds as it takes. Nothing moves on until he says the drafts are approved.

4. **Rehearsal.** Spawn a general-purpose subagent with `$TMP`, `<tag>` and these steps:
   1. `git clone git@github.com:zacbraddy/ang-upgrade-fixture.git "$TMP/fixture"`, the fixture repo: an Ang install from an earlier release with typical local edits.
   2. Read `ref` and `sha` from `"$TMP/fixture/.claude/ang/version.json"`. Fetch the base tree: `npx -y giget@3.3.1 "gh:zacbraddy/ang/src#<sha>" "$TMP/base" --force </dev/null`.
   3. Take the candidate's `src/` as the target: `mkdir -p "$TMP/cand" && git archive HEAD src | tar -x -C "$TMP/cand"`, from the Ang repo. `HEAD` is the candidate, since stage 5 commits only `releases/`.
   4. From the Ang repo: `node scripts/draft-guides.mjs <fixture ref> <tag> > "$TMP/guides.json"`. If the fixture's `ref` isn't `<fromTag>` (a missed roll-forward), the chain still works across releases; say so in the report.
   5. From `"$TMP/fixture"`: `node "$TMP/cand/src/.claude/scripts/ang-context-manager.mjs" upgrade plan --base "$TMP/base" --target "$TMP/cand/src" --guides "$TMP/guides.json" > "$TMP/plan.json"`.
   6. Follow `"$TMP/cand/src/.claude/skills/upgrade-ang/SKILL.md"` from **Resolve** to **Finish**, with `$TMP/cand/src` as the target tree and `version write --ref <tag> --sha <the Ang repo's git rev-parse HEAD>`. Record each question a guided route would ask the user as a proposal; ask nothing. Finish's Clean up removes only the plan's `tempDir`: `$TMP` belongs to `/cut-release` and later stages use it.
   7. Report: the route and its counts; each `conflict` and `conflict-delete`, and whether the upgrade guide explains it; judgement calls and proposals; `library validate` and test results.

   Show Zac the report, then each conflict or conflict-delete the guide doesn't explain. For each, he picks: fix the guide (back to stage 3) or ship anyway.

5. **Commit, tag, push.** Show Zac these commands, then ask for his go. Only a go given in answer to this question counts; approving the drafts or a go from an earlier round doesn't.
   ```bash
   git add releases/notes/<tag>.md releases/upgrades/<tag>.md
   git commit -m "release: <tag>"
   git tag -a <tag> -m "<tag>"
   git push origin main <tag>
   ```
   On a repeat after a CI failure, the `release:` commit is already in history: show and run only the tag and push.

6. **CI.** Find the release job's run for the tag, `gh run list --workflow release.yml --branch <tag> --json databaseId --jq '.[0].databaseId'` (retry for a few seconds while it starts), then `gh run watch <id> --exit-status`.
   - On failure, show the failing step from `gh run view <id> --log-failed`. Nothing is published. Zac fixes it in a new commit on `main`. Then ask for his go to delete the tag and any draft release:
     ```bash
     git tag -d <tag>
     git push origin :refs/tags/<tag>
     gh release delete <tag> --yes   # only if `gh release view <tag>` finds a draft
     ```
     and repeat stage 5, so the tag lands on the new `HEAD`.

7. **Publish.** `gh release view <tag> --web` opens the draft in Zac's browser. Tell him to press **Publish** there and to come back and say it's done. Ask for the user and wait. Publishing is his click, never a command.

8. **Post-publish.**
   - **Real install:** in `"$TMP/install"`, `git init`, then `curl -fsSL https://github.com/zacbraddy/ang/releases/download/<tag>/install.sh | sh`. Check `.claude/ang/version.json`'s `ref` is `<tag>` and its `sha` is `git rev-parse <tag>^{commit}` from the Ang repo.
   - **Latest:** for a tag without `-rc.`, `gh api repos/zacbraddy/ang/releases/latest --jq .tag_name` is `<tag>`.
   - **Fixture roll-forward:** spawn a general-purpose subagent to clone the fixture fresh over SSH, `git clone git@github.com:zacbraddy/ang-upgrade-fixture.git "$TMP/fixture-up"`, and follow its own `.claude/skills/upgrade-ang/SKILL.md` with `<tag>` as the target, reporting as at stage 4. Show Zac the summary. On his go, in `"$TMP/fixture-up"`: `git add -A`, `git commit -m "upgrade: Ang <tag>"`, `git tag <tag>`, `git push origin HEAD <tag>`.
   - Print what's done and what's left, such as a failed check above or a docs page still naming the old version.

Then remove `$TMP` and run `node .claude/scripts/ang-context-manager.mjs library validate`.

## Bad release
There's no rollback, only forward. Cut a patch release through the same stages; its upgrade guide can say to skip the bad version. Meanwhile, tell Zac where to tick **Set as a pre-release** on the bad release (`https://github.com/zacbraddy/ang/releases/tag/<bad tag>`, then Edit), so `releases/latest` falls back to the previous release.
