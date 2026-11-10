# Running Ang streams in Orca

**One stream is one branch in one worktree, and Orca is what makes several of them bearable.** Ang
works without Orca. Orca adds the bits that turn waiting time into working time: a card per
worktree saying what its agent is doing, an unread mark when an agent needs you, and one feed of
every agent's events. This is the setup that gives Ang agents the most out of it. It is written
for ohnvm but meant to travel with Ang when Ang gets its own repo.

Streams mode itself (the `ang/streams` registry, the user-approved mailbox and read-only peeking
at other streams' branches) is the `streams` feature: set `"streams": true` in `.claude/ang.json`,
and see `.claude/ang/features/streams/conventions.md`. The Orca power-ups are the `host` feature:
`"host": "orca"` in `.claude/ang.json`, on only in sessions Orca launched. Its host-neutral actions
(say status, set stage, ask for the user, create and remove stream workspace) and their Orca commands
are in `.claude/ang/features/host/rule.md`; skills call them at their checkpoints.

## One-off setup per repo

**1. Add the repo to Orca** from its trunk checkout, the folder whose gitignored files are the real
ones. Orca records the trunk as the main worktree.

**2. Branch new worktrees from main.**

```sh
orca repo set-base-ref --repo id:<repoId> --ref origin/main --json
```

`orca repo list --json` gives the repo id.

**3. Let the setup hook install dependencies, and nothing else.** ohnvm's is `pnpm install`, set
under the repo's settings in Orca. Never add a migrate, seed or reset step: see the store below.

**4. Copy gitignored files with `.worktreeinclude`.** It lives at the repo root and lists literal
paths, one per line, which Orca copies into each new worktree. ohnvm lists `.env.local`. Its paths
are absolute, so every copy points at the trunk's archive, backups and settings file. Use
`orca.yaml`'s `worktree.sharedDirectories` only for large rebuildable folders you want symlinked
rather than copied. `node_modules` is not one, because branches can differ in dependencies.

**5. Create streams through Orca, not plain `git worktree`.** The repo hides worktrees Orca didn't
make (`externalWorktreeVisibility: hide`). `/start-stream` creates through Orca when the host is on.
If you ever make one by hand, show it with
`orca repo set --repo id:<repoId> --external-worktree-visibility show --json`.

## The store across worktrees

**Every worktree talks to the same store, and that is deliberate.** The database is the Docker
volume `infra_postgres-data`. Compose names projects after the folder holding the compose file, and
that folder is `infra/` in every worktree, so they all resolve to the same volume and the same
`ohnvm-postgres` container.

Here be dragons:

- Never add `name:` to `infra/compose.yaml`, and never run compose with `-p`. Either one makes
  compose look for a different, empty volume, and the next migrate builds a fresh store beside the
  real one.
- Never point `OHNVM_ARCHIVE_ROOT` at a worktree-relative path. The rows would land in the real
  database while the payload bytes went to a worktree that gets deleted.

## Starting a stream

Run `/start-stream <slug> ["focus"]` from a session on main. In Orca it creates the workspace
with `orca worktree create --branch stream/<slug>` from main (setup hook and `.worktreeinclude` included, focus as the
card comment) and registers the branch and path Orca chose on `ang/streams`. The focus line is
what other streams' `context-scout` reads before it peeks, so make it say what the stream is for.

## Working across streams

**The right sidebar's source control follows whichever worktree is active.** Each worktree has its
own Staged and Unstaged sections and its own commit draft, so reviewing an agent's unstaged work and
committing it happen per stream, exactly as in single-stream Ang.

**Card conventions**, so you can triage at a glance:

| Card status | Meaning in Ang |
|---|---|
| `in-progress` | An agent is working, or a long run is going |
| `in-review` | Unstaged work is waiting for your review |
| `completed` | The stream's branch is merged to main |
| unread (bold) | An agent needs you |

The card comment is a one-line "where it's at", e.g. `story 05 round running (≈1h)`. Agents
set status, comment and unread themselves at skill checkpoints; only the main session does, never
subagents.

**Hop with the Agents feed.** It shows every agent's finished turns and blocking questions across
worktrees, and clicking an entry jumps to that pane.

**Keep streams current with main.** `10k/` only changes on main through `/retro`. After a stream
merges, merge main into the others so they pick up the new truth, then run
`node .claude/scripts/ang-context-manager.mjs library index` rather than hand-merging `index.json`,
and merge `tags.json` as the union of both sides' tags.

**Finish a stream** by merging its branch, then running `/end-stream <slug>` from another
session. It clears the stream's inbox with you, marks the card `completed`, deregisters it and
offers to remove the workspace (`orca worktree rm`) and branch. The store is untouched, because it never lived in
the worktree.

## Without Orca

Everything above has a plain-git equivalent:

- `/start-stream` falls back to `git worktree add` and copies `.worktreeinclude` files itself
- the host actions are simply not injected; watch the terminals yourself

Ang loses the cards and the feed, not any of its workflow.
