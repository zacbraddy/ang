import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { posix, walk } from '../util.mjs';

// Owned by other mechanisms: settings merge, the version record and per-user overlays.
export const EXCLUDED = (p) => p === '.claude/settings.json' || p === '.claude/ang/version.json' || /\.local\./.test(path.posix.basename(p));

// A FileMap is Map<repo-relative posix path, Buffer>; an absent file is simply not in the map.
export function readTree(dir) {
  return new Map(walk(dir, true).map((file) => [posix(path.relative(dir, file)), fs.readFileSync(file)]));
}

// Renames through every guide's Moves, oldest first. An existing file at the new path wins, so the old one stays put.
export function applyMoves(files, guides) {
  const moved = new Map(files);
  const movedFrom = new Map();
  for (const { from, to } of guides.flatMap((g) => g.moves)) {
    if (!moved.has(from) || moved.has(to)) continue;
    moved.set(to, moved.get(from));
    moved.delete(from);
    movedFrom.set(to, movedFrom.get(from) ?? from);
    movedFrom.delete(from);
  }
  return { files: moved, movedFrom };
}

export function mergeFile(ours, base, theirs, filePath) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ang-merge-'));
  try {
    const [local, common, upstream] = ['local', 'base', 'upstream'].map((name, i) => {
      const file = path.join(dir, name);
      fs.writeFileSync(file, [ours, base, theirs][i]);
      return file;
    });
    const result = spawnSync('git', ['merge-file', '-p', '-L', 'local', '-L', 'base', '-L', 'upstream', local, common, upstream]);
    // The exit status is the conflict count, capped at 127; anything else (or no status) is git failing, not a count.
    if (result.error || result.status === null || result.status > 127) {
      const why = result.error?.message ?? (result.stderr.toString().trim() || `exit ${result.status}`);
      throw new Error(`git merge-file failed on ${filePath}: ${why}`);
    }
    return { merged: result.stdout, hunks: result.status };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const same = (a, b) => (a === null || b === null ? a === b : a.equals(b));

// The upgrade merge spike's decision table. `merged` holds the bytes a write would put at the path, or null.
export function classifyFile(base, ours, theirs, filePath) {
  const result = (category, merged = null, hunks = 0) => ({ category, hunks, merged });
  if (same(ours, theirs)) return result('unchanged');
  if (same(ours, base)) {
    if (theirs === null) return result('fast-path-delete');
    return result(base === null ? 'upstream-new' : 'fast-path', theirs);
  }
  if (same(theirs, base)) return result(base === null ? 'local-only' : 'keep-local');
  if (ours === null || theirs === null) return result('conflict-delete', theirs);
  const { merged, hunks } = mergeFile(ours, base ?? Buffer.alloc(0), theirs, filePath);
  if (hunks === 0) return result('clean-merge', merged);
  return result(base === null ? 'conflict-no-base' : 'conflict', merged, hunks);
}

// Every path Ang ships at base or target, sorted. `movedFrom` comes from applyMoves on the instance: a moved file that
// would otherwise be left alone still has to land at its new path, so it carries the local bytes to write there.
export function classifyTrees(baseFiles, oursFiles, theirsFiles, movedFrom = new Map()) {
  const paths = [...new Set([...baseFiles.keys(), ...theirsFiles.keys()])].filter((p) => !EXCLUDED(p)).sort();
  return paths.map((p) => {
    const ours = oursFiles.get(p) ?? null;
    const entry = { path: p, ...classifyFile(baseFiles.get(p) ?? null, ours, theirsFiles.get(p) ?? null, p) };
    if (!movedFrom.has(p)) return entry;
    entry.movedFrom = movedFrom.get(p);
    if (['unchanged', 'keep-local'].includes(entry.category)) entry.merged = ours;
    return entry;
  });
}
