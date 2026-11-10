**In step 3:** leave `10k/intent.md` out of the proposals. It is the user's delivery intent, not a delivered fact, and the check-in below is where it gets checked.

**After step 4, delivery intent check-in:** an epic ending is the natural moment to ask whether the user's intent still holds, and this is one of only two places that ask. Play it back in a few lines: the goal, the stance, and any *holds until* condition this epic looks to have reached. Then ask whether it still holds.
- **Yes:** set its `confirmed:` frontmatter to today.
- **No:** help them put what has changed into words, rewrite the doc in its shape (`.claude/ang/features/intent/conventions.md`), and set `confirmed:` to today. The content is theirs; your part is the wording.
