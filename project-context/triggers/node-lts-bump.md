---
title: Bump Ang's minimum Node to the new LTS
shortDescription: Raise the Node minimum to the newest long-term support release everywhere Ang names it, then set this trigger for next year
tags: [tech-stack, distribution]
---
# Bump Ang's minimum Node to the new LTS

## Summary
Ang's minimum supported Node is the current LTS (long-term support) release, bumped each year once the new one is promoted (open-source hygiene's d11, k9 in the install-upgrade-release epic). This trigger does that bump, then sets itself up for the following year.

## Why now, not sooner or later
Node promotes a new even-numbered major to LTS in late October, so the date condition sits just after it. Before that there's nothing to bump to. Doing it as a trigger keeps a once-a-year date check out of `/cut-release`, where it would run on every release.

## What to do
1. Find the newest LTS major: `curl -fsSL https://nodejs.org/dist/index.json | jq -r '[.[] | select(.lts)][0].version'`. If it's still the current minimum, the promotion is late: re-point this trigger a couple of weeks on with `trigger repoint` and stop.
2. Raise the minimum everywhere it's named. Last known places (grep for the old major to catch new ones):
   - `.github/workflows/release.yml`: `node-version`;
   - `install.sh`: the Windows hint, the missing-node and version checks, and the npx hint;
   - `src/.claude/skills/upgrade-ang/SKILL.md`: the Node and npx checks;
   - `releases/notes/README.md`: the template's "Requires Node" line;
   - the README's and docs' install prerequisites, `engines` and `.node-version` if they exist by then.
3. Run `node --test 'src/.claude/**/*.test.mjs' 'scripts/*.test.mjs'` on the new Node.
4. Note the bump for the next release's notes: it's a change users must act on.
5. Don't remove this trigger: re-point it to next year, `trigger repoint node-lts-bump after:<next year>-11-01`, which keeps this doc. Leave the changes unstaged for Zac.

## Signs it's already handled
- `release.yml`'s `node-version` and `install.sh`'s version check already name the newest LTS major.

## Related
- [Install, upgrade and release plan](/project-context/execution/install-upgrade-release/plan.md)
- [Release process proposal](/project-context/execution/install-upgrade-release/release-process-proposal.md)
