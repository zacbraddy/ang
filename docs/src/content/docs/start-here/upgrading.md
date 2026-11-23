---
title: Upgrading
description: Move to a newer Ang release with /upgrade-ang, keeping your own changes and reviewing the result before anything is committed.
sidebar:
  order: 4
---

So a new Ang release is out, and you've spent weeks bending your copy of Ang to fit how you work. Now you want the new stuff *and* you want to keep your changes. That's a genuinely hard merge, and it's exactly what `/upgrade-ang` is there to help you with.

## 🤖 Why an agent does the upgrade

Your copy of Ang isn't meant to stay the same as mine. [Bending Ang](../../concepts/bending-ang/) is the whole point, so by the time an upgrade comes along, your files and mine have both moved on. A plain textual merge can tell *that* two lines differ, but it has no idea *why*. It can't tell your deliberate customisation apart from the new thing I was going for upstream, and it can happily give you a clean merge that's quietly wrong.

So Ang hands the judgement to an agent. The agent reads both sides, works out what each change was for, and keeps both wherever they can live together. A script still does the boring, deterministic half (fetching, three-way merging, applying), and the agent does the thinking.

Now I know what you're thinking:

> An agent? Messing with my carefully bent copy of Ang? What if it gets it wrong?

Fair, but here's the thing. The upgrade starts from a clean working tree and never commits anything, so a wrong call costs you a review, never lost work. Worst case, you throw the whole lot away with one command and you're right back where you started.

## 🏁 Running it

