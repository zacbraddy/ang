// Runs the root install.sh the way the one-liner does (piped into `sh -s --`) against temp git repos.
// giget is an `npx` stub on PATH that copies this repo's tracked src/, and GitHub is a local server behind ANG_GITHUB_API.
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";

const REPO_ROOT = path.resolve(import.meta.dirname, "..");
const INSTALL = path.join(REPO_ROOT, "install.sh");
const ONE_LINER =
  "curl -fsSL https://github.com/zacbraddy/ang/releases/latest/download/install.sh | sh";
const STAMP_TAG = "v1.0.0";
const STAMP_SHA = "a".repeat(40);
const RELEASE_SHA = "b".repeat(40);

const tempDirs = [];
const makeTempDir = (prefix) => {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));

  tempDirs.push(dir);

  return dir;
};

after(() =>
  tempDirs.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })),
);

const GIT_ENV = {
  GIT_AUTHOR_NAME: "t",
  GIT_AUTHOR_EMAIL: "t@t",
  GIT_COMMITTER_NAME: "t",
  GIT_COMMITTER_EMAIL: "t@t",
};
const git = (cwd, ...args) =>
  execFileSync("git", ["-c", "commit.gpgsign=false", ...args], {
    cwd,
    env: { ...process.env, ...GIT_ENV },
    encoding: "utf8",
  });

const NPX_STUB = `#!/bin/sh
printf '%s\\n' "$@" > "$ANG_TEST_NPX_LOG"
[ -z "\${ANG_TEST_NPX_FAIL:-}" ] || { echo 'giget: fetch failed' >&2; exit 1; }
mkdir -p "$4" && cp -R "$ANG_TEST_SRC/." "$4"
`;
const OLD_NODE_STUB = `#!/bin/sh
[ "\${2:-}" = process.versions.node ] && { echo 24.0.0; exit 0; }
exec "${process.execPath}" "$@"
`;
const GIT_BASH_UNAME_STUB = "#!/bin/sh\necho MINGW64_NT-10.0-19045\n";

const RELEASES_API = "/repos/zacbraddy/ang";
const GITHUB_ROUTES = {
  [`${RELEASES_API}/releases/tags/${STAMP_TAG}`]: {
    status: 200,
    body: JSON.stringify({ tag_name: STAMP_TAG, draft: false }),
  },
  [`${RELEASES_API}/releases/tags/v0.9.0`]: {
    status: 200,
    body: JSON.stringify({ tag_name: "v0.9.0", draft: true }),
  },
  [`${RELEASES_API}/releases/tags/v-limited`]: {
    status: 403,
    body: "{}",
    headers: { "x-ratelimit-remaining": "0" },
  },
  [`${RELEASES_API}/commits/${STAMP_TAG}`]: {
    status: 200,
    body: RELEASE_SHA,
  },
};

let githubApi;
const githubApiHits = [];
// The src/ copy giget serves, one bin dir per environment install.sh checks for, and the rest of PATH.
const fixtures = {};

// What giget would fetch: src/ as committed, with this checkout's edits.
function copyTrackedSrc() {
  const srcCopy = makeTempDir("ang-src-");
  const trackedFiles = git(REPO_ROOT, "ls-files", "src")
    .split("\n")
    .filter(Boolean);

  for (const file of trackedFiles) {
    const to = path.join(srcCopy, path.relative("src", file));

    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.cpSync(path.join(REPO_ROOT, file), to, { dereference: true });
  }

  return srcCopy;
}

function writeExecutable(dir, name, body) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), body, { mode: 0o755 });
}

function makeBinDirs() {
  const bin = makeTempDir("ang-bin-");
  const linkRealNode = (dir) =>
    fs.symlinkSync(process.execPath, path.join(dir, "node"));

  fixtures.withNpx = path.join(bin, "with-npx");
  writeExecutable(fixtures.withNpx, "npx", NPX_STUB);
  linkRealNode(fixtures.withNpx);

  fixtures.noNpx = path.join(bin, "no-npx");
  fs.mkdirSync(fixtures.noNpx);
  linkRealNode(fixtures.noNpx);

  fixtures.oldNode = path.join(bin, "old-node");
  writeExecutable(fixtures.oldNode, "npx", NPX_STUB);
  writeExecutable(fixtures.oldNode, "node", OLD_NODE_STUB);

  fixtures.gitBash = path.join(bin, "git-bash");
  writeExecutable(fixtures.gitBash, "npx", NPX_STUB);
  writeExecutable(fixtures.gitBash, "uname", GIT_BASH_UNAME_STUB);
  linkRealNode(fixtures.gitBash);
}

