// Runs the root install.sh the way the one-liner does (piped into `sh -s --`) against temp git repos.
// giget is an `npx` stub on PATH that copies this repo's tracked src/, and GitHub is a local server behind ANG_GITHUB_API.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const INSTALL = path.join(REPO_ROOT, 'install.sh');
const ONE_LINER = 'curl -fsSL https://github.com/zacbraddy/ang/releases/latest/download/install.sh | sh';
const STAMP_TAG = 'v1.0.0';
const STAMP_SHA = 'a'.repeat(40);
const RELEASE_SHA = 'b'.repeat(40);

const dirs = [];
const tempDir = (prefix) => {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
  dirs.push(dir);
  return dir;
};
after(() => dirs.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })));

const GIT_ENV = { GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' };
const git = (cwd, ...args) => execFileSync('git', ['-c', 'commit.gpgsign=false', ...args], { cwd, env: { ...process.env, ...GIT_ENV }, encoding: 'utf8' });

let api;
const apiHits = [];
const paths = {};

before(async () => {
  // What giget would fetch: src/ as committed, with this checkout's edits.
  paths.src = tempDir('ang-src-');
  for (const file of git(REPO_ROOT, 'ls-files', 'src').split('\n').filter(Boolean)) {
    const to = path.join(paths.src, path.relative('src', file));
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.cpSync(path.join(REPO_ROOT, file), to, { dereference: true });
  }

  const bin = tempDir('ang-bin-');
  const write = (dir, name, body) => {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, name), body, { mode: 0o755 });
  };
  const npx = `#!/bin/sh
printf '%s\\n' "$@" > "$ANG_TEST_NPX_LOG"
[ -z "\${ANG_TEST_NPX_FAIL:-}" ] || { echo 'giget: fetch failed' >&2; exit 1; }
mkdir -p "$4" && cp -R "$ANG_TEST_SRC/." "$4"
`;
  paths.withNpx = path.join(bin, 'with-npx');
  paths.noNpx = path.join(bin, 'no-npx');
  paths.oldNode = path.join(bin, 'old-node');
  write(paths.withNpx, 'npx', npx);
  fs.mkdirSync(paths.noNpx);
  for (const dir of [paths.withNpx, paths.noNpx]) fs.symlinkSync(process.execPath, path.join(dir, 'node'));
  write(paths.oldNode, 'npx', npx);
  paths.gitBash = path.join(bin, 'git-bash');
  write(paths.gitBash, 'npx', npx);
  write(paths.gitBash, 'uname', '#!/bin/sh\necho MINGW64_NT-10.0-19045\n');
  fs.symlinkSync(process.execPath, path.join(paths.gitBash, 'node'));
  write(paths.oldNode, 'node', `#!/bin/sh
[ "\${2:-}" = process.versions.node ] && { echo 24.0.0; exit 0; }
exec "${process.execPath}" "$@"
`);
  // The rest of PATH (git, cp, mktemp…) minus wherever the real node and npx live.
  paths.rest = process.env.PATH.split(path.delimiter)
    .filter((dir) => dir && !fs.existsSync(path.join(dir, 'npx')) && !fs.existsSync(path.join(dir, 'node')))
    .join(path.delimiter);

  const releases = {
    [`/repos/zacbraddy/ang/releases/tags/${STAMP_TAG}`]: { status: 200, body: JSON.stringify({ tag_name: STAMP_TAG, draft: false }) },
    '/repos/zacbraddy/ang/releases/tags/v0.9.0': { status: 200, body: JSON.stringify({ tag_name: 'v0.9.0', draft: true }) },
    '/repos/zacbraddy/ang/releases/tags/v-limited': { status: 403, body: '{}', headers: { 'x-ratelimit-remaining': '0' } },
    [`/repos/zacbraddy/ang/commits/${STAMP_TAG}`]: { status: 200, body: RELEASE_SHA },
  };
  api = http.createServer((req, res) => {
    apiHits.push(req.url);
    const route = releases[req.url] ?? { status: 404, body: '{"message":"Not Found"}' };
    res.writeHead(route.status, route.headers).end(route.body);
  });
  await new Promise((resolve) => api.listen(0, '127.0.0.1', resolve));
});
after(() => api.close());

function repo({ files = {}, commit = true } = {}) {
  const root = tempDir('ang-repo-');
  git(root, 'init', '-q');
  for (const [file, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), content);
  }
  if (commit && Object.keys(files).length) {
    git(root, 'add', '-A');
    git(root, 'commit', '-qm', 'user project');
  }
  return root;
}

const stamped = () => {
  const script = fs.readFileSync(INSTALL, 'utf8');
  const out = script.replace(/^TAG=""$/m, `TAG="${STAMP_TAG}"`).replace(/^SHA=""$/m, `SHA="${STAMP_SHA}"`);
  assert.notEqual(out, script, 'install.sh has no TAG="" / SHA="" stamp lines');
  return out;
};

