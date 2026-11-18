---
name: upgrade-ang
description: Upgrades this project's Ang to a newer release (the latest stable one, or a named tag), merging upstream's changes with the user's own customisations and leaving the result unstaged for review. Use when the user runs /upgrade-ang.
disable-model-invocation: true
argument-hint: "[tag]"
---

# /upgrade-ang

!`node .claude/scripts/ang-context-manager.mjs session steps upgrade-ang`

An upgrade has a deterministic half, done by `ang-context-manager.mjs` (`ang` below), and a judgement half, done by you. Everything rests on one premise: the upgrade starts from a clean working tree and never stages or commits. The user reviews the unstaged diff and keeps it or throws it away, so a wrong call of yours costs a review, never lost work. That is why you resolve most merges yourself.

Run every command from the project root. Shell state doesn't carry between commands, so write out absolute paths each time. `$TMP` below stands for the temp folder you make at **Fetch**; the plan's own `tempDir` is a second one. On every exit after **Fetch**, finished or stopped, remove both with `rm -rf`.

1. **Checks.** These all run before anything is fetched. Each stop says why and how to fix it, and leaves the project untouched.
   - Prerequisites first, with `install.sh`'s messages:
     - `uname -s` starting `MINGW`, `MSYS` or `CYGWIN`: "Ang on Windows runs inside WSL, not Git Bash, MSYS or Cygwin." Fix: set up WSL (`wsl --install` in PowerShell), install Node.js 26+ inside it, then run the upgrade from a WSL shell.
     - `git` not on the PATH: "Ang needs git, and it isn't on your PATH." Fix: install git and re-run.
     - Node older than 26 (`node -p 'process.versions.node'`): "Ang needs Node.js 26 or newer; this is <version>." Fix: upgrade Node.js and re-run.
     - `npx` not on the PATH: "Ang needs npx, and it isn't on your PATH." Fix: it ships with npm; install Node.js 26+ with npm and re-run.
   - Git repo: `git rev-parse --is-inside-work-tree` succeeds. Otherwise stop: "Upgrading Ang needs the project in a git repo, so the upgrade lands as a diff you can review or discard." Fix: `git init`, commit the project, and re-run.
   - Clean tree: `git status --porcelain` succeeds and prints nothing. Otherwise stop: "The working tree has uncommitted or untracked changes. Commit or stash them so you get a clean working tree, then re-run; that way the upgrade is one reviewable diff."

2. **Target.** Run `node .claude/scripts/ang-context-manager.mjs upgrade target`, adding `--to <tag>` when the user named one ($ARGUMENTS). This is the installed engine, since the target isn't fetched yet. It prints `{ status, from, to }`:
   - `upgrade`: carry on with `from.ref`/`from.sha` as the base.
   - `no-record`: carry on with no base. The project has no usable version record, so the route will be guided with warning.
   - `current`: stop, "Already on the target <to.ref>."
   - `downgrade`: stop, saying the installed release (`from.ref`) is newer than `to.ref` and to name a newer tag.
   - Exit 1: pass its `✖` message on as it stands and stop.

3. **Fetch.** `TMP=$(mktemp -d -t ang-upgrade-XXXXXX)`, then fetch the trees into it with giget, as `install.sh` does:
   - Target: `npx -y giget@3.3.1 "gh:zacbraddy/ang/src#<to.sha>" "$TMP/target" --force </dev/null`
   - Base (`upgrade` only): the same at `<from.sha>` into `"$TMP/base"`.

   From here on, every `ang` command runs from the target tree: `node "$TMP/target/.claude/scripts/ang-context-manager.mjs" …`, with the project root as the working folder.

4. **Plan.**
   - `upgrade` only: `ang upgrade guides --from <from.ref> --to <to.ref> > "$TMP/guides.json"`. The guides hold Moves, Migrations, Retired names and Notes for the merge, oldest release first.
   - `ang upgrade plan --base "$TMP/base" --target "$TMP/target" --guides "$TMP/guides.json" > "$TMP/plan.json"`. With `no-record`, it's `--base none` and no `--guides`.
   - The plan is `{ route, entries, tempDir }`. `route.route` is the route; `route.conflictedFiles`, `route.conflictHunks` and `route.cleanMerges` are its counts. Each entry has a `path`, a `category`, and a `mergedFile` (under `tempDir`) when there are bytes to write.

   If giget, `upgrade guides` or `upgrade plan` fails, stop naming the step and its error, and remove the temp folders. Nothing in the project has changed.

5. **Warn** (guided with warning only). Before resolving anything, show the user:
   - the conflicted file and hunk counts from `route`, and why the route was chosen (`route.reason`);
   - your assessment of the risk to their customisations: skim the conflicted entries and say which of their changes look likely to survive cleanly and which are at risk;
   - that at this level of change they may prefer to own their Ang as a fork and stop taking upgrades.

   Then ask whether to go ahead. If they stop, remove the temp folders and finish; nothing has changed. If they go ahead, continue as guided.

