import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { applyPlan, checkPlan } from './apply.mjs';

const dirs = [];
after(() => dirs.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })));

function folder(files = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ang-apply-'));
  dirs.push(dir);
  for (const [name, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
    fs.writeFileSync(path.join(dir, name), content);
  }
  return dir;
}
const temp = folder();
const merged = (name, content) => {
  const file = path.join(temp, name);
  fs.writeFileSync(file, content);
  return file;
};
const snapshot = (dir) => Object.fromEntries(fs.readdirSync(dir, { recursive: true, withFileTypes: true })
  .filter((e) => e.isFile() && !path.join(e.parentPath, e.name).includes(`${path.sep}.git${path.sep}`))
  .map((e) => [path.relative(dir, path.join(e.parentPath, e.name)), fs.readFileSync(path.join(e.parentPath, e.name), 'utf8')]));

test('checkPlan reports an unresolved conflict of every kind', () => {
  const entries = ['conflict', 'conflict-no-base', 'conflict-delete'].map((category) => ({ path: `${category}.md`, category, hunks: 1, mergedFile: merged('ok', 'ok') }));
  const problems = checkPlan(entries);
  assert.equal(problems.length, 3);
  for (const e of entries) assert.ok(problems.some((p) => p.includes(e.path) && /resolution/.test(p)), e.path);
});

test('checkPlan reports a file to write with a missing mergedFile or leftover conflict markers', () => {
  const problems = checkPlan([
    { path: 'a.md', category: 'fast-path', hunks: 0 },
    { path: 'b.md', category: 'clean-merge', hunks: 0, mergedFile: path.join(temp, 'nope') },
    { path: 'c.md', category: 'conflict', hunks: 1, resolution: 'write', mergedFile: merged('c', 'x\n<<<<<<< local\ny\n') },
    { path: 'd.md', category: 'conflict', hunks: 1, resolution: 'write', mergedFile: merged('d', 'x\n>>>>>>> upstream\n') },
    { path: 'e.md', category: 'conflict', hunks: 1, resolution: 'keep' },
  ]);
  assert.equal(problems.length, 4, problems.join('\n'));
  for (const p of ['a.md', 'b.md', 'c.md', 'd.md']) assert.ok(problems.some((line) => line.includes(p)), p);
});

test('checkPlan reports absolute, escaping and excluded paths', () => {
  const ok = merged('ok', 'ok');
  const problems = checkPlan([
    { path: '/etc/passwd', category: 'fast-path', hunks: 0, mergedFile: ok },
    { path: '../outside.md', category: 'fast-path', hunks: 0, mergedFile: ok },
    { path: '.claude/settings.json', category: 'fast-path', hunks: 0, mergedFile: ok },
    { path: 'rules/pilot.local.md', category: 'fast-path', hunks: 0, mergedFile: ok },
    { path: 'new.md', category: 'keep-local', hunks: 0, mergedFile: ok, movedFrom: '../old.md' },
  ]);
  assert.equal(problems.length, 5, problems.join('\n'));
});

test('checkPlan passes a fully resolved plan', () => {
  assert.deepEqual(checkPlan([
    { path: 'a.md', category: 'fast-path', hunks: 0, mergedFile: merged('a', 'A') },
    { path: 'b.md', category: 'conflict', hunks: 1, resolution: 'delete' },
    { path: 'c.md', category: 'keep-local', hunks: 0 },
    { path: 'd.md', category: 'upstream-new', hunks: 0, mergedFile: merged('d', 'A doc quoting a marker:\n<<<<<<< local\n') },
  ]), []);
});

test('applyPlan writes, deletes and leaves each entry as its category and resolution say', () => {
  const dir = folder({
    'fp.md': 'old', 'fpd.md': 'gone', 'cm.md': 'mine', 'cw.md': 'conflicted', 'cd.md': 'conflicted', 'ck.md': 'conflicted',
    'un.md': 'same', 'kl.md': 'local', 'lo.md': 'only',
  });
  const result = applyPlan([
    { path: 'fp.md', category: 'fast-path', hunks: 0, mergedFile: merged('fp', 'new') },
    { path: 'fpd.md', category: 'fast-path-delete', hunks: 0 },
    { path: 'deep/er/un.md', category: 'upstream-new', hunks: 0, mergedFile: merged('un', 'fresh') },
    { path: 'cm.md', category: 'clean-merge', hunks: 0, mergedFile: merged('cm', 'merged') },
    { path: 'cw.md', category: 'conflict', hunks: 2, resolution: 'write', mergedFile: merged('cw', 'resolved') },
    { path: 'cd.md', category: 'conflict-delete', hunks: 0, resolution: 'delete' },
    { path: 'ck.md', category: 'conflict-no-base', hunks: 1, resolution: 'keep', mergedFile: merged('ck', 'ignored') },
    { path: 'un.md', category: 'unchanged', hunks: 0 },
    { path: 'kl.md', category: 'keep-local', hunks: 0 },
    { path: 'lo.md', category: 'local-only', hunks: 0 },
  ], dir);
  assert.deepEqual(snapshot(dir), {
    'fp.md': 'new', 'deep/er/un.md': 'fresh', 'cm.md': 'merged', 'cw.md': 'resolved', 'ck.md': 'conflicted',
    'un.md': 'same', 'kl.md': 'local', 'lo.md': 'only',
  });
  assert.deepEqual(result, {
    written: ['fp.md', 'deep/er/un.md', 'cm.md', 'cw.md'],
    deleted: ['fpd.md', 'cd.md'],
    kept: ['ck.md', 'kl.md', 'lo.md'],
  });
});

test('applyPlan deletes the old path of a moved entry it writes', () => {
  const dir = folder({ '.claude/ang.json': 'edited', 'b.md': 'shipped' });
  applyPlan([
    { path: 'ang.json', category: 'keep-local', hunks: 0, movedFrom: '.claude/ang.json', mergedFile: merged('move', 'edited') },
    { path: 'c.md', category: 'fast-path', hunks: 0, movedFrom: 'b.md', mergedFile: merged('c', 'updated') },
  ], dir);
  assert.deepEqual(snapshot(dir), { 'ang.json': 'edited', 'c.md': 'updated' });
});

test('applyPlan moves a moved conflict resolved keep to its new path, local bytes intact', () => {
  const dir = folder({ 'old/x.md': 'mine' });
  const result = applyPlan([
    { path: 'new/x.md', category: 'conflict', hunks: 1, resolution: 'keep', movedFrom: 'old/x.md', mergedFile: merged('kx', 'ignored') },
  ], dir);
  assert.deepEqual(snapshot(dir), { 'new/x.md': 'mine' });
  assert.deepEqual(result.kept, ['new/x.md']);
});

test('applyPlan in a git repo leaves the index untouched and the changes unstaged', () => {
  const dir = folder({ 'a.md': 'one', 'b.md': 'two' });
  const git = (...args) => execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8' });
  git('init', '-q');
  git('add', '.');
  git('-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-qm', 'init');
  applyPlan([
    { path: 'a.md', category: 'fast-path', hunks: 0, mergedFile: merged('ga', 'ONE') },
    { path: 'b.md', category: 'fast-path-delete', hunks: 0 },
    { path: 'c.md', category: 'upstream-new', hunks: 0, mergedFile: merged('gc', 'three') },
  ], dir);
  assert.equal(git('diff', '--cached'), '');
  assert.deepEqual(git('status', '--porcelain').trimEnd().split('\n').sort(), [' D b.md', ' M a.md', '?? c.md']);
});
