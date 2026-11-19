# Upgrade guides

Every Ang release has an upgrade guide here, `vX.Y.Z.md` named after its tag (`v1.1.0.md`, `v1.0.0-rc.1.md`). `/upgrade-ang` reads them with `ang-context-manager.mjs upgrade guides --from <installed> --to <target>`, which starts at the target's guide and follows each `from:` line back to the installed tag. Every guide is read as it stands at the target tag, so fixing an old guide in a later release fixes it for every upgrade to that release onwards.

A guide that doesn't parse, or a `from:` line that skips or loops, stops every upgrade that crosses it. `/cut-release` checks the new guide before tagging, with `node scripts/draft-guides.mjs <previous tag> <new tag>`: it chains the guides in this folder as they stand on disk, the same way `upgrade guides` does at the target tag.

## Format
1. **Title line:** `# Upgrade guide vX.Y.Z`, the exact tag the file is named after.
2. **`from:` line:** the tag of the release before this one. The first release's guide says `from: none`.
3. **Four headings**, each exactly once, in this order:
   - `## Moves`: files Ang renamed or moved since the previous release, so the user's edits follow them.
   - `## Migrations`: one-off steps an upgrade runs or asks the user to run, such as reshaping a config file.
   - `## Retired`: names, wording or files Ang dropped, so the merge can flag local text that still uses them.
   - `## Notes for the merge`: anything else the merge should know about this release.

Under each heading:
- Every entry is a `- ` line. Indented lines after it continue that entry, so long entries can wrap. Blank lines are ignored.
- A heading with nothing to say holds the single entry `- None`. An empty heading is an error.
- A move is `` - `old/path` -> `new/path` `` with an optional `: note`. Paths are relative to the repo root of a project Ang is installed in, such as `.claude/ang.json`.

## Template
```markdown
# Upgrade guide vX.Y.Z
from: vX.Y.W
## Moves
- None
## Migrations
- None
## Retired
- None
## Notes for the merge
- None
```

## Example
```markdown
# Upgrade guide v1.1.0
from: v1.0.0
## Moves
- `.claude/ang.json` -> `ang.json`: carry every key the user set across to the new file.
## Migrations
- None
## Retired
- "testing rules" wording: replaced by `engineering-defaults.md`. Flag local text that still uses it.
## Notes for the merge
- None
```
