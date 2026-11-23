---
title: Setup
description: The commands that settle Ang into a repo. Seeding 10k, tailoring Ang to you, and setting up quality tooling you never have to think about again.
sidebar:
  order: 3
---
These are the commands you run when Ang first moves into a repo, plus the two you'll come back to when you want to change how it treats you or when the repo grows its first lines of code. [Quick start](../../start-here/quick-start/#-bootstrap) walks you through running them the first time. This page is the detail behind each one: what it asks, what it writes, and what it hands over to the next.

## 🧾 At a glance


| Command              | Run it when                                                        | Who starts it                             | You get back                                                                         |
| -------------------- | ------------------------------------------------------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------ |
| `/bootstrap-repo`    | Ang has just been installed and `10k/` is empty                    | You only                                  | A seeded `10k/`, `ang.json`, your tailoring, quality tooling and a leftovers list    |
| `/tailor-ang`        | You want to change how Ang talks to you or what it knows about you | You, or `/bootstrap-repo` runs it for you | Your personal settings, in gitignored files                                          |
| `/bootstrap-quality` | A repo past the spike stage has no lint, format, test or CI setup  | You, or `/bootstrap-repo` runs it for you | Lint, format, tests, pre-commit hooks and one CI workflow, each run once and passing |


## 🥾 /bootstrap-repo

**Run it when** Ang is freshly installed and `project-context/10k/` is empty.

**Pass it** a mode, `founding` or `brownfield`, if you already know which you want, and optionally the files or paths to work from (`/bootstrap-repo founding project-context/raw/brain-dump.md`). Leave it off and Ang asks you.

It runs once per repo, so it's the only time `10k/` ever gets written to outside a retro or a `/curate-10k`. If `10k/` already holds docs, Ang tells you the repo is past bootstrapping and points you at `/retro` for delivered work, or `/curate-10k` if you think it's drifted. The only exception here is a seed that never got finished. Ang knows that you probably just want to finish off the job, so it will top it up, but it needs you to tell it that's what's going on first, as this is a weird state for Ang to find itself in and it won't want to make any mistakes that make things worse!

The bar for what Ang decides is worthy of going into `10k/` is the same as at retro: only stuff that is true now, and drives how future work gets done. Plans, hopes and open questions aren't current truth, so they're set aside for `/ideate`.

I've mentioned there are two modes for running `/bootstrap-repo`. The two modes find facts to put in `10k/` in different places, and both can apply at once:

- **Founding** works from what you tell it: a brain dump in `raw/` (committed first, because Ang will delete it once it's processed), a pasted doc, or your answers to its questions. It pulls out your goals, limits, setup and anything already decided. Your own statements of intent count as top-tier evidence, but anything else keeps its real standing, so that a half-checked bit of research doesn't get passed off as gospel to every agent after it ([Evidence standard](../../concepts/evidence-standard/) can tell you more about the details here). If something important is obviously missing, like a spend limit or what success looks like, Ang asks rather than leave a gap for you to trip over later.
- **Brownfield** surveys your codebase and gets an idea of things like: architecture, the decisions that still bind you, where things live, and the business facts in your README, docs and licences. Where your README and your code disagree, the code wins, and Ang tells you about the gap. Your existing docs stay exactly as they are, because they might belong to your team and rewriting them isn't Ang's job.

Ang proposes the `10k/` docs it's planning on writing off the back of what it's found, five at a time, with the evidence and its trust level for every fact, so that you can catch a wrongly trusted fact before it's written. It flags anything only you can confirm. Then it asks you about each of Ang's optional features, with its recommended default, and writes your answers to `ang.json` at the root of the repo.

After that, it hands over to `/tailor-ang` for your personal settings (full details on that can be found below), runs the library check, and, if the repo has code, runs `/bootstrap-quality`, which sets up quality tooling for use in the repo or extends any quality tooling you've already got rather than replacing it.

When Ang is setting up new quality tooling, it knows that existing code rarely passes brand-new lint rules on day one, so any rule your code breaks is set to warn rather than rewritten in this session, and listed as debt. Later on, you can work out a plan that works for you to slowly start moving your code base towards a quality standard that you're happy with. No code yet? Ang skips this and offers to set a [trigger](../../concepts/triggers/) that sets up quality tooling once code exists so you don't quietly forget to do this and accidentally let it grow into yet another problem you have to solve later on.

Of course, setting up all this quality tooling is entirely up to you: this is your code base, not Ang's! So you only need to say no and nothing is set. If you change your mind later, you can run `/bootstrap-quality` yourself whenever you like.

Next, Ang lists everything it set aside along the way (ideas, open questions, gaps between your docs and your code, tooling debt) and, if you want them carried forward and managed by Ang as part of your daily workflow, Ang writes them to `raw/bootstrap-leftovers.md` for your first `/ideate`.

Finally, Ang deletes the raw inputs it fully processed, since their facts are now in `10k/` and git keeps the originals. Then it lists every file it wrote, unstaged for you to review. Commit when you're happy, then quit Claude Code and start it again, so that the new settings load and you're ready to do great things with Ang by your side ❤️

## 🧵 /tailor-ang

**Run it when** you want to change what Ang calls you, how it talks to you or what it knows about how you work, or when someone new joins the repo and they want to do the same.

It takes no arguments.

`/bootstrap-repo` runs it for you on day one, and it's safe to re-run as often as you like. [Tailoring](../../start-here/quick-start/#-tailoring) has the high-level details around when and why you'd run this. Here we're focusing on what Ang actually does when you run it.

Everything Ang sets as part of this process is yours alone to decide, and your decisions land in gitignored files, so that your settings never clash with a teammate's:

- **Workspace host and pilot name** in `ang.local.json`. Ang doesn't need to know if you're using [Orca](../../concepts/streams-and-mail/#-orca-optional) as your development environment, as it can tell by itself, so it simply writes this down during this process. It can't tell your name without asking though, so it asks what it should call you.
- **Output style** is recorded in `.claude/settings.local.json`. The styles that ship with Ang live in `.claude/output-styles/`, and any you build yourself with the help of Ang are saved alongside them as `.claude/output-styles/<slug>.local.md`.
- **A personal rule** is also added as part of this process and it lives in `.claude/rules/pilot.local.md`. It adds to Ang's engineering defaults in the sessions you run in Claude Code from now on.

During this process the first thing Ang does is check that your `.gitignore` covers the files listed above, and adds any lines that are missing. This way you won't find yourself checking your own personal style into your team's shared codebase.

Then Ang asks one thing at a time. This process can be stepped through super quick on your end with a few short replies: **keep** (or `k`) keeps your current answer if you're running this command when you've already tailored Ang before, **skip** (or `s`) leaves an answer out, and **default** (or `d`) takes the first option in the style picker.

When Ang starts asking about the output style you want to use when speaking with it, you'll be presented with a numbered list of the shipped styles that come out of the box with Ang. Answer with a number and that's the style you'll get. Partner In Crime is the default and the one I use day to day, but there are a few others you may like to try out if this one doesn't suit you.

If you don't like the sound of any of the available output styles that ship with Ang, then pick **Interview me** and Ang asks five questions around tone, how much it says, the shape of a reply, humour and emoji, and when Ang should drop the personality and just get the work done (you don't want to be dealing with Dad jokes when production is down!). Each of these questions provides some example answers which you can pick from if you don't have any strong views on that element of the output style, or if you really want to tweak an element to exactly how you'd like it you can describe what you want in your own words. Then it drafts a style built from your answers and gives it a name. This is what makes Ang more of a tailored to measure experience as opposed to picking a suit off the shelf! 🪡

Finally, Ang asks you three questions that help give agents an idea of who they're talking to when you run an Ang session. Each of these is skippable, so you don't have to tell Ang anything about yourself that you're not comfortable sharing, but each will help Ang agents hit the right balance when they share info with you or when they provide push back arguing on a point. Ang asks about: your role and experience, your default stack (Ang offers what it finds in your repo's manifests as suggestions), and whether you work solo or in a team.

