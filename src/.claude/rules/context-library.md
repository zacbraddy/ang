# Project context library

This workflow is **Ang**, the workflow framework this project runs on: the stages, commands, skills, agents, `ang-context-manager.mjs` and these rules. Ang stands for *Avoid Navel Gazing*; write it as a name, Ang, not as a capitalised acronym.

All project knowledge, technical and business, lives in `project-context/`. Conventions are in `project-context/README.md`; read only the section you need.

## Reading
- `10k/` is current truth. Every other stage is in flight and provisional.
- Before any task that needs project context, spawn `context-scout` and work from its summary and links.
- Beyond that: load only linked docs, read Summary sections before whole docs, and follow at most 5 link hops per question. Still stuck? Spawn `context-scout` for a wide search (tags + every `index.json`) rather than searching yourself.
- Navigate with `jq`/`grep` over `index.json`, `tags.json` and `state.json`. Never bulk-read folders.

## Writing
- Every doc gets frontmatter (`title`, `shortDescription`, `tags`), opens with `## Summary` and ends with `## Related`.
- Hubs (`README.md` in an item) are signposts only. Item progress lives in `state.json` and story status lives in story frontmatter.
- Script-managed, never hand-edited: `index.json`, `state.json` and `triggers.json`. Use `node .claude/scripts/ang-context-manager.mjs` (`--help` lists its commands). Finish every workflow command with `ang-context-manager.mjs library validate` and fix what it reports. A `🤔 needs judgement` trigger's custom conditions are questions to check, not passes: mention it to the user as ready only if they all hold.
- Links inside an item folder are relative. All other links start with `/project-context/`.
- Reuse tags from `tags.json`. Add one with `ang-context-manager.mjs tag add` only when none fit.
- Document only what matters beyond this session. Replace outdated content, state entries included (`state replace`), never add one saying "Replaces X"; git is the history.
- Spell out every abbreviation and coined label the first time it appears in a reply or doc, e.g. "ET 1 (evidence tier 1: a primary source)". Bare register keys and acronyms are where the user loses the thread.
- Never write secrets (logins, API keys, customer personal data) anywhere in the repo.

## Git
Workflow commands leave changes unstaged for the user to review and commit. Exceptions: the deletion commits in `/kill` and `/retro`.

## Workflow friction
If you notice the workflow itself causing problems, or the user seems frustrated with how a workflow command played out, ask: "Want me to raise that as a workflow improvement?" If they say yes, invoke `raise-workflow-improvement` with a concrete description: what happened, which command or file, and what would have been better.
