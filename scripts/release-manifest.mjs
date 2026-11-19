#!/usr/bin/env node
// Builds the release manifest between a tag and a ref from git alone: the deterministic feed release-scout drafts notes from.
// Refs only, never the working tree, so the same refs always give the same bytes.
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SETTINGS = 'src/.claude/settings.json';
const ARCHIVE_SUBJECT = /^retro: archive (\S+)/;

export class UnknownRefError extends Error {}

const git = (cwd, args, input) =>
  execFileSync('git', ['-c', 'core.quotePath=false', '-c', 'diff.algorithm=myers', ...args], {
    cwd,
    env: { ...process.env, LC_ALL: 'C' },
    encoding: 'utf8',
    input,
    stdio: ['pipe', 'pipe', 'pipe'],
    maxBuffer: 256 * 1024 * 1024,
  });

const splitZ = (text) => text.split('\0').slice(0, -1);
const count = (n) => (n === '-' ? null : Number(n));
const byPath = (a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0);

export function parseDiffEntries(nameStatusZ, numstatZ) {
  const counts = new Map();
  const numstat = splitZ(numstatZ);
  for (let i = 0; i < numstat.length; i++) {
    const [added, removed, file] = numstat[i].split('\t');
    // A rename's record leaves the path empty and follows it with the old and new paths.
    const key = file === '' ? numstat[(i += 2)] : file;
    counts.set(key, { added: count(added), removed: count(removed) });
  }

  const entries = [];
  const nameStatus = splitZ(nameStatusZ);
  for (let i = 0; i < nameStatus.length; ) {
    const code = nameStatus[i++];
    const status = code[0];
    const entry = status === 'R'
      ? { path: nameStatus[i + 1], status, from: nameStatus[i], similarity: Number(code.slice(1)) }
      : { path: nameStatus[i], status };
    i += status === 'R' ? 2 : 1;
    entries.push({ ...entry, ...counts.get(entry.path) });
  }
  return entries.sort(byPath);
}

export function archivedEpic(subject) {
  return subject.match(ARCHIVE_SUBJECT)?.[1] ?? null;
}

function resolveCommit(cwd, ref) {
  try {
    return git(cwd, ['rev-parse', '--verify', '--quiet', `${ref}^{commit}`]).trim();
  } catch {
    throw new UnknownRefError(`release-manifest: unknown ref "${ref}"`);
  }
}

function latestTag(cwd, toRef) {
  try {
    return git(cwd, ['describe', '--tags', '--abbrev=0', '--match', 'v*', toRef]).trim();
  } catch {
    return null;
  }
}

const diffEntries = (cwd, base, toRef, pathspec) =>
  parseDiffEntries(
    git(cwd, ['diff', '-M', '-z', '--name-status', base, toRef, '--', pathspec]),
    git(cwd, ['diff', '-M', '-z', '--numstat', base, toRef, '--', pathspec]),
  );

export function buildManifest({ cwd, fromTag, toRef = 'HEAD' }) {
  resolveCommit(cwd, toRef);
  const tag = fromTag === undefined ? latestTag(cwd, toRef) : fromTag;
  const base = tag === null ? git(cwd, ['hash-object', '-t', 'tree', '--stdin'], '').trim() : resolveCommit(cwd, tag);

  const range = tag === null ? toRef : `${base}..${toRef}`;
  const commits = git(cwd, ['log', '--reverse', '--no-show-signature', '--format=%H%x00%s', range])
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [sha, subject] = line.split('\0');
      return { sha, subject };
    });

  return {
    fromTag: tag,
    toRef,
    files: diffEntries(cwd, base, toRef, 'src/'),
    commits,
    archivedEpics: commits.flatMap(({ sha, subject }) => {
      const epic = archivedEpic(subject);
      return epic ? [{ epic, sha }] : [];
    }),
    tenK: diffEntries(cwd, base, toRef, 'project-context/10k/'),
    settingsDiff: git(cwd, ['diff', '--no-color', '--no-ext-diff', '--src-prefix=a/', '--dst-prefix=b/', base, toRef, '--', SETTINGS]),
  };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [fromTag, toRef] = process.argv.slice(2);
  try {
    const manifest = buildManifest({ cwd: path.resolve(import.meta.dirname, '..'), fromTag, toRef });
    console.log(JSON.stringify(manifest, null, 2));
  } catch (error) {
    if (!(error instanceof UnknownRefError)) throw error;
    console.error(error.message);
    process.exit(1);
  }
}
