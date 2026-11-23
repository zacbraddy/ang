---
title: ang-context-manager.mjs
description: The script that does the context library's bookkeeping. What each group of commands is for, the handful worth running yourself, and where the session banner comes from.
sidebar:
  order: 3
---
`ang-context-manager.mjs` is the script Ang's skills and agents use to keep the [context library](../../concepts/context-library/) in order: indexes, item state, tags, triggers, streams and mail.

You rarely (in fact probably never) need to run it yourself. But Ang's agents run it all day long and it's a big part of how they keep their context windows so lean while still being able to get at all the right pieces they need to be so darn effective! Ang doesn't realise how good it's gotten at using this script, so a lot of the time it will talk about its commands as if you're just as much of a superstar at running the script as it is. For this reason it can help to have a high-level idea of some of the commands available, so that Ang doesn't make your eyes go crossed by casually throwing them into conversation.

The script lives at `.claude/scripts/ang-context-manager.mjs` in your repo, and if you ever wanted to run any of these you'd do it from the repo root like this:

```bash
node .claude/scripts/ang-context-manager.mjs <noun> <verb>
```

It's plain Node with zero dependencies, so there's nothing to install and nothing to keep updated: if you've got Node, you've got the script.

Three files belong to it, and only it should write them (no agents or humans allowed!): every `index.json`, every `state.json` and `triggers.json`. Because the script is the only thing that touches these files, it can always rely on them being consistent with your docs and with each other. This is why the agents never hand-edit them either, and neither should you.

This page groups the commands the same way the script's own help does and says what each one is for in plain words. For the exact arguments and flags, the script is the source of truth:

```bash
node .claude/scripts/ang-context-manager.mjs --help
```

## 🧾 At a glance


| Noun      | What it's for                                                         | If you're interested to see what's going on you could run |
| --------- | --------------------------------------------------------------------- | --------------------------------------------------------- |
| `library` | Setting up, indexing and checking the whole `project-context/` folder | `library validate`                                        |
| `board`   | Seeing every item in the funnel and where it's at                     | `board status`                                            |
| `item`    | Moving an item between stages, or folding one into another            |                                                           |
| `state`   | Reading and changing an item's status, unknowns, knowns and decisions |                                                           |
| `tag`     | Keeping the tag list tidy                                             |                                                           |
| `trigger` | Deferring an action until its conditions hold                         | `trigger list`                                            |
| `session` | Feeding Ang's hooks and skills (not for you)                          |                                                           |
| `stream`  | The stream registry, with streams on                                  | `stream list`                                             |
| `mail`    | The mailbox between streams, with streams on                          | `mail list`                                               |


## 📒 library

The commands that look after the library as a whole.

- **`library init`** creates the `project-context/` folder structure, `tags.json` and the indexes. `/bootstrap-repo` runs it for you, and it's safe to re-run: it only fills in what's missing.
- **`library index`** rebuilds every `index.json` from the docs' frontmatter. A hook runs it after every edit, so you shouldn't ever need to.
- **`library validate`** checks the lot: your config, every doc's frontmatter and shape, tags, links, item state, stories and triggers. It prints warnings and errors, and lists any triggers that are ready to run. It exits with an error when something's broken, and every Ang workflow command finishes by running it.

```bash title="Is my library healthy?"
node .claude/scripts/ang-context-manager.mjs library validate
```

Run this one whenever you've edited docs by hand, or when something feels off. It names the file and the problem for each error, so that you can fix it yourself or hand the output to a session to fix for you.

## 📊 board

- **`board status`** lists every item in each stage with its status and its next unknown, plus story progress for epics in execution and a count of triggers. Pass a stage (`ideas`, `shaping`, `planning`, `execution` or `retro`) to see only that one.

## 📦 item

