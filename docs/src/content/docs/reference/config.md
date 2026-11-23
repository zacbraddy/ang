---
title: Config
description: The two small files that switch Ang's optional features on and off. Which one to edit, the line to add, and what you get for it.
sidebar:
  order: 1
---
Ang ships with four optional features, and every one of them is off until you say otherwise. Two belong to the whole repo (the delivery intent and streams), and two belong to you alone (your workspace host and your name). For why you'd want each feature in the first place, the Concepts pages make the case: [the context library](../../concepts/context-library/) for the delivery intent, [streams and mail](../../concepts/streams-and-mail/) for streams, and [bending Ang](../../concepts/bending-ang/) for when you've decided to customise Ang to suit you 💅

## 🧾 At a glance


| Key       | File             | Values              | Default | Switch it on and you get                                                                                                                   |
| --------- | ---------------- | ------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `intent`  | `ang.json`       | `true` or `false`   | `false` | Every session reads how you mean work to be delivered right now, and delivers to it                                                        |
| `streams` | `ang.json`       | `true` or `false`   | `false` | The ability to run several Ang sessions in parallel, one branch each, with a mailbox between them to allow them to collaborate when needed |
| `host`    | `ang.local.json` | `null` or `"orca"`  | `null`  | Ang integrating smoothly with Orca, keeping your workspace card's status, stage and unread flag honest as it works                          |
| `pilot`   | `ang.local.json` | `null` or your name | `null`  | Ang calling you by name: a small touch, but a nice one for something that will be talking to you every work day!                             |


To turn on a feature you only need to flip the key. That is the whole change. Ang picks it up from your next Claude Code session, so save the file, restart, and you're done.

## 📁 The two files

Two files drive these features. Both sit at the root of your repo, and they split cleanly along one line: is this choice for everyone, or just for you?

**`ang.json` is the project's file.** It's committed, so `intent` and `streams` hold for everyone working in the repo, and nobody gets a different Ang from the person sitting next to them when it comes to these features. This file doesn't ship with Ang: `/bootstrap-repo` writes it for you when it asks about the optional features.

```json title="ang.json"
{
  "intent": true,
  "streams": false
}
```

**`ang.local.json` is yours.** It's gitignored, `/tailor-ang` writes it, and it may only hold `host` and `pilot`. Your name and the tools on your machine are nobody else's business, so they never end up in a commit your teammates would then have to unpick before they could get Ang to stop calling them by your name!

```json title="ang.local.json"
{
  "host": "orca",
  "pilot": "Sam"
}
```

Ang reads them in layers: its own defaults first, then `ang.json` on top, then the personal keys from `ang.local.json` on top of that. If either file is missing, Ang carries on with whatever's left, all the way down to no files at all. If neither of these files is in the repo, then every feature listed on this page is turned off until you create one of the required config files.

:::caution[Here be dragons 🐉]
Putting `intent` or `streams` in `ang.local.json` won't do anything. Ang ignores it, and warns you, naming the key. It can't go in your local file because a project-wide switch has to be the same for everyone. If you want these project-wide features on, they have to go in `ang.json`.

Ang will also warn you if `ang.local.json` isn't gitignored, so that your name doesn't sneak into the repo by accident.
:::

## 🔮 intent

The intent feature is useful to ensure that every Ang agent you work with is rowing in the same direction with every session. Often when working on a software project you'll be racing to a deadline, or completing an epic whose intention is to be an MVP, not a gold-plated v10 of the software. Or maybe you're doing a bug bash sprint, so you need agents to understand that the goal is to find and fix bugs, not suddenly start re-architecting your solution from the ground up!

Subtleties in how software is delivered will shift over time, but from one agent session to the next they could be considered sort of "semi-permanent". And I've found that agents are pretty darn horrible at dealing with these subtleties without some help. The intent feature is here so that you don't have to explain, over and over again, what a good delivery of an item looks like given the current state of play in your project.

What this hopefully translates to is no spikes with Netflix-level architecture and no perfectly sculpted user permissions on your MVP before you've even got features to put behind those permissions.

To turn on the intent feature you set the flag `"intent": true` in `ang.json`. With it on, you'll then need to make sure that `project-context/10k/intent.md` now holds how you mean work to be delivered right now, and why. Every session reads it before shaping, planning or building, and delivers to it, so that you're not re-explaining "we're validating, not polishing" at the start of every session. Intent will always be yours: Ang might help you word it, but never decides what it says. `/curate-10k` and `/retro` are the only places that play it back and ask whether it still holds.

