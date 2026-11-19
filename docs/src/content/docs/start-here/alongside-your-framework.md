---
title: Trying Ang alongside your framework
description: Trial Ang on a branch next to BMAD, Spec Kit or whatever you already run, then back out or move over.
sidebar:
  order: 2
---

So you're already running BMAD, Spec Kit, a pile of hand-rolled skills or some other framework, and you want to kick Ang's tyres without blowing up what already works for you? Very sensible, honestly I'd do the same. Here's how to give Ang a fair trial on a branch, and then either walk away clean or bring everything your old framework knows over to Ang with you.

## 🌿 Trial it on a branch

The easiest way to try Ang out is on a branch of its own. That keeps the whole experiment in one place, so if you decide Ang isn't for you, backing out is as cheap as deleting the branch:

```sh
git switch -c try-ang
```

Then follow the [Quick start](../quick-start/) inside that branch.

When `/bootstrap-repo` asks you about Ang's optional features, you'll want to say **no to streams** (don't worry, that's the default anyway). Streams let you run several branches in parallel and keep a shared mailbox on a branch of their own. That's great once you're settled in, but in a trial it's just noise. With streams off, the whole trial stays on your `try-ang` branch.

Once you're bootstrapped, pick one real problem and take it through the funnel end to end. [Your first loop](../first-loop/) shows you the route. One problem taken from start to finish will tell you far more about whether Ang suits you than poking at commands one at a time ever will.

## 💥 When the install stops on a clash

The installer won't overwrite anything you already have. Before it copies a single file, it checks for:

- a `project-context/` folder, because that's where Ang keeps everything it knows about your project;
- a skill folder under `.claude/skills/` with the same name as one of Ang's. Claude Code finds skills by their folder name, so two `retro` skills would trip over each other even if none of the files inside them clashed;
- any other file Ang ships that already exists at the same path.

If it finds any of these, it lists every one and stops, and your repo is left untouched. To get past it, rename or move the clashing paths, commit, and run the install again.

The one exception is `.claude/settings.json`. That never clashes, because Ang merges its hooks and permissions into yours and keeps your values wherever the two of you disagree. Your original gets backed up to `.claude/settings.json.pre-ang` first, just in case.

## 🤝 Living side by side

Ang doesn't ship a `CLAUDE.md` or an `AGENTS.md`, so yours stay put and keep loading like they always have. Ang's engineering defaults even say so themselves: in a repo with its own conventions, the repo's `CLAUDE.md`, `AGENTS.md` and conventions win over Ang's defaults.

Beyond that, I'm not going to make promises about how any particular framework and Ang will get along, because honestly I'd be guessing. I do know that if there are problems they won't be Ang's! Ang has no problems with living alongside another framework outside of the clashing files we've mentioned above. But I can't guarantee that X framework will be imbued with the same "Live and let live" spirit. In any case, that's what the trial is for!

Once you've given Ang a good try, you've got two ways to go from there. Pick the one that suits you best.

## 🚪 Exit one: back out

Didn't click for you? No hard feelings, I promise. If the trial never left its branch, getting rid of it is one line:

```sh
git switch main && git branch -D try-ang
```

If some of Ang already made it onto `main`, [Uninstalling](../uninstalling/) lists everything you'll need to remove by hand.

## 🚚 Exit two: move over to Ang

Liked it enough to stay? Awesome! And I've got great news, you don't have to leave everything your old framework's docs know behind either. Ang can run a migration project from your other framework onto Ang as its first task. You've got two ways to go about it:

- **Drop the old docs into** `project-context/raw/`, along with a file with a name something like `readme-first.md` that has a few lines in it explaining to Ang what you're wanting to do, i.e. run a project that takes all the files you've collected during your time with the other framework and translates them into files that suit Ang's usage better. Once you've done that, commit them and run `/ideate`. Ang will go through everything, sort it into threads and group them, whether they be new ideas, additions to work already in flight, or things to park for later. It won't touch the `10k/` folder while it does this, because `10k/` only changes once delivery proves something is true. So anything your old framework knew gets worked through the funnel like everything else, and lands in `10k/` at `/retro`.
- **Or run** `/bootstrap-repo brownfield`. Perhaps you've learned a lot during the trial and would prefer to start from a clean slate and do the migration in a more structured way that is guided by all your new Ang-fu that you've gained. That's cool, in that case just cut a new branch off main, install Ang on it, and run the brownfield mode of bootstrap. Ang then surveys the code and the docs already in the repo, ADRs included, and seeds `10k/` from what's really there. Then if you want to really be rid of the old framework properly then you can drop that `readme-first.md` file like we described above into raw and Ang will turn it into a piece of work to clean up the old framework and leave you with a pristine Ang repo to work in.

This isn't just theory either, it's exactly how I've moved my own repos onto Ang from other frameworks once it had reached a level of maturity that I was confident making it my daily driver. Once all the knowledge is migrated across, how you remove the old framework is up to you. You can do it either as a step in the migration project that Ang runs for you or using whatever uninstall route it has.

If you haven't run one yet, next up for you is [Your first loop](../first-loop/).
