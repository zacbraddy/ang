#!/bin/sh
# Installs Ang into the git repo you run it from. Use the release asset:
#   curl -fsSL https://github.com/zacbraddy/ang/releases/latest/download/install.sh | sh
#   … | sh -s -- <tag>   installs that release instead
set -eu

# The release workflow stamps these two lines in the release asset; the repo copy leaves them empty.
TAG=""
SHA=""

REPO=zacbraddy/ang
GIGET=giget@3.3.1
ONE_LINER="curl -fsSL https://github.com/$REPO/releases/latest/download/install.sh | sh"
API="${ANG_GITHUB_API:-https://api.github.com}"

TMP=""
trap '[ -z "$TMP" ] || rm -rf "$TMP"' EXIT
trap 'exit 1' INT TERM

die() {
  printf '✖ %s\n' "$1" >&2
  shift
  for line in "$@"; do printf '  %s\n' "$line" >&2; done
  exit 1
}

require_target() {
  [ $# -gt 0 ] || [ -n "$TAG" ] || die "This copy of install.sh isn't tied to a release." "Install the latest release with:" "$ONE_LINER"
}

# A tag argument overrides the stamp and is resolved to its commit SHA; a stamped copy needs no API call.
resolve_target() {
  [ $# -gt 0 ] || return 0
  TAG="$1"
  SHA=$(fetch_sha)
}

# node's fetch rather than curl and jq, so node is the only prerequisite.
fetch_sha() {
  node - "$API" "$REPO" "$TAG" <<'JS'
const [api, repo, tag] = process.argv.slice(2);
const stop = (what, fix) => { console.error(`✖ ${what}\n  ${fix}`); process.exit(1); };
const notPublished = () => stop(`${tag} isn't a published Ang release.`, `Pick a tag from https://github.com/${repo}/releases and re-run.`);
async function get(url, accept) {
  let res;
  try {
    res = await fetch(url, { headers: { accept, 'user-agent': 'ang-install' } });
  } catch (error) {
    stop(`Couldn't reach GitHub to look up ${tag}: a network problem (${error.cause?.code ?? error.message}).`, 'Check your connection, proxy or VPN and re-run.');
  }
  if ([403, 429].includes(res.status) && res.headers.get('x-ratelimit-remaining') === '0') {
    stop("GitHub's API rate limit for your IP address is used up (60 requests an hour without a login).", 'Wait for it to reset, or re-run from another network.');
  }
  if (res.status === 404) notPublished();
  if (!res.ok) stop(`GitHub answered ${res.status} while looking up ${tag}.`, 'Re-run in a minute; if it persists, check https://www.githubstatus.com.');
  return res;
}
const release = await (await get(`${api}/repos/${repo}/releases/tags/${encodeURIComponent(tag)}`, 'application/vnd.github+json')).json();
if (release.draft) notPublished();
const sha = (await (await get(`${api}/repos/${repo}/commits/${encodeURIComponent(tag)}`, 'application/vnd.github.sha')).text()).trim();
if (!/^[0-9a-f]{40}$/.test(sha)) stop(`GitHub didn't return a commit SHA for ${tag}.`, 'Re-run in a minute.');
process.stdout.write(sha);
JS
}

check_prereqs() {
  case "$(uname -s)" in
    MINGW* | MSYS* | CYGWIN*) die "Ang on Windows runs inside WSL, not Git Bash, MSYS or Cygwin." "Set up WSL (wsl --install in PowerShell), install Node.js 26+ inside it, then run the install from your project in a WSL shell." ;;
  esac
  command -v node >/dev/null 2>&1 || die "Ang needs Node.js 26 or newer, and node isn't on your PATH." "Install Node.js 26+ (it comes with npx) and re-run."
  version=$(node -p 'process.versions.node')
  [ "${version%%.*}" -ge 26 ] || die "Ang needs Node.js 26 or newer; this is $version." "Upgrade Node.js and re-run."
  command -v npx >/dev/null 2>&1 || die "Ang needs npx, and it isn't on your PATH." "It ships with npm: install Node.js 26+ with npm and re-run."
}

check_repo() {
  ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || die "This folder isn't in a git repo." "Run the install from a git repo's root."
  [ "$ROOT" = "$(pwd -P)" ] || die "This is a subfolder of a git repo." "cd $ROOT and re-run."
}

check_clean() {
  [ -z "$(git status --porcelain)" ] || die "The working tree has uncommitted or untracked changes." "Commit or stash them so you get a clean working tree, then re-run; that way the install is one reviewable diff."
}

check_not_installed() {
  [ ! -e .claude/ang/version.json ] || die "Ang is already installed here (.claude/ang/version.json exists)." "To move to a newer release, run /upgrade-ang in Claude Code."
}

check_settings() {
  [ -f .claude/settings.json ] || return 0
  node -e 'JSON.parse(require("fs").readFileSync(".claude/settings.json", "utf8"))' 2>/dev/null \
    || die ".claude/settings.json isn't valid JSON." "Fix it (or move it aside) and re-run."
}

download() {
  TMP=$(mktemp -d)
  echo "Downloading Ang $TAG ($SHA)…"
  # </dev/null: under `curl | sh` the rest of this script is on stdin, and a child that reads stdin would eat it.
  npx -y "$GIGET" "gh:$REPO/src#$SHA" "$TMP/src" --force </dev/null >/dev/null \
    || die "The download failed: giget couldn't fetch $REPO/src at $SHA." "Nothing was changed. Check your connection and re-run."
}

check_collisions() {
  collisions=$(
    cd "$TMP/src"
    [ ! -e "$ROOT/project-context" ] || echo "  project-context/"
    # Claude Code finds skills by folder name, so a same-named skill clashes even if no file does.
    for skill in .claude/skills/*/; do
      [ ! -e "$ROOT/$skill" ] || echo "  $skill"
    done
    find . -type f | sed 's|^\./||' | sort | while IFS= read -r file; do
      case "$file" in
        .claude/settings.json | project-context/* | .claude/skills/*) ;;
        *) [ ! -e "$ROOT/$file" ] || echo "  $file" ;;
      esac
    done
  )
  [ -z "$collisions" ] || die "These paths already exist, and installing Ang would overwrite them:
$collisions" "Move or rename them, commit, and re-run."
}

copy_in() {
  mv "$TMP/src/.claude/settings.json" "$TMP/theirs.json"
  cp -R "$TMP/src/." "$ROOT"
}

ang() {
  CLAUDE_PROJECT_DIR="$ROOT" node "$ROOT/.claude/scripts/ang-context-manager.mjs" "$@"
}

merge_settings() {
  if [ -f .claude/settings.json ] && [ ! -e .claude/settings.json.pre-ang ]; then
    cp .claude/settings.json .claude/settings.json.pre-ang
    echo "Backed up your .claude/settings.json to .claude/settings.json.pre-ang."
  fi
  ang settings merge --base none --ours .claude/settings.json --theirs "$TMP/theirs.json" >"$TMP/conflicts.json"
  node - "$TMP/conflicts.json" <<'JS'
const conflicts = JSON.parse(require('fs').readFileSync(process.argv[2], 'utf8'));
if (conflicts.length) console.log("Kept your settings where they differ from Ang's:");
for (const { path, theirs } of conflicts) console.log(`  ${path.join('.')}: kept your value; Ang ships ${JSON.stringify(theirs)}`);
JS
}

record_and_report() {
  ang version write --ref "$TAG" --sha "$SHA" >/dev/null
  echo "Ang $TAG installed in $ROOT."
  echo "Next: open Claude Code here and run /bootstrap-repo."
}

# Every check runs before the repo is touched; the download lands in a temp folder first.
require_target "$@"
check_prereqs
resolve_target "$@"
check_repo
check_clean
check_not_installed
check_settings
download
check_collisions
copy_in
merge_settings
record_and_report
