#!/bin/sh
# Spike prototype of Ang's install.sh. Real one lives at the repo root, outside src/.
# Usage: curl -fsSL https://raw.githubusercontent.com/zacbraddy/ang/<ref>/install.sh | sh
#        ... | sh -s -- <ref>   (override the pinned ref)
set -eu

REPO=zacbraddy/ang
# A release stamps its own tag here before tagging, so the script fetched from a tag installs that tag.
REF="${1:-cd1b825}"
GIGET=giget@3.3.1

command -v node >/dev/null 2>&1 || { echo "Ang needs node (with npm/npx). Install it and re-run." >&2; exit 1; }
[ -d .git ] || echo "Note: not at a git repo root; installing into $(pwd) anyway." >&2

# Resolve the ref to a full SHA first, then install that SHA, so files and record can't disagree if a branch moves.
SHA=$(node -e '
fetch(`https://api.github.com/repos/${process.argv[1]}/commits/${process.argv[2]}`, { headers: { accept: "application/vnd.github.sha" } })
  .then(r => r.ok ? r.text() : Promise.reject(new Error(`GitHub said ${r.status} for ref ${process.argv[2]}`)))
  .then(s => process.stdout.write(s.trim()))
  .catch(e => { console.error(e.message); process.exit(1) })' "$REPO" "$REF")

SETTINGS=.claude/settings.json
BACKUP=.claude/settings.json.pre-ang
USER_SETTINGS=""
if [ -f "$SETTINGS" ]; then
  node -e 'JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"))' "$SETTINGS" \
    || { echo "$SETTINGS isn't valid JSON; fix it and re-run. Nothing was changed." >&2; exit 1; }
  # Keep the first backup only: a re-run must not replace the user's original with an already-merged file.
  [ -f "$BACKUP" ] || cp "$SETTINGS" "$BACKUP"
  USER_SETTINGS=$(mktemp)
  cp "$SETTINGS" "$USER_SETTINGS"
fi

# </dev/null: under `curl | sh` the script itself is on stdin, and a child that reads stdin would eat the rest of it.
npx -y "$GIGET" "gh:$REPO/src#$SHA" . --force </dev/null

if [ -n "$USER_SETTINGS" ]; then
  node - "$USER_SETTINGS" "$SETTINGS" <<'EOF'
const fs = require("fs");
const [userPath, angPath] = process.argv.slice(2);
const user = JSON.parse(fs.readFileSync(userPath, "utf8"));
const ang = JSON.parse(fs.readFileSync(angPath, "utf8"));
const isObj = v => v && typeof v === "object" && !Array.isArray(v);
// The user's values win; Ang only adds what's missing. Arrays become the union, user's entries first.
const merge = (u, a) => {
  if (Array.isArray(u) && Array.isArray(a)) {
    const seen = new Set(u.map(x => JSON.stringify(x)));
    return [...u, ...a.filter(x => !seen.has(JSON.stringify(x)))];
  }
  if (isObj(u) && isObj(a)) {
    const out = { ...u };
    for (const k of Object.keys(a)) out[k] = k in u ? merge(u[k], a[k]) : a[k];
    return out;
  }
  return u;
};
fs.writeFileSync(angPath, JSON.stringify(merge(user, ang), null, 2) + "\n");
EOF
  rm -f "$USER_SETTINGS"
  echo "Merged Ang's settings into yours. Your original is at $BACKUP." >&2
fi

node -e '
const [ref, sha] = process.argv.slice(1);
require("fs").writeFileSync(".claude/ang/version.json",
  JSON.stringify({ ref, sha, installedAt: new Date().toISOString() }, null, 2) + "\n");' "$REF" "$SHA"

echo "Ang installed from $REPO at $REF ($SHA)." >&2
