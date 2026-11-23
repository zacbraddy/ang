import { after, test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";

const CLI = path.join(import.meta.dirname, "ang-context-manager.mjs");
const tempDirs = [];

after(() =>
  tempDirs.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })),
);

// A temp folder holding the given files; strings are written raw, anything else as JSON, and nested paths are fine.
function tempFolderWith(prefix, files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));

  tempDirs.push(dir);

  for (const [name, content] of Object.entries(files)) {
    const file = path.join(dir, name);
    const text =
      typeof content === "string" ? content : JSON.stringify(content);

    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text);
  }

  return dir;
}

// A temp project holding the given files ({ 'ang.json': {...} }), with the CLI spawned against it and given `input` on stdin.
// paths.mjs reads CLAUDE_PROJECT_DIR at import time, so a fresh process per run is the only clean seam.
function cliProject(files = {}, { input = "" } = {}) {
  const dir = tempFolderWith("ang-cli-", files);
  const run = (...args) => {
    const env = {
      ...process.env,
      CLAUDE_PROJECT_DIR: dir,
      ORCA_WORKTREE_ID: "test",
    };
    const { status, stdout, stderr } = spawnSync(
      process.execPath,
      [CLI, ...args],
      { cwd: dir, env, encoding: "utf8", input },
    );

    return { status, out: stdout + stderr };
  };

  return { dir, run };
}

test("library validate passes with no config files", () => {
  const { status, out } = cliProject().run("library", "validate");

  assert.equal(status, 0, out);
  assert.doesNotMatch(out, /ang(\.local)?\.json/);
});

test("library validate warns about a project-wide key in ang.local.json and still passes", () => {
  const { run } = cliProject({ "ang.local.json": { streams: true } });

  const { status, out } = run("library", "validate");

  assert.equal(status, 0, out);
  assert.match(
    out,
    /⚠ ang\.local\.json: streams ignored, it's project-wide; set it in ang\.json/,
  );
});

test("library validate fails on invalid JSON in ang.json, naming the file", () => {
  const { run } = cliProject({ "ang.json": "{ nope" });

  const { status, out } = run("library", "validate");

  assert.equal(status, 1, out);
  assert.match(out, /✖ ang\.json: invalid JSON/);
});

test("session banner names the host set in ang.local.json", () => {
  const { run } = cliProject({ "ang.local.json": { host: "orca" } });

  const { status, out } = run("session", "banner");

  assert.equal(status, 0, out);
  assert.match(out, /^Ang: host \(orca\)$/m);
});

test("session banner names the pilot and carries their rule", () => {
  const { run } = cliProject({ "ang.local.json": { pilot: "Zac" } });

  const banner = run("session", "banner");

  assert.equal(banner.status, 0, banner.out);
  assert.match(banner.out, /^Ang: pilot \(Zac\)$/m);
  assert.match(banner.out, /Zac is the pilot/);

  const validate = run("library", "validate");

  assert.equal(validate.status, 0, validate.out);
});

