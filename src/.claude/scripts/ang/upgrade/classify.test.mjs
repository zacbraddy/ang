import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyMoves, classifyFile, classifyTrees, mergeFile } from './classify.mjs';

const buf = (s) => (s === null ? null : Buffer.from(s));
const classify = (b, l, t) => classifyFile(buf(b), buf(l), buf(t), 'x.md');
const files = (entries) => new Map(Object.entries(entries).map(([p, s]) => [p, Buffer.from(s)]));
const guide = (...moves) => ({ moves: moves.map(([from, to]) => ({ from, to, note: '' })) });

const BASE = 'one\ntwo\nthree\nfour\nfive\nsix\n';
const OURS_TOP = 'ONE\ntwo\nthree\nfour\nfive\nsix\n';
const THEIRS_BOTTOM = 'one\ntwo\nthree\nfour\nfive\nSIX\n';
const THEIRS_TOP = 'uno\ntwo\nthree\nfour\nfive\nsix\n';

test('classifyFile: local equal to target, or both absent, is unchanged', () => {
  assert.equal(classify('a', 'b', 'b').category, 'unchanged');
  assert.equal(classify('a', null, null).category, 'unchanged');
  assert.equal(classify(null, null, null).category, 'unchanged');
});

test('classifyFile: only upstream changed is fast-path, fast-path-delete or upstream-new, carrying the target bytes', () => {
  assert.deepEqual(classify('a', 'a', 'b'), { category: 'fast-path', hunks: 0, merged: buf('b') });
  assert.deepEqual(classify('a', 'a', null), { category: 'fast-path-delete', hunks: 0, merged: null });
  assert.deepEqual(classify(null, null, 'b'), { category: 'upstream-new', hunks: 0, merged: buf('b') });
});

test('classifyFile: only local changed is keep-local or local-only', () => {
  assert.equal(classify('a', 'b', 'a').category, 'keep-local');
  assert.equal(classify('a', null, 'a').category, 'keep-local');
  assert.equal(classify(null, 'b', null).category, 'local-only');
});

test('classifyFile: both changed with one side absent is conflict-delete, carrying the target bytes if any', () => {
  assert.deepEqual(classify('a', null, 'c'), { category: 'conflict-delete', hunks: 0, merged: buf('c') });
  assert.deepEqual(classify('a', 'b', null), { category: 'conflict-delete', hunks: 0, merged: null });
});

test('classifyFile: both changed and git merges cleanly is clean-merge with the merged bytes', () => {
  const { category, hunks, merged } = classify(BASE, OURS_TOP, THEIRS_BOTTOM);
  assert.equal(category, 'clean-merge');
  assert.equal(hunks, 0);
  assert.equal(merged.toString(), 'ONE\ntwo\nthree\nfour\nfive\nSIX\n');
});

test('classifyFile: overlapping changes are a conflict with the hunk count and markers', () => {
  const { category, hunks, merged } = classify(BASE, OURS_TOP, THEIRS_TOP);
  assert.equal(category, 'conflict');
  assert.equal(hunks, 1);
  assert.match(merged.toString(), /^<{7} local\nONE\n={7}\nuno\n>{7} upstream$/m);
});

test('classifyFile: overlapping changes with no base are conflict-no-base', () => {
  const { category, hunks } = classify(null, 'mine\n', 'theirs\n');
  assert.equal(category, 'conflict-no-base');
  assert.equal(hunks, 1);
});

test('mergeFile throws naming the path when git merge-file fails rather than counting conflicts', () => {
  const binary = (s) => Buffer.from(`a\0${s}\n`);
  assert.throws(() => mergeFile(binary('l'), binary(''), binary('t'), 'skills/x.md'), /skills\/x\.md/);
});

test('applyMoves moves content to the new path and drops the old one', () => {
  const { files: moved, movedFrom } = applyMoves(files({ a: 'A', z: 'Z' }), [guide(['a', 'b'])]);
  assert.deepEqual([...moved.keys()].sort(), ['b', 'z']);
  assert.equal(moved.get('b').toString(), 'A');
  assert.deepEqual([...movedFrom], [['b', 'a']]);
});

test('applyMoves chains moves across guides, oldest first, remembering the original path', () => {
  const { files: moved, movedFrom } = applyMoves(files({ a: 'A' }), [guide(['a', 'b']), guide(['b', 'c'])]);
  assert.deepEqual([...moved.keys()], ['c']);
  assert.deepEqual([...movedFrom], [['c', 'a']]);
});

test('applyMoves leaves the map alone when a move source is absent', () => {
  const { files: moved, movedFrom } = applyMoves(files({ z: 'Z' }), [guide(['a', 'b'])]);
  assert.deepEqual([...moved.keys()], ['z']);
  assert.equal(movedFrom.size, 0);
});

test('applyMoves keeps an existing file at the new path and the old path in place', () => {
  const { files: moved, movedFrom } = applyMoves(files({ a: 'old', b: 'existing' }), [guide(['a', 'b'])]);
  assert.equal(moved.get('a').toString(), 'old');
  assert.equal(moved.get('b').toString(), 'existing');
  assert.equal(movedFrom.size, 0);
});

test('classifyTrees: a moved file the user edited is keep-local at the new path, carrying the local bytes to move', () => {
  const guides = [guide(['old.md', 'new.md'])];
  const base = applyMoves(files({ 'old.md': 'shipped' }), guides).files;
  const ours = applyMoves(files({ 'old.md': 'edited' }), guides);
  const theirs = files({ 'new.md': 'shipped' });
  const entries = classifyTrees(base, ours.files, theirs, ours.movedFrom);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].path, 'new.md');
  assert.equal(entries[0].category, 'keep-local');
  assert.equal(entries[0].movedFrom, 'old.md');
  assert.equal(entries[0].merged.toString(), 'edited');
});

test('classifyTrees covers base ∪ target sorted, ignoring other local files and every excluded path', () => {
  const base = files({ 'b.md': '1', 'gone.md': 'x', '.claude/settings.json': '{}', '.claude/ang/version.json': '{}' });
  const ours = files({ 'b.md': '1', 'gone.md': 'x', 'mine.md': 'm', '.claude/rules/pilot.local.md': 'p' });
  const theirs = files({ 'b.md': '2', 'a.md': 'new', '.claude/rules/pilot.local.md': 'p2', '.claude/settings.json': '{"a":1}' });
  const entries = classifyTrees(base, ours, theirs);
  assert.deepEqual(entries.map((e) => [e.path, e.category]), [
    ['a.md', 'upstream-new'],
    ['b.md', 'fast-path'],
    ['gone.md', 'fast-path-delete'],
  ]);
});
