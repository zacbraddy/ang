import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { featureRule, onRules } from './features.mjs';

const dirs = [];
after(() => dirs.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })));

function featureDir(ruleMd) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ang-feature-'));
  dirs.push(dir);
  if (ruleMd !== undefined) fs.writeFileSync(path.join(dir, 'rule.md'), ruleMd);
  return dir;
}

test('featureRule: a rule(value) export beats rule.md and gets the feature\'s config value', () => {
  const feature = { key: 'pilot', dir: featureDir('static rule'), rule: (name) => `${name} rule` };
  assert.equal(featureRule(feature, { pilot: 'Zac' }), 'Zac rule');
});

test('featureRule: falls back to the trimmed rule.md', () => {
  const feature = { key: 'intent', dir: featureDir('\n## Intent\n\n') };
  assert.equal(featureRule(feature, { intent: true }), '## Intent');
});

test('featureRule: null when there is neither', () => {
  assert.equal(featureRule({ key: 'streams', dir: featureDir() }, { streams: true }), null);
});

test('onRules: carries the rules of on features only', () => {
  const rules = onRules({ intent: false, streams: false, host: null, pilot: 'Zac' }).join('\n\n');
  assert.match(rules, /## Pilot/);
  assert.doesNotMatch(rules, /## Delivery intent/);
});
