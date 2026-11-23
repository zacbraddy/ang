---
title: Write the v1.0.0 launch notes
shortDescription: Replace the v1.0.0 draft release's rc-range notes with launch copy and add the latest install line to the README before Zac presses Publish
tags: [distribution, open-source, brand-voice]
---
# Write the v1.0.0 launch notes

## Summary
Once CI has created the v1.0.0 draft release, Zac and an agent write launch copy (what Ang is, how to install it), in a fresh session. The copy replaces the draft's body and `releases/notes/v1.0.0.md`, the README gets its install line, and then Zac presses Publish. It runs once, ever.

## Why now, not sooner or later
v1.0.0 is cut like any release, from the last rc ([ADR 0007](/project-context/10k/technical/adrs/0007-how-releases-are-cut.md)). So `/cut-release` drafts notes from the rc to v1.0.0 diff. That diff is right for the upgrade guide but means nothing to the public: the rcs were only rehearsals. Rather than give `/cut-release` a v1.0.0 branch that would never run again (d38), the notes are swapped by hand. That has to happen in the gap between CI creating the draft and Zac pressing Publish. Before the draft exists there's nothing to edit. After Publish, the launch announcement has already gone out with the wrong notes.

The `file:` condition is the rc.2 notes file, which proves the release process has run end to end at least once. It sits outside the stage folders, so it survives the epic's archive.

## What to do
1. Check that `gh release view v1.0.0 --json isDraft,body` shows a draft. If it's already published, see *Signs it's already handled*.
2. Draft the launch copy with Zac. It opens with what Ang is and the install one-liner (`curl -fsSL https://github.com/zacbraddy/ang/releases/latest/download/install.sh | sh`) plus its prerequisites. Then it covers the four features from `/project-context/10k/product/what-ang-is.md` and where the docs live. Follow `/project-context/10k/marketing/voice-and-attribution.md` (emoji per heading). Don't list the rc-to-v1.0.0 changes, and don't mention rcs.
3. Write it to `releases/notes/v1.0.0.md`, replacing the generated notes, and run `gh release edit v1.0.0 --notes-file releases/notes/v1.0.0.md`.
4. Add `curl -fsSL https://github.com/zacbraddy/ang/releases/latest/download/install.sh | sh` to the README as its install line, with the same prerequisites. Until v1.0.0 is published that URL 404s, since `releases/latest` skips pre-releases, so the line waits for this release; it also clears `/cut-release`'s README one-liner preflight warning from then on.
5. Zac reviews the draft on GitHub (`gh release view v1.0.0 --web`) and presses Publish. The waiting `/cut-release` session carries on with its post-publish checks.
6. Leave the notes file and README changes unstaged for Zac to commit, then remove this trigger.

## Signs it's already handled
- `releases/notes/v1.0.0.md` opens with launch copy, not a list of changes.
- `gh release view v1.0.0 --json body` matches that file.
- `grep -F 'releases/latest/download/install.sh' README.md` finds the install line.

## Related
- [ADR 0007: How releases are cut](/project-context/10k/technical/adrs/0007-how-releases-are-cut.md)