// Pipes the script into `sh -s -- <args>`, like `curl … | sh -s -- <tag>`.
function install(cwd, { args = [], script = stamped(), bin = paths.withNpx, env = {} } = {}) {
  const npxLog = path.join(tempDir('ang-log-'), 'npx.log');
  const { CLAUDE_PROJECT_DIR, ...inherited } = process.env;
  const child = spawn('sh', ['-s', '--', ...args], {
    cwd,
    env: {
      ...inherited,
      PATH: `${bin}${path.delimiter}${paths.rest}`,
      ANG_GITHUB_API: `http://127.0.0.1:${api.address().port}`,
      ANG_TEST_SRC: paths.src,
      ANG_TEST_NPX_LOG: npxLog,
      ...env,
    },
  });
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (d) => (stdout += d));
  child.stderr.on('data', (d) => (stderr += d));
  child.stdin.end(script);
  return new Promise((resolve) => child.on('close', (code) => resolve({
    code, stdout, stderr, npx: fs.existsSync(npxLog) ? fs.readFileSync(npxLog, 'utf8') : '',
  })));
}

// Every file outside .git with its content, to prove a failed run wrote nothing.
function snapshot(root) {
  const files = {};
  const visit = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === '.git') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(full);
      else files[path.relative(root, full)] = fs.readFileSync(full, 'utf8');
    }
  };
  visit(root);
  return files;
}

async function assertStops(root, options, pattern) {
  const before = snapshot(root);
  const result = await install(root, options);
  assert.equal(result.code, 1, result.stdout + result.stderr);
  assert.match(result.stderr, pattern);
  assert.deepEqual(snapshot(root), before);
  return result;
}

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const versionOf = (root) => readJson(path.join(root, '.claude', 'ang', 'version.json'));
const angSettings = () => readJson(path.join(paths.src, '.claude', 'settings.json'));

// Resolve target
test('the unstamped copy with no tag stops before any check and prints the one-liner', async () => {
  const notARepo = tempDir('ang-plain-');
  const result = await install(notARepo, { script: fs.readFileSync(INSTALL, 'utf8'), bin: paths.noNpx });
  assert.equal(result.code, 1);
  assert.ok(result.stderr.includes(ONE_LINER), result.stderr);
  assert.doesNotMatch(result.stderr, /npx|git repo/);
});

test('a stamped copy with no tag installs the stamped tag and SHA without calling the API', async () => {
  const root = repo();
  const hitsBefore = apiHits.length;
  const result = await install(root);
  assert.equal(result.code, 0, result.stderr);
  assert.equal(apiHits.length, hitsBefore);
  assert.match(result.npx, new RegExp(`gh:zacbraddy/ang/src#${STAMP_SHA}`));
  assert.deepEqual([versionOf(root).ref, versionOf(root).sha], [STAMP_TAG, STAMP_SHA]);
});

test('a tag argument for a published release installs that tag\'s commit SHA', async () => {
  const root = repo();
  const result = await install(root, { args: [STAMP_TAG], script: fs.readFileSync(INSTALL, 'utf8') });
  assert.equal(result.code, 0, result.stderr);
  assert.match(result.npx, new RegExp(`gh:zacbraddy/ang/src#${RELEASE_SHA}`));
  assert.deepEqual([versionOf(root).ref, versionOf(root).sha], [STAMP_TAG, RELEASE_SHA]);
});

test('an unknown or draft tag isn\'t a published release', async () => {
  for (const tag of ['v9.9.9', 'v0.9.0']) {
    await assertStops(repo(), { args: [tag] }, new RegExp(`${tag} isn't a published (Ang )?release`));
  }
});

test('a rate-limited API stops naming the rate limit', async () => {
  await assertStops(repo(), { args: ['v-limited'] }, /rate limit/);
});

test('an unreachable API stops naming the network', async () => {
  await assertStops(repo(), { args: [STAMP_TAG], env: { ANG_GITHUB_API: 'http://127.0.0.1:1' } }, /network/);
});

// Checks
test('node older than 26 is named', async () => {
  await assertStops(repo(), { bin: paths.oldNode }, /Node\.js 26.*24\.0\.0/s);
});

test('a missing npx is named', async () => {
  await assertStops(repo(), { bin: paths.noNpx }, /npx/);
});

test('Git Bash, MSYS or Cygwin on Windows is told to run inside WSL', async () => {
  await assertStops(repo(), { bin: paths.gitBash }, /WSL/);
});

