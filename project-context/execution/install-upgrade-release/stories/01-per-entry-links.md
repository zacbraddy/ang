---
title: Per-entry links for repo-only tooling
shortDescription: Root .claude/skills and .claude/agents become real folders of per-entry links into src/, kept honest by a link script and a drift test
tags: [repo-structure, distribution]
status: ready
owner: agent
dependsOn: []
---
# Per-entry links for repo-only tooling

## Summary
Repo-only skills, agents and scripts (`/cut-release`, `release-scout`, `release-manifest`) need a home in the Ang repo that never ships. This story turns the root `.claude/skills` and `.claude/agents` into real folders holding one relative link per `src/` entry, and adds a root `scripts/` folder with the link script and its drift test (d24, decision 24 in the epic's `state.json`).

## Outcome
Every shipped skill and agent still resolves from the repo root exactly as before. `scripts/link-entries.mjs` creates missing links and removes dangling ones, and is a no-op on re-run. `scripts/link-entries.test.mjs` fails on a missing or dangling link. `.claude/scripts` stays a whole-folder link.

## Rough scope
- `planLinks(srcDir, rootDir)` and `applyLinks(plan)`; anything at the root that isn't a link is repo-only and left alone.
- The drift test runs `planLinks` over the real repo and expects an empty plan.
- Convert the current whole-folder links in one pass with the script.

## Done when
- `.claude/skills` and `.claude/agents` at the repo root are real folders. Git stores each entry inside them as a symlink (mode 120000) to its `src/.claude/` twin, and `.claude/scripts` is still one whole-folder link.
- `node scripts/link-entries.mjs` prints that nothing changed when run on the converted repo.
- `node --test 'scripts/*.test.mjs'` passes. It fails if you delete one link or add a dangling one.
- `node --test 'src/.claude/**/*.test.mjs'` still passes, and a fresh session still lists every shipped skill and agent.

## Acceptance criteria
- Given a `src/` entry with no root link, when `planLinks` runs, then the entry is in `create`.
- Given a root link whose `src/` entry is gone, when `planLinks` runs, then it is in `remove`.
- Given a root link that points somewhere other than its `src/` twin, when `planLinks` runs, then it is in both `remove` and `create`.
- Given a real file or folder at the root (a repo-only entry such as `cut-release`), when `planLinks` runs, then it is left alone.
- Given a repo-only entry with the same name as a `src/` entry, when `planLinks` runs, then it is reported in `conflicts` and nothing is created over it.
- Given folder entries (skills) and file entries (agents), when `applyLinks` runs, then both get relative links that resolve.
- Given a repo already in sync, when the script runs again, then the plan is empty and nothing on disk changes.
- Given the real repo, when the drift test runs, then `create`, `remove` and `conflicts` are all empty.

## Test plan
- **Unit** (`scripts/link-entries.test.mjs`, `node:test`, temp dirs from `fs.mkdtempSync`, cleaned up in `after()`): one test per acceptance line above. Each builds a fake `src/.claude/{skills,agents}` and a fake root.
- **Drift test** (same file): runs `planLinks` over the real repo and expects an empty plan. It finds the repo root from `import.meta.url`, not from the working directory.
- **Won't test**: the command-line wrapper's output and argument handling (it fails loudly), or how the filesystem behaves with symlinks.

## Implementation notes
- **Files**: new root `scripts/link-entries.mjs` and `scripts/link-entries.test.mjs` (c4/4-code.md, "repo-only"). Nothing under `src/` changes, so nothing ships.
- **`planLinks(srcDir, rootDir) → { create, remove, conflicts }`**: walks `skills` and `agents` under both sides. Entries are each skill's folder and each agent's `.md` file. Use `lstat` on the root side. Only symlinks count as managed, and anything else is repo-only (d24, k16). The names are working names, and `conflicts` is added to the C4 shape here.
- **`applyLinks(plan)`**: removes, then creates. A link's target is relative to the folder it sits in, e.g. `.claude/skills/kill → ../../src/.claude/skills/kill`. It never touches non-links.
- **CLI** (command-line wrapper): when run directly, it plans and applies against the repo root and prints one line per change, or that nothing changed. It exits non-zero on conflicts.
- **One-off conversion**: `git rm` the two whole-folder links `.claude/skills` and `.claude/agents`, create real folders in their place, then run the script once. The script itself doesn't handle "root folder is a link", because after this story that never happens.
- **Edge cases**: a gitignored `*.local.md` agent in `src/` gets a root link whose name is also gitignored, which is fine. `rules`, `output-styles`, `ang` and `settings.json` stay whole-folder links, because d24 covers only skills and agents.
- **Out of scope**: wiring the test into the release job (story 08, which needs an explicit glob, because bare `node --test` skips dot-folders and finds no `scripts/` tests on its own), the `/cut-release` preflight warning (story 10) and updating `10k/technical/project-structure.md` (deferred to `/retro` per plan.md).

## Related
- [Plan: scope and sequencing](../plan.md)
- [C4 components: repo-only release tooling](../c4/3-components.md)
- [C4 code: repo-only](../c4/4-code.md)