Before you start, it's worth a quick look at the release's notes on the [releases page](https://github.com/zacbraddy/ang/releases), so you know what's coming and whether there's anything you need to do. Then, from Claude Code in your repo, with a clean working tree, run:

```text
/upgrade-ang
```

That takes you to the latest stable release. If you want a specific release instead, pass its tag in:

```text
/upgrade-ang <tag>
```

So to upgrade to version 1.2.0, say, you'd run:

```text
/upgrade-ang v1.2.0
```

Ang's release tags are a `v` followed by three numbers, major, minor and patch, like `v1.0.0` or `v1.2.3`. Release candidates get an `-rc.` and a number on the end, like `v1.1.0-rc.1`. A bare `1.0.0`, a shortened `v1.0` or a commit SHA won't work, so copy the tag exactly as it appears on the [releases page](https://github.com/zacbraddy/ang/releases).

## 🪜 What happens, step by step

You don't need to know all of this to run an upgrade, but if you like knowing what's going on under the hood, here's the whole story:

1. **Checks.** Platform, git, Node 26+ and `npx`, plus a git repo and a clean working tree, so that the upgrade lands as one diff you can review or throw away. If anything's off, it stops and tells you how to fix it, before it's fetched anything.
2. **Target.** Ang reads `.claude/ang/version.json` to see what you're on, then works out where you're going. If you're already there, or you've named an older release, it stops and lets you know. This process doesn't currently support downgrading, sorry.
3. **Fetch.** It downloads the release you're on and the one you're going to into a temp folder. Your repo isn't touched.
4. **Plan.** It three-way merges every file (what you started from, what you have now, and the new release), counts the conflicts, and picks a route. More on routes [below](#-the-four-routes).
5. **Warn** (big upgrades only). Before resolving anything, it shows you how much has changed and asks whether you want to go ahead. You might feel the need to upgrade but Ang knows that doesn't mean you're ready to spend the rest of your career doing it! With this warning you can decide if the effort is going to be worth the reward before you waste too much time.
6. **Resolve.** The agent rereads the clean merges and works through the conflicts. It will quietly sort out the no-brainer merge conflicts for you, but on the guided routes Ang knows you're going to want a say on the risky ones, so it asks you which way you think each merge should go.
7. **Apply.** It writes the whole merge into your working tree, leaving the changes unstaged and ready for your review.
8. **Finish.** It merges your settings, records the new version, runs any migration steps the release needs, validates your library and runs Ang's own tests. Then it hands you a summary.

## 🚦 The four routes

Version upgrades come in all shapes and sizes and Ang knows that your goal here is to have the framework upgraded, not to have to rubber stamp an endless stream of merge conflicts! The upgrade skill has been designed to feel as automated as possible without you, as Ang's pilot, losing any control over your own project. Hopefully there won't be any times during the upgrade where you have to roll your eyes at the simplicity of a question Ang asks you but equally you won't be left shocked at how you weren't consulted before Ang decided to make a change that blew away your 11 carefully crafted workflow improvements! Ang does this by choosing from 4 predetermined upgrade routes, which set the "rules of engagement" Ang's agents follow when performing the upgrade.

The route decides when you get asked something, and it's picked from the number of conflicted files. A conflicted file is one where both your copy and mine changed the same lines, or where one side deleted a file the other one changed.

| Route | When | Will you get asked anything? |
| --- | --- | --- |
| ⚡ **Fast** | Every change is one-sided: only I changed a file upstream, or only you did | Nope. There's nothing to judge, so it just applies |
| 🤖 **Agent-resolved** | Up to 5 conflicted files, or some clean merges to double-check | Nope. The agent settles everything itself, and the summary flags any risky calls it made so you can check them |
| 🙋 **Guided** | 6 to 11 conflicted files | Yes, about each risky merge, one at a time. The agent settles everything it's sure of and asks you about the rest |
| ⚠️ **Guided with warning** | 12 or more conflicted files, or no version record | Yes. Before anything happens you get a heads-up and a choice (more on that just below), then it runs as guided |

It's probably worth you knowing a bit more about the **guided with warning** route. It's the one that stands to eat up the most of your time out of the routes available, so you'll want to have an idea of what you're in for before auto-pilot accepting it! When the agent chooses this route, before anything happens you see the change/conflict counts, the agent's read on which of your changes are at risk, and a heads-up that at this point you might be better off calling this version of Ang your very own and ignoring what's happening in the upstream repo going forward. Ang 2: Electric Boogaloo? However, if you really want to stick around for whatever ride Ang takes in the future, the agent will still be happy to run a guided upgrade from here. We just don't want to waste your time on expensive upgrades, so that's why you're given the choice.

If you're wondering what we mean when we say **risky merge** we're talking about a merge that could break how Ang runs (scripts, hooks, settings, the frontmatter of a skill or agent, the workflow commands) or leave one of your customisations not working any more. Everything else is low stakes, so the agent just handles it and doesn't bother you.

:::caution[Here be dragons 🐉]
The `.claude/ang/version.json` file is very important to this process! Without it Ang can't tell what you started from. You shouldn't ever find yourself without this file in normal circumstances, but if you do, you'll find that, during the upgrade, every file you and I both have looks conflicted. Ang won't have any choice here but to go straight to the most careful route and your upgrades will be the slowest to complete. So as you tweak and bend Ang, make sure this file is kept safe and intact, so you aren't doomed to painful upgrades forever!
:::

## 🔬 Reviewing (or ditching) the result

The upgrade never stages or commits anything, because what goes into your repo is always your call. It finishes with a summary: where you came from and where you're going, which files merged cleanly, which ones the agent settled (each with a one-line reason), which ones you decided, and how validation and the tests went.

To look it over:

```sh
git status
git diff
```

Don't like what you see? Throw the whole thing away:

```sh
git restore . && git clean -fd
```

That's safe because the upgrade started from a clean tree, so the only changes in it are the upgrade's.

Somewhere in between? Treat it like any other Ang change: stage the files you're happy with, ask the agent to have another go at the rest, and its tweaks land unstaged on top so you can see exactly what it changed the second time round.

Happy with it? Commit it, and make sure **`.claude/ang/version.json` goes in with the rest**. That file is how the next upgrade finds its starting point. Leave it out and the next upgrade can't find its base, so it looks far bigger than it really is.

## 🧯 If something goes wrong partway

If a step after Apply fails and Ang can't recover (validation or the tests failing, say), it tells you plainly that the upgrade is unfinished, what went wrong, and what it's already written. Then it leaves the choice with you: fix it by hand (of course with an agent by your side if you choose) from where things stand, or discard everything with `git restore . && git clean -fd`.

Next up is [Uninstalling](../uninstalling/), just on the off chance you and Ang need to part ways. 🥲
