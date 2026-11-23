const REPO = "zacbraddy/ang";
const TAG_RE =
  /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;

export function parseTag(tag) {
  const match = TAG_RE.exec(tag);

  if (!match) {
    return null;
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    pre: match[4]?.split(".") ?? [],
  };
}

const isNumeric = (part) => /^\d+$/.test(part);

// Semver precedence: numeric parts compare as numbers and sort before word parts; a shorter matching prefix sorts first.
function comparePre(left, right) {
  if (!left.length || !right.length) {
    return right.length - left.length;
  }

  for (let i = 0; i < Math.min(left.length, right.length); i++) {
    const [leftPart, rightPart] = [left[i], right[i]];

    if (leftPart === rightPart) {
      continue;
    }

    if (isNumeric(leftPart) && isNumeric(rightPart)) {
      return Number(leftPart) - Number(rightPart);
    }

    if (isNumeric(leftPart) !== isNumeric(rightPart)) {
      return isNumeric(leftPart) ? -1 : 1;
    }

    return leftPart < rightPart ? -1 : 1;
  }

  return left.length - right.length;
}

function parseOrThrow(tag) {
  const parsed = parseTag(tag);

  if (!parsed) {
    throw new Error(`${tag} isn't a version tag`);
  }

  return parsed;
}

export function compareTags(a, b) {
  const [left, right] = [parseOrThrow(a), parseOrThrow(b)];

  return (
    left.major - right.major ||
    left.minor - right.minor ||
    left.patch - right.patch ||
    comparePre(left.pre, right.pre)
  );
}

export function targetStatus(record, to) {
  if (!record || !parseTag(record.ref)) {
    return "no-record";
  }

  if (record.ref === to.ref) {
    return "current";
  }

  return compareTags(record.ref, to.ref) > 0 ? "downgrade" : "upgrade";
}

// The same lookups and messages as install.sh's fetch_sha, so a user hears one voice from install and upgrade.
export async function resolveRelease(
  fetch,
  tag,
  api = process.env.ANG_GITHUB_API ?? "https://api.github.com",
) {
  const lookingFor = tag ?? "the latest release";
  const guidedError = (what, fix) => new Error(`${what}\n  ${fix}`);
  const notPublished = (name) =>
    guidedError(
      `${name} isn't a published Ang release.`,
      `Pick a tag from https://github.com/${REPO}/releases and re-run.`,
    );

  async function getFromGitHub(url, accept, onNotFound) {
    let response;

    try {
      response = await fetch(url, {
        headers: { accept, "user-agent": "ang-upgrade" },
      });
    } catch (error) {
      throw guidedError(
        `Couldn't reach GitHub to look up ${lookingFor}: a network problem (${error.cause?.code ?? error.message}).`,
        "Check your connection, proxy or VPN and re-run.",
      );
    }

    const isRateLimited =
      [403, 429].includes(response.status) &&
      response.headers.get("x-ratelimit-remaining") === "0";

    if (isRateLimited) {
      throw guidedError(
        "GitHub's API rate limit for your IP address is used up (60 requests an hour without a login).",
        "Wait for it to reset, or re-run from another network.",
      );
    }

    if (response.status === 404) {
      throw onNotFound();
    }

    if (!response.ok) {
      throw guidedError(
        `GitHub answered ${response.status} while looking up ${lookingFor}.`,
        "Re-run in a minute; if it persists, check https://www.githubstatus.com.",
      );
    }

    return response;
  }

  const releaseUrl = tag
    ? `${api}/repos/${REPO}/releases/tags/${encodeURIComponent(tag)}`
    : `${api}/repos/${REPO}/releases/latest`;
  const noRelease = () => {
    if (tag) {
      return notPublished(tag);
    }

    return guidedError(
      "GitHub has no latest Ang release.",
      `Pick a tag from https://github.com/${REPO}/releases and run /upgrade-ang <tag>.`,
    );
  };

  const releaseResponse = await getFromGitHub(
    releaseUrl,
    "application/vnd.github+json",
    noRelease,
  );
  const release = await releaseResponse.json();

  if (release.draft) {
    throw notPublished(tag ?? release.tag_name);
  }

  const ref = release.tag_name;
  const commit = await getFromGitHub(
    `${api}/repos/${REPO}/commits/${encodeURIComponent(ref)}`,
    "application/vnd.github.sha",
    () => notPublished(ref),
  );
  const sha = (await commit.text()).trim();

  const isCommitSha = /^[0-9a-f]{40}$/.test(sha);

  if (!isCommitSha) {
    throw guidedError(
      `GitHub didn't return a commit SHA for ${ref}.`,
      "Re-run in a minute.",
    );
  }

  return { ref, sha };
}
