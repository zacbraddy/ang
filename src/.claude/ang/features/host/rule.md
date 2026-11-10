## Workspace host
This session runs inside a workspace host (the banner names it), which gives the user a card per worktree. Ang's host actions keep the card honest, so they can tell which stream needs them without opening terminals. Skills name an action; run this host's command for it below. Only the main session runs them, never a subagent. A failed host command never blocks work: say so once and carry on.

- **say status:** one line on where this worktree is at, e.g. `story 05 implementing`, `awaiting review`.
- **set stage:** `in-progress` (working), `in-review` (unstaged work waiting for the user's review), `completed` (branch merged to main).
- **ask for the user:** whenever a skill stops to wait on them (a confirmation, a stop-and-ask, finished work to review), not for ordinary replies.
- **create stream workspace** and **remove stream workspace:** used by `/start-stream` and `/end-stream`.

`<wt>` is `current` for this worktree, or `path:<worktree>` for another stream's. Actions at one checkpoint can share one `worktree set` call.

| Action | orca |
|---|---|
| say status | `orca worktree set --worktree <wt> --comment "<text>" --json` |
| set stage | `orca worktree set --worktree <wt> --workspace-status <stage> --json` |
| ask for the user | `orca worktree set --worktree <wt> --unread --json` |
| create stream workspace | `orca worktree create --name <slug> --branch stream/<slug> --base-branch <ref> --comment "<focus>" --no-parent --json` (`--branch` needs Orca 1.4.246+) |
| remove stream workspace | `orca worktree rm --worktree path:<worktree> --json` |
