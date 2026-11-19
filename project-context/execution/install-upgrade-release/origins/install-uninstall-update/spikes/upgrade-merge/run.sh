#!/usr/bin/env bash
# Installs Ang at BASE into a fake project, makes local workflow improvements, then upgrades to TARGET.
# Runs twice: with the version record, and with it deleted.
# Usage: run.sh <scratch-dir> [base-ref] [target-ref]
set -eu
SCRATCH=${1:?scratch dir}
BASE=${2:-d1c64e3}
TARGET=${3:-HEAD}
HERE=$(cd "$(dirname "$0")" && pwd)
REPO=$(git -C "$HERE" rev-parse --show-toplevel)
BASE_SHA=$(git -C "$REPO" rev-parse "$BASE")
rm -rf "$SCRATCH" && mkdir -p "$SCRATCH"

# The install route itself was spiked in spikes/install-script; a local git archive stands in for giget.
install_at_base() {
  local d=$1
  mkdir -p "$d" && git -C "$d" init -q
  git -C "$REPO" archive "$BASE_SHA" src | tar -x -C "$d" --strip-components=1
  echo "{ \"ref\": \"$BASE\", \"sha\": \"$BASE_SHA\", \"installedAt\": \"2026-11-10T00:00:00Z\" }" > "$d/.claude/ang/version.json"
  mkdir -p "$d/project-context/ideas" && echo '# my idea' > "$d/project-context/ideas/mine.md"
  echo '# My project' > "$d/CLAUDE.md"
}

improve_locally() {
  local d=$1 c=$d/.claude
  # 1. Skill upstream also changed, edited away from upstream's hunk.
  perl -0pi -e 's/(     - no secrets or personal data committed\.\n)/$1     - screenshots attached for UI changes.\n/' "$c/skills/review-story/SKILL.md"
  # 1b. Same skill, a line that still says "my testing rules" - wording upstream retired elsewhere.
  perl -0pi -e 's/(Re-run the tests\.)/$1 Fixes follow my testing rules too./' "$c/skills/review-story/SKILL.md"
  # 2. Skill upstream also changed, edited on upstream's own line.
  perl -0pi -e 's/\(per my testing rules\)/(per my testing rules; name the fixtures)/' "$c/skills/write-story/SKILL.md"
  # 3. File upstream never touched.
  printf '\n## Local\nAlways list the stories that slipped.\n' >> "$c/skills/retro/SKILL.md"
  # 4. New local rule.
  printf '# Team conventions\nPRs need two reviewers.\n' > "$c/rules/team-conventions.md"
  # 5. Script upstream also changed, local addition at the end.
  printf '\n// Local: count docs missing a Related section.\nexport function missingRelated(docs) {\n  return docs.filter((d) => !d.includes("## Related")).length;\n}\n' >> "$c/scripts/ang/library/validate.mjs"
  # 6. Config upstream deleted, edited locally.
  echo '{ "intent": true, "streams": true, "host": "orca" }' > "$c/ang.json"
}

run_case() {
  local name=$1 d=$SCRATCH/$1
  install_at_base "$d"
  improve_locally "$d"
  [ "$name" = no-record ] && rm "$d/.claude/ang/version.json"
  echo "=== $name ==="
  node "$HERE/upgrade.mjs" "$d" "$REPO" "$TARGET" --apply | tee "$SCRATCH/$name.json"
  ( cd "$d" && node .claude/scripts/ang-context-manager.mjs library init >/dev/null 2>&1; echo "library init exit=$?"
    node --test .claude/scripts 2>&1 | grep -E '^# (pass|fail)' | tr '\n' ' '; echo
    echo "conflict markers in: $(grep -rl '^<<<<<<< local' .claude | tr '\n' ' ')" )
}

run_case with-record
run_case no-record
