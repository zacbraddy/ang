const REPO = 'zacbraddy/ang';
const TAG_RE = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;

export function parseTag(tag) {
  const match = TAG_RE.exec(tag);
  if (!match) return null;
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]), pre: match[4]?.split('.') ?? [] };
}

const isNumeric = (part) => /^\d+$/.test(part);

// Semver precedence: numeric parts compare as numbers and sort before word parts; a shorter matching prefix sorts first.
function comparePre(a, b) {
  if (!a.length || !b.length) return b.length - a.length;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] === b[i]) continue;
    if (isNumeric(a[i]) && isNumeric(b[i])) return Number(a[i]) - Number(b[i]);
    if (isNumeric(a[i]) !== isNumeric(b[i])) return isNumeric(a[i]) ? -1 : 1;
    return a[i] < b[i] ? -1 : 1;
  }
  return a.length - b.length;
}

function parseOrThrow(tag) {
  const parsed = parseTag(tag);
  if (!parsed) throw new Error(`${tag} isn't a version tag`);
  return parsed;
}

export function compareTags(a, b) {
  const [x, y] = [parseOrThrow(a), parseOrThrow(b)];
  return x.major - y.major || x.minor - y.minor || x.patch - y.patch || comparePre(x.pre, y.pre);
}

export function targetStatus(record, to) {
  if (!record || !parseTag(record.ref)) return 'no-record';
  if (record.ref === to.ref) return 'current';
  return compareTags(record.ref, to.ref) > 0 ? 'downgrade' : 'upgrade';
}

// The same lookups and messages as install.sh's fetch_sha, so a user hears one voice from install and upgrade.
export async function resolveRelease(fetch, tag, api = process.env.ANG_GITHUB_API ?? 'https://api.github.com') {
  const looking = tag ?? 'the latest release';
  const stop = (what, fix) => new Error(`${what}\n  ${fix}`);
  const notPublished = (name) => stop(`${name} isn't a published Ang release.`, `Pick a tag from https://github.com/${REPO}/releases and re-run.`);

  async function get(url, accept, onNotFound) {
    let res;
    try {
      res = await fetch(url, { headers: { accept, 'user-agent': 'ang-upgrade' } });
    } catch (error) {
      throw stop(`Couldn't reach GitHub to look up ${looking}: a network problem (${error.cause?.code ?? error.message}).`, 'Check your connection, proxy or VPN and re-run.');
    }
    if ([403, 429].includes(res.status) && res.headers.get('x-ratelimit-remaining') === '0') {
      throw stop("GitHub's API rate limit for your IP address is used up (60 requests an hour without a login).", 'Wait for it to reset, or re-run from another network.');
    }
    if (res.status === 404) throw onNotFound();
    if (!res.ok) throw stop(`GitHub answered ${res.status} while looking up ${looking}.`, 'Re-run in a minute; if it persists, check https://www.githubstatus.com.');
    return res;
  }

  const releaseUrl = tag ? `${api}/repos/${REPO}/releases/tags/${encodeURIComponent(tag)}` : `${api}/repos/${REPO}/releases/latest`;
  const noRelease = tag
    ? () => notPublished(tag)
    : () => stop("There's no stable Ang release yet.", 'Name the tag to upgrade to, e.g. /upgrade-ang v1.0.0-rc.2');
  const release = await (await get(releaseUrl, 'application/vnd.github+json', noRelease)).json();
  if (release.draft) throw notPublished(tag ?? release.tag_name);

  const ref = release.tag_name;
  const commit = await get(`${api}/repos/${REPO}/commits/${encodeURIComponent(ref)}`, 'application/vnd.github.sha', () => notPublished(ref));
  const sha = (await commit.text()).trim();
  if (!/^[0-9a-f]{40}$/.test(sha)) throw stop(`GitHub didn't return a commit SHA for ${ref}.`, 'Re-run in a minute.');
  return { ref, sha };
}
