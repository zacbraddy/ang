#!/usr/bin/env bash
# Runs install.sh (piped, as a user would) into an empty repo and an existing project, twice each.
# Usage: run.sh <scratch-dir> [ref]
set -u
SCRATCH=${1:?scratch dir}
REF=${2:-cd1b825}
HERE=$(cd "$(dirname "$0")" && pwd)
EXPECTED_SHA=$(git -C "$HERE" rev-parse "$REF")
rm -rf "$SCRATCH" && mkdir -p "$SCRATCH"

make_existing() {
  local d=$1
  mkdir -p "$d/.claude/rules" "$d/.claude/skills/mine"
  git -C "$d" init -q
  cat > "$d/.claude/settings.json" <<'EOF'
{
  "outputStyle": "Explanatory",
  "model": "opus",
  "permissions": { "allow": ["Bash(npm test)"], "deny": ["Read(.env)"] },
  "hooks": { "Stop": [{ "hooks": [{ "type": "command", "command": "echo mine" }] }] }
}
EOF
  echo '# my rule' > "$d/.claude/rules/x.md"
  echo '# my skill' > "$d/.claude/skills/mine/SKILL.md"
  echo '# My project' > "$d/CLAUDE.md"
}

install() {
  local d=$1 t0=$(date +%s.%N)
  ( cd "$d" && sh -s -- "$REF" < "$HERE/install.sh" ) > "$d.log" 2>&1
  echo "exit=$? seconds=$(echo "$(date +%s.%N) - $t0" | bc)"
}

check() {
  local d=$1
  ( cd "$d"
    echo "install.sh in tree: $(find . -name install.sh | wc -l)"
    node .claude/scripts/ang-context-manager.mjs library init >/dev/null 2>&1; echo "library init exit=$?"
    node .claude/scripts/ang-context-manager.mjs library validate >/dev/null 2>&1; echo "library validate exit=$?"
    echo "version record: $(node -p 'const v=require("./.claude/ang/version.json"); `ref=${v.ref} sha=${v.sha}`' 2>&1)"
    node -p 'require("./.claude/ang/version.json").sha' 2>/dev/null | grep -qx "$EXPECTED_SHA" && echo "sha matches ref: yes" || echo "sha matches ref: NO"
    echo "backup exists: $(test -f .claude/settings.json.pre-ang && echo yes || echo no)"
  )
}

e="$SCRATCH/empty"; mkdir -p "$e"; git -C "$e" init -q
echo "== empty, run 1"; install "$e"; check "$e"

x="$SCRATCH/existing"; make_existing "$x"
cp "$x/.claude/settings.json" "$SCRATCH/user-original.json"
echo "== existing, run 1"; install "$x"; check "$x"
echo "-- backup identical to user's original: $(cmp -s "$x/.claude/settings.json.pre-ang" "$SCRATCH/user-original.json" && echo yes || echo NO)"
echo "-- merged settings:"; cat "$x/.claude/settings.json"
sha256sum "$x/.claude/settings.json" "$x/.claude/settings.json.pre-ang" > "$SCRATCH/after-run1"

echo "== existing, run 2"; install "$x"; check "$x"
echo "-- settings and backup unchanged by re-run: $(sha256sum -c "$SCRATCH/after-run1" >/dev/null 2>&1 && echo yes || echo NO)"
