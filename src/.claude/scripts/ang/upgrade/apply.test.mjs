import { after, test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { applyPlan, checkPlan } from "./apply.mjs";

const tempDirs = [];

after(() =>
  tempDirs.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })),
);

function projectWith(files = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ang-apply-"));

  tempDirs.push(dir);

  for (const [name, content] of Object.entries(files)) {
    const file = path.join(dir, name);

    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  }

  return dir;
}

const mergedFilesDir = projectWith();
const writeMergedFile = (name, content) => {
  const file = path.join(mergedFilesDir, name);

  fs.writeFileSync(file, content);

  return file;
};

// Every file under dir except .git internals, as relative path → content.
const readTree = (dir) => {
  const fullPath = (entry) => path.join(entry.parentPath, entry.name);
  const isInGitDir = (entry) =>
    fullPath(entry).includes(`${path.sep}.git${path.sep}`);

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

test("checkPlan reports an unresolved conflict of every kind", () => {
  const entries = ["conflict", "conflict-no-base", "conflict-delete"].map(
    (category) => ({
      path: `${category}.md`,
      category,
      hunks: 1,
      mergedFile: writeMergedFile("ok", "ok"),
    }),
  );

  const problems = checkPlan(entries);

  assert.equal(problems.length, 3);

  for (const entry of entries) {
    const asksForResolution = (problem) =>
      problem.includes(entry.path) && /resolution/.test(problem);

    assert.ok(problems.some(asksForResolution), entry.path);
  }
});

test("checkPlan reports a file to write with a missing mergedFile or leftover conflict markers", () => {
  const entries = [
    { path: "a.md", category: "fast-path", hunks: 0 },
    {
      path: "b.md",
      category: "clean-merge",
      hunks: 0,
      mergedFile: path.join(mergedFilesDir, "nope"),
    },
    {
      path: "c.md",
      category: "conflict",
      hunks: 1,
      resolution: "write",
      mergedFile: writeMergedFile("c", "x\n<<<<<<< local\ny\n"),
    },
    {
      path: "d.md",
      category: "conflict",
      hunks: 1,
      resolution: "write",
      mergedFile: writeMergedFile("d", "x\n>>>>>>> upstream\n"),
    },
    { path: "e.md", category: "conflict", hunks: 1, resolution: "keep" },
  ];

  const problems = checkPlan(entries);

  assert.equal(problems.length, 4, problems.join("\n"));

  for (const reported of ["a.md", "b.md", "c.md", "d.md"]) {
    assert.ok(
      problems.some((line) => line.includes(reported)),
      reported,
    );
  }
});

test("checkPlan reports absolute, escaping and excluded paths", () => {
  const ok = writeMergedFile("ok", "ok");
  const entries = [
    { path: "/etc/passwd", category: "fast-path", hunks: 0, mergedFile: ok },
    { path: "../outside.md", category: "fast-path", hunks: 0, mergedFile: ok },
    {
      path: ".claude/settings.json",
      category: "fast-path",
      hunks: 0,
      mergedFile: ok,
    },
    {
      path: "rules/pilot.local.md",
      category: "fast-path",
      hunks: 0,
      mergedFile: ok,
    },
    {
      path: "new.md",
      category: "keep-local",
      hunks: 0,
      mergedFile: ok,
      movedFrom: "../old.md",
    },
  ];

  const problems = checkPlan(entries);

  assert.equal(problems.length, 5, problems.join("\n"));
});

test("checkPlan passes a fully resolved plan", () => {
  const entries = [
    {
      path: "a.md",
      category: "fast-path",
      hunks: 0,
      mergedFile: writeMergedFile("a", "A"),
    },
    { path: "b.md", category: "conflict", hunks: 1, resolution: "delete" },
    { path: "c.md", category: "keep-local", hunks: 0 },
    {
      path: "d.md",
      category: "upstream-new",
      hunks: 0,
      mergedFile: writeMergedFile(
        "d",
        "A doc quoting a marker:\n<<<<<<< local\n",
      ),
    },
  ];

  assert.deepEqual(checkPlan(entries), []);
});

test("applyPlan writes, deletes and leaves each entry as its category and resolution say", () => {
  const dir = projectWith({
    "fp.md": "old",
    "fpd.md": "gone",
    "cm.md": "mine",
    "cw.md": "conflicted",
    "cd.md": "conflicted",
    "ck.md": "conflicted",
    "un.md": "same",
    "kl.md": "local",
    "lo.md": "only",
  });
  const plan = [
    {
      path: "fp.md",
      category: "fast-path",
      hunks: 0,
      mergedFile: writeMergedFile("fp", "new"),
    },
    { path: "fpd.md", category: "fast-path-delete", hunks: 0 },
    {
      path: "deep/er/un.md",
      category: "upstream-new",
      hunks: 0,
      mergedFile: writeMergedFile("un", "fresh"),
    },
    {
      path: "cm.md",
      category: "clean-merge",
      hunks: 0,
      mergedFile: writeMergedFile("cm", "merged"),
    },
    {
      path: "cw.md",
      category: "conflict",
      hunks: 2,
      resolution: "write",
      mergedFile: writeMergedFile("cw", "resolved"),
    },
    {
      path: "cd.md",
      category: "conflict-delete",
      hunks: 0,
      resolution: "delete",
    },
    {
      path: "ck.md",
      category: "conflict-no-base",
      hunks: 1,
      resolution: "keep",
      mergedFile: writeMergedFile("ck", "ignored"),
    },
    { path: "un.md", category: "unchanged", hunks: 0 },
    { path: "kl.md", category: "keep-local", hunks: 0 },
    { path: "lo.md", category: "local-only", hunks: 0 },
  ];

  const result = applyPlan(plan, dir);

  assert.deepEqual(readTree(dir), {
    "fp.md": "new",
    "deep/er/un.md": "fresh",
    "cm.md": "merged",
    "cw.md": "resolved",
    "ck.md": "conflicted",
    "un.md": "same",
    "kl.md": "local",
    "lo.md": "only",
  });
  assert.deepEqual(result, {
    written: ["fp.md", "deep/er/un.md", "cm.md", "cw.md"],
    deleted: ["fpd.md", "cd.md"],
    kept: ["ck.md", "kl.md", "lo.md"],
  });
});

test("applyPlan deletes the old path of a moved entry it writes", () => {
  const dir = projectWith({ ".claude/ang.json": "edited", "b.md": "shipped" });

  const plan = [
    {
      path: "ang.json",
      category: "keep-local",
      hunks: 0,
      movedFrom: ".claude/ang.json",
      mergedFile: writeMergedFile("move", "edited"),
    },
    {
      path: "c.md",
      category: "fast-path",
      hunks: 0,
      movedFrom: "b.md",
      mergedFile: writeMergedFile("c", "updated"),
    },
  ];

  applyPlan(plan, dir);

  assert.deepEqual(readTree(dir), { "ang.json": "edited", "c.md": "updated" });
});

test("applyPlan moves a moved conflict resolved keep to its new path, local bytes intact", () => {
  const dir = projectWith({ "old/x.md": "mine" });
  const plan = [
    {
      path: "new/x.md",
      category: "conflict",
      hunks: 1,
      resolution: "keep",
      movedFrom: "old/x.md",
      mergedFile: writeMergedFile("kx", "ignored"),
    },
  ];

  const result = applyPlan(plan, dir);

  assert.deepEqual(readTree(dir), { "new/x.md": "mine" });
  assert.deepEqual(result.kept, ["new/x.md"]);
});

test("applyPlan in a git repo leaves the index untouched and the changes unstaged", () => {
  const dir = projectWith({ "a.md": "one", "b.md": "two" });
  const git = (...args) =>
    execFileSync("git", ["-C", dir, ...args], { encoding: "utf8" });

  git("init", "-q");
  git("add", ".");
  git("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-qm", "init");

  const plan = [
    {
      path: "a.md",
      category: "fast-path",
      hunks: 0,
      mergedFile: writeMergedFile("ga", "ONE"),
    },
    { path: "b.md", category: "fast-path-delete", hunks: 0 },
    {
      path: "c.md",
      category: "upstream-new",
      hunks: 0,
      mergedFile: writeMergedFile("gc", "three"),
    },
  ];

  applyPlan(plan, dir);

  const changedFiles = git("status", "--porcelain").trimEnd().split("\n");

  assert.equal(git("diff", "--cached"), "");
  assert.deepEqual(changedFiles.sort(), [" D b.md", " M a.md", "?? c.md"]);
});
