# Release notes

Every Ang release has a notes file here, named after its tag: `vX.Y.Z.md`, or `vX.Y.Z-rc.N.md` for a release candidate (`v1.1.0.md`, `v1.0.0-rc.1.md`). The release workflow (`.github/workflows/release.yml`) uses it as the GitHub Release body, and stops before the tests if the tag's file is missing.

Notes are for people deciding whether to install or upgrade: what changed for them and anything they need to do, in Zac's voice. The agent-facing detail an upgrade needs goes in that release's guide in [`releases/upgrades/`](../upgrades/README.md).

`/cut-release` drafts both files and commits them before tagging.
