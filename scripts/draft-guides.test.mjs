import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { draftGuides } from './draft-guides.mjs';

const SCRIPT = path.join(import.meta.dirname, 'draft-guides.mjs');

const dirs = [];
const tempDir = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'draft-guides-'));
  dirs.push(dir);
  return dir;
};
after(() => dirs.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })));

const guide = (version, from) =>
  `# Upgrade guide ${version}\nfrom: ${from}\n## Moves\n- None\n## Migrations\n- None\n## Retired\n- None\n## Notes for the merge\n- None\n`;

const guidesDir = (guides) => {
  const dir = tempDir();
  for (const [version, from] of guides) fs.writeFileSync(path.join(dir, `${version}.md`), guide(version, from));
  return dir;
};

const parsed = (version, from) => ({ version, from, moves: [], migrations: [], retired: [], notes: [] });

describe('draftGuides', () => {
  test('a single guide whose from: is the from tag', async () => {
    const dir = guidesDir([['v1.1.0', 'v1.0.0']]);
    assert.deepEqual(await draftGuides({ dir, fromTag: 'v1.0.0', toTag: 'v1.1.0' }), [parsed('v1.1.0', 'v1.0.0')]);
  });

  test('a chain from two releases back includes every guide after the from tag, oldest first', async () => {
    const dir = guidesDir([['v1.0.0', 'v1.0.0-rc.2'], ['v1.1.0', 'v1.0.0'], ['v1.2.0', 'v1.1.0']]);
    assert.deepEqual(await draftGuides({ dir, fromTag: 'v1.0.0-rc.2', toTag: 'v1.2.0' }), [
      parsed('v1.0.0', 'v1.0.0-rc.2'),
      parsed('v1.1.0', 'v1.0.0'),
      parsed('v1.2.0', 'v1.1.0'),
    ]);
  });

  test('a missing guide in the chain names the tag and its path', async () => {
    const dir = guidesDir([['v1.2.0', 'v1.1.0']]);
    await assert.rejects(draftGuides({ dir, fromTag: 'v1.0.0', toTag: 'v1.2.0' }), {
      message: 'no upgrade guide for v1.1.0 at releases/upgrades/v1.1.0.md',
    });
  });

  test("a guide that doesn't parse passes parseGuide's message through", async () => {
    const dir = tempDir();
    fs.writeFileSync(path.join(dir, 'v1.1.0.md'), '# Upgrade guide v1.1.0\n## Moves\n- None\n');
    await assert.rejects(draftGuides({ dir, fromTag: 'v1.0.0', toTag: 'v1.1.0' }), { message: 'missing "from:" line' });
  });

  test("a loop passes chainGuides' message through", async () => {
    const dir = guidesDir([['v1.1.0', 'v1.2.0'], ['v1.2.0', 'v1.1.0']]);
    await assert.rejects(draftGuides({ dir, fromTag: 'v1.0.0', toTag: 'v1.2.0' }), {
      message: 'broken chain: from: lines loop back to v1.2.0 between v1.0.0 and v1.2.0',
    });
  });

  test("a chain that never reaches the from tag passes chainGuides' message through", async () => {
    const dir = guidesDir([['v1.1.0', 'none']]);
    await assert.rejects(draftGuides({ dir, fromTag: 'v1.0.0', toTag: 'v1.1.0' }), {
      message: 'broken chain: the guides from v1.1.0 back to the first release never reach v1.0.0',
    });
  });
});

describe('draft-guides CLI', () => {
  const run = (...args) => spawnSync('node', [SCRIPT, ...args], { cwd: tempDir(), encoding: 'utf8' });

  test('fewer than two arguments exits 1 with a usage line', () => {
    const { status, stdout, stderr } = run('v1.0.0');
    assert.equal(status, 1);
    assert.equal(stdout, '');
    assert.match(stderr, /^usage: node scripts\/draft-guides\.mjs <fromTag> <toTag>\n$/);
  });

  test('a broken chain exits 1 with one line on stderr and nothing on stdout', () => {
    const { status, stdout, stderr } = run('v0.0.1', 'v0.0.2');
    assert.equal(status, 1);
    assert.equal(stdout, '');
    assert.equal(stderr, 'no upgrade guide for v0.0.2 at releases/upgrades/v0.0.2.md\n');
  });
});