// The rest of PATH (git, cp, mktemp…) minus wherever the real node and npx live.
function pathWithoutNode() {
  const hasNodeOrNpx = (dir) =>
    fs.existsSync(path.join(dir, "npx")) ||
    fs.existsSync(path.join(dir, "node"));

  return process.env.PATH.split(path.delimiter)
    .filter((dir) => dir && !hasNodeOrNpx(dir))
    .join(path.delimiter);
}

async function startGithubApi() {
  const server = http.createServer((request, response) => {
    githubApiHits.push(request.url);

    const route = GITHUB_ROUTES[request.url] ?? {
      status: 404,
      body: '{"message":"Not Found"}',
    };

    response.writeHead(route.status, route.headers).end(route.body);
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

  return server;
}

before(async () => {
  fixtures.src = copyTrackedSrc();
  makeBinDirs();
  fixtures.restOfPath = pathWithoutNode();
  githubApi = await startGithubApi();
});
after(() => githubApi.close());

function userRepo({ files = {}, commit = true } = {}) {
  const root = makeTempDir("ang-repo-");

  git(root, "init", "-q");

  for (const [file, content] of Object.entries(files)) {
    const fullPath = path.join(root, file);

    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content);
  }

  if (commit && Object.keys(files).length) {
    git(root, "add", "-A");
    git(root, "commit", "-qm", "user project");
  }

  return root;
}

const unstampedScript = () => fs.readFileSync(INSTALL, "utf8");
const stampedScript = () => {
  const script = unstampedScript();
  const stamped = script
    .replace(/^TAG=""$/m, `TAG="${STAMP_TAG}"`)
    .replace(/^SHA=""$/m, `SHA="${STAMP_SHA}"`);

  assert.notEqual(
    stamped,
    script,
    'install.sh has no TAG="" / SHA="" stamp lines',
  );

  return stamped;
};

// Pipes the script into `sh -s -- <args>`, like `curl … | sh -s -- <tag>`.
function install(
  cwd,
  {
    args = [],
    script = stampedScript(),
    bin = fixtures.withNpx,
    env = {},
  } = {},
) {
  const npxLog = path.join(makeTempDir("ang-log-"), "npx.log");
  const { CLAUDE_PROJECT_DIR, ...inherited } = process.env;
  const child = spawn("sh", ["-s", "--", ...args], {
    cwd,
    env: {
      ...inherited,
      PATH: `${bin}${path.delimiter}${fixtures.restOfPath}`,
      ANG_GITHUB_API: `http://127.0.0.1:${githubApi.address().port}`,
      ANG_TEST_SRC: fixtures.src,
      ANG_TEST_NPX_LOG: npxLog,
      ...env,
    },
  });
  const readNpxLog = () =>
    fs.existsSync(npxLog) ? fs.readFileSync(npxLog, "utf8") : "";
  let stdout = "";
  let stderr = "";

  child.stdout.on("data", (chunk) => (stdout += chunk));
  child.stderr.on("data", (chunk) => (stderr += chunk));
  child.stdin.end(script);

  return new Promise((resolve) =>
    child.on("close", (code) =>
      resolve({ code, stdout, stderr, npx: readNpxLog() }),
    ),
  );
}

// Every file outside .git with its content, to prove a failed run wrote nothing.
function readTree(root) {
  const files = {};
  const visit = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === ".git") {
        continue;
      }

      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        visit(fullPath);
      } else {
        files[path.relative(root, fullPath)] = fs.readFileSync(
          fullPath,
          "utf8",
        );
      }
    }
  };

  visit(root);

  return files;
}

async function assertStops(root, options, pattern) {
  const before = readTree(root);

  const result = await install(root, options);

  assert.equal(result.code, 1, result.stdout + result.stderr);
  assert.match(result.stderr, pattern);
  assert.deepEqual(readTree(root), before);

  return result;
}

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const settingsPath = (root) => path.join(root, ".claude", "settings.json");
const backupPath = (root) =>
  path.join(root, ".claude", "settings.json.pre-ang");
