import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
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

// spawnSync blocks the event loop, so a server in this process could never answer it: these runs spawn asynchronously.
function runAsync(args, env, files = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ang-cli-'));
  dirs.push(dir);
  for (const [name, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
    fs.writeFileSync(path.join(dir, name), JSON.stringify(content));
  }
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [CLI, ...args], { cwd: dir, env: { ...process.env, CLAUDE_PROJECT_DIR: dir, ...env } });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => (stdout += chunk));
    child.stderr.on('data', (chunk) => (stderr += chunk));
    child.on('close', (status) => resolve({ status, stdout, stderr }));
  });
}

// Answers each request with the body mapped to its URL, or a 404.
async function serve(bodies) {
  const server = http.createServer((req, res) => {
    const body = bodies[req.url];
    res.writeHead(body ? 200 : 404).end(body ?? 'Not Found');
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  after(() => server.close());
  return `http://127.0.0.1:${server.address().port}`;
}

const upgradeGuide = (version, from) =>
  `# Upgrade guide ${version}\nfrom: ${from}\n## Moves\n- None\n## Migrations\n- None\n## Retired\n- None\n## Notes for the merge\n- None\n`;
const AT_V120 = '/zacbraddy/ang/v1.2.0/releases/upgrades';

test('upgrade --help lists upgrade guides', () => {
  const { status, out } = project().run('upgrade', '--help');
  assert.equal(status, 0, out);
  assert.match(out, /upgrade guides --from <tag> --to <tag>/);
});

test('upgrade guides prints the chain oldest first as JSON', async () => {
  const base = await serve({
    [`${AT_V120}/v1.1.0.md`]: upgradeGuide('v1.1.0', 'v1.0.0'),
    [`${AT_V120}/v1.2.0.md`]: upgradeGuide('v1.2.0', 'v1.1.0'),
  });
  const { status, stdout, stderr } = await runAsync(['upgrade', 'guides', '--from', 'v1.0.0', '--to', 'v1.2.0'], { ANG_GITHUB_RAW: base });
  assert.equal(status, 0, stderr);
  assert.deepEqual(JSON.parse(stdout).map((g) => [g.version, g.from]), [['v1.1.0', 'v1.0.0'], ['v1.2.0', 'v1.1.0']]);
});

test('upgrade guides fails naming a missing guide', async () => {
  const base = await serve({ [`${AT_V120}/v1.2.0.md`]: upgradeGuide('v1.2.0', 'v1.1.0') });
  const { status, stdout, stderr } = await runAsync(['upgrade', 'guides', '--from', 'v1.0.0', '--to', 'v1.2.0'], { ANG_GITHUB_RAW: base });
  assert.equal(status, 1);
  assert.equal(stdout, '');
  assert.match(stderr, /^✖ no upgrade guide for v1\.1\.0 at v1\.2\.0/);
});

test('upgrade --help lists upgrade plan and upgrade apply', () => {
  const { status, out } = project().run('upgrade', '--help');
  assert.equal(status, 0, out);
  assert.match(out, /upgrade plan --base <dir\|none> --target <dir> \[--guides <file>\]/);
  assert.match(out, /upgrade apply --plan <file>/);
});

const BASE6 = 'one\ntwo\nthree\nfour\nfive\nsix\n';
function folder(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ang-tree-'));
  dirs.push(dir);
  for (const [name, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
    fs.writeFileSync(path.join(dir, name), content);
  }
  return dir;
}
const snapshotTree = (dir) => Object.fromEntries(fs.readdirSync(dir, { recursive: true, withFileTypes: true })
  .filter((e) => e.isFile() && !path.relative(dir, e.parentPath).split(path.sep).includes('.git'))
  .map((e) => [path.relative(dir, path.join(e.parentPath, e.name)), fs.readFileSync(path.join(e.parentPath, e.name), 'utf8')]));

// One file per category the plan can reach, plus a move of .claude/ang.json the user edited.
function upgradeScenario() {
  const base = folder({
    'unchanged.md': 'x', 'fast.md': '1', 'fpd.md': '1', 'keep.md': '1', 'clean.md': BASE6, 'conflict.md': BASE6, 'cdel.md': '1',
    '.claude/ang.json': '{"a":1}', '.claude/settings.json': '{}',
  });
  const target = folder({
    'unchanged.md': 'x', 'fast.md': '2', 'new.md': 'n', 'keep.md': '1', 'clean.md': BASE6.replace('six', 'SIX'),
    'conflict.md': BASE6.replace('one', 'uno'), 'ang.json': '{"a":1}', '.claude/settings.json': '{"b":2}',
  });
  const proj = project({
    'unchanged.md': 'x', 'fast.md': '1', 'fpd.md': '1', 'keep.md': 'L', 'clean.md': BASE6.replace('one', 'ONE'),
    'conflict.md': BASE6.replace('one', 'ONE'), 'cdel.md': 'L', '.claude/ang.json': '{"a":1,"streams":true}',
    '.claude/settings.json': '{"mine":true}', 'mine.md': 'm',
  });
  const git = (...args) => execFileSync('git', ['-C', proj.dir, ...args], { encoding: 'utf8' });
  git('init', '-q');
  git('add', '.');
  git('-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-qm', 'init');
  const guides = folder({ 'guides.json': JSON.stringify([{ version: 'v1.1.0', from: 'v1.0.0', moves: [{ from: '.claude/ang.json', to: 'ang.json', note: '' }], migrations: [], retired: [], notes: [] }]) });
  return { base, target, proj, git, guidesFile: path.join(guides, 'guides.json') };
}

test('upgrade plan classifies every file into a temp folder, writing nothing in the project', () => {
  const { base, target, proj, guidesFile } = upgradeScenario();
  const before = snapshotTree(proj.dir);
  const { status, out } = proj.run('upgrade', 'plan', '--base', base, '--target', target, '--guides', guidesFile);
  assert.equal(status, 0, out);
  const plan = JSON.parse(out);
  dirs.push(plan.tempDir);
  assert.equal(plan.route.route, 'agent-resolved');
  assert.deepEqual(plan.entries.map((e) => [e.path, e.category]), [
    ['ang.json', 'keep-local'], ['cdel.md', 'conflict-delete'], ['clean.md', 'clean-merge'], ['conflict.md', 'conflict'],
    ['fast.md', 'fast-path'], ['fpd.md', 'fast-path-delete'], ['keep.md', 'keep-local'], ['new.md', 'upstream-new'], ['unchanged.md', 'unchanged'],
  ]);
  const byPath = Object.fromEntries(plan.entries.map((e) => [e.path, e]));
  assert.equal(byPath['ang.json'].movedFrom, '.claude/ang.json');
  for (const [p, bytes] of [['ang.json', '{"a":1,"streams":true}'], ['fast.md', '2'], ['new.md', 'n'], ['clean.md', BASE6.replace('one', 'ONE').replace('six', 'SIX')]]) {
    assert.ok(byPath[p].mergedFile.startsWith(plan.tempDir), p);
    assert.equal(fs.readFileSync(byPath[p].mergedFile, 'utf8'), bytes, p);
  }
  assert.match(fs.readFileSync(byPath['conflict.md'].mergedFile, 'utf8'), /^<{7} local$/m);
  assert.deepEqual(snapshotTree(proj.dir), before);
});

test('upgrade apply refuses an unresolved plan, listing every problem and writing nothing', () => {
  const { base, target, proj, guidesFile } = upgradeScenario();
  const plan = JSON.parse(proj.run('upgrade', 'plan', '--base', base, '--target', target, '--guides', guidesFile).out);
  dirs.push(plan.tempDir);
  const planFile = path.join(plan.tempDir, 'plan.json');
  fs.writeFileSync(planFile, JSON.stringify(plan));
  const before = snapshotTree(proj.dir);
  const { status, out } = proj.run('upgrade', 'apply', '--plan', planFile);
  assert.equal(status, 1, out);
  assert.match(out, /conflict\.md: conflict needs a resolution/);
  assert.match(out, /cdel\.md: conflict-delete needs a resolution/);
  assert.deepEqual(snapshotTree(proj.dir), before);
});

test('upgrade apply writes a resolved plan to the working tree, leaving it unstaged', () => {
  const { base, target, proj, git, guidesFile } = upgradeScenario();
  const plan = JSON.parse(proj.run('upgrade', 'plan', '--base', base, '--target', target, '--guides', guidesFile).out);
  dirs.push(plan.tempDir);
  for (const entry of plan.entries) {
    if (entry.path === 'conflict.md') {
      fs.writeFileSync(entry.mergedFile, BASE6.replace('one', 'ONE uno'));
      entry.resolution = 'write';
    }
    if (entry.path === 'cdel.md') entry.resolution = 'keep';
  }
  const planFile = path.join(plan.tempDir, 'plan.json');
  fs.writeFileSync(planFile, JSON.stringify(plan));
  const { status, out } = proj.run('upgrade', 'apply', '--plan', planFile);
  assert.equal(status, 0, out);
  assert.deepEqual(JSON.parse(out), {
    written: ['ang.json', 'clean.md', 'conflict.md', 'fast.md', 'new.md'],
    deleted: ['fpd.md'],
    kept: ['cdel.md', 'keep.md'],
  });
  assert.deepEqual(snapshotTree(proj.dir), {
    'ang.json': '{"a":1,"streams":true}', 'cdel.md': 'L', 'clean.md': BASE6.replace('one', 'ONE').replace('six', 'SIX'),
    'conflict.md': BASE6.replace('one', 'ONE uno'), 'fast.md': '2', 'new.md': 'n', 'keep.md': 'L', 'unchanged.md': 'x',
    '.claude/settings.json': '{"mine":true}', 'mine.md': 'm',
  });
  assert.equal(git('diff', '--cached'), '');
});

test('upgrade plan with --base none classifies without a base and routes guided with warning', () => {
  const { target, proj } = upgradeScenario();
  const { status, out } = proj.run('upgrade', 'plan', '--base', 'none', '--target', target);
  assert.equal(status, 0, out);
  const plan = JSON.parse(out);
  dirs.push(plan.tempDir);
  assert.equal(plan.route.route, 'guided-with-warning');
  const categories = Object.fromEntries(plan.entries.map((e) => [e.path, e.category]));
  assert.equal(categories['fast.md'], 'conflict-no-base');
  assert.equal(categories['unchanged.md'], 'unchanged');
  assert.equal(categories['new.md'], 'upstream-new');
});

test('upgrade plan fails naming a missing folder or an unreadable guides file', () => {
  const { base, target, proj } = upgradeScenario();
  const missing = path.join(os.tmpdir(), 'ang-no-such-folder');
  for (const args of [['--base', missing, '--target', target], ['--base', base, '--target', missing], ['--base', base, '--target', target, '--guides', missing]]) {
    const { status, out } = proj.run('upgrade', 'plan', ...args);
    assert.equal(status, 1, out);
    assert.match(out, /^✖ .*ang-no-such-folder/m);
  }
});

const SHA = 'b'.repeat(40);
const RELEASES = '/repos/zacbraddy/ang/releases';
const COMMITS = '/repos/zacbraddy/ang/commits';
const releaseJson = (tag, draft = false) => JSON.stringify({ tag_name: tag, draft });
const recordAt = (ref) => ({ '.claude/ang/version.json': { ref, sha: 'a'.repeat(40), installedAt: '2026-11-01T00:00:00.000Z' } });

test('upgrade --help lists upgrade target', () => {
  const { status, out } = project().run('upgrade', '--help');
  assert.equal(status, 0, out);
  assert.match(out, /upgrade target \[--to <tag>\]/);
});

test('upgrade target resolves the latest stable release as an upgrade from the record', async () => {
  const api = await serve({ [`${RELEASES}/latest`]: releaseJson('v1.1.0'), [`${COMMITS}/v1.1.0`]: SHA });
  const { status, stdout, stderr } = await runAsync(['upgrade', 'target'], { ANG_GITHUB_API: api }, recordAt('v1.0.0'));
  assert.equal(status, 0, stderr);
  const { status: verdict, from, to } = JSON.parse(stdout);
  assert.equal(verdict, 'upgrade');
  assert.equal(from.ref, 'v1.0.0');
  assert.deepEqual(to, { ref: 'v1.1.0', sha: SHA });
});

test('upgrade target with --to and no record is no-record with a null from', async () => {
  const api = await serve({ [`${RELEASES}/tags/v1.0.0-rc.2`]: releaseJson('v1.0.0-rc.2'), [`${COMMITS}/v1.0.0-rc.2`]: SHA });
  const { status, stdout, stderr } = await runAsync(['upgrade', 'target', '--to', 'v1.0.0-rc.2'], { ANG_GITHUB_API: api });
  assert.equal(status, 0, stderr);
  assert.deepEqual(JSON.parse(stdout), { status: 'no-record', from: null, to: { ref: 'v1.0.0-rc.2', sha: SHA } });
});

test('upgrade target fails saying to name a tag when there is no latest release', async () => {
  const api = await serve({});
  const { status, stdout, stderr } = await runAsync(['upgrade', 'target'], { ANG_GITHUB_API: api }, recordAt('v1.0.0-rc.1'));
  assert.equal(status, 1);
  assert.equal(stdout, '');
  assert.match(stderr, /^✖ GitHub has no latest Ang release[\s\S]*\/upgrade-ang <tag>/);
});

test('upgrade target fails on a draft tag as not a published release', async () => {
  const api = await serve({ [`${RELEASES}/tags/v2.0.0`]: releaseJson('v2.0.0', true), [`${COMMITS}/v2.0.0`]: SHA });
  const { status, stderr } = await runAsync(['upgrade', 'target', '--to', 'v2.0.0'], { ANG_GITHUB_API: api }, recordAt('v1.0.0'));
  assert.equal(status, 1);
  assert.match(stderr, /^✖ v2\.0\.0 isn't a published Ang release/);
});