test("session subagent carries the pilot rule", () => {
  const { run } = cliProject(
    { "ang.local.json": { pilot: "Zac" } },
    { input: '{"agent_type":"Explore"}' },
  );

  const { status, out } = run("session", "subagent");

  assert.equal(status, 0, out);

  const { additionalContext } = JSON.parse(out).hookSpecificOutput;

  assert.match(additionalContext, /## Pilot/);
});

test("library validate fails on a blank pilot, naming it", () => {
  const { run } = cliProject({ "ang.local.json": { pilot: "  " } });

  const { status, out } = run("library", "validate");

  assert.equal(status, 1, out);
  assert.match(out, /ang\.local\.json: pilot must be null or a name/);
});

test("session banner flags invalid config", () => {
  const { run } = cliProject({ "ang.json": "[" });

  const { out } = run("session", "banner");

  assert.match(
    out,
    /^Ang: .* · Ang config invalid, run ang-context-manager\.mjs library validate$/m,
  );
});

test("session features marks host and pilot as personal", () => {
  const { status, out } = cliProject().run("session", "features");

  assert.equal(status, 0, out);
  assert.match(out, /\*\*host\*\*.* — personal, set by `\/tailor-ang`/);
  assert.match(out, /\*\*pilot\*\*.* — personal, set by `\/tailor-ang`/);
  assert.doesNotMatch(out, /\*\*intent\*\*.*personal/);
});

const readFile = (dir, name) => fs.readFileSync(path.join(dir, name), "utf8");
const MERGE_SETTINGS = [
  "settings",
  "merge",
  "--base",
  "base.json",
  "--ours",
  "ours.json",
  "--theirs",
  "theirs.json",
];
const SETTINGS = {
  "base.json": { a: 1, list: ["x", "y"] },
  "ours.json": { mine: true, a: 1, list: ["x", "y"] },
  "theirs.json": { a: 2, list: ["x", "z"] },
};

test("settings merge writes --ours in place and prints no conflicts as []", () => {
  const { dir, run } = cliProject(SETTINGS);

  const { status, out } = run(...MERGE_SETTINGS);

  const expected = { mine: true, a: 2, list: ["x", "z"] };

  assert.equal(status, 0, out);
  assert.deepEqual(JSON.parse(out), []);
  assert.equal(
    readFile(dir, "ours.json"),
    JSON.stringify(expected, null, 2) + "\n",
  );
});

test("settings merge prints conflicts as JSON and still writes --ours", () => {
  const { dir, run } = cliProject({
    ...SETTINGS,
    "ours.json": { a: 3, list: ["x", "y"] },
  });

  const { status, out } = run(...MERGE_SETTINGS);

  assert.equal(status, 0, out);
  assert.deepEqual(JSON.parse(out), [
    { path: ["a"], base: 1, ours: 3, theirs: 2 },
  ]);
  assert.deepEqual(JSON.parse(readFile(dir, "ours.json")), {
    a: 3,
    list: ["x", "z"],
  });
});

test("settings merge with --base none and no --ours file creates it holding the target", () => {
  const { dir, run } = cliProject({ "theirs.json": SETTINGS["theirs.json"] });

  const { status, out } = run(
    "settings",
    "merge",
    "--base",
    "none",
    "--ours",
    ".claude/settings.json",
    "--theirs",
    "theirs.json",
  );

  assert.equal(status, 0, out);
  assert.deepEqual(
    JSON.parse(readFile(dir, ".claude/settings.json")),
    SETTINGS["theirs.json"],
  );
});

test("settings merge fails naming a missing or invalid input, leaving --ours untouched", () => {
  const brokenInputs = [
    ["theirs.json", undefined],
    ["base.json", undefined],
    ["theirs.json", "{ nope"],
    ["ours.json", "["],
  ];

  for (const [file, content] of brokenInputs) {
    const files = { ...SETTINGS, "ours.json": '{"a": 1}' };

    if (content === undefined) {
      delete files[file];
    } else {
      files[file] = content;
    }

    const { dir, run } = cliProject(files);

    const { status, out } = run(...MERGE_SETTINGS);

    assert.equal(status, 1, out);
    assert.match(out, new RegExp(file.replace(".", "\\.")));
    assert.equal(readFile(dir, "ours.json"), files["ours.json"]);
  }
});

test("version show prints none without a record", () => {
  const { status, out } = cliProject().run("version", "show");

  assert.equal(status, 0, out);
  assert.equal(out, "none\n");
});

test("version write replaces the record and version show prints it", () => {
  const sha = "a".repeat(40);
  const { run } = cliProject({
    ".claude/ang/version.json": {
      ref: "v0.9.0",
      sha: "b".repeat(40),
      installedAt: "2026-01-01T00:00:00.000Z",
    },
  });

  const write = run("version", "write", "--ref", "v1.0.0", "--sha", sha);
  const show = run("version", "show");

  assert.equal(write.status, 0, write.out);
  assert.equal(show.status, 0, show.out);

  const record = JSON.parse(show.out);
  const isFreshTimestamp =
    !Number.isNaN(Date.parse(record.installedAt)) &&
    record.installedAt !== "2026-01-01T00:00:00.000Z";

  assert.deepEqual(Object.keys(record), ["ref", "sha", "installedAt"]);
  assert.equal(record.ref, "v1.0.0");
  assert.equal(record.sha, sha);
  assert.ok(isFreshTimestamp);
});

test("version write creates .claude/ang/ when it is missing", () => {
  const { dir, run } = cliProject();

  const sha = "c".repeat(40);

  const { status, out } = run(
    "version",
    "write",
    "--ref",
    "v1.0.0",
    "--sha",
    sha,
  );

  assert.equal(status, 0, out);

  const record = JSON.parse(readFile(dir, ".claude/ang/version.json"));

  assert.equal(record.ref, "v1.0.0");
});

test("version write rejects a SHA that is not 40 hex characters and writes nothing", () => {
  for (const sha of ["abc123", "G".repeat(40), "a".repeat(41)]) {
    const { dir, run } = cliProject();

    const { status, out } = run(
      "version",
      "write",
      "--ref",
      "v1.0.0",
      "--sha",
      sha,
    );

    assert.equal(status, 1, out);
    assert.ok(!fs.existsSync(path.join(dir, ".claude/ang/version.json")));
  }
});

test("version show fails naming a corrupt record", () => {
  const { run } = cliProject({ ".claude/ang/version.json": "{ nope" });

  const { status, out } = run("version", "show");

  assert.equal(status, 1, out);
  assert.match(out, /version\.json: invalid JSON/);
});

// spawnSync blocks the event loop, so a server in this process could never answer it: these runs spawn asynchronously.
function runAsync(args, env, files = {}) {
  const dir = tempFolderWith("ang-cli-", files);

  return new Promise((resolve) => {
    const child = spawn(process.execPath, [CLI, ...args], {
      cwd: dir,
      env: { ...process.env, CLAUDE_PROJECT_DIR: dir, ...env },
    });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("close", (status) => resolve({ status, stdout, stderr }));
  });
}

// Answers each request with the body mapped to its URL, or a 404.
async function serveBodies(bodies) {
  const server = http.createServer((request, response) => {
    const body = bodies[request.url];

    response.writeHead(body ? 200 : 404).end(body ?? "Not Found");
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

  after(() => server.close());

  return `http://127.0.0.1:${server.address().port}`;
}

const upgradeGuide = (version, from) =>
  `# Upgrade guide ${version}\nfrom: ${from}\n## Moves\n- None\n## Migrations\n- None\n## Retired\n- None\n## Notes for the merge\n- None\n`;
const AT_V120 = "/zacbraddy/ang/v1.2.0/releases/upgrades";

test("upgrade --help lists upgrade guides", () => {
  const { status, out } = cliProject().run("upgrade", "--help");

  assert.equal(status, 0, out);
  assert.match(out, /upgrade guides --from <tag> --to <tag>/);
});

test("upgrade guides prints the chain oldest first as JSON", async () => {
  const base = await serveBodies({
    [`${AT_V120}/v1.1.0.md`]: upgradeGuide("v1.1.0", "v1.0.0"),
    [`${AT_V120}/v1.2.0.md`]: upgradeGuide("v1.2.0", "v1.1.0"),
  });

  const { status, stdout, stderr } = await runAsync(
    ["upgrade", "guides", "--from", "v1.0.0", "--to", "v1.2.0"],
    { ANG_GITHUB_RAW: base },
  );

  assert.equal(status, 0, stderr);
  assert.deepEqual(
    JSON.parse(stdout).map((guide) => [guide.version, guide.from]),
    [
      ["v1.1.0", "v1.0.0"],
      ["v1.2.0", "v1.1.0"],
    ],
  );
});

test("upgrade guides fails naming a missing guide", async () => {
  const base = await serveBodies({
    [`${AT_V120}/v1.2.0.md`]: upgradeGuide("v1.2.0", "v1.1.0"),
  });

  const { status, stdout, stderr } = await runAsync(
    ["upgrade", "guides", "--from", "v1.0.0", "--to", "v1.2.0"],
    { ANG_GITHUB_RAW: base },
  );

  assert.equal(status, 1);
  assert.equal(stdout, "");
  assert.match(stderr, /^✖ no upgrade guide for v1\.1\.0 at v1\.2\.0/);
});

test("upgrade --help lists upgrade plan and upgrade apply", () => {
  const { status, out } = cliProject().run("upgrade", "--help");

  assert.equal(status, 0, out);
  assert.match(
    out,
    /upgrade plan --base <dir\|none> --target <dir> \[--guides <file>\]/,
  );
  assert.match(out, /upgrade apply --plan <file>/);
});

const SIX_LINES = "one\ntwo\nthree\nfour\nfive\nsix\n";

const folder = (files) => tempFolderWith("ang-tree-", files);

// Every file under dir except .git internals, as relative path → content.
const snapshotTree = (dir) => {
  const fullPath = (entry) => path.join(entry.parentPath, entry.name);
  const isInGitDir = (entry) =>
    path.relative(dir, entry.parentPath).split(path.sep).includes(".git");

  const files = fs
    .readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && !isInGitDir(entry));

  return Object.fromEntries(
    files.map((entry) => [
      path.relative(dir, fullPath(entry)),
      fs.readFileSync(fullPath(entry), "utf8"),
    ]),
  );
};

// One file per category the plan can reach, plus a move of .claude/ang.json the user edited.
function upgradeScenario() {
  const base = folder({
    "unchanged.md": "x",
    "fast.md": "1",
    "fpd.md": "1",
    "keep.md": "1",
    "clean.md": SIX_LINES,
    "conflict.md": SIX_LINES,
    "cdel.md": "1",
    ".claude/ang.json": '{"a":1}',
    ".claude/settings.json": "{}",
  });
  const target = folder({
    "unchanged.md": "x",
    "fast.md": "2",
    "new.md": "n",
    "keep.md": "1",
    "clean.md": SIX_LINES.replace("six", "SIX"),
    "conflict.md": SIX_LINES.replace("one", "uno"),
    "ang.json": '{"a":1}',
    ".claude/settings.json": '{"b":2}',
  });
  const project = cliProject({
    "unchanged.md": "x",
    "fast.md": "1",
    "fpd.md": "1",
    "keep.md": "L",
    "clean.md": SIX_LINES.replace("one", "ONE"),
    "conflict.md": SIX_LINES.replace("one", "ONE"),
    "cdel.md": "L",
    ".claude/ang.json": '{"a":1,"streams":true}',
    ".claude/settings.json": '{"mine":true}',
    "mine.md": "m",
  });
  const git = (...args) =>
    execFileSync("git", ["-C", project.dir, ...args], { encoding: "utf8" });

  git("init", "-q");
  git("add", ".");
  git("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-qm", "init");

  const guides = folder({
    "guides.json": JSON.stringify([
      {
        version: "v1.1.0",
        from: "v1.0.0",
        moves: [{ from: ".claude/ang.json", to: "ang.json", note: "" }],
        migrations: [],
        retired: [],
        notes: [],
      },
    ]),
  });

  const guidesFile = path.join(guides, "guides.json");
  const runPlan = () =>
    project.run(
      "upgrade",
      "plan",
      "--base",
      base,
      "--target",
      target,
      "--guides",
      guidesFile,
    );

  return { base, target, project, git, runPlan };
}

test("upgrade plan classifies every file into a temp folder, writing nothing in the project", () => {
  const { project, runPlan } = upgradeScenario();
  const before = snapshotTree(project.dir);

  const { status, out } = runPlan();

  assert.equal(status, 0, out);

  const plan = JSON.parse(out);

  tempDirs.push(plan.tempDir);

  const byPath = Object.fromEntries(
    plan.entries.map((entry) => [entry.path, entry]),
  );
  const mergedText = (filePath) =>
    fs.readFileSync(byPath[filePath].mergedFile, "utf8");

  assert.equal(plan.route.route, "agent-resolved");
  assert.deepEqual(
    plan.entries.map((entry) => [entry.path, entry.category]),
    [
      ["ang.json", "keep-local"],
      ["cdel.md", "conflict-delete"],
      ["clean.md", "clean-merge"],
      ["conflict.md", "conflict"],
      ["fast.md", "fast-path"],
      ["fpd.md", "fast-path-delete"],
      ["keep.md", "keep-local"],
      ["new.md", "upstream-new"],
      ["unchanged.md", "unchanged"],
    ],
  );
  assert.equal(byPath["ang.json"].movedFrom, ".claude/ang.json");

  for (const [filePath, bytes] of [
    ["ang.json", '{"a":1,"streams":true}'],
    ["fast.md", "2"],
    ["new.md", "n"],
    ["clean.md", SIX_LINES.replace("one", "ONE").replace("six", "SIX")],
  ]) {
    assert.ok(byPath[filePath].mergedFile.startsWith(plan.tempDir), filePath);
    assert.equal(mergedText(filePath), bytes, filePath);
  }

  assert.match(mergedText("conflict.md"), /^<{7} local$/m);
  assert.deepEqual(snapshotTree(project.dir), before);
});

test("upgrade apply refuses an unresolved plan, listing every problem and writing nothing", () => {
  const { project, runPlan } = upgradeScenario();
  const plan = JSON.parse(runPlan().out);

  tempDirs.push(plan.tempDir);

  const planFile = path.join(plan.tempDir, "plan.json");

  fs.writeFileSync(planFile, JSON.stringify(plan));

  const before = snapshotTree(project.dir);

  const { status, out } = project.run("upgrade", "apply", "--plan", planFile);

  assert.equal(status, 1, out);
  assert.match(out, /conflict\.md: conflict needs a resolution/);
  assert.match(out, /cdel\.md: conflict-delete needs a resolution/);
  assert.deepEqual(snapshotTree(project.dir), before);
});

test("upgrade apply writes a resolved plan to the working tree, leaving it unstaged", () => {
  const { project, git, runPlan } = upgradeScenario();
  const plan = JSON.parse(runPlan().out);

  tempDirs.push(plan.tempDir);

  for (const entry of plan.entries) {
    if (entry.path === "conflict.md") {
      fs.writeFileSync(entry.mergedFile, SIX_LINES.replace("one", "ONE uno"));
      entry.resolution = "write";
    }

    if (entry.path === "cdel.md") {
      entry.resolution = "keep";
    }
  }

  const planFile = path.join(plan.tempDir, "plan.json");

  fs.writeFileSync(planFile, JSON.stringify(plan));

  const { status, out } = project.run("upgrade", "apply", "--plan", planFile);

  assert.equal(status, 0, out);
  assert.deepEqual(JSON.parse(out), {
    written: ["ang.json", "clean.md", "conflict.md", "fast.md", "new.md"],
    deleted: ["fpd.md"],
    kept: ["cdel.md", "keep.md"],
  });
  assert.deepEqual(snapshotTree(project.dir), {
    "ang.json": '{"a":1,"streams":true}',
    "cdel.md": "L",
    "clean.md": SIX_LINES.replace("one", "ONE").replace("six", "SIX"),
    "conflict.md": SIX_LINES.replace("one", "ONE uno"),
    "fast.md": "2",
    "new.md": "n",
    "keep.md": "L",
    "unchanged.md": "x",
    ".claude/settings.json": '{"mine":true}',
    "mine.md": "m",
  });
  assert.equal(git("diff", "--cached"), "");
});

test("upgrade plan with --base none classifies without a base and routes guided with warning", () => {
  const { target, project } = upgradeScenario();

  const { status, out } = project.run(
    "upgrade",
    "plan",
    "--base",
    "none",
    "--target",
    target,
  );

  assert.equal(status, 0, out);

  const plan = JSON.parse(out);

  tempDirs.push(plan.tempDir);

  const categories = Object.fromEntries(
    plan.entries.map((entry) => [entry.path, entry.category]),
  );

  assert.equal(plan.route.route, "guided-with-warning");
  assert.equal(categories["fast.md"], "conflict-no-base");
  assert.equal(categories["unchanged.md"], "unchanged");
  assert.equal(categories["new.md"], "upstream-new");
});

test("upgrade plan fails naming a missing folder or an unreadable guides file", () => {
  const { base, target, project } = upgradeScenario();
  const missing = path.join(os.tmpdir(), "ang-no-such-folder");
  const argsNamingMissing = [
    ["--base", missing, "--target", target],
    ["--base", base, "--target", missing],
    ["--base", base, "--target", target, "--guides", missing],
  ];

  for (const args of argsNamingMissing) {
    const { status, out } = project.run("upgrade", "plan", ...args);

    assert.equal(status, 1, out);
    assert.match(out, /^✖ .*ang-no-such-folder/m);
  }
});

const SHA = "b".repeat(40);
const RELEASES = "/repos/zacbraddy/ang/releases";
const COMMITS = "/repos/zacbraddy/ang/commits";
const releaseJson = (tag, draft = false) =>
  JSON.stringify({ tag_name: tag, draft });
const recordAt = (ref) => ({
  ".claude/ang/version.json": {
    ref,
    sha: "a".repeat(40),
    installedAt: "2026-11-01T00:00:00.000Z",
  },
});

test("upgrade --help lists upgrade target", () => {
  const { status, out } = cliProject().run("upgrade", "--help");

  assert.equal(status, 0, out);
  assert.match(out, /upgrade target \[--to <tag>\]/);
});

test("upgrade target resolves the latest stable release as an upgrade from the record", async () => {
  const api = await serveBodies({
    [`${RELEASES}/latest`]: releaseJson("v1.1.0"),
    [`${COMMITS}/v1.1.0`]: SHA,
  });

  const { status, stdout, stderr } = await runAsync(
    ["upgrade", "target"],
    { ANG_GITHUB_API: api },
    recordAt("v1.0.0"),
  );

  assert.equal(status, 0, stderr);

  const { status: verdict, from, to } = JSON.parse(stdout);

  assert.equal(verdict, "upgrade");
  assert.equal(from.ref, "v1.0.0");
  assert.deepEqual(to, { ref: "v1.1.0", sha: SHA });
});

test("upgrade target with --to and no record is no-record with a null from", async () => {
  const api = await serveBodies({
    [`${RELEASES}/tags/v1.0.0-rc.2`]: releaseJson("v1.0.0-rc.2"),
    [`${COMMITS}/v1.0.0-rc.2`]: SHA,
  });

  const { status, stdout, stderr } = await runAsync(
    ["upgrade", "target", "--to", "v1.0.0-rc.2"],
    { ANG_GITHUB_API: api },
  );

  assert.equal(status, 0, stderr);
  assert.deepEqual(JSON.parse(stdout), {
    status: "no-record",
    from: null,
    to: { ref: "v1.0.0-rc.2", sha: SHA },
  });
});

test("upgrade target fails saying to name a tag when there is no latest release", async () => {
  const api = await serveBodies({});

  const { status, stdout, stderr } = await runAsync(
    ["upgrade", "target"],
    { ANG_GITHUB_API: api },
    recordAt("v1.0.0-rc.1"),
  );

  assert.equal(status, 1);
  assert.equal(stdout, "");
  assert.match(
    stderr,
    /^✖ GitHub has no latest Ang release[\s\S]*\/upgrade-ang <tag>/,
  );
});

test("upgrade target fails on a draft tag as not a published release", async () => {
  const api = await serveBodies({
    [`${RELEASES}/tags/v2.0.0`]: releaseJson("v2.0.0", true),
    [`${COMMITS}/v2.0.0`]: SHA,
  });

  const { status, stderr } = await runAsync(
    ["upgrade", "target", "--to", "v2.0.0"],
    { ANG_GITHUB_API: api },
    recordAt("v1.0.0"),
  );

  assert.equal(status, 1);
  assert.match(stderr, /^✖ v2\.0\.0 isn't a published Ang release/);
});
