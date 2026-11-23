---
title: Uninstalling
description: Remove Ang from your repo by hand, keeping whatever you want to keep.
sidebar:
  order: 5
---

Breaking up is hard to do. 💔 But if Ang isn't working out for you, getting rid of it is pretty painless. Ang won't hold a grudge, I promise. There's no uninstall command, because Ang is really just a bunch of files in your repo: you delete the ones it added, review the diff and commit. This page lists every one of them, so nothing Ang put there gets left behind by accident.

If you only tried Ang on a branch that never made it to `main`, deleting the branch is much quicker. [Trying Ang alongside your framework](../alongside-your-framework/#-exit-one-back-out) shows you how.

## 🧺 Before you start

Just like the install, start from a clean working tree, so the removal is one diff you can review on its own. Run everything below from the root of your repo.

## 🚮 Remove Ang's files

These are the files the install copied in. Some of these folders, like `.claude/rules/` and `.claude/skills/`, might also have your own files in them, so this only removes Ang's:

```sh title="Remove Ang's shipped files"
rm -rf .claude/ang \
  .claude/scripts/ang .claude/scripts/ang-context-manager.mjs .claude/scripts/cli.test.mjs \
  .claude/agents/context-scout.md .claude/agents/prioritiser.md .claude/agents/stage-gate.md \
  .claude/rules/context-library.md .claude/rules/engineering-defaults.md \
  .claude/output-styles/briefing.md .claude/output-styles/mentor.md \
  .claude/output-styles/pair-programmer.md .claude/output-styles/partner-in-crime.md \
  .claude/output-styles/straight-shooter.md

for skill in bootstrap-quality bootstrap-repo break-down-epic curate-10k curate-tags \
  end-stream ideate implement-story improve-workflow kill plan-epic \
  raise-workflow-improvement read-mail refine-ideas retro review-story shape-ideas \
  start-stream tailor-ang trigger upgrade-ang write-story; do
  rm -rf ".claude/skills/$skill"
done
```

Removing `.claude/ang/` takes `.claude/ang/version.json` with it, which is Ang's record of which release you had installed.

## 🎨 Remove what bootstrap and tailoring wrote

`/bootstrap-repo` and `/tailor-ang` add a few files of their own while getting Ang comfy in your repo:

- **`ang.json`**: your repo's Ang config, from bootstrap.
- **`ang.local.json`**: your personal Ang choices, like what Ang calls you, from tailoring.
- **`.claude/rules/pilot.local.md`**: what you told tailoring about yourself, if you answered those questions.
- **`.claude/output-styles/<name>.local.md`**: this is only there if tailoring interviewed you for a custom style.
- **`.claude/settings.local.json`**: tailoring sets `outputStyle` in here. Remove that key, or the whole file if that's all it holds.
- **`.gitignore`**: tailoring adds `ang.local.json`, `settings.local.json` and `*.local.md`. Keep any you're using for other things.

If bootstrap set up linting, formatting, tests or CI for you through `/bootstrap-quality`, that's just ordinary tooling for your project, not Ang. It's yours to keep as Ang's parting gift.

## 🔧 Put your settings back

The install merged Ang's hooks and permissions into your `.claude/settings.json`. How you undo that depends on whether you had one before Ang came along:

- **There's a `.claude/settings.json.pre-ang`:** that's the settings file you had before the install. Diff it against your current one first, so you don't lose anything you've changed since, then move it back:

  ```sh
  mv .claude/settings.json.pre-ang .claude/settings.json
  ```

- **There's no `.pre-ang`:** you didn't have a settings file before Ang, so you can delete `.claude/settings.json`. Or, if you've added settings of your own since, strip out just Ang's entries:
  - the `outputStyle` of `"Partner In Crime"`;
  - the `Bash(node .claude/scripts/ang-context-manager.mjs:*)` permission;
  - the `SessionStart`, `SubagentStart`, `PostToolUse` and `Stop` hooks that run `ang-context-manager.mjs`.

## 🌊 If you used streams

Streams keep their registry and mailbox on a branch called `ang/streams`, and each stream has its own branch and worktree. Once you've merged any work you want to keep from them:

```sh
git worktree list                     # find each stream's worktree, then:
git worktree remove <path>            # e.g. git worktree remove ../my-project-dark-mode
git branch -D ang/streams
git push origin --delete ang/streams  # if it was pushed
```

## 📚 What about `project-context/`?

That's your project's knowledge: ideas, plans, decisions and `10k/`. It belongs to you, not Ang, so keeping it is a perfectly good call. It's all plain markdown with frontmatter, so it reads just fine without Ang. If you want to take it with you to whatever your next framework is, it should work perfectly fine there too (you probably don't need to feel guilty about this but I'd imagine Ang would recommend it!). The one Ang file in there is `project-context/README.md`, which holds the library's conventions. You can keep it as a guide or delete it. Choices like this have been yours while you've been using Ang and they remain yours now as well. Of course, if you don't want any memories of your time with Ang at all that's understandable, so here's the command to run if you're looking for a *hard* breakup:

```sh
rm -rf project-context
```

## ✅ Review and commit

Last step: check you haven't removed anything you didn't mean to, or kept anything you meant to remove:

```sh
git status
git diff
```

Then commit it, and that's Ang gone. Thanks for giving it a spin! 👋
