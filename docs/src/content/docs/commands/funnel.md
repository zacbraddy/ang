---
title: The funnel
description: Every funnel command in one place. When to run it, what to pass it, what it does from your seat, and what comes next.
sidebar:
  order: 1
---
These are the nine commands you'll run most, in the order work flows through them. [Your first loop](../../start-here/first-loop/) walks you round once with a running example, and [Working the funnel](../../concepts/funnel/) covers why the stages exist and the rules for moving between them. This page is the reference you come back to mid-loop when you want to know what a command takes, what it'll pick if you don't tell it, and what it's going to ask you along the way.

Every command here takes one optional argument. Leave it off and Ang works out what's next for you; name something and Ang does that instead. And every one of them leaves its changes unstaged for you to review, so that nothing reaches your history without your say-so. The only commits Ang makes itself are deletions, and on this page that's just `/retro` archiving a finished epic.

## 🧾 At a glance


| Command            | Run it when                                                    | You get back                                                                            | Next                                                             |
| ------------------ | -------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `/ideate`          | You've dropped something in `raw/`                             | Each thread in `raw/` given a home, and the processed raw files deleted                 | `/refine-ideas`, or `/shape-ideas` for anything fast-tracked     |
| `/refine-ideas`    | An idea has open "is it worth it?" questions                   | One unknown answered with sources, and a verdict on whether it's ready for shaping      | `/refine-ideas` again, or `/shape-ideas` once it's moved         |
| `/shape-ideas`     | A shaping item has open "how could we?" questions              | One unknown answered by a spike, experiment, research or you, and a verdict on planning | `/shape-ideas` again, or `/plan-epic` once it's ready            |
| `/plan-epic`       | Shaping items are `ready-for-planning`, or an epic is mid-plan | An epic folder, then one planning chunk per session                                     | `/plan-epic <epic>` again, or `/break-down-epic` once it's in execution |
| `/break-down-epic` | An epic has just landed in `execution/`                        | Small, ordered draft stories with owners and dependencies                               | `/write-story`                                                   |
| `/write-story`     | A draft story's dependencies are done                          | A spec: done-when evidence, acceptance criteria, and a test plan or a guide             | `/implement-story`                                               |
| `/implement-story` | A story is `ready`                                             | The work, unstaged, with the story marked `implemented`                                 | Stage it, then `/review-story`                                   |
| `/review-story`    | You've staged an implemented story                             | Ranked findings, fixes you picked (unstaged), and the story marked `done`               | The next `/write-story`, or `/retro` when the epic's done        |
| `/retro`           | Every story in the epic is done                                | `10k/` updated, any follow-ups in `raw/`, and the epic archived                         | `/ideate` on whatever's waiting in `raw/`                        |


Run each one in a fresh session. One question per session is what keeps the agent sharp, so treat a new command as a new conversation.

## 💡 /ideate

**Run it when** you've put something in `project-context/raw/`: a brain dump, a ticket, a shower thought. **Pass it** a single raw file if you only want that one processed (`/ideate dark-mode.md`, say). Leave it off and Ang works through everything in `raw/`.

