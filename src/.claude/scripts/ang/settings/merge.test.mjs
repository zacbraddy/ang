import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeArray, mergeSettings } from './merge.mjs';

// The settings-merge spike's scenarios. BASE is the shipped settings.json as it stood at 6cf9987 (it still has Bash(jq:*)).
const cmd = (sub) => `node "$CLAUDE_PROJECT_DIR/.claude/scripts/ang-context-manager.mjs" ${sub}`;
const group = (sub, matcher) => ({ ...(matcher && { matcher }), hooks: [{ type: 'command', command: cmd(sub) }] });
const BASE = {
  outputStyle: 'Partner In Crime',
  permissions: { allow: ['Bash(node .claude/scripts/ang-context-manager.mjs:*)', 'Bash(jq:*)'] },
  hooks: {
    SessionStart: [group('session banner')],
    SubagentStart: [group('session subagent')],
    PostToolUse: [group('library index --quiet', 'Write|Edit|MultiEdit')],
    Stop: [group('library index --quiet')],
  },
};
const copy = (v) => structuredClone(v);
const s = (v) => JSON.stringify(v);
const count = (v, needle) => s(v).split(needle).length - 1;

// Ang's next release: a changed hook command, one permission dropped and one added, a new hook event and a renamed outputStyle.
const TARGET = copy(BASE);
TARGET.outputStyle = 'Partners In Crime';
TARGET.hooks.SessionStart = [group('session banner --compact')];
TARGET.permissions.allow = ['Bash(node .claude/scripts/ang-context-manager.mjs:*)', 'Bash(gh release view:*)'];
TARGET.hooks.UserPromptSubmit = [group('session prompt')];

// The d7 install merge the spike reproduced: user wins, missing keys added, arrays unioned.
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
function installMerge(user, ang) {
  if (Array.isArray(user) && Array.isArray(ang)) return [...user, ...ang.filter((a) => !user.some((u) => s(u) === s(a)))];
  if (isObj(user) && isObj(ang)) {
    const out = { ...user };
    for (const k of Object.keys(ang)) out[k] = k in user ? installMerge(user[k], ang[k]) : ang[k];
    return out;
  }
  return user;
}

const PRE_ANG = {
  outputStyle: 'Explanatory', model: 'opus',
  permissions: { allow: ['Bash(npm test:*)'], deny: ['Read(.env)'] },
  hooks: { Stop: [{ hooks: [{ type: 'command', command: 'say done' }] }] },
};
const CUSTOMISED = installMerge(PRE_ANG, BASE);
// Customised, plus two Ang hooks edited after install: the banner (which upstream also changes) and the PostToolUse matcher (which it doesn't).
const EDITED = copy(CUSTOMISED);
EDITED.hooks.SessionStart = [group('session banner --no-mail')];
EDITED.hooks.PostToolUse = [group('library index --quiet', 'Write|Edit|MultiEdit|NotebookEdit')];

function assertUpgraded(merged) {
  assert.ok(!s(merged).includes('Bash(jq:*)'), 'dropped permission removed');
  assert.equal(count(merged, 'Bash(gh release view:*)'), 1, 'new permission added once');
  assert.equal(count(merged, 'session prompt'), 1, 'new hook event added once');
  assert.equal(count(merged, 'library index --quiet'), 2, 'unchanged Stop and PostToolUse hooks still there once');
  for (const groups of Object.values(merged.hooks)) assert.equal(new Set(groups.map(s)).size, groups.length, 'no hook group twice');
}

function assertUserSurvives(merged) {
  assert.equal(merged.outputStyle, 'Explanatory');
  assert.equal(merged.model, 'opus');
  assert.deepEqual(merged.permissions.deny, ['Read(.env)']);
  assert.ok(merged.permissions.allow.includes('Bash(npm test:*)'));
  assert.ok(s(merged).includes('say done'));
}

test('vanilla: a file equal to base becomes the target exactly, with no conflicts', () => {
  const { merged, conflicts } = mergeSettings(BASE, copy(BASE), TARGET);
  assert.equal(s(merged), s(TARGET));
  assert.deepEqual(conflicts, []);
});

