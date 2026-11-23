---
title: Quick start
description: Install Ang into your repo, bootstrap it, and get going.
sidebar:
  order: 1
---

Right, let's get Ang into your repo. It's one line to install and one command to bootstrap, and the whole thing lands as a single diff you can look over before anything gets committed. No surprises, no mystery files appearing in places you didn't expect.

## ✅ Before you start

For the smoothest ride, before you run the install script you'll want to check you've got these things in place:

- **You're running the script in a git repo at its root.** Not a subfolder. Ang lands as a diff, so it needs git to land in and Ang wants to be in the root of the repo.
- **You've got a clean working tree.** Commit or stash anything in progress first, so that the install is one reviewable diff and not a tangle of your in-flight changes and Ang's.
- **You're on Node.js 26+, with** `npx`**.** `npx` comes with npm, so a normal Node install has it.
- **You're installing using macOS, Linux or WSL.** Windows users, you're going to want to be in WSL (Windows Subsystem for Linux) or expect problems. More on that [below](#-on-windows).

But hey, don't worry too much. If any of those isn't true, the installer stops, lets you know what's wrong and how to fix it, and leaves your repo exactly as it found it. But things will probably be a bit easier if you check these yourself before you get started.

## 📥 Install

In a terminal from the root of your project's git repo, throw this command in:

```sh title="Install Ang"
curl -fsSL https://github.com/zacbraddy/ang/releases/latest/download/install.sh | sh
```

That grabs the latest release. Want a specific one instead, say to match a teammate's copy? You can pass the version tag in at the end like this:

```sh title="Install a specific release"
curl -fsSL https://github.com/zacbraddy/ang/releases/latest/download/install.sh | sh -s -- <tag>
```

So to install version 1.0.0, say, you'd run:

```sh title="Install v1.0.0"
curl -fsSL https://github.com/zacbraddy/ang/releases/latest/download/install.sh | sh -s -- v1.0.0
```

Ang's release tags are a `v` followed by three numbers, major, minor and patch, like `v1.0.0` or `v1.2.3`. Release candidates get an `-rc.` and a number on the end, like `v1.1.0-rc.1`. A bare `1.0.0`, a shortened `v1.0` or a commit SHA won't work, so copy the tag exactly as it appears on the [releases page](https://github.com/zacbraddy/ang/releases).

## 🔍 What the install actually does

Hey...look, I can hear you from here:

> I'm piping a script from the internet into my shell, so I deserve to know what it's up to!

Fair play, and I wouldn't expect you to do this blind so here's the whole story of what the install script does so you can calm your nerves. Basically the script:

1. **Checks everything first.** Platform, Node, `npx`, git repo root, clean tree, Ang not already installed, and that any `.claude/settings.json` that's already there is valid JSON. Nothing is written until every check passes.
2. **Downloads into a temp folder.** Ang's files go somewhere safe first, so that a failed download can't leave your repo with a half-installed copy of Ang.
3. **Stops on clashes.** If `project-context/`, a skill folder with the same name as one of Ang's, or any other file Ang ships already exists, it lists them and stops rather than blasting away at your files. (Btw: Got another framework in your repo? It's chill, check out [Trying Ang alongside your framework](../alongside-your-framework/) because it covers this.)
4. **Copies Ang in.** Agents, skills, rules, output styles, scripts and the conventions file all land under `.claude/` and `project-context/`.
5. **Merges your settings with Ang's, it doesn't replace them.** If you already have a `.claude/settings.json`, it backs them up to `.claude/settings.json.pre-ang`, then merges Ang's hooks and permissions in. Where your values differ from Ang's, yours win, and it tells you which ones it kept.
6. **Records the version.** It writes `.claude/ang/version.json` so that a later [upgrade](../upgrading/) knows exactly what you started from.

When it's done, it prints something like:

```text
Downloading Ang v1.0.0 (3f2a…)…
Ang v1.0.0 installed in /home/me/my-project.
Next: open Claude Code here and run /bootstrap-repo.
```

If you still don't believe me the link to the source code for the installer is in the install script above, feel free not to take my word for it and read it yourself. I'll try not to let my feelings be too hurt by your lack of trust.

If you've already got Ang installed and run the installer by accident it's all good. The installer spots `.claude/ang/version.json` and will point you at the `/upgrade-ang` skill instead. Ang is pretty great, but one Ang per repo is plenty. 😅

## 🌱 Bootstrap

Once you run the install, Ang needs to start getting comfy in your repo before it gets to work. Open Claude Code in the repo and run:

```text
/bootstrap-repo
```

Bootstrap seeds the `10k/`, which is Ang's slimmed-down truth about your project. This way, the first agent to pick up work isn't flying blind. The bootstrap will also ask you about Ang's optional features (like whether you want [streams](../../concepts/streams-and-mail/)). It will offer recommended defaults for these which you can take if you don't want to have to learn all of Ang's features at once. The bootstrap then finishes by tailoring Ang to you.

Bootstrapping has two modes. If you already know which one you want, you can name it when you run the command (`/bootstrap-repo brownfield`, say). If you don't, just run `/bootstrap-repo` on its own and Ang will ask you. Either way the call is yours, and if both fit (say, an existing codebase where you've also got goals and constraints you want Ang to know about) you can have both. The two modes are:

