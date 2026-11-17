---
title: Install script spike
shortDescription: A prototype install.sh at the repo root, fetched at a pinned ref, installs Ang with giget, merges the user's settings and records the installed version; all five success measures passed
tags: [distribution, open-source]
---
# Install script spike

## Summary
Spiked on 2026-11-16 at `cd1b825`, answering where `install.sh` lives (u6) and how an install records its version (u7). A prototype [`install.sh`](../spikes/install-script/install.sh) passed all five success measures agreed with Zac, against an empty repo and a fake existing project:
- **Where it lives:** at the repo root, outside `src/`. The copy-in only takes `src/`, so the script never lands in an install. Users fetch it from `https://raw.githubusercontent.com/zacbraddy/ang/<ref>/install.sh` and pipe it to `sh`.
- **How it's pinned:** the ref is written into the script (`REF=…`), with an optional argument to override it (`| sh -s -- <ref>`). A piped script can't see the URL it came from, so a release has to stamp its own tag into `install.sh` before tagging.
- **How it records the version:** `.claude/ang/version.json` holds `{ ref, sha, installedAt }`. The script first resolves the ref to a full SHA (commit hash) through GitHub's API, then installs *that* SHA. That way the files and the record can't disagree, even if a branch moves mid-install.
- **giget stays,** run through npx and pinned to `giget@3.3.1` (Zac's call). The documented prerequisite is node with npm/npx. The `curl` in `curl … | sh` is the only other tool involved.

## Setup
- [`spikes/install-script/run.sh`](../spikes/install-script/run.sh) pipes `install.sh` into `sh -s -- <ref>` the way a user's one-liner would.
- Node 22.19 ran giget 3.3.1 through `npx -y`.
- Targets:
  1. an empty repo (`git init` only);
  2. a fake existing project. Its `settings.json` sets its own `outputStyle` and `model`, an allow permission, a deny rule and a `Stop` hook. It also has its own rule, skill and `CLAUDE.md`.
- The existing project was installed into twice, to test re-runs.

## Results
| Measure | Empty repo | Existing project, run 1 | Existing project, run 2 |
|---|---|---|---|
| 1. Exit / `library init` / `library validate` | 0 / 0 / 0 (5.2s) | 0 / 0 / 0 (4.2s) | 0 / 0 / 0 (3.9s) |
| 2. `install.sh` in installed tree | none | none | none |
| 3. `version.json` SHA equals `git rev-parse cd1b825` | yes | yes | yes |
| 4. Backup byte-identical to user's original | n/a | yes | yes |
| 5. Settings and backup unchanged by re-run | n/a | n/a | yes |

The merged settings kept every user value. Ang's `outputStyle` didn't replace `Explanatory`, and `model`, the deny rule and the user's `Stop` hook all survived. Ang's two permissions and four hooks were added, with no duplicates. The merge rule: the user's values win, Ang only adds keys that are missing, and arrays become the union with the user's entries first.

## Unknown unknowns
- **A release step appears.** Each release has to write its tag into `install.sh` before the tag is cut, or the script fetched from that tag installs some other ref. That belongs with what each release publishes (u10).
- **The merge favours the user, which an upgrade can't reuse as-is.** If a later release changes one of Ang's hook commands, this merge keeps the old command and appends the new one, so stale Ang hooks would pile up. An upgrade needs to know which entries are Ang's. Either the previous release's `settings.json` (looked up by the recorded SHA) or the backup can tell it.
- **Ang's `outputStyle` is skipped when the user already has one.** That's fine, since `/tailor-ang` owns output style per user.
- **The GitHub API is rate-limited to 60 unauthenticated calls an hour per IP.** One call per install is far below that. Shared office or CI IPs could in theory hit it, and the script then fails before changing anything.
- **The stdin guard did nothing measurable.** Under `curl | sh` the script itself arrives on stdin, so `npx` gets `</dev/null` in case it reads stdin and swallows the rest of the script. Removed, the install still worked with today's npx and giget. It stays as a free guard.
- **Baselining an instance with no record,** such as ohnvm, isn't answered here. Candidate approach for the upgrade skill: hash its files against the trees of past tags and pick the closest. That is now its own unknown.

## Related
- [Spike README](../spikes/install-script/README.md)
- [Install script and upgrade ambition](./install-and-upgrade-direction.md)
- [Copy-in bake-off](./copy-in-spike.md)
- [Hub](../../../README.md)
