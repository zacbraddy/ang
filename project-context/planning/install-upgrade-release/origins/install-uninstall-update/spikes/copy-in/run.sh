#!/usr/bin/env bash
# Copy-in bake-off: degit vs giget, into an empty repo and an existing project.
# Usage: run.sh <scratch-dir>
set -u
SCRATCH=${1:?scratch dir}
SRC=zacbraddy/ang/src
rm -rf "$SCRATCH" && mkdir -p "$SCRATCH"

make_existing() {
  local d=$1
  mkdir -p "$d/.claude/rules" "$d/.claude/skills/mine"
  git -C "$d" init -q
  echo '{"permissions":{"allow":["Bash(npm test)"]}}' > "$d/.claude/settings.json"
  echo '# my rule' > "$d/.claude/rules/x.md"
  echo '# my skill' > "$d/.claude/skills/mine/SKILL.md"
  echo '# My project' > "$d/CLAUDE.md"
  echo 'node_modules' > "$d/.gitignore"
  ( cd "$d" && find . -path ./.git -prune -o -type f -print | sort | xargs sha256sum ) > "$d.before"
}

install() {
  local tool=$1 d=$2 flags=$3
  local t0=$(date +%s.%N)
  case $tool in
    degit) ( cd "$d" && npx -y degit@3.10.1 $flags $SRC . ) ;;
    giget) ( cd "$d" && npx -y giget@3.3.1 gh:$SRC . $flags ) ;;
  esac
  local rc=$?
  echo "exit=$rc seconds=$(echo "$(date +%s.%N) - $t0" | bc)"
}

check() {
  local d=$1
  ( cd "$d"
    echo "files: $(find . -path ./.git -prune -o -type f -print | wc -l)"
    echo "local files: $(find . -name '*.local.*' | wc -l)"
    echo "conventions doc: $(test -f project-context/README.md && echo yes || echo no)"
    echo "tests shipped: $(find . -name '*.test.mjs' | wc -l)"
    echo "docs/ shipped: $(test -d docs && echo yes || echo no)"
    node .claude/scripts/ang-context-manager.mjs library init >/dev/null 2>&1; echo "library init exit=$?"
    node .claude/scripts/ang-context-manager.mjs library validate >/dev/null 2>&1; echo "library validate exit=$?"
  )
  if [ -f "$d.before" ]; then
    echo "user files changed:"
    ( cd "$d" && sha256sum -c "$d.before" 2>/dev/null | grep -v ': OK$' ) || echo "  none"
  fi
}

for tool in degit giget; do
  e="$SCRATCH/$tool-empty"; mkdir -p "$e"; git -C "$e" init -q
  echo "== $tool / empty"; install $tool "$e" ""; check "$e"

  x="$SCRATCH/$tool-existing"; make_existing "$x"
  echo "== $tool / existing, no force"; install $tool "$x" ""; check "$x"
  echo "== $tool / existing, force"; install $tool "$x" "--force"; check "$x"
done