Before Ang reads a word, it checks that your raw files are committed. `/ideate` deletes what it processes and relies on git to keep the originals, so an uncommitted file would be gone for good. If something isn't committed, Ang stops and asks you to commit it. The exception is a sensitive file you'd rather keep out of git: tell Ang that's what it is, and it'll use the file without committing or deleting it ([more on that here](../../concepts/funnel/#-raw-a-place-to-pour-the-mess)).

Next, Ang looks at what's already in flight and at anything in `10k/` that touches the same themes, so that a thread overlapping work you've already started gets folded in rather than duplicated. Then it splits each raw file into its separate threads. If it can't tell why a file is there, it asks you. Each thread gets one proposed landing spot:

- **New idea:** there are real questions about *whether* or *what*. This is the default.
- **Fold in:** it overlaps an item already in flight, so it joins that item.
- **Fast-track to shaping:** you've clearly already decided to do it, and only the *how* is open.
- **Feeds in-flight work:** it's a fact something being shaped, planned or built needs to know.
- **Moonshot:** a long-range vision to keep in mind, never to build head-on. Ang can suggest one, but you have the final say, because some hard things are ones you want tackled now.
- **Park:** doable, but worth nothing until a named wake condition comes true. The entry keeps the raw filename and the commit hash it lives in, so you can dig the original back out. Both of these live in lists covered in [Moonshots and parked work](../../concepts/funnel/#-moonshots-and-parked-work).
- **Trigger:** you know what to do and how, and it's just waiting on a checkable moment. See [Triggers](../../concepts/triggers/).
- **Seed `10k/`:** it's already true and `10k/` is still empty. Ang copies those threads to `raw/seed-10k.md` and points you at `/bootstrap-repo` ([Commands: setup](../../commands/setup/)).
- **Discard:** not worth carrying, with one line on why.

Ang proposes five threads at a time, each with its title, action, goal, why it matters and what finishing it unlocks. You talk them through, change what you like, and once you approve a batch, it shows you the next five. Then it writes the lot: new idea folders with their unknowns in priority order, fold-ins, list entries and triggers, and it deletes the processed raw files.

What you get back is a list of everything it created, folded, fast-tracked, parked or binned, with paths. There's no single next step, because your threads went to different places. Usually it's `/refine-ideas`, or `/shape-ideas` for anything fast-tracked.

## 🔎 /refine-ideas

**Run it when** an idea still has "is this worth doing?" questions. **Pass it** an idea folder or slug (`/refine-ideas dark-mode`) to work on that one.

Leave the argument off and the `prioritiser` agent picks for you. It weighs what the next step is worth to the project against how answerable the top unknown is right now, and it favours ideas that unblock others. Ang tells you the pick and why in two lines, then carries on unless you redirect it. While it's there, it also skims your parked list and mentions any entry whose wake condition looks to have come true.

Then it picks **one** unknown. Usually that's the top one, but if another would move the idea further towards shaping, Ang says why and reorders. It tells you how it plans to answer it: research, asking you, or both. Research is for the landscape (prior art, the market, what people pay today), and you're for the things only you know (your intent, your constraints). Either way it follows the [evidence standard](../../concepts/evidence-standard/), so the answer comes with sources you can check and an honest rating of how far to trust each one.

The findings land in `<idea>/ideas-content/`, the unknown becomes a known, and anything new it turned up gets added as a fresh unknown. Then `stage-gate` gives its verdict. If the idea's ready, it moves to `shaping/`, or gets merged into a matching item that's already there. If not, you get the specific gap to close next.

You get back up to five bullets: what's now known, any new unknowns, the verdict and the session Ang recommends next. Ideas only need to answer their questions *well enough to start shaping*. Ang moves on as early as it honestly can, because hanging around in ideas is exactly the navel gazing it's named after.

## 🧪 /shape-ideas

**Run it when** a shaping item has "how could we do it?" questions. **Pass it** a shaping folder or slug to choose one. Leave it off and the `prioritiser` picks, the same way it does for `/refine-ideas`, and you can redirect it.

Ang picks the unknown that most moves the item towards planning, and proposes how to answer it:

- **A spike or bake-off:** throwaway code in `<item>/spikes/`, built only big enough to answer the question. You agree what success looks like *before* anything gets built, so that the result can't be quietly graded on a curve afterwards.
- **A business experiment:** a landing page, a survey, a price test, some outreach. Ang drafts the materials, and you run anything that needs a human.
- **Desk research,** to the same evidence standard as ideas.
- **Asking you.**

Whichever it is, Ang records the setup, what was measured and the results, and numbers beat impressions every time. Findings land in `<item>/shaping-content/`, every spike gets its own README, and if the answer settled a choice, it's recorded as a decision. If the approach could leave a cheap opening towards one of your moonshots, Ang mentions it, but it won't start building towards it.

Then `stage-gate` gives its verdict. If it's ready, the item is marked `ready-for-planning` but stays in `shaping/`, waiting for `/plan-epic` to group it into an epic.

:::caution[Here be dragons 🐉]
Sometimes the real world won't let you find out what you need to truly answer the question you were searching for. Maybe nobody answered the survey, or your early adopter pulled out. It's not necessarily your fault, but you're now the one who decides what happens next. When this happens, Ang records its best guess as a decision, along with the evidence behind it and the risk you're taking by moving forward the way you've chosen. Then Ang moves on. You both know it's not ideal, but one stubborn unknown can't hold up everything else!

What Ang won't do is guess where it *could* still find out. If a technology hasn't been spiked, Ang won't pick it for you, unless you've made that call yourself. The process is built this way so that you don't end up with an army of Ang agents too terrified of the unknown to move forward, because sometimes the unknown is a reality you have to work with. But equally, Ang won't head into the next phase of development half-cocked.
:::

:::note[Streams on?]
With [streams](../../concepts/streams-and-mail/) switched on, Ang checks at wrap up whether what this session learned changes what another stream is doing, and offers to mail it a note if it does. It only sends with your yes, and most of the time Ang decides there's nothing worth sending, so that other streams don't get spammed with news that doesn't matter to them. Streams can be switched on and off with feature switches, which are explained in [Config](../../reference/config/).
:::

## 🧭 /plan-epic

**Run it when** you've got shaping items marked `ready-for-planning`, or an epic part way through planning. **Pass it** nothing (or `new`) to start an epic, or the epic's folder or slug (`/plan-epic dark-mode`) to carry on with one.

The **first session** is about grouping. Ang looks at everything `ready-for-planning` and proposes **one** epic, made of items that belong together and can be delivered as a unit, plus its type: `technical`, `business` or `mixed`. You agree both. It then creates the epic in `planning/`, folds each item's history in under `origins/`, and merges their open questions into one planning list.

**Every later session** does one chunk: answering a planning unknown (with research, a tiny spike or a question for you), or writing or revising one piece of the plan. What the plan needs depends on the epic's type:

- **Every epic** gets a `plan.md` with scope, what's out of scope, the approach, sequencing and risks, success measures, and candidate ADRs (architecture decision records: the decisions this epic commits you to).
- **Technical and mixed epics** add C4 diagrams in `c4/`, all four levels, each marking what's new, changed or already there, and a test strategy in `plan.md`.
- **Business and mixed epics** add the deliverables (docs, assets, accounts, processes), the tools and services involved, and who does what, you or an agent.

Ang also checks the plan against `10k/`, so that the epic doesn't quietly contradict something you already know to be true. Any conflict gets resolved or listed as a candidate ADR. When the deliverables look complete, `stage-gate` gives its verdict, and if the plan holds up, the epic moves to `execution/`. Next up is `/break-down-epic`.

:::note[Streams on?]
At the gate, Ang checks whether this session's decisions change what another stream is doing, and offers to mail it a note if they do. More in [Streams & mail](../../concepts/streams-and-mail/) and [Config](../../reference/config/).
:::

## 🔪 /break-down-epic

**Run it when** an epic has just moved to `execution/`. **Pass it** the epic's folder or slug if you've got more than one. Leave it off and Ang takes the epic in `execution/` that doesn't have any stories yet.

Ang reads the plan (and, for technical work, the detailed C4 levels) and slices the epic into stories that are:

- **Outcome-focused,** so that each one delivers something you can see working. For code, that's a thin slice end to end where possible. For business work, a concrete result like "mailing list live with double opt-in".
- **Small,** so that each one fits in a single `/implement-story` session.
- **Ordered with the risky stuff first,** so that if something's going to blow up, it blows up before you've built everything else on top of it. Sometimes an epic has work that unavoidably has to be done beforehand. Enabling stories (scaffolding, migrations, account setup) are fine when they're genuinely needed. But in general Ang will always try to avoid a situation where you've implemented 6 stories to completion without seeing an *actual* working result, even if that working result is an early cut of what the larger epic is trying to deliver.

Each story gets an owner (an agent, you, or both), which decides how `/implement-story` goes about building it, and the stories it depends on. Before writing any files, Ang shows you the list, with the number, title, owner, dependencies, a one-line outcome and what each one touches in the plan. You revise it together until you agree, and only then does it create the draft story files in `stories/`.

What you get back is the draft stories and a board showing where everything stands. Review and commit them, then it's `/write-story` in a fresh session.

## 📋 /write-story

**Run it when** there's a draft story whose dependencies are done. **Pass it** a story path to choose one. Leave it off and Ang takes the lowest-numbered draft story whose dependencies are done.

Ang pulls in the parts of the plan the story links to, plus (for code) the existing code it'll touch, and turns the draft into a spec:

- **Done when:** the concrete evidence that proves the story is finished.
- **Acceptance criteria:** short Given/When/Then lines for the main happy and unhappy paths.
- **For code stories:** a test plan (including what it deliberately *won't* test) and implementation notes covering files, edge cases and what's out of scope.
- **For stories you own or share:** a numbered guide for you, what the agent will prepare in advance (copy, configs, checklists), and what to record afterwards. That's where credentials live, never the credentials themselves.

Ang only asks you about genuine ambiguity, and it won't invent requirements to fill gaps, so that the spec says what you actually want and not what an agent imagined you might. The story comes back marked `ready`. Review it, steer any edits, commit it, then run `/implement-story` in a fresh session.

## 🔨 /implement-story

**Run it when** a story is `ready`. **Pass it** a story path to choose one. Leave it off and Ang takes the lowest-numbered ready story whose dependencies are done.

How it works depends on who owns the story:

- **An agent, writing code:** Ang builds it test-first, one acceptance criterion at a time: a failing test, make it pass, tidy up. It finishes by running your project's full test, lint and typecheck commands. Either everything passes, or it tells you exactly what doesn't and why.
- **An agent, making something that isn't code** (a doc, a page of copy, a config): Ang produces it, then checks it against every acceptance criterion.
- **You, or both of you:** Ang prepares everything it can first, then walks you through the guide one step at a time, waiting for you to confirm each one. Afterwards it records the outcome the way the story asks, minus any secrets.

Plans rarely survive the build completely intact. A small deviation gets a line in the story's implementation notes and work carries on. A significant one, anything that changes the plan, the C4 or a decision, makes Ang **stop and ask you**, so that the build never quietly drifts away from what you agreed. If something outside your control stalls the story (waiting on an API key, a client, a vendor), Ang marks it `blocked` with the reason and a date to revisit, rather than leaving it looking like it's in progress.

You get back the files changed, the test results and what Ang thinks you should look at with your own eyes. The story is marked `implemented`, and nothing is staged or committed. Look it over, steer any changes, then **stage it but don't commit**. The next command reviews whatever's staged, and [Your first loop](../../start-here/first-loop/#-8-implement-story-build-it) explains why that's worth the extra step.

:::note[Streams on?]
With [streams](../../concepts/streams-and-mail/) on, Ang checks before it reports whether the story's outcome (especially a deviation or a blocker) changes what another stream is doing, and offers to mail it a note. Streams are switched on in [Config](../../reference/config/).
:::

## 👀 /review-story

**Run it when** you've staged an implemented story. Run it in a fresh session, so that the reviewer isn't the same agent that wrote the work it's judging. **Pass it** a story path to choose one. Leave it off and Ang takes the lowest-numbered `implemented` story.

Ang treats your **staged** changes as the implementation. If nothing's staged (say you committed on autopilot), it stops and asks you what it should be reviewing. For code it runs the tests, then reviews against:

- **Every story:** the done-when evidence is there, the acceptance criteria are met, and it matches the plan.
- **Code:** it fits the C4, follows Ang's engineering defaults (right-sized tests, comments only where there be dragons), has no correctness, security or performance red flags, and every abstraction earns its place.
- **Anything that isn't code:** it's accurate against the evidence it came from, clear for the people it's written for, and leaks no secrets or personal data.

Findings land in a `## Review` section in the story, ranked **must-fix**, **should-fix** and **nit**, each with a file and line. Ang recommends fix or skip for every one, with a one-line reason, then asks which you want fixed. Like any good second opinion, it gives you its view and leaves the decision to you. It applies your picks **unstaged** and re-runs the tests, so that you can compare its fixes (unstaged) against the original work (staged) before you commit.

The story is marked `done`. If it was the last one in the epic, Ang tells you it's `/retro` time. If not, commit and head back to `/write-story` for the next one.

:::note[Streams on?]
With [streams](../../concepts/streams-and-mail/) on, Ang checks whether the review turned up something another stream needs to know, like a must-fix that changes an interface, and offers to mail it a note. Streams are switched on in [Config](../../reference/config/).
:::

## 🧹 /retro

**Run it when** every story in an epic is `done`. **Pass it** the epic's folder or slug if more than one has finished. Ang checks that every story is done before it starts, then moves the epic to `retro/`.

The main job is curating `10k/`. Ang sends agents digging through the epic's whole history, technical and business, for facts that will still matter months from now. Where something contradicts what `10k/` currently says, it comes back resolved to one answer: whatever delivery proved, or a question for you if delivery didn't settle it. It never proposes recording both sides, so that `10k/` stays one clear truth rather than a debate.

Ang proposes `10k/` changes five at a time, each with the doc it touches, the fact and why it'll still matter. Only things that change how future work gets done make the cut, like ADRs that held up in delivery, architecture diagram updates or a refreshed `project-structure.md`. It's spring cleaning for your project's memory: if a fact won't change what anyone does next, it doesn't earn a shelf. Docs are rewritten in place, with no "previously…" history, and each batch is applied once you agree it.

Then the secondary outputs, only when they're genuinely warranted:

- **Follow-ups:** new ideas or knock-on work the epic turned up. Ang lists them first, and only with your yes writes them to `raw/retro-<epic>.md` for your next `/ideate`. It also mentions any parked entry whose wake condition this epic looks to have met.
- **Workflow improvements:** any friction with Ang itself that you agree is worth fixing gets raised as an improvement. That's how you [bend Ang](../../concepts/bending-ang/) to fit how you work.

Ang asks you to review and commit. Once you confirm you have, it deletes the epic folder and commits that deletion itself, with the message `retro: archive <epic> (full context in git history)`. That's not Ang being tidy for the sake of it. The code is now the truth of what was built, `10k/` holds what the code can't say, and git keeps every word of the epic if you ever want it back. [Your first loop](../../start-here/first-loop/#-10-retro-whats-true-now) has the longer version of why.

:::note[Delivery intent or streams on?]
With the delivery intent switched on, the end of an epic is when Ang asks whether your intent still holds. It plays back your goal and stance in a few lines, then either confirms it or helps you put what's changed into words. `10k/intent.md` is left out of the `10k/` proposals, because it's yours. With [streams](../../concepts/streams-and-mail/) on, Ang also checks whether the `10k/` changes you agreed matter to another stream and offers to mail it a note. Both are switched on in [Config](../../reference/config/).
:::

And that's the funnel, top to bottom. Next up: [Commands: library upkeep](../../commands/library-upkeep/), for the commands that keep the library itself in good shape.