import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chooseRoute } from './size.mjs';

const ONE_SIDED = ['unchanged', 'fast-path', 'fast-path-delete', 'upstream-new', 'keep-local', 'local-only'];
const entry = (category, hunks = 0) => ({ path: `${category}-${Math.random()}`, category, hunks });
const conflicted = (n) => Array.from({ length: n }, (_, i) => entry(['conflict', 'conflict-no-base', 'conflict-delete'][i % 3], i % 3 === 2 ? 0 : 2));

test('only one-sided changes route fast', () => {
  const route = chooseRoute(ONE_SIDED.map((c) => entry(c)), true);
  assert.equal(route.route, 'fast');
  assert.deepEqual([route.conflictedFiles, route.conflictHunks, route.cleanMerges], [0, 0, 0]);
  assert.ok(route.reason);
});

test('a clean merge alone routes agent-resolved', () => {
  const route = chooseRoute([entry('unchanged'), entry('clean-merge')], true);
  assert.equal(route.route, 'agent-resolved');
  assert.equal(route.cleanMerges, 1);
});

test('conflicted file counts route at each boundary', () => {
  const cases = [[1, 'agent-resolved'], [5, 'agent-resolved'], [6, 'guided'], [11, 'guided'], [12, 'guided-with-warning']];
  for (const [n, expected] of cases) assert.equal(chooseRoute(conflicted(n), true).route, expected, `${n} conflicted files`);
});

test('no version record always routes guided with warning', () => {
  assert.equal(chooseRoute([entry('unchanged')], false).route, 'guided-with-warning');
  assert.equal(chooseRoute([], false).route, 'guided-with-warning');
  assert.match(chooseRoute([], false).reason, /version record/);
});

test('conflict hunks sum max(hunks, 1) over conflicted files', () => {
  const route = chooseRoute([entry('conflict', 3), entry('conflict-delete', 0), entry('conflict-no-base', 1), entry('clean-merge')], true);
  assert.deepEqual([route.conflictedFiles, route.conflictHunks, route.cleanMerges], [3, 5, 1]);
});