- **Brownfield (for an existing repo):** In this mode Ang surveys the code and docs you already have, so `10k/` starts out describing what's really there.
- **Founding (for new repos building out new ideas):** To get this one started Ang will want you to drop a brain dump of your goals, constraints and anything else you're thinking about the project into `project-context/raw/`. It's best if you make these folders manually and drop your brain dump file in there, then commit them before you run the bootstrap because the bootstrap process will want to use them when you choose founding mode. In this mode Ang pulls the facts out of the brain dump and turns it into the beginning of a plan to start refining and shaping your rough ideas into working software.

When Ang is done bootstrapping, it'll leave you with a heap of unstaged changes for you to review. If you're happy, commit them, and then restart Claude Code and from then on agents will have everything they need to start flexing their new Ang superpowers!

## 🎨 Tailoring

During the bootstrap Ang runs `/tailor-ang` for you as one of its steps. Tailoring sets up Ang in a way that personalises it to your preferences. We spend all day with our agents in modern software development so it's important you enjoy spending time with them! Ang will ask you about: what Ang should call you, how it should talk to you, and a little about how you prefer to work. These customisations all land in gitignored local files, so your colleagues never find themselves talking to **your** Ang agents by accident.

If you decide the choices you made during bootstrap just created agents that annoy you more than help you, don't worry. Just run `/tailor-ang` again to tweak your settings and find something you like. If someone new joins the repo, they can run `/tailor-ang` too and get Ang all comfy for themselves.

If you're not trying to run Ang on Windows then next up for you is: [Your first loop](../first-loop/) where we'll walk you through "the funnel" end to end, so you know what commands you'll want to be running when working with Ang.

If you're wanting to run Ang on Windows then keep reading.

## 🪟 On Windows

The supported route on Windows is **WSL**. If you try and run the installer under Git Bash, MSYS or Cygwin, it stops, and lets you know to try again in WSL. So if you're wanting to use Ang on Windows your install steps are going to be:

1. Set up WSL: run `wsl --install` in PowerShell.
2. Install Node.js 26+ *inside* WSL.
3. Open a WSL shell in your project, and follow the [install](#-install) steps above.

## 🧪 Native Windows (untested, best effort)

:::caution[Here be dragons 🐉]
This route is untested and only provided as a best effort. I don't work on Windows and so I haven't run it on a real Windows box, so if it breaks, WSL is the way. The steps below walk through what `install.sh` does so you can attempt them manually and that will hopefully get you up and running.
:::

Because Claude Code runs its hooks through Git Bash on Windows, Git for Windows isn't optional here but also, if you're using Claude Code on Windows there's a chance you're already covered. If for some reason you don't have this installed then before you get started, **install the prerequisites:** [Git for Windows](https://gitforwindows.org/) and Node.js 26+ (which brings `npx`). Every command below runs in a Git Bash shell, and you should be running them from the root of your repo, with a clean working tree.

Once you're ready you'll want to run these commands one by one in the same Git Bash shell:

1. **Pick a release and get its commit SHA.** Choose a tag from the [releases page](https://github.com/zacbraddy/ang/releases), then:

   ```sh
   TAG=<tag>   # for example: TAG=v1.0.0
   SHA=$(curl -fsSL -H "Accept: application/vnd.github.sha" "https://api.github.com/repos/zacbraddy/ang/commits/$TAG")
   echo "$SHA"
   ```

   That should print a 40-character hex SHA.
2. **Download Ang into a temp folder.**

   ```sh
   TMP=$(mktemp -d)
   npx -y giget@3.3.1 "gh:zacbraddy/ang/src#$SHA" "$TMP/src" --force
   ```

3. **Check for clashes, then copy Ang in.** If `project-context/`, any folder under `$TMP/src/.claude/skills/` or any other file in `$TMP/src` already exists in your repo, stop and rename it first (see [Trying Ang alongside your framework](../alongside-your-framework/)). Then copy in everything except Ang's settings file, backing up your existing one if you have one:

   ```sh
   [ -f .claude/settings.json ] && [ ! -e .claude/settings.json.pre-ang ] && cp .claude/settings.json .claude/settings.json.pre-ang
   mv "$TMP/src/.claude/settings.json" "$TMP/theirs.json"
   cp -R "$TMP/src/." .
   ```

4. **Merge Ang's settings into yours.** It prints any settings where it kept your value over Ang's, as JSON. `[]` means nothing clashed.

   ```sh
   node .claude/scripts/ang-context-manager.mjs settings merge --base none --ours .claude/settings.json --theirs "$TMP/theirs.json"
   ```

5. **Record the version, and tidy up.**

   ```sh
   node .claude/scripts/ang-context-manager.mjs version write --ref "$TAG" --sha "$SHA"
   rm -rf "$TMP"
   ```

Then it's [bootstrap](#-bootstrap) time, and you should be back on track and the same as everyone else. 🎉
