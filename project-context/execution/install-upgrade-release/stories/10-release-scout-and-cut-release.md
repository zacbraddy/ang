---
title: release-scout and /cut-release
shortDescription: The repo-only release-scout agent and /cut-release skill that take a release from preflight to post-publish with Zac making every decision
tags: [distribution, open-source]
status: draft
owner: agent
dependsOn: [08, 09]
---
# release-scout and /cut-release

## Summary
The local half of the release process (d15, d18 to d20, d23, d25). `/cut-release` walks stages 0 to 8 of the release process proposal with Zac; `release-scout` reads the manifest and diffs in its own context so a big manifest doesn't overflow the drafting session.

## Outcome
Zac can run `/cut-release` from preflight warnings through manifest, scout, version, drafted notes and upgrade guide, rehearsal, go, CI and publish to post-publish, making only decisions and never typing a git or gh command. The coverage check maps every manifest entry to the notes, the guide or an internal list. For rc.1 the rehearsal is skipped and the skill says why.

## Rough scope
- `.claude/skills/cut-release/SKILL.md` and `.claude/agents/release-scout.md`, repo-only per story 01's layout.
- It asks for the go immediately before push and opens the draft with `gh release view --web`.

## Related
- [Release process proposal](../release-process-proposal.md)
- [C4 components: repo-only release tooling](../c4/3-components.md)
- [Story 08](08-release-workflow.md)
- [Story 09](09-release-manifest.md)
