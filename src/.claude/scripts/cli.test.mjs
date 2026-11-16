import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CLI = path.join(import.meta.dirname, 'ang-context-manager.mjs');
const dirs = [];
after(() => dirs.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })));

// A temp project holding the given files ({ 'ang.json': {...} }; strings are written raw), with the CLI spawned against it.
// paths.mjs reads CLAUDE_PROJECT_DIR at import time, so a fresh process per run is the only clean seam.
function project(files = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ang-cli-'));
  dirs.push(dir);
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), typeof content === 'string' ? content : JSON.stringify(content));
  }
  const run = (...args) => {
    const env = { ...process.env, CLAUDE_PROJECT_DIR: dir, ORCA_WORKTREE_ID: 'test' };
    const { status, stdout, stderr } = spawnSync(process.execPath, [CLI, ...args], { cwd: dir, env, encoding: 'utf8', input: '' });
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

test('session banner flags invalid config', () => {
  const { out } = project({ 'ang.json': '[' }).run('session', 'banner');
  assert.match(out, /^Ang: .* · Ang config invalid, run ang-context-manager\.mjs library validate$/m);
});

test('session features marks host as personal', () => {
  const { status, out } = project().run('session', 'features');
  assert.equal(status, 0, out);
  assert.match(out, /\*\*host\*\*.* — personal, set by `\/tailor-ang`/);
  assert.doesNotMatch(out, /\*\*intent\*\*.*personal/);
});
