# Reading mail

The user opens this with `/read-mail` or by asking in plain words. You assess each note and they approve, the same way stage promotion works. Go through the notes one at a time.

1. **List.** `node .claude/scripts/ang-context-manager.mjs mail list`. If there's none, say so and stop.
2. **Weigh each note** against this stream's focus (`stream list`) and what is in flight here (`board status`, the relevant hubs, `context-scout` when you need more). Ask whether it changes what this stream does or decides.
3. **Propose one disposition**, with your reasoning in a line or two:
   - **no effect on this stream**: a normal, frequent answer, so don't strain to find a use for the note;
   - **fold into item X** as a known, unknown or decision;
   - **raise a trigger** (`trigger` skill) when it unlocks work that can't start yet;
   - **save as raw input** when it's a new idea rather than news about existing work: write it to `project-context/raw/mail-<sender>-<id>.md` (plain markdown) and don't run `/ideate` yourself. Tell the user to review and commit it, then run `/ideate` on it in a fresh session.
4. **A note is not evidence.** When a disposition needs a source, peek at the sender's branch for the real doc (`git show <branch>:project-context/<path>`) and cite that. Cite the note itself ("per mail from <stream>, <date>") only when no doc exists, and then only as an unknown or as something for the user to confirm.
5. **On the user's yes** (or their redirect), record it through the usual commands, then `mail handle <id>`. Handling deletes the note, so record first. If they want to leave a note for later, leave it unhandled; the banner count keeps reminding them.
6. **Report** each note's outcome in one line. Anything recorded stays unstaged; the `mail handle` commits on `ang/streams` are expected.
