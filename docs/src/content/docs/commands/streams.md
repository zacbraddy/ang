---
title: Streams
description: The commands for running several Ang sessions side by side. Starting a stream, ending one cleanly, and reading the mail between them.
sidebar:
  order: 4
---
:::note[Streams are off by default]
These three commands only do anything with streams switched on, which means `streams: true` in your repo's `ang.json`. [Config](../../reference/config/) shows you how.
:::

[Streams & mail](../../concepts/streams-and-mail/) covers what a stream is, why the mailbox mostly stays quiet, and how streams peek at each other's work. This page is the detail behind the three commands: what you pass them, what they commit, and the places they'll stop and check with you.

All three share one rule worth knowing up front. Ang's records of your streams and the mail between them live on a branch called `ang/streams`, and Ang commits to it for you, only ever after you've said yes to something. Nothing these commands do is committed to your own branches. Anything they write to your actual streams as a result of any of these commands, like a fact recorded from a note, is left unstaged for you like always.

## 🧾 At a glance


| Command         | Run it when                                           | Who starts it                    | You get back                                                                                          |
| --------------- | ----------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `/start-stream` | You want a new line of work running alongside main    | You only                         | A `stream/<slug>` branch, its worktree, and the stream registered                                     |
| `/end-stream`   | A stream's branch has merged, or you're abandoning it | You only                         | Its waiting mail dealt with, the stream deregistered, and its worktree and branch removed on your yes |
| `/read-mail`    | Ang has told you a stream has notes waiting           | You only (or ask in plain words) | One agreed outcome per note, recorded, and the note cleared                                           |


## 🚣 /start-stream

**Run it when** you want to start a new line of work alongside what's already going, from a session on main.

**Pass it** a kebab-case slug and, in quotes, a one-line focus: `/start-stream pricing "Working out what we charge, from research through to the pricing page"`. Leave the focus off and Ang suggests one. The focus is very important because it's what agents in your other streams read to decide whether this stream is worth peeking at.

When you run this command, Ang first checks your list of streams and stops if the slug is already taken. If your local main is behind `origin/main`, it will tell you and ask whether to cut the branch from `origin/main` instead, to ensure that your new stream is branching from the most applicable commit on main. Ang never pulls for you in this situation, because main might have changes you haven't committed, and losing those might make you sad, and Ang would never want to do that to you 🥹

Then it cuts `stream/<slug>` and creates its worktree next to your main checkout, named after the slug. Then Ang copies in any gitignored files listed in your repo's `.worktreeinclude` (like `.env.local`), so that the stream points at the same local settings as main. Finally, it registers the stream by committing to `ang/streams`.

When it's done, Ang brings you back the branch and the worktree's path, and gives you the commands to get you started working in your new stream. If your repo has a lockfile, Ang reminds you to install dependencies in the new worktree first, because a fresh worktree won't have any installed yet.

:::note[Using Orca?]
Inside [Orca](../../concepts/streams-and-mail/#-orca-optional), Ang asks Orca to create the stream as a workspace instead. It lands under `~/orca/workspaces/` rather than next to your main checkout, Orca runs your repo's setup script to install dependencies, and the stream's focus becomes the card's comment. If the branch name is already taken, Orca may add a suffix to it, and Ang registers whatever name Orca used. If Orca fails, Ang tells you and makes a plain worktree instead.
:::

## 🏁 /end-stream

**Run it when** a stream's branch has been merged to main, or you've decided to abandon it.

**Pass it** the stream's slug: `/end-stream pricing`. [Starting and ending a stream](../../concepts/streams-and-mail/#-starting-and-ending-a-stream) gives the overview of why things happen the way they do when you run this command, but for the *what*, read on.

Ang checks the branch is merged into main (or `origin/main`). If it isn't, it shows you the commits that would be lost and stops, and it only carries on if you explicitly say you're abandoning the stream. That way unmerged work can't quietly vanish, but also your repo and its branches aren't held hostage by Ang refusing to close a stream until it's been completed!

Next it goes through any notes still waiting in the stream's inbox, since nothing will ever read them once the stream is gone. Notes the stream *sent* stay with whoever they were sent to, so even with the stream gone, those notes can be managed just fine by their recipient streams. For each note waiting to be read by the stream you're deleting, you decide:

- **Forward** it to a stream that's still running.
- **Record** it here, as a fact, question, decision or trigger, and then clear it.
- **Drop** it.

Then Ang deregisters the stream and offers the clean-up, each piece is cleaned up only on your yes:

- **The worktree.** If it has uncommitted changes, Ang shows you what they are and stops there. It never forces the removal without your say-so.
- **The branch,** deleted the safe way (`git branch -d`) if it was merged, and force-deleted (`-D`) only for a stream you abandoned. If it was pushed, the remote copy goes too.

You can run `/end-stream` from main, or from inside the stream you're ending. From inside, Ang does everything except remove the worktree and branch, because a session can't delete the folder it's running in or the branch it has checked out. You'd do those bits later from main. The only commits are to `ang/streams`, and anything you recorded from the inbox is left unstaged.

:::note[Using Orca?]
Inside Orca, once the branch is confirmed merged, Ang marks the stream's card as completed (not for an abandoned stream). The worktree is removed through Orca, so the card goes with it, and Orca refuses a worktree with uncommitted changes just the same. Orca usually deletes the branch too, so Ang checks whether it's still there before offering to delete it.
:::

## 📨 /read-mail

**Run it when** Ang tells you at the start of a session that this stream has notes waiting. It takes no argument, and you don't even need the command if you'd prefer not to have to remember one more command: asking the agent to go through its mail, in any words, does the same thing. [Reading your mail](../../concepts/streams-and-mail/#-reading-your-mail) covers the four things Ang can propose for a note, and why "no effect" is a perfectly normal answer. Here we're just going to cover the mechanics of the command.

Ang goes through the notes one at a time. For each, it weighs the note against this stream's focus and what's in flight here, then proposes one outcome with its reasoning in a line or two. A note that's really a new idea gets saved to `raw/mail-<sender>-<id>.md` rather than run through `/ideate` there and then, so that you can review and commit it and run `/ideate` on it in a fresh session.

A note is a heads-up, not a source. When an outcome needs evidence, Ang gathers the real evidence from the sender's branch and cites that. It only cites the note itself when no evidence exists, and then only records it as an open question or something for you to confirm. It's done this way so a passing remark from another session never ends up in your library as fact.

Once you've agreed with Ang on the correct course of action to take, it records the outcome first, and only then clears the note, because clearing deletes it. Finally, Ang reports to you one line per note, with anything recorded left unstaged.

If Ang ever tells you there are notes waiting but you're busy and want to come back to them later, that's fine: just leave them. Ang is notified at the start of every session if there is mail waiting for it, like a sticky note on its monitor, until you deal with it. So you're free to just allow Ang to keep politely reminding you of the work to be done until you've got a moment to focus on it.

You might be asking:

> Why no `/send-mail`?

Well, remember, Ang is here to build software with you, not for you. You're the one in charge here, not Ang. The `/read-mail` command helps Ang work with you by taking off your hands the mental overhead of managing how the different pieces of work in different streams interact with each other during their delivery. The mail system automates this for you so you're free to focus on the work you're doing right now, or on the bigger picture. Because, in this model, you're in charge, you don't need to be sending mail to different streams. If there's work you want done, then just go to the stream and do it! You aren't locked inside a single stream like an Ang agent is, and you don't have **anyone** telling you what to do, so you can skip the mail altogether and just go and get the work done!

With that, we've covered every stream command. Next up: [Commands: bending Ang](../../commands/bending/), for when you want to change how Ang itself works.