6. **Resolve.** The route sets who decides:

   | Route | When | Who decides |
   |---|---|---|
   | `fast` | Every change is one-sided | Nothing to resolve: go to **Apply** without asking anything |
   | `agent-resolved` | Clean merges to reread, or a few conflicted files | You resolve everything and ask nothing |
   | `guided` | More conflicted files | You resolve everything you're sure of; the user confirms the risky merges |
   | `guided-with-warning` | Many conflicted files, or no version record | As guided, after **Warn** |

   Work through the entries:
   - **`clean-merge`**: git merged it without conflict, but a clean textual merge can still be wrong. Reread the `mergedFile` against upstream's change (`git diff --no-index "$TMP/base/<path>" "$TMP/target/<path>"`), the guides' Retired entries and Notes for the merge. Edit the `mergedFile` where the result contradicts upstream's intent or keeps a retired name.
   - **`conflict`** and **`conflict-no-base`**: edit the `mergedFile` into its final content with no conflict markers, keeping both the user's customisation and upstream's change wherever they can coexist, then set `"resolution": "write"`. Set `"keep"` to keep the local file exactly as it is, or `"delete"` to remove it. `conflict-no-base` has no common ancestor, so the markers span whole regions; compare it with the target tree's copy to see which parts are the user's.
   - **`conflict-delete`**: one side deleted the file and the other changed it.
     - Upstream deleted it and the user edited it (no `mergedFile`): look for the content at a new path in the target tree (similar name, or distinctive lines found with `grep -r` in `$TMP/target`). If it moved without a Moves entry, carry the user's edits into the new path's `mergedFile`, set this entry to `"delete"`, and list the undeclared move in the summary. If it was retired, choose `"delete"` when the user's edits only served the retired feature, or `"keep"` to preserve a customisation that still works on its own.
     - The user deleted it and upstream changed it (`mergedFile` holds upstream's version): `"keep"` honours the user's deletion; `"write"` restores upstream's file, for when Ang needs it to run.

   **A risky merge** is one that could break how Ang runs (scripts, hooks, settings, a skill's or agent's frontmatter, the workflow's commands) or leave one of the user's customisations inoperable. On guided routes, ask about each risky merge alone, one at a time: show the path, what each side changed, and your proposed resolution. The user confirms or corrects it. Settle everything else yourself. On `agent-resolved`, settle the risky ones too, and flag them in the summary.

   Every conflicted entry ends with a `resolution`, and every `mergedFile` you wrote has no conflict markers. Keep a one-line reason for each judgement call: each `clean-merge` you edited and each conflict you resolved. Save the whole plan back to `"$TMP/plan.json"` with your `resolution`s set.

7. **Apply.** `ang upgrade apply --plan "$TMP/plan.json"`. It checks the whole plan and writes it all or nothing. If it refuses, it lists every problem: fix each in the plan or its `mergedFile`s and rerun until it succeeds. Apply is the only thing that writes upgrade files into the project.

8. **Finish.** In order:
   1. **Settings.** `ang settings merge --base "$TMP/base/.claude/settings.json" --ours .claude/settings.json --theirs "$TMP/target/.claude/settings.json"` (`--base none` with no record). It writes the merged settings and prints its conflicts, where it kept the user's value (or both array entries). Review each like a file merge, editing `.claude/settings.json` where upstream's value should win, and on guided routes ask only about the risky ones.
   2. **Record.** `ang version write --ref <to.ref> --sha <to.sha>`.
   3. **Migrations.** Run each Migration from the guides, oldest first: do it yourself when you're sure what it means for this project, otherwise ask the user. Migrations write to the working tree only. A `no-record` run has no guides, so it has no Migrations.
   4. **Validate.** `node .claude/scripts/ang-context-manager.mjs library validate`, then `node --test '.claude/**/*.test.mjs'`.
   5. **Clean up.** Remove `$TMP` and the plan's `tempDir`. `git diff --cached` is empty.
   6. **Summary:**
      - from → to (`from.ref`, or "no record") and the route;
      - files applied cleanly, files settled by your judgement (each with its one-line reason, undeclared moves called out) and files the user decided;
      - settings conflicts and how each was settled, and each Migration's outcome;
      - local text still using a Retired name (`grep` the project for each);
      - validate and test results, failures stated plainly;
      - how to review: `git status` and `git diff`;
      - how to discard it all: `git restore . && git clean -fd`, safe because the tree was clean before the upgrade;
      - a reminder to commit `.claude/ang/version.json` with the rest: without it the next upgrade can't find its base and looks far bigger than it is.

   **If a step after Apply fails and you can't recover** (validate or tests failing, a `settings merge` or `version write` error): say plainly that the upgrade is unfinished, what went wrong, and what is already written to the working tree. Remove the temp folders, then hand over with the user's two options: fix it by hand from where things stand, or discard everything with `git restore . && git clean -fd`. The choice is theirs, so leave the working tree as it is.

Next: review the diff, then commit it, `.claude/ang/version.json` included.
