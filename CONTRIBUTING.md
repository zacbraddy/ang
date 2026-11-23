# 🍴 Contributing to Ang

Ang is mine. That's not me being precious, it's the whole design: Ang is built to be forked and bent. The expected route is to take your own copy and make it yours with `/raise-workflow-improvement` and `/improve-workflow`, so that you get the framework you want without waiting on me.

Small fixes (typos, broken links, a script that falls over) are welcome as PRs, but I'm one person keeping this going alongside paid work, so there are no promises on when, or whether, I'll merge them.

Got something bigger? Start with a chat, so that we can work through your idea together and decide whether it belongs upstream before you sink time into it:
- **Questions and general chat:** [Discussions](https://github.com/zacbraddy/ang/discussions).
- **Something on your mind about Ang:** [open an issue](https://github.com/zacbraddy/ang/issues/new/choose) with the *Open a conversation* template.
- **A change you think every Ang user needs:** the *Feature request* template, and then a PR. Both ask the same few questions, which are there to help you make the case, not to trip you up.

## 🔨 The dev loop

`npm ci` installs the dependencies and a pre-commit hook, which runs lint-staged to auto-fix what it can in your staged files. `npm test`, `npm run lint` and `npm run format:check` are what CI runs on every PR. CI reports, it doesn't block, so a red check is a heads-up rather than a closed door.
