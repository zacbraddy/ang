import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeConfig } from './config.mjs';

const DEFAULTS = { intent: false, streams: false, host: null, pilot: null };

test('no files: every feature takes its default, no errors or warnings', () => {
  assert.deepEqual(mergeConfig(undefined, undefined), { config: DEFAULTS, errors: [], warnings: [] });
});

test('ang.json overrides the defaults', () => {
  const { config, errors } = mergeConfig({ intent: true, host: 'orca' }, undefined);
  assert.deepEqual(config, { ...DEFAULTS, intent: true, host: 'orca' });
  assert.deepEqual(errors, []);
});

test('ang.local.json host overrides ang.json host', () => {
  const { config, errors, warnings } = mergeConfig({ host: null }, { host: 'orca' });
  assert.equal(config.host, 'orca');
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
});

test('ang.json pilot applies, and ang.local.json pilot beats it', () => {
  assert.equal(mergeConfig({ pilot: 'Ada' }, undefined).config.pilot, 'Ada');
  const { config, errors, warnings } = mergeConfig({ pilot: 'Ada' }, { pilot: 'Zac' });
  assert.equal(config.pilot, 'Zac');
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
});

test('ang.local.json project-wide key is dropped with a warning naming it', () => {
  const { config, errors, warnings } = mergeConfig({ intent: true }, { intent: false });
  assert.equal(config.intent, true);
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, ['ang.local.json: intent ignored, it\'s project-wide; set it in ang.json']);
});

for (const [name, args] of [['ang.json', (bad) => [bad, undefined]], ['ang.local.json', (bad) => [undefined, bad]]]) {
  test(`${name}: unknown key errors naming the file and key`, () => {
    const { config, errors } = mergeConfig(...args({ nope: true }));
    assert.deepEqual(config, DEFAULTS);
    assert.equal(errors.length, 1);
    assert.match(errors[0], new RegExp(`^${name}: nope is not a known key`));
  });

  test(`${name}: bad value errors naming the file and key, and the key keeps its default`, () => {
    const { config, errors } = mergeConfig(...args({ host: 'tmux' }));
    assert.equal(config.host, null);
    assert.equal(errors.length, 1);
    assert.match(errors[0], new RegExp(`^${name}: host must be`));
  });

  for (const bad of ['', '   ', 42]) {
    test(`${name}: pilot ${JSON.stringify(bad)} errors and pilot stays off`, () => {
      const { config, errors } = mergeConfig(...args({ pilot: bad }));
      assert.equal(config.pilot, null);
      assert.deepEqual(errors, [`${name}: pilot must be null or a name`]);
    });
  }

  for (const bad of [[], 'orca', null]) {
    test(`${name}: ${JSON.stringify(bad)} is not an object, so the file is treated as missing`, () => {
      const { config, errors } = mergeConfig(...args(bad));
      assert.deepEqual(config, DEFAULTS);
      assert.deepEqual(errors, [`${name}: must be a JSON object`]);
    });
  }
}