Ang has now completed getting the information it needs to tailor its agents to working with you, but nothing is written until you've seen it. Ang previews every file in full, and one confirmation from you writes the lot. You can rename the style or tweak a line first, but if Ang has gotten anything really wrong you can get it to have another try on that element by asking.

With the tailoring done, it's time for you to review the changes. Only `.gitignore` shows up in `git status`, and only if it changed, because everything else is gitignored, so you can just review the rest on disk. Commit `.gitignore` if it changed, then restart Claude Code to pick it all up.

And hey, if you only want to try a different shipped style, you don't need to run through the whole tailoring process to do that. Claude Code's own `/output-style` allows you to switch between the shipped styles and any you've created yourself on the spot.

## 🧰 /bootstrap-quality

**Run it when** a repo that's past the spike stage has no lint, formatting, tests, pre-commit hooks or CI.

It takes no arguments.

`/bootstrap-repo` runs it for you when there's code. Beyond that, Ang won't set tooling up unprompted, and it won't keep nagging you about it either. If you said no at bootstrap, that's a decision, not something you forgot, so you don't need every Ang agent going forward acting like you've committed some sort of code crime!

Ang starts by working out your languages, package manager and anything you've already configured, and reports that in a few bullets. If it finds some quality tooling already in place, it extends what's already there, rather than replacing anything without asking.

Ang knows that sometimes less is more when it comes to tooling that will be running as frequently as code quality tools, so it proposes the minimal set per language, preferring what your repo or ecosystem already uses, and waits for your go-ahead. If you think the dial could afford to be turned up a bit from what it initially suggests, you only need to ask. In general, Ang will suggest the following as defaults:


| Language   | Lint and format     | Tests  |
| ---------- | ------------------- | ------ |
| TypeScript | ESLint and Prettier | Vitest |
| Python     | Ruff                | pytest |
| .NET       | `dotnet format`     | xUnit  |


Once you've agreed, it installs and configures the lot:

- **The formatter owns style,** and lint rules are only for correctness and real smells, so that nobody ever debates tabs in a code review again.
- **Pre-commit** (Husky and lint-staged for JavaScript and TypeScript, `pre-commit` for Python) formats and lints only the files you've staged, so that committing stays fast.
- **One CI workflow** runs lint, typecheck and the full tests on every push and pull request, on whichever CI provider you already use.

Finally, it runs every check once to show it passing, and adds a short "Running checks" note to your README's setup section. It writes no tests for the tooling itself, because tooling that breaks tells you loudly enough on its own.

So there you go, you've run the commands and you're all set up. Next up: [Commands: streams](../../commands/streams/), for when you decide that you're ready to be an Ang power user and want more than one agent on the go at once.