To switch it on, set the flag, save the change and then ask any session to write `10k/intent.md` with you. To switch it off, delete the doc and set the flag to `false`.

Ang uses its context library script to make sure that if you have intent turned on and no intent doc (or vice versa), it will let you know. The intent doc also needs a `confirmed: YYYY-MM-DD` line in its frontmatter: this is the date you last said your intent still holds, meaning we should still be delivering based on what the intent doc describes. This date is how Ang models the "semi-permanent" nature of the intent. When the realities that you're delivering under shift, you can say so in a retro or a `/curate-10k` (check out the full details for these in [Library upkeep](../../commands/library-upkeep/)) and Ang will help you update the intent so that all agents going forward shift how they deliver their work to suit what is needed now.

## 🛶 streams

How streams work and why they're useful is explained in full in [Streams and mail](../../concepts/streams-and-mail/), and the commands are in [Commands: streams](../../commands/streams/), so we won't go back over that now. Let's just focus on how to turn them on and get them working here.

To turn them on you just set `"streams": true` in `ang.json`. This unlocks `/start-stream`, `/end-stream` and `/read-mail`, plus the `stream` and `mail` commands in `ang-context-manager.mjs` for Ang agents to use.

Switching it on also adds a mail checkpoint to the skills, where Ang checks whether your session has turned up news another stream needs to hear, and lets `context-scout` peek at other streams' branches when a question touches their work.

Once you've set the flag in `ang.json` and restarted Claude Code, streams will be on, but there's still a little bit of setup to do in the background. Ang takes care of this automatically the first time you run `/start-stream`, so you don't need to worry about that for now: you'll just be able to enjoy the streams feature whenever you feel ready to do so.

## 🃏 host

**`"host": "orca"`** in `ang.local.json` gets set for you automatically, so you won't usually write this one yourself: `/tailor-ang` detects whether you're running inside [Orca](../../concepts/streams-and-mail/#-orca-optional) and writes it down for you, rather than asking you. With it on, Ang runs the host actions that keep your Orca workspace card honest (what the worktree is up to, whether it's working or waiting for review, and a flag when it needs you), so that you can tell which stream wants you without opening every terminal.

The host only turns the Orca integration on when its flag is set *and* the session really is running inside it. So if you open the same repo in a plain terminal outside of Orca, Ang behaves as if `host` were `null`. Nothing to undo, nothing to remember, but you're free to use Ang in whichever terminal you like and get the same experience.

## 🪪 pilot

With `"pilot": "<your name>"` in `ang.local.json` (with your own name, obviously, unless your name is &lt;your name&gt;), Ang addresses you by name. Under the hood, wherever its skills, rules and agents say "me", "I" or "the user", Ang now knows that means you. You can set this manually yourself, but you usually don't have to, because `/tailor-ang` asks you what to put here.

The name lives only in your gitignored file, so a teammate running the same repo never gets called &lt;your name&gt; by accident!

## 📡 How "on" reaches the agents

You shouldn't even need to concern yourself with what's going on under the hood like this when using Ang, but if you're interested, here's how these flags get fed to every Ang agent so that they know what is available in your repo and how they should behave accordingly. Agents never read the configuration files we spoke about above themselves. Instead, when a session starts, Ang prints a banner line naming only the features that are on, along with any detail worth knowing:

```text title="The session banner"
Ang: intent · streams (pricing, 2 unread mail) · host (orca) · pilot (Sam)
```

In Claude Code this happens silently as the session starts, so you'll never see it printed in your window, but the agents still see it. Under that line, each feature that's on adds its own short rule to the session.

Subagents get the same rules when they start, and skills pull in the extra steps that the features on in this repo add to them. A feature that's off adds nothing at all: no rule, no steps, not even a mention in the banner. When a feature is off, an agent doesn't need to know anything about how the feature would work **if** it were on, because... it's not! So having a feature off means it's invisible to the agents running the session. This way the agents' attention stays on your work rather than on features you don't use.

## 🚨 When something's wrong

If either configuration file has a key Ang doesn't know, a value a key doesn't accept, or JSON that won't parse, Ang's context library script is able to tell what's wrong and where. Ang won't pretend to know what a broken config file means; it will just flick that feature back to its default. But Ang will be able to tell something isn't right, and it will let you know as soon as you start a new session. That way you'll know that there's a wrench in your works rather than a feature quietly not being available.

Next up: [Agents](../../reference/agents/), the three specialists Ang sends off to do focused jobs.