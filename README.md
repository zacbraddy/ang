<h1 align="center">🚢🚫👀 | Ang: The Last Software Bender | 🚢🚫👀</h1>

**Avoid Navel Gazing.** A lean, opinionated framework for AI-assisted development. Hate the opinions but love the way it stops your agents burning tokens until the ocean begins to boil 🌊🔥 and gets them doing actual work instead? Cool, it's yours now. Go ahead and make it your own, it'll help!
<br />
<br />

## 🚀 Quick start

> **First:** you'll need Node.js 26+ on your PATH. On Windows, Ang runs inside WSL, not Git Bash, MSYS or Cygwin, so set up WSL first and run the install from a WSL shell.

From the root of your project's git repo, with a clean working tree (commit or stash anything in progress first):

```sh
curl -fsSL https://github.com/zacbraddy/ang/releases/latest/download/install.sh | sh
```

Then open Claude Code in the repo and run `/bootstrap-repo`. It seeds Ang's view of your project, either from your goals and constraints or by surveying the code you already have, then finishes by tailoring Ang to you. Don't stress about getting the tailoring right first time, because you can tweak it whenever you like with `/tailor-ang`, and anyone joining the repo later doesn't have to miss out on making Ang comfy: they just run `/tailor-ang` and welcome aboard!
<br />
<br />

## 🧠 How it works

