---
title: GitHub settings
shortDescription: Discussions and private vulnerability reporting on, wiki and projects off, each set with gh api and read back
tags: [open-source]
status: done
owner: both
dependsOn: []
---
# GitHub settings

## Summary
Flips the four repo settings the contributor kit relies on. The agent proposes each `gh api` call, Zac confirms it, and the agent reads the setting back. No script persists.

## Outcome
`gh api` reads back Discussions on, private vulnerability reporting on, wiki off and projects off. Delete-branch-on-merge stays off.

## Rough scope
- One proposed `gh api` call per setting, confirmed by Zac before it runs.
- A readback per setting, recorded in the story's Review.
- Discussions must be on before story 05's issue chooser links to it.

## Done when
- One `gh api` readback shows `has_discussions: true`, `has_wiki: false`, `has_projects: false` and `delete_branch_on_merge: false` for `zacbraddy/ang`.
- `gh api repos/zacbraddy/ang/private-vulnerability-reporting` returns `{"enabled":true}`.
- `https://github.com/zacbraddy/ang/discussions` loads, ready for story 05's issue chooser link.
- Both readbacks, and the before values, are in this story's Review.

## Acceptance criteria
- Given a proposed `gh api` call, when Zac hasn't confirmed it, then it doesn't run.
- Given Zac confirms the repo PATCH, when it runs, then the readback shows Discussions on, wiki off, projects off and delete-branch-on-merge unchanged (off).
- Given Zac confirms the PVR PUT, when it runs, then the PVR readback shows `enabled: true`.
- Given a setting already at its target value, when the before-readback shows it, then its call is dropped from the proposal.
- Given a call fails (for example `gh` lacks admin scope on the repo), when the agent sees the error, then it stops, shows the error and asks Zac how to proceed rather than retrying another way.

## Guide
1. Agent runs the before-readbacks (below) and shows the values.
2. Agent proposes the repo PATCH with only the settings that need changing. Zac says yes or no.
3. Agent runs it and reads back.
4. Agent proposes the PVR PUT (skipped if already on). Zac says yes or no.
5. Agent runs it and reads back.
6. Zac opens the Discussions tab once to see it's live. GitHub seeds default categories (Announcements, General, Ideas, Polls, Q&A, Show and tell); leave them as they are.

### What the agent prepares
- Before and after readbacks (read-only, no confirmation needed):
  - `gh api repos/zacbraddy/ang --jq '{has_discussions, has_wiki, has_projects, delete_branch_on_merge}'`
  - `gh api repos/zacbraddy/ang/private-vulnerability-reporting`
- Repo PATCH: `gh api -X PATCH repos/zacbraddy/ang -F has_discussions=true -F has_wiki=false -F has_projects=false`. It doesn't touch `delete_branch_on_merge`.
- PVR: `gh api -X PUT repos/zacbraddy/ang/private-vulnerability-reporting`.

### What to record afterwards
In this story's Review: the before values, the after readbacks and the date. No tokens or credentials. Nothing else in the library changes; the settings live on GitHub.

## Implementation notes
- C4: the "GitHub repo settings [changed]" container ([containers](../c4/2-containers.md)); decisions k14, d6, d19.
- `gh auth status` must show a login with admin rights on `zacbraddy/ang`; Zac owns the repo, so his own `gh` login is enough.
- No script, workflow or file in the repo changes. `library validate` is the only check that runs on the repo.
- Disabling the wiki hides any existing wiki pages rather than deleting them; the before-readback says whether there was one.
- **Out of scope:** SECURITY.md and account-level `.github` defaults (d5, d6); branch protection and rulesets (d12, d18); the New issue page check, which needs story 05's templates.

## Review
No code changed, so Zac skipped `/review-story` and accepted the readbacks below as the Done-when evidence.

### Evidence (2026-11-23)
| Setting | Before | After |
|---|---|---|
| `has_discussions` | false | true |
| `has_wiki` | true | false |
| `has_projects` | true | false |
| `delete_branch_on_merge` | false | false (not touched) |
| private vulnerability reporting | `{"enabled":false}` | `{"enabled":true}` |

- All four settings needed changing, so no call was dropped. Zac confirmed the repo PATCH and the PVR PUT before each ran, and both exited cleanly.
- `https://github.com/zacbraddy/ang/discussions` loads with GitHub's six default categories (Announcements, General, Ideas, Polls, Q&A, Show and tell). The Wiki and Projects tabs are gone from the repo nav.

## Related
- [Plan: settings by agent, confirmed by Zac](../plan.md#settings-by-agent-confirmed-by-zac)
- [C4 components](../c4/3-components.md#components)
