# Release notes

Every Ang release has a notes file here, named after its tag: `vX.Y.Z.md`, or `vX.Y.Z-rc.N.md` for a release candidate (`v1.1.0.md`, `v1.0.0-rc.1.md`). The release workflow (`.github/workflows/release.yml`) uses it as the GitHub Release body, and stops before the tests if the tag's file is missing.

Notes are for people deciding whether to install or upgrade: what changed for them and anything they need to do, in Zac's voice. The agent-facing detail an upgrade needs goes in that release's guide in [`releases/upgrades/`](../upgrades/README.md).

`/cut-release` drafts both files and commits them before tagging.

## Template
Short, in Zac's public voice ([voice and attribution](../../project-context/10k/marketing/voice-and-attribution.md)): conversational, a bit funny, an emoji per heading. Fixes and breaking changes stay plain-spoken.

The body has no h1. The docs site's [releases page](https://zacbraddy.github.io/ang/releases/) puts each release under its own version heading, so the notes open with a bold theme line and use `###` sections.

```markdown
**🚀 {a short, slightly cheeky theme for the release}**

{Two or three sentences: what this release is for and why it matters to how you work.}

### ✨ What's new
{A paragraph or a few bullets per theme: what you can now do and how your workflow changes.
Grouped by what it means for the user, not by file.}

### 🔀 What changes for you
{Anything that behaves differently, in plain words. If upgrading needs care, say so and point to /upgrade-ang.}

### 🐛 Fixes
{Only the ones a user would have noticed.}

🟢 Requires Node 26 or later.

### 🔗 Changes in this release
- {commit or PR link}: {one line on what it is}
```