- **`item move`** moves an item to another stage folder, rewrites every link that pointed at it, logs the move in its history and reindexes.
- **`item merge`** folds one item into another: its files, its state, its links and any triggers pointing at it. The folded item is deleted. `stage-gate` and `/plan-epic` use this when ideas join an existing item or an epic.

## 🧮 state

Every item's `state.json` holds its status, its unknowns (in priority order), what's known, what's been decided, and a history of what happened to it. These commands are how agents read and change it.

- **`state init`** creates `state.json` for a new item.
- **`state show`** prints the item's status, unknowns, knowns and decisions.
- **`state status`** sets the status (active, ready for planning or blocked), with an optional note.
- **`state type`** sets an epic's type: technical, business or mixed.
- **`state add`** adds an unknown, a known or a decision, with its approach, source or evidence.
- **`state answer`** turns an unknown into a known, with the source that answered it.
- **`state replace`** rewrites an entry in place, keeping its id, so that the state always says what's true now rather than piling up corrections.
- **`state order`** reorders the unknowns, so the next session tackles the right one first.
- **`state remove`** removes an entry.
- **`state lineage`** logs a note in the item's history. Moves, merges and status changes log themselves.

## 🪧 tag

- **`tag stats`** lists registered tags by how often they're used, plus any tags docs use that were never registered.
- **`tag add`** registers a new tag, with a description and the departments it belongs to.
- **`tag merge`** rewrites every doc using some tags to use another one instead, then unregisters the old ones.
- **`tag remove`** unregisters a tag nobody uses.

`/curate-tags` drives these when the list grows past 50. More in [Library upkeep](../../commands/library-upkeep/).

## ⏰ trigger

[Triggers](../../concepts/triggers/) defer an action until its conditions hold.

- **`trigger add`** registers a trigger, once its doc exists in `project-context/triggers/`.
- **`trigger repoint`** replaces all of a trigger's conditions and keeps its doc.
- **`trigger list`** shows every trigger, whether it's waiting, needs judging or is ready, and how each condition is doing.
- **`trigger check`** prints only the triggers that are ready or need judging.
- **`trigger remove`** deletes a trigger and its doc.

## 🪝 session

These commands are for Ang's hooks and skills, not for you. They print the session banner and each on feature's rule, add on features' extra steps to a skill, give subagents the same rules your main session gets, and list the optional features for `/bootstrap-repo` to ask about. [Config](../../reference/config/#-how-on-reaches-the-agents) explains what that adds up to.

If you've ever wondered where Ang agents get things like their mail notifications, this is it. It's the hooks in `.claude/settings.json`, and they all call this script:

- **When a session starts**, `session banner` prints the "Ang: …" line and the rules for each feature that's on.
- **When a subagent starts**, `session subagent` gives it those same rules, plus any extra instructions an on feature has for that agent.
- **After every file edit, and when a session stops**, `library index` rebuilds the indexes, so that they never drift from the docs.

## 💧 stream

These need `"streams": true` in `ang.json` ([Config](../../reference/config/)). With streams off, the script tells you so rather than pretending they don't exist.

- **`stream add`** registers a stream. `/start-stream` creates the branch and worktree first, then calls this.
- **`stream list`** shows every stream with its branch, unread mail, worktree and focus, with a `*` marking the one you're in.
- **`stream set`** changes a stream's focus line, which other streams read before peeking at its work or mailing it.
- **`stream remove`** takes a stream off the registry once its inbox is empty. `/end-stream` does this for you.

## 📮 mail

These need `"streams": true` too.

- **`mail send`** leaves a note in a stream's inbox. Agents only run it after you've approved the note's text and where it's going.
- **`mail list`** shows a stream's unread notes, defaulting to the one you're in. On main, it shows every note.
- **`mail forward`** readdresses a note to another stream and keeps its sender, for notes left behind when a stream ends.
- **`mail handle`** deletes a note once you've decided what it becomes.

---

That's the nuts and bolts covered. Next up: [First principles](../../why-ang/first-principles/), for the thinking behind why Ang works the way it does.