const versionOf = (root) =>
  readJson(path.join(root, ".claude", "ang", "version.json"));
const angSettings = () => readJson(settingsPath(fixtures.src));

// Resolve target
test("the unstamped copy with no tag stops before any check and prints the one-liner", async () => {
  const notARepo = makeTempDir("ang-plain-");

  const result = await install(notARepo, {
    script: unstampedScript(),
    bin: fixtures.noNpx,
  });

  assert.equal(result.code, 1);
  assert.ok(result.stderr.includes(ONE_LINER), result.stderr);
  assert.doesNotMatch(result.stderr, /npx|git repo/);
});

test("a stamped copy with no tag installs the stamped tag and SHA without calling the API", async () => {
  const root = userRepo();
  const hitsBefore = githubApiHits.length;

  const result = await install(root);

  assert.equal(result.code, 0, result.stderr);
  assert.equal(githubApiHits.length, hitsBefore);
  assert.match(result.npx, new RegExp(`gh:zacbraddy/ang/src#${STAMP_SHA}`));
  assert.deepEqual(
    [versionOf(root).ref, versionOf(root).sha],
    [STAMP_TAG, STAMP_SHA],
  );
});

test("a tag argument for a published release installs that tag's commit SHA", async () => {
  const root = userRepo();

  const result = await install(root, {
    args: [STAMP_TAG],
    script: unstampedScript(),
  });

  assert.equal(result.code, 0, result.stderr);
  assert.match(result.npx, new RegExp(`gh:zacbraddy/ang/src#${RELEASE_SHA}`));
  assert.deepEqual(
    [versionOf(root).ref, versionOf(root).sha],
    [STAMP_TAG, RELEASE_SHA],
  );
});

test("an unknown or draft tag isn't a published release", async () => {
  for (const tag of ["v9.9.9", "v0.9.0"]) {
    await assertStops(
      userRepo(),
      { args: [tag] },
      new RegExp(`${tag} isn't a published (Ang )?release`),
    );
  }
});

test("a rate-limited API stops naming the rate limit", async () => {
  await assertStops(userRepo(), { args: ["v-limited"] }, /rate limit/);
});

test("an unreachable API stops naming the network", async () => {
  await assertStops(
    userRepo(),
    { args: [STAMP_TAG], env: { ANG_GITHUB_API: "http://127.0.0.1:1" } },
    /network/,
  );
});

// Checks
test("node older than 26 is named", async () => {
  await assertStops(
    userRepo(),
    { bin: fixtures.oldNode },
    /Node\.js 26.*24\.0\.0/s,
  );
});

test("a missing npx is named", async () => {
  await assertStops(userRepo(), { bin: fixtures.noNpx }, /npx/);
});

test("Git Bash, MSYS or Cygwin on Windows is told to run inside WSL", async () => {
  await assertStops(userRepo(), { bin: fixtures.gitBash }, /WSL/);
});

