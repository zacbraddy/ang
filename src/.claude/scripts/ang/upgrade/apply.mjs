import fs from 'node:fs';
import path from 'node:path';
import { EXCLUDED } from './classify.mjs';
import { CONFLICTED } from './size.mjs';

const WRITES = ['fast-path', 'upstream-new', 'clean-merge'];
const LEAVES = ['unchanged', 'keep-local', 'local-only'];
const RESOLUTIONS = ['write', 'delete', 'keep'];
// Only these hold git merge-file output; the rest are upstream's bytes, which may legitimately quote a marker.
const MERGED = ['clean-merge', 'conflict', 'conflict-no-base'];
const MARKER = /^(<{7}|>{7}) /m;

// A moved file that would otherwise be left alone still has to land at its new path.
function action(entry) {
  if (CONFLICTED.includes(entry.category)) return entry.resolution;
  if (WRITES.includes(entry.category)) return 'write';
  if (entry.category === 'fast-path-delete') return 'delete';
  return entry.movedFrom ? 'write' : 'keep';
}

function pathProblem(p) {
  if (typeof p !== 'string' || !p) return 'has no path';
  if (path.isAbsolute(p) || path.posix.isAbsolute(p)) return 'is absolute';
  if (p.split(/[\\/]/).includes('..')) return 'leaves the project';
  if (EXCLUDED(p)) return 'is excluded from upgrades';
  return null;
}

// Gathers every problem before anything is written, so an apply is all or nothing (d26).
export function checkPlan(entries) {
  const problems = [];
  for (const entry of entries) {
    const at = entry.path ?? '(no path)';
    for (const p of [entry.path, ...(entry.movedFrom === undefined ? [] : [entry.movedFrom])]) {
      const problem = pathProblem(p);
      if (problem) problems.push(`${at}: ${p ?? 'path'} ${problem}`);
    }
    const known = [...WRITES, ...LEAVES, 'fast-path-delete', ...CONFLICTED].includes(entry.category);
    if (!known) problems.push(`${at}: unknown category "${entry.category}"`);
    else if (CONFLICTED.includes(entry.category) && !RESOLUTIONS.includes(entry.resolution)) {
      problems.push(`${at}: ${entry.category} needs a resolution of ${RESOLUTIONS.join(', ')}`);
    }
    if (!known || action(entry) !== 'write') continue;
    if (!entry.mergedFile || !fs.existsSync(entry.mergedFile)) problems.push(`${at}: mergedFile is missing`);
    else if (MERGED.includes(entry.category) && MARKER.test(fs.readFileSync(entry.mergedFile, 'utf8'))) problems.push(`${at}: mergedFile still has conflict markers`);
  }
  return problems;
}

// Runs only on a plan checkPlan passes. fs alone, so the git index is never touched.
export function applyPlan(entries, projectRoot) {
  const result = { written: [], deleted: [], kept: [] };
  for (const entry of entries) {
    const target = path.join(projectRoot, entry.path);
    const act = action(entry);
    if (act === 'write') {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(entry.mergedFile, target);
      result.written.push(entry.path);
    } else if (act === 'delete') {
      fs.rmSync(target, { force: true });
      result.deleted.push(entry.path);
    } else {
      // Kept local bytes still have to follow a move, or they're stranded outside every later upgrade.
      if (entry.movedFrom) {
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.renameSync(path.join(projectRoot, entry.movedFrom), target);
      }
      if (entry.category !== 'unchanged') result.kept.push(entry.path);
      continue;
    }
    if (entry.movedFrom) fs.rmSync(path.join(projectRoot, entry.movedFrom), { force: true });
  }
  return result;
}