test('a folder outside any git repo is told to run from a git repo\'s root', async () => {
  await assertStops(tempDir('ang-plain-'), {}, /git repo's root/);
});

test('a subdirectory of a git repo names the root to cd to', async () => {
  const root = repo({ files: { 'app/index.js': '' } });
  const result = await assertStops(path.join(root, 'app'), {}, /cd /);
  assert.ok(result.stderr.includes(root), result.stderr);
});

test('uncommitted or untracked changes ask for a clean working tree', async () => {
  const modified = repo({ files: { 'a.txt': 'one' } });
  fs.writeFileSync(path.join(modified, 'a.txt'), 'two');
  await assertStops(modified, {}, /clean working tree/);
  const untracked = repo({ files: { 'a.txt': 'one' } });
  fs.writeFileSync(path.join(untracked, 'b.txt'), '');
  await assertStops(untracked, {}, /clean working tree/);
});

test('an existing version record says Ang is installed and points to /upgrade-ang', async () => {
  await assertStops(repo({ files: { '.claude/ang/version.json': '{}' } }), {}, /already installed.*\/upgrade-ang/s);
});

test('existing project-context, same-named skills and any other path the copy would write are listed', async () => {
  const root = repo({
    files: {
      'project-context/notes.md': '',
      '.claude/skills/kill/NOTES.md': 'my own kill skill',
      '.claude/rules/context-library.md': 'mine',
      '.claude/rules/mine.md': 'no clash',
    },
  });
  const { stderr } = await assertStops(root, {}, /already exist/);
  for (const listed of ['project-context/', '.claude/skills/kill/', '.claude/rules/context-library.md']) {
    assert.ok(stderr.includes(listed), `${listed} not listed:\n${stderr}`);
  }
  assert.ok(!stderr.includes('mine.md'), stderr);
});

test('an invalid settings.json is named', async () => {
  await assertStops(repo({ files: { '.claude/settings.json': '{ nope' } }), {}, /\.claude\/settings\.json/);
});

test('a failed download stops and leaves the repo untouched', async () => {
  await assertStops(repo(), { env: { ANG_TEST_NPX_FAIL: '1' } }, /download failed/);
});

// Install
test('a clean repo with no settings gets src/, Ang\'s settings and no backup', async () => {
  const root = repo();
  const result = await install(root);
  assert.equal(result.code, 0, result.stderr);
  for (const file of Object.keys(snapshot(paths.src))) assert.ok(fs.existsSync(path.join(root, file)), `${file} missing`);
  assert.deepEqual(readJson(path.join(root, '.claude', 'settings.json')), angSettings());
  assert.ok(!fs.existsSync(path.join(root, '.claude', 'settings.json.pre-ang')));
});

test('the user\'s settings are backed up once, then merged keeping their values and adding Ang\'s', async () => {
  const original = JSON.stringify({ model: 'opus', outputStyle: 'Explanatory', permissions: { deny: ['Bash(rm:*)'] } }, null, 4);
  const root = repo({ files: { '.claude/settings.json': original } });
  const result = await install(root);
  assert.equal(result.code, 0, result.stderr);
  assert.equal(fs.readFileSync(path.join(root, '.claude', 'settings.json.pre-ang'), 'utf8'), original);
  const merged = readJson(path.join(root, '.claude', 'settings.json'));
  assert.equal(merged.model, 'opus');
  assert.equal(merged.outputStyle, 'Explanatory');
  assert.deepEqual(merged.permissions.deny, ['Bash(rm:*)']);
  assert.deepEqual(merged.hooks, angSettings().hooks);
});

test('an existing settings.json.pre-ang is left as it was', async () => {
  const root = repo({ files: { '.claude/settings.json': '{"model":"opus"}', '.claude/settings.json.pre-ang': 'the first backup' } });
  const result = await install(root);
  assert.equal(result.code, 0, result.stderr);
  assert.equal(fs.readFileSync(path.join(root, '.claude', 'settings.json.pre-ang'), 'utf8'), 'the first backup');
});

test('merge conflicts are listed where the user\'s value was kept, and the install succeeds', async () => {
  const root = repo({ files: { '.claude/settings.json': '{"hooks":{"Stop":"my-own-stop"}}' } });
  const result = await install(root);
  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /hooks\.Stop/);
  assert.equal(readJson(path.join(root, '.claude', 'settings.json')).hooks.Stop, 'my-own-stop');
});

test('success records the tag and SHA and reports the version, root and next step', async () => {
  const root = repo();
  const result = await install(root);
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual([versionOf(root).ref, versionOf(root).sha], [STAMP_TAG, STAMP_SHA]);
  for (const expected of [STAMP_TAG, root, '/bootstrap-repo']) assert.ok(result.stdout.includes(expected), result.stdout);
});

test('a CLAUDE_PROJECT_DIR pointing elsewhere still installs into the repo root', async () => {
  const root = repo({ files: { '.claude/settings.json': '{"model":"opus"}' } });
  const elsewhere = tempDir('ang-elsewhere-');
  const result = await install(root, { env: { CLAUDE_PROJECT_DIR: elsewhere } });
  assert.equal(result.code, 0, result.stderr);
  assert.equal(versionOf(root).sha, STAMP_SHA);
  assert.equal(readJson(path.join(root, '.claude', 'settings.json')).model, 'opus');
  assert.deepEqual(fs.readdirSync(elsewhere), []);
});