test("a folder outside any git repo is told to run from a git repo's root", async () => {
  await assertStops(makeTempDir("ang-plain-"), {}, /git repo's root/);
});

test("a subdirectory of a git repo names the root to cd to", async () => {
  const root = userRepo({ files: { "app/index.js": "" } });
  const subdirectory = path.join(root, "app");

  const result = await assertStops(subdirectory, {}, /cd /);

  assert.ok(result.stderr.includes(root), result.stderr);
});

test("uncommitted or untracked changes ask for a clean working tree", async () => {
  const modified = userRepo({ files: { "a.txt": "one" } });

  fs.writeFileSync(path.join(modified, "a.txt"), "two");

  await assertStops(modified, {}, /clean working tree/);

  const untracked = userRepo({ files: { "a.txt": "one" } });

  fs.writeFileSync(path.join(untracked, "b.txt"), "");

  await assertStops(untracked, {}, /clean working tree/);
});

test("an existing version record says Ang is installed and points to /upgrade-ang", async () => {
  await assertStops(
    userRepo({ files: { ".claude/ang/version.json": "{}" } }),
    {},
    /already installed.*\/upgrade-ang/s,
  );
});

test("existing project-context, same-named skills and any other path the copy would write are listed", async () => {
  const root = userRepo({
    files: {
      "project-context/notes.md": "",
      ".claude/skills/kill/NOTES.md": "my own kill skill",
      ".claude/rules/context-library.md": "mine",
      ".claude/rules/mine.md": "no clash",
    },
  });
  const clashing = [
    "project-context/",
    ".claude/skills/kill/",
    ".claude/rules/context-library.md",
  ];

  const { stderr } = await assertStops(root, {}, /already exist/);

  for (const listed of clashing) {
    assert.ok(stderr.includes(listed), `${listed} not listed:\n${stderr}`);
  }

  assert.ok(!stderr.includes("mine.md"), stderr);
});

test("an invalid settings.json is named", async () => {
  await assertStops(
    userRepo({ files: { ".claude/settings.json": "{ nope" } }),
    {},
    /\.claude\/settings\.json/,
  );
});

test("a failed download stops and leaves the repo untouched", async () => {
  await assertStops(
    userRepo(),
    { env: { ANG_TEST_NPX_FAIL: "1" } },
    /download failed/,
  );
});

// Install
test("a clean repo with no settings gets src/, Ang's settings and no backup", async () => {
  const root = userRepo();

  const result = await install(root);

  assert.equal(result.code, 0, result.stderr);

  for (const file of Object.keys(readTree(fixtures.src))) {
    assert.ok(fs.existsSync(path.join(root, file)), `${file} missing`);
  }

  assert.deepEqual(readJson(settingsPath(root)), angSettings());
  assert.ok(!fs.existsSync(backupPath(root)));
});

test("the user's settings are backed up once, then merged keeping their values and adding Ang's", async () => {
  const userSettings = {
    model: "opus",
    outputStyle: "Explanatory",
    permissions: { deny: ["Bash(rm:*)"] },
  };
  const original = JSON.stringify(userSettings, null, 4);
  const root = userRepo({ files: { ".claude/settings.json": original } });

  const result = await install(root);

  assert.equal(result.code, 0, result.stderr);
  assert.equal(fs.readFileSync(backupPath(root), "utf8"), original);

  const merged = readJson(settingsPath(root));

  assert.equal(merged.model, "opus");
  assert.equal(merged.outputStyle, "Explanatory");
  assert.deepEqual(merged.permissions.deny, ["Bash(rm:*)"]);
  assert.deepEqual(merged.hooks, angSettings().hooks);
});

test("an existing settings.json.pre-ang is left as it was", async () => {
  const root = userRepo({
    files: {
      ".claude/settings.json": '{"model":"opus"}',
      ".claude/settings.json.pre-ang": "the first backup",
    },
  });

  const result = await install(root);

  assert.equal(result.code, 0, result.stderr);
  assert.equal(fs.readFileSync(backupPath(root), "utf8"), "the first backup");
});

test("merge conflicts are listed where the user's value was kept, and the install succeeds", async () => {
  const root = userRepo({
    files: { ".claude/settings.json": '{"hooks":{"Stop":"my-own-stop"}}' },
  });

  const result = await install(root);

  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /hooks\.Stop/);
  assert.equal(readJson(settingsPath(root)).hooks.Stop, "my-own-stop");
});

test("success records the tag and SHA and reports the version, root and next step", async () => {
  const root = userRepo();

  const result = await install(root);

  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(
    [versionOf(root).ref, versionOf(root).sha],
    [STAMP_TAG, STAMP_SHA],
  );
  for (const expected of [STAMP_TAG, root, "/bootstrap-repo"]) {
    assert.ok(result.stdout.includes(expected), result.stdout);
  }
});

test("a CLAUDE_PROJECT_DIR pointing elsewhere still installs into the repo root", async () => {
  const root = userRepo({
    files: { ".claude/settings.json": '{"model":"opus"}' },
  });
  const elsewhere = makeTempDir("ang-elsewhere-");

  const result = await install(root, {
    env: { CLAUDE_PROJECT_DIR: elsewhere },
  });

  assert.equal(result.code, 0, result.stderr);
  assert.equal(versionOf(root).sha, STAMP_SHA);
  assert.equal(readJson(settingsPath(root)).model, "opus");
  assert.deepEqual(fs.readdirSync(elsewhere), []);
});