- **The funnel.** As your work flows through Ang, it guides you through `raw → ideas → shaping → planning → execution → retro → 10k`. Each stage answers exactly one question, each in its own session. This way Ang keeps the agents sharp and focused. Feed it anything you're thinking about the project, whenever you think it. Lots of half-baked thoughts can go in the top, and what comes out the bottom is a few well-understood epics, ready to be worked through.
- **The context library.** Everything Ang knows about your project lives in `project-context/`. `10k/` is the focused, up-to-date truth about what you're building; everything else is in flight, so Ang writes it down but knows that things could change at any time. To keep the context library slim, docs are replaced, not hoarded. If an agent really feels the need to channel its inner Indiana Jones 🤠, git keeps the history for its archaeological endeavours. No need for the file system to become a tomb of decisions past 🪦. Every session loads only what the task in front of it needs, and that's the whole point: agents stay sharp, don't waste tokens navel gazing, and just get the job done.
- **If AI frameworks are sourdough bread, Ang is your starter.** It works out the box in a way I think is sensible. Disagree? Cool. When it gets in your way, you raise a workflow improvement and an agent bends Ang to fit your style. Ang isn't *this* repo; Ang is whatever *your* copy of it becomes. You never have to agree with my "stupid" way of doing things. Fix whatever you reckon I got wrong, and now Ang is your perfect framework.
- **Streams, if you want them.** 🌊 Streams let you run several pieces of work in parallel, one git worktree each, with a mailbox so they can pass notes, cooperate and coordinate. This way you don't discover your agents furiously rowing in opposite directions!
- **Integrates with your tooling.** Like [Orca](https://github.com/stablyai/orca)? Me too! Ang integrates with it, so out of the box you get all the progress-card goodness from agents working in Orca. Hate Orca, or haven't made your mind up? That's chill, it's optional. 😎
<br />

## 📥 The funnel

With Ang you run one command at a time, each in a fresh session, and you stay in charge of every step. There are plenty of commands, but these are the ones you'll live in:


| Stage     | When I'm asking...                                                                                                                    | Then I...                                                                             | I run...           | And Ang gives me...                                                                                                                                                                                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| raw       | "Might this matter?" Or: "What does this Slack message mean for the project?" Or: "Would this shiny new JS framework be useful here?" | Drop notes, brain dumps or links in `project-context/raw/` and commit them            | `/ideate`          | Organised, focused ideas in `ideas/` that I can start refining                                                                                                                                                                                                                 |
| ideas     | "What's the landscape? Is this worth pursuing? What don't I know about this that I really ought to?"                                  | Pick an idea and dig into whatever we don't know yet                                  | `/refine-ideas`    | One unknown made known, backed by real sources, plus a call on whether we now know enough to start shaping                                                                                                                                                                     |
| shaping   | "How *could* we do this, and is it viable for us?"                                                                                    | Poke at the "how" with spikes, experiments, research or a chat with someone who knows | `/shape-ideas`     | One "how could we" answered, plus a call on whether we know enough to get down to work and start planning                                                                                                                                                             |
| planning  | "Ok, so, how are we *actually* going to do this?"                                                                                     | Group the ready ideas into an epic and plan it a chunk at a time                      | `/plan-epic`       | A plan with full C4 diagrams. Everyone knows what they're doing and agrees it's the best thing we could be doing, so we're ready to build                                                                                                                                |
| execution | Build it, story by story                                                                                                              | Slice the epic up                                                                     | `/break-down-epic` | Small, ordered stories with owners and dependencies                                                                                                                                                                                                                            |
|           |                                                                                                                                       | Pick up the next story                                                                | `/write-story`     | A spec: what "done" looks like, acceptance criteria and a test plan                                                                                                                                                                                                            |
|           |                                                                                                                                       | Build it (or get walked through it, if it's mine to do)                               | `/implement-story` | The work, test-first, left unstaged for me to look over 👀. Ang knows this is my software, not Ang's, so the final say on what gets checked in, and in what shape, is **always** down to me                                                                                   |
|           |                                                                                                                                       | Get a second pair of eyes on it                                                       | `/review-story`    | A fresh-eyes review, with its fixes kept separate from the original work, because what gets committed is always my decision, but I've also got better things to do than waste my time searching for sepllnig mistakes and minor cosmetic issues. That's what my agents are for |
| retro     | "Now we've made progress, what's changed about my project? What's now true and what have I learned or decided that's worth keeping?"  | Wrap up the finished epic                                                             | `/retro`           | What's now true promoted into `10k/`, follow-ups raised, and the rest swept away 🧹                                                                                                                                                                                            |
<br />
And round we go again. That's it. That's Ang. That's the loop! 🔁 What? You were expecting more? Well...
<br />
<br />

## 🪄 Bending Ang

Listen, I'm not exactly the Leonardo da Vinci of code over here, alright? I'm just a bundle of experience, earned the hard way through good ol' fashioned mistakes, that the industry would call a software "engineer" (lol!). I'm not trying to claim that Ang has everything perfectly right and nailed down. Even if it did, it'd only ever be nailed down to suit **my** workflow perfectly and **your** preferred workflow might be different. 

Luckily, this ain't a "me" problem, it's a problem inherent in all AI-assisted development frameworks: by their very nature they take opinions that might disagree with your own. Ang acknowledges this and sets itself apart, not by throwing shade at your way of doing things and telling you it's the Ang way or the highway, but by bending. Ang is a software bender, and it's ready to adapt to however you want to do things. So if there's something Ang doesn't do that you want it to do, or something that it is doing that you wish it didn't, here's what you do:

- `/raise-workflow-improvement`: turns some friction you hit into a concrete change to Ang. Some of these friction points will be obvious enough that you'll want to raise them yourself. But Ang cares about making you comfy, so it also notices you having trouble (or complaining more than usual 😬) and when it does Ang will offer to raise a workflow improvement. This way you can stay focused on what you're doing, but also know that Ang is about to get even better for you. Then, later:
- `/improve-workflow`: run it in a new session and Ang will have an agent make the changes you want to see in the framework, because that ain't your job, you didn't sign up to be an Ang dev, you just wanted to use it and have it be super useful. Well, now Ang is **your** perfect AI-assisted coding framework.
<br />

## 🫶 So much more...

Although Ang wants to stay lean and light-touch, it's ready to drive your software development processes straight out the box. Ang is waiting to show you what else it can do, and will help you discover these features as you work with it if you'd prefer not to have to trawl through docs. Triggers, parked work, item merging, and more, are all things Ang will help you get to grips with as you work.

That said, going in blind can be overwhelming, so if you want to get a full understanding of what Ang can do and the motivations driving the framework...
<br />
<br />

## 📚 Docs

I know you don't want to get drowned in info in a README, but I also know you'll probably want the full rundown of what Ang is and how it can help. So, anything this README skips is at [**zacbraddy.github.io/ang**](https://zacbraddy.github.io/ang/).
<br />
<br />

## 📜 Credits and licence

Ang was developed by [Zac Braddy](https://zackerthehacker.com) and is sponsored by We Right Code.

Ang is licensed under the [MIT licence](LICENSE), so for you that means, like...
<br />
<br />
<p align="center"><img src="https://i.imgflip.com/1xvnfi.jpg?a498612" alt="&quot;I made this&quot; meme: one stick figure hands another a thing they made, and the other walks off saying &quot;I made this&quot;" width=136 /></p>
