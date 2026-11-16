#!/usr/bin/env node
// Spike: file-by-file three-way upgrade of an installed Ang instance.
// Usage: upgrade.mjs <project-dir> <ang-repo> <target-ref> [--apply]
// Base is the SHA in .claude/ang/version.json; with no record, base is empty.
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const [project, repo, targetRef, flag] = process.argv.slice(2);
const apply = flag === '--apply';
const git = (...args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', maxBuffer: 1e8 });

// Owned by other mechanisms: settings merge (u13), the version record, per-user overlays.
const EXCLUDED = (p) => p === '.claude/settings.json' || p === '.claude/ang/version.json' || /\.local\./.test(p);

function tree(ref) {
  if (!ref) return new Map();
  const out = git('ls-tree', '-r', ref, 'src');
  return new Map(out.trim().split('\n').map((l) => {
    const [meta, file] = l.split('\t');
    return [file.slice(4), meta.split(' ')[2]];
  }).filter(([p]) => !EXCLUDED(p)));
}
const blob = (sha) => execFileSync('git', ['-C', repo, 'cat-file', 'blob', sha]);

const versionFile = path.join(project, '.claude/ang/version.json');
const baseSha = fs.existsSync(versionFile) ? JSON.parse(fs.readFileSync(versionFile, 'utf8')).sha : null;
const targetSha = git('rev-parse', targetRef).trim();
const base = tree(baseSha);
const target = tree(targetSha);

// Local scope: everything Ang ever shipped at these paths, plus local additions under .claude/.
function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    e.isDirectory() ? walk(p, acc) : acc.push(path.relative(project, p));
  }
  return acc;
}
const localFiles = new Set(walk(path.join(project, '.claude')).filter((p) => !EXCLUDED(p)));
const paths = new Set([...base.keys(), ...target.keys(), ...localFiles]);
const readLocal = (p) => { const f = path.join(project, p); return fs.existsSync(f) ? fs.readFileSync(f) : null; };
const same = (a, b) => a !== null && b !== null && Buffer.compare(a, b) === 0;

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ang-upgrade-'));
const results = [];
for (const p of [...paths].sort()) {
  const b = base.has(p) ? blob(base.get(p)) : null;
  const t = target.has(p) ? blob(target.get(p)) : null;
  const l = readLocal(p);
  let kind, out = l, hunks = 0;

  if (same(l, t) || (l === null && t === null)) kind = 'unchanged';
  else if (b !== null ? same(l, b) : l === null) { kind = t === null ? 'fast-path-delete' : (b === null ? 'upstream-new' : 'fast-path'); out = t; }
  else if (b !== null ? same(t, b) : t === null) kind = b === null ? 'local-only' : 'keep-local';
  else if (l === null || t === null) kind = 'conflict-delete'; // one side deleted, the other changed
  else {
    const [lf, bf, tf] = ['local', 'base', 'target'].map((n) => path.join(tmp, n));
    fs.writeFileSync(lf, l); fs.writeFileSync(bf, b ?? ''); fs.writeFileSync(tf, t);
    const r = spawnSync('git', ['merge-file', '-p', '-L', 'local', '-L', 'base', '-L', 'upstream', lf, bf, tf]);
    hunks = r.status; // merge-file exits with the conflict count
    out = r.stdout;
    kind = hunks === 0 ? 'clean-merge' : (b === null ? 'conflict-no-base' : 'conflict');
  }
  results.push({ path: p, kind, hunks });
  if (apply && kind !== 'unchanged' && kind !== 'conflict-delete') {
    const f = path.join(project, p);
    if (out === null) fs.rmSync(f, { force: true });
    else { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, out); }
  }
}
fs.rmSync(tmp, { recursive: true });

const counts = results.reduce((c, r) => ({ ...c, [r.kind]: (c[r.kind] ?? 0) + 1 }), {});
const conflicted = results.filter((r) => r.kind.startsWith('conflict'));
const conflictHunks = conflicted.reduce((n, r) => n + Math.max(r.hunks, 1), 0);
console.log(JSON.stringify({
  base: baseSha ?? 'none (no version record)',
  target: targetSha,
  counts,
  conflictedFiles: conflicted.length,
  conflictHunks,
  needsJudgement: results.filter((r) => ['clean-merge', ...Object.keys(counts).filter((k) => k.startsWith('conflict'))].includes(r.kind)).map((r) => `${r.kind}: ${r.path}${r.hunks ? ` (${r.hunks})` : ''}`),
}, null, 2));
