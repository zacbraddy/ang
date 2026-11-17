import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CLI = path.join(import.meta.dirname, 'ang-context-manager.mjs');
const dirs = [];
after(() => dirs.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })));

// A temp project holding the given files ({ 'ang.json': {...} }; strings are written raw; nested paths are fine), with the CLI spawned against it
// and given `input` on stdin. paths.mjs reads CLAUDE_PROJECT_DIR at import time, so a fresh process per run is the only clean seam.
function project(files = {}, { input = '' } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ang-cli-'));
  dirs.push(dir);
  for (const [name, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
    fs.writeFileSync(path.join(dir, name), typeof content === 'string' ? content : JSON.stringify(content));
  }
  const run = (...args) => {
    const env = { ...process.env, CLAUDE_PROJECT_DIR: dir, ORCA_WORKTREE_ID: 'test' };
    const { status, stdout, stderr } = spawnSync(process.execPath, [CLI, ...args], { cwd: dir, env, encoding: 'utf8', input });
    return { status, out: stdout + stderr };
  };
  return { dir, run };
}

test('library validate passes with no config files', () => {
  const { status, out } = project().run('library', 'validate');
  assert.equal(status, 0, out);
  assert.doesNotMatch(out, /ang(\.local)?\.json/);
});

test('library validate warns about a project-wide key in ang.local.json and still passes', () => {
  const { status, out } = project({ 'ang.local.json': { streams: true } }).run('library', 'validate');
  assert.equal(status, 0, out);
  assert.match(out, /⚠ ang\.local\.json: streams ignored, it's project-wide; set it in ang\.json/);
});

test('library validate fails on invalid JSON in ang.json, naming the file', () => {
  const { status, out } = project({ 'ang.json': '{ nope' }).run('library', 'validate');
  assert.equal(status, 1, out);
  assert.match(out, /✖ ang\.json: invalid JSON/);
});

test('session banner names the host set in ang.local.json', () => {
  const { status, out } = project({ 'ang.local.json': { host: 'orca' } }).run('session', 'banner');
  assert.equal(status, 0, out);
  assert.match(out, /^Ang: host \(orca\)$/m);
});

test('session banner names the pilot and carries their rule', () => {
  const { run } = project({ 'ang.local.json': { pilot: 'Zac' } });
  const banner = run('session', 'banner');
  assert.equal(banner.status, 0, banner.out);
  assert.match(banner.out, /^Ang: pilot \(Zac\)$/m);
  assert.match(banner.out, /Zac is the pilot/);
  const validate = run('library', 'validate');
  assert.equal(validate.status, 0, validate.out);
});

test('session subagent carries the pilot rule', () => {
  const { status, out } = project({ 'ang.local.json': { pilot: 'Zac' } }, { input: '{"agent_type":"Explore"}' }).run('session', 'subagent');
  assert.equal(status, 0, out);
  assert.match(JSON.parse(out).hookSpecificOutput.additionalContext, /## Pilot/);
});

test('library validate fails on a blank pilot, naming it', () => {
  const { status, out } = project({ 'ang.local.json': { pilot: '  ' } }).run('library', 'validate');
  assert.equal(status, 1, out);
  assert.match(out, /ang\.local\.json: pilot must be null or a name/);
});

test('session banner flags invalid config', () => {
  const { out } = project({ 'ang.json': '[' }).run('session', 'banner');
  assert.match(out, /^Ang: .* · Ang config invalid, run ang-context-manager\.mjs library validate$/m);
});

test('session features marks host and pilot as personal', () => {
  const { status, out } = project().run('session', 'features');
  assert.equal(status, 0, out);
  assert.match(out, /\*\*host\*\*.* — personal, set by `\/tailor-ang`/);
  assert.match(out, /\*\*pilot\*\*.* — personal, set by `\/tailor-ang`/);
  assert.doesNotMatch(out, /\*\*intent\*\*.*personal/);
});

const readFile = (dir, name) => fs.readFileSync(path.join(dir, name), 'utf8');
const SETTINGS = {
  'base.json': { a: 1, list: ['x', 'y'] },
  'ours.json': { mine: true, a: 1, list: ['x', 'y'] },
  'theirs.json': { a: 2, list: ['x', 'z'] },
};

test('settings merge writes --ours in place and prints no conflicts as []', () => {
  const { dir, run } = project(SETTINGS);
  const { status, out } = run('settings', 'merge', '--base', 'base.json', '--ours', 'ours.json', '--theirs', 'theirs.json');
  assert.equal(status, 0, out);
  assert.deepEqual(JSON.parse(out), []);
  assert.equal(readFile(dir, 'ours.json'), JSON.stringify({ mine: true, a: 2, list: ['x', 'z'] }, null, 2) + '\n');
});

test('settings merge prints conflicts as JSON and still writes --ours', () => {
  const { dir, run } = project({ ...SETTINGS, 'ours.json': { a: 3, list: ['x', 'y'] } });
  const { status, out } = run('settings', 'merge', '--base', 'base.json', '--ours', 'ours.json', '--theirs', 'theirs.json');
  assert.equal(status, 0, out);
  assert.deepEqual(JSON.parse(out), [{ path: ['a'], base: 1, ours: 3, theirs: 2 }]);
  assert.deepEqual(JSON.parse(readFile(dir, 'ours.json')), { a: 3, list: ['x', 'z'] });
});

test('settings merge with --base none and no --ours file creates it holding the target', () => {
  const { dir, run } = project({ 'theirs.json': SETTINGS['theirs.json'] });
  const { status, out } = run('settings', 'merge', '--base', 'none', '--ours', '.claude/settings.json', '--theirs', 'theirs.json');
  assert.equal(status, 0, out);
  assert.deepEqual(JSON.parse(readFile(dir, '.claude/settings.json')), SETTINGS['theirs.json']);
});

test('settings merge fails naming a missing or invalid input, leaving --ours untouched', () => {
  for (const [file, content] of [['theirs.json', undefined], ['base.json', undefined], ['theirs.json', '{ nope'], ['ours.json', '[']]) {
    const files = { ...SETTINGS, 'ours.json': '{"a": 1}' };
    if (content === undefined) delete files[file];
    else files[file] = content;
    const { dir, run } = project(files);
    const { status, out } = run('settings', 'merge', '--base', 'base.json', '--ours', 'ours.json', '--theirs', 'theirs.json');
    assert.equal(status, 1, out);
    assert.match(out, new RegExp(file.replace('.', '\\.')));
    assert.equal(readFile(dir, 'ours.json'), files['ours.json']);
  }
});

test('version show prints none without a record', () => {
  const { status, out } = project().run('version', 'show');
  assert.equal(status, 0, out);
  assert.equal(out, 'none\n');
});

test('version write replaces the record and version show prints it', () => {
  const sha = 'a'.repeat(40);
  const { run } = project({ '.claude/ang/version.json': { ref: 'v0.9.0', sha: 'b'.repeat(40), installedAt: '2026-01-01T00:00:00.000Z' } });
  const write = run('version', 'write', '--ref', 'v1.0.0', '--sha', sha);
  assert.equal(write.status, 0, write.out);
  const show = run('version', 'show');
  assert.equal(show.status, 0, show.out);
  const record = JSON.parse(show.out);
  assert.deepEqual(Object.keys(record), ['ref', 'sha', 'installedAt']);
  assert.equal(record.ref, 'v1.0.0');
  assert.equal(record.sha, sha);
  assert.ok(!Number.isNaN(Date.parse(record.installedAt)) && record.installedAt !== '2026-01-01T00:00:00.000Z');
});

test('version write creates .claude/ang/ when it is missing', () => {
  const { dir, run } = project();
  const { status, out } = run('version', 'write', '--ref', 'v1.0.0', '--sha', 'c'.repeat(40));
  assert.equal(status, 0, out);
  assert.equal(JSON.parse(readFile(dir, '.claude/ang/version.json')).ref, 'v1.0.0');
});

test('version write rejects a SHA that is not 40 hex characters and writes nothing', () => {
  for (const sha of ['abc123', 'G'.repeat(40), 'a'.repeat(41)]) {
    const { dir, run } = project();
    const { status, out } = run('version', 'write', '--ref', 'v1.0.0', '--sha', sha);
    assert.equal(status, 1, out);
    assert.ok(!fs.existsSync(path.join(dir, '.claude/ang/version.json')));
  }
});

test('version show fails naming a corrupt record', () => {
  const { status, out } = project({ '.claude/ang/version.json': '{ nope' }).run('version', 'show');
  assert.equal(status, 1, out);
  assert.match(out, /version\.json: invalid JSON/);
});