test('customised: the user keeps their values, Ang adds three and removes two, and the outputStyle conflict is dropped', () => {
  const { merged, conflicts } = mergeSettings(BASE, CUSTOMISED, TARGET);
  assertUserSurvives(merged);
  assertUpgraded(merged);
  assert.equal(count(merged, 'session banner'), 1, 'old banner hook replaced, not duplicated');
  assert.ok(s(merged).includes('session banner --compact'));
  assert.deepEqual(conflicts, []);
});

test('edited: the local matcher edit is kept and the banner edited on both sides is one conflict with both entries kept', () => {
  const { merged, conflicts } = mergeSettings(BASE, EDITED, TARGET);
  assertUserSurvives(merged);
  assertUpgraded(merged);
  assert.ok(s(merged).includes('Write|Edit|MultiEdit|NotebookEdit'));
  assert.deepEqual(merged.hooks.SessionStart, [group('session banner --no-mail'), group('session banner --compact')]);
  assert.deepEqual(conflicts, [{
    path: ['hooks', 'SessionStart'],
    base: group('session banner'),
    ours: [group('session banner --no-mail')],
    theirs: [group('session banner --compact')],
  }]);
});

test('no record: an empty base gives the install merge, removing nothing', () => {
  const { merged } = mergeSettings({}, PRE_ANG, BASE);
  assert.equal(s(merged), s(CUSTOMISED));
  const upgrade = mergeSettings({}, CUSTOMISED, TARGET).merged;
  assert.equal(s(upgrade), s(installMerge(CUSTOMISED, TARGET)));
  assert.ok(s(upgrade).includes('Bash(jq:*)'), 'stale entries stay without a base');
});

test('every scenario re-run against the same base and target changes nothing', () => {
  for (const [base, ours] of [[BASE, copy(BASE)], [BASE, CUSTOMISED], [BASE, EDITED], [{}, CUSTOMISED]]) {
    const once = mergeSettings(base, ours, TARGET).merged;
    assert.equal(s(mergeSettings(TARGET, once, TARGET).merged), s(once));
    assert.equal(s(mergeSettings(base, once, TARGET).merged), s(once));
  }
});

test('an entry both sides removed is not a conflict unless both added their own', () => {
  assert.deepEqual(mergeArray(['a', 'b'], ['a'], ['a']), { merged: ['a'], conflicts: [] });
  assert.deepEqual(mergeArray(['a', 'b'], ['a', 'c'], ['a']), { merged: ['a', 'c'], conflicts: [] });
  assert.deepEqual(mergeArray(['a', 'b'], ['a', 'c'], ['a', 'c']), { merged: ['a', 'c'], conflicts: [] });
});

test('every scenario re-run against the old base reports no new conflicts', () => {
  for (const ours of [copy(BASE), CUSTOMISED]) {
    const once = mergeSettings(BASE, ours, TARGET).merged;
    assert.deepEqual(mergeSettings(BASE, once, TARGET).conflicts, []);
  }
});

test('a key the user deleted stays deleted while base and target still have it', () => {
  const ours = copy(BASE);
  delete ours.hooks.SubagentStart;
  const { merged, conflicts } = mergeSettings(BASE, ours, TARGET);
  assert.ok(!('SubagentStart' in merged.hooks));
  assert.deepEqual(conflicts, []);
});

test('array entries that differ only in key order are the same entry', () => {
  const reordered = { hooks: [{ command: 'x', type: 'command' }], matcher: 'Write' };
  const original = { matcher: 'Write', hooks: [{ type: 'command', command: 'x' }] };
  assert.deepEqual(mergeArray([], [original], [reordered]), { merged: [original], conflicts: [] });
  assert.deepEqual(mergeArray([reordered], [original], []), { merged: [], conflicts: [] });
});

test('new keys follow the user keys, in the target order', () => {
  const { merged } = mergeSettings({}, { b: 1, a: 1 }, { c: 1, a: 2, d: 1 });
  assert.deepEqual(Object.keys(merged), ['b', 'a', 'c', 'd']);
});
