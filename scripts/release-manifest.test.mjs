import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { archivedEpic, buildManifest, parseDiffEntries } from './release-manifest.mjs';

const SCRIPT = path.join(import.meta.dirname, 'release-manifest.mjs');

const dirs = [];
const tempDir = (prefix) => {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
  dirs.push(dir);
  return dir;
};
after(() => dirs.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })));

const GIT_ENV = { GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' };
const git = (cwd, ...args) => execFileSync('git', ['-c', 'commit.gpgsign=false', '-c', 'tag.gpgsign=false', ...args], { cwd, env: { ...process.env, ...GIT_ENV }, encoding: 'utf8' });

const write = (repo, file, content) => {
  fs.mkdirSync(path.dirname(path.join(repo, file)), { recursive: true });
  fs.writeFileSync(path.join(repo, file), content);
};
const commit = (repo, subject) => {
  git(repo, 'add', '-A');
  git(repo, 'commit', '-q', '--allow-empty', '-m', subject);
  return git(repo, 'rev-parse', 'HEAD').trim();
};

describe('parseDiffEntries', () => {
  test('joins name-status and numstat records on path, sorted by path', () => {
    const nameStatus = 'M\0src/b.md\0A\0src/a.md\0D\0src/gone.md\0';
    const numstat = '2\t1\tsrc/b.md\0' + '3\t0\tsrc/a.md\0' + '0\t4\tsrc/gone.md\0';
    assert.deepEqual(parseDiffEntries(nameStatus, numstat), [
      { path: 'src/a.md', status: 'A', added: 3, removed: 0 },
      { path: 'src/b.md', status: 'M', added: 2, removed: 1 },
      { path: 'src/gone.md', status: 'D', added: 0, removed: 4 },
    ]);
  });

  test('a rename carries its old path and similarity', () => {
    const nameStatus = 'R087\0src/old.md\0src/new.md\0';
    const numstat = '1\t1\t\0src/old.md\0src/new.md\0';
    assert.deepEqual(parseDiffEntries(nameStatus, numstat), [
      { path: 'src/new.md', status: 'R', from: 'src/old.md', similarity: 87, added: 1, removed: 1 },
    ]);
  });

  test('a binary change has null line counts', () => {
    assert.deepEqual(parseDiffEntries('M\0src/img.bin\0', '-\t-\tsrc/img.bin\0'), [
      { path: 'src/img.bin', status: 'M', added: null, removed: null },
    ]);
  });

  test('no changes gives no entries', () => {
    assert.deepEqual(parseDiffEntries('', ''), []);
  });
});

describe('archivedEpic', () => {
  test('takes the epic slug from a retro archive subject', () => {
    assert.equal(archivedEpic('retro: archive my-epic (full context in git history)'), 'my-epic');
    assert.equal(archivedEpic('retro: archive my-epic'), 'my-epic');
  });

  test('other subjects are not archives', () => {
    assert.equal(archivedEpic('retro: record lessons for my-epic'), null);
    assert.equal(archivedEpic('execution: retro: archive my-epic'), null);
    assert.equal(archivedEpic('retro: archive'), null);
  });
});

describe('buildManifest over a temp repo', () => {
  let repo;
  let archiveSha;

  before(() => {
    repo = tempDir('ang-manifest-');
    git(repo, 'init', '-q', '-b', 'main');
    const longDoc = Array.from({ length: 20 }, (_, i) => `line ${i}`).join('\n') + '\n';
    write(repo, 'src/a.md', 'a\n');
    write(repo, 'src/gone.md', 'gone\n');
    write(repo, 'src/old-name.md', longDoc);
    write(repo, 'src/img.bin', Buffer.from([0, 1, 2, 3]));
    write(repo, 'src/.claude/settings.json', '{ "a": 1 }\n');
    write(repo, 'project-context/10k/intent.md', 'intent\n');
    write(repo, 'project-context/ideas/x.md', 'x\n');
    commit(repo, 'root');
    commit(repo, 'retro: archive early-epic (full context in git history)');
    git(repo, 'tag', 'v1.0.0');

    write(repo, 'src/a.md', 'a\nmore\n');
    write(repo, 'src/added.md', 'new\n');
    fs.rmSync(path.join(repo, 'src/gone.md'));
    fs.rmSync(path.join(repo, 'src/old-name.md'));
    write(repo, 'src/new-name.md', longDoc.replace('line 3', 'line three'));
    write(repo, 'src/img.bin', Buffer.from([0, 9, 9, 9]));
    commit(repo, 'src changes');
    write(repo, 'project-context/10k/intent.md', 'intent\nrevised\n');
    write(repo, 'project-context/ideas/x.md', 'x\ny\n');
    commit(repo, 'context changes');
    write(repo, 'src/.claude/settings.json', '{ "a": 2 }\n');
    commit(repo, 'settings change');
    archiveSha = commit(repo, 'retro: archive my-epic (full context in git history)');
    git(repo, 'tag', 'v1.1.0-rc.1');
    commit(repo, 'after the rc');
  });

  test('files lists each changed src/ path once, with status and line counts', () => {
    const { files } = buildManifest({ cwd: repo, fromTag: 'v1.0.0', toRef: 'v1.1.0-rc.1' });
    assert.deepEqual(files, [
      { path: 'src/.claude/settings.json', status: 'M', added: 1, removed: 1 },
      { path: 'src/a.md', status: 'M', added: 1, removed: 0 },
      { path: 'src/added.md', status: 'A', added: 1, removed: 0 },
      { path: 'src/gone.md', status: 'D', added: 0, removed: 1 },
      { path: 'src/img.bin', status: 'M', added: null, removed: null },
      { path: 'src/new-name.md', status: 'R', from: 'src/old-name.md', similarity: files.find((f) => f.status === 'R').similarity, added: 1, removed: 1 },
    ]);
    assert.ok(files.find((f) => f.status === 'R').similarity >= 50);
  });

  test('tenK lists 10k/ changes only; the rest of project-context/ is in neither list', () => {
    const { files, tenK } = buildManifest({ cwd: repo, fromTag: 'v1.0.0', toRef: 'v1.1.0-rc.1' });
    assert.deepEqual(tenK, [{ path: 'project-context/10k/intent.md', status: 'M', added: 1, removed: 0 }]);
    assert.ok(!files.some((f) => f.path.startsWith('project-context/')));
  });

  test('commits run oldest first and archivedEpics holds only archives in range', () => {
    const manifest = buildManifest({ cwd: repo, fromTag: 'v1.0.0', toRef: 'v1.1.0-rc.1' });
    assert.deepEqual(manifest.commits.map((c) => c.subject), ['src changes', 'context changes', 'settings change', 'retro: archive my-epic (full context in git history)']);
    assert.deepEqual(manifest.archivedEpics, [{ epic: 'my-epic', sha: archiveSha }]);
  });

  test('settingsDiff is the unified diff of settings.json, or empty when unchanged', () => {
    const changed = buildManifest({ cwd: repo, fromTag: 'v1.0.0', toRef: 'v1.1.0-rc.1' });
    assert.match(changed.settingsDiff, /^diff --git a\/src\/\.claude\/settings\.json/);
    assert.match(changed.settingsDiff, /^-\{ "a": 1 \}$/m);
    assert.match(changed.settingsDiff, /^\+\{ "a": 2 \}$/m);
    assert.equal(buildManifest({ cwd: repo, fromTag: 'v1.1.0-rc.1', toRef: 'HEAD' }).settingsDiff, '');
  });

  test('without a fromTag the latest reachable v* tag is used', () => {
    const manifest = buildManifest({ cwd: repo, toRef: 'HEAD' });
    assert.equal(manifest.fromTag, 'v1.1.0-rc.1');
    assert.deepEqual(manifest.commits.map((c) => c.subject), ['after the rc']);
  });

  test('the same refs give byte-identical output', () => {
    const run = () => JSON.stringify(buildManifest({ cwd: repo, fromTag: 'v1.0.0', toRef: 'v1.1.0-rc.1' }), null, 2);
    assert.equal(run(), run());
  });

  test('an unresolvable ref throws naming it', () => {
    assert.throws(() => buildManifest({ cwd: repo, fromTag: 'v9.9.9', toRef: 'HEAD' }), /v9\.9\.9/);
    assert.throws(() => buildManifest({ cwd: repo, fromTag: 'v1.0.0', toRef: 'nope' }), /nope/);
  });
});

test('with no reachable tag, fromTag is null and the range starts from the empty tree', () => {
  const repo = tempDir('ang-manifest-untagged-');
  git(repo, 'init', '-q', '-b', 'main');
  write(repo, 'src/a.md', 'a\n');
  write(repo, 'project-context/10k/intent.md', 'intent\n');
  commit(repo, 'first');
  write(repo, 'src/b.md', 'b\n');
  commit(repo, 'second');

  const manifest = buildManifest({ cwd: repo, toRef: 'HEAD' });
  assert.equal(manifest.fromTag, null);
  assert.deepEqual(manifest.files, [
    { path: 'src/a.md', status: 'A', added: 1, removed: 0 },
    { path: 'src/b.md', status: 'A', added: 1, removed: 0 },
  ]);
  assert.deepEqual(manifest.tenK, [{ path: 'project-context/10k/intent.md', status: 'A', added: 1, removed: 0 }]);
  assert.deepEqual(manifest.commits.map((c) => c.subject), ['first', 'second']);
});

describe('CLI', () => {
  test('an unknown ref exits non-zero with one line naming it and nothing on stdout', () => {
    const result = spawnSync(process.execPath, [SCRIPT, 'no-such-ref-for-manifest', 'HEAD'], { encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.equal(result.stdout, '');
    assert.equal(result.stderr.trim().split('\n').length, 1);
    assert.match(result.stderr, /no-such-ref-for-manifest/);
  });
});
