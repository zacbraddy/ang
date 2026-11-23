// Builds the release manifest between a tag and a ref from git alone: the deterministic feed release-scout drafts notes from.
// Refs only, never the working tree, so the same refs always give the same bytes.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SETTINGS = "src/.claude/settings.json";
const ARCHIVE_SUBJECT = /^retro: archive (\S+)/;

export class UnknownRefError extends Error {}

const git = (cwd, args, input) =>
  execFileSync(
    "git",
    ["-c", "core.quotePath=false", "-c", "diff.algorithm=myers", ...args],
    {
      cwd,
      env: { ...process.env, LC_ALL: "C" },
      encoding: "utf8",
      input,
      stdio: ["pipe", "pipe", "pipe"],
      maxBuffer: 256 * 1024 * 1024,
    },
  );

const splitNullTerminated = (text) => text.split("\0").slice(0, -1);

// Binary files report "-" instead of a line count.
const parseLineCount = (value) => (value === "-" ? null : Number(value));

function byPath(a, b) {
  if (a.path < b.path) {
    return -1;
  }

  return a.path > b.path ? 1 : 0;
}

function parseLineCounts(numstatZ) {
  const countsByPath = new Map();
  const fields = splitNullTerminated(numstatZ);

  for (let i = 0; i < fields.length; i++) {
    const [added, removed, file] = fields[i].split("\t");
    // A rename's record leaves the path empty and follows it with the old and new paths.
    const isRename = file === "";

    if (isRename) {
      i += 2;
    }

    const filePath = isRename ? fields[i] : file;

    countsByPath.set(filePath, {
      added: parseLineCount(added),
      removed: parseLineCount(removed),
    });
  }

  return countsByPath;
}

export function parseDiffEntries(nameStatusZ, numstatZ) {
  const countsByPath = parseLineCounts(numstatZ);
  const fields = splitNullTerminated(nameStatusZ);
  const entries = [];

  for (let i = 0; i < fields.length;) {
    const statusCode = fields[i++];
    const status = statusCode[0];
    let entry;

    if (status === "R") {
      entry = {
        path: fields[i + 1],
        status,
        from: fields[i],
        similarity: Number(statusCode.slice(1)),
      };
      i += 2;
    } else {
      entry = { path: fields[i], status };
      i += 1;
    }

    entries.push({ ...entry, ...countsByPath.get(entry.path) });
  }

  return entries.sort(byPath);
}

export function archivedEpic(subject) {
  return subject.match(ARCHIVE_SUBJECT)?.[1] ?? null;
}

function resolveCommit(cwd, ref) {
  try {
    return git(cwd, [
      "rev-parse",
      "--verify",
      "--quiet",
      `${ref}^{commit}`,
    ]).trim();
  } catch {
    throw new UnknownRefError(`release-manifest: unknown ref "${ref}"`);
  }
}

function latestTag(cwd, toRef) {
  try {
    return git(cwd, [
      "describe",
      "--tags",
      "--abbrev=0",
      "--match",
      "v*",
      toRef,
    ]).trim();
  } catch {
    return null;
  }
}

// With no tag yet, the manifest diffs against git's empty tree so every file counts as added.
const emptyTree = (cwd) =>
  git(cwd, ["hash-object", "-t", "tree", "--stdin"], "").trim();

const diffEntries = (cwd, base, toRef, pathspec) =>
  parseDiffEntries(
    git(cwd, [
      "diff",
      "-M",
      "-z",
      "--name-status",
      base,
      toRef,
      "--",
      pathspec,
    ]),
    git(cwd, ["diff", "-M", "-z", "--numstat", base, toRef, "--", pathspec]),
  );

function listCommits(cwd, range) {
  const log = git(cwd, [
    "log",
    "--reverse",
    "--no-show-signature",
    "--format=%H%x00%s",
    range,
  ]);

  return log
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [sha, subject] = line.split("\0");

      return { sha, subject };
    });
}

const listArchivedEpics = (commits) =>
  commits.flatMap(({ sha, subject }) => {
    const epic = archivedEpic(subject);

    return epic ? [{ epic, sha }] : [];
  });

const diffSettings = (cwd, base, toRef) =>
  git(cwd, [
    "diff",
    "--no-color",
    "--no-ext-diff",
    "--src-prefix=a/",
    "--dst-prefix=b/",
    base,
    toRef,
    "--",
    SETTINGS,
  ]);

export function buildManifest({ cwd, fromTag, toRef = "HEAD" }) {
  resolveCommit(cwd, toRef);

  const tag = fromTag === undefined ? latestTag(cwd, toRef) : fromTag;
  const hasTag = tag !== null;
  const base = hasTag ? resolveCommit(cwd, tag) : emptyTree(cwd);
  const range = hasTag ? `${base}..${toRef}` : toRef;
  const commits = listCommits(cwd, range);

  return {
    fromTag: tag,
    toRef,
    files: diffEntries(cwd, base, toRef, "src/"),
    commits,
    archivedEpics: listArchivedEpics(commits),
    tenK: diffEntries(cwd, base, toRef, "project-context/10k/"),
    settingsDiff: diffSettings(cwd, base, toRef),
  };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [fromTag, toRef] = process.argv.slice(2);

  try {
    const manifest = buildManifest({
      cwd: path.resolve(import.meta.dirname, ".."),
      fromTag,
      toRef,
    });

    console.log(JSON.stringify(manifest, null, 2));
  } catch (error) {
    if (!(error instanceof UnknownRefError)) {
      throw error;
    }

    console.error(error.message);
    process.exit(1);
  }
}
