#!/usr/bin/env bash
# Upgrades .claude/settings.json across four user scenarios with merge.mjs and checks the outcome.
# base: the shipped src/.claude/settings.json as it stood at 6cf9987 (pinned: it later dropped Bash(jq:*)); target: base with a changed hook command, a dropped and an added
# permission, a new hook event and a renamed outputStyle.
# Usage: run.sh <scratch-dir>
set -eu
S=${1:?scratch dir}
HERE=$(cd "$(dirname "$0")" && pwd)
REPO=$(git -C "$HERE" rev-parse --show-toplevel)
rm -rf "$S" && mkdir -p "$S"
git -C "$REPO" show 6cf9987:src/.claude/settings.json > "$S/base.json"
exec node "$HERE/scenarios.mjs" "$S" "$HERE/merge.mjs"
